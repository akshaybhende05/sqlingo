/* Build-time content extraction for SEO.
   Runs a course engine (public/<engine>.js) in a stubbed Node sandbox and emits
   static per-chapter HTML to lib/content/<course>.json, which server-rendered
   reading pages then use. Re-run whenever course content changes:
     node scripts/extract-content.js sql
     node scripts/extract-content.js            (all courses)
*/
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const MAP = {
  sql: "app", "business-analyst": "ba", qa: "qa", "dev-fundamentals": "devfund",
  "dev-python": "python", "dev-django": "django", "dev-fastapi": "fastapi",
  "dev-devops": "devops", "dev-capstone": "capstone",
};

function stubEl() {
  return { innerHTML: "", textContent: "", value: "", style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, appendChild() {}, insertAdjacentElement() {},
    removeChild() {}, addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }, focus() {}, remove() {}, parentElement: null, children: [] };
}

function loadEngine(engine) {
  const document = { getElementById() { return stubEl(); }, createElement() { return stubEl(); },
    querySelector() { return null; }, querySelectorAll() { return []; }, body: stubEl(),
    addEventListener() {}, documentElement: stubEl() };
  const localStorage = { _d: {}, getItem(k) { return this._d[k] || null; },
    setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
  const noThen = () => ({ then: () => ({ catch() {} }) });
  const ctx = { console, document, localStorage, initSqlJs: noThen, loadPyodide: noThen,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    setTimeout: () => {}, clearTimeout: () => {}, setInterval: () => {}, clearInterval: () => {},
    fetch: () => Promise.resolve(),
    scrollTo: () => {}, scroll: () => {}, scrollBy: () => {},
    alert: () => {}, confirm: () => true, prompt: () => null, print: () => {},
    requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
    getComputedStyle: () => ({ getPropertyValue: () => "" }), location: { hash: "", href: "" }, history: { pushState() {}, replaceState() {} } };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  let src = fs.readFileSync(path.join("public", engine + ".js"), "utf8");
  src += '\n;globalThis.__L = (typeof lessons!=="undefined")?lessons:null; globalThis.__M = (typeof manifest!=="undefined")?manifest:null; globalThis.__inShort = (typeof inShort!=="undefined")?inShort:null;';
  vm.runInContext(src, ctx, { filename: engine + ".js" });
  return { lessons: ctx.__L, manifest: ctx.__M, inShort: ctx.__inShort };
}

function textOf(html, cls) {
  const m = html.match(new RegExp('<[^>]*class="' + cls + '"[^>]*>([\\s\\S]*?)</'));
  return m ? m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
}

function extract(course) {
  const engine = MAP[course];
  if (!engine) throw new Error("unknown course " + course);
  const { lessons, manifest, inShort } = loadEngine(engine);
  const chapters = [];
  manifest.forEach((g) => g.items.forEach((it) => {
    const [n, navTitle, built] = it;
    if (!built || !lessons[n]) return;
    let html = "";
    try { html = lessons[n].render(); } catch (e) { console.log("  render " + n + " failed:", e.message); return; }
    const title = textOf(html, "title") || navTitle;
    const lead = textOf(html, "lead");
    const summary = inShort ? inShort(n) : "";
    chapters.push({ n, part: g.p, title, navTitle, lead, html: (summary + html).trim(), kind: "chapter" });
  }));
  // Pinned reference/practice lessons (cheat sheet, interview Q&A) become their own pages.
  const extras = [];
  for (const key of ["interview", "cheatsheet"]) {
    if (!lessons[key]) continue;
    let html = "";
    try { html = lessons[key].render(); } catch (e) { console.log("  extra " + key + " failed:", e.message); continue; }
    const title = textOf(html, "title") || key;
    const lead = textOf(html, "lead");
    extras.push({ n: key, part: "Reference", title, navTitle: title, lead, html: html.trim(), kind: "extra" });
  }
  return { chapters, extras };
}

const args = process.argv.slice(2);
const courses = args.length ? args : Object.keys(MAP);
fs.mkdirSync("lib/content", { recursive: true });
for (const course of courses) {
  const { chapters, extras } = extract(course);
  fs.writeFileSync(path.join("lib/content", course + ".json"), JSON.stringify({ course, chapters, extras }, null, 2));
  console.log(course + ": " + chapters.length + " chapters + " + extras.length + " extras -> lib/content/" + course + ".json");
}
