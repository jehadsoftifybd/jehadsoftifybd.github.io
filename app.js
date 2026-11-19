/* CleanDock website — live mockups, catalog browser and small interactions. */

/* ───────── Links: put your own URLs here ───────── */
const CONFIG = {
  coffee: "https://buymeacoffee.com/jehad.pd",
  // Always the newest build: the release workflow uploads these fixed file names to every release.
  download: "https://github.com/jehadsoftifybd/CleanDock-releases/releases/latest/download/CleanDock-Setup.exe",
  downloadMsi: "https://github.com/jehadsoftifybd/CleanDock-releases/releases/latest/download/CleanDock.msi",
  releasesApi: "https://api.github.com/repos/jehadsoftifybd/CleanDock-releases/releases/latest",
  issues: "",        // where people report bugs (GitHub issues, a form, …)
  ideas: "",         // where people suggest widgets
  email: "",         // e.g. "mailto:hello@example.com"
  version: "0.9.0",
};

document.documentElement.classList.remove("no-js");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ic = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const pad = (n) => String(n).padStart(2, "0");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────── Toast ───────── */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ───────── Links ───────── */
const SOON = { coffee: "The support link is coming soon — thank you!", download: "The download link is coming soon.", downloadMsi: "The .msi link is coming soon.", issues: "Bug reports open soon.", ideas: "Widget suggestions open soon.", email: "Contact details are coming soon." };
$$("[data-link]").forEach((a) => {
  const key = a.dataset.link, url = CONFIG[key];
  if (url) {
    a.href = url;
    if (key.startsWith("download") || url.startsWith("mailto:")) a.removeAttribute("target");
  } else if (a.getAttribute("href") === "#") {
    a.removeAttribute("target");
    a.addEventListener("click", (e) => { e.preventDefault(); toast(SOON[key] || "Coming soon."); });
  } else {
    a.removeAttribute("target");
  }
});
$$("[data-version]").forEach((el) => (el.textContent = CONFIG.version));
// show the newest released version (falls back to CONFIG.version when offline or rate-limited)
fetch(CONFIG.releasesApi, { headers: { Accept: "application/vnd.github+json" } })
  .then((r) => (r.ok ? r.json() : null))
  .then((rel) => {
    const v = rel?.tag_name?.replace(/^v/, "");
    if (v) $$("[data-version]").forEach((el) => (el.textContent = v));
  })
  .catch(() => {});
$("#year").textContent = new Date().getFullYear();

/* ───────── Catalog numbers ───────── */
const CAT = window.CATALOG || [];
const ALL = CAT.flatMap(([cid, cname, rows]) => rows.map(([name, desc, src, status]) => ({ name, desc, src, status, cid, cname })));
const BYNAME = new Map(ALL.map((w) => [w.name, w]));
$$('[data-count="dock"]').forEach((el) => (el.textContent = ALL.length));
const SRC = { local: ["Local", "ok"], web: ["Internet", "info"], key: ["API key", "warn"], signin: ["Sign-in", "vio"] };

/* ───────── App icons for the mock dock ───────── */
const APPS = {
  start: `<span class="app-ic start" title="Start">${ic("start")}</span>`,
  files: `<span class="app-ic run" style="--g:linear-gradient(145deg,#ffd56b,#f59e0b)" title="Files"><svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#fff"/></svg></span>`,
  browser: `<span class="app-ic run" style="--g:linear-gradient(145deg,#60a5fa,#1d4ed8)" title="Browser"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="#fff" stroke-width="2"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" fill="none" stroke="#fff" stroke-width="1.8"/></svg></span>`,
  notes: `<span class="app-ic run" style="--g:linear-gradient(145deg,#4ade80,#16a34a)" title="CleanDock Notes"><svg viewBox="0 0 24 24"><rect x="5" y="3.5" width="14" height="17" rx="3" fill="#fff"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" stroke="#16a34a" stroke-width="1.8" stroke-linecap="round"/></svg></span>`,
  code: `<span class="app-ic" style="--g:linear-gradient(145deg,#334155,#0f172a)" title="Terminal"><svg viewBox="0 0 24 24"><path d="m6 8 4 4-4 4M12 16h6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`,
  music: `<span class="app-ic run" style="--g:linear-gradient(145deg,#f472b6,#be185d)" title="Music"><svg viewBox="0 0 24 24"><path d="M9 17V6l10-2v11" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><circle cx="7" cy="17" r="2.6" fill="#fff"/><circle cx="17" cy="15" r="2.6" fill="#fff"/></svg></span>`,
};

/* ───────── Dock tiles ───────── */
const ringTile = (key, p, color, inner, title, sub) =>
  `<div class="tile"><span class="ring-wrap"><span class="ring" style="--p:${p};--c:${color}" ${key ? `data-ring="${key}"` : ""}></span>${inner}</span><span class="t-x t-stack"><b>${title}</b><small class="mut">${sub}</small></span></div>`;

function yearDots() {
  const now = new Date(), start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor((now - start) / 6048e5);
  return Array.from({ length: 52 }, (_, i) => `<i class="${i < week ? "on" : i === week ? "now" : ""}"></i>`).join("");
}
function contrib() {
  let s = "", seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 90; i++) {
    const r = rnd(), l = i > 80 ? 3 + (r > .5 ? 1 : 0) : r < .25 ? 0 : r < .5 ? 1 : r < .72 ? 2 : r < .9 ? 3 : 4;
    s += `<i class="${l ? "l" + l : ""}"></i>`;
  }
  return s;
}
const sparkSvg = (key, c) => `<svg class="spark t-x" viewBox="0 0 84 30" preserveAspectRatio="none" style="--c:${c}" ${key ? `data-spark="${key}"` : ""}><path class="a"/><path class="l"/></svg>`;

const T = {
  clock: () => `<div class="tile t-clock"><span class="big-num" data-live="hm">10:42</span><span class="t-x t-stack"><small class="mut" data-live="wd">Thursday</small><small data-live="dm">19 Nov</small></span></div>`,
  flip: () => `<div class="tile t-flip" data-flip><span class="flip">1</span><span class="flip">0</span><span class="colon">:</span><span class="flip">4</span><span class="flip">2</span></div>`,
  weather: () => `<div class="tile">${ic("sun", "ic-sun")}<span class="t-x t-stack"><b>24°  Sunny</b><small class="mut">H 28° · L 19°</small></span></div>`,
  cpu: () => ringTile("cpu", 32, "#5fb4ff", `<i data-live="cpu">32</i>`, "CPU", "3.4 GHz"),
  battery: () => ringTile(null, 86, "#34d399", ic("bolt"), "86%", "Charging"),
  net: () => `<div class="tile t-net"><span class="t-stack"><small class="dn" data-live="dn">↓ 24.6</small><small class="up" data-live="up">↑ 3.1</small></span>${sparkSvg("net", "#4cd3f5")}<span class="t-x t-stack"><small class="mut">Mb/s</small></span></div>`,
  music: () => `<div class="tile"><span class="cover"></span><span class="t-x t-stack" style="max-width:120px"><b>Midnight Drive</b><small class="mut">Neon Coast</small></span><span class="t-x t-ctrl">${ic("prev")}<span class="pp">${ic("pause")}</span>${ic("next")}</span></div>`,
  pomodoro: () => ringTile("pomo", 62, "#fb7185", `<i>🍅</i>`, `<span data-live="pomo">18:42</span>`, "Focus · 2 of 4"),
  todos: () => `<div class="tile">${`<span class="ring-wrap"><span class="ring" style="--p:60;--c:#34d399"></span><i>3/5</i></span>`}<span class="t-x t-stack" style="max-width:140px"><b>Write release notes</b><small class="mut">Next task</small></span><button class="t-x chk" data-todo aria-label="Tick off the task">${ic("check")}</button></div>`,
  timeline: () => `<div class="tile"><span class="t-stack"><small class="mut">Today</small><b>6h 12m</b></span><span class="timeline t-x"><i style="width:14%;background:#5fb4ff"></i><i style="width:9%;background:#fb7185"></i><i style="width:18%;background:#a78bfa"></i><i style="width:6%;background:#fbbf24"></i><i style="width:12%;background:#34d399"></i><span class="now" style="left:62%"></span></span></div>`,
  year: () => `<div class="tile"><span class="dots">${yearDots()}</span><span class="t-x t-stack"><b data-live="yp">88%</b><small class="mut">of ${new Date().getFullYear()}</small></span></div>`,
  github: () => `<div class="tile"><span class="contrib">${contrib()}</span><span class="t-x t-stack"><b>23 days</b><small class="mut">Streak</small></span></div>`,
  crypto: () => `<div class="tile"><span class="t-stack"><b>BTC</b><small class="mut" data-live="btc">$97,420</small></span>${sparkSvg("btc", "#34d399")}<span class="t-x t-stack"><small style="color:#34d399;font-weight:700">+2.4%</small></span></div>`,
  revenue: () => `<div class="tile"><span class="t-stack"><small class="mut">Last 30 days</small><b>$12,480</b></span><span class="t-x t-stack" style="width:86px;gap:5px"><span class="bar" style="--c:#34d399"><i style="width:78%"></i></span><small class="mut">78% of goal</small></span></div>`,
  claude: () => `<div class="tile"><span class="tag-prev">Preview</span><span class="t-stack" style="width:108px;gap:4px"><small class="mut">Session · 42%</small><span class="bar" style="--c:#f59e6b"><i style="width:42%"></i></span><small class="mut">Weekly · 68%</small><span class="bar" style="--c:#a78bfa"><i style="width:68%"></i></span></span></div>`,
  toggles: () => `<div class="tile t-tog"><button class="tg" data-tog aria-pressed="true" aria-label="Wi-Fi">${ic("wifi")}<span class="tswitch on"></span></button><button class="tg" data-tog aria-pressed="false" aria-label="Bluetooth">${ic("bt")}<span class="tswitch"></span></button></div>`,
};

