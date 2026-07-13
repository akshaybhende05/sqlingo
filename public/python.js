/* ============================================================
   Developer Track — Python course engine
   Second of six Developer courses. Unlike BA/QA/Fundamentals,
   this course runs REAL Python in the browser via Pyodide
   (WebAssembly), mirroring how public/app.js runs real SQL via
   sql.js. Playground blocks (ed) are free-play; graded blocks
   (qPy) run student code + hidden test code in a fresh Python
   namespace each time and check for a pass sentinel.
   ============================================================ */

let pyodide = null, pyReady = false;

function loadPyodideRuntime() {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
  s.onload = async () => {
    try {
      pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
      pyReady = true;
      const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
      buildNav(); computeTotals(); go((function(){try{var l=localStorage.getItem('python_last');return (l&&lessons[l])?l:'00';}catch(e){return '00';}})());
    } catch (e) {
      const loader = document.getElementById('loader');
      if (loader) loader.innerHTML = '<p style="color:var(--rose)">Could not start the Python engine. Check your connection and refresh.</p>';
    }
  };
  s.onerror = () => {
    const loader = document.getElementById('loader');
    if (loader) loader.innerHTML = '<p style="color:var(--rose)">Could not load the Python engine. Check your connection and refresh.</p>';
  };
  document.body.appendChild(s);
}
loadPyodideRuntime();

/* Re-entry hook: see the matching comment in public/app.js. The Pyodide runtime itself
   must not be reloaded on client-side navigation back into this course. */
window.__pythonReinit = function () {
  const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
  buildNav();
  computeTotals();
  go(curCh || (typeof order !== 'undefined' && order[0]) || '00');
};

/* ---------- running real Python ---------- */
function friendlyPyErr(raw) {
  const lines = String(raw).split('\n').map(l => l.trim()).filter(Boolean);
  const last = lines[lines.length - 1] || String(raw);
  return last.replace(/^PythonError:\s*/, '');
}
function runPy(code) {
  if (!pyReady) return { error: 'The Python engine is still loading, give it a second.' };
  let output = '';
  try {
    pyodide.setStdout({ batched: (s) => { output += s + '\n'; } });
    pyodide.setStderr({ batched: (s) => { output += s + '\n'; } });
    const ns = pyodide.globals.get('dict')();
    pyodide.runPython(code, { globals: ns });
    return { output };
  } catch (e) {
    return { error: friendlyPyErr(e.message || String(e)), output };
  }
}

/* ---------- free-play code blocks ---------- */
let edCount = 0; const tryEds = [];
function ed(def, autorun) {
  const id = 'e' + (edCount++); if (autorun) tryEds.push(id);
  return `
  <div class="pg">
    <div class="pg-tabbar"><div class="pg-tab active"><span class="ic">▤</span> Python Editor</div></div>
    <div class="pg-toolbar"><button class="pg-btn pg-run" onclick="runEd('${id}')">▶ Run</button><button class="pg-btn pg-ghost" onclick="resetEd('${id}','${encodeURIComponent(def)}')">↺ Reset</button><div class="pg-sep"></div><span style="font-size:11.5px;color:var(--ink-faint)">runs real Python · edit freely</span></div>
    <div class="pg-gut-line"><div class="pg-gut" id="gut-${id}">1</div><textarea class="pg-ed" id="ed-${id}" spellcheck="false" oninput="gutter('${id}')" onkeydown="if(event.key==='F5'){event.preventDefault();runEd('${id}')}">${def}</textarea></div>
    <div class="pg-out-head"><span class="pg-out-tab">Output</span><span class="pg-status" id="st-${id}">Ready</span></div>
    <div class="pg-out" id="out-${id}"><div class="pg-empty">Press Run to see the output.</div></div>
  </div>`;
}
function renderPyOut(id, res) {
  const out = document.getElementById('out-' + id), st = document.getElementById('st-' + id);
  if (res.error) {
    out.innerHTML = `${res.output ? `<pre class="code" style="margin:0;border-radius:0;border:none;">${escapeHtml(res.output)}</pre>` : ''}<div class="pg-empty" style="color:var(--rose)">⚠ ${res.error}</div>`;
    if (st) st.textContent = 'Error';
    return { ok: false };
  }
  if (!res.output || !res.output.trim()) { out.innerHTML = '<div class="pg-empty">Ran fine, but nothing was printed. Add a print(...) to see output.</div>'; if (st) st.textContent = 'OK · no output'; return { ok: true, output: res.output || '' }; }
  out.innerHTML = `<pre class="code" style="margin:0;border-radius:0;border:none;">${escapeHtml(res.output)}</pre>`;
  if (st) st.textContent = 'OK';
  return { ok: true, output: res.output };
}
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function gutter(id) { const e = document.getElementById('ed-' + id), g = document.getElementById('gut-' + id); if (!e || !g) return; const n = e.value.split('\n').length || 1; g.innerHTML = Array.from({ length: n }, (_, i) => i + 1).join('<br>'); }
function runEd(id) { renderPyOut(id, runPy(document.getElementById('ed-' + id).value)); }
function resetEd(id, enc) { const e = document.getElementById('ed-' + id); e.value = decodeURIComponent(enc); gutter(id); document.getElementById('out-' + id).innerHTML = '<div class="pg-empty">Press Run to see the output.</div>'; document.getElementById('st-' + id).textContent = 'Ready'; }

/* ---------- graded code exercises ---------- */
let qCount = 0; let solved = 0; const answers = {};
const PASS_TOKEN = '___ALL_PASSED___';
function qPy(id, lvl, txt, starter, testCode, solution, hint) {
  qCount++;
  const c = lvl === 'easy' ? 'lv-e' : lvl === 'med' ? 'lv-m' : 'lv-h';
  const t = lvl === 'easy' ? 'Easy' : lvl === 'med' ? 'Medium' : 'Hard';
  answers[id] = { testCode, solution, solved: false };
  return `<div class="q"><div class="q-head"><span class="q-lvl ${c}">${t}</span></div><div class="q-txt">${txt}</div>${hint ? `<div class="q-hint">Hint: ${hint}</div>` : ''}
    <div class="pg" style="margin:13px 0 0"><div class="pg-toolbar"><button class="pg-btn pg-run" onclick="checkPy('${id}')">▶ Run &amp; Check</button><button class="pg-btn pg-ghost" onclick="revealPy('${id}')">Show answer</button></div>
      <div class="pg-gut-line"><div class="pg-gut" id="gut-${id}">1</div><textarea class="pg-ed" id="ed-${id}" spellcheck="false" oninput="gutter('${id}')" onkeydown="if(event.key==='F5'){event.preventDefault();checkPy('${id}')}">${starter}</textarea></div>
      <div class="pg-out-head"><span class="pg-out-tab">Output</span><span class="pg-status" id="st-${id}">Waiting</span></div>
      <div class="pg-out" id="out-${id}"><div class="pg-empty">Run your code to check it.</div></div></div>
    <div class="q-fb" id="fb-${id}"></div></div>`;
}
function checkPy(id) {
  const m = answers[id];
  const code = document.getElementById('ed-' + id).value;
  const full = code + '\n\n' + m.testCode;
  const res = runPy(full);
  const cleanOutput = res.output ? res.output.split('\n').filter(l => l !== PASS_TOKEN).join('\n') : '';
  const info = renderPyOut(id, { error: res.error, output: cleanOutput });
  const fb = document.getElementById('fb-' + id);
  const pass = !res.error && res.output && res.output.includes(PASS_TOKEN);
  if (pass) { fb.className = 'q-fb ok'; fb.innerHTML = '✓ Correct. That does exactly what was asked.'; if (!m.solved) { m.solved = true; solved++; markProg(curCh, id); updateProg(); } }
  else if (res.error) { fb.className = 'q-fb no'; fb.innerHTML = '✗ There is an error, read the message above and adjust.'; }
  else { fb.className = 'q-fb no'; fb.innerHTML = '✗ It runs, but does not do what was asked yet. Re-read the question and check your logic.'; }
}
function revealPy(id) {
  const m = answers[id]; const e = document.getElementById('ed-' + id);
  e.value = m.solution; gutter(id);
  renderPyOut(id, runPy(m.solution));
  const fb = document.getElementById('fb-' + id);
  fb.className = 'q-fb ok'; fb.innerHTML = 'Here is one correct version. Read each part, then try writing it yourself next time.';
}

/* ---------- multiple choice (for pure concepts) ---------- */
function qMC(id, lvl, txt, opts, correctIdx, explain, hint) {
  qCount++;
  const c = lvl === 'easy' ? 'lv-e' : lvl === 'med' ? 'lv-m' : 'lv-h';
  const t = lvl === 'easy' ? 'Easy' : lvl === 'med' ? 'Medium' : 'Hard';
  answers[id] = { type: 'mc', correctIdx, explain, solved: false };
  const optsHtml = opts.map((o) => `<label class="mc-opt"><input type="radio" name="mc-${id}"> <span>${o}</span></label>`).join('');
  return `<div class="q"><div class="q-head"><span class="q-lvl ${c}">${t}</span></div><div class="q-txt">${txt}</div>${hint ? `<div class="q-hint">Hint: ${hint}</div>` : ''}
    <div class="mc-opts" id="mc-${id}">${optsHtml}</div>
    <div class="mc-toolbar"><button class="pg-btn pg-run" onclick="checkMC('${id}')">Check answer</button></div>
    <div class="q-fb" id="fb-${id}"></div></div>`;
}
function checkMC(id) {
  const m = answers[id];
  const inputs = document.querySelectorAll(`#mc-${id} input`);
  let chosen = -1; inputs.forEach((inp, i) => { if (inp.checked) chosen = i; });
  const fb = document.getElementById('fb-' + id);
  if (chosen === -1) { fb.className = 'q-fb no'; fb.innerHTML = 'Pick an option first.'; return; }
  const pass = chosen === m.correctIdx;
  if (pass) { fb.className = 'q-fb ok'; fb.innerHTML = '&#10003; Correct. ' + (m.explain || ''); if (!m.solved) { m.solved = true; solved++; markProg(curCh, id); updateProg(); } }
  else { fb.className = 'q-fb no'; fb.innerHTML = '&#10007; Not quite. ' + (m.explain || 'Re-read the explanation above and try again.'); }
}

/* ---------- glossary ---------- */
const glossary = {
  variable: { short: 'A name pointing at a value stored in memory.', long: 'A variable is a readable label for a value. Writing total = 450 stores 450 in memory and lets you refer to it as "total" from then on, until reassigned.' },
  function: { short: 'A named, reusable block of code that can take inputs and return a result.', long: 'A function packages up a piece of logic so it can be reused by name instead of rewritten every time, optionally taking parameters as input and producing a return value as output.' },
  loop: { short: 'Code that repeats, once per item or until a condition changes.', long: 'A loop runs a block of code repeatedly, either once for each item in a collection (a for loop) or for as long as a condition stays true (a while loop), instead of writing the same code out by hand many times.' },
  list: { short: 'An ordered, changeable collection of values.', long: 'A list holds multiple values in a specific order, and can grow, shrink, or be reordered after creation. Written with square brackets, like [1, 2, 3].' },
  dictionary: { short: 'A collection of key-value pairs, looked up by key instead of position.', long: 'A dictionary stores values under named keys, like {"name": "Aarav", "city": "Mumbai"}, letting you look a value up directly by its key instead of by numeric position.' },
  class: { short: 'A blueprint for creating objects that bundle data and behaviour together.', long: 'A class defines the shape of an object: what data it holds and what functions (methods) it can perform on that data. Creating an object from a class is called instantiating it.' },
  exception: { short: 'An error that occurs while a program is running, which can be caught and handled.', long: 'An exception is raised when something goes wrong while code is executing (dividing by zero, a missing key, invalid input). Python lets you catch exceptions with try/except and respond deliberately instead of crashing.' },
  module: { short: 'A single Python file containing code you can import and reuse elsewhere.', long: 'A module is just a .py file. Importing it makes its functions, classes, and variables available in your own code, without copy-pasting them.' },
  pip: { short: "Python's package installer, for downloading code other people have written.", long: 'pip is the standard tool for installing third-party Python packages from the Python Package Index (PyPI), so you can reuse code that already solves a problem instead of writing it from scratch.' },
  virtual_environment: { short: 'An isolated set of installed packages, specific to one project.', long: 'A virtual environment (venv) is an isolated Python installation for one project, so its installed packages and versions don\'t conflict with, or get affected by, any other project on the same machine.' },
  json: { short: 'A simple, text-based format for representing structured data.', long: 'JSON (JavaScript Object Notation) is a text format for representing structured data, lists, key-value objects, numbers, strings, that nearly every programming language can read and write, making it the most common format APIs use to exchange data.' },
};
function term(w, label) {
  const g = glossary[w];
  return `<span class="term" tabindex="0" role="button" aria-label="${label || w}, glossary term, press Enter to read more" onclick="pyMore('${w}',this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();pyMore('${w}',this)}">${label || w}<span class="tip">${g.short}<br><span style="color:#7fd8cb;font-size:11px">press Enter or click to read more</span></span></span>`;
}
function pyMore(w, el) {
  const g = glossary[w];
  let b = el.closest('p,.lead,.txt'); if (!b) b = el.parentElement;
  let ex = b.parentElement.querySelector('.term-more[data-w="' + w + '"]');
  if (ex) { ex.classList.toggle('show'); if (!ex.classList.contains('show')) ex.remove(); return; }
  const d = document.createElement('div'); d.className = 'term-more show'; d.setAttribute('data-w', w);
  d.innerHTML = `<b style="text-transform:capitalize">${w.replace(/_/g, ' ')}</b>. ${g.long}`;
  b.insertAdjacentElement('afterend', d);
}

