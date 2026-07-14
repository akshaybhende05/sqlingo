/* ============================================================
   Developer Track — Capstone Project course engine
   Final (7th) Developer course. Brings Python, a web framework,
   and DevOps together. Chapters 05-08 (Part II) run REAL Python
   via Pyodide, exactly like public/python.js, since writing and
   testing TastyGo's actual business logic is genuinely feasible
   in-browser. Every other chapter uses qMC/qScenario, the same
   reasoning as Django/FastAPI/DevOps: a full framework + database
   + container + reverse-proxy stack cannot run live in a tab, so
   those parts are guided design/config practice instead.
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
      buildNav(); computeTotals(); go((function(){try{var l=localStorage.getItem('capstone_last');return (l&&lessons[l])?l:'00';}catch(e){return '00';}})());
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

/* Re-entry hook: see the matching comment in public/app.js / public/python.js. */
window.__capstoneReinit = function () {
  const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
  buildNav();
  computeTotals();
  go(curCh || (typeof order !== 'undefined' && order[0]) || '00');
};

/* ---------- running real Python (identical approach to python.js) ---------- */
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
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function gutter(id) { const e = document.getElementById('ed-' + id), g = document.getElementById('gut-' + id); if (!e || !g) return; const n = e.value.split('\n').length || 1; g.innerHTML = Array.from({ length: n }, (_, i) => i + 1).join('<br>'); }
function renderPyOut(id, res) {
  const out = document.getElementById('out-' + id), st = document.getElementById('st-' + id);
  if (res.error) {
    out.innerHTML = `${res.output ? `<pre class="code" style="margin:0;border-radius:0;border:none;">${escapeHtml(res.output)}</pre>` : ''}<div class="pg-empty" style="color:var(--rose)">&#9888; ${res.error}</div>`;
    if (st) st.textContent = 'Error';
    return { ok: false };
  }
  if (!res.output || !res.output.trim()) { out.innerHTML = '<div class="pg-empty">Ran fine, but nothing was printed. Add a print(...) to see output.</div>'; if (st) st.textContent = 'OK · no output'; return { ok: true, output: res.output || '' }; }
  out.innerHTML = `<pre class="code" style="margin:0;border-radius:0;border:none;">${escapeHtml(res.output)}</pre>`;
  if (st) st.textContent = 'OK';
  return { ok: true, output: res.output };
}

/* ---------- graded live-code exercises (Part II only) ---------- */
let qCount = 0; let solved = 0; const answers = {};
const PASS_TOKEN = '___ALL_PASSED___';
function qPy(id, lvl, txt, starter, testCode, solution, hint) {
  qCount++;
  const c = lvl === 'easy' ? 'lv-e' : lvl === 'med' ? 'lv-m' : 'lv-h';
  const t = lvl === 'easy' ? 'Easy' : lvl === 'med' ? 'Medium' : 'Hard';
  answers[id] = { type: 'py', testCode, solution, solved: false };
  return `<div class="q"><div class="q-head"><span class="q-lvl ${c}">${t}</span></div><div class="q-txt">${txt}</div>${hint ? `<div class="q-hint">Hint: ${hint}</div>` : ''}
    <div class="pg" style="margin:13px 0 0"><div class="pg-toolbar"><button class="pg-btn pg-run" onclick="checkPy('${id}')">&#9654; Run &amp; Check</button><button class="pg-btn pg-ghost" onclick="revealPy('${id}')">Show answer</button></div>
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
  renderPyOut(id, { error: res.error, output: cleanOutput });
  const fb = document.getElementById('fb-' + id);
  const pass = !res.error && res.output && res.output.includes(PASS_TOKEN);
  if (pass) { fb.className = 'q-fb ok'; fb.innerHTML = '&#10003; Correct. That does exactly what was asked.'; if (!m.solved) { m.solved = true; solved++; markProg(curCh, id); updateProg(); } }
  else if (res.error) { fb.className = 'q-fb no'; fb.innerHTML = '&#10007; There is an error, read the message above and adjust.'; }
  else { fb.className = 'q-fb no'; fb.innerHTML = '&#10007; It runs, but does not do what was asked yet. Re-read the question and check your logic.'; }
}
function revealPy(id) {
  const m = answers[id]; const e = document.getElementById('ed-' + id);
  e.value = m.solution; gutter(id);
  renderPyOut(id, runPy(m.solution));
  const fb = document.getElementById('fb-' + id);
  fb.className = 'q-fb ok'; fb.innerHTML = 'Here is one correct version. Read each part, then try writing it yourself next time.';
  if (!m.solved) { m.solved = true; solved++; markProg(curCh, id); updateProg(); }
}

/* ---------- graded multiple choice (design/config decisions) ---------- */
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

/* ---------- write-and-compare scenario practice ---------- */
function qScenario(id, lvl, txt, modelAnswer, hint) {
  qCount++;
  const c = lvl === 'easy' ? 'lv-e' : lvl === 'med' ? 'lv-m' : 'lv-h';
  const t = lvl === 'easy' ? 'Easy' : lvl === 'med' ? 'Medium' : 'Hard';
  answers[id] = { type: 'scenario', modelAnswer, solved: false };
  return `<div class="q"><div class="q-head"><span class="q-lvl ${c}">${t}</span></div><div class="q-txt">${txt}</div>${hint ? `<div class="q-hint">Hint: ${hint}</div>` : ''}
    <textarea class="scenario-ed" id="ed-${id}" placeholder="Write your own answer here, then compare it with a model answer. This is not auto-graded, you judge for yourself."></textarea>
    <div class="mc-toolbar"><button class="pg-btn pg-ghost" onclick="revealScenario('${id}')">Compare with model answer</button></div>
    <div class="q-fb" id="fb-${id}"></div></div>`;
}
function revealScenario(id) {
  const m = answers[id]; const fb = document.getElementById('fb-' + id);
  fb.className = 'q-fb ok'; fb.innerHTML = '<b>One good version:</b><br>' + m.modelAnswer;
  if (!m.solved) { m.solved = true; solved++; markProg(curCh, id); updateProg(); }
}

/* ---------- glossary ---------- */
const glossary = {
  mvp: { short: 'The smallest version of a product that is still genuinely useful.', long: 'A Minimum Viable Product is the smallest slice of a system that delivers real value end to end, deliberately leaving out anything non-essential, so it can be built, tested, and learned from quickly rather than over-engineered before it is even proven useful.' },
  staging: { short: 'A production-like environment used to test changes before real users see them.', long: 'A staging environment mirrors production as closely as practical (same architecture, similar data shape) but is not used by real customers, giving a safe place to catch problems in a deploy before it reaches production.' },
  rollback: { short: 'Reverting a deployment to a previous, known-good version.', long: 'A rollback undoes a deployment by switching back to the last version that was working correctly, usually the fastest way to stop an incident caused by a bad release while the actual fix is worked out separately.' },
  idempotency: { short: 'An operation that produces the same result no matter how many times it runs.', long: 'An idempotent operation can safely be retried (for example, after a network timeout) without causing duplicate effects, like accidentally charging a customer twice or creating the same order twice.' },
  rate_limiting: { short: 'Restricting how many requests a client can make in a given time window.', long: 'Rate limiting caps how often a single client (or IP, or API key) can call an endpoint in a given period, protecting the system from being overwhelmed by a runaway script, a bug, or a deliberate abuse attempt.' },
  api_versioning: { short: 'Shipping changes to an API without breaking clients already using it.', long: 'API versioning (like /v1/orders vs. /v2/orders) lets an API evolve, fixing mistakes and adding features, while existing clients that depend on the old behavior keep working until they choose to upgrade.' },
  technical_debt: { short: 'Shortcuts taken now that create extra work later.', long: 'Technical debt is the accumulated cost of choosing a faster, simpler solution now over a more thorough one, a reasonable trade-off sometimes, but one that needs to be tracked and eventually paid down, or it compounds into a system that is hard to change safely.' },
  portfolio_project: { short: 'A project built specifically to demonstrate real skills to potential employers.', long: "A portfolio project is deliberately built and presented to show a specific set of real, demonstrable skills, working code, a live demo, a clear explanation of decisions made, exactly what this Capstone is designed to become." },
};
function term(w, label) {
  const g = glossary[w];
  return `<span class="term" tabindex="0" role="button" aria-label="${label || w}, glossary term, press Enter to read more" onclick="capstoneMore('${w}',this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();capstoneMore('${w}',this)}">${label || w}<span class="tip">${g.short}<br><span style="color:#7fd8cb;font-size:11px">press Enter or click to read more</span></span></span>`;
}
function capstoneMore(w, el) {
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
try { PROG = JSON.parse(localStorage.getItem('capstone_progress') || '{}'); } catch (_) { PROG = {}; }
function markProg(ch, id) { if (!ch) return; if (!PROG[ch]) PROG[ch] = {}; PROG[ch][id] = true; try { localStorage.setItem('capstone_progress', JSON.stringify(PROG)); } catch (_) { } updateCourse(); }
function overallSolved() { let n = 0; for (const c in PROG) { n += Object.keys(PROG[c]).length; } return n; }
function updateCourse() {
  const el = document.getElementById('courseProg'); const fill = document.getElementById('courseProgFill'); const n = overallSolved();
  const done = TOTAL_Q > 0 && n >= TOTAL_Q;
  if (el) el.textContent = TOTAL_Q ? (done ? `Course complete — ${n} / ${TOTAL_Q} solved` : `Overall: ${n} / ${TOTAL_Q} solved`) : '';
  if (fill) fill.style.width = TOTAL_Q ? ((n / TOTAL_Q) * 100) + '%' : '0%';
  if (done) celebrateOnce();
}
function celebrateOnce() {
  let shown = false; try { shown = localStorage.getItem('capstone_celebrated') === '1'; } catch (_) { }
  if (shown) return;
  try { localStorage.setItem('capstone_celebrated', '1'); } catch (_) { }
  const t = document.createElement('div'); t.className = 'celebrate-toast';
  t.innerHTML = '<b>Every chapter solved.</b><br>You have designed, coded, containerized, and planned the deployment of a real backend, start to finish. That is the whole Developer track, complete.';
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('show'); }, 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 6000);
}
function computeTotals() { const sq = qCount; TOTAL_Q = 0; for (const k in lessons) { qCount = 0; try { lessons[k].render(); } catch (_) { } TOTAL_Q += qCount; } qCount = sq; for (const kk in answers) delete answers[kk]; updateCourse(); }
function resetProgress() { if (!window.confirm('Reset all solved progress across every chapter? This cannot be undone.')) return; PROG = {}; try { localStorage.removeItem('capstone_progress'); } catch (_) { } updateCourse(); if (curCh) go(curCh); }
function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('navOverlay').classList.toggle('show'); }
function closeMenu() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('navOverlay').classList.remove('show'); }

/* ---------- navigation ---------- */
const manifest = [
  { p: 'Groundwork', items: [['00', 'What the Capstone actually is', 1], ['0b', 'Choosing your stack: Django or FastAPI', 1], ['0i', "Meet the project: TastyGo's backend, scoped for this build", 1]] },
  { p: 'Part I · Designing the API surface', items: [['01', 'Defining the endpoints TastyGo needs', 1], ['02', 'Designing the data models', 1], ['03', 'The customers/restaurants/orders relationships', 1], ['04', "Deciding what's out of scope (MVP thinking)", 1]] },
  { p: 'Part II · Core logic in real Python', items: [['05', 'Writing the order total calculation', 1], ['06', 'Writing input validation functions', 1], ['07', 'Writing the delivery ETA function', 1], ['08', 'Writing tests for your own logic', 1]] },
  { p: 'Part III · Wiring it into a framework', items: [['09', 'Turning your functions into endpoints', 1], ['10', 'Request validation with your framework', 1], ['11', 'Connecting to a database', 1], ['12', 'Error handling and status codes', 1]] },
  { p: 'Part IV · Containerizing it', items: [['13', "Writing TastyGo's Dockerfile", 1], ['14', 'docker-compose for the full stack', 1], ['15', 'Environment configuration for containers', 1], ['16', 'Testing the containerized app locally', 1]] },
  { p: 'Part V · Deployment pipeline', items: [['17', 'Writing the CI pipeline for TastyGo', 1], ['18', 'Writing the CD/deploy job', 1], ['19', 'nginx config for TastyGo', 1], ['20', 'TLS and domain setup', 1]] },
  { p: 'Part VI · Operating it for real', items: [['21', "Logging TastyGo's requests", 1], ['22', 'Setting up monitoring and alerts', 1], ['23', 'Planning for scale', 1], ['24', 'Incident response drill', 1]] },
  { p: 'Part VII · Polish and real-world extras', items: [['25', 'Rate limiting and abuse prevention', 1], ['26', 'API docs and versioning', 1], ['27', 'A security review checklist', 1]] },
  { p: 'Part VIII · Wrapping up', items: [['28', 'Your complete TastyGo architecture', 1], ['29', 'Where to go from here', 1]] },
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
    ${next ? `<button class="f-btn f-next" onclick="go('${next}')">${lessons[next].short} &rarr;</button>` : `<button class="f-btn f-next" disabled>You've reached the end</button>`}
  </div>`;
}

function go(num) {
  const L = lessons[num]; if (!L) return;
  curCh = num;
  try { localStorage.setItem('capstone_last', num); } catch (_) {}
  qCount = 0; solved = 0; for (const k in answers) delete answers[k];
  document.getElementById('content').innerHTML = inShort(num) + L.render() + foot(num);
  document.getElementById('crumb').innerHTML = L.where;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('nav-' + num); if (el) el.classList.add('active');
  const done = PROG[num] || {};
  Object.keys(answers).forEach(id => {
    if (done[id] && !answers[id].solved) {
      answers[id].solved = true; solved++;
      const fb = document.getElementById('fb-' + id);
      if (fb) {
        if (answers[id].type === 'py') { fb.className = 'q-fb ok'; fb.innerHTML = '&#10003; Solved earlier. Run it again any time to practise.'; }
        else if (answers[id].type === 'scenario') { fb.className = 'q-fb ok'; fb.innerHTML = '&#10003; Solved earlier.<br><b>One good version:</b><br>' + answers[id].modelAnswer; }
        else { fb.className = 'q-fb ok'; fb.innerHTML = '&#10003; Solved earlier. Run it again any time to practise.'; }
      }
    }
  });
  updateProg();
  closeMenu();
  window.scrollTo({ top: 0 });
}

/* ---------- lessons ---------- */
const lessons = {};

lessons['00'] = {
  short: 'What the Capstone is', where: 'Groundwork · <b>What the Capstone actually is</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 00</div>
  <h2 class="title">What the Capstone actually is</h2>
  <p class="lead">Every other Developer course taught one layer. This one is where you use all of them together, on one real, coherent project.</p>
  <hr class="rule">
  <p class="body">Across Fundamentals, Python, Django or FastAPI, and DevOps, you've learned how software runs, how to write it, how to serve it, and how to ship and operate it. Each course kept the others' concerns mostly out of view so the ideas stayed clear. The Capstone deliberately removes those walls: you'll design an API surface, write and test real Python logic for it, decide how it's containerized, and plan how it gets deployed and monitored, as one connected line of decisions rather than separate, isolated topics.</p>
  <div class="analogy"><div class="lab">The plain-language version</div><div class="txt">Learning to season, learning knife skills, and learning how an oven works are each useful on their own, but a real meal is where they all have to work together, at the same time, toward one actual dish. This course is that meal.</div></div>
  <p class="body">This is also, deliberately, a ${term('portfolio_project', 'portfolio project')}: something built specifically so you can point to it, real design decisions, real running Python code, a real containerization and deployment plan, and explain exactly why each piece is the way it is.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Expecting a fully running, deployed website by the end.</b> This course focuses on the real thinking and code behind such a system (see chapter 0b for exactly which parts run live vs. are guided design practice); actually deploying to a live domain is optional, further work you can choose to do afterward.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">The Capstone connects every prior Developer course's ideas into one real project, and is deliberately shaped to become a genuine portfolio piece.</p>
  ${qMC('q1', 'easy', 'What is the main thing that makes the Capstone different from the courses before it?', ['It introduces an entirely new, unrelated topic', 'It combines design, real Python logic, containerization, and deployment planning into one connected project, rather than teaching one layer in isolation', 'It has no practice exercises at all'], 1, 'Every prior course deliberately isolated one concern to keep it clear; the Capstone\'s whole point is to remove those walls and work across all of them on one real project.')}
`
};

