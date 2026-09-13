import { translate, counterpart, formatComparison } from "./core";
import type { Unit } from "./core";

const app = document.getElementById("app")!;

const UNITS: Unit[] = ["ft", "yd", "mi", "in", "m", "cm", "km"];

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
    <form id="measure-form">
      <input type="number" id="value" min="0" step="any" placeholder="100"
        value="${initial ? initial.value : ""}" required />
      <select id="unit">
        ${UNITS.map((u) => `<option value="${u}" ${initial?.unit === u ? "selected" : ""}>${u}</option>`).join("")}
      </select>
      <button type="submit">Go</button>
    </form>
    <div id="result"></div>
  `;

  const form = document.getElementById("measure-form") as HTMLFormElement;
  const resultEl = document.getElementById("result")!;

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
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = Number((document.getElementById("value") as HTMLInputElement).value);
    const unit = (document.getElementById("unit") as HTMLSelectElement).value as Unit;
    if (!Number.isFinite(value) || value <= 0) return;

    const url = new URL(window.location.href);
    url.searchParams.set("d", String(value));
    url.searchParams.set("u", unit);
    window.history.replaceState({}, "", url);

    showResult(value, unit);
  });

  if (initial) {
    showResult(initial.value, initial.unit);
  }
}

render(readFromUrl());