/* Featured tiles: [catalog name, tile, wallpaper] */
const WALLS = [
  "linear-gradient(135deg,#1e3a8a,#0ea5e9)", "linear-gradient(135deg,#4c1d95,#db2777)", "linear-gradient(135deg,#064e3b,#0891b2)",
  "linear-gradient(135deg,#7c2d12,#f59e0b)", "linear-gradient(135deg,#312e81,#6366f1)", "linear-gradient(135deg,#831843,#f97316)",
];
const FEATURED = [
  ["Clock", "clock"], ["Flip Clock", "flip"], ["Weather", "weather"], ["CPU", "cpu"],
  ["Network", "net"], ["Battery Ring", "battery"], ["Now Playing", "music"], ["Pomodoro", "pomodoro"],
  ["Todos", "todos"], ["Day Timeline", "timeline"], ["Year Progress", "year"], ["GitHub Activity", "github"],
  ["Crypto", "crypto"], ["Total Revenue", "revenue"], ["Claude Usage", "claude"], ["Quick Toggles", "toggles"],
];
$("#tileGrid").innerHTML = FEATURED.map(([name, t], i) => {
  const w = BYNAME.get(name) || { desc: "", src: "local", cname: "" };
  const [label, cls] = SRC[w.src];
  return `<article class="tcard reveal" style="transition-delay:${(i % 4) * 70}ms">
    <div class="tcard-stage" style="--wall:${WALLS[i % WALLS.length]}"><div class="dock skin-glass">${T[t]()}</div></div>
    <div class="tcard-txt"><div class="tcard-top"><h3>${name}</h3>${w.status === 1 ? `<span class="badge prev">Preview</span>` : `<span class="badge ${cls}">${label}</span>`}</div>
    <span class="cat">${w.cname}</span><p>${w.desc}</p></div></article>`;
}).join("");

/* The two big docks */
function buildDock(el, apps) {
  el.innerHTML = apps.map((a) => APPS[a]).join("") + `<span class="dock-sep"></span>` + ["clock", "weather", "cpu", "music", "battery"].map((t) => T[t]()).join("");
}
buildDock($("#heroDock"), ["start", "files", "browser", "notes", "code", "music"]);
buildDock($("#customDock"), ["start", "files", "browser", "notes"]);

/* ───────── Desktop widgets ───────── */
function analogFace() {
  let ticks = "";
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180, h = i % 5 === 0, r1 = h ? 52 : 55, r2 = 60;
    ticks += `<line class="tk${h ? " h" : ""}" x1="${65 + r1 * Math.sin(a)}" y1="${65 - r1 * Math.cos(a)}" x2="${65 + r2 * Math.sin(a)}" y2="${65 - r2 * Math.cos(a)}"/>`;
  }
  const nums = [[12, 0], [3, 90], [6, 180], [9, 270]].map(([n, d]) => {
    const a = (d * Math.PI) / 180;
    return `<text class="num" x="${65 + 41 * Math.sin(a)}" y="${65 - 41 * Math.cos(a)}">${n}</text>`;
  }).join("");
  return `<div class="ana"><svg viewBox="0 0 130 130">${ticks}${nums}<text class="date" x="65" y="88" data-live="anadate">THU 19</text>
    <line class="hand" data-hand="h" x1="65" y1="65" x2="65" y2="36" stroke="#1c1c1e" stroke-width="5"/>
    <line class="hand" data-hand="m" x1="65" y1="65" x2="65" y2="20" stroke="#1c1c1e" stroke-width="3.5"/>
    <line class="hand" data-hand="s" x1="65" y1="74" x2="65" y2="16" stroke="#ff3b30" stroke-width="1.6"/>
    <circle cx="65" cy="65" r="4" fill="#ff3b30"/><circle cx="65" cy="65" r="1.6" fill="#fff"/></svg></div>`;
}

function monthGrid() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
  const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
  let s = ["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span>${d}</span>`).join("");
  for (let i = 0; i < first; i++) s += `<i class="empty"></i>`;
  for (let d = 1; d <= days; d++) {
    const cls = d === today ? "today" : d < today ? ((d * 7) % 5 < 3 ? "done" : "") : (d * 3) % 7 === 0 ? "due" : "";
    s += `<i class="${cls}">${d}</i>`;
  }
  return s;
}

