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
} from "./core";
import type { Unit, Round, Profile } from "./core";

const app = document.getElementById("app")!;

const UNITS: Unit[] = ["ft", "yd", "mi", "in", "m", "cm", "km"];
const ROUND_COUNT = 20;

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

type Mode = "translate" | "play-name" | "play-round" | "play-summary";

interface AppState {
  mode: Mode;
  profile: Profile | null;
  session: Round[];
  roundIndex: number;
}

const state: AppState = { mode: "translate", profile: null, session: [], roundIndex: 0 };

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
    </nav>
  `;
}

function render() {
  app.innerHTML = `
    <h1>NGenWay Measure</h1>
    ${renderNav()}
    <div id="screen"></div>
  `;

  document.querySelectorAll<HTMLButtonElement>(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      // Always land on the name screen when switching to Play — mid-session state
      // (an in-progress round of 20) isn't worth resuming across a mode switch,
      // and the name screen also doubles as "see stats / switch player."
      state.mode = tab.dataset.mode === "translate" ? "translate" : "play-name";
      render();
    });
  });

  const screen = document.getElementById("screen")!;
  if (state.mode === "translate") renderTranslate(screen);
  else if (state.mode === "play-name") renderPlayName(screen);
  else if (state.mode === "play-round") renderPlayRound(screen);
  else if (state.mode === "play-summary") renderPlaySummary(screen);
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

    resultEl.innerHTML = `
      <p class="result-heading">
        ${value} ${unit}
        <span class="metric">(≈ ${other.value.toFixed(1)} ${other.unit})</span>
      </p>
      <ul class="comparisons">
        ${result.comparisons.map((c) => `<li>${formatComparison(c)}</li>`).join("")}
      </ul>
      <a class="share-link" href="${shareUrl}">${shareUrl}</a>
    `;

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

  screen.innerHTML = `
    <p class="round-progress">Round ${state.roundIndex + 1} of ${state.session.length} — ${profile.name}</p>
    <p class="result-heading round-heading">${round.value} ${round.unit}</p>
    <p class="tagline">Which comparison helps you picture this best?</p>
    <div class="round-options">
      ${round.options
        .map(
          (opt, i) => `<button type="button" class="option-btn" data-index="${i}">${formatComparison(opt)}</button>`
        )
        .join("")}
    </div>
  `;

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
    <p class="tagline">Nice work, ${profile.name} — ${profile.roundsPlayed} rounds played total.</p>
    <p class="result-heading round-heading">What you gravitate toward</p>
    <ul class="breakdown">
      ${breakdown
        .map(
          (b) => `
        <li>
          <div class="breakdown-label">${CATEGORY_LABEL[b.category] ?? b.category}</div>
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
  `;

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

render();