lessons['0b'] = {
  short: 'Choosing your stack', where: 'Groundwork · <b>Choosing your stack: Django or FastAPI</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0b</div>
  <h2 class="title">Choosing your stack: Django or FastAPI</h2>
  <p class="lead">This course is written to work with either framework you learned. Pick the one that fits how you want to build.</p>
  <hr class="rule">
  <p class="body">Wherever a chapter involves framework-specific decisions (Part III onward), it's written framework-agnostically, so it applies whether you're mentally building on Django (fuller-featured, batteries-included, a real admin panel and ORM) or FastAPI (lighter, API-first, async-friendly, automatic docs). Pick whichever you found more natural, or whichever better matches the kind of role you're aiming for.</p>
  <div class="qb"><div class="qb-title">Which parts of this course actually run live, and which are guided</div>
    <div class="qb-row"><span class="qb-kw kw-p">Part II (05-08)</span><span class="qb-mean">real Python, running live in your browser via the same engine as the Python course, auto-graded against hidden tests</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Everything else</span><span class="qb-mean">guided design and configuration practice (multiple-choice + write-and-compare), the same reasoning as Django/FastAPI/DevOps: a full framework, database, container, and reverse proxy can't run live in a browser tab</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Thinking you need to have "finished" Django or FastAPI perfectly first.</b> This course reuses and reinforces those ideas rather than requiring mastery; if a concept feels shaky, it's explained again here in context.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This course works with either Django or FastAPI as your mental model. Part II runs real, live Python; everything else is guided design and configuration practice, for the same reasons as the Django/FastAPI/DevOps courses.</p>
  ${qMC('q1', 'easy', 'Which part of this course runs real, live, auto-graded Python code in your browser?', ['Every single chapter', 'Only Part II (chapters 05-08), the core business-logic chapters', 'None of it, the whole course is multiple choice'], 1, 'Part II is where you actually write and run real Python, checked against hidden tests, exactly like the Python course\'s engine; the rest is guided design/config practice since a full framework/database/container stack can\'t run live in a browser tab.')}
`
};

lessons['0i'] = {
  short: 'Meet the project', where: 'Groundwork · <b>Meet the project: TastyGo\'s backend, scoped for this build</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0i</div>
  <h2 class="title">Meet the project: TastyGo's backend, scoped for this build</h2>
  <p class="lead">Same TastyGo you've used in every course. Here, scoped down to exactly what a real first build should include, and no more.</p>
  <hr class="rule">
  <p class="body">This build focuses on three endpoints worth building for real: creating an order, fetching a restaurant's menu, and checking an order's status. That's deliberately small. A real ${term('mvp', 'MVP')} isn't "TastyGo, but incomplete," it's "the smallest real slice of TastyGo that's still genuinely useful and correctly built," which is a much more valuable, honest thing to actually finish and show someone.</p>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This Capstone deliberately scopes down to three real endpoints (create an order, fetch a menu, check order status), small enough to actually finish correctly, rather than a large, half-built system.</p>
  ${qMC('q1', 'easy', 'Why does this Capstone deliberately scope down to just three endpoints instead of trying to rebuild all of TastyGo?', ['Three is an arbitrary technical limit of the framework', 'A small, genuinely finished, correctly-built slice is more valuable to actually complete and show than a larger, half-built system', 'FastAPI and Django do not support more than three endpoints'], 1, "This is exactly the MVP mindset from chapter 04 later in this course: a small slice done well is more useful, and more honestly demonstrable, than an ambitious system left unfinished.")}
`
};

