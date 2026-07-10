/* ============================================================
   QA Track — Software Testing course engine
   Mirrors public/ba.js patterns: manifest, lessons, progress
   tracking, search, cheat sheet, glossary — practice is either
   auto-graded multiple choice or scenario + model answer.
   ============================================================ */

document.getElementById('loader').style.display = 'none';

/* ---------- glossary ---------- */
const glossary = {
  defect: { short: 'A flaw in the software that causes it to behave incorrectly.', long: 'A defect (or bug) is a flaw in code that can cause a failure, an observable incorrect behaviour, under the right conditions. Not every defect has been triggered into a visible failure yet.' },
  test_case: { short: 'A documented set of steps, data, and expected result used to check one specific thing.', long: 'A test case names preconditions, the exact steps to follow, the test data to use, and the expected result, precisely enough that two different testers would execute it identically and agree on pass or fail.' },
  equivalence_partitioning: { short: 'Grouping inputs into sets that should behave the same way, then testing one from each.', long: 'Equivalence partitioning divides possible inputs into partitions (groups) where the system is expected to behave identically. Instead of testing every possible value, you test one representative value from each partition, valid and invalid.' },
  boundary_value: { short: 'Testing right at the edges of a valid range, where bugs cluster.', long: 'Boundary value analysis tests the exact edges of a valid range (the minimum, just below it, and just above it, same for the maximum), since off-by-one mistakes are one of the most common bug sources in real systems.' },
  regression: { short: 'Re-testing that a previously working feature still works after a change.', long: 'Regression testing re-runs existing test cases after a code change to confirm nothing that used to work has broken, since fixing or adding one thing can unintentionally affect another.' },
  severity: { short: 'How badly a bug damages the system if it occurs.', long: 'Severity measures technical impact: does the bug crash the app, corrupt data, or just misalign a label by two pixels? It is independent of how often the bug is likely to be hit.' },
  priority: { short: 'How soon a bug should be fixed, relative to other work.', long: 'Priority measures business urgency: how soon should this be fixed given everything else on the team\'s plate? A low-severity bug can still be high priority if, for example, it is highly visible to executives.' },
  traceability: { short: 'Linking each requirement to the test case(s) that verify it.', long: 'A traceability matrix maps every requirement to the test case(s) that verify it, so nothing ships without at least one test checking it actually works, and no requirement silently goes untested.' },
  api: { short: 'A defined way for one piece of software to ask another for something.', long: 'An API (Application Programming Interface) is a contract: send a request in an agreed format, get a response back in an agreed format. Testing an API means checking that contract holds under normal, edge, and invalid conditions.' },
  automation: { short: 'Using code to run a test instead of a person clicking through it.', long: 'Test automation is writing code that exercises the system and checks the result, so a test can be re-run instantly and repeatedly, valuable for regression testing, less valuable for one-off or highly exploratory checks.' },
  test_pyramid: { short: 'A guideline for how much of each test type to write: lots of unit tests, fewer end-to-end.', long: 'The test pyramid recommends a large base of fast, cheap unit tests, a smaller middle layer of integration tests, and a small top layer of slow, expensive end-to-end tests, because each layer up is slower and more brittle than the one below it.' },
};
function term(w, label) {
  const g = glossary[w];
  return `<span class="term" tabindex="0" role="button" aria-label="${label || w}, glossary term, press Enter to read more" onclick="qaMore('${w}',this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();qaMore('${w}',this)}">${label || w}<span class="tip">${g.short}<br><span style="color:#7fd8cb;font-size:11px">press Enter or click to read more</span></span></span>`;
}
function qaMore(w, el) {
  const g = glossary[w];
  let b = el.closest('p,.lead,.txt'); if (!b) b = el.parentElement;
  let ex = b.parentElement.querySelector('.term-more[data-w="' + w + '"]');
  if (ex) { ex.classList.toggle('show'); if (!ex.classList.contains('show')) ex.remove(); return; }
  const d = document.createElement('div'); d.className = 'term-more show'; d.setAttribute('data-w', w);
  d.innerHTML = `<b style="text-transform:capitalize">${w.replace(/_/g, ' ')}</b>. ${g.long}`;
  b.insertAdjacentElement('afterend', d);
}

/* ---------- practice: auto-graded multiple choice ---------- */
let qCount = 0; let solved = 0; const answers = {};
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
  else { fb.className = 'q-fb no'; fb.innerHTML = '&#10007; Not quite. ' + (m.explain || 'Re-read the scenario and try again.'); }
}

/* ---------- practice: scenario + model-answer (self-checked) ---------- */
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

/* ---------- progress ---------- */
function updateProg() { if (qCount === 0) { document.getElementById('progLabel').textContent = 'Read'; document.getElementById('progFill').style.width = '0%'; return; } document.getElementById('progLabel').textContent = `${solved} / ${qCount}`; document.getElementById('progFill').style.width = ((solved / qCount) * 100) + '%'; }

let curCh = null, TOTAL_Q = 0, PROG = {};
try { PROG = JSON.parse(localStorage.getItem('qa_progress') || '{}'); } catch (_) { PROG = {}; }
function markProg(ch, id) { if (!ch) return; if (!PROG[ch]) PROG[ch] = {}; PROG[ch][id] = true; try { localStorage.setItem('qa_progress', JSON.stringify(PROG)); } catch (_) { } updateCourse(); }
function overallSolved() { let n = 0; for (const c in PROG) { n += Object.keys(PROG[c]).length; } return n; }
function updateCourse() {
  const el = document.getElementById('courseProg'); const fill = document.getElementById('courseProgFill'); const n = overallSolved();
  const done = TOTAL_Q > 0 && n >= TOTAL_Q;
  if (el) el.textContent = TOTAL_Q ? (done ? `Course complete — ${n} / ${TOTAL_Q} solved` : `Overall: ${n} / ${TOTAL_Q} solved`) : '';
  if (fill) fill.style.width = TOTAL_Q ? ((n / TOTAL_Q) * 100) + '%' : '0%';
  if (done) celebrateOnce();
}
function celebrateOnce() {
  let shown = false; try { shown = localStorage.getItem('qa_celebrated') === '1'; } catch (_) { }
  if (shown) return;
  try { localStorage.setItem('qa_celebrated', '1'); } catch (_) { }
  const t = document.createElement('div'); t.className = 'celebrate-toast';
  t.innerHTML = '<b>Every chapter solved.</b><br>You have worked through the whole QA track. Well done.';
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('show'); }, 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 6000);
}
function computeTotals() { const sq = qCount; TOTAL_Q = 0; for (const k in lessons) { qCount = 0; try { lessons[k].render(); } catch (_) { } TOTAL_Q += qCount; } qCount = sq; for (const kk in answers) delete answers[kk]; updateCourse(); }
function resetProgress() { if (!window.confirm('Reset all solved progress across every chapter? This cannot be undone.')) return; PROG = {}; try { localStorage.removeItem('qa_progress'); } catch (_) { } updateCourse(); if (curCh) go(curCh); }
function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('navOverlay').classList.toggle('show'); }
function closeMenu() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('navOverlay').classList.remove('show'); }

/* ---------- navigation ---------- */
const manifest = [
  { p: 'Groundwork', items: [['00', 'What QA actually does', 1], ['0b', 'The QA toolkit landscape', 1], ['0i', 'Meet the company', 1]] },
  { p: 'Part I · Testing fundamentals', items: [['01', 'What is a bug, really?', 1], ['02', 'Anatomy of a test case', 1], ['03', 'Positive vs. negative testing', 1], ['04', 'Test data & environments', 1]] },
  { p: 'Part II · Manual testing techniques', items: [['05', 'Equivalence partitioning', 1], ['06', 'Boundary value analysis', 1], ['07', 'Exploratory testing', 1], ['08', 'Regression testing', 1]] },
  { p: 'Part III · Writing bug reports', items: [['09', 'Anatomy of a good bug report', 1], ['10', 'Severity vs. priority', 1], ['11', 'Reproducing & isolating a bug', 1], ['12', 'Writing steps to reproduce', 1]] },
  { p: 'Part IV · Test design & planning', items: [['13', 'Test plans & strategy', 1], ['14', 'Traceability: requirements to tests', 1], ['15', 'Risk-based testing', 1], ['16', 'Test case management', 1]] },
  { p: 'Part V · API & backend testing', items: [['17', 'Testing an API', 1], ['18', 'HTTP status codes', 1], ['19', 'Testing with SQL', 1], ['20', 'Edge cases in data', 1]] },
  { p: 'Part VI · Automation fundamentals', items: [['21', 'Why (and what to) automate', 1], ['22', 'Anatomy of an automated test', 1], ['23', 'Locators & selectors', 1], ['24', 'CI/CD & running tests automatically', 1]] },
  { p: 'Part VII · Beyond functional testing', items: [['25', 'Performance testing basics', 1], ['26', 'Security testing basics', 1], ['27', 'Accessibility & usability', 1]] },
  { p: 'Part VIII · Career', items: [['28', 'Certifications & career paths', 1], ['29', 'Interview questions & cases', 1]] },
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
buildNav();

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
  qCount = 0; solved = 0; for (const k in answers) delete answers[k];
  document.getElementById('content').innerHTML = L.render() + foot(num);
  document.getElementById('crumb').innerHTML = L.where;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('nav-' + num); if (el) el.classList.add('active');
  const done = PROG[num] || {};
  Object.keys(answers).forEach(id => {
    if (done[id] && !answers[id].solved) {
      answers[id].solved = true; solved++;
      const fb = document.getElementById('fb-' + id);
      if (fb) { fb.className = 'q-fb ok'; fb.innerHTML = answers[id].type === 'scenario' ? ('&#10003; Solved earlier.<br><b>One good version:</b><br>' + answers[id].modelAnswer) : '&#10003; Solved earlier. Run it again any time to practise.'; }
    }
  });
  updateProg();
  closeMenu();
  window.scrollTo({ top: 0 });
}

/* ---------- lessons ---------- */
const lessons = {};