/* ---------- progress ---------- */
function updateProg() { if (qCount === 0) { document.getElementById('progLabel').textContent = 'Read'; document.getElementById('progFill').style.width = '0%'; return; } document.getElementById('progLabel').textContent = `${solved} / ${qCount}`; document.getElementById('progFill').style.width = ((solved / qCount) * 100) + '%'; }

let curCh = null, TOTAL_Q = 0, PROG = {};
try { PROG = JSON.parse(localStorage.getItem('python_progress') || '{}'); } catch (_) { PROG = {}; }
function markProg(ch, id) { if (!ch) return; if (!PROG[ch]) PROG[ch] = {}; PROG[ch][id] = true; try { localStorage.setItem('python_progress', JSON.stringify(PROG)); } catch (_) { } updateCourse(); }
function overallSolved() { let n = 0; for (const c in PROG) { n += Object.keys(PROG[c]).length; } return n; }
function updateCourse() {
  const el = document.getElementById('courseProg'); const fill = document.getElementById('courseProgFill'); const n = overallSolved();
  const done = TOTAL_Q > 0 && n >= TOTAL_Q;
  if (el) el.textContent = TOTAL_Q ? (done ? `Course complete — ${n} / ${TOTAL_Q} solved` : `Overall: ${n} / ${TOTAL_Q} solved`) : '';
  if (fill) fill.style.width = TOTAL_Q ? ((n / TOTAL_Q) * 100) + '%' : '0%';
  if (done) celebrateOnce();
}
function celebrateOnce() {
  let shown = false; try { shown = localStorage.getItem('python_celebrated') === '1'; } catch (_) { }
  if (shown) return;
  try { localStorage.setItem('python_celebrated', '1'); } catch (_) { }
  const t = document.createElement('div'); t.className = 'celebrate-toast';
  t.innerHTML = '<b>Every chapter solved.</b><br>You have worked through the whole Python course. Django or FastAPI next.';
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('show'); }, 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 6000);
}
function computeTotals() { const sq = qCount; TOTAL_Q = 0; for (const k in lessons) { qCount = 0; try { lessons[k].render(); } catch (_) { } TOTAL_Q += qCount; } qCount = sq; edCount = 0; tryEds.length = 0; for (const kk in answers) delete answers[kk]; updateCourse(); }
function resetProgress() { if (!window.confirm('Reset all solved progress across every chapter? This cannot be undone.')) return; PROG = {}; try { localStorage.removeItem('python_progress'); } catch (_) { } updateCourse(); if (curCh) go(curCh); }
function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('navOverlay').classList.toggle('show'); }
function closeMenu() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('navOverlay').classList.remove('show'); }

/* ---------- navigation ---------- */
const manifest = [
  { p: 'Groundwork', items: [['00', 'What is Python, and why learn it here?', 1], ['0b', 'Meet the project', 1], ['0i', 'How this course works: real Python, in your browser', 1]] },
  { p: 'Part I · Basics', items: [['01', 'Variables and basic types', 1], ['02', 'Numbers, strings, and operators', 1], ['03', 'Output, input, and f-strings', 1], ['04', 'Booleans and comparisons', 1]] },
  { p: 'Part II · Control flow', items: [['05', 'if / elif / else', 1], ['06', 'while loops', 1], ['07', 'for loops and range()', 1], ['08', 'break, continue, and loop patterns', 1]] },
  { p: 'Part III · Data structures', items: [['09', 'Lists', 1], ['10', 'Tuples and sets', 1], ['11', 'Dictionaries', 1], ['12', 'Nesting it all together', 1]] },
  { p: 'Part IV · Functions', items: [['13', 'Defining functions', 1], ['14', 'Default, keyword, and *args/**kwargs', 1], ['15', 'Scope: local vs. global', 1], ['16', 'Writing clean, testable functions', 1]] },
  { p: 'Part V · Strings, files, and errors', items: [['17', 'String methods and formatting', 1], ['18', 'Reading and writing files', 1], ['19', 'Exceptions: try / except / finally', 1], ['20', 'Raising your own exceptions', 1]] },
  { p: 'Part VI · Object-oriented Python', items: [['21', 'Classes and objects', 1], ['22', '__init__, methods, and self', 1], ['23', 'Inheritance', 1], ['24', 'Dataclasses, and when OOP helps', 1]] },
  { p: 'Part VII · Modules and the real world', items: [['25', 'Modules and imports', 1], ['26', 'pip and virtual environments', 1], ['27', 'Working with JSON', 1]] },
  { p: 'Part VIII · Testing and what\'s next', items: [['28', 'Testing your code with assert', 1], ['29', 'Where to go next: Django vs. FastAPI', 1]] },
];
const order = []; manifest.forEach(g => g.items.forEach(it => { if (it[2]) order.push(it[0]); }));
function buildNav() {
  let h = '';
  manifest.forEach(g => {
    h += `<div class="nav-group"><div class="nav-label">${g.p}</div>`;
    g.items.forEach(it => {
      const n = it[0], t = it[1], built = it[2]; const key = (n + ' ' + t).toLowerCase();
      h += built ? `<div class="nav-item" id="nav-${n}" onclick="go('${n}')" data-search="${key}"><span class="ch">${n}</span> ${t}</div>` : `<div class="nav-item soon" data-search="${key}"><span class="ch">${n}</span> ${t}</div>`;
    });
    h += `</div>`;
  });
  document.getElementById('nav').innerHTML = h;
}

function filterNav(qstr) {
  const q = (qstr || '').trim().toLowerCase();
  const groups = document.querySelectorAll('.nav-group');
  groups.forEach(g => {
    let any = false;
    g.querySelectorAll('.nav-item').forEach(item => {
      const hay = item.getAttribute('data-search') || item.textContent.toLowerCase();
      const match = !q || hay.includes(q);
      item.style.display = match ? '' : 'none';
      if (match) any = true;
    });
    g.style.display = any ? '' : 'none';
  });
  const empty = document.getElementById('navEmpty');
  if (empty) empty.style.display = groups.length && ![...groups].some(g => g.style.display !== 'none') ? '' : 'none';
}

function foot(cur) {
  if (cur === 'cheatsheet') return `<div class="foot"><span></span><button class="f-btn f-next" onclick="go('${order[0]}')">Start the course &rarr;</button></div>`;
  const i = order.indexOf(cur); const prev = i > 0 ? order[i - 1] : null; const next = i < order.length - 1 ? order[i + 1] : null;
  return `<div class="foot">
    ${prev ? `<button class="f-btn f-prev" onclick="go('${prev}')">&larr; ${lessons[prev].short}</button>` : '<span></span>'}
    ${next ? `<button class="f-btn f-next" onclick="go('${next}')">${lessons[next].short} &rarr;</button>` : `<button class="f-btn f-next" disabled>More coming soon</button>`}
  </div>`;
}

function go(num) {
  const L = lessons[num]; if (!L) return;
  curCh = num;
  try { localStorage.setItem('python_last', num); } catch (_) {}
  edCount = 0; tryEds.length = 0; qCount = 0; solved = 0; for (const k in answers) delete answers[k];
  document.getElementById('content').innerHTML = L.render() + foot(num);
  document.getElementById('crumb').innerHTML = L.where;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('nav-' + num); if (el) el.classList.add('active');
  const done = PROG[num] || {};
  Object.keys(answers).forEach(id => {
    if (done[id] && !answers[id].solved) {
      answers[id].solved = true; solved++;
      const fb = document.getElementById('fb-' + id);
      if (fb) { fb.className = 'q-fb ok'; fb.innerHTML = '&#10003; Solved earlier. Run it again any time to practise.'; }
    }
  });
  updateProg();
  tryEds.forEach(id => { try { runEd(id); } catch (_) { } });
  document.querySelectorAll('.pg-ed').forEach(t => gutter(t.id.replace('ed-', '')));
  closeMenu();
  window.scrollTo({ top: 0 });
}

/* ---------- lessons ---------- */
const lessons = {};

lessons['00'] = {
  short: 'Why Python?', where: 'Groundwork · <b>What is Python, and why learn it here?</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 00</div>
  <h2 class="title">What is Python, and why learn it here?</h2>
  <p class="lead">Python is one of the most widely used programming languages in the world, and the one this whole Developer track builds its backend courses on.</p>
  <hr class="rule">
  <p class="body">Python reads closer to plain English than most languages, which is a large part of why it's a common first language: <code class="inl">if age &gt;= 18:</code> reads almost like the English sentence it represents. It's an interpreted language (covered conceptually in the Fundamentals course), which is exactly why you'll be able to run real code directly in this browser, no installation, no setup.</p>
  <div class="analogy"><div class="lab">Why Python specifically, for this track</div><div class="txt">Django and FastAPI, the two frameworks taught later in this Developer track, are both Python frameworks. Learning Python well here means everything in those courses focuses on the framework itself, not on fighting unfamiliar language syntax at the same time.</div></div>
  <p class="body">Try your first real Python below. Click "Run" (or just watch, it runs automatically once the engine is ready).</p>
  ${ed(`print("Hello, TastyGo!")\nprint(2 + 2)`, true)}
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Expecting instant results the first time you load this course.</b> The Python engine (a full interpreter, running via WebAssembly) takes a few seconds to load the first time; after that, it's instant for the rest of your session.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Python is a widely used, readable, interpreted language, and the foundation for the Django and FastAPI courses ahead. Every code block in this course runs real Python, directly in your browser.</p>
  ${qMC('q1', 'easy', 'Why does this course teach Python before Django or FastAPI?',
    ['Python has nothing to do with either framework', 'Django and FastAPI are both Python frameworks, so learning Python well here means those courses can focus on the framework itself', 'Python is required only for testing, not for building applications'],
    1, 'Both Django and FastAPI are written in and used with Python, so a solid grounding in the language itself lets those later courses focus purely on what each framework adds.')}
`
};

lessons['0b'] = {
  short: 'Meet the project', where: 'Groundwork · <b>Meet the project</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0b</div>
  <h2 class="title">Meet the project</h2>
  <p class="lead">Same TastyGo used across every CareerLadder course. In this one, you'll represent and work with TastyGo's data using plain Python, before Django/FastAPI connect it to a real database.</p>
  <hr class="rule">
  <p class="body">Throughout this course, a TastyGo "order" will often be represented as a Python dictionary, and a list of orders as a Python list of dictionaries, a structure you'll meet properly in Part III. Here's a preview, already runnable:</p>
  ${ed(`order = {"id": 101, "customer": "Aarav Sharma", "total": 450}\nprint(order["customer"], "spent", order["total"])`, true)}
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TastyGo's data will be modeled directly in Python throughout this course, giving you hands-on practice with exactly the kind of structures Django and FastAPI will later load from a real database.</p>
  ${qMC('q1', 'easy', 'In this course, how will a single TastyGo order typically be represented?',
    ['As a single number', 'As a Python dictionary holding its details as key-value pairs', 'Orders cannot be represented until you learn Django'],
    1, 'A dictionary is a natural fit for one order\'s details (id, customer, total, etc.), each accessible by a named key.')}
`
};