lessons['01'] = {
  short: 'Defining the endpoints', where: 'Part I · <b>Defining the endpoints TastyGo needs</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 01</div>
  <h2 class="title">Defining the endpoints TastyGo needs</h2>
  <p class="lead">Before writing any code, decide exactly what the API needs to do. This is the same design step Django and FastAPI's courses walked through per-feature; here, you do it for the whole scoped project at once.</p>
  <hr class="rule">
  <pre class="code">POST   /orders                  create a new order
GET    /restaurants/{id}/menu    fetch a restaurant's menu
GET    /orders/{id}              check an order's status</pre>
  <p class="body">Each endpoint pairs an HTTP method with a resource path, exactly the pattern from the Django and FastAPI courses' routing chapters. Naming them clearly, and deciding this before writing a line of implementation, is what keeps the actual build focused instead of growing scope as you go.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Starting to write code before the endpoint list is settled.</b> Endpoints decided mid-implementation tend to be shaped by whatever's easiest to code next, rather than what the API's actual users (a mobile app, a frontend) genuinely need.</li>
  </ul></div>
  <div class="sec-num">1.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Three endpoints, decided up front: creating an order, fetching a restaurant's menu, and checking an order's status.</p>
  ${qScenario('q1', 'easy', "TastyGo also wants customers to be able to cancel an order they haven't received yet. Write the HTTP method + path for this new endpoint, following the pattern above.", 'POST /orders/{id}/cancel — a POST because it changes state (cancelling the order), following the same {id}-in-the-path pattern already used for checking an order\'s status.')}
`
};

lessons['02'] = {
  short: 'Designing the data models', where: 'Part I · <b>Designing the data models</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 02</div>
  <h2 class="title">Designing the data models</h2>
  <p class="lead">With the endpoints named, decide what data each one actually needs, in and out.</p>
  <hr class="rule">
  <pre class="code">Order
  id: int
  customer_id: int
  restaurant_id: int
  items: list of { menu_item_id: int, quantity: int }
  status: "placed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
  total: number</pre>
  <p class="body">This is the same modeling exercise as Django's ORM chapters or FastAPI's Pydantic chapters, just done here as a plain, framework-neutral shape first. Deciding the exact fields, and the exact allowed values for something like <code class="inl">status</code>, before touching a framework's model syntax, makes translating it into Django's <code class="inl">models.Model</code> or FastAPI's <code class="inl">BaseModel</code> almost mechanical afterward.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Leaving status as a free-text string with no fixed set of values.</b> Without a fixed set of allowed values, nothing stops an order ending up with a typo'd, meaningless status like "delverd", exactly the kind of bug type hints and enums exist to prevent.</li>
  </ul></div>
  <div class="sec-num">2.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Modeling data as a plain, framework-neutral shape first, with fixed allowed values where relevant, makes the eventual Django model or Pydantic schema straightforward to write.</p>
  ${qMC('q1', 'med', 'Why fix "status" to a specific set of allowed values (placed, preparing, out_for_delivery, delivered, cancelled) instead of leaving it as any free-text string?', ['Free-text fields are not supported by any database', 'A fixed set of values prevents invalid, meaningless statuses (like a typo) from ever being stored', 'It makes the API run faster'], 1, "Restricting status to a known, fixed set of values is exactly what prevents nonsensical data (a typo'd status, or a status that shouldn't exist) from ever entering the system in the first place.")}
`
};

lessons['03'] = {
  short: 'The relationships', where: 'Part I · <b>The customers/restaurants/orders relationships</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 03</div>
  <h2 class="title">The customers/restaurants/orders relationships</h2>
  <p class="lead">The same customers/restaurants/orders shape used in every course, now drawn as the actual relationships this build depends on.</p>
  <hr class="rule">
  <svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:560px;display:block;margin:10px auto" role="img" aria-label="Customer, order, and restaurant relationship diagram">
    <rect x="20" y="80" width="140" height="50" rx="8" fill="none" stroke="var(--edge,#3a4a55)"/>
    <text x="90" y="110" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="13">Customer</text>
    <rect x="210" y="80" width="140" height="50" rx="8" fill="none" stroke="var(--accent,#5ec8bd)"/>
    <text x="280" y="110" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="13">Order</text>
    <rect x="400" y="80" width="140" height="50" rx="8" fill="none" stroke="var(--edge,#3a4a55)"/>
    <text x="470" y="110" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="13">Restaurant</text>
    <line x1="160" y1="105" x2="210" y2="105" stroke="var(--edge,#3a4a55)"/>
    <text x="185" y="98" text-anchor="middle" fill="var(--muted,#93a4ac)" font-size="10">places</text>
    <line x1="350" y1="105" x2="400" y2="105" stroke="var(--edge,#3a4a55)"/>
    <text x="375" y="98" text-anchor="middle" fill="var(--muted,#93a4ac)" font-size="10">at</text>
  </svg>
  <p class="body">One customer places many orders; one order belongs to exactly one restaurant. This is a direct, real foreign-key relationship, exactly the ForeignKey pattern from Django's ORM course or the id-reference pattern from FastAPI's models, now applied to the actual project you're building.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Storing a copy of the restaurant's name and address directly on every order.</b> Storing only the restaurant's id, and looking up the rest when needed, avoids duplicated data going stale if the restaurant's details ever change.</li>
  </ul></div>
  <div class="sec-num">3.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Orders reference a customer and a restaurant by id, a direct foreign-key relationship, avoiding duplicated, staleness-prone copies of that data.</p>
  ${qMC('q1', 'easy', 'Why should an order store restaurant_id rather than a full copy of the restaurant\'s name and address?', ['IDs take up less disk space, nothing else matters', 'Storing just the id and looking up current details avoids duplicated data going stale if the restaurant\'s info ever changes', 'Names and addresses cannot be stored in a database'], 1, 'A foreign key reference keeps exactly one, current copy of the restaurant\'s details; duplicating them onto every order risks those copies silently going stale.')}
`
};

lessons['04'] = {
  short: 'MVP thinking', where: 'Part I · <b>Deciding what\'s out of scope (MVP thinking)</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 04</div>
  <h2 class="title">Deciding what's out of scope (MVP thinking)</h2>
  <p class="lead">A real, useful build is defined as much by what it deliberately leaves out as by what it includes.</p>
  <hr class="rule">
  <p class="body">Real TastyGo would need payments, restaurant onboarding, delivery-partner assignment, ratings, promotions, and far more. None of that is in scope here, on purpose. The ${term('mvp', 'MVP')} mindset means naming, explicitly, what's deliberately excluded, so it's a conscious decision rather than something that quietly never got done. A clear "not in this version" list is itself a sign of real engineering judgment, not a shortcut to be embarrassed about.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Treating scope decisions as an unstated, implicit thing.</b> Writing scope decisions down (even just a short "out of scope for now" list) is what turns them into a deliberate design choice you can explain, rather than something that looks like an oversight.</li>
  </ul></div>
  <div class="sec-num">4.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A real MVP names what it deliberately excludes just as clearly as what it includes, turning scope limits into a defensible design decision rather than an unstated gap.</p>
  ${qScenario('q1', 'easy', 'Write a short "out of scope for this version" note for TastyGo\'s Capstone build, listing at least two things deliberately left out and why.', 'Out of scope for this version: payments (a real payment integration is a large, separate concern with its own compliance requirements), and delivery-partner assignment (would require a whole separate matching system). Both are real, valuable features, deliberately left out so this version can focus on, and correctly finish, its three core endpoints.')}
`
};

lessons['05'] = {
  short: 'Order total calculation', where: 'Part II · <b>Writing the order total calculation</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 05</div>
  <h2 class="title">Writing the order total calculation</h2>
  <p class="lead">The first real, running Python of this course: the actual logic behind <code class="inl">POST /orders</code>. This runs for real, right here, exactly like the Python course.</p>
  <hr class="rule">
  <p class="body">Whatever framework eventually calls this function, the actual business logic, given a list of items with prices and quantities, compute the total, is plain Python with no framework involved at all. Writing and testing it in isolation, before it's ever wired into a route, is exactly good practice: framework-independent logic is easier to test, easier to reuse, and easier to reason about.</p>
  ${qPy('q1', 'med', 'Write a function order_total(items) that takes a list of dicts like {"price": 250, "quantity": 2} and returns the sum of price * quantity across all items.',
    `def order_total(items):
    # your code here
    pass`,
    `result = order_total([{"price": 250, "quantity": 2}, {"price": 100, "quantity": 1}])
assert result == 600, f"expected 600, got {result}"
result2 = order_total([])
assert result2 == 0, f"expected 0 for empty list, got {result2}"
print("${PASS_TOKEN}")`,
    `def order_total(items):
    return sum(item["price"] * item["quantity"] for item in items)`,
    'sum(...) with a generator expression multiplying price by quantity for each item covers this in one line.')}
  <div class="sec-num">5.1</div><h3 class="section-h">Recap</h3>
  <p class="body">order_total(items) is plain, framework-independent Python, exactly the kind of function that later gets called from inside a route handler.</p>
`
};

lessons['06'] = {
  short: 'Input validation functions', where: 'Part II · <b>Writing input validation functions</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 06</div>
  <h2 class="title">Writing input validation functions</h2>
  <p class="lead">Before a framework's automatic validation (Pydantic, Django forms) even gets involved, the underlying rule is still plain logic you can write and test directly.</p>
  <hr class="rule">
  <p class="body">An order needs at least one item, and every item needs a positive quantity. Writing this as a plain function first, one that returns a list of error messages (empty if the order is valid), makes the rule itself testable on its own, independent of whichever framework eventually surfaces those errors to a client as a 422 or 400 response.</p>
  ${qPy('q1', 'med', 'Write a function validate_order(items) that returns a list of error message strings: "Order must have at least one item" if items is empty, and "Item N has invalid quantity" (for each 1-indexed item N with quantity <= 0). Return an empty list if there are no errors.',
    `def validate_order(items):
    # your code here
    pass`,
    `errors1 = validate_order([])
assert errors1 == ["Order must have at least one item"], f"got {errors1}"
errors2 = validate_order([{"price": 10, "quantity": 1}, {"price": 10, "quantity": 0}])
assert errors2 == ["Item 2 has invalid quantity"], f"got {errors2}"
errors3 = validate_order([{"price": 10, "quantity": 2}])
assert errors3 == [], f"got {errors3}"
print("${PASS_TOKEN}")`,
    `def validate_order(items):
    errors = []
    if not items:
        errors.append("Order must have at least one item")
        return errors
    for i, item in enumerate(items, start=1):
        if item["quantity"] <= 0:
            errors.append(f"Item {i} has invalid quantity")
    return errors`,
    'Use enumerate(items, start=1) to get a 1-indexed position for each item while looping.')}
  <div class="sec-num">6.1</div><h3 class="section-h">Recap</h3>
  <p class="body">validate_order(items) is the plain logic behind what a framework's automatic validation would eventually surface as a client-facing error response.</p>
`
};

