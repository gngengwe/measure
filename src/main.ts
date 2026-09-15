import {
  translate,
  counterpart,
  formatComparison,
  buildSession,
  loadProfile,
  recordRound,
  preferenceWeights,
  categoryBreakdown,
  listProfileNames,
  allConversions,
  formatConversionValue,
  buildLearnSession,
  recordLearnRound,
  learnAccuracy,
} from "./core";
import type { Unit, Round, Profile, LearnRound } from "./core";

const app = document.getElementById("app")!;

const UNITS: Unit[] = ["ft", "yd", "mi", "in", "m", "cm", "km"];
const ROUND_COUNT = 10;
const LEARN_ROUND_COUNT = 10;

const QUICK_PICKS: Array<{ value: number; unit: Unit; label: string }> = [
  { value: 10, unit: "ft", label: "10 ft" },
  { value: 20, unit: "ft", label: "20 ft" },
  { value: 50, unit: "ft", label: "50 ft" },
  { value: 100, unit: "ft", label: "100 ft" },
  { value: 100, unit: "yd", label: "100 yd" },
  { value: 500, unit: "ft", label: "500 ft" },
  { value: 1, unit: "mi", label: "1 mi" },
];

const CATEGORY_LABEL: Record<string, string> = {
  standardized: "standardized objects (courts, containers, doors...)",
  vehicle: "vehicles",
  embodied: "your own body (height, steps, reach...)",
  everyday: "everyday objects (paper, phone, bed...)",
  landmark: "landmarks (city blocks)",
};

// Generated artwork lives in /public/images (see IMAGE_PROMPTS.md).
// Keep emoji fallbacks available if an image fails to load.
const CATEGORY_EMOJI: Record<string, string> = {
  standardized: "📐",
  vehicle: "🚗",
  embodied: "🧍",
  everyday: "📦",
  landmark: "🏙️",
};

function categoryIcon(category: string): string {
  const emoji = CATEGORY_EMOJI[category] ?? "📏";
  return `<span class="cat-icon"><img class="cat-icon-img" src="/images/icon-${category}.png" alt="" /><span class="cat-icon-emoji" hidden>${emoji}</span></span>`;
}

/** Call after any innerHTML write that included categoryIcon() output. */
function wireIconFallbacks(root: HTMLElement) {
  root.querySelectorAll<HTMLImageElement>(".cat-icon-img").forEach((img) => {
    img.addEventListener("error", () => {
      img.hidden = true;
      const emoji = img.nextElementSibling as HTMLElement | null;
      if (emoji) emoji.hidden = false;
    });
  });
}

function launchConfetti(container: HTMLElement) {
  const colors = ["#1f6f54", "#4cc9a0", "#f4b942", "#e0663e", "#6b6b66"];
  const burst = document.createElement("div");
  burst.className = "confetti-burst";
  for (let i = 0; i < 28; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--x", `${Math.random() * 100}%`);
    piece.style.setProperty("--delay", `${Math.random() * 0.3}s`);
    piece.style.setProperty("--duration", `${1.2 + Math.random() * 0.8}s`);
    piece.style.setProperty("--rotate", `${Math.random() * 360}deg`);
    piece.style.background = colors[i % colors.length];
    burst.appendChild(piece);
  }
  container.appendChild(burst);
  setTimeout(() => burst.remove(), 2200);
}

type Mode =
  | "translate"
  | "play-name"
  | "play-round"
  | "play-summary"
  | "learn-name"
  | "learn-round"
  | "learn-summary";

interface AppState {
  mode: Mode;
  profile: Profile | null;
  session: Round[];
  roundIndex: number;
  learnSession: LearnRound[];
  learnRoundIndex: number;
  learnCorrectCount: number;
}

const state: AppState = {
  mode: "translate",
  profile: null,
  session: [],
  roundIndex: 0,
  learnSession: [],
  learnRoundIndex: 0,
  learnCorrectCount: 0,
};

function readFromUrl(): { value: number; unit: Unit } | null {
  const params = new URLSearchParams(window.location.search);
  const d = params.get("d");
  const u = params.get("u") as Unit | null;
  if (!d || !u || !UNITS.includes(u)) return null;
  const value = Number(d);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { value, unit: u };
}