lessons['0i'] = {
  short: 'How this course works', where: 'Groundwork · <b>How this course works: real Python, in your browser</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0i</div>
  <h2 class="title">How this course works: real Python, in your browser</h2>
  <p class="lead">Two kinds of code block appear throughout this course, worth knowing apart before you start.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The two block types</div>
    <div class="qb-row"><span class="qb-kw kw-p">Playground blocks</span><span class="qb-mean">free to edit and experiment with, no right answer, just press Run</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Practice blocks</span><span class="qb-mean">a specific task to complete; press "Run &amp; Check" to test your code against hidden checks, or "Show answer" if you're stuck</span></div>
  </div>
  <p class="body">Every block runs actual Python, actually executed, right in this page, via a real Python interpreter compiled to run in the browser. There is no fake simulation happening, if you write invalid Python, you'll see a real Python error, exactly like you would on your own machine.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Expecting a practice block to check the exact text of your code.</b> It actually runs your code and checks the results/behaviour, so different, equally correct approaches will still pass.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Playground blocks are free experimentation; practice blocks check your code's actual behaviour against hidden tests. Both run real, live Python.</p>
  ${qMC('q1', 'easy', 'How does a practice block ("Run & Check") actually verify your code?',
    ['By comparing the exact text you typed against a stored answer', 'By actually running your code together with hidden checks, and seeing if those checks pass', 'It does not check anything, it only shows the sample answer'],
    1, 'Practice blocks execute your real code alongside hidden test logic, so any correct approach passes, not just one exact expected wording.')}
`
};

lessons['01'] = {
  short: 'Variables & types', where: 'Part I · <b>Variables and basic types</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 01</div>
  <h2 class="title">Variables and basic types</h2>
  <p class="lead">A ${term('variable', 'variable')} in Python needs no special declaration keyword, you simply assign a value to a name.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The basic types you'll use constantly</div>
    <div class="qb-row"><span class="qb-kw kw-p">int</span><span class="qb-mean">a whole number, like 450</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">float</span><span class="qb-mean">a decimal number, like 4.8</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">str</span><span class="qb-mean">text, like "Aarav Sharma", written in quotes</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">bool</span><span class="qb-mean">True or False</span></div>
  </div>
  <p class="body">Python figures out a variable's type automatically from the value you assign, and <code class="inl">type(x)</code> lets you check it directly:</p>
  ${ed(`price = 450\nrating = 4.8\nname = "Aarav Sharma"\nis_delivered = True\n\nprint(type(price), type(rating), type(name), type(is_delivered))`, true)}
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Writing a number in quotes by accident.</b> <code class="inl">"450"</code> is a string, not a number, and behaves very differently in calculations.</li>
    <li><b>Assuming a variable's type is fixed forever.</b> Python lets you reassign a variable to a completely different type later; this is flexible, but can hide bugs if done accidentally.</li>
  </ul></div>
  <div class="sec-num">1.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Assigning a value to a name creates a variable, no declaration keyword needed. Python infers the type (int, float, str, bool) automatically from the value.</p>
  ${qPy('q1', 'easy', 'Create a variable called <code class="inl">restaurant</code> set to the string "Domino\'s", and a variable called <code class="inl">rating</code> set to 4.8. Print both.',
`# write your code here
`,
`assert restaurant == "Domino's", "restaurant should be \\"Domino's\\""
assert rating == 4.8, "rating should be 4.8"
print("${PASS_TOKEN}")`,
`restaurant = "Domino's"
rating = 4.8
print(restaurant, rating)`,
    'Use quotes for text, and no quotes for the number.')}
`
};

lessons['02'] = {
  short: 'Numbers, strings, operators', where: 'Part I · <b>Numbers, strings, and operators</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 02</div>
  <h2 class="title">Numbers, strings, and operators</h2>
  <p class="lead">The same <code class="inl">+</code> symbol means something different depending on the type of value on either side, worth understanding precisely.</p>
  <hr class="rule">
  ${ed(`print(2 + 2)          # arithmetic addition\nprint("Tasty" + "Go")  # string concatenation\nprint(10 / 3)          # true division\nprint(10 // 3)         # floor division\nprint(10 % 3)          # remainder`, true)}
  <p class="body">Mixing a number and text with <code class="inl">+</code> raises an error rather than silently guessing what you meant, exactly the "types matter" idea from the Fundamentals course, enforced directly by the language here.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming <code class="inl">/</code> always gives a whole number.</b> It gives a precise decimal (float); use <code class="inl">//</code> specifically for floor (whole-number) division.</li>
    <li><b>Trying to add a number directly to text.</b> <code class="inl">"Total: " + 450</code> raises a TypeError; convert first with <code class="inl">str(450)</code>.</li>
  </ul></div>
  <div class="sec-num">2.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">+</code> means addition for numbers and concatenation for strings. <code class="inl">/</code> gives precise division; <code class="inl">//</code> gives the floor; <code class="inl">%</code> gives the remainder.</p>
  ${qPy('q2', 'med', 'Two friends split a ₹450 order evenly. Compute the per-person cost as <code class="inl">per_person</code>, and print it.',
`total = 450
# compute per_person here
`,
`assert per_person == 225.0 or per_person == 225, "per_person should be 225"
print("${PASS_TOKEN}")`,
`total = 450
per_person = total / 2
print(per_person)`,
    'Regular division (/) gives a precise decimal result.')}
`
};

lessons['03'] = {
  short: 'Output, input, f-strings', where: 'Part I · <b>Output, input, and f-strings</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 03</div>
  <h2 class="title">Output, input, and f-strings</h2>
  <p class="lead"><code class="inl">print()</code> is how your program talks back to you. F-strings are the cleanest way to mix variables into readable text.</p>
  <hr class="rule">
  ${ed(`name = "Priya Patel"\ntotal = 610\nprint(f"{name}'s order total is ₹{total}")`, true)}
  <p class="body">An f-string is a string prefixed with <code class="inl">f</code>, letting you drop variables (or even expressions) directly inside <code class="inl">{ }</code>, rather than stitching text and variables together manually with <code class="inl">+</code>.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting the <code class="inl">f</code> prefix.</b> Without it, <code class="inl">"{name}"</code> prints literally as the text "{name}", not the variable's value.</li>
    <li><b>Manually concatenating many pieces with +.</b> This works, but gets hard to read fast; an f-string is almost always clearer once more than one or two values are involved.</li>
  </ul></div>
  <div class="sec-num">3.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Use <code class="inl">print()</code> for output, and f-strings (<code class="inl">f"...{variable}..."</code>) to cleanly embed variables inside readable text.</p>
  ${qPy('q1', 'easy', 'Using an f-string, create a variable <code class="inl">line</code> holding exactly the text <code class="inl">Order #101 total: 450</code>, using variables <code class="inl">order_id = 101</code> and <code class="inl">total = 450</code>. Then print it.',
`order_id = 101
total = 450
# create f-string variable named line here, then print it
`,
`assert line == "Order #101 total: 450", 'line should read exactly "Order #101 total: 450"'
print("${PASS_TOKEN}")`,
`order_id = 101
total = 450
line = f"Order #{order_id} total: {total}"
print(line)`,
    'line = f"Order #{order_id} total: {total}"')}
`
};

lessons['04'] = {
  short: 'Booleans & comparisons', where: 'Part I · <b>Booleans and comparisons</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 04</div>
  <h2 class="title">Booleans and comparisons</h2>
  <p class="lead">Comparison operators produce a bool (<code class="inl">True</code> or <code class="inl">False</code>), the foundation everything in the next Part (control flow) is built on.</p>
  <hr class="rule">
  ${ed(`rating = 4.6\nprint(rating > 4.5)\nprint(rating == 4.6)\nprint(rating != 5.0)\nprint(rating >= 4.5 and rating <= 5.0)`, true)}
  <div class="qb"><div class="qb-title">The comparison operators</div>
    <div class="qb-row"><span class="qb-kw kw-p">== and !=</span><span class="qb-mean">equal to / not equal to</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">&gt;, &lt;, &gt;=, &lt;=</span><span class="qb-mean">greater/less than, with or without "or equal"</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">and, or, not</span><span class="qb-mean">combine or invert boolean values</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using a single = for comparison.</b> A single <code class="inl">=</code> assigns a value; <code class="inl">==</code> compares two values. Mixing these up is one of the most common early Python mistakes.</li>
  </ul></div>
  <div class="sec-num">4.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Comparison operators (==, !=, &gt;, &lt;, &gt;=, &lt;=) produce booleans. <code class="inl">and</code>/<code class="inl">or</code>/<code class="inl">not</code> combine them, the basis for every decision your code will make from here on.</p>
  ${qPy('q1', 'easy', 'Given <code class="inl">cost_for_two = 700</code>, create a variable <code class="inl">is_expensive</code> that is True if cost_for_two is greater than 600.',
`cost_for_two = 700
# compute is_expensive here
`,
`assert is_expensive is True, "is_expensive should be True for 700"
print("${PASS_TOKEN}")`,
`cost_for_two = 700
is_expensive = cost_for_two > 600
print(is_expensive)`,
    'A comparison expression itself already produces True or False.')}
`
};

lessons['05'] = {
  short: 'if / elif / else', where: 'Part II · <b>if / elif / else</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 05</div>
  <h2 class="title">if / elif / else</h2>
  <p class="lead">Conditionals let your code make decisions, running different code depending on whether something is true.</p>
  <hr class="rule">
  ${ed(`total = 750
if total >= 1000:
    print("Free delivery!")
elif total >= 500:
    print("Discounted delivery: ₹20")
else:
    print("Standard delivery: ₹40")`, true)}
  <p class="body">Python checks each condition top to bottom and runs the first one that's true, skipping the rest, then falls to <code class="inl">else</code> only if nothing matched. Indentation (four spaces, consistently) is how Python knows which lines belong to which branch, there are no curly braces.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Inconsistent indentation.</b> Python treats indentation as meaningful structure, not just style; mixing tabs and spaces or uneven indents causes real errors.</li>
    <li><b>Using <code class="inl">if</code> repeatedly instead of <code class="inl">elif</code>.</b> Several standalone <code class="inl">if</code>s all get checked even after one matches; <code class="inl">elif</code> stops at the first true branch.</li>
  </ul></div>
  <div class="sec-num">5.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">if</code>/<code class="inl">elif</code>/<code class="inl">else</code> runs the first matching branch and skips the rest. Indentation defines which code belongs to which branch.</p>
  ${qPy('q1', 'easy', 'Given <code class="inl">rating = 3.2</code>, set <code class="inl">label</code> to "Needs improvement" if rating &lt; 3.5, "Good" if rating &lt; 4.5, otherwise "Excellent".',
`rating = 3.2
# set label based on rating here
`,
`assert label == "Needs improvement", f"expected 'Needs improvement', got {label!r}"
print("${PASS_TOKEN}")`,
`rating = 3.2
if rating < 3.5:
    label = "Needs improvement"
elif rating < 4.5:
    label = "Good"
else:
    label = "Excellent"
print(label)`,
    'Check the smallest threshold first, in an if, then elif for the next.')}
`
};

lessons['06'] = {
  short: 'while loops', where: 'Part II · <b>while loops</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 06</div>
  <h2 class="title">while loops</h2>
  <p class="lead">A <code class="inl">while</code> loop repeats for as long as a condition stays true, useful when you don't know in advance exactly how many times you'll need to repeat.</p>
  <hr class="rule">
  ${ed(`minutes_left = 5
while minutes_left > 0:
    print(f"{minutes_left} minutes until delivery")
    minutes_left -= 1
print("Delivered!")`, true)}
  <p class="body">Each pass through the loop, Python re-checks the condition; the moment it's false, the loop stops. Something inside the loop (here, <code class="inl">minutes_left -= 1</code>) needs to actually move the condition toward becoming false, or the loop runs forever.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting to update the condition variable.</b> This creates an infinite loop, one of the most common early bugs.</li>
    <li><b>Using <code class="inl">while</code> when you actually know the exact count in advance.</b> A <code class="inl">for</code> loop (next chapter) is usually clearer for that case.</li>
  </ul></div>
  <div class="sec-num">6.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A while loop repeats as long as its condition is true, re-checked every pass. Something inside the loop must eventually make the condition false.</p>
  ${qPy('q1', 'med', 'Starting from <code class="inl">total = 0</code> and <code class="inl">batches = 0</code>, keep adding 50 to total and incrementing batches until total reaches at least 500.',
`total = 0
batches = 0
# use a while loop to add 50 to total and increment batches, until total >= 500
`,
`assert total >= 500, "total should be at least 500"
assert batches == 10, f"expected 10 batches, got {batches}"
print("${PASS_TOKEN}")`,
`total = 0
batches = 0
while total < 500:
    total += 50
    batches += 1
print(total, batches)`,
    'while total < 500: ... increment both total and batches inside the loop.')}
`
};

lessons['07'] = {
  short: 'for loops & range()', where: 'Part II · <b>for loops and range()</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 07</div>
  <h2 class="title">for loops and range()</h2>
  <p class="lead">A <code class="inl">for</code> loop repeats once per item in a sequence, the most common kind of loop you'll write.</p>
  <hr class="rule">
  ${ed(`totals = [450, 610, 300, 720]
total_sum = 0
for t in totals:
    total_sum += t
print(total_sum)

for i in range(3):
    print("Delivery attempt", i + 1)`, true)}
  <p class="body"><code class="inl">range(n)</code> produces the numbers 0 up to (but not including) n, useful whenever you need to repeat something a specific number of times rather than iterate real data.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming <code class="inl">range(3)</code> includes 3.</b> It produces 0, 1, 2, the endpoint is exclusive, exactly the boundary-value kind of mistake covered in the QA course.</li>
    <li><b>Trying to modify a list while looping over it directly.</b> This can skip items unpredictably; build a new list instead when filtering or transforming.</li>
  </ul></div>
  <div class="sec-num">7.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A for loop runs once per item in a sequence. <code class="inl">range(n)</code> generates 0 through n-1, handy for repeating something a fixed number of times.</p>
  ${qPy('q1', 'easy', 'Given <code class="inl">totals = [120, 340, 275, 90]</code>, use a for loop to compute <code class="inl">total_sum</code>, the sum of all values.',
`totals = [120, 340, 275, 90]
total_sum = 0
# loop through totals, adding each to total_sum
`,
`assert total_sum == 825, f"expected 825, got {total_sum}"
print("${PASS_TOKEN}")`,
`totals = [120, 340, 275, 90]
total_sum = 0
for t in totals:
    total_sum += t
print(total_sum)`,
    'for t in totals: total_sum += t')}
`
};