lessons['07'] = {
  short: 'Delivery ETA function', where: 'Part II · <b>Writing the delivery ETA function</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 07</div>
  <h2 class="title">Writing the delivery ETA function</h2>
  <p class="lead">A slightly richer piece of business logic: estimating when an order will actually arrive.</p>
  <hr class="rule">
  <p class="body">TastyGo estimates delivery time as the restaurant's average prep time, plus 3 minutes of travel per kilometer of delivery distance. Like the previous two chapters, this is pure logic with no framework, no database, and no network call involved, easy to test in complete isolation.</p>
  ${qPy('q1', 'med', 'Write a function eta_minutes(prep_minutes, distance_km) that returns prep_minutes + (distance_km * 3).',
    `def eta_minutes(prep_minutes, distance_km):
    # your code here
    pass`,
    `assert eta_minutes(10, 4) == 22, f"got {eta_minutes(10, 4)}"
assert eta_minutes(5, 0) == 5, f"got {eta_minutes(5, 0)}"
assert eta_minutes(0, 2) == 6, f"got {eta_minutes(0, 2)}"
print("${PASS_TOKEN}")`,
    `def eta_minutes(prep_minutes, distance_km):
    return prep_minutes + (distance_km * 3)`,
    'A single return statement with the formula given in the question is enough.')}
  <div class="sec-num">7.1</div><h3 class="section-h">Recap</h3>
  <p class="body">eta_minutes(prep_minutes, distance_km) is another small, pure function, exactly the kind of logic worth writing and testing before it's wired into a real endpoint.</p>
`
};

lessons['08'] = {
  short: 'Writing tests for your own logic', where: 'Part II · <b>Writing tests for your own logic</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 08</div>
  <h2 class="title">Writing tests for your own logic</h2>
  <p class="lead">You've been reading hidden tests all through this course. Here, you write one yourself, for a function you're given.</p>
  <hr class="rule">
  <p class="body">Building directly on the QA course's test-case design and Python/FastAPI's testing chapters: given a function, a good test doesn't just check the obvious case, it checks an edge case too (like an empty input, or a boundary value), the exact discipline the QA course's equivalence partitioning and boundary value chapters covered.</p>
  ${qPy('q1', 'hard', 'You are given a function `discounted_total(total, discount_percent)` that returns the total after applying a percentage discount. Write an assert statement checking that discounted_total(200, 10) == 180. Then write a second assert checking the edge case discounted_total(200, 0) == 200 (no discount applied). The function is already defined for you above your code.',
    `def discounted_total(total, discount_percent):
    return total - (total * discount_percent / 100)

# write your two assert statements below
`,
    `assert discounted_total(200, 10) == 180, "10% discount case failed"
assert discounted_total(200, 0) == 200, "0% discount edge case failed"
print("${PASS_TOKEN}")`,
    `def discounted_total(total, discount_percent):
    return total - (total * discount_percent / 100)

assert discounted_total(200, 10) == 180, "10% discount case failed"
assert discounted_total(200, 0) == 200, "0% discount edge case failed"`,
    'assert discounted_total(200, 10) == 180 for the normal case, and assert discounted_total(200, 0) == 200 for the "no discount" edge case.')}
  <div class="sec-num">8.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A good test checks both a normal case and a meaningful edge case (like zero discount), the same test-design discipline from the QA course, now applied to your own Python.</p>
`
};

lessons['09'] = {
  short: 'Functions into endpoints', where: 'Part III · <b>Turning your functions into endpoints</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 09</div>
  <h2 class="title">Turning your functions into endpoints</h2>
  <p class="lead">The three pure functions from Part II now need a home: a real route that a client can actually call.</p>
  <hr class="rule">
  <pre class="code"># FastAPI shape
@app.post("/orders")
def create_order(payload: OrderCreate):
    errors = validate_order(payload.items)
    if errors:
        raise HTTPException(422, detail=errors)
    total = order_total(payload.items)
    return {"id": next_id(), "total": total, "status": "placed"}</pre>
  <p class="body">Notice the route handler itself stays thin: it calls <code class="inl">validate_order</code> and <code class="inl">order_total</code>, the exact functions you already wrote and tested in Part II, rather than re-implementing that logic inline. This is precisely why writing framework-independent logic first pays off: the route becomes mostly plumbing, calling already-tested functions.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Rewriting the validation and total logic directly inside the route handler.</b> This duplicates logic that's already written and tested, and now has to be tested again, in a place that's harder to test in isolation.</li>
  </ul></div>
  <div class="sec-num">9.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A thin route handler calls already-tested, framework-independent functions rather than duplicating their logic inline.</p>
  ${qMC('q1', 'med', 'Why is it better for the create_order route handler to call validate_order(...) and order_total(...) rather than reimplementing that logic directly inside the handler?', ['Route handlers cannot call other functions', 'Those functions are already written and tested independently in Part II; calling them keeps the route thin and avoids duplicating and re-testing the same logic', 'It makes the API respond faster'], 1, 'Reusing already-tested, framework-independent functions keeps the route handler focused on request/response plumbing, and avoids duplicating logic that would then need to be tested all over again.')}
`
};

lessons['10'] = {
  short: 'Request validation', where: 'Part III · <b>Request validation with your framework</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 10</div>
  <h2 class="title">Request validation with your framework</h2>
  <p class="lead">Your plain validate_order function checks business rules. The framework's own validation checks something different, and earlier.</p>
  <hr class="rule">
  <p class="body">A Pydantic model (FastAPI) or a Django form/serializer validates the request's basic shape, is <code class="inl">quantity</code> actually an integer, is <code class="inl">price</code> actually a number, before your code ever runs. Your <code class="inl">validate_order</code> function then checks business rules on top of that (at least one item, positive quantities), rules the framework has no way to know about on its own.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming framework-level validation covers business rules too.</b> Type/shape validation (is this a number?) and business-rule validation (is this a sensible order?) are different layers; a framework only reliably handles the first one automatically.</li>
  </ul></div>
  <div class="sec-num">10.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Framework validation checks a request's basic shape and types; your own validate_order function checks business rules the framework can't know about on its own. Both layers matter.</p>
  ${qMC('q1', 'med', 'What is the key difference between Pydantic/form-level validation and your own validate_order function?', ['They do exactly the same thing, one is just redundant', "Framework validation checks basic shape/types (is quantity a number?); validate_order checks business rules the framework can't know about (like requiring at least one item)", 'validate_order replaces the need for any framework validation'], 1, 'Type/shape validation and business-rule validation are genuinely different concerns; a framework reliably automates the first, but the second still needs code that understands what actually makes an order valid for this specific business.')}
`
};

lessons['11'] = {
  short: 'Connecting to a database', where: 'Part III · <b>Connecting to a database</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 11</div>
  <h2 class="title">Connecting to a database</h2>
  <p class="lead">Building directly on Django's ORM chapters and FastAPI's SQLAlchemy chapter: where does a created order actually get stored?</p>
  <hr class="rule">
  <pre class="code"># Django ORM shape
order = Order.objects.create(customer_id=payload.customer_id, restaurant_id=payload.restaurant_id, total=total, status="placed")
for item in payload.items:
    OrderItem.objects.create(order=order, menu_item_id=item.menu_item_id, quantity=item.quantity)</pre>
  <p class="body">The route handler, after computing <code class="inl">total</code> with your pure function, persists the order and its items using the ORM. Keeping the pure calculation (order_total) separate from the persistence step (saving to the database) means the calculation itself can be tested without needing a real database at all, exactly why chapters 05-08 worked without one.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Computing the total using a database query's aggregate function instead of your tested Python function.</b> Both can work, but mixing the calculation into the query makes it harder to unit-test in isolation from the database.</li>
  </ul></div>
  <div class="sec-num">11.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Persistence (saving to the database via the ORM) is a separate step from the pure calculation logic, which is exactly why that logic could be written and tested without a database in Part II.</p>
  ${qScenario('q1', 'med', "In one or two sentences, explain why keeping order_total() as a plain Python function (rather than a database query) made it possible to test it live in chapters 05-08 without ever needing a real database.", "Because order_total() operates purely on a Python list already in memory, with no database call inside it, it can be tested directly, instantly, and in complete isolation, which is exactly why Part II's live-code exercises worked entirely in the browser without any real database running.")}
`
};

lessons['12'] = {
  short: 'Error handling & status codes', where: 'Part III · <b>Error handling and status codes</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 12</div>
  <h2 class="title">Error handling and status codes</h2>
  <p class="lead">Your validate_order function returns a list of error strings. The route's job is translating that into a real, correct HTTP response.</p>
  <hr class="rule">
  <pre class="code">GET  /orders/999        →  404 Not Found        (no such order)
POST /orders (bad data) →  422 Unprocessable     (validation failed)
POST /orders (server bug) → 500 Internal Server Error</pre>
  <p class="body">Each situation needs a genuinely different status code, not a blanket 200 with an error message buried in the body, or a blanket 500 for everything. 404 means "this specific thing doesn't exist," 422 means "the request itself is malformed or invalid," 500 means "something broke on the server side that the client couldn't have prevented." Picking the right one is part of the API's actual contract with whoever calls it.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Returning 200 OK with an error message inside the JSON body.</b> This forces every client to parse the body just to know if something succeeded, defeating the purpose of HTTP status codes existing at all.</li>
  </ul></div>
  <div class="sec-num">12.1</div><h3 class="section-h">Recap</h3>
  <p class="body">404, 422, and 500 each communicate a genuinely different kind of failure; picking the right one is part of the API's real contract with its callers.</p>
  ${qMC('q1', 'easy', "A client requests GET /orders/999 for an order id that doesn't exist. What status code should this return?", ['200 OK, with an error message in the body', '404 Not Found', '500 Internal Server Error'], 1, "A missing resource is exactly what 404 communicates; returning 200 would force clients to parse the body to know something failed, and 500 would incorrectly imply a server-side bug rather than a simple missing record.")}
`
};