lessons['00'] = {
  short: 'What QA does', where: 'Groundwork · <b>What QA actually does</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 00</div>
  <h2 class="title">What QA actually does</h2>
  <p class="lead">QA is not "the people who click around and hope something breaks." It is the discipline of asking, systematically, "what would make this fail," before a customer finds out the hard way.</p>
  <hr class="rule">
  <p class="body">A ${term('defect', 'defect')} is a flaw sitting quietly in the code. A failure is what happens when a user actually triggers it. QA's job is to find defects before they become failures a customer experiences, by deliberately trying the things a normal, careful walkthrough would never think to try.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">A new chai stall owner tastes their own chai and it's perfect, sweet, right temperature. A good QA mindset asks different questions: what if the customer wants no sugar? What if they order 10 cups at once? What if the gas runs out mid-brew? What if two orders come in with the exact same name? The stall works fine for the "normal" case, QA exists for everything else.</div></div>
  <div class="qb"><div class="qb-title">What a tester actually spends time on</div>
    <div class="qb-row"><span class="qb-kw kw-p">Designing tests</span><span class="qb-mean">deciding what to check and with what data, before anything is built or changed</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Executing tests</span><span class="qb-mean">manually or via automation, running those checks against the real system</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Reporting bugs</span><span class="qb-mean">writing up what went wrong precisely enough that a developer can fix it without guessing</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Thinking QA is just "using the app a lot."</b> Undirected clicking finds far fewer bugs than deliberately designed tests.</li>
    <li><b>Testing only the happy path.</b> The interesting bugs live in what happens when things go wrong, not when everything goes right.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">QA systematically looks for the conditions under which software breaks, before a real customer finds them. It spans designing tests, executing them, and reporting what actually went wrong clearly enough to get fixed.</p>
  ${qMC('q1', 'easy', 'What is the difference between a defect and a failure?',
    ['They are the same thing', 'A defect is a flaw in the code; a failure is what happens when that flaw is actually triggered', 'A defect only applies to security issues'],
    1, 'A defect can sit unnoticed in code for a long time; it only becomes a failure once real conditions actually trigger the incorrect behaviour.')}
  ${qMC('q2', 'easy', 'Why is testing only the "happy path" (everything going right) not enough?',
    ['It is enough, most users only use the happy path', 'Most real bugs live in edge cases and error conditions the happy path never exercises', 'Happy path testing is not a real testing technique'],
    1, 'Deliberately unusual, invalid, or edge-case inputs are where software most often breaks, and the happy path never exercises them.')}
  ${qScenario('q3', 'med', 'TastyGo just added a "schedule an order for later" feature. Name three non-obvious things you would want to test beyond "does scheduling work."',
    'Reasonable non-obvious tests: (1) scheduling an order for a time the restaurant will be closed, (2) scheduling two orders back to back from the same customer to the same restaurant, (3) the restaurant cancelling or going offline between when the order was scheduled and when it is due to start. These go beyond the basic "does it work" case into the conditions QA specifically exists to catch.')}
`
};

lessons['0b'] = {
  short: 'QA toolkit', where: 'Groundwork · <b>The QA toolkit landscape</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0b</div>
  <h2 class="title">The QA toolkit landscape</h2>
  <p class="lead">Like the BA toolkit, none of these tools replace testing judgement, they just make it faster and more consistent to apply.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The everyday toolkit</div>
    <div class="qb-row"><span class="qb-kw kw-p">JIRA / Azure DevOps</span><span class="qb-mean">logging and tracking bugs through to resolution</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">TestRail / Zephyr</span><span class="qb-mean">organizing test cases into suites, and recording pass/fail runs</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Postman</span><span class="qb-mean">sending API requests directly and inspecting the response</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Selenium / Playwright</span><span class="qb-mean">automating browser actions so tests can run without a human clicking</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">SQL</span><span class="qb-mean">checking directly what actually landed in the database, instead of trusting the UI</span></div>
  </div>
  <p class="body">That last one matters more than it might seem. If a refund is supposed to update an order's status, the UI might show the right message even if the underlying database write silently failed; a tester who can run <code class="inl">SELECT status FROM orders WHERE id = ...</code> can confirm the truth directly, which is exactly what <a href="/courses/sql">SQLingo</a> teaches.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Trusting the UI completely.</b> A confirmation message on screen is not proof the backend actually did the right thing.</li>
    <li><b>Learning a tool before learning testing itself.</b> A tool only executes a testing strategy faster, it does not design one for you.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Bug trackers, test case managers, API tools, and automation frameworks all support the same core skill: knowing what to check and why. SQL is an underrated QA tool for confirming what actually happened underneath the UI.</p>
  ${qMC('q1', 'easy', 'Why might a tester want to check the database directly instead of just trusting a success message in the UI?',
    ['The UI is always wrong', 'A UI message can display success even if the underlying data was not actually updated correctly', 'Databases are easier to read than screens'],
    1, 'A UI can show a success message due to a bug in its own display logic, independent of whether the backend actually saved the correct data.')}
  ${qMC('q2', 'med', 'Which tool would you reach for to send a request directly to a backend endpoint and inspect its raw response?',
    ['TestRail', 'Postman', 'Selenium'],
    1, 'Postman is built specifically for constructing and sending API requests and examining the raw response, independent of any user interface.')}
`
};

lessons['0i'] = {
  short: 'Meet the company', where: 'Groundwork · <b>Meet the company</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0i</div>
  <h2 class="title">Meet the company</h2>
  <p class="lead">Same TastyGo as SQLingo and the BA track: a food delivery app connecting customers to restaurants through orders. Here, we look at it as a tester trying to break it.</p>
  <hr class="rule">
  <p class="body">Three tables, three very different failure surfaces to think about as a tester:</p>
  <div class="qb"><div class="qb-title">Where bugs like to hide in this system</div>
    <div class="qb-row"><span class="qb-kw kw-p">customers</span><span class="qb-mean">duplicate signups, invalid cities, two customers with identical names</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">restaurants</span><span class="qb-mean">a rating outside 0-5, negative cost_for_two, a restaurant with no cuisine set</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">orders</span><span class="qb-mean">an order pointing at a customer or restaurant that no longer exists, a NULL rating being treated as a zero</span></div>
  </div>
  <p class="body">Notice orders is the riskiest table: it links the other two, so a bug there (like the NULL rating handling covered in SQLingo chapter 08) can quietly corrupt reports across the whole business, not just one screen.</p>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">The same TastyGo dataset used throughout this whole platform gives us a consistent, realistic surface to design real test cases against for the rest of this course.</p>
  ${qMC('q1', 'easy', 'Why is the "orders" table often the riskiest place for bugs to cause wide damage?',
    ['It is not, all tables are equally risky', 'It links customers and restaurants together, so a bug there can silently corrupt reports and calculations across the business', 'It has the fewest columns'],
    1, 'Because orders connects the other two tables, a data-integrity bug there tends to ripple into every report or calculation built on top of it.')}
`
};

lessons['01'] = {
  short: 'What is a bug?', where: 'Part I · <b>What is a bug, really?</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 01</div>
  <h2 class="title">What is a bug, really?</h2>
  <p class="lead">"Bug" gets used loosely. Three more precise words help a tester communicate exactly what they mean.</p>
  <hr class="rule">
  <svg viewBox="0 0 620 130" class="diagram" role="img" aria-label="Diagram: an error in reasoning leads to a defect in code, which under the right trigger becomes a failure a user experiences">
    <rect x="10" y="40" width="150" height="55" rx="10" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="85" y="72" text-anchor="middle" font-size="12" font-weight="700" fill="#7a251c">Human error</text>
    <rect x="235" y="40" width="150" height="55" rx="10" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="310" y="72" text-anchor="middle" font-size="12" font-weight="700" fill="#7a4b0a">Defect in code</text>
    <rect x="460" y="40" width="150" height="55" rx="10" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="535" y="65" text-anchor="middle" font-size="12" font-weight="700" fill="var(--teal-deep)">Failure</text><text x="535" y="80" text-anchor="middle" font-size="10" fill="var(--teal-deep)">(user sees it break)</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrQA1)">
      <path d="M160,67 L234,67"/><path d="M385,67 L459,67"/>
    </g>
    <text x="197" y="58" text-anchor="middle" font-size="9" fill="var(--ink-soft)">causes</text>
    <text x="422" y="58" text-anchor="middle" font-size="9" fill="var(--ink-soft)">triggered by</text>
    <defs><marker id="arrQA1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">A ${term('defect', 'defect')} might sit in the code for months before anyone hits the specific condition that turns it into a visible failure. This is exactly why testing exists: to trigger those conditions deliberately, on purpose, before a real customer stumbles into them by accident.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming "it works on my machine" means no defect.</b> A defect can be entirely condition-dependent (a specific date, a specific data value, a specific screen size).</li>
    <li><b>Reporting a failure without investigating the underlying defect.</b> "It crashed" is a failure description; a useful bug report gets closer to what specifically triggered it.</li>
  </ul></div>
  <div class="sec-num">1.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A human error causes a defect in the code. A defect becomes a failure only once the right condition triggers it. Testing exists to find and trigger those conditions on purpose, safely, before customers do it by accident in production.</p>
  ${qMC('q1', 'easy', 'A defect that has never actually been triggered by any user is:',
    ['Not a real defect', 'Still a defect, just one that has not yet caused a visible failure', 'The same thing as a failure'],
    1, 'A defect exists in the code regardless of whether it has been triggered yet; a failure is specifically the visible result of a defect being triggered.')}
  ${qMC('q2', 'med', 'What is the main goal of deliberately trying unusual or invalid inputs during testing?',
    ['To make the software look bad', 'To trigger latent defects under controlled conditions before real users hit them by accident', 'It has no real purpose, defects surface on their own eventually'],
    1, 'Deliberately trying to trigger failures, safely and early, is exactly how testing finds defects before they reach real customers.')}
  ${qScenario('q3', 'med', 'A customer reports "the app crashed." Using the error/defect/failure distinction, describe two follow-up questions you would ask to get from the failure back toward the actual defect.',
    'Useful follow-ups: "What were you doing right before it crashed, exactly which screen and which action?" and "Does it happen every time you do that, or only sometimes?" These start narrowing a vague failure report ("it crashed") down toward the specific, reproducible condition that is actually triggering the underlying defect.')}
`
};

lessons['02'] = {
  short: 'Test case anatomy', where: 'Part I · <b>Anatomy of a test case</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 02</div>
  <h2 class="title">Anatomy of a test case</h2>
  <p class="lead">A ${term('test_case', 'test case')} is only useful if someone else could pick it up, run it exactly as written, and land on the same pass/fail verdict you would.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The four parts of a test case</div>
    <div class="qb-row"><span class="qb-kw kw-p">Preconditions</span><span class="qb-mean">what must be true before you start (a test customer account exists, is logged in)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Steps</span><span class="qb-mean">the exact, ordered actions to perform</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Test data</span><span class="qb-mean">the specific values used (this order amount, this customer)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Expected result</span><span class="qb-mean">precisely what should happen, so pass/fail is not a judgement call</span></div>
  </div>
  <div class="qb"><div class="qb-title">Worked example: TastyGo refund auto-approval</div>
    <div class="qb-row"><span class="qb-kw kw-p">Precondition</span><span class="qb-mean">a test customer with no refunds in the last 30 days</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Steps</span><span class="qb-mean">place an order for ₹300, request a refund</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Test data</span><span class="qb-mean">order amount ₹300 (under the ₹500 threshold)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Expected result</span><span class="qb-mean">refund auto-approves within 1 minute, no manual review queue entry created</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Vague expected results.</b> "It should work properly" is not something two testers can agree pass or fail on.</li>
    <li><b>Missing preconditions.</b> Without stating the starting state, the same steps can produce different results for different testers.</li>
  </ul></div>
  <div class="sec-num">2.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A complete test case states preconditions, steps, test data, and a precise expected result, specific enough that pass/fail is a fact, not an opinion.</p>
  ${qMC('q1', 'easy', 'Which part of a test case states what must already be true before the test begins?',
    ['Expected result', 'Preconditions', 'Test data'],
    1, 'Preconditions describe the required starting state, separate from the steps that follow or the data used within them.')}
  ${qMC('q2', 'med', 'What is wrong with the expected result "the refund should work correctly"?',
    ['Nothing, it is a fine expected result', 'It is too vague for two different testers to agree independently on pass or fail', 'Expected results should never mention refunds'],
    1, 'A precise expected result removes judgement calls; "should work correctly" leaves pass/fail open to interpretation.')}
  ${qScenario('q3', 'med', 'Write a complete test case (precondition, steps, test data, expected result) for: a customer trying to apply an expired promo code at checkout.',
    'Precondition: a promo code that expired yesterday exists in the system, and a test customer has items in their cart. Steps: go to checkout, enter the expired promo code, attempt to apply it. Test data: promo code "SAVE20", expiry date set to yesterday. Expected result: the app rejects the code with a message indicating it has expired, and the order total remains unchanged, no discount applied.')}
`
};

lessons['03'] = {
  short: 'Positive vs. negative', where: 'Part I · <b>Positive vs. negative testing</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 03</div>
  <h2 class="title">Positive vs. negative testing</h2>
  <p class="lead">Positive testing proves the system does what it should. Negative testing proves it correctly refuses what it shouldn't allow. Both matter; most beginners only do the first.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Same feature, both angles</div>
    <div class="qb-row"><span class="qb-kw kw-p">Positive test</span><span class="qb-mean">a ₹300 refund request auto-approves correctly</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Negative test</span><span class="qb-mean">a refund request for an order that was already refunded is correctly rejected</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Negative test</span><span class="qb-mean">a refund request with a negative amount is correctly rejected, not processed as-is</span></div>
  </div>
  <p class="body">Negative tests are often where real bugs hide, because developers naturally build and test the case they intend to support (the positive case) far more carefully than the cases they intend to block.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Only testing that valid input is accepted.</b> A system that never rejects anything is not more permissive by design, it is untested.</li>
    <li><b>Assuming "the form has validation" means negative cases are covered.</b> Validation still needs to be tested, not just assumed to exist and work.</li>
  </ul></div>
  <div class="sec-num">3.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Positive tests confirm valid, expected behaviour works. Negative tests confirm invalid or disallowed behaviour is correctly rejected. A feature is only really tested once both angles are covered.</p>
  ${qMC('q1', 'easy', 'A test that checks a valid ₹300 refund is correctly auto-approved is an example of:',
    ['Negative testing', 'Positive testing', 'Neither, this is not a real test'],
    1, 'It confirms the system behaves correctly under valid, expected conditions, which is the definition of positive testing.')}
  ${qMC('q2', 'med', 'Why do real bugs disproportionately hide in negative test cases?',
    ['They do not, bugs are equally likely anywhere', 'Developers tend to build and verify the intended, valid case carefully, while rejection paths get less deliberate attention', 'Negative tests are easier to write, so they get skipped'],
    1, 'The path a developer is actively trying to build (the valid case) usually gets more careful attention than paths meant to block or reject something.')}
  ${qScenario('q3', 'med', 'Write one positive and one negative test for TastyGo\'s "cancel order within 2 minutes of placing it" rule.',
    'Positive test: place an order, cancel it 1 minute later; expected result is the order is cancelled with no charge. Negative test: place an order, wait 3 minutes, attempt to cancel; expected result is the app rejects the cancellation and explains the window has passed, the order remains active and chargeable.')}
`
};