function ruler() {
  let s = "";
  for (let i = 0; i <= 60; i++) s += i % 5 === 0 ? `<i class="m"><b>${i}</b></i>` : `<i></i>`;
  return s;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DW = {
  analog: () => analogFace(),
  batteryRing: () => `<div class="bring"><span class="ring" style="--p:86"></span><div style="text-align:center"><b>86%</b><small>${ic("bolt")} Charging</small></div></div>`,
  weatherMini: (el) => { el.classList.add("wx-mini"); return `<div class="dw-pad" style="flex-direction:row;gap:12px">
    <div style="display:flex;flex-direction:column"><b style="font-size:14px">Dhaka</b><span class="dw-big" style="font-size:44px;margin-top:auto">31°</span><span style="font-size:12px;font-weight:600;opacity:.9">Sunny · H 33° L 25°</span></div>
    <div class="days" style="flex:1;align-items:flex-end;gap:4px"><span>Fri${ic("sun")}32°</span><span>Sat${ic("pcloud")}30°</span><span>Sun${ic("rain")}27°</span><span>Mon${ic("sun")}31°</span></div></div>`; },
  stickySmall: () => `<div class="dw-pad"><span class="hand">Ship v0.9 ✓<br>Water the plants<br>Call the bank at 5</span></div>`,
  wifi: () => `<div class="dw-pad"><div class="dw-row"><span class="dw-ic blue">${ic("wifi")}</span><span class="dw-round">${ic("chevron")}</span></div>
    <div class="wifi-name dw-row"><span><small class="mut">Wi-Fi</small><b>Home-5G</b></span><button class="dw-sw on" data-sw aria-label="Wi-Fi on or off"></button></div></div>`,
  weatherBoard: () => `<div class="wb"><div class="wb-now"><b style="font-size:16px">Dhaka</b><span class="cond">Sunny</span><span class="dw-big">31°</span><span style="font-weight:600;font-size:13px;opacity:.92">H 33° · L 25° · Feels 35°</span></div>
    <div class="wb-list">${[["Fri", "sun", 26, 33, 10, 85], ["Sat", "pcloud", 25, 31, 6, 70], ["Sun", "rain", 23, 28, 0, 55], ["Mon", "cloud", 24, 30, 4, 66], ["Tue", "sun", 25, 32, 8, 80]]
      .map(([d, i, lo, hi, a, b]) => `<div><span>${d}</span>${ic(i)}<span style="display:grid;grid-template-columns:24px 1fr 24px;gap:6px;align-items:center"><small class="mut">${lo}°</small><span class="wb-range"><i style="left:${a}%;right:${100 - b}%"></i></span><small>${hi}°</small></span></div>`).join("")}</div></div>`,
  world: () => `<div class="dw-pad world"><div class="dw-row"><b class="dw-t">Tokyo</b><small class="mut">+3h</small></div><span class="dw-big" data-live="tokyo">13:42</span><small class="mut" data-live="tokyoday">Today</small></div>`,
  habit: () => `<div class="dw-pad"><div class="dw-row" style="align-items:flex-start"><span><b class="dw-t">Reading</b><br><small class="mut">Daily · 30 min</small></span></div>
    <div class="dw-row" style="margin-top:auto"><span><span class="dw-big">18</span><small class="mut"> min left</small></span><span class="habit-ring"><span class="ring" style="--p:40"></span>${ic("play")}</span></div></div>`,
  charging: () => `<div class="dw-pad"><div class="dw-row"><b class="dw-t">Charging</b><span class="dw-ic green" style="width:28px;height:28px">${ic("bolt")}</span></div><span class="dw-big" style="margin-top:10px">82%</span><div class="chg-bar"><i style="width:82%"></i>${ic("bolt")}</div></div>`,
  flipBig: () => `<div class="fb"><div class="fb-top"><b>Focus mode</b><span data-live="fbdate">Thursday, 19 November</span></div>
    <div class="fb-row"><div class="fb-card" data-fb="h"><span>10</span><small>HOURS</small></div><div class="fb-card" data-fb="m"><span>42</span><small>MINUTES</small></div><div class="fb-card sec" data-fb="s"><span>36</span><small>SEC</small></div></div></div>`,
  timer: () => `<div class="tmr"><div class="tmr-top"><span><small class="mut" style="font-weight:600">Timer · Tea</small><div class="tmr-time">25<span>:</span>00</div></span><span class="tmr-go">${ic("play")}</span></div>
    <div class="ruler"><div class="ruler-in">${ruler()}</div><span class="ruler-ptr"></span></div></div>`,
  sticky: () => `<span class="sn n3"></span><span class="sn n2"></span><div class="sn n1"><span class="sn-tab"></span><span class="hand">Grocery list<br>– Oat milk<br>– Coffee beans ☕<br>– Lemons</span>
    <div class="sn-bar"><i>${ic("prev")}</i><span>1 / 3</span><i>${ic("next")}</i><i>${ic("check")}</i></div></div>`,
  activity: () => { const n = new Date(); return `<div class="act"><div class="act-top"><b class="act-title">Daily<br>Activity</b><span class="act-mon">${MONTHS[n.getMonth()]}<br>${n.getFullYear()}</span></div><div class="act-grid">${monthGrid()}</div></div>`; },
  calcPad: () => `<div class="cp"><div class="cp-disp"><small data-calc="expr">&nbsp;</small><b data-calc="out">1,284.5</b></div><div class="cp-keys">
    ${[["AC", "fn"], ["±", "fn"], ["%", "fn"], ["÷", "op"], ["7"], ["8"], ["9"], ["×", "op"], ["4"], ["5"], ["6"], ["−", "op"], ["1"], ["2"], ["3"], ["=", "eq"], ["0", "z"], ["."], ["+", "op"]]
      .map(([k, c = ""]) => `<button class="${c}" data-key="${k}">${k}</button>`).join("")}</div></div>`,
  music: () => `<div class="mus"><span class="cover"></span><div class="mus-r"><b>Midnight Drive</b><small class="mut">Neon Coast</small><div class="mus-prog"><i data-live="mprog"></i></div>
    <div class="mus-times"><span data-live="mcur">1:24</span><span>3:42</span></div><div class="mus-ctl">${ic("prev")}<span class="pp">${ic("pause")}</span>${ic("next")}</div></div></div>`,
  recorder: () => `<div class="dw-pad"><div class="dw-row"><span><b class="dw-t">Voice</b><br><small class="mut" data-live="rec">00:42</small></span><span class="rec-btn"><i></i></span></div>
    <div class="rec-wave">${Array.from({ length: 12 }, (_, i) => `<i style="animation-delay:${(i * 137) % 900}ms"></i>`).join("")}</div></div>`,
  camera: () => `<div class="dw-pad"><div class="dw-row"><b class="dw-t">Camera</b><span class="mut">${ic("camera", "i")}</span></div><span class="cam-shutter"><i></i></span></div>`,
  run: () => `<div class="dw-pad"><div class="dw-row" style="justify-content:flex-start;gap:10px"><span class="dw-ic green">${ic("run")}</span><span><b class="dw-t">Morning run</b><br><small class="mut">Today · 6:40</small></span></div>
    <div class="run-grid"><span><b>5.2</b><small>km</small></span><span><b>28:14</b><small>time</small></span><span><b>11.1</b><small>km/h</small></span><span><b>342</b><small>kcal</small></span></div></div>`,
};
$$("[data-dw]").forEach((el) => { const f = DW[el.dataset.dw]; if (f) el.innerHTML = f(el); });

/* the full desktop list */
const DESK = [
  ["Wi-Fi", "Network name and an on/off switch.", "light", 0, "wifi"],
  ["Flight", "Arrival time and route.", "dark", 1],
  ["Run", "Distance, time, speed and calories.", "light", 1, "run"],
  ["Habit", "A daily timer: start, pause, minutes left.", "dark", 0, "play"],
  ["Gate", "Boarding gate and departure.", "light", 1],
  ["Voice Recorder", "Records the microphone to Music\\CleanDock Recordings.", "dark", 0, "mic"],
  ["Navigation", "Next turn, ETA and distance left.", "dark", 1, "arrow"],
  ["Battery", "Charge level and time left.", "light", 0, "bolt"],
  ["Now Playing", "What is playing, with controls.", "light", 0, "play"],
  ["Analog Clock", "A classic face with today's date behind.", "light", 0],
  ["Camera", "One click to Windows' Camera.", "light", 0, "camera"],
  ["Daily Activity", "The month, coloured by notes done and due.", "dark", 0, "grid"],
  ["World Clock", "A city's time and its difference from yours.", "light", 0],
  ["Ride", "Car arriving and where to meet.", "light", 1],
  ["Charging", "Charge level on a bar.", "dark", 0, "bolt"],
  ["Scooter", "Last ride: distance, speed, time.", "light", 1],
  ["Weather Board", "Today on a bright block, five days beside it.", "dark", 0, "sun"],
  ["Weather Card", "Sunrise to sunset, rain, humidity, wind and seven days.", "dark", 0, "pcloud"],
  ["Calculator", "A basic calculator: keys or keyboard; click the result to copy it.", "dark", 0],
  ["Sticky Notes", "Coloured notes stacked on a tile: write on the top one, click one behind to bring it forward.", "light", 0],
  ["Pocket Calculator", "Big round keys on a dark tile, a tall orange equals; keyboard too.", "dark", 0],
  ["Timer", "Slide the ruler to the minutes, start; it chimes when time is up.", "dark", 0],
  ["Alarm", "Daily alarms with snooze; skip one time; rings with your reminder sound.", "dark", 0],
  ["Video Recorder", "Records the camera and microphone to Videos\\CleanDock Recordings.", "dark", 0, "camera"],
  ["Battery Ring", "Charge level on a coloured ring, a bolt while charging.", "dark", 0, "bolt"],
  ["Big Flip Clock", "Date, hours, minutes and seconds on flip cards; your own caption.", "dark", 0],
];
$("#deskList").innerHTML = DESK.map(([n, d, st, sample, icon]) =>
  `<div class="dl-item"><span class="dl-ic ${st}">${icon ? ic(icon, "i") : n[0]}</span><div><b>${n}${sample ? ` <span class="badge demo">Demo data</span>` : ""}</b><p>${d}</p></div></div>`).join("");

/* ───────── A tile preview for every catalog widget ───────── */
const sv = (d) => `<svg class="ic-w" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const GL = {
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  kbd: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  desk: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  spk: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  shot: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3"/>',
  watch: '<circle cx="12" cy="13" r="8"/><path d="M12 13V9M10 2h4"/>',
  note: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  img: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
};
const mono = (t, bg, fg = "#fff") => `<span class="mono" style="background:${bg};color:${fg}">${t}</span>`;
const stack = (a, b, c) => `<span class="t-stack">${a ? `<small class="mut">${a}</small>` : ""}<b>${b}</b>${c ? `<small class="mut">${c}</small>` : ""}</span>`;
const stat = (m, a, b, c) => `<div class="tile">${m}${stack(a, b, c)}</div>`;
const icT = (g, a, b, c) => `<div class="tile">${g}${a || b ? stack(a, b, c) : ""}</div>`;
const bars = (m, rows) => `<div class="tile">${m || ""}<span class="t-stack" style="width:112px;gap:3px">${rows.map(([l, p, c]) => `<small class="mut">${l} · ${p}%</small><span class="bar" style="--c:${c}"><i style="width:${p}%"></i></span>`).join("")}</span></div>`;
const prog = (a, b, p, c) => `<div class="tile"><span class="t-stack" style="width:118px;gap:4px"><span style="display:flex;justify-content:space-between"><small class="mut">${a}</small><small><b style="font-size:11px">${b}</b></small></span><span class="bar" style="--c:${c}"><i style="width:${p}%"></i></span></span></div>`;
function sparkD(seed, rise = 1) {
  let s = seed * 997;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const v = Array.from({ length: 14 }, (_, i) => i * rise * .7 + r() * 5);
  const mx = Math.max(...v), mn = Math.min(...v);
  return v.map((y, i) => (i ? "L" : "M") + ((i / 13) * 84).toFixed(1) + " " + (27 - ((y - mn) / (mx - mn || 1)) * 24).toFixed(1)).join(" ");
}
const chart = (m, a, b, trend, c, seed) => {
  const d = sparkD(seed, trend.startsWith("−") ? -1 : 1);
  return `<div class="tile">${m}${stack(a, b)}<svg class="spark" viewBox="0 0 84 30" preserveAspectRatio="none" style="--c:${c};width:58px"><path class="a" d="${d} L84 30 L0 30 Z"/><path class="l" d="${d}"/></svg><small style="color:${trend.startsWith("−") ? "#fb7185" : "#34d399"};font-weight:700">${trend}</small></div>`;
};
const miniFace = (h, m, size = 30) => `<svg viewBox="0 0 30 30" width="${size}" height="${size}" class="mini-face"><circle cx="15" cy="15" r="14" fill="#fff"/><line x1="15" y1="15" x2="${15 + 7 * Math.sin(((h % 12) + m / 60) * Math.PI / 6)}" y2="${15 - 7 * Math.cos(((h % 12) + m / 60) * Math.PI / 6)}" stroke="#111" stroke-width="2.2" stroke-linecap="round"/><line x1="15" y1="15" x2="${15 + 10 * Math.sin(m * Math.PI / 30)}" y2="${15 - 10 * Math.cos(m * Math.PI / 30)}" stroke="#111" stroke-width="1.4" stroke-linecap="round"/><circle cx="15" cy="15" r="1.6" fill="#ff3b30"/></svg>`;