function renderNav(): string {
  return `
    <nav class="mode-nav">
      <button type="button" class="mode-tab ${state.mode === "translate" ? "active" : ""}" data-mode="translate">Translate</button>
      <button type="button" class="mode-tab ${state.mode.startsWith("play") ? "active" : ""}" data-mode="play">Play</button>
      <button type="button" class="mode-tab ${state.mode.startsWith("learn") ? "active" : ""}" data-mode="learn">Learn</button>
    </nav>
  `;
}

function render() {
  app.innerHTML = `
    <div class="header-row">
      <img class="mascot mascot-header" src="/images/mascot.png" alt="" onerror="this.remove()" />
      <h1>NGenWay Measure</h1>
    </div>
    ${renderNav()}
    <div id="screen"></div>
  `;

  document.querySelectorAll<HTMLButtonElement>(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      // Always land on the name screen when switching to Play/Learn — mid-session
      // state (an in-progress round) isn't worth resuming across a mode switch, and
      // the name screen also doubles as "see stats / switch player."
      const target = tab.dataset.mode;
      state.mode = target === "translate" ? "translate" : target === "play" ? "play-name" : "learn-name";
      render();
    });
  });

  const screen = document.getElementById("screen")!;
  if (state.mode === "translate") renderTranslate(screen);
  else if (state.mode === "play-name") renderPlayName(screen);
  else if (state.mode === "play-round") renderPlayRound(screen);
  else if (state.mode === "play-summary") renderPlaySummary(screen);
  else if (state.mode === "learn-name") renderLearnName(screen);
  else if (state.mode === "learn-round") renderLearnRound(screen);
  else if (state.mode === "learn-summary") renderLearnSummary(screen);
}

// ---------- Translate screen ----------

function renderTranslate(screen: HTMLElement, initial = readFromUrl()) {
  const weights = state.profile ? preferenceWeights(state.profile) : undefined;
  const isPersonalized = weights && Object.keys(weights).length > 0;

  screen.innerHTML = `
    <p class="tagline">What distance are you trying to understand?</p>
    ${isPersonalized ? `<p class="personalized-note">Personalized for ${state.profile!.name}</p>` : ""}
    <div class="input-row">
      <input type="number" id="value" min="0" step="any" placeholder="100"
        value="${initial ? initial.value : ""}" />
      <select id="unit">
        ${UNITS.map((u) => `<option value="${u}" ${(initial?.unit ?? "ft") === u ? "selected" : ""}>${u}</option>`).join("")}
      </select>
    </div>
    <div class="chips">
      ${QUICK_PICKS.map((p) => `<button type="button" class="chip" data-value="${p.value}" data-unit="${p.unit}">${p.label}</button>`).join("")}
    </div>
    <div id="result"></div>
  `;

  const valueInput = document.getElementById("value") as HTMLInputElement;
  const unitSelect = document.getElementById("unit") as HTMLSelectElement;
  const resultEl = document.getElementById("result")!;
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>(".chip"));

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  // Persists while browsing Translate (chips, typing) so testers who open it once don't
  // have to re-open it for every value — resets on a fresh mode switch/reload.
  let conversionsOpen = false;

  function setActiveChip(value: number, unit: Unit) {
    for (const chip of chips) {
      const isMatch = Number(chip.dataset.value) === value && chip.dataset.unit === unit;
      chip.classList.toggle("active", isMatch);
    }
  }

  function showResult(value: number, unit: Unit) {
    const result = translate(value, unit, weights);
    const other = counterpart(value, unit);
    const shareUrl = `${window.location.origin}${window.location.pathname}?d=${value}&u=${unit}`;

    if (result.comparisons.length === 0) {
      resultEl.innerHTML = `<p class="empty-state">No good comparisons for that distance yet — try a value between about 2 inches and 1 mile.</p>`;
      return;
    }

    const conversions = allConversions(value, unit);

    resultEl.innerHTML = `
      <p class="result-heading">
        ${value} ${unit}
        <span class="metric">(≈ ${other.value.toFixed(1)} ${other.unit})</span>
      </p>
      <ul class="comparisons">
        ${result.comparisons.map((c) => `<li>${categoryIcon(c.reference.category)}${formatComparison(c)}</li>`).join("")}
      </ul>
      <button type="button" class="conversions-toggle" aria-expanded="${conversionsOpen}">
        ${conversionsOpen ? "Hide" : "Show"} exact conversions
      </button>
      <ul class="conversions-list" ${conversionsOpen ? "" : "hidden"}>
        ${conversions.map((c) => `<li><span class="conv-unit">${c.unit}</span><span class="conv-value">${formatConversionValue(c.value)}</span></li>`).join("")}
      </ul>
      <a class="share-link" href="${shareUrl}">${shareUrl}</a>
    `;
    wireIconFallbacks(resultEl);

    resultEl.querySelector(".conversions-toggle")!.addEventListener("click", () => {
      conversionsOpen = !conversionsOpen;
      showResult(value, unit);
    });

    const url = new URL(window.location.href);
    url.searchParams.set("d", String(value));
    url.searchParams.set("u", unit);
    window.history.replaceState({}, "", url);
  }

  function tryShowFromInputs() {
    const value = Number(valueInput.value);
    const unit = unitSelect.value as Unit;
    setActiveChip(value, unit);
    if (!valueInput.value || !Number.isFinite(value) || value <= 0) {
      resultEl.innerHTML = "";
      return;
    }
    showResult(value, unit);
  }

  valueInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(tryShowFromInputs, 150);
  });

  unitSelect.addEventListener("change", tryShowFromInputs);

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      const value = Number(chip.dataset.value);
      const unit = chip.dataset.unit as Unit;
      valueInput.value = String(value);
      unitSelect.value = unit;
      setActiveChip(value, unit);
      showResult(value, unit);
    });
  }

  if (initial) {
    showResult(initial.value, initial.unit);
    setActiveChip(initial.value, initial.unit);
  }
}