lessons['04'] = {
  short: 'Test data & environments', where: 'Part I · <b>Test data &amp; environments</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 04</div>
  <h2 class="title">Test data &amp; environments</h2>
  <p class="lead">The exact same test steps can pass or fail depending on what data and environment they run against. Both need to be deliberately controlled, not accidental.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Common environments</div>
    <div class="qb-row"><span class="qb-kw kw-p">Dev</span><span class="qb-mean">unstable, changes constantly, used by developers while building</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Staging / QA</span><span class="qb-mean">a stable, production-like copy, where most planned testing happens</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Production</span><span class="qb-mean">the real, live system real customers use; test very carefully and rarely here</span></div>
  </div>
  <p class="body">Test data matters just as much: testing TastyGo's repeat-refund rule needs a customer account with exactly 3 prior refunds already set up, not whatever random test account happens to be lying around. Sloppy, accidental test data produces results nobody can trust or reproduce.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Testing in production "just this once."</b> Even a "harmless" test can create real orders, real charges, or real customer-visible side effects.</li>
    <li><b>Reusing whatever data happens to already exist.</b> If nobody deliberately set up the data, the test result cannot be trusted or reproduced later.</li>
  </ul></div>
  <div class="sec-num">4.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Use a stable, production-like environment for planned testing, and deliberately set up exactly the test data a test case requires, rather than relying on whatever happens to already be there.</p>
  ${qMC('q1', 'easy', 'Which environment is generally the right place for planned, thorough testing?',
    ['Production', 'A stable staging/QA environment that mirrors production', 'Whichever environment is fastest to access'],
    1, 'Staging environments are built specifically to mirror production closely while being safe to test against without affecting real customers.')}
  ${qMC('q2', 'med', 'Why is deliberately set-up test data preferable to whatever data happens to already exist in an environment?',
    ['It is not, existing data is just as good', 'Deliberate test data makes results reproducible and trustworthy, since you know exactly what conditions were tested', 'Existing data is always more realistic'],
    1, 'Without controlling the data, you cannot be sure what conditions were actually tested, and another tester cannot reliably reproduce the same result.')}
`
};

lessons['05'] = {
  short: 'Equivalence partitioning', where: 'Part II · <b>Equivalence partitioning</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 05</div>
  <h2 class="title">Equivalence partitioning</h2>
  <p class="lead">You cannot test every possible input. ${term('equivalence_partitioning', 'Equivalence partitioning')} lets you test a lot fewer values while still covering all the meaningfully different behaviours.</p>
  <hr class="rule">
  <svg viewBox="0 0 620 120" class="diagram" role="img" aria-label="Number line for a TastyGo order amount, split into three partitions: invalid too low, valid, invalid too high">
    <line x1="20" y1="60" x2="600" y2="60" stroke="var(--ink-faint)" stroke-width="2"/>
    <rect x="20" y="40" width="150" height="40" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="95" y="65" text-anchor="middle" font-size="11" fill="#7a251c">&lt; ₹1 (invalid)</text>
    <rect x="170" y="40" width="280" height="40" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="310" y="65" text-anchor="middle" font-size="11" fill="var(--teal-deep)">₹1 – ₹50,000 (valid)</text>
    <rect x="450" y="40" width="150" height="40" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="525" y="65" text-anchor="middle" font-size="11" fill="#7a251c">&gt; ₹50,000 (invalid)</text>
  </svg>
  <p class="body">Instead of testing ₹1, ₹2, ₹3 ... all the way up, pick one representative value from each partition: say ₹0 (invalid), ₹500 (valid), ₹60,000 (invalid). If the system behaves consistently within a partition, one value from it tells you what all values in it will do.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Only picking valid partitions.</b> Invalid partitions (too low, too high, wrong type) need representative tests too.</li>
    <li><b>Assuming one partition when there are really two.</b> "Discount code" might behave differently for expired vs. never-issued codes, that is two invalid partitions, not one.</li>
  </ul></div>
  <div class="sec-num">5.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Equivalence partitioning groups inputs into sets expected to behave alike, then tests one representative from each, cutting the number of tests needed without losing meaningful coverage.</p>
  ${qMC('q1', 'easy', 'What is the main benefit of equivalence partitioning?',
    ['It guarantees zero bugs', 'It lets you cover all meaningfully different behaviours with far fewer test values than testing everything', 'It replaces the need for negative testing'],
    1, 'By grouping inputs that should behave identically, you only need one representative test per group instead of exhaustively testing every value.')}
  ${qMC('q2', 'med', 'TastyGo\'s order amount field accepts ₹1 to ₹50,000. How many partitions does this create?',
    ['One: valid amounts', 'Three: below ₹1, ₹1-₹50,000, above ₹50,000', 'Fifty thousand, one per possible value'],
    1, 'There is one valid partition (₹1–₹50,000) and two invalid partitions (too low, too high), each needing its own representative test.')}
`
};

lessons['06'] = {
  short: 'Boundary values', where: 'Part II · <b>Boundary value analysis</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 06</div>
  <h2 class="title">Boundary value analysis</h2>
  <p class="lead">${term('boundary_value', 'Boundary value analysis')} tests exactly at the edges of a valid range, since off-by-one mistakes are one of the most common bugs in real code.</p>
  <hr class="rule">
  <p class="body">For TastyGo's ₹1–₹50,000 order range, a thorough boundary test checks: ₹0 (just below minimum), ₹1 (the minimum itself), ₹50,000 (the maximum itself), ₹50,001 (just above maximum). A developer might write <code class="inl">if (amount &gt; 0 &amp;&amp; amount &lt; 50000)</code> when they meant <code class="inl">&gt;=</code> and <code class="inl">&lt;=</code>, silently rejecting exactly ₹50,000. Boundary testing is what catches that.</p>
  <div class="qb"><div class="qb-title">The four values worth testing per boundary</div>
    <div class="qb-row"><span class="qb-kw kw-r">Just below min</span><span class="qb-mean">should be rejected</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Min itself</span><span class="qb-mean">should be accepted</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Max itself</span><span class="qb-mean">should be accepted</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Just above max</span><span class="qb-mean">should be rejected</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Testing only the middle of a range.</b> Boundaries are exactly where off-by-one bugs live; the middle rarely reveals them.</li>
    <li><b>Forgetting boundaries apply to more than numbers.</b> A username field with a 20-character max needs a test at exactly 20 and exactly 21 characters too.</li>
  </ul></div>
  <div class="sec-num">6.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Test the exact minimum and maximum of a valid range, plus one step just outside each, to catch the off-by-one mistakes that equivalence partitioning alone can miss.</p>
  ${qMC('q1', 'easy', 'Why specifically test values just below and just above a boundary?',
    ['To make the test suite longer', 'Off-by-one mistakes (using < instead of <=, for example) tend to surface exactly at the edges of a valid range', 'Middle-of-range values are more likely to reveal bugs'],
    1, 'Off-by-one coding mistakes only show up right at the edge of a range; a value comfortably in the middle would pass regardless.')}
  ${qScenario('q2', 'med', 'TastyGo caps delivery distance at 15 km. List the four boundary values you would test.',
    'The four values: 14.9 km (just under, should be accepted), 15.0 km (exact max, should be accepted), 15.1 km (just over, should be rejected), and optionally 0 km or a small minimum if one exists. The key pair to never skip is exactly-at-max and just-past-max, since that is where an off-by-one comparison bug would surface.')}
`
};

lessons['07'] = {
  short: 'Exploratory testing', where: 'Part II · <b>Exploratory testing</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 07</div>
  <h2 class="title">Exploratory testing</h2>
  <p class="lead">Not all testing is pre-scripted. Exploratory testing is simultaneously learning the system and testing it, guided by curiosity rather than a fixed script.</p>
  <hr class="rule">
  <p class="body">This is not "random clicking," it is disciplined but unscripted: pick a <b>charter</b> (a focused mission, like "explore what happens when two devices are logged into the same TastyGo account simultaneously"), spend a fixed time box on it (often 60-90 minutes), and take notes on anything unexpected as you go.</p>
  <div class="qb"><div class="qb-title">A real charter example</div>
    <div class="qb-row"><span class="qb-kw kw-p">Charter</span><span class="qb-mean">explore TastyGo's cart behaviour when the app loses internet connection mid-checkout</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Time box</span><span class="qb-mean">60 minutes</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Output</span><span class="qb-mean">notes on anything surprising, plus any bugs found, filed separately</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Confusing exploratory testing with lack of discipline.</b> A good charter is focused; "just click around" finds far fewer real bugs.</li>
    <li><b>Not writing anything down.</b> Without notes, useful observations from an exploratory session are lost the moment the session ends.</li>
  </ul></div>
  <div class="sec-num">7.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Exploratory testing pairs a focused charter and a time box with genuine curiosity, complementing scripted test cases by finding the things nobody thought to script.</p>
  ${qMC('q1', 'easy', 'What distinguishes disciplined exploratory testing from "just clicking around"?',
    ['Nothing, they are the same', 'A focused charter and a time box, with notes taken on what is observed', 'Exploratory testing never involves clicking at all'],
    1, 'A charter gives the session a clear focus and a time box keeps it bounded, which is what separates it from unfocused random clicking.')}
  ${qMC('q2', 'med', 'When is exploratory testing most valuable compared to scripted test cases?',
    ['Never, scripted test cases always find more bugs', 'When you need to find the unexpected things nobody thought to write a script for', 'Only during regression testing'],
    1, 'Scripted tests check for things you already anticipated; exploratory testing is aimed specifically at surfacing what nobody thought to check for in advance.')}
`
};

