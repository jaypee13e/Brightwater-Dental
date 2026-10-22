const DEV = { name: "Your Name", email: "you@example.com" }; // edit these two lines

document.getElementById("devname").textContent = DEV.name;
document.getElementById("devmail").href =
  "mailto:" +
  DEV.email +
  "?subject=" +
  encodeURIComponent("Clinic website quote");

const SERVICES = [
  { id: "checkup", name: "Check-up and cleaning", mins: 45, price: 90 },
  { id: "kids", name: "Children's check-up", mins: 30, price: 70 },
  { id: "filling", name: "Filling", mins: 60, price: 150 },
  { id: "whitening", name: "Teeth whitening", mins: 60, price: 220 },
  { id: "emergency", name: "Emergency visit", mins: 30, price: 80 },
  { id: "aligners", name: "Aligner consultation", mins: 30, price: 0 },
];

const TIMES = [];
for (let m = 9 * 60; m <= 16 * 60 + 30; m += 30) TIMES.push(m);

const $id = (i) => document.getElementById(i);

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

const money = (n) => (n === 0 ? "Free" : "$" + n);

const state = { service: null, day: null, time: null };

// Helpers
function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = String(mins % 60).padStart(2, "0");
  const suffix = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}:${m} ${suffix}`;
}

function dayKey(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function dayLabel(d, long) {
  return d.toLocaleDateString(undefined, {
    weekday: long ? "long" : "short",
    day: "numeric",
    month: long ? "long" : "short",
  });
}

// Pretend some slots are already taken, the same way every time
function isTaken(d, mins) {
  const seed = dayKey(d)
    .split("")
    .reduce((s, c) => s + c.charCodeAt(0), 0);
  return (seed + mins / 30) % 4 === 0;
}

// The next 7 weekdays
const DAYS = [];
for (let k = 1; DAYS.length < 7; k++) {
  const d = new Date();
  d.setDate(d.getDate() + k);
  if (d.getDay() % 6) DAYS.push(d);
}
state.day = DAYS[0];

// Services list on the page
$id("svc").innerHTML = SERVICES.map(
  (s) =>
    `<div class="card"><h3>${s.name}</h3>` +
    `<div class="price">${money(s.price)}</div>` +
    `<p class="note">About ${s.mins} minutes.</p></div>`,
).join("");

// Step 1: choose a service
$id("opts").innerHTML = SERVICES.map(
  (s) =>
    `<label class="opt"><input type="radio" name="svc" value="${s.id}" />` +
    `<span>${s.name}<small>About ${s.mins} minutes</small></span>` +
    `<b>${money(s.price)}</b></label>`,
).join("");

$id("opts").addEventListener("change", (e) => {
  state.service = SERVICES.find((s) => s.id === e.target.value);
  renderSummary();
});

// Step 2: choose a day and a time
function renderDays() {
  $id("days").innerHTML = DAYS.map(
    (d, i) =>
      `<button type="button" class="chip" data-i="${i}" ` +
      `aria-pressed="${d === state.day}">${dayLabel(d, false)}</button>`,
  ).join("");
}

function renderSlots() {
  $id("slots").innerHTML = TIMES.map((m) => {
    const taken = isTaken(state.day, m);
    const picked = state.time === m;
    return (
      `<button type="button" class="chip" data-m="${m}" ` +
      `aria-pressed="${picked}"${taken ? " disabled" : ""}>${fmtTime(m)}</button>`
    );
  }).join("");
}

$id("days").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-i]");
  if (!btn) return;
  state.day = DAYS[Number(btn.dataset.i)];
  state.time = null;
  renderDays();
  renderSlots();
  renderSummary();
});

$id("slots").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-m]");
  if (!btn || btn.disabled) return;
  state.time = Number(btn.dataset.m);
  renderSlots();
  renderSummary();
});

// Summary panel
function renderSummary() {
  const rows = [
    ["Service", state.service ? state.service.name : "Not chosen"],
    ["Day", dayLabel(state.day, true)],
    ["Time", state.time !== null ? fmtTime(state.time) : "Not chosen"],
    ["Length", state.service ? `About ${state.service.mins} min` : "-"],
  ];

  $id("rows").innerHTML = rows
    .map((r) => `<div class="row"><span>${r[0]}</span><b>${r[1]}</b></div>`)
    .join("");

  $id("est").textContent = state.service ? money(state.service.price) : "-";
}

// First visit checklist
$id("first").addEventListener("change", (e) => {
  $id("list").hidden = !e.target.checked;
});

// Submit
$id("bf").onsubmit = (e) => {
  e.preventDefault();

  if (!state.service || state.time === null) {
    $id("err").textContent = "Please choose a service and a time first.";
    $id("opts").scrollIntoView();
    return;
  }

  $id("done").innerHTML =
    `<div class="ok" role="status">Thank you, ${esc($id("nm").value)}. ` +
    `Your ${esc(state.service.name.toLowerCase())} is booked for ` +
    `${dayLabel(state.day, true)} at ${fmtTime(state.time)}. ` +
    `We’ll send a confirmation to ${esc($id("em").value)}. ` +
    `(Demo: no message was sent.)</div>`;

  $id("book").hidden = true;
  $id("done").scrollIntoView();
};

$id("bf").addEventListener("input", () => {
  $id("err").textContent = "";
});

renderDays();
renderSlots();
renderSummary();