// ---------- Play: name entry ----------

function renderPlayName(screen: HTMLElement) {
  const existingNames = listProfileNames();

  screen.innerHTML = `
    <p class="tagline">Who's playing? You'll see ${ROUND_COUNT} distances — pick whichever
    comparison makes the most sense to you each time.</p>
    <div class="input-row">
      <input type="text" id="player-name" placeholder="Your name" maxlength="40" />
      <button type="button" id="start-game">Start</button>
    </div>
    ${
      existingNames.length > 0
        ? `<div class="chips">
            ${existingNames.map((n) => `<button type="button" class="chip name-chip" data-name="${n}">${n}</button>`).join("")}
          </div>`
        : ""
    }
  `;

  const nameInput = document.getElementById("player-name") as HTMLInputElement;
  const startBtn = document.getElementById("start-game") as HTMLButtonElement;

  function startWithName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    state.profile = loadProfile(trimmed);
    state.session = buildSession(ROUND_COUNT);
    state.roundIndex = 0;
    state.mode = "play-round";
    render();
  }

  startBtn.addEventListener("click", () => startWithName(nameInput.value));
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startWithName(nameInput.value);
  });
  document.querySelectorAll<HTMLButtonElement>(".name-chip").forEach((chip) => {
    chip.addEventListener("click", () => startWithName(chip.dataset.name!));
  });
}

// ---------- Play: round ----------