lessons['13'] = {
  short: "TastyGo's Dockerfile", where: 'Part IV · <b>Writing TastyGo\'s Dockerfile</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 13</div>
  <h2 class="title">Writing TastyGo's Dockerfile</h2>
  <p class="lead">Directly reusing the DevOps course's Dockerfile chapter, now written for this specific, scoped-down project.</p>
  <hr class="rule">
  <pre class="code">FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]</pre>
  <p class="body">This is nearly identical to the DevOps course's example, on purpose: a Dockerfile for a small Python API rarely needs to be exotic. What matters here is recognizing this project needs exactly this shape, and being able to explain each line, not memorizing something novel.</p>
  <div class="sec-num">13.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TastyGo's Dockerfile follows the same base-image, dependency-caching, and CMD pattern covered in the DevOps course, applied to this specific project.</p>
  ${qMC('q1', 'easy', "Why does the Dockerfile COPY requirements.txt and run pip install BEFORE copying the rest of the application code?", ['Order does not matter to Docker at all', "So Docker's build cache can reuse the (slow) dependency-install step on future rebuilds, as long as requirements.txt hasn't changed", 'Python requires dependencies to be installed in a separate container'], 1, "This is the exact build-caching reasoning from the DevOps course: ordering the Dockerfile this way lets unchanged dependency installs be skipped on rebuilds, since only the more frequently changing application code needs to be re-copied.")}
`
};

lessons['14'] = {
  short: 'docker-compose for the stack', where: 'Part IV · <b>docker-compose for the full stack</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 14</div>
  <h2 class="title">docker-compose for the full stack</h2>
  <p class="lead">TastyGo's API needs a real database alongside it. Compose describes both together.</p>
  <hr class="rule">
  <pre class="code">services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/tastygo
    depends_on: [db]
  db:
    image: postgres:16
    volumes: ["tastygo-db-data:/var/lib/postgresql/data"]

volumes:
  tastygo-db-data:</pre>
  <p class="body">This is the exact docker-compose.yml shape from the DevOps course, applied directly: the api service depends on db, connects to it by its service name, and db's data survives via a named volume. Nothing here is new, it's the same configuration you've already reasoned through, now attached to a real project.</p>
  <div class="sec-num">14.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TastyGo's docker-compose.yml pairs the api service with a db service, connected by service name, with a named volume keeping the database's data safe across restarts.</p>
  ${qScenario('q1', 'med', 'TastyGo also needs a Redis cache for frequently-requested restaurant menus. Add a redis service to the compose file above (image redis:7 is enough, no volume needed for this exercise).', "services:\n  api: { ...same as above, environment also includes REDIS_URL=redis://redis:6379 }\n  db: { ...same as above }\n  redis:\n    image: redis:7\n\nAdding a redis service the same way as db lets the api service reach it by the hostname \"redis\", exactly like it reaches the database by the hostname \"db\".")}
`
};