lessons['08'] = {
  short: 'Regression testing', where: 'Part II · <b>Regression testing</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 08</div>
  <h2 class="title">Regression testing</h2>
  <p class="lead">${term('regression', 'Regression testing')} answers one question: did fixing or adding this thing quietly break something that used to work?</p>
  <hr class="rule">
  <p class="body">Say TastyGo fixes a bug in how refunds are calculated. A good regression pass re-runs not just the refund tests, but anything that touches the same code path: order totals, promo codes applied to refunded orders, the customer's refund history screen. Change rarely stays as contained as it looks.</p>
  <div class="qb"><div class="qb-title">Building a regression suite</div>
    <div class="qb-row"><span class="qb-kw kw-p">Core flows</span><span class="qb-mean">the handful of things that must always work: login, place order, checkout</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Recently changed areas</span><span class="qb-mean">features touched by the current release</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">History of past bugs</span><span class="qb-mean">areas that have broken before are statistically likely to break again</span></div>
  </div>
  <p class="body">Regression suites are exactly where automation pays off most (covered in Part VI), since the same checks get re-run over and over, release after release.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Only testing the specific area that changed.</b> The riskiest regressions are often in code that looked unrelated but shared a dependency.</li>
    <li><b>Never updating the regression suite.</b> A suite that never grows misses every new feature added since it was written.</li>
  </ul></div>
  <div class="sec-num">8.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Regression testing re-checks previously working functionality after a change, focusing on core flows, recently changed areas, and historically fragile spots, not just the immediate area of the fix.</p>
  ${qMC('q1', 'easy', 'What question does regression testing answer?',
    ['Does the new feature work correctly?', 'Did this change break anything that used to work?', 'Is the system fast enough?'],
    1, 'Regression testing is specifically concerned with confirming existing, previously-working functionality has not been broken by a new change.')}
  ${qMC('q2', 'med', 'Why are regression suites a natural fit for automation?',
    ['They are not, regression testing should always be manual', 'The same checks get repeated release after release, which is exactly what automation is efficient at', 'Automation cannot detect regressions'],
    1, 'Automation shines at repeating identical checks quickly and reliably, which is precisely what a regression suite requires release after release.')}
`
};

lessons['09'] = {
  short: 'Bug report anatomy', where: 'Part III · <b>Anatomy of a good bug report</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 09</div>
  <h2 class="title">Anatomy of a good bug report</h2>
  <p class="lead">A bug report's entire job is to get the bug fixed with the least back-and-forth. Vague reports cost everyone time.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The essential fields</div>
    <div class="qb-row"><span class="qb-kw kw-p">Title</span><span class="qb-mean">specific and searchable, not "checkout broken"</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Steps to reproduce</span><span class="qb-mean">the exact, minimal sequence that triggers it</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Expected vs. actual</span><span class="qb-mean">what should have happened, and what happened instead</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Environment</span><span class="qb-mean">app version, device, OS, which environment (staging/production)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Evidence</span><span class="qb-mean">screenshot, screen recording, or logs</span></div>
  </div>
  <div class="qb"><div class="qb-title">Weak vs. strong, side by side</div>
    <div class="qb-row"><span class="qb-kw kw-r">Weak</span><span class="qb-mean">"Refund doesn't work sometimes."</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Strong</span><span class="qb-mean">"Refund for orders over ₹500 stays 'Pending' indefinitely. Steps: place a ₹600 order, request refund. Expected: routed to manual review within 1 minute. Actual: stuck at 'Pending' after 24 hours. Staging, app v2.3.1, order #4821."</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Writing the title as a symptom instead of a fact.</b> "App is broken" tells a developer nothing searchable or actionable.</li>
    <li><b>Skipping the environment.</b> A bug that only happens in staging, or only on one OS version, is easy to mis-triage without this.</li>
  </ul></div>
  <div class="sec-num">9.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A strong bug report has a specific title, exact repro steps, a clear expected-vs-actual contrast, environment details, and evidence, everything a developer needs without asking a follow-up question.</p>
  ${qMC('q1', 'easy', 'Which of these is a well-written bug title?',
    ['"App is broken"', '"Refund for orders over ₹500 stays \'Pending\' indefinitely"', '"Bug found"'],
    1, 'A good title is specific and searchable, describing exactly what is wrong rather than a vague symptom.')}
  ${qScenario('q2', 'med', 'A tester notices TastyGo shows the wrong delivery ETA for orders placed after 11pm. Write a complete bug report (title, steps, expected vs actual, environment).',
    'Title: "Delivery ETA shows previous day\'s estimate for orders placed after 11pm." Steps: 1) set device time to 11:15pm, 2) place any order, 3) view the order confirmation screen. Expected: ETA reflects current-day delivery windows. Actual: ETA shown is calculated as if the order were placed the previous day, showing an ETA that has already passed. Environment: staging, app v2.4.0, Android 13.')}
`
};

lessons['10'] = {
  short: 'Severity vs. priority', where: 'Part III · <b>Severity vs. priority</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 10</div>
  <h2 class="title">Severity vs. priority</h2>
  <p class="lead">${term('severity', 'Severity')} and ${term('priority', 'priority')} sound similar but answer different questions, and mixing them up leads to the wrong bugs getting fixed first.</p>
  <hr class="rule">
  <svg viewBox="0 0 500 260" class="diagram" role="img" aria-label="2 by 2 grid of severity versus priority with four example bugs">
    <line x1="150" y1="20" x2="150" y2="240" stroke="var(--ink-faint)"/><line x1="20" y1="130" x2="480" y2="130" stroke="var(--ink-faint)"/>
    <text x="15" y="15" font-size="10" fill="var(--ink-soft)">High severity</text><text x="15" y="255" font-size="10" fill="var(--ink-soft)">Low severity</text>
    <text x="160" y="255" font-size="10" fill="var(--ink-soft)">Low priority &rarr;</text><text x="330" y="255" font-size="10" fill="var(--ink-soft)">High priority &rarr;</text>
    <rect x="160" y="30" width="300" height="90" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="310" y="65" text-anchor="middle" font-size="11" fill="#7a251c">Payment crashes app</text><text x="310" y="85" text-anchor="middle" font-size="10" fill="#7a251c">high severity, high priority</text>
    <rect x="20" y="30" width="120" height="90" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="80" y="65" text-anchor="middle" font-size="10" fill="#7a4b0a">Rare crash on</text><text x="80" y="78" text-anchor="middle" font-size="10" fill="#7a4b0a">unused old device</text>
    <rect x="160" y="140" width="300" height="90" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="310" y="175" text-anchor="middle" font-size="11" fill="#7a4b0a">Wrong logo before a launch event</text><text x="310" y="195" text-anchor="middle" font-size="10" fill="#7a4b0a">low severity, high priority</text>
    <rect x="20" y="140" width="120" height="90" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="80" y="185" text-anchor="middle" font-size="10" fill="var(--teal-deep)">Minor spacing typo</text>
  </svg>
  <p class="body">A rare crash on an ancient, barely-used device is high severity (it crashes!) but likely low priority. A misaligned logo right before a big marketing launch is low severity but suddenly high priority given the timing. Neither dimension alone tells the full story.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming severity sets priority automatically.</b> Business context (timing, visibility, who is affected) can override technical severity.</li>
    <li><b>Testers deciding priority alone.</b> Severity is usually a tester's call; priority is usually negotiated with product/business stakeholders.</li>
  </ul></div>
  <div class="sec-num">10.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Severity measures technical impact; priority measures business urgency. The two are related but independent, and both matter when deciding what gets fixed next.</p>
  ${qMC('q1', 'easy', 'A bug that crashes the app for a small number of users on an outdated device would most likely be classified as:',
    ['Low severity, low priority', 'High severity, but possibly low priority', 'High priority, but low severity'],
    1, 'A crash is technically severe regardless of how few users hit it, but the business may still deprioritize it given how rarely it is triggered.')}
  ${qMC('q2', 'med', 'Who typically has the final say on a bug\'s priority?',
    ['The tester who found it, always', 'Product/business stakeholders, often in negotiation with engineering, since it involves business urgency', 'Whoever writes the bug report first'],
    1, 'Priority reflects business urgency and trade-offs across the whole backlog, which is usually a product/business decision rather than a purely technical one.')}
`
};

lessons['11'] = {
  short: 'Reproducing a bug', where: 'Part III · <b>Reproducing &amp; isolating a bug</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 11</div>
  <h2 class="title">Reproducing &amp; isolating a bug</h2>
  <p class="lead">"I can't reproduce it" is one of the most common reasons a real bug never gets fixed. Isolating exactly what triggers it is a skill of its own.</p>
  <hr class="rule">
  <p class="body">Start broad, then narrow: does it happen every time, or only sometimes? Only for certain accounts, certain data, certain devices? A useful technique is changing one variable at a time, similar to how a scientist isolates a cause, until only the essential trigger remains.</p>
  <div class="qb"><div class="qb-title">Worked example: intermittent refund failure</div>
    <div class="qb-row"><span class="qb-kw kw-p">Observation</span><span class="qb-mean">refunds fail "sometimes," reported by three different customers</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Narrow by account</span><span class="qb-mean">all three had placed more than one order that same day</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Narrow by data</span><span class="qb-mean">fails specifically when refunding the customer's second order of the day</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Isolated trigger</span><span class="qb-mean">a daily refund count check is off by one, blocking the second refund instead of a third</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Giving up after one failed reproduction attempt.</b> Intermittent bugs often depend on a specific data state, not just repeating the same click sequence.</li>
    <li><b>Changing multiple variables at once while investigating.</b> This makes it impossible to tell which change actually mattered.</li>
  </ul></div>
  <div class="sec-num">11.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Isolating a bug means narrowing from "it happens sometimes" to an exact, minimal, repeatable trigger, usually by changing one variable at a time until only the essential condition remains.</p>
  ${qMC('q1', 'easy', 'Why is "I can\'t reproduce it" a common reason bugs go unfixed?',
    ['Because most bugs are not real', 'Because a developer cannot safely fix what they cannot trigger and verify', 'Because reproduction is only needed for cosmetic bugs'],
    1, 'Without a reliable way to trigger the bug, a developer cannot confirm a fix actually addresses it, so the report tends to stay unresolved.')}
  ${qScenario('q2', 'hard', 'Three customers report the TastyGo app "sometimes" shows the wrong restaurant name on their order confirmation. Describe your approach to isolating the exact trigger.',
    'A reasonable approach: first check whether all three reports share something in common, same city, same restaurant chain with multiple branches, same time of day. Then try to reproduce by changing one variable at a time, e.g., order from a restaurant chain with multiple branches in the same area versus a single-location restaurant. If the bug only appears with multi-branch restaurants, the likely isolated cause is the app matching by restaurant name instead of a unique restaurant ID, showing the wrong branch\'s name.')}
`
};