lessons['08'] = {
  short: 'break, continue, patterns', where: 'Part II · <b>break, continue, and loop patterns</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 08</div>
  <h2 class="title">break, continue, and loop patterns</h2>
  <p class="lead"><code class="inl">break</code> exits a loop immediately; <code class="inl">continue</code> skips straight to the next iteration without exiting.</p>
  <hr class="rule">
  ${ed(`restaurants = [("Domino's", 4.8), ("McDonald's", 4.5), ("KFC", 4.3)]
for name, rating in restaurants:
    if rating > 4.5:
        print(f"Found: {name}")
        break
else:
    print("Nothing found")`, true)}
  <p class="body"><code class="inl">break</code> is useful once you've found what you're looking for and don't need to keep checking the rest. <code class="inl">continue</code> is useful for skipping items that don't apply, without writing a large nested <code class="inl">if</code> around the rest of the loop body.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Confusing <code class="inl">break</code> and <code class="inl">continue</code>.</b> <code class="inl">break</code> stops the whole loop; <code class="inl">continue</code> only skips the current pass and keeps looping.</li>
  </ul></div>
  <div class="sec-num">8.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">break</code> exits a loop entirely. <code class="inl">continue</code> skips the rest of the current pass and moves to the next one.</p>
  ${qPy('q1', 'med', 'Given <code class="inl">totals = [450, 0, 300, 0, 720]</code>, sum only the non-zero values into <code class="inl">total_sum</code>, skipping zeros with <code class="inl">continue</code>.',
`totals = [450, 0, 300, 0, 720]
total_sum = 0
# loop through totals; use continue to skip any 0 values, sum the rest
`,
`assert total_sum == 1470, f"expected 1470, got {total_sum}"
print("${PASS_TOKEN}")`,
`totals = [450, 0, 300, 0, 720]
total_sum = 0
for t in totals:
    if t == 0:
        continue
    total_sum += t
print(total_sum)`,
    'if t == 0: continue, then add the rest.')}
`
};

lessons['09'] = {
  short: 'Lists', where: 'Part III · <b>Lists</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 09</div>
  <h2 class="title">Lists</h2>
  <p class="lead">A ${term('list', 'list')} is an ordered, changeable collection, the most commonly used data structure in everyday Python.</p>
  <hr class="rule">
  ${ed(`cuisines = ["Pizza", "Burgers", "Biryani"]
print(cuisines[0])
print(cuisines[-1])
cuisines.append("Sandwiches")
print(cuisines)
print(cuisines[1:3])
print(len(cuisines))`, true)}
  <div class="qb"><div class="qb-title">Common list operations</div>
    <div class="qb-row"><span class="qb-kw kw-p">indexing</span><span class="qb-mean"><code class="inl">cuisines[0]</code> (first), <code class="inl">cuisines[-1]</code> (last)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">slicing</span><span class="qb-mean"><code class="inl">cuisines[1:3]</code> (a sub-list, end exclusive)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">.append(x)</span><span class="qb-mean">adds x to the end</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Off-by-one slicing mistakes.</b> <code class="inl">cuisines[1:3]</code> gives indexes 1 and 2, not 3, the end is exclusive, exactly like <code class="inl">range()</code>.</li>
    <li><b>Indexing past the end of a list.</b> This raises an IndexError rather than silently returning something empty.</li>
  </ul></div>
  <div class="sec-num">9.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Lists are ordered and changeable. Index with <code class="inl">[i]</code>, slice with <code class="inl">[start:end]</code> (end exclusive), and grow with <code class="inl">.append()</code>.</p>
  ${qPy('q1', 'easy', 'Given <code class="inl">totals = [450, 610, 300]</code>, append 720 to it, then compute <code class="inl">total_sum</code>, the sum of all four values.',
`totals = [450, 610, 300]
# append 720, then compute total_sum
`,
`assert totals == [450, 610, 300, 720], f"totals should be [450, 610, 300, 720], got {totals}"
assert total_sum == 2080, f"expected 2080, got {total_sum}"
print("${PASS_TOKEN}")`,
`totals = [450, 610, 300]
totals.append(720)
total_sum = sum(totals)
print(totals, total_sum)`,
    'totals.append(720), then sum(totals).')}
`
};

lessons['10'] = {
  short: 'Tuples & sets', where: 'Part III · <b>Tuples and sets</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 10</div>
  <h2 class="title">Tuples and sets</h2>
  <p class="lead">Two more collection types, each suited to a specific job a list isn't the best fit for.</p>
  <hr class="rule">
  ${ed(`location = (19.0760, 72.8777)  # tuple: latitude, longitude
print(location[0])

cities = ["Mumbai", "Delhi", "Mumbai", "Pune", "Delhi"]
unique_cities = set(cities)
print(unique_cities)
print(len(unique_cities))`, true)}
  <div class="qb"><div class="qb-title">When to reach for each</div>
    <div class="qb-row"><span class="qb-kw kw-p">Tuple</span><span class="qb-mean">an ordered, fixed collection that shouldn't change after creation, like a coordinate pair</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Set</span><span class="qb-mean">an unordered collection of unique values, perfect for removing duplicates or checking membership fast</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Trying to modify a tuple.</b> Tuples are immutable by design; attempting <code class="inl">location[0] = 5</code> raises an error.</li>
    <li><b>Expecting a set to preserve order.</b> Sets are unordered; don't rely on the order values print in.</li>
  </ul></div>
  <div class="sec-num">10.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Tuples are ordered and immutable, good for fixed groupings. Sets are unordered and automatically unique, good for deduplication and fast membership checks.</p>
  ${qPy('q1', 'easy', 'Given <code class="inl">cuisines = ["Pizza", "Burgers", "Pizza", "Biryani", "Burgers", "Biryani"]</code>, compute <code class="inl">unique_count</code>, the number of distinct cuisines.',
`cuisines = ["Pizza", "Burgers", "Pizza", "Biryani", "Burgers", "Biryani"]
# compute unique_count here
`,
`assert unique_count == 3, f"expected 3, got {unique_count}"
print("${PASS_TOKEN}")`,
`cuisines = ["Pizza", "Burgers", "Pizza", "Biryani", "Burgers", "Biryani"]
unique_count = len(set(cuisines))
print(unique_count)`,
    'len(set(cuisines))')}
`
};

lessons['11'] = {
  short: 'Dictionaries', where: 'Part III · <b>Dictionaries</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 11</div>
  <h2 class="title">Dictionaries</h2>
  <p class="lead">A ${term('dictionary', 'dictionary')} stores values under named keys, the natural way to represent one real-world "thing" with several named attributes, like one TastyGo order.</p>
  <hr class="rule">
  ${ed(`order = {"id": 101, "customer": "Aarav Sharma", "total": 450}
print(order["customer"])
print(order.get("discount", 0))  # safe access with a default
for key, value in order.items():
    print(key, "->", value)`, true)}
  <div class="qb"><div class="qb-title">Accessing values safely</div>
    <div class="qb-row"><span class="qb-kw kw-p">order["key"]</span><span class="qb-mean">raises an error if the key doesn't exist</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">order.get("key", default)</span><span class="qb-mean">returns default instead of raising an error if missing</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using <code class="inl">order["key"]</code> for a key that might not exist.</b> This raises a KeyError; <code class="inl">.get()</code> is safer when a key is optional.</li>
    <li><b>Assuming dictionary order matters for logic.</b> Modern Python does preserve insertion order for display, but code shouldn't depend on it for correctness.</li>
  </ul></div>
  <div class="sec-num">11.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Dictionaries map keys to values. Use <code class="inl">[key]</code> when you're sure the key exists, and <code class="inl">.get(key, default)</code> when it might not.</p>
  ${qPy('q1', 'easy', 'Given <code class="inl">order = {"id": 101, "customer": "Aarav Sharma", "total": 450}</code>, add a key <code class="inl">"status"</code> with value <code class="inl">"delivered"</code>.',
`order = {"id": 101, "customer": "Aarav Sharma", "total": 450}
# add a "status" key with value "delivered"
`,
`assert order.get("status") == "delivered", "order should have status='delivered'"
print("${PASS_TOKEN}")`,
`order = {"id": 101, "customer": "Aarav Sharma", "total": 450}
order["status"] = "delivered"
print(order)`,
    'order["status"] = "delivered"')}
`
};

lessons['12'] = {
  short: 'Nesting it together', where: 'Part III · <b>Nesting it all together</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 12</div>
  <h2 class="title">Nesting it all together</h2>
  <p class="lead">Real data is rarely one flat structure. A list of dictionaries, one dict per record, is exactly how you'll model TastyGo's orders throughout this course.</p>
  <hr class="rule">
  ${ed(`orders = [
    {"id": 1, "customer": "Aarav", "total": 450},
    {"id": 2, "customer": "Priya", "total": 610},
    {"id": 3, "customer": "Rohan", "total": 300},
]
total_revenue = sum(o["total"] for o in orders)
print(total_revenue)

for o in orders:
    print(f"Order #{o['id']}: {o['customer']} — ₹{o['total']}")`, true)}
  <p class="body">This should look familiar: it's the exact same shape as SQLingo's <code class="inl">orders</code> table, one row per order, one column per attribute, just represented as Python data instead of database rows. Django and FastAPI will later load real rows from a real database into structures very much like this.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting a nested access needs both levels.</b> <code class="inl">orders[0]["total"]</code> needs the list index and the dict key together; either alone gives you the wrong thing.</li>
  </ul></div>
  <div class="sec-num">12.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A list of dictionaries represents a collection of records, each with named fields, exactly the shape of a database table's rows, which Django/FastAPI will later connect to a real one.</p>
  ${qPy('q1', 'med', 'Given the <code class="inl">orders</code> list of dicts below, compute <code class="inl">aarav_total</code>, the sum of totals for orders where <code class="inl">customer == "Aarav"</code>.',
`orders = [
    {"id": 1, "customer": "Aarav", "total": 450},
    {"id": 2, "customer": "Priya", "total": 610},
    {"id": 3, "customer": "Aarav", "total": 300},
]
aarav_total = 0
# loop through orders, add up totals where customer is "Aarav"
`,
`assert aarav_total == 750, f"expected 750, got {aarav_total}"
print("${PASS_TOKEN}")`,
`orders = [
    {"id": 1, "customer": "Aarav", "total": 450},
    {"id": 2, "customer": "Priya", "total": 610},
    {"id": 3, "customer": "Aarav", "total": 300},
]
aarav_total = 0
for o in orders:
    if o["customer"] == "Aarav":
        aarav_total += o["total"]
print(aarav_total)`,
    'if o["customer"] == "Aarav": aarav_total += o["total"]')}
`
};

lessons['13'] = {
  short: 'Defining functions', where: 'Part IV · <b>Defining functions</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 13</div>
  <h2 class="title">Defining functions</h2>
  <p class="lead">A ${term('function', 'function')} packages logic under a name, so you write it once and reuse it wherever you need that behaviour.</p>
  <hr class="rule">
  ${ed(`def delivery_fee(total):
    if total >= 500:
        return 0
    return 40

print(delivery_fee(300))
print(delivery_fee(600))`, true)}
  <p class="body"><code class="inl">return</code> sends a value back to wherever the function was called, and immediately ends the function, any code after a return in that branch never runs.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using <code class="inl">print()</code> inside a function instead of <code class="inl">return</code>.</b> Printing shows a value but doesn't hand it back to the caller to use in further logic; <code class="inl">return</code> does.</li>
    <li><b>Forgetting a function with no explicit return gives back <code class="inl">None</code>.</b> This is a common source of confusing bugs downstream.</li>
  </ul></div>
  <div class="sec-num">13.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Functions are defined with <code class="inl">def</code>, take parameters, and hand a result back to the caller with <code class="inl">return</code>, ending execution immediately at that point.</p>
  ${qPy('q1', 'easy', 'Write a function <code class="inl">per_person_cost(total, people)</code> that returns total divided by people.',
`def per_person_cost(total, people):
    # your code here
    pass
`,
`assert per_person_cost(600, 3) == 200, "per_person_cost(600, 3) should be 200"
assert per_person_cost(450, 2) == 225, "per_person_cost(450, 2) should be 225"
print("${PASS_TOKEN}")`,
`def per_person_cost(total, people):
    return total / people

print(per_person_cost(600, 3))`,
    'return total / people')}
`
};