const NOW = new Date();
const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const REV = { "Polar": ["P", "#0062ff", "$4,210", "+12%"], "Stripe": ["S", "#635bff", "$8,940", "+6%"], "Dodo Payments": ["D", "#f59e0b", "$1,320", "+21%"], "Shopify": ["S", "#5e8e3e", "$6,075", "+3%"], "Lemon Squeezy": ["L", "#ffc233", "$2,480", "−4%"], "Paddle": ["P", "#1f3bff", "$3,615", "+9%"], "Gumroad": ["G", "#ff90e8", "$940", "+17%"] };

const PV = {
  // AI
  "AI Limits": () => bars(mono("AI", "#111827"), [["Claude", 42, "#f59e6b"], ["ChatGPT", 71, "#34d399"]]),
  "Claude Usage": () => ringTile(null, 42, "#f59e6b", "<i>42</i>", "Claude", "Resets in 2h 14m"),
  "Claude Plan Usage": () => bars(mono("C", "#d97757"), [["Session", 42, "#f59e6b"], ["Weekly", 68, "#a78bfa"]]),
  "ChatGPT Usage": () => bars(mono("G", "#10a37f"), [["5-hour", 71, "#34d399"], ["Weekly", 38, "#5fb4ff"]]),
  "Gemini Usage": () => bars(mono("G", "linear-gradient(135deg,#4285f4,#9b72cb)"), [["Pro", 24, "#5fb4ff"], ["Flash", 58, "#4cd3f5"]]),
  "Grok Usage": () => ringTile(null, 63, "#e5e7eb", "<i>63</i>", "SuperGrok", "63% of credit used"),
  "DeepSeek Balance": () => stat(mono("D", "#4d6bfe"), "DeepSeek", "$18.40", "$15 paid + $3.40 granted"),
  "GLM Usage": () => bars(mono("Z", "#2d2d8f"), [["5-hour", 35, "#a78bfa"], ["Weekly", 52, "#5fb4ff"]]),
  "OpenCode Usage": () => stat(mono("OC", "#111827"), "This session", "1.2M tokens", "from local history"),
  "OpenCode Plan Usage": () => bars(mono("OC", "#111827"), [["Session", 30, "#4cd3f5"], ["Week", 64, "#a78bfa"]]),
  "Cursor Usage": () => stat(mono("Cu", "#0f0f0f"), "Cursor", "$12.80", "4.1M tokens"),
  // Productivity
  "Day Timeline": () => T.timeline(),
  "Screen Time": () => `<div class="tile"><span class="hbars">${[20, 35, 60, 80, 45, 90, 70, 30].map((h) => `<i style="height:${h}%"></i>`).join("")}</span>${stack("Screen time", "6h 12m", "Code · 2h 40m")}</div>`,
  "Pomodoro": () => T.pomodoro(),
  "Timer": () => ringTile(null, 100, "#fbbf24", sv(GL.watch).replace("ic-w", "ic-s"), "05:00", "Timer · click to start"),
  "Stopwatch": () => icT(sv(GL.watch), "Stopwatch", `<span class="tnum">00:12.48</span>`),
  "Todos": () => T.todos(),
  "Notes": () => stat(`<span class="mono" style="background:#16a34a">${sv(GL.note)}</span>`, "Notes", "12 open", "3 due today"),
  "Notes Board": () => `<div class="tile"><span class="nb"><i style="--c:#94a3b8">4<small>To do</small></i><i style="--c:#5fb4ff">2<small>Doing</small></i><i style="--c:#34d399">7<small>Done</small></i></span></div>`,
  "Due Today": () => `<div class="tile"><span class="chk"></span>${stack("Due 5:00 PM", "Send the invoice", "Reminder on")}</div>`,
  "Quick Note": () => icT(sv(GL.pen), "", `<span class="mut" style="font-weight:500">Jot something down…</span>`),
  "Calculator": () => `<div class="tile">${mono("=", "#ff9f0a", "#1c1c1e")}${stack("12 × 107.04", "1,284.5")}</div>`,
  "Calendar": () => `<div class="tile"><span class="daypage"><em>${MON3[NOW.getMonth()].toUpperCase()}</em><b>${NOW.getDate()}</b></span>${stack("in 25 min · 3:00 PM", "Design review")}</div>`,
  "WhatsApp": () => stat(mono("W", "#25d366"), "WhatsApp", "3 unread chats"),
  "Currency": () => stat(mono("$", "#0ea5e9"), "1 USD", "৳ 121.40", "BDT · live rate"),
  // Finance
  "Total Revenue": () => T.revenue(),
  // System
  "Top CPU": () => `<div class="tile"><span class="toplist">${[["Chrome", 12], ["Code", 8], ["Teams", 4]].map(([n, v]) => `<span><small>${n}</small><span class="bar" style="--c:#5fb4ff"><i style="width:${v * 6}%"></i></span><small class="tnum">${v}%</small></span>`).join("")}</span></div>`,
  "Top RAM": () => `<div class="tile"><span class="toplist">${[["Chrome", "2.1 GB", 70], ["Code", "1.4 GB", 48], ["Teams", "0.9 GB", 30]].map(([n, v, p]) => `<span><small>${n}</small><span class="bar" style="--c:#a78bfa"><i style="width:${p}%"></i></span><small class="tnum">${v}</small></span>`).join("")}</span></div>`,
  "Tray": () => `<div class="tile t-tray">${ic("wifi")}${sv(GL.spk)}${ic("bt")}<span class="mono sm" style="background:#5865f2">D</span><span class="mono sm" style="background:#0ea5e9">O</span><span class="mono sm" style="background:#ef4444">A</span></div>`,
  "Language": () => `<div class="tile">${sv(GL.kbd)}${stack("Keyboard", "ENG", "US · click to switch")}</div>`,
  "Temperature": () => ringTile(null, 58, "#fb923c", "<i>58°</i>", "CPU 32%", "Memory 61%"),
  "CPU": () => T.cpu(),
  "RAM": () => ringTile(null, 61, "#a78bfa", "<i>61</i>", "RAM", "9.8 of 16 GB"),
  "Network": () => T.net(),
  "Battery": () => `<div class="tile"><span class="batt"><i style="width:86%"></i></span>${stack("", "86%", "Charging · 40 min")}</div>`,
  "Battery Ring": () => T.battery(),
  "Battery Core": () => `<div class="tile"><span class="cells">${Array.from({ length: 12 }, (_, i) => `<i class="${i < 10 ? "on" : ""}"></i>`).join("")}</span><b>86%</b></div>`,
  "Battery Dots": () => `<div class="tile"><span class="dotm">${Array.from({ length: 30 }, (_, i) => `<i class="${i % 10 < 9 - (i > 19 ? 1 : 0) ? "on" : ""}"></i>`).join("")}</span><b class="tnum">86</b></div>`,
  "Battery Gauge": () => `<div class="tile"><svg width="60" height="34" viewBox="0 0 60 34"><path d="M6 30a24 24 0 0 1 48 0" fill="none" stroke="currentColor" stroke-opacity=".2" stroke-width="5" stroke-linecap="round"/><path d="M6 30a24 24 0 0 1 44-13" fill="none" stroke="#34d399" stroke-width="5" stroke-linecap="round"/><line x1="30" y1="30" x2="46" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><text x="2" y="33" font-size="7" fill="currentColor" opacity=".6">E</text><text x="54" y="33" font-size="7" fill="currentColor" opacity=".6">F</text></svg>${stack("Battery", "86%")}</div>`,
  "Battery Bar": () => `<div class="tile"><span class="t-stack" style="width:120px;gap:4px"><span style="display:flex;justify-content:space-between"><b style="font-size:12px">86%</b><small class="mut">3h 10m left</small></span><span class="bar glow" style="--c:#34d399;height:8px"><i style="width:86%"></i></span></span><span class="tswitch"></span></div>`,
  "Quick Toggles": () => T.toggles(),
  "Wi-Fi & Bluetooth": () => `<div class="tile"><span class="pillbtn on">${ic("wifi")}Wi-Fi</span><span class="pillbtn">${ic("bt")}Bluetooth</span></div>`,
  "Brightness": () => `<div class="tile">${ic("sun", "ic-sun sm")}<span class="slider"><i style="width:70%"></i><b style="left:70%"></b></span></div>`,
  "Theme Toggle": () => `<div class="tile">${ic("sun", "ic-sun sm")}<span class="tswitch on"></span>${sv(GL.moon)}</div>`,
  "Do Not Disturb": () => `<div class="tile">${sv(GL.moon)}${stack("", "Do not disturb", "Banners off")}<span class="tswitch on"></span></div>`,
  "Notifications": () => `<div class="tile"><span class="ring-wrap">${sv(GL.bell)}<span class="dotbadge">3</span></span></div>`,
  "Show Desktop": () => icT(sv(GL.desk)),
  "Keyboard": () => icT(sv(GL.kbd)),
  "Month Progress": () => prog(MONTHS[NOW.getMonth()], Math.round((NOW.getDate() / new Date(NOW.getFullYear(), NOW.getMonth() + 1, 0).getDate()) * 100) + "%", Math.round((NOW.getDate() / new Date(NOW.getFullYear(), NOW.getMonth() + 1, 0).getDate()) * 100), "#a78bfa"),
  "Day Progress": () => { const p = Math.round(((NOW.getHours() * 60 + NOW.getMinutes()) / 1440) * 100); return prog("Today", p + "%", p, "#fbbf24"); },
  "Year Progress": () => T.year(),
  // Media
  "Now Playing": () => T.music(),
  "Audio Output": () => `<div class="tile">${sv(GL.spk)}<span class="t-stack" style="width:110px;gap:4px"><small class="mut">Headphones</small><span class="slider"><i style="width:64%"></i><b style="left:64%"></b></span></span></div>`,
  "Microphone": () => `<div class="tile">${ic("mic", "ic-w")}<span class="tswitch on"></span>${sv(GL.spk)}<span class="tswitch"></span></div>`,
  "Now Playing (compact)": () => `<div class="tile"><span class="cover"></span>${stack("", "Midnight Drive", "Neon Coast")}<span class="t-ctrl"><span class="pp">${ic("pause")}</span></span></div>`,
  "Now Playing Mini": () => `<div class="tile"><span class="ring-wrap"><span class="ring" style="--p:38;--c:#f472b6"></span>${ic("pause")}</span></div>`,
  "Now Playing Bar": () => `<div class="tile"><span class="t-stack" style="width:126px;gap:4px"><b style="font-size:12px">Midnight Drive</b><span class="bar" style="--c:#f472b6"><i style="width:38%"></i></span></span><span class="t-ctrl">${ic("next")}</span></div>`,
  // Analytics
  "Search Console": () => chart(mono("G", "#4285f4"), "Clicks · 28 days", "1,284", "+8%", "#5fb4ff", 3),
  "DataFast Chart": () => chart(mono("DF", "#f97316"), "Visitors · 14 days", "3,920", "+11%", "#fb923c", 5),
  "Plausible": () => stat(mono("P", "#5850ec"), "Visitors this week", "2,410", "+14% vs last week"),
  "Dub": () => stat(mono("D", "#111827"), "Link clicks this week", "812", "+5%"),
  // Developer
  "Resend": () => stat(mono("R", "#000"), "Emails this week", "1,240 sent", "99.2% delivered"),
  "Linear": () => stat(mono("L", "#5e6ad2"), "Assigned to you", "7 issues", "2 in progress"),
  "Supabase": () => stat(mono("S", "#3ecf8e", "#0b2a1c"), "API requests", "48.2K", "● Healthy"),
  // Online
  "Wallpaper Gallery": () => `<div class="tile"><span class="wps"><i style="background:linear-gradient(135deg,#f97316,#db2777)"></i><i style="background:linear-gradient(135deg,#0ea5e9,#6366f1)"></i><i style="background:linear-gradient(135deg,#22c55e,#0e7490)"></i></span>${stack("", "Wallpapers", "Click to set")}</div>`,
  "Gmail": () => stat(mono("M", "#ea4335"), "Inbox", "12 unread"),
  "GitHub Activity": () => T.github(),
  "GitHub": () => stat(mono("GH", "#24292f"), "GitHub", "5 notifications"),
  "GitHub Overview": () => `<div class="tile">${mono("GH", "#24292f")}<span class="ghs"><span><b>5</b><small class="mut">Inbox</small></span><span><b>3</b><small class="mut">PRs</small></span><span><b>1.2K</b><small class="mut">Stars</small></span></span></div>`,
  "LeetCode Stats": () => ringTile(null, 41, "#ffa116", "<i>412</i>", "412 solved", "18-day streak"),
  // Social
  "X Profile": () => stat(mono("X", "#000"), "Followers", "12.4K", "+86 this week"),
  "TikTok": () => stat(mono("T", "#111", "#25f4ee"), "Followers", "8,920", "+120 this week"),
  "YouTube": () => stat(mono("▶", "#ff0000"), "Subscribers", "3,210", "+42 this week"),
  "Instagram": () => stat(mono("IG", "linear-gradient(45deg,#f58529,#dd2a7b,#8134af)"), "Followers", "5,610", "+31 this week"),
  // Apps & Files
  "Apps": () => `<div class="tile t-apps">${APPS.start}${APPS.files}${APPS.browser}${APPS.music}</div>`,
  "Recently Opened": () => `<div class="tile"><span class="recent"><i>${sv(GL.file)}</i><i style="color:#5fb4ff">${sv(GL.img)}</i><i style="color:#34d399">${sv(GL.note)}</i></span>${stack("Last opened", "report.docx", "2 min ago")}</div>`,
  "Recycle Bin": () => icT(sv(GL.trash), "Recycle Bin", "1.2 GB", "48 items"),
  "Search": () => `<div class="tile"><span class="searchpill">${sv(GL.search)}Search the web or a path</span></div>`,
  "Commands": () => `<div class="tile"><span class="searchpill mono-font"><b style="color:#34d399">›</b> notes new</span></div>`,
  "Storage": () => prog("C: · 182 GB free", "64%", 64, "#5fb4ff"),
  "Screenshot Capture": () => icT(sv(GL.shot), "Screenshot", "Area · Window · Screen"),
  // Weather
  "Weather": () => T.weather(),
  "Weather Details": () => `<div class="tile"><span class="wdet"><span>${sv(GL.wind)}<b>12</b><small class="mut">km/h</small></span><span>${sv(GL.drop)}<b>20%</b><small class="mut">rain</small></span><span>${ic("sun", "ic-sun sm")}<b>19–28°</b></span></span></div>`,
  "Today & Forecast": () => `<div class="tile">${ic("sun", "ic-sun")}<b>24°</b><span class="fc">${[["Fri", "pcloud", 26], ["Sat", "rain", 22], ["Sun", "sun", 27]].map(([d, i, t]) => `<span><small class="mut">${d}</small>${ic(i)}<small>${t}°</small></span>`).join("")}</span></div>`,
  "Weather Status": () => `<div class="tile">${ic("pcloud", "ic-w")}${stack("Dhaka", "Partly cloudy", "Feels like 27°")}</div>`,
  "Hourly": () => `<div class="tile"><span class="fc hr">${[["Now", "sun", 24], ["11", "sun", 25], ["12", "pcloud", 26], ["13", "pcloud", 27], ["14", "rain", 25], ["15", "cloud", 24]].map(([d, i, t]) => `<span><small class="mut">${d}</small>${ic(i)}<small>${t}°</small></span>`).join("")}</span></div>`,
  "Sunrise & Sunset": () => `<div class="tile"><svg width="64" height="34" viewBox="0 0 64 34"><path d="M4 30a28 26 0 0 1 56 0" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.6" stroke-dasharray="3 3"/><line x1="0" y1="30" x2="64" y2="30" stroke="currentColor" stroke-opacity=".35"/><circle cx="40" cy="7" r="5" fill="#fbbf24"/></svg>${stack("Sunrise 06:12", "Sunset 17:18", "")}</div>`,
  // Stocks
  "Stock Chart": () => chart(mono("A", "#111827"), "AAPL", "$228.40", "+1.2%", "#34d399", 9),
  "Stock Watchlist": () => `<div class="tile"><span class="toplist wl">${[["AAPL", "228.40", "+1.2%"], ["MSFT", "441.10", "+0.6%"], ["NVDA", "142.85", "−0.9%"]].map(([n, v, c]) => `<span><small><b style="font-size:10.5px">${n}</b></small><small class="tnum">${v}</small><small style="color:${c.startsWith("−") ? "#fb7185" : "#34d399"};font-weight:700">${c}</small></span>`).join("")}</span></div>`,
  "Crypto": () => T.crypto(),
  // Clocks
  "Clock": () => T.clock(),
  "Flip Clock": () => T.flip(),
  "World Clocks": () => { const h = NOW.getUTCHours(), m = NOW.getUTCMinutes(); return `<div class="tile wc">${[["LDN", h], ["NYC", h - 5], ["TYO", h + 9]].map(([c, hh]) => `<span>${miniFace((hh + 24) % 24, m)}<small class="mut">${c}</small></span>`).join("")}</div>`; },
  "7 Days": () => `<div class="tile"><span class="week">${Array.from({ length: 7 }, (_, i) => { const d = new Date(NOW); d.setDate(NOW.getDate() - ((NOW.getDay() + 6) % 7) + i); return `<span class="${d.toDateString() === NOW.toDateString() ? "on" : ""}"><small>${WD3[d.getDay()][0]}</small><b>${d.getDate()}</b></span>`; }).join("")}</span><small><b style="font-size:12px">24°</b></small></div>`,
  "World Time": () => `<div class="tile">${stack("Tokyo · +3h", `<span class="big-num" data-live="tokyo">13:42</span>`)}</div>`,
  "Today": () => `<div class="tile">${stack(WD[NOW.getDay()], `${NOW.getDate()} ${MON3[NOW.getMonth()]} · <span data-live="hm">10:42</span>`, "Sunny · 24°")}${ic("sun", "ic-sun sm")}</div>`,
  "Date": () => `<div class="tile">${stack(WD[NOW.getDay()], `<span style="font:700 18px var(--display)">${NOW.getDate()} ${MONTHS[NOW.getMonth()]}</span>`)}</div>`,
  "Day Number": () => `<div class="tile"><span class="daypage"><em>${MON3[NOW.getMonth()].toUpperCase()}</em><b>${NOW.getDate()}</b></span>${stack("", WD[NOW.getDay()], "Week " + Math.ceil(((NOW - new Date(NOW.getFullYear(), 0, 1)) / 864e5 + 1) / 7))}</div>`,
  "Analog Minimal": () => `<div class="tile">${miniFace(NOW.getHours(), NOW.getMinutes(), 40)}</div>`,
  "Segment Clock": () => `<div class="tile">${stack(`${WD3[NOW.getDay()].toUpperCase()} ${NOW.getDate()}`, `<span class="seg-clock"><span class="ghost">88:88</span><span data-live="hm">10:42</span></span>`)}</div>`,
  "Clock & Weather": () => `<div class="tile cw"><span style="background:#3d8bff" data-live="hm">10:42</span><span style="background:#a78bfa">${NOW.getDate()} ${MON3[NOW.getMonth()]}</span><span style="background:#fb923c">24°</span></div>`,
};
for (const [n, [l, c, v, t]] of Object.entries(REV)) {
  PV[n] = () => stat(mono(l, c, n === "Lemon Squeezy" ? "#3b2500" : "#fff"), `${n} · 30 days`, v, `<span style="color:${t.startsWith("−") ? "#fb7185" : "#34d399"};font-weight:700">${t}</span>`);
  PV[n === "Dodo Payments" ? "Dodo Chart" : `${n} Chart`] = () => chart(mono(l, c, n === "Lemon Squeezy" ? "#3b2500" : "#fff"), `${n} · 14 days`, v, t, c === "#ffc233" ? "#fbbf24" : "#34d399", l.charCodeAt(0) + v.length);
}
const previewOf = (w) => {
  const f = PV[w.name];
  return f ? f() : stat(mono(w.name[0], "#334155"), w.cname, w.name);
};