lessons['12'] = {
  short: 'Steps to reproduce', where: 'Part III · <b>Writing steps to reproduce</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 12</div>
  <h2 class="title">Writing steps to reproduce</h2>
  <p class="lead">Once you've isolated a bug, writing the steps down well is what lets someone else reproduce it without you in the room.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">What makes steps minimal and precise</div>
    <div class="qb-row"><span class="qb-kw kw-p">Minimal</span><span class="qb-mean">no unnecessary steps, only what is actually required to trigger it</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Numbered and ordered</span><span class="qb-mean">exact sequence, not a loose description</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Includes exact data</span><span class="qb-mean">the specific order amount, account, or input, not "an order"</span></div>
  </div>
  <div class="qb"><div class="qb-title">Weak vs. strong</div>
    <div class="qb-row"><span class="qb-kw kw-r">Weak</span><span class="qb-mean">"Place an order and try to refund it, sometimes it breaks."</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Strong</span><span class="qb-mean">"1) As customer #4821, place a second order today (any amount). 2) Request a refund on that second order. 3) Observe refund stays 'Pending' beyond 1 minute."</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Including irrelevant steps "just in case."</b> Extra steps make it harder for someone else to tell what actually matters.</li>
    <li><b>Describing the goal instead of the exact actions.</b> "Try to check out" is not the same as the precise clicks and inputs used.</li>
  </ul></div>
  <div class="sec-num">12.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Good repro steps are minimal, numbered, and specific about exact data used, letting anyone else trigger the same bug without guesswork.</p>
  ${qMC('q1', 'easy', 'What makes a set of repro steps "minimal"?',
    ['It has as few words as possible, even if vague', 'It contains only the steps actually required to trigger the bug, nothing extra or irrelevant', 'It skips the exact data used to save space'],
    1, 'Minimal means no unnecessary steps are included, so whoever follows them can clearly see what is actually required to trigger the bug.')}
`
};

lessons['13'] = {
  short: 'Test plans & strategy', where: 'Part IV · <b>Test plans &amp; strategy</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 13</div>
  <h2 class="title">Test plans &amp; strategy</h2>
  <p class="lead">Before testing begins, a test plan answers a simple question: what exactly are we testing, how, and how will we know we're done?</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Core parts of a test plan</div>
    <div class="qb-row"><span class="qb-kw kw-p">Scope</span><span class="qb-mean">what is being tested, and explicitly, what is not</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Approach</span><span class="qb-mean">manual, automated, or a mix, and which types of testing apply</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Entry criteria</span><span class="qb-mean">what must be true before testing can start (build is deployed to staging, etc.)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Exit criteria</span><span class="qb-mean">what must be true to call testing done (all high-severity bugs fixed, X% of test cases passing)</span></div>
  </div>
  <p class="body">For TastyGo's new "schedule an order" feature, a test plan might scope in scheduling logic and notification timing, but explicitly scope out payment processing (already covered by an existing, separate suite), avoiding wasted duplicate effort.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>No defined exit criteria.</b> Without one, "testing" can drag on indefinitely, or stop arbitrarily with real gaps unfound.</li>
    <li><b>Scope that is too vague to act on.</b> "Test the new feature" doesn't tell anyone what's actually in or out of scope.</li>
  </ul></div>
  <div class="sec-num">13.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A test plan defines scope, approach, and clear entry/exit criteria, so everyone agrees in advance what "done" means for a testing effort.</p>
  ${qMC('q1', 'easy', 'What do "exit criteria" define in a test plan?',
    ['What must be true before testing can begin', 'What must be true for testing to be considered complete', 'Which tools will be used'],
    1, 'Exit criteria specify the conditions, like bug counts or pass rates, that must be met before testing is considered finished.')}
  ${qMC('q2', 'med', 'Why explicitly scope something out of a test plan, like payment processing for a scheduling feature?',
    ['To do less work overall regardless of risk', 'To avoid duplicating effort already covered by an existing, separate test suite, while being clear about what is and isn\'t covered here', 'Payment processing never needs testing'],
    1, 'Explicitly scoping something out prevents duplicated effort and makes clear to everyone what this specific testing pass does and does not cover.')}
`
};

lessons['14'] = {
  short: 'Traceability', where: 'Part IV · <b>Traceability: requirements to tests</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 14</div>
  <h2 class="title">Traceability: requirements to tests</h2>
  <p class="lead">A ${term('traceability', 'traceability')} matrix answers: for every requirement, which test case(s) actually verify it? And just as importantly, is anything untested?</p>
  <hr class="rule">
  <svg viewBox="0 0 560 170" class="diagram" role="img" aria-label="Traceability matrix linking three requirements to test cases, one requirement has no linked test">
    <rect x="20" y="20" width="220" height="30" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="130" y="40" text-anchor="middle" font-size="11" fill="var(--teal-deep)">REQ-1: Auto-approve refunds &lt;₹500</text>
    <rect x="20" y="65" width="220" height="30" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="130" y="85" text-anchor="middle" font-size="11" fill="var(--teal-deep)">REQ-2: Route refunds ≥₹500 to review</text>
    <rect x="20" y="110" width="220" height="30" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="130" y="130" text-anchor="middle" font-size="11" fill="#7a251c">REQ-3: Notify customer of refund status</text>
    <rect x="340" y="20" width="200" height="30" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="440" y="40" text-anchor="middle" font-size="11" fill="#7a4b0a">TC-01, TC-02</text>
    <rect x="340" y="65" width="200" height="30" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="440" y="85" text-anchor="middle" font-size="11" fill="#7a4b0a">TC-03</text>
    <rect x="340" y="110" width="200" height="30" fill="var(--rose-soft)" stroke="var(--rose)" stroke-dasharray="4"/><text x="440" y="130" text-anchor="middle" font-size="11" fill="#7a251c">no test case linked!</text>
    <g stroke="var(--ink-faint)" stroke-width="1.5" fill="none">
      <path d="M240,35 L340,35"/><path d="M240,80 L340,80"/><path d="M240,125 L340,125"/>
    </g>
  </svg>
  <p class="body">REQ-3 having no linked test case is exactly the kind of gap a traceability matrix is built to surface, before release, not after a customer notices they never got a refund notification.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Building the matrix once and never updating it.</b> New requirements added later need new links too, or the matrix silently goes stale.</li>
    <li><b>Assuming a linked test case means good coverage.</b> One shallow test linked to a requirement is better than none, but may not actually test it thoroughly.</li>
  </ul></div>
  <div class="sec-num">14.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Traceability links every requirement to the test case(s) verifying it, making untested requirements visible and explicit rather than an invisible gap.</p>
  ${qMC('q1', 'easy', 'What problem does a traceability matrix directly help catch?',
    ['Slow-running tests', 'A requirement that has no test case verifying it at all', 'Poorly worded bug reports'],
    1, 'By mapping every requirement to its verifying test case(s), any requirement left without one becomes immediately visible as a gap.')}
`
};

lessons['15'] = {
  short: 'Risk-based testing', where: 'Part IV · <b>Risk-based testing</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 15</div>
  <h2 class="title">Risk-based testing</h2>
  <p class="lead">There is never enough time to test everything equally. Risk-based testing spends more effort where the cost of a bug is highest.</p>
  <hr class="rule">
  <p class="body">Risk is a combination of two things: how likely a bug is (how complex or recently changed the code is), and how bad it would be if it happened (how many customers it touches, whether money or data is involved). Payment and refund logic deserves heavy testing; a rarely-used settings toggle deserves much less.</p>
  <div class="qb"><div class="qb-title">Ranking TastyGo features by risk</div>
    <div class="qb-row"><span class="qb-kw kw-r">Highest risk</span><span class="qb-mean">payment and refund processing: touches money, every customer, complex logic</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Medium risk</span><span class="qb-mean">order status notifications: every customer sees them, but no money at stake</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Lower risk</span><span class="qb-mean">changing your display theme: cosmetic, low usage, low impact if broken</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Testing everything "equally" with limited time.</b> This spreads effort so thin that high-risk areas get the same shallow coverage as low-risk ones.</li>
    <li><b>Ignoring likelihood and only looking at impact.</b> A high-impact area that is old, stable, and rarely changed may need less new testing than a high-impact area that just got rewritten.</li>
  </ul></div>
  <div class="sec-num">15.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Risk-based testing prioritizes limited testing time toward areas where bugs are both more likely and more damaging, rather than spreading effort evenly across everything.</p>
  ${qMC('q1', 'easy', 'Risk in testing is generally a combination of which two factors?',
    ['Cost and speed', 'How likely a bug is, and how damaging it would be if it happened', 'How old the code is and how many developers wrote it'],
    1, 'Risk-based testing weighs both likelihood (how prone to bugs an area is) and impact (how bad it would be if a bug occurred there).')}
  ${qMC('q2', 'med', 'Why might a recently-rewritten payment feature deserve more testing than a stable, unchanged one, even if both are high-impact?',
    ['Impact is the only thing that matters, they deserve equal testing', 'Recent changes increase the likelihood of new bugs, raising overall risk even though impact stayed the same', 'Older code is always buggier than new code'],
    1, 'Likelihood rises with recent change, so a newly-rewritten high-impact feature carries more combined risk than a stable one that hasn\'t changed.')}
`
};