lessons['14'] = {
  short: 'Default, keyword, *args', where: 'Part IV · <b>Default, keyword, and *args/**kwargs</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 14</div>
  <h2 class="title">Default, keyword, and *args/**kwargs</h2>
  <p class="lead">Functions can accept optional parameters with sensible defaults, and even an unknown number of arguments.</p>
  <hr class="rule">
  ${ed(`def delivery_fee(total, express=False):
    fee = 0 if total >= 500 else 40
    if express:
        fee += 30
    return fee

print(delivery_fee(300))
print(delivery_fee(300, express=True))

def total_of(*amounts):
    return sum(amounts)

print(total_of(100, 200, 300))`, true)}
  <p class="body"><code class="inl">express=False</code> is a default, used automatically if the caller doesn't provide it. <code class="inl">*amounts</code> collects any number of positional arguments into a tuple, letting <code class="inl">total_of()</code> accept 2 numbers or 10 without changing its definition.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Putting a parameter without a default after one that has one.</b> Python requires defaulted parameters to come after non-defaulted ones.</li>
  </ul></div>
  <div class="sec-num">14.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Default parameter values make arguments optional. <code class="inl">*args</code> lets a function accept any number of positional arguments.</p>
  ${qPy('q1', 'med', 'Write <code class="inl">apply_discount(total, percent=10)</code> returning the discounted total (total minus percent% of total).',
`def apply_discount(total, percent=10):
    # your code here
    pass
`,
`assert apply_discount(500) == 450, "apply_discount(500) with default 10% should be 450"
assert apply_discount(500, 20) == 400, "apply_discount(500, 20) should be 400"
print("${PASS_TOKEN}")`,
`def apply_discount(total, percent=10):
    return total - total * percent / 100

print(apply_discount(500), apply_discount(500, 20))`,
    'return total - total * percent / 100')}
`
};

lessons['15'] = {
  short: 'Scope: local vs. global', where: 'Part IV · <b>Scope: local vs. global</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 15</div>
  <h2 class="title">Scope: local vs. global</h2>
  <p class="lead">A variable created inside a function only exists inside that function, unless you deliberately reach outside it.</p>
  <hr class="rule">
  ${ed(`counter = 0

def increment():
    global counter
    counter += 1

increment()
increment()
print(counter)`, true)}
  <p class="body">Without <code class="inl">global counter</code>, writing <code class="inl">counter += 1</code> inside the function would create a brand new local variable named <code class="inl">counter</code>, entirely separate from the one outside, and raise an error (since it reads before assigning). Reaching into global state from inside a function works, but relying on it heavily makes code harder to reason about, exactly what the next chapter addresses.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Expecting a variable assigned inside a function to change the outside version automatically.</b> Without <code class="inl">global</code>, it creates a separate local variable instead.</li>
  </ul></div>
  <div class="sec-num">15.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Variables created inside a function are local to it by default. <code class="inl">global</code> lets a function modify a variable defined outside it, but this should be used sparingly.</p>
  ${qMC('q1', 'easy', 'Without the <code class="inl">global counter</code> line, what would happen when <code class="inl">increment()</code> tries to run <code class="inl">counter += 1</code>?',
    ['It would work exactly the same', 'It would raise an error, since Python would treat counter as a new local variable being read before it\'s assigned', 'It would silently do nothing'],
    1, 'Without declaring counter as global, Python assumes any name assigned to inside the function is local; using += on it before it has a local value raises an UnboundLocalError.')}
`
};

lessons['16'] = {
  short: 'Clean, testable functions', where: 'Part IV · <b>Writing clean, testable functions</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 16</div>
  <h2 class="title">Writing clean, testable functions</h2>
  <p class="lead">A function that returns a value based only on its inputs, with no other side effects, is called "pure," and pure functions are dramatically easier to test.</p>
  <hr class="rule">
  ${ed(`# harder to test: relies on external state, has a side effect (printing)
running_total = 0
def add_to_total(amount):
    global running_total
    running_total += amount
    print(f"Total is now {running_total}")

# easier to test: pure, same input always gives same output
def with_tax(amount, tax_rate=0.05):
    return amount + amount * tax_rate

print(with_tax(500))`, true)}
  <p class="body">Testing <code class="inl">with_tax(500)</code> is simple: call it, check the return value. Testing <code class="inl">add_to_total</code> requires tracking global state and can't easily be re-run in isolation, exactly the kind of function the QA and Fundamentals courses' testing chapters are hardest to write reliable tests for.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Mixing calculation and side effects (like printing or modifying global state) in the same function.</b> Splitting the "compute" part from the "act on it" part makes both easier to test and reuse.</li>
  </ul></div>
  <div class="sec-num">16.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A pure function's output depends only on its inputs, with no side effects, making it easy to test in isolation. Prefer pure functions for logic; keep side effects (printing, global state) separate where possible.</p>
  ${qPy('q1', 'med', 'Rewrite this so it is pure: <code class="inl">def bad(total):\\n&nbsp;&nbsp;&nbsp;&nbsp;print(total * 1.05)</code>. Write a pure version named <code class="inl">with_tax(total)</code> that returns the result instead of printing it.',
`def with_tax(total):
    # return total with 5% tax added, don't print
    pass
`,
`assert abs(with_tax(500) - 525.0) < 0.001, "with_tax(500) should be 525.0"
print("${PASS_TOKEN}")`,
`def with_tax(total):
    return total * 1.05

print(with_tax(500))`,
    'return total * 1.05')}
`
};

lessons['17'] = {
  short: 'String methods', where: 'Part V · <b>String methods and formatting</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 17</div>
  <h2 class="title">String methods and formatting</h2>
  <p class="lead">Real-world text is messy. A handful of string methods handle almost every common cleanup task.</p>
  <hr class="rule">
  ${ed(`name = "  aarav sharma  "
print(name.strip().title())
print(name.strip().split(" "))
print("-".join(["Pizza", "Burgers", "Biryani"]))
print("TastyGo".replace("Tasty", "Yummy"))`, true)}
  <div class="qb"><div class="qb-title">Methods worth knowing well</div>
    <div class="qb-row"><span class="qb-kw kw-p">.strip()</span><span class="qb-mean">removes leading/trailing whitespace</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">.split(sep)</span><span class="qb-mean">breaks a string into a list, wherever sep occurs</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">sep.join(list)</span><span class="qb-mean">the reverse: joins a list back into one string</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting strings are immutable.</b> <code class="inl">name.strip()</code> returns a new string; it doesn't change <code class="inl">name</code> itself unless reassigned.</li>
  </ul></div>
  <div class="sec-num">17.1</div><h3 class="section-h">Recap</h3>
  <p class="body">.strip(), .split(), .join(), .replace(), and .title()/.upper()/.lower() cover the large majority of everyday string cleanup and formatting.</p>
  ${qPy('q1', 'easy', 'Given <code class="inl">raw = "  TASTYGO  "</code>, produce <code class="inl">clean</code>: stripped of whitespace and converted to title case ("Tastygo").',
`raw = "  TASTYGO  "
# compute clean here
`,
`assert clean == "Tastygo", f"expected 'Tastygo', got {clean!r}"
print("${PASS_TOKEN}")`,
`raw = "  TASTYGO  "
clean = raw.strip().title()
print(clean)`,
    'raw.strip().title()')}
`
};

lessons['18'] = {
  short: 'Reading & writing files', where: 'Part V · <b>Reading and writing files</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 18</div>
  <h2 class="title">Reading and writing files</h2>
  <p class="lead"><code class="inl">open()</code> is how Python reads from and writes to files. In this browser-based course, files live in an in-memory virtual filesystem, not your real computer, but the code is identical to what you'd run locally.</p>
  <hr class="rule">
  ${ed(`with open("orders.txt", "w") as f:
    f.write("Order 101: 450\\n")
    f.write("Order 102: 610\\n")

with open("orders.txt", "r") as f:
    print(f.read())`, true)}
  <p class="body">The <code class="inl">with</code> statement ensures the file is properly closed automatically once you're done with it, even if an error occurs partway through, the recommended way to work with files in real Python.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Opening a file without "w" or "r" mode in mind.</b> "w" overwrites existing content entirely; "a" appends instead; opening the wrong mode is a common way to accidentally lose data.</li>
    <li><b>In this course specifically: expecting a file to persist between chapters or after refreshing.</b> This browser-based filesystem is temporary and isolated to this one running session.</li>
  </ul></div>
  <div class="sec-num">18.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">with open(path, mode) as f:</code> is the standard, safe way to read or write files, automatically closing the file afterward.</p>
  ${qPy('q1', 'med', 'Write three lines to "totals.txt" (one number per line: 450, 610, 300), then read it back and count how many lines as <code class="inl">line_count</code>.',
`# write 450, 610, 300 (one per line) to totals.txt, then read it back
line_count = 0
`,
`assert line_count == 3, f"expected 3 lines, got {line_count}"
print("${PASS_TOKEN}")`,
`with open("totals.txt", "w") as f:
    f.write("450\\n610\\n300\\n")

with open("totals.txt", "r") as f:
    lines = f.readlines()
    line_count = len(lines)
print(line_count)`,
    'f.readlines() returns a list of lines; len() of that list is the count.')}
`
};

lessons['19'] = {
  short: 'try / except / finally', where: 'Part V · <b>Exceptions: try / except / finally</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 19</div>
  <h2 class="title">Exceptions: try / except / finally</h2>
  <p class="lead">An ${term('exception', 'exception')} is Python's way of signalling something went wrong while running. <code class="inl">try</code>/<code class="inl">except</code> lets you handle it deliberately instead of crashing.</p>
  <hr class="rule">
  ${ed(`def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
    finally:
        print("Attempted the division")

print(safe_divide(10, 2))
print(safe_divide(10, 0))`, true)}
  <p class="body">Code inside <code class="inl">try</code> runs normally unless an exception occurs, in which case Python jumps straight to a matching <code class="inl">except</code> block. <code class="inl">finally</code> always runs afterward, whether or not an exception occurred, useful for cleanup that must happen either way.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Catching every possible exception with a bare <code class="inl">except:</code>.</b> This can silently swallow bugs you actually wanted to know about; catch specific exception types when you can.</li>
  </ul></div>
  <div class="sec-num">19.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">try</code>/<code class="inl">except</code> catches and handles specific exceptions; <code class="inl">finally</code> always runs afterward regardless of whether one occurred.</p>
  ${qPy('q1', 'med', 'Write <code class="inl">safe_get_total(order)</code> that returns <code class="inl">order["total"]</code>, or 0 if the key is missing (catch KeyError).',
`def safe_get_total(order):
    # return order["total"], or 0 if missing
    pass
`,
`assert safe_get_total({"total": 450}) == 450
assert safe_get_total({"id": 1}) == 0
print("${PASS_TOKEN}")`,
`def safe_get_total(order):
    try:
        return order["total"]
    except KeyError:
        return 0

print(safe_get_total({"total": 450}))`,
    'try: return order["total"] / except KeyError: return 0')}
`
};

lessons['20'] = {
  short: 'Raising your own exceptions', where: 'Part V · <b>Raising your own exceptions</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 20</div>
  <h2 class="title">Raising your own exceptions</h2>
  <p class="lead">Sometimes the right response to bad input isn't a fallback value, it's refusing to continue at all, loudly and clearly.</p>
  <hr class="rule">
  ${ed(`def apply_discount(total, percent):
    if percent < 0 or percent > 100:
        raise ValueError("percent must be between 0 and 100")
    return total - total * percent / 100

try:
    apply_discount(500, 150)
except ValueError as e:
    print("Error:", e)`, true)}
  <p class="body"><code class="inl">raise</code> deliberately stops normal execution and signals a specific problem, with a message explaining what went wrong, exactly the kind of clear, actionable signal a good bug report (from the QA course) also aims for.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Silently returning a default value for genuinely invalid input.</b> This can hide a real bug much further down the line; raising an exception makes the problem visible immediately, at its source.</li>
  </ul></div>
  <div class="sec-num">20.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">raise SomeError("message")</code> deliberately stops execution to signal invalid input or a genuine problem, rather than quietly returning a fallback.</p>
  ${qPy('q1', 'hard', 'Fix <code class="inl">apply_discount(total, percent)</code> so it raises <code class="inl">ValueError</code> for a negative total, and still works correctly for valid input.',
`def apply_discount(total, percent):
    # raise ValueError if total is negative, otherwise return the discounted total
    return total - total * percent / 100
`,
`raised = False
try:
    apply_discount(-100, 10)
except ValueError:
    raised = True
assert raised, "should raise ValueError for a negative total"
assert apply_discount(500, 10) == 450, "apply_discount(500, 10) should still be 450"
print("${PASS_TOKEN}")`,
`def apply_discount(total, percent):
    if total < 0:
        raise ValueError("total cannot be negative")
    return total - total * percent / 100

print(apply_discount(500, 10))`,
    'if total < 0: raise ValueError("...")')}
`
};

lessons['21'] = {
  short: 'Classes and objects', where: 'Part VI · <b>Classes and objects</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 21</div>
  <h2 class="title">Classes and objects</h2>
  <p class="lead">A ${term('class', 'class')} is a blueprint; an object is one specific thing built from that blueprint.</p>
  <hr class="rule">
  ${ed(`class Order:
    pass

o = Order()
o.id = 101
o.total = 450
print(o.id, o.total)`, true)}
  <p class="body">This works, but it's clunky, setting attributes one at a time from outside. The next chapter shows the proper way: defining what every <code class="inl">Order</code> needs right inside the class itself.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Confusing the class itself with an object made from it.</b> <code class="inl">Order</code> is the blueprint; <code class="inl">o = Order()</code> creates one actual object (an "instance") from it. You can create many instances from one class.</li>
  </ul></div>
  <div class="sec-num">21.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A class defines a blueprint; calling it like a function (<code class="inl">Order()</code>) creates an object (an instance) from that blueprint.</p>
  ${qPy('q1', 'easy', 'Create a class <code class="inl">Restaurant</code> (empty body is fine), then create an instance <code class="inl">r</code> and set <code class="inl">r.name = "Domino\'s"</code> and <code class="inl">r.rating = 4.8</code>.',
`# define class Restaurant, create instance r, set its name and rating
`,
`assert r.name == "Domino's"
assert r.rating == 4.8
print("${PASS_TOKEN}")`,
`class Restaurant:
    pass

r = Restaurant()
r.name = "Domino's"
r.rating = 4.8
print(r.name, r.rating)`,
    'class Restaurant: pass, then r = Restaurant()')}
`
};

lessons['22'] = {
  short: '__init__, methods, self', where: 'Part VI · <b>__init__, methods, and self</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 22</div>
  <h2 class="title">__init__, methods, and self</h2>
  <p class="lead"><code class="inl">__init__</code> runs automatically whenever a new object is created, the proper place to set up its starting attributes.</p>
  <hr class="rule">
  ${ed(`class Order:
    def __init__(self, id, total):
        self.id = id
        self.total = total

    def summary(self):
        return f"Order #{self.id}: ₹{self.total}"

o = Order(101, 450)
print(o.summary())`, true)}
  <p class="body"><code class="inl">self</code> refers to the specific object a method is being called on, letting <code class="inl">summary()</code> reach that object's own <code class="inl">id</code> and <code class="inl">total</code>. Python passes it automatically, you never write it in the call itself (<code class="inl">o.summary()</code>, not <code class="inl">o.summary(o)</code>).</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting <code class="inl">self</code> as the first parameter of a method.</b> Every method needs it, even if the method doesn't otherwise use any of the object's own data.</li>
  </ul></div>
  <div class="sec-num">22.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">__init__</code> sets up a new object's initial attributes. <code class="inl">self</code>, the first parameter of every method, refers to the specific object the method was called on.</p>
  ${qPy('q1', 'med', 'Write a class <code class="inl">Restaurant</code> with <code class="inl">__init__(self, name, rating)</code> storing both, and a method <code class="inl">is_top_rated(self)</code> returning True if rating &gt;= 4.5.',
`class Restaurant:
    def __init__(self, name, rating):
        # store name and rating
        pass

    def is_top_rated(self):
        # return True if self.rating >= 4.5
        pass
`,
`r1 = Restaurant("Domino's", 4.8)
r2 = Restaurant("Burger King", 4.1)
assert r1.is_top_rated() is True
assert r2.is_top_rated() is False
print("${PASS_TOKEN}")`,
`class Restaurant:
    def __init__(self, name, rating):
        self.name = name
        self.rating = rating

    def is_top_rated(self):
        return self.rating >= 4.5

r = Restaurant("Domino's", 4.8)
print(r.is_top_rated())`,
    'self.name = name / self.rating = rating in __init__; return self.rating >= 4.5 in the method.')}
`
};

lessons['23'] = {
  short: 'Inheritance', where: 'Part VI · <b>Inheritance</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 23</div>
  <h2 class="title">Inheritance</h2>
  <p class="lead">A class can build on another class, inheriting its behaviour and adding or changing only what's different.</p>
  <hr class="rule">
  ${ed(`class Order:
    def __init__(self, total):
        self.total = total
    def final_total(self):
        return self.total

class ExpressOrder(Order):
    def __init__(self, total, express_fee):
        super().__init__(total)
        self.express_fee = express_fee
    def final_total(self):
        return self.total + self.express_fee

o = ExpressOrder(450, 30)
print(o.final_total())`, true)}
  <p class="body"><code class="inl">ExpressOrder(Order)</code> means "an ExpressOrder is an Order, plus a bit extra." <code class="inl">super().__init__(total)</code> reuses the parent class's setup instead of duplicating it, and overriding <code class="inl">final_total</code> lets the subclass behave differently where it needs to.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting to call <code class="inl">super().__init__()</code>.</b> Without it, the parent class's own setup never runs, and attributes it was supposed to set won't exist.</li>
    <li><b>Reaching for inheritance when composition would be simpler.</b> Not every relationship needs a class hierarchy; sometimes a plain attribute holding another object is clearer.</li>
  </ul></div>
  <div class="sec-num">23.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A subclass inherits from a parent class with <code class="inl">class Child(Parent):</code>, reuses parent setup via <code class="inl">super()</code>, and can override methods to change specific behaviour.</p>
  ${qPy('q1', 'hard', 'Given the <code class="inl">Order</code> class below, write <code class="inl">DiscountedOrder(Order)</code> that takes an extra <code class="inl">discount</code> parameter and overrides <code class="inl">final_total</code> to subtract it.',
`class Order:
    def __init__(self, total):
        self.total = total
    def final_total(self):
        return self.total

class DiscountedOrder(Order):
    def __init__(self, total, discount):
        # call super().__init__ and store discount
        pass
    def final_total(self):
        # return self.total - self.discount
        pass
`,
`d = DiscountedOrder(500, 50)
assert d.final_total() == 450, f"expected 450, got {d.final_total()}"
print("${PASS_TOKEN}")`,
`class Order:
    def __init__(self, total):
        self.total = total
    def final_total(self):
        return self.total

class DiscountedOrder(Order):
    def __init__(self, total, discount):
        super().__init__(total)
        self.discount = discount
    def final_total(self):
        return self.total - self.discount

d = DiscountedOrder(500, 50)
print(d.final_total())`,
    'super().__init__(total) in __init__, then return self.total - self.discount.')}
`
};

lessons['24'] = {
  short: 'Dataclasses & when OOP helps', where: 'Part VI · <b>Dataclasses, and when OOP helps</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 24</div>
  <h2 class="title">Dataclasses, and when OOP helps</h2>
  <p class="lead">For classes that mostly just hold data, <code class="inl">@dataclass</code> writes the boilerplate <code class="inl">__init__</code> for you.</p>
  <hr class="rule">
  ${ed(`from dataclasses import dataclass

@dataclass
class Order:
    id: int
    total: float

o = Order(101, 450)
print(o)
print(o.total)`, true)}
  <p class="body">This is exactly equivalent to writing <code class="inl">__init__(self, id, total): self.id = id; self.total = total</code> by hand, plus a readable default printed representation, for free. Reach for a full class with real methods when an object needs actual behaviour attached to it; reach for a dataclass, or even just a plain dictionary, when it's really just a bundle of related values.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Building an elaborate class hierarchy for something that's really just data.</b> Not every problem needs OOP; a dictionary or dataclass is often clearer and simpler for pure data with no real behaviour attached.</li>
  </ul></div>
  <div class="sec-num">24.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">@dataclass</code> removes boilerplate for data-holding classes. Choose the simplest structure that fits: a dict, a dataclass, or a full class with methods, roughly in that order of complexity.</p>
  ${qPy('q1', 'easy', 'Using <code class="inl">@dataclass</code>, define <code class="inl">Restaurant</code> with fields <code class="inl">name: str</code> and <code class="inl">rating: float</code>. Create one with name "KFC" and rating 4.3.',
`from dataclasses import dataclass

# define the Restaurant dataclass here
r = None
`,
`assert r.name == "KFC"
assert r.rating == 4.3
print("${PASS_TOKEN}")`,
`from dataclasses import dataclass

@dataclass
class Restaurant:
    name: str
    rating: float

r = Restaurant("KFC", 4.3)
print(r)`,
    '@dataclass above the class, then list fields as name: type.')}
`
};

lessons['25'] = {
  short: 'Modules and imports', where: 'Part VII · <b>Modules and imports</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 25</div>
  <h2 class="title">Modules and imports</h2>
  <p class="lead">A ${term('module', 'module')} is just a Python file. <code class="inl">import</code> makes its contents available in your own code, whether it's the standard library or a file you wrote yourself.</p>
  <hr class="rule">
  ${ed(`import math
import random

print(math.sqrt(16))
print(round(math.pi, 2))

random.seed(1)
print(random.randint(1, 6))`, true)}
  <p class="body">Python ships with a large standard library (math, random, datetime, json, and many more) covering common needs without installing anything extra, exactly what's being imported above. For code beyond the standard library, <code class="inl">pip</code> (next chapter) installs it.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Writing <code class="inl">sqrt(16)</code> instead of <code class="inl">math.sqrt(16)</code>.</b> A regular <code class="inl">import math</code> requires the module name as a prefix; only <code class="inl">from math import sqrt</code> lets you drop it.</li>
  </ul></div>
  <div class="sec-num">25.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">import</code> brings in a module's contents, standard library or otherwise. Python's standard library already covers a large range of common needs.</p>
  ${qPy('q1', 'easy', 'Use the <code class="inl">math</code> module to compute <code class="inl">rounded</code>, the value of pi rounded to 3 decimal places.',
`import math
# compute rounded here
`,
`assert rounded == 3.142, f"expected 3.142, got {rounded}"
print("${PASS_TOKEN}")`,
`import math
rounded = round(math.pi, 3)
print(rounded)`,
    'round(math.pi, 3)')}
`
};

lessons['26'] = {
  short: 'pip and virtual environments', where: 'Part VII · <b>pip and virtual environments</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 26</div>
  <h2 class="title">pip and virtual environments</h2>
  <p class="lead">This chapter is conceptual: these are real terminal commands, run on your own machine, not something to execute in this browser-based course.</p>
  <hr class="rule">
  <p class="body">${term('pip', 'pip')} installs third-party packages from PyPI (the Python Package Index). A ${term('virtual_environment', 'virtual environment')} keeps one project's installed packages separate from every other project on the same machine, so they can't silently conflict with each other's required versions.</p>
  <pre class="code">python -m venv venv                 # create a virtual environment named "venv"
source venv/bin/activate            # activate it (Windows: venv\\Scripts\\activate)
pip install requests                # install a package into this environment only
pip freeze > requirements.txt       # record exact installed versions</pre>
  <p class="body">Anyone else working on the project runs <code class="inl">pip install -r requirements.txt</code> to install the exact same versions, avoiding "it works on my machine" bugs, exactly the version-pinning idea covered in the Fundamentals course.</p>
  <div class="analogy"><div class="lab">Note for this course specifically</div><div class="txt">This browser-based Python (Pyodide) has its own separate mechanism (called micropip) for installing pure-Python packages inside the page itself. It's a close cousin of pip, built specifically for this WebAssembly environment, but the venv/pip workflow above is what you'll actually use once you're writing Python on your own machine, including in the Django and FastAPI courses ahead.</div></div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Installing packages globally instead of inside a virtual environment.</b> This can cause different projects on the same machine to silently conflict over incompatible versions of the same package.</li>
    <li><b>Forgetting to activate the virtual environment before installing.</b> A "successful" install can silently go to the wrong place if the venv isn't active.</li>
  </ul></div>
  <div class="sec-num">26.1</div><h3 class="section-h">Recap</h3>
  <p class="body">pip installs packages; a virtual environment isolates a project's installed packages from every other project, and a requirements.txt file records exact versions for teammates to reproduce.</p>
  ${qMC('q1', 'easy', 'Why create a separate virtual environment for each Python project, instead of installing everything globally?',
    ['It makes packages install faster', 'It keeps each project\'s installed package versions isolated, so different projects can\'t silently conflict', 'Virtual environments are required by Python to run any code at all'],
    1, 'Isolation is the entire point: without it, two projects needing different versions of the same package on one machine would conflict.')}
  ${qMC('q2', 'med', 'What is the purpose of a requirements.txt file?',
    ['It stores the project\'s source code', 'It records the exact package versions used, so others can install the identical set with one command', 'It is required for Python syntax to be valid'],
    1, 'requirements.txt lets pip install -r reproduce the exact same dependency versions elsewhere, avoiding version-mismatch bugs across machines.')}
`
};

lessons['27'] = {
  short: 'Working with JSON', where: 'Part VII · <b>Working with JSON</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 27</div>
  <h2 class="title">Working with JSON</h2>
  <p class="lead">${term('json', 'JSON')} is how nearly every real API sends and receives data, and Python's <code class="inl">json</code> module converts between it and native Python structures effortlessly.</p>
  <hr class="rule">
  ${ed(`import json

response_text = '{"id": 101, "customer": "Aarav Sharma", "total": 450}'
order = json.loads(response_text)
print(order["customer"])

back_to_text = json.dumps(order)
print(back_to_text)`, true)}
  <div class="qb"><div class="qb-title">The two directions</div>
    <div class="qb-row"><span class="qb-kw kw-p">json.loads(text)</span><span class="qb-mean">JSON text &rarr; Python data (dict/list)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">json.dumps(data)</span><span class="qb-mean">Python data &rarr; JSON text</span></div>
  </div>
  <p class="body">This is exactly what happens under the hood whenever your code calls a real API, like TastyGo's own backend: the response arrives as JSON text, and <code class="inl">json.loads()</code> turns it into normal Python dictionaries and lists you can work with directly.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Confusing loads and dumps.</b> "loads" loads JSON text into Python; "dumps" dumps Python data out as JSON text. Easy to mix up at first.</li>
  </ul></div>
  <div class="sec-num">27.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">json.loads()</code> parses JSON text into Python data; <code class="inl">json.dumps()</code> converts Python data back into JSON text, the exchange format almost every real API uses.</p>
  ${qPy('q1', 'med', 'Given a JSON string representing a list of orders, parse it and compute <code class="inl">total_revenue</code>, the sum of all "total" values.',
`import json

response_text = '[{"id": 1, "total": 450}, {"id": 2, "total": 610}, {"id": 3, "total": 300}]'
# parse response_text, then compute total_revenue
`,
`assert total_revenue == 1360, f"expected 1360, got {total_revenue}"
print("${PASS_TOKEN}")`,
`import json

response_text = '[{"id": 1, "total": 450}, {"id": 2, "total": 610}, {"id": 3, "total": 300}]'
orders = json.loads(response_text)
total_revenue = sum(o["total"] for o in orders)
print(total_revenue)`,
    'json.loads(response_text) gives a list of dicts; sum the "total" values.')}
`
};

lessons['28'] = {
  short: 'Testing with assert', where: 'Part VIII · <b>Testing your code with assert</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 28</div>
  <h2 class="title">Testing your code with assert</h2>
  <p class="lead">Every "Run &amp; Check" exercise in this course has been doing exactly this behind the scenes: running your code, then asserting it behaves correctly.</p>
  <hr class="rule">
  ${ed(`def add_delivery_fee(total):
    return total + 40 if total < 500 else total

def test_add_delivery_fee():
    assert add_delivery_fee(300) == 340
    assert add_delivery_fee(600) == 600
    print("All tests passed!")

test_add_delivery_fee()`, true)}
  <p class="body">An <code class="inl">assert</code> statement does nothing if its condition is true, and raises an <code class="inl">AssertionError</code> immediately if it's false, exactly the mechanism the Fundamentals and QA courses' unit-testing chapters described conceptually. In real projects, tools like <code class="inl">pytest</code> automatically discover and run every test function like this across a whole codebase, reporting a clear pass/fail summary instead of you calling each one by hand.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Writing only one assert per test, covering only the "normal" case.</b> Just like the QA course's positive/negative testing principle, a good test checks edge cases and invalid input too, not just the happy path.</li>
  </ul></div>
  <div class="sec-num">28.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">assert condition</code> raises an error if the condition is false. Real projects use tools like pytest to automatically discover and run many such test functions across a codebase.</p>
  ${qPy('q1', 'med', 'Given <code class="inl">calculate_total(price, qty)</code> below, write at least two assert statements testing it for different inputs, then print "All tests passed!" if they all hold.',
`def calculate_total(price, qty):
    return price * qty

# write at least two assert statements here, then print "All tests passed!"
`,
`assert calculate_total(100, 3) == 300
assert calculate_total(50, 1) == 50
print("${PASS_TOKEN}")`,
`def calculate_total(price, qty):
    return price * qty

assert calculate_total(100, 3) == 300
assert calculate_total(50, 1) == 50
print("All tests passed!")`,
    'assert calculate_total(100, 3) == 300, then another with different numbers.')}
`
};

lessons['29'] = {
  short: 'Django vs. FastAPI', where: 'Part VIII · <b>Where to go next: Django vs. FastAPI</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 29</div>
  <h2 class="title">Where to go next: Django vs. FastAPI</h2>
  <p class="lead">Everything in this course, variables, control flow, data structures, functions, classes, modules, was building toward being able to actually read and write a real web framework's code without the language itself getting in the way.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">What's ahead</div>
    <div class="qb-row"><span class="qb-kw kw-p">Django</span><span class="qb-mean">a full-featured framework: models (classes representing database tables, building directly on this course's OOP chapters), an admin panel, templates, all included</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">FastAPI</span><span class="qb-mean">a lean framework focused on APIs, leaning heavily on this course's function and JSON chapters, returning Python dictionaries that become JSON responses automatically</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">DevOps</span><span class="qb-mean">deploying whichever you build, using the reverse proxy, container, and CI/CD concepts from the Fundamentals course, in real depth</span></div>
  </div>
  <p class="body">Both frameworks assume you're comfortable with everything in this course: defining functions and classes, working with dictionaries and lists, handling exceptions, and importing modules. If any of that still feels shaky, revisiting a chapter now costs far less time than getting stuck deep inside a framework later.</p>
  <div class="sec-num">29.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This course built real, hands-on fluency in Python itself. Django and FastAPI, taught next, are two different ways of using that same language to build a real backend, with DevOps covering how to actually ship it.</p>
  ${qMC('q1', 'easy', 'Which Python concept from this course does FastAPI lean on especially heavily, given it returns data that becomes JSON responses?',
    ['Inheritance', 'Dictionaries and the json module', 'While loops'],
    1, 'FastAPI\'s core job is accepting and returning structured data as JSON, which maps directly onto this course\'s dictionary and json.loads/dumps chapters.')}
  ${qMC('q2', 'med', 'Why does this course recommend being comfortable with functions, classes, and exceptions before starting Django or FastAPI?',
    ['Frameworks don\'t actually use any of these concepts', 'Both frameworks are built using these exact concepts, so shakiness here makes learning the framework itself much harder', 'These concepts are only relevant for the DevOps course'],
    1, 'Django and FastAPI are Python code through and through, built from functions, classes, and (in FastAPI\'s case especially) careful data handling, so fluency here directly determines how smoothly the framework courses go.')}
`
};

/* ---------- cheat sheet ---------- */
const CHEATS = {
  '00': { note: 'Python is a widely used, readable, interpreted language, and the foundation for the Django and FastAPI courses ahead.' },
  '0b': { note: 'TastyGo orders will be modeled as Python dictionaries throughout this course, foreshadowing Django/FastAPI\'s real database models.' },
  '0i': { note: 'Playground blocks are free experimentation. Practice blocks ("Run & Check") execute your code against hidden checks.' },
  '01': { code: 'x = 450          # int\nx = 4.8          # float\nx = "text"       # str\nx = True         # bool\ntype(x)          # check a variable\'s type' },
  '02': { code: '2 + 2      # addition\n"a" + "b"  # concatenation\n10 / 3     # 3.333... (true division)\n10 // 3    # 3 (floor division)\n10 % 3     # 1 (remainder)' },
  '03': { code: 'name = "Priya"\nprint(f"Hello, {name}!")   # f-string embeds variables directly' },
  '04': { code: '==, !=, >, <, >=, <=   # comparisons, produce True/False\nand, or, not           # combine/invert booleans' },
  '05': { code: 'if condition:\n    ...\nelif other_condition:\n    ...\nelse:\n    ...\n# runs the first branch that matches, skips the rest' },
  '06': { code: 'while condition:\n    ...   # repeats as long as condition is true; update something inside so it eventually becomes false' },
  '07': { code: 'for item in sequence:\n    ...\nfor i in range(n):   # 0 .. n-1, end exclusive\n    ...' },
  '08': { code: 'break      # exits the loop entirely\ncontinue   # skips to the next iteration' },
  '09': { code: 'lst[0], lst[-1]     # index (first, last)\nlst[1:3]            # slice (end exclusive)\nlst.append(x)       # add to the end' },
  '10': { code: '(a, b)          # tuple: ordered, immutable\nset([a, b, a])  # set: unordered, automatically unique' },
  '11': { code: 'd["key"]              # raises KeyError if missing\nd.get("key", default) # safe, returns default if missing\nd.items()             # key, value pairs' },
  '12': { code: 'orders = [{"id":1,"total":450}, ...]\nsum(o["total"] for o in orders)   # nested access: list of dicts' },
  '13': { code: 'def name(params):\n    ...\n    return value   # ends the function, sends value back to the caller' },
  '14': { code: 'def f(x, y=10):        # default parameter\n    ...\ndef f(*args):          # collects extra positional args into a tuple\n    return sum(args)' },
  '15': { code: 'x = 0\ndef f():\n    global x   # without this, x += 1 inside f() creates a new local variable instead' },
  '16': { code: 'A pure function\'s output depends only on its inputs, no side effects (printing, global state) — much easier to test in isolation.' },
  '17': { code: 's.strip()          # remove whitespace\ns.split(sep)       # string -> list\nsep.join(lst)      # list -> string\ns.replace(a, b)    # substitution' },
  '18': { code: 'with open(path, "w") as f:\n    f.write(...)\nwith open(path, "r") as f:\n    f.read()   # "with" auto-closes the file' },
  '19': { code: 'try:\n    ...\nexcept SpecificError:\n    ...\nfinally:\n    ...   # always runs, error or not' },
  '20': { code: 'raise ValueError("message")   # deliberately stops execution to signal a real problem' },
  '21': { code: 'class Name:\n    ...\nobj = Name()   # Name is the blueprint; obj is one instance made from it' },
  '22': { code: 'class Name:\n    def __init__(self, x):\n        self.x = x\n    def method(self):\n        return self.x   # self = the specific object' },
  '23': { code: 'class Child(Parent):\n    def __init__(self, x, y):\n        super().__init__(x)   # reuse parent setup\n        self.y = y' },
  '24': { code: 'from dataclasses import dataclass\n@dataclass\nclass Name:\n    field: type   # auto-generates __init__ for data-holding classes' },
  '25': { code: 'import math, random   # standard library, no install needed\nmath.sqrt(16), random.randint(1, 6)' },
  '26': { code: 'python -m venv venv\nsource venv/bin/activate\npip install requests\npip freeze > requirements.txt' },
  '27': { code: 'import json\njson.loads(text)   # JSON text -> Python data\njson.dumps(data)   # Python data -> JSON text' },
  '28': { code: 'assert condition   # raises AssertionError if false; real projects use pytest to run many of these automatically' },
  '29': { code: 'Django = full-featured framework (models/admin/templates). FastAPI = lean, API-focused, JSON in/out. DevOps = deploying either.' },
};
function renderCheatsheet() {
  let h = `<div class="eyebrow">Quick reference</div>
  <h2 class="title">Cheat sheet</h2>
  <p class="lead">Every chapter's core idea on one page.</p>
  <button class="pg-btn pg-ghost" style="margin:6px 0 10px" onclick="window.print()">Print / save as PDF</button>
  <hr class="rule">`;
  manifest.forEach(g => {
    const built = g.items.filter(it => CHEATS[it[0]]);
    if (!built.length) return;
    h += `<div class="cheat-group"><h3 class="section-h" style="margin-top:26px">${g.p}</h3>`;
    built.forEach(it => {
      const n = it[0], t = it[1]; const c = CHEATS[n];
      h += `<div class="cheat-card"><div class="cheat-card-h"><span class="ch">${n}</span> ${t}</div>${c.code ? `<pre class="code" style="white-space:pre-wrap;">${escapeHtml(c.code)}</pre>` : ''}${c.note ? `<div class="q-hint">${c.note}</div>` : ''}</div>`;
    });
    h += `</div>`;
  });
  return h;
}
lessons['cheatsheet'] = { short: 'Cheat sheet', where: '<b>Cheat sheet</b>', render: renderCheatsheet };

/* ---------- interview questions & answers ---------- */
function iq(level, q, a) { const cls = level === 'Beginner' ? 'lv-e' : level === 'Intermediate' ? 'lv-m' : 'lv-h'; return `<details class="iq"><summary><span class="q-lvl ${cls}">${level}</span><span class="iq-q">${q}</span></summary><div class="iq-a">${a}</div></details>`; }
function renderInterview() {
  const legb = `<div class="iq-flow"><span>Local</span><i>&rarr;</i><span>Enclosing</span><i>&rarr;</i><span>Global</span><i>&rarr;</i><span>Built-in</span></div>`;
  const bigO = `<table class="iq-table"><thead><tr><th>Operation</th><th>list</th><th>dict / set</th></tr></thead><tbody>
    <tr><td>Index / key lookup</td><td>O(1) by index</td><td>O(1) average</td></tr>
    <tr><td>Membership (<code class="inl">x in ...</code>)</td><td>O(n)</td><td>O(1) average</td></tr>
    <tr><td>Append / add</td><td>O(1) amortized</td><td>O(1) average</td></tr>
    <tr><td>Insert / delete at front</td><td>O(n)</td><td>&mdash;</td></tr></tbody></table>`;
  return `
  <div class="eyebrow">Interview prep</div>
  <h2 class="title">Python interview questions</h2>
  <p class="lead">A deep, topic-by-topic bank of the Python questions asked in real interviews, from first-job screens to senior rounds. Every answer is short, correct, and points at the reasoning an interviewer wants to hear. Click any question to expand it.</p>
  <button class="pg-btn pg-ghost" style="margin:6px 0 10px" onclick="window.print()">Print / save as PDF</button>
  <hr class="rule">

  <h3 class="section-h">Core types &amp; data structures</h3>
  ${iq('Beginner','List vs tuple?',`<p>A <code class="inl">list</code> is mutable; a <code class="inl">tuple</code> is immutable and hashable (usable as a dict key or set member). Use lists for growing homogeneous collections, tuples for fixed records and safe "won't change" data.</p>`)}
  ${iq('Beginner','Mutable vs immutable types, and the default-argument trap?',`<p>Immutable: <code class="inl">int, float, str, bool, tuple, frozenset</code>. Mutable: <code class="inl">list, dict, set</code>. A default is evaluated once at definition, so a mutable default is shared across calls:</p><pre class="code">def add(x, bucket=None):   # not bucket=[]
    if bucket is None: bucket = []
    bucket.append(x); return bucket</pre>`)}
  ${iq('Beginner','List vs set vs dict &mdash; when to use each?',`<p><b>list</b>: ordered, allows duplicates, index access. <b>set</b>: unordered, unique, fast membership. <b>dict</b>: key&rarr;value map, fast lookup by key. Reach for a set/dict when you need fast <code class="inl">in</code> tests or de-duplication.</p>`)}
  ${iq('Beginner','is vs == ?',`<p><code class="inl">==</code> compares values; <code class="inl">is</code> compares identity (same object). Use <code class="inl">==</code> for values and <code class="inl">is</code> only for singletons like <code class="inl">None</code>. Relying on <code class="inl">is</code> for ints/strings is a trap due to interning/caching.</p>`)}
  ${iq('Beginner','Why are strings immutable, and what does that imply?',`<p>A <code class="inl">str</code> can't be changed in place; "modifying" one creates a new object. This makes strings hashable (dict keys) and safe to share, but means building a big string with repeated <code class="inl">+=</code> is O(n&sup2;) &mdash; use <code class="inl">"".join(parts)</code> instead.</p>`)}
  ${iq('Intermediate','What numeric and truthiness rules are worth knowing?',`<p>Integers are arbitrary precision. Falsy values include <code class="inl">0, 0.0, "", [], {}, set(), None, False</code>; almost everything else is truthy. Prefer explicit checks (<code class="inl">if items:</code> for "non-empty", <code class="inl">if x is None:</code> for None).</p>`)}

  <h3 class="section-h" style="margin-top:26px">Functions &amp; scope</h3>
  ${iq('Beginner','Explain *args and **kwargs.',`<p><code class="inl">*args</code> gathers extra positional args into a tuple; <code class="inl">**kwargs</code> gathers extra keyword args into a dict. They also unpack at call sites (<code class="inl">f(*nums, **opts)</code>).</p>`)}
  ${iq('Intermediate','How does Python resolve a name (scope)?',`<p>It searches scopes in <b>LEGB</b> order:</p>${legb}<p>To reassign a name from an outer scope use <code class="inl">nonlocal</code> (enclosing) or <code class="inl">global</code>.</p>`)}
  ${iq('Intermediate','What is a closure, and the late-binding loop trap?',`<p>A closure is an inner function that remembers variables from its enclosing scope. Closures capture the <b>variable</b>, not its value, so loops surprise people:</p><pre class="code">fns = [lambda i=i: i for i in range(3)]  # 0,1,2 via default-arg capture</pre>`)}
  ${iq('Intermediate','What is a decorator?',`<p>A callable that takes a function and returns a wrapped one, adding behaviour (logging, timing, auth) without editing the original. Use <code class="inl">functools.wraps</code> to preserve metadata.</p><pre class="code">from functools import wraps
def timed(fn):
    @wraps(fn)
    def inner(*a, **k): return fn(*a, **k)
    return inner</pre>`)}
  ${iq('Intermediate','What is a lambda, and when should you avoid it?',`<p>A small anonymous single-expression function, handy as a <code class="inl">key=</code> for sorting or a quick callback. Avoid assigning a lambda to a name (use <code class="inl">def</code>) or writing complex logic in one &mdash; readability suffers.</p>`)}
  ${iq('Advanced','What does "functions are first-class objects" mean?',`<p>Functions can be passed as arguments, returned from other functions, and stored in data structures &mdash; which is exactly what enables decorators, callbacks, and higher-order functions like <code class="inl">map</code>/<code class="inl">filter</code>/<code class="inl">sorted(key=...)</code>.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Iteration &amp; comprehensions</h3>
  ${iq('Beginner','What are list, dict and set comprehensions?',`<pre class="code">squares = [n*n for n in range(5)]
evens   = [n for n in range(10) if n % 2 == 0]
by_id   = {u.id: u for u in users}
uniq    = {w.lower() for w in words}</pre>`)}
  ${iq('Intermediate','Iterable vs iterator?',`<p>An <b>iterable</b> can be looped over (has <code class="inl">__iter__</code>); an <b>iterator</b> produces items one at a time (has <code class="inl">__next__</code> and raises <code class="inl">StopIteration</code>). <code class="inl">for</code> calls <code class="inl">iter()</code> on an iterable to get an iterator.</p>`)}
  ${iq('Intermediate','What is a generator, and why use yield?',`<p>A generator produces values lazily, one at a time, in constant memory &mdash; ideal for large or infinite streams. Each <code class="inl">yield</code> pauses and resumes on the next request.</p><pre class="code">def first_n(n):
    i = 0
    while i &lt; n:
        yield i; i += 1</pre>`)}
  ${iq('Intermediate','Generator expression vs list comprehension?',`<p>Same syntax, but <code class="inl">(x for x in ...)</code> is lazy and memory-light, while <code class="inl">[x for x in ...]</code> builds the whole list. Use a generator when you only iterate once or the data is large (e.g. <code class="inl">sum(x*x for x in nums)</code>).</p>`)}
  ${iq('Beginner','What do enumerate and zip do?',`<p><code class="inl">enumerate(xs)</code> yields <code class="inl">(index, value)</code> pairs; <code class="inl">zip(a, b)</code> yields tuples pairing items from several iterables. Both are lazy and more Pythonic than manual indexing.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Object-oriented Python</h3>
  ${iq('Beginner','Class attribute vs instance attribute?',`<p>A class attribute is shared by all instances (defined in the class body); an instance attribute is per-object (usually set in <code class="inl">__init__</code>). A mutable class attribute shared accidentally is a common bug.</p>`)}
  ${iq('Intermediate','staticmethod vs classmethod vs instance method?',`<pre class="code">class C:
    def m(self): ...          # instance (self)
    @classmethod
    def make(cls): ...         # class (cls) - factories
    @staticmethod
    def util(x): ...           # no implicit first arg</pre>`)}
  ${iq('Intermediate','__init__ vs __new__?',`<p><code class="inl">__new__</code> creates and returns the instance; <code class="inl">__init__</code> initialises the already-created instance. You rarely override <code class="inl">__new__</code> &mdash; mainly for immutable types or singletons.</p>`)}
  ${iq('Intermediate','__str__ vs __repr__?',`<p><code class="inl">__str__</code> is the friendly, user-facing string (<code class="inl">print</code>); <code class="inl">__repr__</code> is the unambiguous, developer-facing one (REPL, debugging) &mdash; ideally something that could recreate the object. Define <code class="inl">__repr__</code> at least.</p>`)}
  ${iq('Advanced','How does inheritance and the MRO / super() work?',`<p>Python uses the C3 linearisation to order base classes (the <b>MRO</b>, visible via <code class="inl">Cls.__mro__</code>). <code class="inl">super()</code> follows that order, which is what makes cooperative multiple inheritance and mixins work correctly.</p>`)}
  ${iq('Intermediate','What is a property?',`<p>The <code class="inl">@property</code> decorator exposes a method as a read-only (or managed) attribute, letting you add validation or computed values without changing the calling code.</p><pre class="code">class C:
    @property
    def area(self): return self.w * self.h</pre>`)}
  ${iq('Advanced','What are dataclasses and __slots__ for?',`<p><code class="inl">@dataclass</code> auto-generates <code class="inl">__init__</code>, <code class="inl">__repr__</code>, <code class="inl">__eq__</code> from typed fields &mdash; less boilerplate for data-holding classes. <code class="inl">__slots__</code> replaces the per-instance <code class="inl">__dict__</code> to save memory and speed attribute access, at the cost of dynamic attributes.</p>`)}
  ${iq('Advanced','What is duck typing?',`<p>"If it walks like a duck..." &mdash; Python cares about whether an object has the needed methods/behaviour, not its declared type. This favours protocols/ABCs over rigid type checks and underpins Python's flexibility.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Errors &amp; context managers</h3>
  ${iq('Beginner','How does try/except/else/finally work?',`<p><code class="inl">try</code> runs code; <code class="inl">except</code> handles specific exceptions; <code class="inl">else</code> runs if no exception; <code class="inl">finally</code> always runs (cleanup). Catch specific exceptions, not a bare <code class="inl">except:</code>.</p>`)}
  ${iq('Intermediate','EAFP vs LBYL?',`<p><b>EAFP</b> ("easier to ask forgiveness than permission") &mdash; try the operation and catch failure &mdash; is the Pythonic default (e.g. <code class="inl">try: d[k] except KeyError</code>). <b>LBYL</b> ("look before you leap") checks first (<code class="inl">if k in d</code>) but can race and be more verbose.</p>`)}
  ${iq('Intermediate','What is a context manager?',`<p>An object with <code class="inl">__enter__</code>/<code class="inl">__exit__</code> used via <code class="inl">with</code>, guaranteeing setup/teardown even on exceptions (closing files, releasing locks). Build one easily with <code class="inl">contextlib.contextmanager</code>.</p><pre class="code">with open('f.txt') as f:   # close guaranteed
    data = f.read()</pre>`)}

  <h3 class="section-h" style="margin-top:26px">Execution, modules &amp; memory</h3>
  ${iq('Beginner','What does if __name__ == "__main__" do?',`<p>Run directly, a file's <code class="inl">__name__</code> is <code class="inl">"__main__"</code>; imported, it's the module name. The guard runs script code only on direct execution, so importing the module stays side-effect free.</p>`)}
  ${iq('Intermediate','Is Python pass-by-value or pass-by-reference?',`<p>Neither exactly &mdash; it's "pass by object reference". The function gets a reference to the same object; mutating a mutable argument is visible to the caller, but rebinding the name inside the function is not.</p>`)}
  ${iq('Intermediate','Shallow vs deep copy?',`<p>A shallow copy (<code class="inl">list(x)</code>, <code class="inl">copy.copy</code>) duplicates the outer object but shares nested objects; <code class="inl">copy.deepcopy</code> recursively copies everything so the two are fully independent.</p>`)}
  ${iq('Advanced','How does Python manage memory?',`<p>Objects are reference-counted; when a count hits zero the memory is freed immediately. A cyclic garbage collector handles reference cycles. Small objects are pooled/arena-allocated by CPython for speed.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Concurrency</h3>
  ${iq('Advanced','What is the GIL and how does it affect concurrency?',`<p>CPython's Global Interpreter Lock lets only one thread run Python bytecode at a time, so threads don't parallelise <b>CPU-bound</b> work &mdash; use <code class="inl">multiprocessing</code> for that. Threads and <code class="inl">asyncio</code> still shine for <b>I/O-bound</b> work that spends time waiting.</p>`)}
  ${iq('Advanced','threading vs multiprocessing vs asyncio?',`<ul><li><b>threading</b> &mdash; concurrent I/O within one process (limited by the GIL for CPU work).</li><li><b>multiprocessing</b> &mdash; true parallelism via separate processes; best for CPU-bound.</li><li><b>asyncio</b> &mdash; single-threaded cooperative concurrency for many I/O tasks via <code class="inl">async/await</code>.</li></ul>`)}
  ${iq('Advanced','What do async and await mean?',`<p>An <code class="inl">async def</code> function is a coroutine; <code class="inl">await</code> suspends it while an awaitable (e.g. a network call) is pending, letting the event loop run other tasks. Great for high-concurrency I/O, not for CPU-bound crunching.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Performance, idioms &amp; tooling</h3>
  ${iq('Advanced','Time complexity of common operations?',`${bigO}<p>The headline: use a <code class="inl">set</code>/<code class="inl">dict</code> for membership tests, not a list.</p>`)}
  ${iq('Intermediate','How should you build a big string efficiently?',`<p>Collect parts in a list and <code class="inl">"".join(parts)</code> once (O(n)), rather than repeated <code class="inl">+=</code> which creates a new string each time (O(n&sup2;)).</p>`)}
  ${iq('Beginner','Name a few Pythonic idioms interviewers like.',`<ul><li><code class="inl">for i, x in enumerate(xs)</code> instead of manual counters.</li><li>Tuple unpacking: <code class="inl">a, b = b, a</code>.</li><li><code class="inl">d.get(k, default)</code> / <code class="inl">collections.defaultdict</code>.</li><li>Comprehensions over manual loops; context managers over manual close.</li></ul>`)}
  ${iq('Intermediate','What are type hints, and do they affect runtime?',`<p>Annotations like <code class="inl">def f(x: int) -&gt; str:</code> document intent and enable static checkers (mypy) and IDEs. They are <b>not enforced</b> at runtime by default &mdash; Python stays dynamically typed.</p>`)}
  ${iq('Intermediate','How do you test Python code and isolate dependencies?',`<p>Write tests with <code class="inl">pytest</code> or <code class="inl">unittest</code> (arrange/act/assert), and isolate each project's packages in a <b>virtual environment</b> (<code class="inl">python -m venv</code>) with dependencies pinned via <code class="inl">pip</code>/requirements.</p>`)}

  <div class="foot" style="margin-top:30px"><span></span><button class="f-btn f-next" onclick="go('${order[0]}')">Back to the course &rarr;</button></div>`;
}
lessons['interview'] = { short: 'Interview Q&A', where: '<b>Interview Q&A</b>', render: renderInterview };