function renderPlayRound(screen: HTMLElement) {
  const round = state.session[state.roundIndex];
  const profile = state.profile!;

  const dots = state.session
    .map((_, i) => `<span class="progress-dot ${i < state.roundIndex ? "done" : ""} ${i === state.roundIndex ? "current" : ""}"></span>`)
    .join("");

  screen.innerHTML = `
    <div class="round-card">
      <p class="round-progress">${profile.name}'s turn</p>
      <div class="progress-dots">${dots}</div>
      <p class="result-heading round-heading">${round.value} ${round.unit}</p>
      <p class="tagline">Which comparison helps you picture this best?</p>
      <div class="round-options">
        ${round.options
          .map(
            (opt, i) =>
              `<button type="button" class="option-btn" data-index="${i}">${categoryIcon(opt.reference.category)}${formatComparison(opt)}</button>`
          )
          .join("")}
      </div>
    </div>
  `;
  wireIconFallbacks(screen);

  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".option-btn"));
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (buttons.some((b) => b.disabled)) return; // already answered this round
      buttons.forEach((b) => (b.disabled = true));
      btn.classList.add("picked");

      const pickedIndex = Number(btn.dataset.index);
      const pickedCategory = round.options[pickedIndex].reference.category;
      const shownCategories = round.options.map((o) => o.reference.category);
      state.profile = recordRound(profile, shownCategories, pickedCategory);

      setTimeout(() => {
        state.roundIndex += 1;
        state.mode = state.roundIndex >= state.session.length ? "play-summary" : "play-round";
        render();
      }, 350);
    });
  });
}

// ---------- Play: summary ----------

function renderPlaySummary(screen: HTMLElement) {
  const profile = state.profile!;
  const breakdown = categoryBreakdown(profile);

  screen.innerHTML = `
    <div class="summary-card">
      <img class="mascot mascot-celebrate" src="/images/mascot-celebrate.png" alt="" onerror="this.remove()" />
      <p class="tagline">Nice work, ${profile.name} — ${profile.roundsPlayed} rounds played total.</p>
      <p class="result-heading round-heading">What you gravitate toward</p>
      <ul class="breakdown">
        ${breakdown
          .map(
            (b) => `
          <li>
            <div class="breakdown-label">${categoryIcon(b.category)}${CATEGORY_LABEL[b.category] ?? b.category}</div>
            <div class="breakdown-bar"><div class="breakdown-fill" style="width:${Math.round(b.pickRate * 100)}%"></div></div>
            <div class="breakdown-pct">${Math.round(b.pickRate * 100)}%</div>
          </li>`
          )
          .join("")}
      </ul>
      <div class="summary-actions">
        <button type="button" id="play-more">Play ${ROUND_COUNT} more</button>
        <button type="button" id="done-playing">Done — try the translator</button>
      </div>
    </div>
  `;
  wireIconFallbacks(screen);
  launchConfetti(screen);

  document.getElementById("play-more")!.addEventListener("click", () => {
    state.session = buildSession(ROUND_COUNT);
    state.roundIndex = 0;
    state.mode = "play-round";
    render();
  });

  document.getElementById("done-playing")!.addEventListener("click", () => {
    state.mode = "translate";
    render();
  });
}

// ---------- Learn: name entry ----------

function renderLearnName(screen: HTMLElement) {
  const existingNames = listProfileNames();
  // Show lifetime accuracy for a returning name as soon as they type/pick it, so
  // "am I getting better" is visible before they even start a new session.
  const knownProfiles = Object.fromEntries(existingNames.map((n) => [n, loadProfile(n)]));

  screen.innerHTML = `
    <p class="tagline">Who's learning? You'll see a comparison and guess the real distance —
    ${LEARN_ROUND_COUNT} rounds, multiple choice.</p>
    <div class="input-row">
      <input type="text" id="player-name" placeholder="Your name" maxlength="40" />
      <button type="button" id="start-learn">Start</button>
    </div>
    ${
      existingNames.length > 0
        ? `<div class="chips">
            ${existingNames
              .map((n) => {
                const acc = learnAccuracy(knownProfiles[n]);
                const label = acc === null ? n : `${n} (${Math.round(acc * 100)}%)`;
                return `<button type="button" class="chip name-chip" data-name="${n}">${label}</button>`;
              })
              .join("")}
          </div>`
        : ""
    }
  `;

  const nameInput = document.getElementById("player-name") as HTMLInputElement;
  const startBtn = document.getElementById("start-learn") as HTMLButtonElement;

  function startWithName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    state.profile = loadProfile(trimmed);
    state.learnSession = buildLearnSession(LEARN_ROUND_COUNT);
    state.learnRoundIndex = 0;
    state.learnCorrectCount = 0;
    state.mode = "learn-round";
    render();
  }

  startBtn.addEventListener("click", () => startWithName(nameInput.value));
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startWithName(nameInput.value);
  });
  document.querySelectorAll<HTMLButtonElement>(".name-chip").forEach((chip) => {
    chip.addEventListener("click", () => startWithName(chip.dataset.name!));
  });
}