/* ───────── Catalog browser ───────── */
let tab = "all", query = "";
const tabs = [["all", "All", ALL.length], ...CAT.map(([id, name, rows]) => [id, name, rows.length])];
$("#cbTabs").innerHTML = tabs.map(([id, name, n]) => `<button class="chip" role="tab" data-tab="${id}" aria-selected="${id === "all"}">${name}<span>${n}</span></button>`).join("");
function renderCatalog() {
  const q = query.trim().toLowerCase();
  const list = ALL.filter((w) => (tab === "all" || w.cid === tab) && (!q || (w.name + " " + w.desc + " " + w.cname).toLowerCase().includes(q)));
  $("#cbList").innerHTML = list.map((w, i) => {
    const [label, cls] = SRC[w.src];
    return `<div class="cb-item" style="animation-delay:${Math.min(i, 24) * 15}ms"><div class="cb-prev" aria-hidden="true"><div class="dock skin-glass">${previewOf(w)}</div></div><div class="cb-body"><header><b>${w.name}</b><span class="badges">${w.status === 1 ? `<span class="badge prev">Preview</span>` : ""}<span class="badge ${cls}">${label}</span></span></header><p>${w.desc}</p>${tab === "all" ? `<span class="cat">${w.cname}</span>` : ""}</div></div>`;
  }).join("");
  $("#cbEmpty").hidden = list.length > 0;
}
$("#cbTabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-tab]");
  if (!b) return;
  tab = b.dataset.tab;
  $$("#cbTabs .chip").forEach((c) => c.setAttribute("aria-selected", c === b));
  renderCatalog();
});
$("#cbSearch").addEventListener("input", (e) => { query = e.target.value; renderCatalog(); });
renderCatalog();