lessons['16'] = {
  short: 'Test case management', where: 'Part IV · <b>Test case management</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 16</div>
  <h2 class="title">Test case management</h2>
  <p class="lead">Once a team has more than a handful of test cases, organizing and tracking them becomes its own discipline.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">What a test case management tool gives you</div>
    <div class="qb-row"><span class="qb-kw kw-p">Suites</span><span class="qb-mean">grouping related test cases (all refund tests, all login tests)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Runs</span><span class="qb-mean">recording which test cases passed or failed for a specific release</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">History</span><span class="qb-mean">seeing whether a test case has been flaky or reliably passing over time</span></div>
  </div>
  <p class="body">Without this, teams end up with test cases scattered across spreadsheets, chat messages, and memory, easy to lose, and impossible to reliably tell what has actually been tested for a given release.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Writing test cases but never re-running them.</b> A test case management tool only adds value if runs are actually recorded release after release.</li>
    <li><b>Letting the suite grow without pruning.</b> Outdated test cases for removed features waste time and create false signal.</li>
  </ul></div>
  <div class="sec-num">16.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Test case management tools organize test cases into suites, track pass/fail history across releases, and prevent testing knowledge from living only in one person's head or a scattered spreadsheet.</p>
  ${qMC('q1', 'easy', 'What is the main benefit of tracking test "runs" over time, not just the test cases themselves?',
    ['It makes the tool look more advanced', 'It reveals whether a test case reliably passes or is flaky, and what was actually verified for a given release', 'Runs are not actually useful to track'],
    1, 'Recording runs over time turns a static list of test cases into a history that shows reliability and exactly what was verified for each release.')}
`
};

lessons['17'] = {
  short: 'Testing an API', where: 'Part V · <b>Testing an API</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 17</div>
  <h2 class="title">Testing an API</h2>
  <p class="lead">An ${term('api', 'API')} is a contract. Testing it means checking that contract holds, independent of whatever UI happens to sit on top of it.</p>
  <hr class="rule">
  <svg viewBox="0 0 600 150" class="diagram" role="img" aria-label="Request response diagram for a TastyGo place order API call">
    <rect x="20" y="30" width="180" height="90" rx="10" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="110" y="55" text-anchor="middle" font-size="12" font-weight="700" fill="var(--teal-deep)">Request</text><text x="110" y="75" text-anchor="middle" font-size="10" fill="var(--teal-deep)">POST /orders</text><text x="110" y="92" text-anchor="middle" font-size="10" fill="var(--teal-deep)">{"{"} customer_id, items {"}"}</text>
    <rect x="400" y="30" width="180" height="90" rx="10" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="490" y="55" text-anchor="middle" font-size="12" font-weight="700" fill="#7a4b0a">Response</text><text x="490" y="75" text-anchor="middle" font-size="10" fill="#7a4b0a">201 Created</text><text x="490" y="92" text-anchor="middle" font-size="10" fill="#7a4b0a">{"{"} order_id, status {"}"}</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrQA2)"><path d="M200,75 L399,75"/></g>
    <defs><marker id="arrQA2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">API testing checks: does a valid request get the expected response? Does an invalid one (missing a required field, wrong data type) get a sensible error, not a silent failure or a 500? Does the response body actually contain correct, well-formed data, not just the right status code?</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Checking only the status code.</b> A 200 OK response can still contain wrong or incomplete data in its body.</li>
    <li><b>Never testing malformed requests.</b> Missing fields, wrong data types, and extra unexpected fields are all common in the real world.</li>
  </ul></div>
  <div class="sec-num">17.1</div><h3 class="section-h">Recap</h3>
  <p class="body">API testing verifies the full contract, correct status codes and correct response data for valid requests, and sensible, safe handling of invalid ones, all independent of any UI.</p>
  ${qMC('q1', 'easy', 'Why is checking only the HTTP status code not enough when testing an API?',
    ['Status codes are never reliable', 'The response body could still contain incorrect or incomplete data even with a "successful" status code', 'API testing should never look at status codes'],
    1, 'A 200 or 201 status only confirms the request was processed without a server error; the actual data returned still needs to be checked for correctness.')}
  ${qScenario('q2', 'med', 'Design two test cases for TastyGo\'s POST /orders endpoint: one positive, one negative.',
    'Positive: send a valid request with an existing customer_id and at least one valid item; expect a 201 status and a response body containing a new order_id and status "placed". Negative: send a request with a customer_id that does not exist; expect a 4xx error status (not a 500 or silent success) with a clear error message, and confirm no order was actually created in the database.')}
`
};

lessons['18'] = {
  short: 'HTTP status codes', where: 'Part V · <b>HTTP status codes</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 18</div>
  <h2 class="title">HTTP status codes</h2>
  <p class="lead">Status codes are a quick, standardized signal of what happened. Knowing the common ranges lets you spot wrong behaviour instantly.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The ranges that matter</div>
    <div class="qb-row"><span class="qb-kw kw-p">2xx</span><span class="qb-mean">success (200 OK, 201 Created)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">4xx</span><span class="qb-mean">client's fault: bad request, unauthorized, not found (400, 401, 404)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">5xx</span><span class="qb-mean">server's fault: something broke while processing (500, 503)</span></div>
  </div>
  <p class="body">If a customer tries to refund an order that doesn't exist, the right response is a 404 (client error, the resource wasn't found), not a 500. Seeing a 500 for something that is really an invalid input is itself a bug worth reporting, error handling has gone wrong somewhere.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Treating any non-200 as automatically a bug.</b> A 404 for a genuinely missing resource, or a 401 for an unauthenticated request, can be entirely correct behaviour.</li>
    <li><b>A 500 for bad user input.</b> This usually means invalid input isn't being validated properly before it reaches deeper logic.</li>
  </ul></div>
  <div class="sec-num">18.1</div><h3 class="section-h">Recap</h3>
  <p class="body">2xx means success, 4xx means the client's request was the problem, 5xx means the server broke while handling it. A 5xx for bad input is itself usually a bug.</p>
  ${qMC('q1', 'easy', 'A customer requests a refund for an order ID that does not exist. What is the correct status code?',
    ['200 OK', '404 Not Found', '500 Internal Server Error'],
    1, 'A missing resource that the client asked for correctly maps to a 404, a client-side error, not a server crash (500) or a false success (200).')}
  ${qMC('q2', 'med', 'Seeing a 500 error returned for a request with an obviously invalid field (like a negative order amount) usually indicates:',
    ['Correct behaviour, 500 is fine for any error', 'Input is not being validated before reaching deeper logic, likely a bug worth reporting', 'The customer made an unrelated mistake'],
    1, 'Invalid input should typically be caught and rejected with a clear 4xx response; a 500 suggests the bad input reached deeper, unvalidated logic and caused a crash.')}
`
};

lessons['19'] = {
  short: 'Testing with SQL', where: 'Part V · <b>Testing with SQL</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 19</div>
  <h2 class="title">Testing with SQL</h2>
  <p class="lead">The UI and the API both sit on top of a database. Being able to query it directly is one of the most underrated QA skills.</p>
  <hr class="rule">
  <p class="body">Say a tester confirms a refund shows as "Completed" in the app. That is one layer of evidence. Querying the orders table directly, <code class="inl">SELECT status, refund_amount FROM orders WHERE id = 4821;</code>, confirms what actually got written to the source of truth, catching bugs where the UI displays one thing while the database quietly holds another.</p>
  <div class="qb"><div class="qb-title">What SQL lets a tester verify directly</div>
    <div class="qb-row"><span class="qb-kw kw-p">Data integrity</span><span class="qb-mean">did the refund_amount actually match what was requested?</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Side effects</span><span class="qb-mean">did related rows update correctly (order status, customer's refund count)?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Bulk verification</span><span class="qb-mean">checking hundreds of orders at once for a data-quality issue, far faster than checking one by one in the UI</span></div>
  </div>
  <p class="body">This is exactly the skill built chapter by chapter in <a href="/courses/sql">SQLingo</a>, using the very same TastyGo tables.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Never verifying beneath the UI.</b> A passing UI check alone cannot rule out a silent data-layer bug.</li>
    <li><b>Running untested write queries against a real database.</b> Direct queries for testing should be read-only (SELECT) unless you are deliberately and safely setting up test data.</li>
  </ul></div>
  <div class="sec-num">19.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Querying the database directly lets a tester confirm what actually happened underneath the UI, catch data-layer bugs a UI check alone would miss, and verify bulk data quality quickly.</p>
  ${qMC('q1', 'easy', 'Why might a tester query the database directly instead of relying only on what the app displays?',
    ['To make testing take longer', 'The UI could show a success message even if the underlying data was not actually updated correctly', 'SQL queries are always faster than clicking through an app'],
    1, 'A UI can display a message that does not accurately reflect what was actually written to the database, so checking the source of truth directly closes that gap.')}
`
};

lessons['20'] = {
  short: 'Edge cases in data', where: 'Part V · <b>Edge cases in data</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 20</div>
  <h2 class="title">Edge cases in data</h2>
  <p class="lead">Some of the most damaging bugs hide not in the code's logic, but in unusual data the logic never expected to see.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Data edge cases worth deliberately testing</div>
    <div class="qb-row"><span class="qb-kw kw-p">NULLs</span><span class="qb-mean">a restaurant with no rating yet, does it show as 0 stars or "not yet rated"?</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Duplicates</span><span class="qb-mean">two customers with the exact same name, does search or matching logic get confused?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Extreme values</span><span class="qb-mean">an order with 200 items, a restaurant with a 20-word name, does the UI or logic break?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Empty states</span><span class="qb-mean">a customer with zero past orders, does their order history screen handle "nothing here" gracefully?</span></div>
  </div>
  <p class="body">SQLingo's own chapter on NULL handling shows exactly this kind of bug: a NULL rating quietly treated as a zero can skew an entire restaurant's average rating, a data edge case, not a logic bug in the usual sense.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Only testing with clean, typical sample data.</b> Real production data always contains the messy, unusual cases eventually.</li>
    <li><b>Forgetting empty states entirely.</b> A brand-new customer with zero orders is a real, common state that is easy to forget to test.</li>
  </ul></div>
  <div class="sec-num">20.1</div><h3 class="section-h">Recap</h3>
  <p class="body">NULLs, duplicates, extreme values, and empty states are common, real data conditions that deliberate testing needs to cover, since typical sample data alone rarely reveals them.</p>
  ${qMC('q1', 'easy', 'Why test with a customer who has zero past orders, not just customers with typical order history?',
    ['New customers never use the app', 'Empty states are a real, common condition that logic built around "typical" data can fail to handle gracefully', 'It is not a useful test'],
    1, 'A brand-new customer with no history is a genuinely common real-world state, and code written assuming data exists can break or behave oddly when it does not.')}
  ${qMC('q2', 'med', 'A restaurant with a NULL (not yet set) rating displaying as "0 stars" instead of "not yet rated" is an example of what kind of bug?',
    ['A performance bug', 'A data edge-case bug: NULL is being treated the same as zero, when they mean different things', 'This is not actually a bug'],
    1, 'NULL means "no value recorded" while 0 means "a rating of zero was given"; conflating the two is a classic data edge-case bug that skews averages and displays.')}
`
};

lessons['21'] = {
  short: 'Why automate', where: 'Part VI · <b>Why (and what to) automate</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 21</div>
  <h2 class="title">Why (and what to) automate</h2>
  <p class="lead">Automation doesn't replace testing judgement, it replaces the tedious, repetitive re-running of checks a human has already designed.</p>
  <hr class="rule">
  <svg viewBox="0 0 420 220" class="diagram" role="img" aria-label="Test pyramid with a wide base of unit tests, a smaller middle of integration tests, and a small top of end to end tests">
    <polygon points="210,20 60,200 360,200" fill="none" stroke="var(--ink-faint)" stroke-width="2"/>
    <polygon points="210,20 168,80 252,80" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="210" y="55" text-anchor="middle" font-size="10" fill="#7a251c">End-to-end</text>
    <polygon points="168,80 252,80 285,140 135,140" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="210" y="115" text-anchor="middle" font-size="11" fill="#7a4b0a">Integration</text>
    <polygon points="135,140 285,140 330,200 90,200" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="210" y="175" text-anchor="middle" font-size="12" font-weight="700" fill="var(--teal-deep)">Unit tests</text>
  </svg>
  <p class="body">The ${term('test_pyramid', 'test pyramid')} guides where automation effort goes: lots of fast, cheap unit tests at the base, fewer integration tests in the middle, and only a small number of slow, brittle end-to-end tests at the top, since each layer up is slower and more fragile than the one below.</p>
  <div class="qb"><div class="qb-title">Good vs. poor automation candidates</div>
    <div class="qb-row"><span class="qb-kw kw-p">Good candidate</span><span class="qb-mean">the login flow, run on every single release, for years</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Poor candidate</span><span class="qb-mean">a one-off exploratory check of a brand-new, still-changing feature</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Automating everything, including things that will barely be reused.</b> Automation has an upfront and ongoing maintenance cost; it only pays off with repetition.</li>
    <li><b>An inverted pyramid.</b> Too many slow, brittle end-to-end tests and too few fast unit tests makes a suite slow and flaky overall.</li>
  </ul></div>
  <div class="sec-num">21.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Automate what gets repeated often, especially stable core flows and regression checks. The test pyramid favors many fast unit tests over few slow end-to-end ones.</p>
  ${qMC('q1', 'easy', 'What kind of check is generally the best candidate for automation?',
    ['A one-off exploratory session on a brand-new feature', 'A stable, core flow (like login) that gets re-run on every release', 'Anything a tester finds boring'],
    1, 'Automation pays off through repetition; a stable flow re-checked release after release benefits far more than a one-off exploratory check.')}
  ${qMC('q2', 'med', 'According to the test pyramid, which layer should have the most tests?',
    ['End-to-end tests', 'Unit tests', 'They should all be equal in number'],
    1, 'Unit tests are fast and cheap to run, so the pyramid recommends the largest number of them, with fewer, slower tests as you move up toward end-to-end.')}
`
};

