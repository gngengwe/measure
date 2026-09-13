import { translate, counterpart, formatComparison } from "./core";
import type { Unit } from "./core";

const app = document.getElementById("app")!;

const UNITS: Unit[] = ["ft", "yd", "mi", "in", "m", "cm", "km"];

const QUICK_PICKS: Array<{ value: number; unit: Unit; label: string }> = [
  { value: 10, unit: "ft", label: "10 ft" },
  { value: 20, unit: "ft", label: "20 ft" },
  { value: 50, unit: "ft", label: "50 ft" },
  { value: 100, unit: "ft", label: "100 ft" },
  { value: 100, unit: "yd", label: "100 yd" },
  { value: 500, unit: "ft", label: "500 ft" },
  { value: 1, unit: "mi", label: "1 mi" },
];

function readFromUrl(): { value: number; unit: Unit } | null {
  const params = new URLSearchParams(window.location.search);
  const d = params.get("d");
  const u = params.get("u") as Unit | null;
  if (!d || !u || !UNITS.includes(u)) return null;
  const value = Number(d);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { value, unit: u };
}

function render(initial: { value: number; unit: Unit } | null) {
  app.innerHTML = `
    <h1>NGenWay Measure</h1>
    <p class="tagline">What distance are you trying to understand?</p>
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
    const result = translate(value, unit);
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

render(readFromUrl());