/* ───────── Scaled stages ───────── */
$$(".stage-wrap[data-stage]").forEach((wrap) => {
  const [w, h] = wrap.dataset.stage.split("x").map(Number);
  const stage = $(".stage", wrap);
  wrap.style.aspectRatio = `${w} / ${h}`;
  Object.assign(stage.style, { width: w + "px", height: h + "px" });
  const fit = () => stage.style.setProperty("--s", wrap.clientWidth / w);
  fit();
  addEventListener("resize", fit);
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(wrap);
});

/* ───────── Style & edge switcher ───────── */
function segment(id, attr, apply) {
  $(id).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`);
    if (!b) return;
    $$(`${id} button`).forEach((x) => x.setAttribute("aria-checked", x === b));
    apply(b.dataset[attr]);
  });
}
const cdock = $("#customDock");
segment("#skinSeg", "skin", (s) => { cdock.className = cdock.className.replace(/skin-\w+/, "skin-" + s); });
segment("#posSeg", "pos", (p) => {
  cdock.className = cdock.className.replace(/pos-\w+/, "pos-" + p);
  cdock.classList.remove("moved"); void cdock.offsetWidth; cdock.classList.add("moved");
});

/* ───────── Small interactions ───────── */
document.addEventListener("click", (e) => {
  const tog = e.target.closest("[data-tog]");
  if (tog) { const on = tog.getAttribute("aria-pressed") !== "true"; tog.setAttribute("aria-pressed", on); $(".tswitch", tog).classList.toggle("on", on); }
  const sw = e.target.closest("[data-sw]");
  if (sw) sw.classList.toggle("on");
  const todo = e.target.closest("[data-todo]");
  if (todo) { todo.style.background = "#34d399"; todo.style.borderColor = "#34d399"; $("svg", todo).style.opacity = 1; $("svg", todo).style.color = "#062b11"; toast("Nice — task done ✓"); }
});

/* a working pocket calculator */
$$(".cp").forEach((cp) => {
  const out = $('[data-calc="out"]', cp), ex = $('[data-calc="expr"]', cp);
  let cur = "0", acc = null, op = null, fresh = true;
  const fmt = (n) => (Number.isFinite(n) ? (Math.abs(n) >= 1e12 ? n.toExponential(4) : Number(n.toPrecision(12)).toLocaleString("en-US", { maximumFractionDigits: 8 })) : "Error");
  const calc = (a, b, o) => ({ "+": a + b, "−": a - b, "×": a * b, "÷": a / b })[o];
  const show = () => { out.textContent = cur.endsWith(".") ? fmt(+cur) + "." : fmt(+cur); ex.innerHTML = acc !== null && op ? `${fmt(acc)} ${op}` : "&nbsp;"; };
  cp.addEventListener("click", (e) => {
    const k = e.target.closest("[data-key]")?.dataset.key;
    if (!k) return;
    if (/\d/.test(k)) { cur = fresh || cur === "0" ? k : cur + k; fresh = false; }
    else if (k === ".") { if (fresh) { cur = "0."; fresh = false; } else if (!cur.includes(".")) cur += "."; }
    else if (k === "AC") { cur = "0"; acc = null; op = null; fresh = true; }
    else if (k === "±") cur = String(-cur);
    else if (k === "%") cur = String(+cur / 100);
    else if (k === "=") { if (op !== null) { cur = String(calc(acc, +cur, op)); acc = null; op = null; fresh = true; } }
    else { if (op !== null && !fresh) cur = String(calc(acc, +cur, op)); acc = +cur; op = k; fresh = true; }
    show();
  });
});

/* ───────── Support menu (dock Coffee button) and BanglaQR modal ───────── */
// Two buttons open the same menu: the dock's Coffee tile (desktop) and the tab
// stuck to the right edge (phones). The menu opens above the first, beside the second.
const coffeeBtn = $("#coffeeBtn"), sideCoffee = $("#sideCoffee"), coffeeMenu = $("#coffeeMenu"), qrModal = $("#qrModal");
const coffeeAnchors = [coffeeBtn, sideCoffee];
let menuAnchor = coffeeBtn;
function placeMenu() {
  const r = menuAnchor.getBoundingClientRect(), w = coffeeMenu.offsetWidth, h = coffeeMenu.offsetHeight;
  const side = menuAnchor === sideCoffee;
  coffeeMenu.classList.toggle("side", side);
  if (side) {
    const top = Math.max(12, Math.min(innerHeight - h - 12, r.top + r.height / 2 - h / 2));
    Object.assign(coffeeMenu.style, { left: Math.max(12, r.left - w - 14) + "px", top: top + "px", bottom: "" });
    coffeeMenu.style.setProperty("--ay", r.top + r.height / 2 - top + "px");
  } else {
    const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    Object.assign(coffeeMenu.style, { left: left + "px", top: "", bottom: innerHeight - r.top + 12 + "px" });
    coffeeMenu.style.setProperty("--ax", r.left + r.width / 2 - left + "px");
  }
}
function setMenu(open, focusFirst, anchor = menuAnchor) {
  menuAnchor = anchor;
  coffeeMenu.hidden = !open;
  coffeeAnchors.forEach((b) => { b.classList.toggle("open", open && b === anchor); b.setAttribute("aria-expanded", open && b === anchor); });
  if (open) { placeMenu(); if (focusFirst) $(".cm-item", coffeeMenu).focus(); }
}
coffeeAnchors.forEach((b) => b.addEventListener("click", (e) => {
  const reopenHere = coffeeMenu.hidden || menuAnchor !== b;
  setMenu(reopenHere, e.detail === 0, b);
}));
document.addEventListener("click", (e) => {
  if (!coffeeMenu.hidden && !coffeeMenu.contains(e.target) && !coffeeAnchors.some((b) => b.contains(e.target))) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (coffeeMenu.hidden) return;
  if (e.key === "Escape") { setMenu(false); menuAnchor.focus(); }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    const items = $$(".cm-item", coffeeMenu), i = items.indexOf(document.activeElement);
    items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
    e.preventDefault();
  }
});
addEventListener("resize", () => { if (!coffeeMenu.hidden) placeMenu(); });
$("a.cm-item", coffeeMenu).addEventListener("click", () => setMenu(false));

function openQr() {
  setMenu(false);
  if (typeof qrModal.showModal === "function") qrModal.showModal();
  else qrModal.setAttribute("open", "");
}
$$("[data-open-qr]").forEach((b) => b.addEventListener("click", openQr));
$$("[data-close-qr]", qrModal).forEach((b) => b.addEventListener("click", () => qrModal.close()));
// a click on the dimmed backdrop closes it too
qrModal.addEventListener("click", (e) => {
  if (e.target !== qrModal) return;
  const r = qrModal.getBoundingClientRect();
  const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  if (!inside) qrModal.close();
});

/* ───────── Live values ───────── */
const setAll = (key, v) => $$(`[data-live="${key}"]`).forEach((el) => { if (el.textContent !== v) el.textContent = v; });
let pomo = 18 * 60 + 42, rec = 42, mpos = 84;
let lastFlip = "", lastFb = {};

function tick() {
  const d = new Date(), h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  setAll("hm", `${pad(h)}:${pad(m)}`);
  setAll("wd", WD[d.getDay()]);
  setAll("dm", `${d.getDate()} ${MON3[d.getMonth()]}`);
  setAll("anadate", `${WD[d.getDay()].slice(0, 3).toUpperCase()} ${d.getDate()}`);
  setAll("fbdate", `${WD[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`);
  const y0 = new Date(d.getFullYear(), 0, 1), y1 = new Date(d.getFullYear() + 1, 0, 1);
  setAll("yp", Math.floor(((d - y0) / (y1 - y0)) * 100) + "%");

  // analog hands
  const rot = { h: ((h % 12) + m / 60) * 30, m: (m + s / 60) * 6, s: s * 6 };
  $$("[data-hand]").forEach((el) => el.setAttribute("transform", `rotate(${rot[el.dataset.hand]} 65 65)`));

  // flip tiles
  const hm = pad(h) + pad(m);
  $$("[data-flip]").forEach((el) => {
    $$(".flip", el).forEach((f, i) => {
      if (f.textContent !== hm[i]) { f.textContent = hm[i]; if (lastFlip && !reduceMotion) { f.classList.remove("turn"); void f.offsetWidth; f.classList.add("turn"); } }
    });
  });
  lastFlip = hm;
  // big flip clock
  const fb = { h: pad(h), m: pad(m), s: pad(s) };
  $$("[data-fb]").forEach((el) => {
    const k = el.dataset.fb, sp = $("span", el);
    if (sp.textContent !== fb[k]) {
      sp.textContent = fb[k];
      if (lastFb[k] !== undefined && !reduceMotion) { el.classList.remove("turn"); void el.offsetWidth; el.classList.add("turn"); }
    }
  });
  lastFb = fb;

  // Tokyo
  try {
    const tk = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
    setAll("tokyo", tk);
    const dayT = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(d), dayL = d.toLocaleDateString("en-CA");
    setAll("tokyoday", dayT > dayL ? "Tomorrow" : dayT < dayL ? "Yesterday" : "Today");
    const off = Math.round((new Date(d.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })) - new Date(d.toLocaleString("en-US"))) / 36e5);
    $$(".world .dw-row small").forEach((el) => (el.textContent = (off >= 0 ? "+" : "−") + Math.abs(off) + "h"));
  } catch { /* no time zone data */ }

  // counters
  pomo = pomo > 0 ? pomo - 1 : 25 * 60;
  setAll("pomo", `${pad(Math.floor(pomo / 60))}:${pad(pomo % 60)}`);
  $$('[data-ring="pomo"]').forEach((el) => el.style.setProperty("--p", Math.round((pomo / 1500) * 100)));
  rec++;
  setAll("rec", `${pad(Math.floor(rec / 60))}:${pad(rec % 60)}`);
  mpos = mpos >= 222 ? 0 : mpos + 1;
  setAll("mcur", `${Math.floor(mpos / 60)}:${pad(mpos % 60)}`);
  $$('[data-live="mprog"]').forEach((el) => (el.style.width = (mpos / 222) * 100 + "%"));
}

/* system-ish values that wander */
let cpu = 32;
const series = { net: Array.from({ length: 22 }, () => 8 + Math.random() * 14), btc: Array.from({ length: 22 }, (_, i) => 10 + i * .6 + Math.random() * 5) };
function drawSpark(key) {
  const v = series[key], max = Math.max(...v) * 1.1, min = Math.min(...v) * .85;
  const pts = v.map((y, i) => [(i / (v.length - 1)) * 84, 28 - ((y - min) / (max - min || 1)) * 26]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  $$(`[data-spark="${key}"]`).forEach((svg) => { $(".l", svg).setAttribute("d", line); $(".a", svg).setAttribute("d", line + " L84 30 L0 30 Z"); });
}
function wander() {
  cpu = Math.max(6, Math.min(92, cpu + (Math.random() - .5) * 18));
  setAll("cpu", String(Math.round(cpu)));
  $$('[data-ring="cpu"]').forEach((el) => el.style.setProperty("--p", Math.round(cpu)));
  const net = series.net, nv = Math.max(2, Math.min(40, net[net.length - 1] + (Math.random() - .5) * 12));
  net.push(nv); net.shift();
  setAll("dn", "↓ " + nv.toFixed(1));
  setAll("up", "↑ " + (nv / 6 + Math.random()).toFixed(1));
  const b = series.btc, bv = b[b.length - 1] + (Math.random() - .45) * 2.4;
  b.push(bv); b.shift();
  setAll("btc", "$" + Math.round(97000 + bv * 18).toLocaleString("en-US"));
  drawSpark("net"); drawSpark("btc");
}
tick(); wander(); drawSpark("net"); drawSpark("btc");
setInterval(tick, 1000);
if (!reduceMotion) setInterval(wander, 1600);

/* ───────── Nav ───────── */
const nav = $(".nav"), navDock = $("#navDock");
const onScroll = () => {
  nav.classList.toggle("scrolled", scrollY > 8);
  nav.classList.toggle("show-top", scrollY > 600);
};
$("#toTop").addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
addEventListener("scroll", onScroll, { passive: true }); onScroll();

// dock magnification: icons near the pointer grow, like the real dock
const navIcons = $$(".nd-ic", navDock);
if (!reduceMotion && matchMedia("(hover: hover)").matches) {
  navDock.addEventListener("mousemove", (e) => {
    navIcons.forEach((el) => {
      const r = el.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2));
      el.style.setProperty("--m", (1 + 0.34 * Math.max(0, 1 - d / 120)).toFixed(3));
    });
  });
  navDock.addEventListener("mouseleave", () => navIcons.forEach((el) => el.style.setProperty("--m", 1)));
}

// the section being read gets the dock's "running" dot
const navLinks = $$(".nd-item[href^='#']", navDock).filter((a) => a.getAttribute("href").length > 1 && !a.dataset.link);
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((a) => { const s = $(a.getAttribute("href")); if (s) spy.observe(s); });
  // nothing is marked while the hero is on screen
  new IntersectionObserver(([en]) => { if (en.isIntersecting) navLinks.forEach((a) => a.setAttribute("aria-current", "false")); }, { rootMargin: "-45% 0px -50% 0px" }).observe($(".hero"));
}

/* ───────── Reveal on scroll ───────── */
if ("IntersectionObserver" in window && !reduceMotion) {
  // threshold 0: a block shows as soon as its top edge is a little way into the screen, however
  // tall it is. (A ratio threshold never fires for blocks taller than the screen, such as the
  // full catalog on a phone, which then stayed invisible.)
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0 });
  $$(".reveal").forEach((el) => io.observe(el));
} else {
  $$(".reveal").forEach((el) => el.classList.add("in"));
}