lessons['22'] = {
  short: 'Automated test anatomy', where: 'Part VI · <b>Anatomy of an automated test</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 22</div>
  <h2 class="title">Anatomy of an automated test</h2>
  <p class="lead">Almost every automated test, no matter the language or tool, follows the same three-part shape.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Arrange, Act, Assert</div>
    <div class="qb-row"><span class="qb-kw kw-p">Arrange</span><span class="qb-mean">set up the starting state (a test customer, an order in the cart)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Act</span><span class="qb-mean">perform the one action being tested (click "place order")</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Assert</span><span class="qb-mean">check the result matches what was expected</span></div>
  </div>
  <pre class="code">// Arrange
const cart = createTestCart({ items: [pizza], customer: testCustomer });

// Act
const result = placeOrder(cart);

// Assert
expect(result.status).toBe("placed");
expect(result.total).toBe(450);</pre>
  <p class="body">A test that arranges too much, acts on more than one thing, or asserts too many unrelated outcomes becomes hard to read and even harder to debug when it fails, since it's unclear which part actually broke.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Testing multiple unrelated things in one test.</b> When it fails, it's unclear which behaviour actually broke.</li>
    <li><b>Asserting too little.</b> Checking only <code class="inl">result.status</code> without checking <code class="inl">result.total</code> would miss a real pricing bug entirely.</li>
  </ul></div>
  <div class="sec-num">22.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Arrange sets up the state, Act performs the one behaviour being tested, Assert checks the result. Keeping each test focused on one behaviour makes failures easy to diagnose.</p>
  ${qMC('q1', 'easy', 'In the Arrange-Act-Assert pattern, what happens in the "Act" step?',
    ['Setting up test data', 'Performing the single action or behaviour actually being tested', 'Checking whether the result was correct'],
    1, 'Act is the step where the actual behaviour under test is triggered, after the state has already been arranged and before the result is asserted.')}
`
};

lessons['23'] = {
  short: 'Locators & selectors', where: 'Part VI · <b>Locators &amp; selectors</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 23</div>
  <h2 class="title">Locators &amp; selectors</h2>
  <p class="lead">Automated UI tests need a reliable way to find the exact button, field, or element to interact with. Not all ways of finding it are equally durable.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">More brittle → more stable</div>
    <div class="qb-row"><span class="qb-kw kw-r">Position on screen</span><span class="qb-mean">breaks the moment layout shifts even slightly</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">CSS class name</span><span class="qb-mean">breaks if a designer renames or restyles a class for unrelated reasons</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Dedicated test ID</span><span class="qb-mean">e.g. <code class="inl">data-testid="place-order-btn"</code>, stable regardless of styling or layout changes</span></div>
  </div>
  <p class="body">A dedicated test attribute exists purely to be a stable handle for tests, decoupled from anything a designer or developer might reasonably want to change for other reasons.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Selecting elements by visual position or styling.</b> These are exactly the things most likely to change for reasons unrelated to the test's actual purpose.</li>
    <li><b>Selecting by visible text.</b> Works, but breaks the moment copy is translated or reworded, a dedicated ID survives that.</li>
  </ul></div>
  <div class="sec-num">23.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Stable automated tests use dedicated test IDs rather than fragile, styling- or position-based selectors, so unrelated design changes don't silently break the test suite.</p>
  ${qMC('q1', 'easy', 'Why is a dedicated data-testid attribute usually a more stable selector than a CSS class name?',
    ['It is not more stable', 'A CSS class can change for styling reasons unrelated to the test, while a testid exists purely as a stable handle for tests', 'testid attributes are faster to type'],
    1, 'A dedicated test attribute is decoupled from styling and layout changes, so it survives redesigns that would otherwise break a CSS-class-based selector.')}
`
};

lessons['24'] = {
  short: 'CI/CD & automated runs', where: 'Part VI · <b>CI/CD &amp; running tests automatically</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 24</div>
  <h2 class="title">CI/CD &amp; running tests automatically</h2>
  <p class="lead">Automated tests provide the most value when they run themselves, automatically, every time code changes, not only when someone remembers to run them manually.</p>
  <hr class="rule">
  <svg viewBox="0 0 600 130" class="diagram" role="img" aria-label="Pipeline: code pushed, tests run automatically, then either deploy on pass or block on fail">
    <rect x="10" y="35" width="130" height="55" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="75" y="67" text-anchor="middle" font-size="11" fill="var(--teal-deep)">Code pushed</text>
    <rect x="220" y="35" width="130" height="55" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="285" y="67" text-anchor="middle" font-size="11" fill="#7a4b0a">Tests run</text>
    <rect x="430" y="10" width="150" height="45" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="505" y="37" text-anchor="middle" font-size="11" fill="var(--teal-deep)">Pass → deploy</text>
    <rect x="430" y="70" width="150" height="45" rx="8" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="505" y="97" text-anchor="middle" font-size="11" fill="#7a251c">Fail → blocked</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrQA3)">
      <path d="M140,62 L219,62"/><path d="M350,55 L429,33"/><path d="M350,70 L429,93"/>
    </g>
    <defs><marker id="arrQA3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">This is what CI/CD (continuous integration / continuous deployment) pipelines do: every code push automatically triggers the test suite, and a failing test can block a broken change from ever reaching production, catching regressions the moment they're introduced instead of days later.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>A pipeline that runs tests but ignores failures.</b> If a failing test doesn't actually block deployment, the automation provides a false sense of safety.</li>
    <li><b>Flaky tests left in the pipeline.</b> Tests that fail randomly, unrelated to real bugs, train the team to ignore failures altogether.</li>
  </ul></div>
  <div class="sec-num">24.1</div><h3 class="section-h">Recap</h3>
  <p class="body">CI/CD pipelines run automated tests on every code change and can block a broken change from deploying, catching regressions immediately rather than relying on someone remembering to test manually.</p>
  ${qMC('q1', 'easy', 'What is the main benefit of running automated tests inside a CI/CD pipeline?',
    ['Tests run faster than they would locally', 'Every code change is automatically tested, and failures can block a broken change from reaching production', 'It removes the need to ever write new tests'],
    1, 'Automatic, every-push testing catches regressions immediately, and a properly configured pipeline can stop a broken change before it ships.')}
  ${qMC('q2', 'med', 'Why are flaky tests (that fail randomly, unrelated to real bugs) dangerous in a CI/CD pipeline?',
    ['They make the pipeline run faster', 'They train the team to ignore failures, which can let real, meaningful failures slip through unnoticed', 'They are not actually a problem'],
    1, 'Once a team gets used to re-running a flaky test until it passes, they risk doing the same for a genuine failure, undermining the whole safety net.')}
`
};

lessons['25'] = {
  short: 'Performance testing', where: 'Part VII · <b>Performance testing basics</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 25</div>
  <h2 class="title">Performance testing basics</h2>
  <p class="lead">A feature can be functionally perfect and still fail in production if it's too slow, or falls over, under real-world load.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Three flavours of performance testing</div>
    <div class="qb-row"><span class="qb-kw kw-p">Load testing</span><span class="qb-mean">does the system handle expected normal traffic, e.g. TastyGo's usual Friday-night dinner rush?</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Stress testing</span><span class="qb-mean">what happens well beyond expected traffic, does it fail gracefully or crash entirely?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Soak testing</span><span class="qb-mean">does it stay stable running under moderate load for many hours (memory leaks often only show up here)?</span></div>
  </div>
  <p class="body">A response time graph across increasing concurrent users often shows a clear breaking point, response time stays flat, then suddenly spikes once some resource limit is hit, exactly the point stress testing is trying to find deliberately, before real users find it on the busiest night of the year.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Only testing performance with a handful of test users.</b> Real bottlenecks often only appear under realistic concurrent load.</li>
    <li><b>Ignoring "graceful" failure under stress.</b> Falling over completely is worse than slowing down or rejecting new requests cleanly under extreme load.</li>
  </ul></div>
  <div class="sec-num">25.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Load testing checks expected traffic, stress testing checks beyond-expected traffic and how gracefully the system fails, soak testing checks long-running stability. All catch issues functional testing alone would miss.</p>
  ${qMC('q1', 'easy', 'Which type of performance testing specifically checks whether the system fails gracefully under traffic well beyond what is expected?',
    ['Load testing', 'Stress testing', 'Soak testing'],
    1, 'Stress testing deliberately pushes the system beyond normal expected traffic to see how, and how gracefully, it fails.')}
  ${qMC('q2', 'med', 'Why might a memory leak only be caught by soak testing, not load or stress testing?',
    ['Memory leaks cannot be tested for', 'A memory leak accumulates gradually, so it may only become visible after running under load for a long stretch of time', 'Soak testing is not a real performance testing type'],
    1, 'Since memory leaks build up slowly, a short load or stress test may finish before the leak becomes noticeable; only sustained running (soak testing) reveals it.')}
`
};

lessons['26'] = {
  short: 'Security testing', where: 'Part VII · <b>Security testing basics</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 26</div>
  <h2 class="title">Security testing basics</h2>
  <p class="lead">Security testing looks for a specific kind of bug: one that lets someone do something they should never be allowed to do.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Common categories to check</div>
    <div class="qb-row"><span class="qb-kw kw-p">Authentication</span><span class="qb-mean">can someone access another customer's order history just by guessing or changing an ID in a request?</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Input validation</span><span class="qb-mean">does a form field safely reject malicious input rather than executing or storing it unsafely?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Sensitive data exposure</span><span class="qb-mean">is a customer's payment or address data ever visible in a place it shouldn't be, like an error message or a log?</span></div>
  </div>
  <p class="body">A simple but real example: if changing an order ID in a request URL from your own order to someone else's returns their order details, that's a serious authorization bug, the system checked "is this a valid order ID" but never checked "does this order actually belong to the requester."</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming a login screen means the whole app is secure.</b> Authentication (who are you) and authorization (what are you allowed to see) are different checks, and both need testing.</li>
    <li><b>Treating security testing as someone else's job entirely.</b> Basic checks, like trying another customer's ID, are well within a QA tester's everyday scope.</li>
  </ul></div>
  <div class="sec-num">26.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Security testing checks authentication, authorization, input validation, and sensitive data exposure, looking specifically for ways the system lets someone do or see something they shouldn't.</p>
  ${qMC('q1', 'easy', 'What is being tested when a QA tester tries changing an order ID in a request to see someone else\'s order details?',
    ['Performance', 'Authorization: whether the system correctly checks the requester actually owns that resource', 'Accessibility'],
    1, 'This checks whether the system verifies ownership of a resource, an authorization concern, distinct from simply checking whether a user is logged in at all.')}
  ${qMC('q2', 'med', 'What is the difference between authentication and authorization?',
    ['They are the same thing', 'Authentication confirms who you are; authorization confirms what you are allowed to access or do', 'Authorization happens before authentication'],
    1, 'Authentication verifies identity (are you really this user), while authorization separately verifies permission (is this user allowed to see or do this specific thing).')}
`
};

lessons['27'] = {
  short: 'Accessibility & usability', where: 'Part VII · <b>Accessibility &amp; usability</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 27</div>
  <h2 class="title">Accessibility &amp; usability</h2>
  <p class="lead">A feature that "works" for a sighted, mouse-using tester can still be broken or unusable for someone else entirely.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Common accessibility checks</div>
    <div class="qb-row"><span class="qb-kw kw-p">Keyboard navigation</span><span class="qb-mean">can every action be completed without ever touching a mouse?</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Screen reader support</span><span class="qb-mean">does an image or icon-only button have text a screen reader can actually announce?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Color contrast</span><span class="qb-mean">is text readable for users with low vision or color blindness, not just on a bright, well-lit test monitor?</span></div>
  </div>
  <p class="body">A "place order" button that is only an icon, with no label a screen reader can announce, quietly locks out a whole category of real users, exactly the kind of bug that's invisible unless someone deliberately tests for it.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Testing only with a mouse, on a well-lit screen, without disabilities in mind.</b> This misses an entire class of real, common accessibility bugs.</li>
    <li><b>Treating accessibility as optional polish.</b> For many users, it is the difference between being able to use the product at all or not.</li>
  </ul></div>
  <div class="sec-num">27.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Accessibility testing checks keyboard navigation, screen reader support, and color contrast, among other things, catching bugs that lock out real users a mouse-only, default-vision test pass would never notice.</p>
  ${qMC('q1', 'easy', 'Why might an icon-only "place order" button with no text label be an accessibility bug?',
    ['It is not a bug, icons are always fine', 'A screen reader may not be able to announce what the button does to a visually impaired user', 'Icon buttons are always faster to use'],
    1, 'Without an accessible label, a screen reader has nothing meaningful to announce for that button, making it effectively unusable for a visually impaired user.')}
`
};