// ---------- Learn: round ----------

function renderLearnRound(screen: HTMLElement) {
  const round = state.learnSession[state.learnRoundIndex];
  const profile = state.profile!;

  const dots = state.learnSession
    .map(
      (_, i) =>
        `<span class="progress-dot ${i < state.learnRoundIndex ? "done" : ""} ${i === state.learnRoundIndex ? "current" : ""}"></span>`
    )
    .join("");

  screen.innerHTML = `
    <div class="round-card">
      <p class="round-progress">${profile.name}'s turn</p>
      <div class="progress-dots">${dots}</div>
      <p class="result-heading round-heading learn-clue">${round.clue}</p>
      <p class="tagline">About how far is that?</p>
      <div class="round-options learn-options">
        ${round.options.map((ft, i) => `<button type="button" class="option-btn" data-value="${ft}" data-index="${i}">${ft} ft</button>`).join("")}
      </div>
      <p class="learn-feedback" hidden></p>
    </div>
  `;

  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".option-btn"));
  const feedback = screen.querySelector<HTMLElement>(".learn-feedback")!;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (buttons.some((b) => b.disabled)) return; // already answered this round
      buttons.forEach((b) => (b.disabled = true));

      const guessedFt = Number(btn.dataset.value);
      const correct = guessedFt === round.targetFt;

      btn.classList.add(correct ? "correct" : "incorrect");
      if (!correct) {
        const correctBtn = buttons.find((b) => Number(b.dataset.value) === round.targetFt);
        correctBtn?.classList.add("correct");
      }

      feedback.hidden = false;
      feedback.textContent = correct ? "✓ Correct!" : `✗ Not quite — it was ${round.targetFt} ft`;
      feedback.className = `learn-feedback ${correct ? "correct" : "incorrect"}`;

      state.profile = recordLearnRound(profile, correct);
      if (correct) state.learnCorrectCount += 1;

      setTimeout(() => {
        state.learnRoundIndex += 1;
        state.mode = state.learnRoundIndex >= state.learnSession.length ? "learn-summary" : "learn-round";
        render();
      }, 1300);
    });
  });
}

// ---------- Learn: summary ----------

function renderLearnSummary(screen: HTMLElement) {
  const profile = state.profile!;
  const sessionTotal = state.learnSession.length;
  const sessionPct = sessionTotal > 0 ? Math.round((state.learnCorrectCount / sessionTotal) * 100) : 0;
  const lifetime = learnAccuracy(profile);
  const doWell = sessionTotal > 0 && state.learnCorrectCount / sessionTotal >= 0.7;

  screen.innerHTML = `
    <div class="summary-card">
      <img class="mascot mascot-celebrate" src="/images/mascot-celebrate.png" alt="" onerror="this.remove()" />
      <p class="tagline">${profile.name}, you got ${state.learnCorrectCount} of ${sessionTotal} right this round (${sessionPct}%).</p>
      ${
        lifetime !== null
          ? `<p class="result-heading round-heading">Lifetime accuracy: ${Math.round(lifetime * 100)}%</p>
             <p class="tagline">across ${profile.learn.played} rounds played — the goal is to watch this climb.</p>`
          : ""
      }
      <div class="summary-actions">
        <button type="button" id="learn-more">Play ${LEARN_ROUND_COUNT} more</button>
        <button type="button" id="done-learning">Done — try the translator</button>
      </div>
    </div>
  `;
  if (doWell) launchConfetti(screen);

  document.getElementById("learn-more")!.addEventListener("click", () => {
    state.learnSession = buildLearnSession(LEARN_ROUND_COUNT);
    state.learnRoundIndex = 0;
    state.learnCorrectCount = 0;
    state.mode = "learn-round";
    render();
  });

  document.getElementById("done-learning")!.addEventListener("click", () => {
    state.mode = "translate";
    render();
  });
}

render();