lessons['15'] = {
  short: 'Environment configuration', where: 'Part IV · <b>Environment configuration for containers</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 15</div>
  <h2 class="title">Environment configuration for containers</h2>
  <p class="lead">Reusing the DevOps course's environment-variables chapter: TastyGo's secrets and per-environment config never live in the code itself.</p>
  <hr class="rule">
  <pre class="code">DATABASE_URL=postgres://user:pass@db:5432/tastygo
SECRET_KEY=a-real-random-secret
DEBUG=false</pre>
  <p class="body">These values differ between your local machine, a staging environment, and production, and the real secrets should never be committed to version control. Reading them via <code class="inl">os.environ</code> (or your framework's settings mechanism) at runtime, exactly as covered in the DevOps course, keeps the same Docker image usable across every environment, just configured differently.</p>
  <div class="sec-num">15.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Environment variables let the exact same built image run correctly across local, staging, and production, without secrets ever being baked into the image or committed to version control.</p>
  ${qMC('q1', 'easy', "Why should SECRET_KEY be read from an environment variable rather than hardcoded in TastyGo's source code?", ['Environment variables run faster', 'It keeps the real secret out of version control, and lets the same built image be reused across environments with different values', 'Python cannot read hardcoded string values'], 1, "This is the same reasoning from the DevOps course: the code only ever references the variable's name, never the actual secret, so the identical image can be deployed anywhere with different real values supplied separately.")}
`
};

lessons['16'] = {
  short: 'Testing the containerized app', where: 'Part IV · <b>Testing the containerized app locally</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 16</div>
  <h2 class="title">Testing the containerized app locally</h2>
  <p class="lead">Before trusting a deployment pipeline, the whole point is being able to run and check the exact same containers yourself, locally.</p>
  <hr class="rule">
  <pre class="code">$ docker compose up -d
$ curl -X POST http://localhost:8000/orders \\
    -H "Content-Type: application/json" \\
    -d '{"customer_id": 1, "restaurant_id": 2, "items": [{"menu_item_id": 5, "quantity": 2}]}'
$ docker compose logs -f api</pre>
  <p class="body">Running the full stack locally with Compose, then hitting a real endpoint with <code class="inl">curl</code> and watching the logs, is the closest you can get, without a real deployment, to proving the whole thing actually works together: the API, the database connection, and the containerization, all at once.</p>
  <div class="sec-num">16.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Running the full containerized stack locally and hitting it with a real request is how you verify the API, database, and containerization actually work together before trusting any deployment.</p>
  ${qMC('q1', 'easy', "Why test TastyGo's containerized stack locally with docker compose up before ever deploying it anywhere?", ['Local testing is required by Docker itself', "It's the closest thing to proof, before a real deployment, that the API, database connection, and containerization genuinely work together", 'Local testing replaces the need for any CI/CD pipeline'], 1, "Testing the exact same containers locally that would run in production catches integration problems (like a broken database connection) before they ever reach a real deployment pipeline.")}
`
};

lessons['17'] = {
  short: 'CI pipeline for TastyGo', where: 'Part V · <b>Writing the CI pipeline for TastyGo</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 17</div>
  <h2 class="title">Writing the CI pipeline for TastyGo</h2>
  <p class="lead">Reusing the DevOps course's GitHub Actions chapter, applied directly to this project's own test suite.</p>
  <hr class="rule">
  <pre class="code">name: TastyGo CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements.txt
      - run: pytest</pre>
  <p class="body">This runs the exact functions you wrote in Part II, order_total, validate_order, eta_minutes, alongside the endpoint tests from Part III, automatically on every push and pull request, exactly the CI setup reasoned through in the DevOps course.</p>
  <div class="sec-num">17.1</div><h3 class="section-h">Recap</h3>
  <p class="body">CI runs the real test suite (covering both your pure Python functions and the endpoints built on top of them) automatically on every push and pull request.</p>
  ${qMC('q1', 'easy', "What does adding pull_request alongside push to this workflow's \"on\" section accomplish?", ['Nothing, they are redundant', 'It runs the same tests automatically on every pull request too, catching failures before code is merged, not only after', 'It disables testing on the main branch'], 1, 'Exactly as covered in the DevOps course: including pull_request means failing tests are caught before a change is even merged into main, not only afterward.')}
`
};

lessons['18'] = {
  short: 'CD/deploy job', where: 'Part V · <b>Writing the CD/deploy job</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 18</div>
  <h2 class="title">Writing the CD/deploy job</h2>
  <p class="lead">Once CI passes, TastyGo's actual deployment job, reusing the DevOps course's CD pattern directly.</p>
  <hr class="rule">
  <pre class="code">jobs:
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: docker build -t tastygo-api:${'${'}{ github.sha }${'}'} .
      - run: docker push registry.example.com/tastygo-api:${'${'}{ github.sha }${'}'}
      - run: ssh deploy@prod "docker compose pull && docker compose up -d"</pre>
  <p class="body"><code class="inl">needs: test</code> is what makes this safe: TastyGo is never deployed unless its own test suite (covering the Part II functions and Part III endpoints) has already passed. This one line is the actual safeguard against shipping a broken build.</p>
  <div class="sec-num">18.1</div><h3 class="section-h">Recap</h3>
  <p class="body">needs: test ensures TastyGo's deploy job only runs after its test suite has passed, never deploying broken, untested code.</p>
  ${qScenario('q1', 'med', "TastyGo's deploy just shipped a bug that slipped through testing. Using the rollback idea from the DevOps course, what's the fastest safe response, and why?", 'Roll back to the previous known-good image tag (docker compose pull/up with the prior tag, or redeploy the last passing commit\'s image) rather than trying to fix and re-deploy immediately. This restores service quickly while the actual fix is investigated properly, rather than users continuing to be affected during a rushed live fix.')}
`
};

lessons['19'] = {
  short: 'nginx config for TastyGo', where: 'Part V · <b>nginx config for TastyGo</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 19</div>
  <h2 class="title">nginx config for TastyGo</h2>
  <p class="lead">Reusing the DevOps course's reverse-proxy chapter, this is the actual config that would sit in front of TastyGo's API.</p>
  <hr class="rule">
  <pre class="code">server {
    listen 80;
    server_name api.tastygo.com;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}</pre>
  <p class="body">Every request to <code class="inl">api.tastygo.com</code> is forwarded to the actual running API container. The <code class="inl">X-Real-IP</code> header still matters here for the exact same reason as the DevOps course: without it, TastyGo's own logs and any future rate limiting would only ever see nginx's IP, not the real client's.</p>
  <div class="sec-num">19.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TastyGo's nginx config forwards requests to the real API container while preserving the original host and client IP for logging and future rate limiting.</p>
  ${qMC('q1', 'med', "If TastyGo's nginx config were missing proxy_set_header X-Real-IP, what real problem would that cause once rate limiting (chapter 25) is added?", ['No real problem, X-Real-IP is purely cosmetic', "Rate limiting would only ever see nginx's own IP for every request, making it unable to distinguish one real client from another", 'The API would stop responding entirely'], 1, "Without the real client IP being preserved, any per-client rate limiting would be unable to tell requests from different real users apart, since they'd all appear to come from nginx itself.")}
`
};

lessons['20'] = {
  short: 'TLS and domain setup', where: 'Part V · <b>TLS and domain setup</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 20</div>
  <h2 class="title">TLS and domain setup</h2>
  <p class="lead">Reusing the DevOps course's TLS termination chapter, applied to TastyGo's real domain.</p>
  <hr class="rule">
  <pre class="code">server {
    listen 443 ssl;
    server_name api.tastygo.com;
    ssl_certificate     /etc/nginx/ssl/tastygo.crt;
    ssl_certificate_key /etc/nginx/ssl/tastygo.key;
    location / { proxy_pass http://127.0.0.1:8000; }
}</pre>
  <p class="body">TLS is terminated at nginx: real users connect over HTTPS to <code class="inl">api.tastygo.com</code>, and nginx decrypts that traffic before forwarding it on to the API container over the private, trusted network, exactly the pattern from the DevOps course, now attached to a real domain name.</p>
  <div class="sec-num">20.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TastyGo's real domain terminates TLS at nginx, the same centralization pattern from the DevOps course, so the API container itself never needs its own certificate.</p>
  ${qMC('q1', 'easy', "Why does TastyGo's API container not need its own TLS certificate, given the nginx config above?", ['Containers are incapable of using HTTPS', 'TLS is terminated once at nginx, which then forwards plain traffic to the API container over the trusted internal network', 'HTTPS is not actually used anywhere in this setup'], 1, 'Centralizing TLS termination at nginx means only one place needs a real certificate; the API container behind it never needs its own separate HTTPS configuration.')}
`
};

lessons['21'] = {
  short: "Logging TastyGo's requests", where: 'Part VI · <b>Logging TastyGo\'s requests</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 21</div>
  <h2 class="title">Logging TastyGo's requests</h2>
  <p class="lead">Reusing the DevOps course's logging chapter, decide exactly what TastyGo's API should actually log.</p>
  <hr class="rule">
  <pre class="code">2026-07-11T09:14:02Z INFO  order_created order_id=4821 customer_id=112 total=600
2026-07-11T09:14:05Z ERROR validation_failed customer_id=112 errors=["Order must have at least one item"]</pre>
  <p class="body">Logging <code class="inl">order_id</code>, <code class="inl">customer_id</code>, and what happened gives enough context to reconstruct a specific event later, without ever logging sensitive fields (a customer's payment details, for instance) in plain text, exactly the balance the DevOps course's logging chapter described.</p>
  <div class="sec-num">21.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TastyGo's logs record enough real context (order id, customer id, what happened) to trace an event later, without ever logging sensitive data in plain text.</p>
  ${qMC('q1', 'easy', "Why does TastyGo's order_created log line include order_id and customer_id, but never a customer's payment details?", ['Payment details are too long to log', 'IDs give enough context to trace a specific event later, while sensitive data like payment details should never be exposed in widely-accessible logs', 'Logging payment details is technically impossible'], 1, "This is the same logging discipline from the DevOps course: enough context to actually investigate an issue later, but never sensitive data that logs aren't a safe place to store.")}
`
};

lessons['22'] = {
  short: 'Monitoring and alerts', where: 'Part VI · <b>Setting up monitoring and alerts</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 22</div>
  <h2 class="title">Setting up monitoring and alerts</h2>
  <p class="lead">Reusing the DevOps course's monitoring chapter: what would actually need to page someone for TastyGo?</p>
  <hr class="rule">
  <p class="body">A sensible starting set of alerts for TastyGo: error rate on <code class="inl">POST /orders</code> spiking above a real threshold, average response time crossing a few seconds, and the database becoming unreachable. Each is a genuine sign something is actually wrong, not noise, exactly the alert-fatigue concern from the DevOps course.</p>
  <div class="sec-num">22.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TastyGo's alerts focus on a small number of genuinely meaningful signals (error rate, response time, database reachability), avoiding the alert fatigue covered in the DevOps course.</p>
  ${qScenario('q1', 'med', 'TastyGo\'s team is deciding whether to alert on every single failed request, or only when the error rate crosses a real threshold (like 5% of requests in 5 minutes). Which would you choose, and why, in one or two sentences?', "Alert on the error rate crossing a real threshold, not every single failed request. A small number of individual failures happens normally (a user submits bad data, for instance); alerting only once error rate crosses a meaningful threshold avoids alert fatigue while still catching genuine, systemic problems.")}
`
};

lessons['23'] = {
  short: 'Planning for scale', where: 'Part VI · <b>Planning for scale</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 23</div>
  <h2 class="title">Planning for scale</h2>
  <p class="lead">Reusing the DevOps course's vertical vs. horizontal scaling chapter, applied as a real decision for TastyGo.</p>
  <hr class="rule">
  <p class="body">If TastyGo's order volume grows, the plan is horizontal scaling: more identical API instances behind the nginx load balancer from chapter 19, not one instance made bigger and bigger. This also means the API instances must stay stateless, not storing anything important only in one instance's own memory, so any instance can handle any request.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Storing an in-progress order's state only in one instance's memory.</b> If a request lands on a different instance next time (which load balancing makes likely), that state would simply be missing; it needs to live in the shared database instead.</li>
  </ul></div>
  <div class="sec-num">23.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Scaling TastyGo horizontally requires its API instances to be stateless, keeping real state in the shared database rather than any one instance's own memory.</p>
  ${qMC('q1', 'med', "Why must TastyGo's API instances be stateless (no important data stored only in one instance's memory) to scale horizontally?", ['Statelessness has no real connection to horizontal scaling', 'A load balancer can send any request to any instance, so state kept only in one instance\'s memory would simply be missing if a later request lands elsewhere', 'Stateless instances use less electricity'], 1, "Since a load balancer can route any request to any instance, state that only exists in one instance's memory would be invisible to every other instance, exactly why real state needs to live in the shared database instead.")}
`
};

lessons['24'] = {
  short: 'Incident response drill', where: 'Part VI · <b>Incident response drill</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 24</div>
  <h2 class="title">Incident response drill</h2>
  <p class="lead">Applying the DevOps course's incident response chapter to a real, specific TastyGo scenario.</p>
  <hr class="rule">
  <p class="body">Scenario: right after a deploy, the error rate on <code class="inl">POST /orders</code> spikes to 40%. Following the DevOps course's flow: acknowledge the alert, assess impact (customers currently unable to place orders), mitigate first (roll back to the previous image), and only afterward investigate the actual root cause and write a blameless postmortem.</p>
  <div class="sec-num">24.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A real TastyGo incident is handled by mitigating fast (rollback) first, then investigating and documenting the root cause afterward, without assigning personal blame.</p>
  ${qScenario('q1', 'hard', 'Write a short (2-3 sentence) incident summary for the scenario above (order errors spiking to 40% right after a deploy), following the mitigate-first, blameless approach from the DevOps course.', "At 09:14, error rate on POST /orders spiked to 40% immediately following a deploy. The deploy was rolled back to the previous known-good image, restoring normal error rates within minutes. Root cause (a bug in the new validation logic) was identified afterward through a blameless review, and a regression test was added to the CI suite to catch this class of issue before future deploys.")}
`
};

lessons['25'] = {
  short: 'Rate limiting', where: 'Part VII · <b>Rate limiting and abuse prevention</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 25</div>
  <h2 class="title">Rate limiting and abuse prevention</h2>
  <p class="lead">A new concept for this course: protecting TastyGo's API from being overwhelmed, whether by a bug or deliberate abuse.</p>
  <hr class="rule">
  <p class="body">${term('rate_limiting', 'Rate limiting')} caps how many requests a single client can make in a given time window, for example, at most 100 requests per minute per API key or IP. Without it, a single buggy client (an app stuck in a retry loop) or a deliberate abuser could overwhelm the API, degrading it for every other real customer at the same time.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Setting a rate limit so low it blocks real, normal usage.</b> A limit needs to be generous enough for legitimate traffic patterns while still catching genuinely abusive volumes; this usually takes real traffic data to tune correctly.</li>
  </ul></div>
  <div class="sec-num">25.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Rate limiting caps requests per client in a time window, protecting the whole system from being degraded by one buggy or abusive client.</p>
  ${qMC('q1', 'easy', "What problem does rate limiting protect TastyGo's API from?", ['It has no real protective purpose, purely cosmetic', 'A single buggy or abusive client sending an overwhelming number of requests, degrading the API for every other real customer', 'It prevents the API from ever returning errors'], 1, 'Rate limiting exists precisely to stop one client, whether through a bug or deliberate abuse, from consuming so many requests that it degrades the API for everyone else.')}
`
};

lessons['26'] = {
  short: 'API docs and versioning', where: 'Part VII · <b>API docs and versioning</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 26</div>
  <h2 class="title">API docs and versioning</h2>
  <p class="lead">Reusing FastAPI's automatic docs chapter, plus a new idea: what happens when TastyGo's API needs to change later?</p>
  <hr class="rule">
  <p class="body">If FastAPI was your framework, <code class="inl">/docs</code> already documents every endpoint automatically. ${term('api_versioning', 'API versioning')} (paths like <code class="inl">/v1/orders</code>) matters once the API has real clients: it lets you change or improve <code class="inl">/v2/orders</code> without breaking whatever's still calling <code class="inl">/v1/orders</code>, rather than forcing every client to upgrade at the exact same moment you deploy a change.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Changing an existing endpoint's behavior in place, with no version change.</b> Any client depending on the old behavior breaks immediately and without warning, exactly what versioning is meant to prevent.</li>
  </ul></div>
  <div class="sec-num">26.1</div><h3 class="section-h">Recap</h3>
  <p class="body">API versioning lets TastyGo's API evolve without breaking every existing client the moment a change ships.</p>
  ${qMC('q1', 'med', "Why introduce /v2/orders instead of changing the existing behavior of /v1/orders in place?", ['Version numbers are required by HTTP', 'Changing /v1/orders in place would immediately break any existing client relying on its old behavior; /v2 lets both versions coexist until clients choose to upgrade', 'It makes the API run in parallel on two separate servers automatically'], 1, "This is exactly what API versioning is for: letting an API change and improve while existing clients depending on the old version keep working until they're ready to move to the new one.")}
`
};

lessons['27'] = {
  short: 'Security review checklist', where: 'Part VII · <b>A security review checklist</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 27</div>
  <h2 class="title">A security review checklist</h2>
  <p class="lead">Before calling TastyGo's backend "done," a real, final pass across everything this course has covered.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">A real, practical checklist</div>
    <div class="qb-row"><span class="qb-kw kw-p">Secrets</span><span class="qb-mean">only in environment variables, never committed to version control (chapter 15)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">TLS</span><span class="qb-mean">enforced on every real request (chapter 20)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Validation</span><span class="qb-mean">both framework-level and business-rule level, on every input (chapters 06, 10)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Rate limiting</span><span class="qb-mean">in place on public endpoints (chapter 25)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Logging</span><span class="qb-mean">enough context to investigate, never sensitive data (chapter 21)</span></div>
  </div>
  <div class="sec-num">27.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This checklist deliberately isn't new material, it's a real, practical pass across everything this course has already covered, exactly the kind of review a real team does before shipping.</p>
  ${qMC('q1', 'easy', "Why is this security checklist made up entirely of things already covered earlier in this course, rather than new material?", ['There was nothing else left to teach', "A real security review is a practical pass across decisions already made (secrets, TLS, validation, rate limiting, logging), confirming they're actually in place, not a search for exotic new threats", 'Security reviews are unrelated to backend development'], 1, "A genuinely useful security review checks that the real, practical decisions already made throughout a project (secrets handling, TLS, validation, rate limiting, logging) are actually, verifiably in place.")}
`
};

lessons['28'] = {
  short: 'Your complete architecture', where: 'Part VIII · <b>Your complete TastyGo architecture</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 28</div>
  <h2 class="title">Your complete TastyGo architecture</h2>
  <p class="lead">Every decision from this course, drawn as one real system.</p>
  <hr class="rule">
  <svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:640px;display:block;margin:10px auto" role="img" aria-label="Complete TastyGo architecture diagram">
    <rect x="10" y="10" width="620" height="46" rx="8" fill="none" stroke="var(--edge,#3a4a55)"/>
    <text x="320" y="38" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="13">Client (HTTPS) → nginx (TLS, load balancing, rate limiting)</text>
    <line x1="320" y1="56" x2="320" y2="86" stroke="var(--edge,#3a4a55)"/>
    <rect x="120" y="86" width="140" height="46" rx="8" fill="none" stroke="var(--accent,#5ec8bd)"/>
    <text x="190" y="114" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="12">API instance 1</text>
    <rect x="380" y="86" width="140" height="46" rx="8" fill="none" stroke="var(--accent,#5ec8bd)"/>
    <text x="450" y="114" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="12">API instance 2</text>
    <text x="320" y="107" text-anchor="middle" fill="var(--muted,#93a4ac)" font-size="20">…</text>
    <text x="320" y="150" text-anchor="middle" fill="var(--muted,#93a4ac)" font-size="11">order_total · validate_order · eta_minutes (Part II, tested independently)</text>
    <line x1="190" y1="132" x2="270" y2="180" stroke="var(--edge,#3a4a55)"/>
    <line x1="450" y1="132" x2="370" y2="180" stroke="var(--edge,#3a4a55)"/>
    <rect x="220" y="180" width="200" height="40" rx="8" fill="none" stroke="var(--edge,#3a4a55)"/>
    <text x="320" y="205" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="12">Postgres (volume-backed)</text>
    <rect x="60" y="240" width="220" height="40" rx="8" fill="none" stroke="var(--edge,#3a4a55)"/>
    <text x="170" y="265" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="12">CI/CD (test → build → deploy)</text>
    <rect x="360" y="240" width="220" height="40" rx="8" fill="none" stroke="var(--edge,#3a4a55)"/>
    <text x="470" y="265" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="12">Logging + monitoring + alerts</text>
  </svg>
  <p class="body">Every box in this diagram is a real decision you reasoned through in this course: the request path, the tested pure logic underneath the routes, the database, the deployment pipeline, and the operational layer watching all of it. This is what "full stack" actually means: not one technology, but this whole connected picture.</p>
  <div class="sec-num">28.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This diagram is the real synthesis of the entire Developer track: design, code, container, deploy, and operate, as one connected system rather than separate topics.</p>
  ${qMC('q1', 'easy', 'In the architecture diagram, why do the order_total, validate_order, and eta_minutes functions sit "underneath" the API instances rather than being part of the diagram\'s request path itself?', ['They are not actually used in production', "They're the tested, framework-independent logic each route handler calls; they're conceptually a layer underneath the routing/HTTP concerns, not a separate service", 'They only run during local development'], 1, 'These functions are called from inside the route handlers as plain, already-tested logic, a layer beneath the HTTP/routing concerns, exactly the separation established back in chapter 09.')}
`
};

lessons['29'] = {
  short: 'Where to go from here', where: 'Part VIII · <b>Where to go from here</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 29</div>
  <h2 class="title">Where to go from here</h2>
  <p class="lead">This is the end of the Developer track. Here's what to actually do with everything you've built.</p>
  <hr class="rule">
  <p class="body">The real next step is turning this course's ideas into an actual repository: implement the three endpoints for real, in Django or FastAPI, with the Dockerfile and docker-compose.yml from Part IV, a CI workflow from Part V, and a short README explaining the architecture from chapter 28 and the deliberate scope decisions from chapter 04. That combination, working code plus a clear explanation of real decisions, is exactly what a ${term('portfolio_project', 'portfolio project')} needs to be.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Treating "finishing this course" as the same as "having a finished project."</b> This course builds the thinking and the tested core logic; turning it into an actual, running repository is real, valuable work still worth doing afterward.</li>
  </ul></div>
  <div class="sec-num">29.1</div><h3 class="section-h">Recap</h3>
  <p class="body">The real next step is an actual repository: the endpoints, the Dockerfile and compose file, a CI workflow, and a README explaining your real architecture and scope decisions.</p>
  ${qMC('q1', 'easy', "What is the single most valuable next step after finishing this course?", ['Immediately starting a completely different, unrelated course', "Turning this course's design and tested logic into an actual, running repository with a Dockerfile, CI workflow, and a README explaining the real decisions made", 'Memorizing every chapter\'s cheat sheet word for word'], 1, "This course builds the real thinking and tested core logic; turning that into an actual repository, with real code and a clear explanation of decisions, is what makes it a genuine, demonstrable portfolio project.")}
`
};

/* ---------- cheat sheet (extended incrementally as Parts III-VIII are added) ---------- */
const CHEATS = {
  '00': { note: 'The Capstone combines design, real Python logic, containerization, and deployment planning into one connected project — a genuine portfolio piece.' },
  '0b': { note: 'Works with either Django or FastAPI as your mental model. Part II (05-08) runs real, live Python; everything else is guided design/config practice.' },
  '0i': { note: "This build deliberately scopes to three endpoints: create an order, fetch a restaurant's menu, check an order's status." },
  '01': { code: 'POST   /orders\nGET    /restaurants/{id}/menu\nGET    /orders/{id}\n# name every endpoint before writing any implementation' },
  '02': { code: 'Order { id, customer_id, restaurant_id, items, status: one of a fixed set, total }\n# fix allowed values (like status) up front' },
  '03': { note: 'Order references customer_id and restaurant_id by id (a real foreign-key relationship), avoiding duplicated, staleness-prone copies of data.' },
  '04': { note: 'A real MVP names what it deliberately excludes (payments, delivery assignment, etc.) just as clearly as what it includes.' },
  '05': { code: 'def order_total(items):\n    return sum(i["price"] * i["quantity"] for i in items)' },
  '06': { code: 'def validate_order(items):\n    if not items: return ["Order must have at least one item"]\n    return [f"Item {i} has invalid quantity" for i, it in enumerate(items,1) if it["quantity"]<=0]' },
  '07': { code: 'def eta_minutes(prep_minutes, distance_km):\n    return prep_minutes + (distance_km * 3)' },
  '08': { note: 'A good test checks a normal case AND a meaningful edge case (zero, empty, boundary), not just the obvious happy path.' },
  '09': { note: 'Keep route handlers thin: call already-tested, framework-independent functions (validate_order, order_total) rather than duplicating logic inline.' },
  '10': { note: 'Framework validation checks shape/types (is quantity a number?). Your own function checks business rules (at least one item). Both layers matter.' },
  '11': { note: 'Persistence (ORM save) is a separate step from the pure calculation, which is why order_total could be tested without any real database.' },
  '12': { code: 'GET /orders/999 (missing)     -> 404\nPOST /orders (bad data)       -> 422\nPOST /orders (server bug)     -> 500' },
  '13': { code: 'FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt . / RUN pip install -r requirements.txt\nCOPY . .\nCMD [...]' },
  '14': { code: 'services:\n  api: { build: ., depends_on: [db] }\n  db: { image: postgres:16, volumes: [...] }' },
  '15': { note: 'Env vars (DATABASE_URL, SECRET_KEY, DEBUG) keep the same built image reusable across local/staging/production with no secrets baked in.' },
  '16': { code: 'docker compose up -d\ncurl -X POST http://localhost:8000/orders -d \'{...}\'\ndocker compose logs -f api' },
  '17': { note: 'CI runs the real test suite (Part II functions + Part III endpoints) automatically on every push and pull request.' },
  '18': { code: 'jobs:\n  deploy:\n    needs: test   # never deploy before tests pass\n    steps: [build, push, ssh + compose pull/up]' },
  '19': { code: 'location / {\n  proxy_pass http://127.0.0.1:8000;\n  proxy_set_header X-Real-IP $remote_addr;\n}' },
  '20': { note: 'TLS terminated once at nginx for api.tastygo.com; the API container behind it never needs its own certificate.' },
  '21': { note: 'Log order_id, customer_id, and what happened — enough real context to investigate, never sensitive data in plain text.' },
  '22': { note: 'Alert on error rate crossing a real threshold (e.g. 5% in 5 min), response time, and DB reachability — not every single failure.' },
  '23': { note: 'Scale horizontally (more stateless instances behind the load balancer), not vertically. Keep real state in the shared database.' },
  '24': { note: 'Incident flow: acknowledge, assess impact, mitigate first (rollback), investigate root cause after, write a blameless postmortem.' },
  '25': { note: 'Rate limiting caps requests per client per time window, protecting the whole API from one buggy or abusive client.' },
  '26': { note: 'API versioning (/v1, /v2) lets the API evolve without breaking existing clients the moment a change ships.' },
  '27': { note: 'Security review: secrets in env vars, TLS enforced, validation at both layers, rate limiting in place, logging without sensitive data.' },
  '28': { note: 'Full architecture: client -> nginx (TLS/LB/rate limit) -> API instances (calling tested Part II logic) -> Postgres, plus CI/CD and monitoring.' },
  '29': { note: 'Next step: turn this into an actual repository — endpoints, Dockerfile, compose file, CI workflow, and a README explaining your real decisions.' },
};
function inShort(num){var c=(typeof CHEATS!=='undefined')?CHEATS[num]:null;if(!c)return '';var h='<div class="inshort"><div class="inshort-label">In short</div>';if(c.note)h+='<p>'+c.note+'</p>';if(c.code)h+='<pre class="code">'+String(c.code).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>';return h+'</div>';}
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
      h += `<div class="cheat-card"><div class="cheat-card-h"><span class="ch">${n}</span> ${t}</div>${c.code ? `<pre class="code" style="white-space:pre-wrap;">${c.code}</pre>` : ''}${c.note ? `<div class="q-hint">${c.note}</div>` : ''}</div>`;
    });
    h += `</div>`;
  });
  return h;
}
lessons['cheatsheet'] = { short: 'Cheat sheet', where: '<b>Cheat sheet</b>', render: renderCheatsheet };
/* ---------- interview questions & answers ---------- */
function iq(level, q, a) { const cls = level === 'Beginner' ? 'lv-e' : level === 'Intermediate' ? 'lv-m' : 'lv-h'; return `<details class="iq"><summary><span class="q-lvl ${cls}">${level}</span><span class="iq-q">${q}</span></summary><div class="iq-a">${a}</div></details>`; }
function renderInterview() {
  const arch = `<div class="iq-flow"><span>Client</span><i>&rarr;</i><span>Load balancer</span><i>&rarr;</i><span>API (FastAPI/Django)</span><i>&rarr;</i><span>Business logic</span><i>&rarr;</i><span>Database</span></div>`;
  return `
  <div class="eyebrow">Interview prep</div>
  <h2 class="title">Capstone &amp; system-design interview questions</h2>
  <p class="lead">The capstone brings Python, a web framework and DevOps together to build a real backend &mdash; so its interview questions are about explaining what you built and reasoning about design at scale. Use these to rehearse your project walkthrough. Click any question to expand it.</p>
  <button class="pg-btn pg-ghost" style="margin:6px 0 10px" onclick="window.print()">Print / save as PDF</button>
  <hr class="rule">

  <h3 class="section-h">Explaining your project</h3>
  ${iq('Beginner','How should you walk an interviewer through a project you built?',`<p>Structure it: the <b>problem</b> and users, the <b>architecture</b> at a high level, your <b>role</b> and key decisions, the <b>trade-offs</b> you made, and the <b>outcome</b> plus what you learned. Lead with the why, then go deep where they probe.</p>`)}
  ${iq('Intermediate','Describe the architecture of your backend.',`<p>A clear layered story: clients hit an API behind a load balancer; the API validates input and delegates to business-logic/service functions; those read and write a database; slow or async work goes to a queue.</p>${arch}`)}
  ${iq('Intermediate','How did you design the REST API?',`<p>Resource-oriented URLs (nouns), correct HTTP methods and status codes, consistent JSON request/response shapes, validation with clear errors, pagination for lists, versioning, and auth on protected routes.</p>`)}
  ${iq('Intermediate','How did you model the data?',`<p>Identify entities and relationships (customers, restaurants, orders), choose keys, normalise to avoid redundancy, then index the columns you filter/join on. Be ready to justify each foreign key and where you would denormalise for reads.</p>`)}
  ${iq('Intermediate','How did you implement authentication?',`<p>Token-based (OAuth2 bearer / JWT): the user logs in, receives a signed token, and sends it on each request; a dependency/middleware verifies it and loads the user. Passwords are hashed; protected routes check permissions.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Designing for scale</h3>
  ${iq('Advanced','How would you scale this backend?',`<p>Make the app stateless and run multiple instances behind a load balancer (horizontal scale); add read replicas and connection pooling for the database; cache hot reads; and move slow work to a background queue. Measure first, then scale the actual bottleneck.</p>`)}
  ${iq('Advanced','What would you cache, and where?',`<p>Cache expensive, frequently-read, rarely-changing data (e.g. restaurant listings) in an in-memory store like Redis, with sensible TTLs and invalidation on writes. Also use HTTP/CDN caching for static responses. Beware stale data and cache stampedes.</p>`)}
  ${iq('Advanced','How do you decide what to index?',`<p>Index columns you filter, join or sort on frequently, especially foreign keys. Weigh the read speedup against slower writes and storage, use composite indexes for multi-column filters (leftmost-prefix), and confirm with the query plan.</p>`)}
  ${iq('Advanced','How do you prevent a duplicate or double-charged order?',`<p>Make the operation <b>idempotent</b>: accept a client-supplied idempotency key and ignore repeats; enforce uniqueness at the database (a unique constraint), and use a transaction so the charge and the order commit atomically. Never rely on the client not to double-submit.</p>`)}
  ${iq('Advanced','What is idempotency and where does it matter?',`<p>An operation is idempotent if doing it twice has the same effect as once. It matters for retries and unreliable networks &mdash; payments, order creation, webhooks &mdash; so a retried request does not create duplicates.</p>`)}
  ${iq('Advanced','How would you add rate limiting?',`<p>Cap requests per client/API key over a window (token-bucket or fixed-window), typically at the gateway/reverse proxy or with a shared store like Redis, returning <code class="inl">429</code> when exceeded. It protects the service from abuse and overload.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Quality &amp; delivery</h3>
  ${iq('Intermediate','How did you test it?',`<p>Unit tests for business logic, API/integration tests for endpoints (with a test database and overridden dependencies), and a few end-to-end checks &mdash; following the test pyramid. Tests run in CI on every push.</p>`)}
  ${iq('Intermediate','What does your CI/CD pipeline do?',`<p>On each commit: install, lint, run tests, build a container image, push it to a registry, deploy to staging, and (after checks/approval) promote the same image to production &mdash; with the ability to roll back.</p>`)}
  ${iq('Intermediate','How did you containerize and deploy it?',`<p>A Dockerfile ordered for good layer caching (deps before source), a small base image, config via environment variables, a health-check endpoint, and deployment of the built image to the target (container platform / orchestrator) behind a reverse proxy.</p>`)}
  ${iq('Intermediate','How do you manage configuration and secrets?',`<p>Twelve-factor style: all config from environment variables per environment, secrets from a secret store (never in code or the image), and the same artifact promoted across dev/staging/prod.</p>`)}
  ${iq('Advanced','How do you monitor it in production?',`<p>Structured logs, metrics (latency, error rate, throughput), and traces, shipped to a dashboard; health checks for liveness/readiness; and alerts on SLO breaches so problems are caught before users report them.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Reflection</h3>
  ${iq('Advanced','What trade-offs did you make?',`<p>Name real ones: a monolith over microservices for simplicity, synchronous over async where volume was low, denormalising a table for read speed, or shipping an MVP over gold-plating. Show you chose deliberately, given constraints.</p>`)}
  ${iq('Advanced','What would you do differently or add next?',`<p>Have a credible answer: more test coverage, caching a hot path, async processing for a slow step, better observability, or splitting out a service once a bottleneck justified it. Shows growth and product sense.</p>`)}
  ${iq('Advanced','Describe the hardest bug you hit and how you solved it.',`<p>Use a structured story: the symptom, how you reproduced and isolated it (logs, bisection, a minimal case), the root cause, the fix, and how you prevented recurrence (a test, an alert). Emphasise method over luck.</p>`)}
  ${iq('Intermediate','How do you keep code quality high?',`<p>Code review via pull requests, automated linting/formatting and tests in CI, clear structure and naming, and small focused changes. Quality is a team habit enforced by the pipeline, not a one-off cleanup.</p>`)}

  <div class="foot" style="margin-top:30px"><span></span><button class="f-btn f-next" onclick="go('${order[0]}')">Back to the course &rarr;</button></div>`;
}
lessons['interview'] = { short: 'Interview Q&A', where: '<b>Interview Q&A</b>', render: renderInterview };