lessons['28'] = {
  short: 'Certifications & careers', where: 'Part VIII · <b>Certifications &amp; career paths</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 28</div>
  <h2 class="title">Certifications &amp; career paths</h2>
  <p class="lead">QA offers more than one direction to grow in, and a certification can help but is rarely the deciding factor in getting hired.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Common QA career paths</div>
    <div class="qb-row"><span class="qb-kw kw-p">Manual QA / Test analyst</span><span class="qb-mean">deep test design, exploratory testing, bug investigation</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">SDET (Software Development Engineer in Test)</span><span class="qb-mean">writes automation frameworks, closer to a developer role</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">QA Lead / Manager</span><span class="qb-mean">owns test strategy across a team, mentors, coordinates with product and engineering</span></div>
  </div>
  <p class="body">ISTQB Foundation Level is the most widely recognized entry certification, useful for signaling baseline vocabulary and concepts, but hands-on ability to design a good test case, write a clear bug report, and reason about risk matters far more in an actual interview or job.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming a certification alone gets you hired.</b> It signals foundational knowledge, but interviews still probe hands-on reasoning far more.</li>
    <li><b>Thinking QA only leads to more QA.</b> Many testers move into automation-heavy SDET roles, product management, or engineering over time.</li>
  </ul></div>
  <div class="sec-num">28.1</div><h3 class="section-h">Recap</h3>
  <p class="body">QA careers can grow toward deep manual/exploratory expertise, automation-focused SDET roles, or team leadership. Certifications like ISTQB help signal foundational knowledge, but hands-on testing judgement is what interviews and jobs actually weigh most.</p>
  ${qMC('q1', 'easy', 'What does an SDET role typically emphasize compared to a manual QA role?',
    ['Writing marketing copy', 'Writing automation frameworks and code, closer to a development role', 'Neither role exists in real companies'],
    1, 'SDET (Software Development Engineer in Test) roles focus on building automation frameworks and tooling, sitting closer to development than manual test execution.')}
`
};

lessons['29'] = {
  short: 'Interview practice', where: 'Part VIII · <b>Interview questions &amp; cases</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 29</div>
  <h2 class="title">Interview questions &amp; cases</h2>
  <p class="lead">The final chapter: practice the kind of open-ended question a QA interview actually asks, using everything from this course.</p>
  <hr class="rule">
  <p class="body">QA interviews rarely ask you to recite definitions. They ask you to actually design tests, out loud, for something you've never seen before, exactly what the rest of this course was building toward.</p>
  <div class="sec-num">29.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This course covered testing fundamentals, manual technique, bug reporting, test design, API and data testing, automation basics, and non-functional testing, all through one consistent TastyGo case study. These final questions ask you to bring it all together.</p>
  ${qScenario('q1', 'hard', 'TastyGo is launching a "group order" feature: multiple people at the same address can add items to one shared cart before a single checkout. Design a short test strategy: name three specific test cases (mixing positive, negative, and edge-case) you would prioritize first, and why.',
    'A strong answer picks high-risk, high-value cases first, for example: (1) Positive: two people successfully add items and one of them checks out, confirming both sets of items appear correctly on the final order and receipt. (2) Negative/edge-case: what happens if two people try to check out the shared cart at the exact same time, does the system prevent a double-charge or duplicate order? (3) Edge-case: one participant removes an item the other person already paid their share for, does the system handle a mid-process cart change correctly? These are prioritized because they touch money, concurrency, and data consistency, the areas most likely to cause real, costly bugs.')}
  ${qScenario('q2', 'hard', 'A stakeholder says "just test everything before we launch" with two days left before release. How do you respond and what do you actually do?',
    'A strong answer pushes back constructively rather than agreeing to an impossible goal: explain that "everything" is not achievable in two days, then propose a risk-based approach, prioritizing payment, checkout, and any newly changed code first, followed by core regression flows, explicitly naming what will not get deep coverage given the time (and flagging that as a known, accepted risk to the stakeholder, not a silent gap).')}
  ${qMC('q3', 'med', 'A hiring manager asks "walk me through how you would test a login form." What should your answer emphasize most?',
    ['Only that you would try a valid username and password', 'A mix of positive cases (valid login), negative cases (wrong password, non-existent user), and edge cases (empty fields, extremely long input, case sensitivity)', 'That login forms do not need much testing since they are simple'],
    1, 'A strong answer demonstrates the full breadth this course covered: valid/expected behaviour, deliberately invalid input, and edge cases, not just the single obvious happy path.')}
`
};

/* ---------- cheat sheet ---------- */
const CHEATS = {
  '00': { note: 'QA systematically looks for the conditions under which software breaks, before real customers find them: designing tests, executing them, and reporting bugs clearly.' },
  '0b': { note: 'JIRA for bug tracking, TestRail/Zephyr for test case management, Postman for APIs, Selenium/Playwright for automation, SQL for confirming what actually happened in the data.' },
  '0i': { note: 'Same TastyGo dataset as SQLingo/BA: customers, restaurants, orders. Orders is the riskiest table since it links the other two.' },
  '01': { code: 'Human error → defect in code → failure (when triggered). A defect can exist, untriggered, long before it becomes a visible failure.' },
  '02': { code: 'A complete test case: Preconditions, Steps, Test data, Expected result — precise enough that pass/fail is a fact, not an opinion.' },
  '03': { code: 'Positive testing: valid input is correctly accepted. Negative testing: invalid input is correctly rejected. Bugs disproportionately hide in the negative cases.' },
  '04': { code: 'Test in a stable, production-like environment (staging/QA), with deliberately set-up test data, not whatever happens to already exist.' },
  '05': { code: 'Equivalence partitioning: group inputs into sets expected to behave alike, test one representative from each (valid and invalid).' },
  '06': { code: 'Boundary value analysis: test just below min, min itself, max itself, just above max — off-by-one bugs live at the edges.' },
  '07': { code: 'Exploratory testing: a focused charter + a time box + notes on anything unexpected. Disciplined, not random clicking.' },
  '08': { code: 'Regression testing: re-run tests after a change to confirm nothing that used to work broke. Focus on core flows, changed areas, historically fragile spots.' },
  '09': { code: 'A strong bug report: specific title, exact repro steps, expected vs. actual, environment, evidence.' },
  '10': { code: 'Severity = technical impact. Priority = business urgency. Related but independent; both matter for what gets fixed first.' },
  '11': { code: 'Isolating a bug: narrow from "sometimes" to an exact, minimal, repeatable trigger by changing one variable at a time.' },
  '12': { code: 'Good repro steps are minimal, numbered, and use exact data, not vague descriptions.' },
  '13': { code: 'Test plan: scope (in/out), approach, entry criteria, exit criteria — agreed in advance so everyone knows what "done" means.' },
  '14': { code: 'Traceability matrix: links every requirement to its verifying test case(s), surfacing untested requirements before release.' },
  '15': { code: 'Risk = likelihood × impact. Spend limited testing time where bugs are both more likely and more damaging.' },
  '16': { code: 'Test case management tools organize suites, track pass/fail runs over releases, and prevent testing knowledge living only in one head.' },
  '17': { code: 'API testing checks the full contract: correct status + correct response data for valid requests, sensible rejection of invalid ones.' },
  '18': { code: '2xx = success. 4xx = client\'s fault. 5xx = server\'s fault. A 5xx for bad input usually means missing validation.' },
  '19': { code: 'Query the database directly (SELECT) to confirm what actually got written, since the UI can show success even if the data layer didn\'t update correctly.' },
  '20': { code: 'Deliberately test NULLs, duplicates, extreme values, and empty states — real data conditions typical sample data won\'t reveal.' },
  '21': { code: 'Automate what repeats often (stable core flows, regression). Test pyramid: many unit tests, fewer integration, fewest end-to-end.' },
  '22': { code: 'Arrange (set up state), Act (perform the one behaviour), Assert (check the result) — keep each automated test focused on one thing.' },
  '23': { code: 'Prefer dedicated test IDs (data-testid) over CSS classes or screen position — stable regardless of styling/layout changes.' },
  '24': { code: 'CI/CD: every push auto-runs tests; failures can block a broken change from deploying. Watch for flaky tests eroding trust.' },
  '25': { code: 'Load testing = expected traffic. Stress testing = beyond-expected, graceful failure. Soak testing = long-running stability (memory leaks).' },
  '26': { code: 'Security testing: authentication (who you are) vs. authorization (what you can access) are different checks — both need testing.' },
  '27': { code: 'Accessibility: keyboard navigation, screen reader labels, color contrast — a mouse-only test pass misses real users.' },
  '28': { code: 'Career paths: Manual QA/Test analyst, SDET (automation-focused), QA Lead/Manager. ISTQB signals basics; hands-on judgement matters more.' },
  '29': { code: 'Interview prep: always cover positive, negative, and edge cases; prioritize by risk when time is short; push back constructively on "test everything."' },
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
      h += `<div class="cheat-card"><div class="cheat-card-h"><span class="ch">${n}</span> ${t}</div>${c.code ? `<pre class="code" style="white-space:pre-wrap;">${c.code}</pre>` : ''}${c.note ? `<div class="q-hint">${c.note}</div>` : ''}</div>`;
    });
    h += `</div>`;
  });
  return h;
}
lessons['cheatsheet'] = { short: 'Cheat sheet', where: '<b>Cheat sheet</b>', render: renderCheatsheet };

/* ---------- boot ---------- */
computeTotals();
go('00');

/* Re-entry hook: see the matching comment in public/app.js / public/ba.js. */
window.__qaReinit = function () {
  const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
  buildNav();
  computeTotals();
  go(curCh || order[0] || '00');
};
