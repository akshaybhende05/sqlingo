/* ============================================================
   BA Track — Business Analyst course engine
   Mirrors public/app.js (SQLingo) patterns: manifest, lessons,
   progress tracking, search, cheat sheet, glossary — but practice
   is either auto-graded multiple choice or scenario + model answer,
   since there is no live query engine to check work against.
   ============================================================ */

document.getElementById('loader').style.display = 'none';

/* ---------- glossary ---------- */
const glossary = {
  business_analyst: { short: 'The person who translates business needs into requirements a delivery team can build.', long: 'A Business Analyst (BA) sits between the people who need something (business stakeholders) and the people who build it (designers, developers, testers). Their job is to find out what is really needed, write it down clearly, and make sure what gets built actually solves the problem.' },
  stakeholder: { short: 'Anyone with an interest in, or influence over, the outcome.', long: 'A stakeholder is any person or group affected by, or able to affect, a project: the person who asked for it, the people who will use it, the team building it, and anyone whose work changes because of it.' },
  requirement: { short: 'A documented statement of what the business needs, not how to build it.', long: 'A requirement describes a need or a condition that must be met. Good requirements describe the "what", not the "how" — that is left to designers and engineers to solve.' },
  raci: { short: 'A grid that assigns Responsible, Accountable, Consulted, Informed to each task.', long: 'RACI is a responsibility-assignment matrix. For every task or decision, you name exactly one person Accountable, the people actually doing the work as Responsible, anyone whose input is required as Consulted, and everyone who just needs to know as Informed.' },
  elicitation: { short: 'The set of techniques used to draw requirements out of stakeholders.', long: 'Elicitation is the umbrella term for interviews, workshops, surveys, observation, and document analysis — the different ways a BA gathers what stakeholders actually need, since people rarely state it perfectly on the first try.' },
  root_cause: { short: 'The real, underlying reason a problem is happening, not its symptom.', long: 'A root cause is the actual source of a problem. Techniques like the 5 Whys keep asking "why" until you reach something you can genuinely fix, instead of patching a symptom that will just resurface.' },
  feasibility: { short: 'Whether a proposed solution can realistically be delivered.', long: 'Feasibility checks whether an idea is realistic across four common dimensions: technical (can it be built), operational (can the business run it day to day), financial (can it be afforded), and schedule (can it be done in time).' },
  as_is: { short: 'How a process works today, before any change.', long: 'The "as-is" state is a factual, judgement-free description of how a process currently works, including its inefficiencies. You document the as-is before proposing anything, so you know exactly what is changing and why.' },
  to_be: { short: 'How a process should work after the proposed change.', long: 'The "to-be" state describes the improved process once a solution is in place. A good to-be design solves a specific, documented problem in the as-is state, rather than change for its own sake.' },
  brd: { short: 'Business Requirements Document: the what and why, in business language.', long: 'A BRD describes the business problem, objectives, scope, and requirements in language a non-technical stakeholder can sign off on. It says what the business needs and why, not how a system should implement it.' },
  frd: { short: 'Functional Requirements Document: the detailed, system-level how.', long: 'An FRD takes an approved BRD and breaks it down into precise, testable system behaviour: what the system must do, screen by screen, rule by rule. It is written for designers, developers, and testers.' },
  user_story: { short: 'A short, plain-language statement of a need, from a user\'s point of view.', long: 'A user story follows "As a [role], I want [goal], so that [benefit]". It is intentionally small and conversational, and is always paired with acceptance criteria that define when it is actually done.' },
  acceptance_criteria: { short: 'The specific, testable conditions a user story must meet to be done.', long: 'Acceptance criteria remove ambiguity from a user story by listing exact, checkable conditions, often written as Given/When/Then statements, so everyone agrees on what "done" means before work starts.' },
  use_case: { short: 'A description of how an actor uses a system to achieve a goal.', long: 'A use case describes a goal-directed interaction between an actor (a person or system) and the system under discussion, including the main successful path and the alternate paths when things go differently.' },
  bpmn: { short: 'Business Process Model and Notation: a standard way to diagram processes.', long: 'BPMN is a widely used diagramming standard for business processes, using pools and lanes for who does what, tasks for steps, gateways for decisions, and events for starts, ends, and triggers.' },
  gap_analysis: { short: 'Comparing current capability to desired capability to find what must change.', long: 'Gap analysis lines up the current state against the desired future state and names the specific, actionable differences between them, the "gap" that a project must close.' },
  traceability: { short: 'Linking each requirement to its design, build, and test, end to end.', long: 'A traceability matrix maps every requirement to the design elements, code, and test cases that fulfil it, so nothing gets built without a reason and nothing gets missed during testing.' },
  moscow: { short: 'A prioritization method: Must have, Should have, Could have, Won\'t have.', long: 'MoSCoW sorts requirements into four buckets by how essential they are for this release: Must have (non-negotiable), Should have (important but not fatal to skip), Could have (nice if there is time), and Won\'t have (explicitly out of scope for now).' },
  agile: { short: 'An iterative way of delivering software in small, frequently reviewed chunks.', long: 'Agile delivery breaks work into short iterations (often called sprints), with regular check-ins and the expectation that requirements will be refined as real feedback comes in, rather than fully fixed upfront.' },
  backlog: { short: 'The ordered list of everything that could be built next.', long: 'A backlog is a living, prioritized list of user stories and tasks. It is groomed regularly, refined into smaller pieces, and reordered as priorities change.' },
  uat: { short: 'User Acceptance Testing: the business confirms the built thing is right.', long: 'UAT is the stage where actual business users test the delivered feature against the original acceptance criteria, in conditions close to real use, before formally signing off that it meets the need.' },
  scope_creep: { short: 'Small, unapproved additions that quietly grow a project beyond its plan.', long: 'Scope creep happens when small "while we are at it" additions get accepted without going through a change process, until the project is doing far more than it was ever planned, budgeted, or scheduled for.' },
};
function term(w, label) {
  const g = glossary[w];
  return `<span class="term" tabindex="0" role="button" aria-label="${label || w}, glossary term, press Enter to read more" onclick="baMore('${w}',this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();baMore('${w}',this)}">${label || w}<span class="tip">${g.short}<br><span style="color:#7fd8cb;font-size:11px">press Enter or click to read more</span></span></span>`;
}
function baMore(w, el) {
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
  const optsHtml = opts.map((o, i) => `<label class="mc-opt"><input type="radio" name="mc-${id}"> <span>${o}</span></label>`).join('');
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
try { PROG = JSON.parse(localStorage.getItem('ba_progress') || '{}'); } catch (_) { PROG = {}; }
function markProg(ch, id) { if (!ch) return; if (!PROG[ch]) PROG[ch] = {}; PROG[ch][id] = true; try { localStorage.setItem('ba_progress', JSON.stringify(PROG)); } catch (_) { } updateCourse(); }
function overallSolved() { let n = 0; for (const c in PROG) { n += Object.keys(PROG[c]).length; } return n; }
function updateCourse() {
  const el = document.getElementById('courseProg'); const fill = document.getElementById('courseProgFill'); const n = overallSolved();
  const done = TOTAL_Q > 0 && n >= TOTAL_Q;
  if (el) el.textContent = TOTAL_Q ? (done ? `Course complete — ${n} / ${TOTAL_Q} solved` : `Overall: ${n} / ${TOTAL_Q} solved`) : '';
  if (fill) fill.style.width = TOTAL_Q ? ((n / TOTAL_Q) * 100) + '%' : '0%';
  if (done) celebrateOnce();
}
function celebrateOnce() {
  let shown = false; try { shown = localStorage.getItem('ba_celebrated') === '1'; } catch (_) { }
  if (shown) return;
  try { localStorage.setItem('ba_celebrated', '1'); } catch (_) { }
  const t = document.createElement('div'); t.className = 'celebrate-toast';
  t.innerHTML = '<b>Every published chapter solved.</b><br>Nicely done. More chapters are on the way.';
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('show'); }, 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 6000);
}
function computeTotals() { const sq = qCount; TOTAL_Q = 0; for (const k in lessons) { qCount = 0; try { lessons[k].render(); } catch (_) { } TOTAL_Q += qCount; } qCount = sq; for (const kk in answers) delete answers[kk]; updateCourse(); }
function resetProgress() { if (!window.confirm('Reset all solved progress across every chapter? This cannot be undone.')) return; PROG = {}; try { localStorage.removeItem('ba_progress'); } catch (_) { } updateCourse(); if (curCh) go(curCh); }
function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('navOverlay').classList.toggle('show'); }
function closeMenu() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('navOverlay').classList.remove('show'); }

/* ---------- navigation ---------- */
const manifest = [
  { p: 'Groundwork', items: [['00', 'What a BA actually does', 1], ['0b', 'The BA toolkit landscape', 1], ['0i', 'Meet the company', 1]] },
  { p: 'Part I · Understanding the business', items: [['01', 'Stakeholders & RACI', 1], ['02', 'Needs vs. wants', 1], ['03', 'As-is vs. to-be', 1], ['04', 'SWOT & feasibility', 1]] },
  { p: 'Part II · Eliciting requirements', items: [['05', 'Elicitation techniques', 1], ['06', 'Running a workshop', 1], ['07', 'Writing interview questions', 1], ['08', 'Conflicting stakeholder asks', 1]] },
  { p: 'Part III · Documenting requirements', items: [['09', 'Business Requirements Doc', 1], ['10', 'Functional Requirements Doc', 1], ['11', 'User stories & acceptance criteria', 1], ['12', 'Use cases & diagrams', 1]] },
  { p: 'Part IV · Modeling the process', items: [['13', 'Process mapping basics', 1], ['14', 'BPMN fundamentals', 1], ['15', 'Data flow diagrams', 1], ['16', 'ER modeling for BAs', 1]] },
  { p: 'Part V · Analysis techniques', items: [['17', 'Gap analysis', 1], ['18', 'Impact & traceability', 1], ['19', 'Prioritization (MoSCoW, Kano)', 1], ['20', 'Data analysis for BAs', 1]] },
  { p: 'Part VI · Agile & delivery', items: [['21', 'Agile fundamentals for BAs', 1], ['22', 'Backlog management', 1], ['23', 'Working with UX', 1], ['24', 'UAT & sign-off', 1]] },
  { p: 'Part VII · Communication', items: [['25', 'Stakeholder reporting', 1], ['26', 'Managing scope creep', 1], ['27', 'Presenting findings', 1]] },
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
  try { localStorage.setItem('ba_last', num); } catch (_) {}
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
  short: 'What a BA does', where: 'Groundwork · <b>What a BA actually does</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 00</div>
  <h2 class="title">What a Business Analyst actually does</h2>
  <p class="lead">Ask five people what a ${term('business_analyst', 'Business Analyst')} does and you will get five different answers. Here is the honest version: a BA makes sure the right thing gets built, by finding out what people actually need before anyone writes a line of code.</p>
  <hr class="rule">
  <p class="body">Every product decision starts as a vague idea somewhere in the business. "Customers keep asking where their order is." "Support is overwhelmed on Friday nights." A BA's job is to take that vague, half-formed thought and turn it into something a designer can design and a developer can build, without losing what was actually meant.</p>
  <div class="analogy"><div class="lab">The dhaba order version</div><div class="txt">Picture a busy dhaba on a Friday night. A customer walks up and says, "give me something filling, not too spicy, quick." A good waiter does not shout that straight into the kitchen. They ask a follow-up or two, translate it into something precise — "one plain paratha, medium plate, no green chilli, priority ticket" — and hand the kitchen a ticket they can actually cook from. A BA is that waiter, standing between a business that knows what it wants only vaguely, and a team that needs something precise to build.</div></div>

  <div class="sec-num">0.1</div><h3 class="section-h">The three things a BA is really doing</h3>
  <p class="body">Underneath all the job titles and diagrams, a BA's day-to-day work comes down to three things, always in this order: find out what is actually needed (not just what was first said), write it down so nobody has to guess, and make sure what gets delivered actually matches what was written down.</p>
  <div class="qb"><div class="qb-title">The BA loop</div>
    <div class="qb-row"><span class="qb-kw kw-p">Elicit</span><span class="qb-mean">talk to the right people and dig past the first answer</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Document</span><span class="qb-mean">write it down precisely enough that two people would build the same thing</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Validate</span><span class="qb-mean">check the delivered work actually solves the original problem</span></div>
  </div>
  <p class="body">Everything in this course is really a deeper look at one of those three steps.</p>

  <div class="sec-num">0.2</div><h3 class="section-h">Where a BA sits</h3>
  <svg viewBox="0 0 640 160" class="diagram" role="img" aria-label="Diagram: Business stakeholders on the left, a Business Analyst in the middle, and the delivery team on the right, connected by two-way arrows.">
    <rect x="10" y="50" width="170" height="60" rx="10" fill="var(--teal-soft)" stroke="var(--teal)"/>
    <text x="95" y="76" text-anchor="middle" font-size="13" font-weight="700" fill="var(--teal-deep)">Business</text>
    <text x="95" y="94" text-anchor="middle" font-size="11" fill="var(--teal-deep)">stakeholders</text>
    <rect x="235" y="45" width="170" height="70" rx="10" fill="var(--amber-soft)" stroke="var(--amber)"/>
    <text x="320" y="76" text-anchor="middle" font-size="13" font-weight="700" fill="#7a4b0a">Business</text>
    <text x="320" y="94" text-anchor="middle" font-size="13" font-weight="700" fill="#7a4b0a">Analyst</text>
    <rect x="460" y="50" width="170" height="60" rx="10" fill="var(--rose-soft)" stroke="var(--rose)"/>
    <text x="545" y="76" text-anchor="middle" font-size="13" font-weight="700" fill="#7a251c">Delivery</text>
    <text x="545" y="94" text-anchor="middle" font-size="11" fill="#7a251c">designers &amp; devs</text>
    <line x1="180" y1="80" x2="234" y2="80" stroke="var(--ink-faint)" stroke-width="2" marker-end="url(#arrBA)"/>
    <line x1="234" y1="95" x2="180" y2="95" stroke="var(--ink-faint)" stroke-width="2" marker-end="url(#arrBA)"/>
    <line x1="405" y1="80" x2="459" y2="80" stroke="var(--ink-faint)" stroke-width="2" marker-end="url(#arrBA)"/>
    <line x1="459" y1="95" x2="405" y2="95" stroke="var(--ink-faint)" stroke-width="2" marker-end="url(#arrBA)"/>
    <defs><marker id="arrBA" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">Requirements flow one way, questions and clarifications flow back the other way. A BA who only passes messages along without questioning them is not really doing the job; the value is in the translation, not the relay.</p>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Confusing BA with Project Manager.</b> A PM manages timelines, budget, and people. A BA manages what is actually being built and why. The same person sometimes does both, but they are different jobs.</li>
    <li><b>Writing down the first thing you are told.</b> The first sentence a stakeholder says is rarely the full requirement. Chapter 02 covers how to dig past it.</li>
    <li><b>Disappearing after the requirements doc is written.</b> A BA stays involved through delivery, answering questions and checking the built thing against what was asked for.</li>
  </ul></div>

  <div class="sec-num">0.3</div><h3 class="section-h">Recap</h3>
  <p class="body">A BA elicits, documents, and validates. They sit between people who need something and people who build it, and their real job is translation, not transcription. Every chapter from here builds one part of that loop.</p>

  ${qMC('q1', 'easy', 'A stakeholder says "the app is too slow." What should a BA do first?',
    ['Write "improve app speed" as the requirement and pass it to engineering', 'Ask follow-up questions to find out which screen, when, and for whom it is slow', 'Tell the stakeholder engineering will look into it eventually'],
    1, 'A vague complaint needs to be narrowed down before it becomes a usable requirement — that narrowing is elicitation, covered fully in Part II.')}
  ${qMC('q2', 'easy', 'Which best describes the difference between a BA and a Project Manager?',
    ['There is no difference, they are the same role', 'A PM manages timeline, budget, and people; a BA manages what is being built and why', 'A BA only writes documentation and has no contact with stakeholders'],
    1, 'They are complementary roles that are often confused. A PM keeps a project on schedule and budget; a BA keeps it aligned to the right requirements.')}
  ${qScenario('q3', 'med', 'TastyGo\'s support lead says: "customers keep messaging us asking where their order is." Write two or three follow-up questions you would ask before writing any requirement.',
    'Good follow-ups dig into specifics rather than accepting the statement at face value, for example: "At what point in the order does this usually happen, right after placing it or closer to delivery?", "Is this happening for all restaurants or specific ones?", and "What do support agents currently tell the customer when this happens?" The goal is to find the actual gap (probably a missing real-time status update) rather than jumping straight to "build a tracking screen."')}
`
};

lessons['0b'] = {
  short: 'BA toolkit', where: 'Groundwork · <b>The BA toolkit landscape</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0b</div>
  <h2 class="title">The BA toolkit landscape</h2>
  <p class="lead">You do not need to master a dozen tools before you start. You need to know what each one is actually for, so you reach for the right one when the moment comes.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The everyday toolkit</div>
    <div class="qb-row"><span class="qb-kw kw-p">JIRA / Azure DevOps</span><span class="qb-mean">tracking requirements as tickets, linking them to delivery work</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Confluence / Notion</span><span class="qb-mean">writing and sharing BRDs, FRDs, and meeting notes</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Excel / Google Sheets</span><span class="qb-mean">RACI matrices, traceability matrices, quick data checks</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Visio / Lucidchart / draw.io</span><span class="qb-mean">process maps, BPMN diagrams, wireframe sketches</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">SQL</span><span class="qb-mean">answering "how often does this actually happen?" straight from real data</span></div>
  </div>
  <p class="body">That last one is why <a href="/courses/sql">SQLingo</a> pairs so well with this course. A BA who can write <code class="inl">SELECT</code> and <code class="inl">GROUP BY</code> can answer "how many orders were affected last month" in minutes, instead of waiting days for someone else to pull the number.</p>

  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">Think of these tools like the equipment behind a chai stall: the kettle (JIRA) keeps track of what is brewing and in what order, the notebook (Confluence) is where the recipe and daily notes live, and the scale (SQL, Excel) is what you weigh things on when someone asks "are we sure?" None of it replaces knowing what a good cup of chai actually needs, it just helps you deliver it consistently.</div></div>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Tool-hopping instead of communicating.</b> A perfectly organized JIRA board does not replace an actual conversation with a confused stakeholder.</li>
    <li><b>Treating diagrams as decoration.</b> A process map exists to be checked against reality, not to look polished in a slide deck.</li>
  </ul></div>

  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Tools support the three BA activities from chapter 00, they do not replace them. Pick the lightest tool that gets the job done clearly.</p>

  ${qMC('q1', 'easy', 'Which tool would you reach for to answer "how many refund requests did we get last week, exactly?"',
    ['Visio', 'SQL or a spreadsheet pulling real data', 'JIRA'],
    1, 'JIRA and Visio are for tracking and modeling; when the question is about real historical numbers, you need to query or filter actual data.')}
  ${qMC('q2', 'easy', 'A BRD (requirements document) most naturally lives in:',
    ['A drawing tool like Visio', 'A shared document/wiki tool like Confluence or Notion', 'A spreadsheet with no text formatting'],
    1, 'BRDs are prose-heavy documents meant to be read, reviewed, and commented on collaboratively, which is exactly what wiki-style tools are built for.')}
`
};

lessons['0i'] = {
  short: 'Meet the company', where: 'Groundwork · <b>Meet the company</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0i</div>
  <h2 class="title">Meet the company</h2>
  <p class="lead">Every example in this course happens inside one company, so the scenarios build on each other instead of starting from zero every chapter. If you have been through SQLingo, this will look familiar.</p>
  <hr class="rule">
  <p class="body"><b>TastyGo</b> is a food delivery app operating across Mumbai, Delhi, Pune, and Bangalore. It connects <b>customers</b> to <b>restaurants</b>, and every <b>order</b> placed links exactly one customer to exactly one restaurant. This is the same customers/restaurants/orders world used throughout SQLingo, just seen now from a business angle instead of a query one.</p>

  <div class="qb"><div class="qb-title">Who you'll meet in this course</div>
    <div class="qb-row"><span class="qb-kw kw-p">Ops Head</span><span class="qb-mean">owns delivery times, restaurant onboarding, day-to-day operations</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Support Lead</span><span class="qb-mean">owns the customer support team and ticket queue</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Engineering Manager</span><span class="qb-mean">owns the delivery team that actually builds features</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Marketing Lead</span><span class="qb-mean">owns promotions, loyalty programs, customer communication</span></div>
  </div>

  <p class="body">TastyGo makes money by taking a commission on every order. That single fact explains almost every decision the business makes: anything that increases the number of orders, or the average order size, is worth investing in; anything that increases refunds or cancelled orders eats directly into revenue.</p>

  <div class="analogy"><div class="lab">Why this matters</div><div class="txt">A requirement never exists in isolation. When the Support Lead later asks for a "better refund process," a good BA already knows refunds cost the business money directly, so the real requirement is not just "make refunds easier," it is "make refunds fast enough to keep customers happy, without making them so easy that people abuse the system."</div></div>

  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TastyGo, its four recurring stakeholders, and its commission-based business model are the backdrop for every scenario from here on. Keep this chapter in mind; later chapters will assume you remember who the Ops Head, Support Lead, Engineering Manager, and Marketing Lead are.</p>

  ${qMC('q1', 'easy', 'Why does TastyGo\'s commission-based business model matter to a BA?',
    ['It does not matter, BAs only care about features', 'It explains why certain requirements (more orders, fewer refunds) matter more to the business than others', 'It only matters to the finance team'],
    1, 'Understanding how a business makes money helps a BA judge which requirements are actually high priority, not just loudly requested.')}
`
};

lessons['01'] = {
  short: 'Stakeholders & RACI', where: 'Part I · <b>Stakeholders &amp; RACI</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 01</div>
  <h2 class="title">Stakeholder identification &amp; RACI</h2>
  <p class="lead">Before you can gather requirements, you need to know whose requirements actually count, and what each person is supposed to do about the decision at hand.</p>
  <hr class="rule">
  <p class="body">A ${term('stakeholder')} is not just "someone in a meeting." It is anyone whose work changes, or whose approval is needed, because of what you are building. Missing a real stakeholder is one of the most common reasons a delivered feature gets rejected late, after it is already built.</p>

  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">Imagine reorganizing seating at a busy dhaba. The obvious stakeholder is the owner. But the waiters need to be asked (their walking routes change), the regular customers need to be considered (their favourite table might move), and the kitchen staff care too (a bigger dining area might mean more orders at once). Forgetting the waiters is exactly how a "great idea" turns into chaos on day one.</div></div>

  <div class="sec-num">1.1</div><h3 class="section-h">The RACI matrix</h3>
  <p class="body">Once you know who the stakeholders are, ${term('raci', 'RACI')} tells you exactly what role each one plays on a given task or decision.</p>
  <div class="qb"><div class="qb-title">The four roles</div>
    <div class="qb-row"><span class="qb-kw kw-p">Responsible</span><span class="qb-mean">actually does the work</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Accountable</span><span class="qb-mean">owns the outcome, signs off — exactly one person per task</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Consulted</span><span class="qb-mean">gives input before the decision is made, two-way conversation</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Informed</span><span class="qb-mean">told after the fact, one-way notification</span></div>
  </div>

  <div class="sec-num">1.2</div><h3 class="section-h">Worked example: live order tracking at TastyGo</h3>
  <p class="body">TastyGo is adding a live order-tracking screen. Here is a RACI for the decision to launch it:</p>
  <svg viewBox="0 0 640 190" class="diagram" role="img" aria-label="RACI grid for the live order tracking launch decision">
    <rect x="0" y="0" width="640" height="190" fill="none"/>
    <rect x="180" y="0" width="115" height="30" fill="var(--sidebar-soft)"/><text x="237" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">R</text>
    <rect x="295" y="0" width="115" height="30" fill="var(--sidebar-soft)"/><text x="352" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">A</text>
    <rect x="410" y="0" width="115" height="30" fill="var(--sidebar-soft)"/><text x="467" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">C</text>
    <rect x="525" y="0" width="115" height="30" fill="var(--sidebar-soft)"/><text x="582" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">I</text>
    <text x="0" y="55" font-size="12.5" fill="var(--ink)">Engineering Manager</text>
    <text x="0" y="90" font-size="12.5" fill="var(--ink)">Ops Head</text>
    <text x="0" y="125" font-size="12.5" fill="var(--ink)">Support Lead</text>
    <text x="0" y="160" font-size="12.5" fill="var(--ink)">Marketing Lead</text>
    <g font-size="13" text-anchor="middle" font-weight="700">
      <text x="237" y="55" fill="var(--teal)">R</text>
      <text x="352" y="90" fill="var(--amber)">A</text>
      <text x="467" y="125" fill="var(--rose)">C</text>
      <text x="582" y="160" fill="var(--ink-faint)">I</text>
    </g>
  </svg>
  <p class="body">Only the Ops Head is Accountable, one clear owner. Engineering is Responsible for building it. Support is Consulted because they will field questions about it. Marketing is only Informed, since they need to know it exists but have no say in how it works.</p>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>More than one Accountable.</b> If two people are both marked A, nobody is really accountable. Pick one.</li>
    <li><b>Everyone marked Consulted.</b> If everyone must weigh in on everything, decisions never get made. Be selective.</li>
    <li><b>Confusing Responsible with Accountable.</b> The person who does the work is not always the person who owns whether it succeeds.</li>
  </ul></div>

  <div class="sec-num">1.3</div><h3 class="section-h">Recap</h3>
  <p class="body">Identify every stakeholder whose work or approval is affected, then use RACI to make each person's role explicit: exactly one Accountable, the doers as Responsible, a short list of Consulted, and everyone else Informed.</p>

  ${qMC('q1', 'easy', 'In a RACI matrix, how many people should typically be marked "Accountable" for a single task?',
    ['As many as possible, for shared ownership', 'Exactly one', 'Zero, Accountable is optional'],
    1, 'Having exactly one Accountable person avoids the "everyone and no one" ownership problem that stalls decisions.')}
  ${qMC('q2', 'med', 'TastyGo\'s Support Lead will field customer questions about a new feature but has no say in how it is built. What should they be marked as in the RACI?',
    ['Responsible', 'Accountable', 'Consulted', 'Informed'],
    3, 'They are affected by the outcome and should be told, but since they have no input into the decision itself, Informed is the correct role, not Consulted.', )}
  ${qScenario('q3', 'med', 'TastyGo is deciding whether to let customers cancel an order after it has been accepted by the restaurant. List the stakeholders you would include, and assign each one a RACI role, with a one-line reason.',
    'A reasonable RACI: Ops Head — Accountable (owns the overall cancellation policy and its business impact). Engineering Manager — Responsible (their team builds the cancellation flow). Support Lead — Consulted (they know how customers currently react to failed cancellations and can flag edge cases). Restaurants/restaurant partnerships lead — Consulted (a late cancellation affects food already being prepared). Marketing Lead — Informed (needs to know the policy exists to avoid promising something different in campaigns). The key judgement call is recognizing restaurants as a stakeholder group even though they are not an internal team.')}
`
};

lessons['02'] = {
  short: 'Needs vs. wants', where: 'Part I · <b>Needs vs. wants</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 02</div>
  <h2 class="title">Needs vs. wants (root cause thinking)</h2>
  <p class="lead">What a stakeholder asks for first is almost never the actual requirement. It is their guess at a solution to a problem they have not fully explained yet.</p>
  <hr class="rule">
  <p class="body">A "want" is the solution someone shows up with. A "need" is the underlying problem that solution is trying to solve. A BA's job is to hear the want, and politely dig until the real need surfaces, because the same need can often be solved more cheaply, or more completely, by a different solution than the one first suggested.</p>

  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">A regular customer tells the dhaba owner, "put a TV on that wall." That is a want, a specific solution. Dig one level and the actual need might be "I get bored waiting 15 minutes for my order." A TV solves that. So does a faster kitchen, a token system so people know their wait time, or free roasted peanuts while they wait. The TV was just the first idea that came to the customer's mind.</div></div>

  <div class="sec-num">2.1</div><h3 class="section-h">The 5 Whys</h3>
  <p class="body">The simplest ${term('root_cause', 'root-cause')} technique is also the most reliable: keep asking "why" until the answer stops being useful, usually three to five times.</p>
  <svg viewBox="0 0 640 200" class="diagram" role="img" aria-label="Five Whys ladder diagram going from a customer complaint to a root cause">
    <g font-family="Inter, sans-serif">
      ${['"Customers are messaging support asking where their order is."', '"There is no way for them to check status themselves."', '"The app only shows order status at checkout, never after."', '"Nobody built a live status screen after checkout."', '"It was never flagged as a requirement when the app was built."']
        .map((txt, i) => `<rect x="0" y="${i * 38}" width="640" height="30" rx="7" fill="${i === 4 ? 'var(--teal-soft)' : 'var(--surface)'}" stroke="${i === 4 ? 'var(--teal)' : 'var(--line)'}"/><text x="14" y="${i * 38 + 20}" font-size="12.5" fill="${i === 4 ? 'var(--teal-deep)' : 'var(--ink-soft)'}">${i + 1}. Why? ${txt}</text>`).join('')}
    </g>
  </svg>
  <p class="body">The root cause turned out to be a missing feature, not a support-team training problem or a slow kitchen. That changes what gets built entirely.</p>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Stopping at the first "why."</b> One level down is usually still a symptom, not a cause.</li>
    <li><b>Jumping straight to a solution.</b> "Let's add push notifications" might be right, but only after the actual need is confirmed.</li>
    <li><b>Treating every "why" as someone's fault.</b> Root-cause analysis is about the process, not about blaming a person.</li>
  </ul></div>

  <div class="sec-num">2.2</div><h3 class="section-h">Recap</h3>
  <p class="body">Wants are solutions people bring you. Needs are the problems underneath. Use the 5 Whys to walk from one to the other before writing any requirement down.</p>

  ${qMC('q1', 'easy', 'A stakeholder says "add a filter button to the menu." This statement is best described as a:',
    ['Need', 'Want (a proposed solution)', 'Root cause'],
    1, 'A specific feature request like this is a want. The BA still needs to ask what problem the filter is meant to solve.')}
  ${qMC('q2', 'med', 'What is the main risk of writing down the first thing a stakeholder asks for, without digging further?',
    ['Nothing, stakeholders always know exactly what they need', 'You might build a working solution that does not actually solve the real problem', 'It takes too much time to ask follow-up questions'],
    1, 'The point of root-cause thinking is that the first request is a guess at a solution, and building it faithfully does not guarantee the actual problem gets solved.')}
  ${qScenario('q3', 'med', 'TastyGo\'s Marketing Lead says, "we need a bigger discount banner on the home screen, ours is too small." Write a short 5 Whys chain (3-4 steps) to find the real need.',
    'A plausible chain: Why a bigger banner? "Because discount click-through is low." Why is click-through low? "Because usage data shows most people never scroll past the first screen." Why don\'t they scroll? "The home screen is cluttered with restaurant listings before any promotions appear." Root cause: the banner\'s size was never the issue, its position and the page\'s layout priority is. The real requirement becomes "surface active discounts higher on the home screen," which might be solved without enlarging anything.')}
`
};

lessons['03'] = {
  short: 'As-is vs. to-be', where: 'Part I · <b>As-is vs. to-be</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 03</div>
  <h2 class="title">As-is vs. to-be analysis</h2>
  <p class="lead">You cannot design a better process for something you have not accurately mapped as it exists today. Skipping this step is how "improvements" quietly break things nobody realized still depended on the old way.</p>
  <hr class="rule">
  <p class="body">The ${term('as_is', 'as-is')} state is a plain, factual map of how a process works right now, warts and all. The ${term('to_be', 'to-be')} state is the redesigned version, once a specific, documented problem in the as-is has been addressed.</p>

  <div class="sec-num">3.1</div><h3 class="section-h">Worked example: TastyGo refunds</h3>
  <p class="body">Today, a refund at TastyGo works like this:</p>
  <svg viewBox="0 0 640 130" class="diagram" role="img" aria-label="As-is refund process: customer emails support, support manually checks the order, support manually processes refund, customer waits up to 3 days">
    <g font-family="Inter, sans-serif" font-size="11.5">
      ${['Customer emails support', 'Agent manually looks up order', 'Agent manually approves refund', 'Refund appears in 2-3 days']
        .map((txt, i) => `<rect x="${i * 160}" y="30" width="145" height="55" rx="9" fill="var(--rose-soft)" stroke="var(--rose)"/><foreignObject x="${i * 160 + 8}" y="38" width="129" height="42"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:11px;line-height:1.35;color:#7a251c;text-align:center;">${txt}</div></foreignObject>`).join('')}
      ${[0, 1, 2].map(i => `<line x1="${i * 160 + 145}" y1="57" x2="${i * 160 + 160}" y2="57" stroke="var(--ink-faint)" stroke-width="2" marker-end="url(#arrBA2)"/>`).join('')}
    </g>
    <defs><marker id="arrBA2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">The as-is map makes the actual bottleneck obvious: two manual, human steps in the middle. The proposed to-be state targets exactly those, and nothing else:</p>
  <svg viewBox="0 0 640 130" class="diagram" role="img" aria-label="To-be refund process: customer requests refund in-app, system auto-checks eligibility, refund initiated automatically, customer waits minutes">
    <g font-family="Inter, sans-serif" font-size="11.5">
      ${['Customer requests refund in-app', 'System auto-checks eligibility', 'Refund initiated automatically', 'Refund appears in minutes']
        .map((txt, i) => `<rect x="${i * 160}" y="30" width="145" height="55" rx="9" fill="var(--teal-soft)" stroke="var(--teal)"/><foreignObject x="${i * 160 + 8}" y="38" width="129" height="42"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:11px;line-height:1.35;color:var(--teal-deep);text-align:center;">${txt}</div></foreignObject>`).join('')}
      ${[0, 1, 2].map(i => `<line x1="${i * 160 + 145}" y1="57" x2="${i * 160 + 160}" y2="57" stroke="var(--ink-faint)" stroke-width="2" marker-end="url(#arrBA3)"/>`).join('')}
    </g>
    <defs><marker id="arrBA3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Designing the to-be before mapping the as-is.</b> You end up "fixing" a step that was never actually the problem.</li>
    <li><b>Mapping the as-is from memory instead of observation.</b> What people say they do and what they actually do often differ.</li>
    <li><b>Redesigning everything at once.</b> The best to-be states change as little as possible while still solving the documented problem.</li>
  </ul></div>

  <div class="sec-num">3.2</div><h3 class="section-h">Recap</h3>
  <p class="body">Map the as-is honestly first. Let it show you exactly where the real bottleneck is. Then design a to-be state that targets that bottleneck specifically, not the whole process.</p>

  ${qMC('q1', 'easy', 'What is the main purpose of documenting the as-is state before proposing changes?',
    ['To have something to show in a presentation', 'To accurately locate the real bottleneck before redesigning anything', 'It is not necessary if the team already has an idea for improvement'],
    1, 'Without an accurate as-is map, a "fix" might target a step that was never actually causing the problem.')}
  ${qMC('q2', 'med', 'In the TastyGo refund example, which as-is steps did the to-be design actually target?',
    ['The email channel and the customer\'s wait time only', 'The two manual human steps: looking up the order and approving the refund', 'Nothing, the whole process was rebuilt from scratch'],
    1, 'Good to-be designs target the specific documented bottleneck, in this case the manual lookup and manual approval, rather than rebuilding everything.')}
  ${qScenario('q3', 'hard', 'TastyGo\'s Ops Head wants to redesign how new restaurants get onboarded onto the platform. Before proposing a to-be process, list 3-4 questions you would ask to map the current as-is state.',
    'Useful as-is questions: "Walk me through, step by step, what happens from the moment a restaurant signs up to when they receive their first order." "Which of these steps are manual today, and who does them?" "Where do onboardings currently get stuck or delayed the most?" "How long does the whole process take on average today?" These questions force a factual walkthrough rather than jumping straight into "what should the new process look like."')}
`
};

lessons['04'] = {
  short: 'SWOT & feasibility', where: 'Part I · <b>SWOT &amp; feasibility</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 04</div>
  <h2 class="title">SWOT &amp; feasibility basics</h2>
  <p class="lead">Before any idea becomes a requirement, it is worth a quick sanity check: is this actually a good idea, and can it realistically be delivered?</p>
  <hr class="rule">
  <p class="body">SWOT organizes your thinking about an idea into four honest categories. It is only useful when the answers are specific to the actual decision, not generic statements that could apply to any company.</p>
  <svg viewBox="0 0 500 300" class="diagram" role="img" aria-label="SWOT 2 by 2 grid: Strengths, Weaknesses, Opportunities, Threats">
    <rect x="0" y="0" width="250" height="150" fill="var(--teal-soft)" stroke="var(--teal)"/>
    <text x="125" y="30" text-anchor="middle" font-weight="700" font-size="13" fill="var(--teal-deep)">Strengths</text>
    <foreignObject x="14" y="40" width="222" height="100"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:11.5px;color:var(--teal-deep);line-height:1.4;">Large existing customer base already ordering weekly</div></foreignObject>
    <rect x="250" y="0" width="250" height="150" fill="var(--rose-soft)" stroke="var(--rose)"/>
    <text x="375" y="30" text-anchor="middle" font-weight="700" font-size="13" fill="#7a251c">Weaknesses</text>
    <foreignObject x="264" y="40" width="222" height="100"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:11.5px;color:#7a251c;line-height:1.4;">No existing points/rewards infrastructure to build on</div></foreignObject>
    <rect x="0" y="150" width="250" height="150" fill="var(--amber-soft)" stroke="var(--amber)"/>
    <text x="125" y="180" text-anchor="middle" font-weight="700" font-size="13" fill="#7a4b0a">Opportunities</text>
    <foreignObject x="14" y="190" width="222" height="100"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:11.5px;color:#7a4b0a;line-height:1.4;">Loyalty points could raise average order frequency</div></foreignObject>
    <rect x="250" y="150" width="250" height="150" fill="var(--line-soft)" stroke="var(--line)"/>
    <text x="375" y="180" text-anchor="middle" font-weight="700" font-size="13" fill="var(--ink-soft)">Threats</text>
    <foreignObject x="264" y="190" width="222" height="100"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:11.5px;color:var(--ink-soft);line-height:1.4;">Competitor already has a well-known loyalty program</div></foreignObject>
  </svg>
  <p class="body">Notice each box above is specific to TastyGo considering a loyalty points feature, not a generic statement. That specificity is what makes SWOT useful instead of a box-ticking exercise.</p>

  <div class="sec-num">4.1</div><h3 class="section-h">Feasibility: four questions</h3>
  <div class="qb"><div class="qb-title">Before committing to an idea, check</div>
    <div class="qb-row"><span class="qb-kw kw-p">Technical</span><span class="qb-mean">can it actually be built with the systems and skills available?</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Operational</span><span class="qb-mean">can the business realistically run it day to day once live?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Financial</span><span class="qb-mean">does the expected benefit outweigh the cost to build and run it?</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Schedule</span><span class="qb-mean">can it be delivered inside the timeframe that actually matters?</span></div>
  </div>

  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Generic SWOT entries.</b> "Strong brand" tells you nothing useful about this specific decision.</li>
    <li><b>Skipping feasibility because an idea sounds good.</b> Enthusiasm is not the same as being buildable on time and on budget.</li>
  </ul></div>

  <div class="sec-num">4.2</div><h3 class="section-h">Recap</h3>
  <p class="body">SWOT forces an honest, specific look at an idea from four angles. Feasibility then checks whether it can realistically be delivered, across technical, operational, financial, and schedule dimensions.</p>

  ${qMC('q1', 'easy', 'Which SWOT category would "a competitor already has a well-known loyalty program" belong in?',
    ['Strength', 'Weakness', 'Threat'],
    2, 'This is an external factor working against the idea, which makes it a threat, not an internal weakness of TastyGo itself.')}
  ${qMC('q2', 'med', 'A feature is technically easy to build but would require support agents to learn a completely new tool overnight. Which feasibility dimension does this mainly concern?',
    ['Technical feasibility', 'Operational feasibility', 'Financial feasibility'],
    1, 'Whether the business can realistically operate and staff the new process day to day is exactly what operational feasibility checks.')}
  ${qScenario('q3', 'med', 'TastyGo is considering letting customers schedule orders up to 24 hours in advance. Write one specific point for each SWOT category.',
    'A specific version might read: Strength — TastyGo already has reliable order-time data to build predictions from. Weakness — the current kitchen-ready notification system assumes near-immediate orders, not scheduled ones. Opportunity — could capture office lunch orders placed the night before. Threat — a scheduled order that a restaurant later cannot fulfil would create a worse experience than a same-time order failing. The specificity (tied to TastyGo\'s actual systems and customers) is what separates a useful SWOT from a generic one.')}
`
};

lessons['05'] = {
  short: 'Elicitation techniques', where: 'Part II · <b>Elicitation techniques</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 05</div>
  <h2 class="title">Elicitation techniques</h2>
  <p class="lead">${term('elicitation', 'Elicitation')} is not one thing, it is a toolbox. Picking the wrong technique for the situation is one of the quietest ways a BA ends up with weak requirements.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Match the technique to the situation</div>
    <div class="qb-row"><span class="qb-kw kw-p">1:1 interview</span><span class="qb-mean">deep, sensitive, or conflicting topics with one stakeholder</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Workshop</span><span class="qb-mean">several stakeholders need to agree on something together</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Survey</span><span class="qb-mean">a broad, shallow read on many people's opinions quickly</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Observation</span><span class="qb-mean">watching how a process is actually done, not how people describe it</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Document analysis</span><span class="qb-mean">the process is already written down somewhere, just outdated</span></div>
  </div>
  <p class="body">At TastyGo, if the Support Lead and Ops Head disagree about how refunds should work, a 1:1 with each first (to hear the honest version without the other person in the room) usually surfaces more than jumping straight to a joint workshop.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">You would not survey a hundred customers to find out why one specific regular stopped coming in, and you would not sit down for a one-on-one chat to understand what snacks a whole neighbourhood wants. The technique has to match the size and shape of the question.</div></div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using only one technique for everything.</b> Interviews alone will miss what a stakeholder does not think to mention but would do differently in practice.</li>
    <li><b>Trusting what people say over what they do.</b> Observation regularly contradicts what stakeholders describe in interviews, not out of dishonesty, just habit blindness.</li>
  </ul></div>
  <div class="sec-num">5.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Elicitation is a toolbox, not a single method. Pick interviews for depth, workshops for group agreement, surveys for breadth, observation for the gap between what people say and do, and document analysis when something is already half-written.</p>
  ${qMC('q1', 'easy', 'You need three department heads to agree on one shared process by the end of the meeting. Which technique fits best?',
    ['Survey', 'Workshop', 'Document analysis'],
    1, 'A workshop is built for exactly this: getting multiple stakeholders to a shared agreement in real time.')}
  ${qMC('q2', 'med', 'Support agents say refunds "usually" take one day, but you suspect it is longer. What is the most reliable way to check?',
    ['Ask a different support agent the same question', 'Observe or pull real data on actual refund turnaround time', 'Assume the agents are right since they do the work'],
    1, 'Stated behaviour and actual behaviour often differ; observation or real data settles it more reliably than another opinion.')}
  ${qScenario('q3', 'med', 'TastyGo\'s Marketing Lead wants quick, broad input from customers on whether they would use a loyalty program, without a long back-and-forth. Which technique would you choose, and why?',
    'A short survey is the right fit here: the goal is breadth (many customers) and a shallow read (yes/no or a 1-5 interest scale) rather than deep, individual detail, which is exactly what surveys are good at and workshops or interviews are not.')}
`
};

lessons['06'] = {
  short: 'Running a workshop', where: 'Part II · <b>Running a workshop</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 06</div>
  <h2 class="title">Running a requirements workshop</h2>
  <p class="lead">A workshop without structure turns into a meeting where the loudest person's opinion becomes the requirement. A little preparation fixes that.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Before, during, after</div>
    <div class="qb-row"><span class="qb-kw kw-p">Before</span><span class="qb-mean">send a clear agenda and the specific decision you need, in advance</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">During</span><span class="qb-mean">timebox each topic, keep an open "parking lot" for off-topic points</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">After</span><span class="qb-mean">send written notes and decisions within a day, while memory is fresh</span></div>
  </div>
  <p class="body">The "parking lot" matters more than it sounds. When TastyGo's Ops Head starts raising a delivery-partner pay question during a refund-policy workshop, writing it on the parking lot instead of debating it keeps the meeting on track without dismissing the concern.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>No agenda sent beforehand.</b> People arrive unprepared and the meeting drifts.</li>
    <li><b>One person dominating.</b> A facilitator's job includes actively inviting quieter stakeholders to speak.</li>
    <li><b>No written follow-up.</b> A decision that only exists in people's memory gets re-litigated later.</li>
  </ul></div>
  <div class="sec-num">6.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Send the agenda ahead of time, timebox topics and park distractions during the workshop, and send written notes immediately after. All three matter; skipping any one of them quietly weakens the outcome.</p>
  ${qMC('q1', 'easy', 'What is a "parking lot" used for in a workshop?',
    ['A place to note off-topic points so the meeting stays on track without ignoring them', 'A list of attendees who arrived late', 'The final decision log'],
    0, 'The parking lot captures valid but off-topic points so they are not lost, without derailing the current agenda item.')}
  ${qMC('q2', 'med', 'Why send a workshop agenda in advance rather than at the start of the meeting?',
    ['It does not matter when it is sent', 'So stakeholders arrive prepared and the meeting time is spent deciding, not explaining context', 'To make the meeting look more official'],
    1, 'Preparation before the meeting is what lets the actual meeting time be used for discussion and decisions rather than catching people up.')}
  ${qScenario('q3', 'med', 'During a TastyGo workshop about the refund policy, the Engineering Manager keeps steering the conversation toward an unrelated database migration. As facilitator, what would you do?',
    'Acknowledge the point is valid, note it in the parking lot with an owner and a follow-up time, and redirect back to the refund policy agenda item, for example: "That is worth tracking, I will note it in the parking lot and we can set up a separate conversation, let\'s get back to the refund threshold question." This keeps the relationship intact while protecting the meeting\'s actual goal.')}
`
};

lessons['07'] = {
  short: 'Interview questions', where: 'Part II · <b>Writing interview questions</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 07</div>
  <h2 class="title">Writing good interview questions</h2>
  <p class="lead">The way a question is phrased quietly decides the answer you get. A leading question gets you agreement, not truth.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Open vs. leading</div>
    <div class="qb-row"><span class="qb-kw kw-r">Leading</span><span class="qb-mean">"Don't you think the checkout is too slow?" — invites agreement, not honesty</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Open</span><span class="qb-mean">"Walk me through what happens when you check out." — invites the real story</span></div>
  </div>
  <p class="body">Follow-up prompts do most of the real work in an interview: "why did that happen," "how often does that come up," "what do you do when that happens." These push past the first, polished answer into what actually happens day to day.</p>
  <div class="analogy"><div class="lab">The chai-table version</div><div class="txt">Asking a regular "you like the extra ginger in your chai, right?" gets a polite yes even if it is not quite true. Asking "how would you want your chai different, if at all?" gets the real answer, because it does not assume what they will say.</div></div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Stacking two questions into one.</b> "Is the app slow and confusing?" forces one answer onto two different issues.</li>
    <li><b>Using internal jargon the stakeholder does not use.</b> Ask about their world in their words, not your team's vocabulary.</li>
  </ul></div>
  <div class="sec-num">7.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Prefer open questions over leading ones, ask one thing at a time, and use "why" and "how often" follow-ups to get past the first, tidy answer.</p>
  ${qMC('q1', 'easy', 'Which of these is a leading question?',
    ['"Walk me through how you currently process a refund."', '"Don\'t you agree the refund process takes too long?"', '"What happens after a customer requests a refund?"'],
    1, 'It embeds the answer ("too long") into the question itself, inviting agreement rather than an honest, independent answer.')}
  ${qMC('q2', 'med', 'A stakeholder says "the app is slow and confusing." What is the best follow-up?',
    ['Write down "slow and confusing" as the requirement', 'Ask them to separate the two: which screen feels slow, and separately, what feels confusing', 'Move to the next question'],
    1, 'This is two different problems bundled into one sentence; separating them is necessary before either can become a usable requirement.')}
  ${qScenario('q3', 'med', 'Rewrite this leading question into an open one: "Don\'t you think restaurants should be onboarded faster?"',
    'An open version: "Walk me through what happens today from when a restaurant signs up to when they get their first order. Where does that process feel slow or stuck to you?" This removes the embedded assumption ("should be faster") and invites a full, honest account instead of agreement with a premise.')}
`
};

lessons['08'] = {
  short: 'Conflicting asks', where: 'Part II · <b>Conflicting stakeholder asks</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 08</div>
  <h2 class="title">Handling conflicting stakeholder asks</h2>
  <p class="lead">Two reasonable stakeholders can want opposite things for equally good reasons. Picking a side quietly, or refusing to pick at all, both fail the project.</p>
  <hr class="rule">
  <p class="body">At TastyGo, Marketing wants refunds to be instant and generous, to keep customers happy. Finance wants refunds reviewed carefully, since instant refunds have been abused before. Neither is wrong, they are optimizing for different things.</p>
  <div class="qb"><div class="qb-title">A repeatable way through it</div>
    <div class="qb-row"><span class="qb-kw kw-p">Name it</span><span class="qb-mean">say the conflict out loud to both sides, do not let it stay unspoken</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Find the shared goal</span><span class="qb-mean">both sides usually want "happy customers who do not cost us money"</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Escalate with a recommendation</span><span class="qb-mean">if it cannot be resolved at your level, bring it up with a proposed answer, not just the problem</span></div>
  </div>
  <p class="body">A workable middle ground here: instant refunds under a small amount, manual review above it. Neither side gets everything, but both underlying goals are respected.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Silently picking the side of whoever asked last, or is more senior.</b> This erodes trust once the other stakeholder finds out.</li>
    <li><b>Escalating without a recommendation.</b> "They disagree, please decide" is far less useful than "here are two options and which I would pick, and why."</li>
  </ul></div>
  <div class="sec-num">8.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Name the conflict explicitly, look for the shared goal underneath the disagreement, and if you escalate, escalate with a specific recommendation rather than just the problem.</p>
  ${qMC('q1', 'easy', 'Two stakeholders want opposite things. What should a BA generally avoid doing?',
    ['Naming the conflict openly to both sides', 'Quietly favouring whichever stakeholder is more senior without telling the other', 'Looking for a shared underlying goal'],
    1, 'Silently picking a side erodes trust with the other stakeholder once they discover it, and avoids actually resolving the underlying disagreement.')}
  ${qMC('q2', 'med', 'When escalating an unresolved conflict to leadership, what makes the escalation more useful?',
    ['Presenting only the problem and letting leadership figure out the options', 'Presenting the problem along with 1-2 options and a specific recommendation', 'Waiting until the conflict resolves itself'],
    1, 'A recommendation gives leadership something concrete to react to, which is faster and clearer than an open-ended problem statement.')}
  ${qScenario('q3', 'hard', 'TastyGo\'s Ops Head wants restaurant onboarding approved in 24 hours to grow supply fast. The Support Lead wants a thorough 5-day review to avoid onboarding unreliable restaurants that generate complaints. Propose a resolution.',
    'A reasonable middle ground: fast-track a lighter 24-hour approval for restaurants that meet clear, low-risk criteria (verified business documents, no prior blacklist flags), while restaurants outside that criteria go through the full 5-day review. This respects Ops\'s need for speed on the easy cases and Support\'s need for scrutiny on the risky ones, rather than picking one timeline for every restaurant.')}
`
};

lessons['09'] = {
  short: 'BRD', where: 'Part III · <b>Business Requirements Document</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 09</div>
  <h2 class="title">The Business Requirements Document (BRD)</h2>
  <p class="lead">A ${term('brd', 'BRD')} is the document a business stakeholder actually reads and signs off on. It has to be precise without being technical.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">A BRD's usual sections</div>
    <div class="qb-row"><span class="qb-kw kw-p">Purpose &amp; background</span><span class="qb-mean">why this project exists, what problem prompted it</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Business objectives</span><span class="qb-mean">the measurable outcome this should achieve</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Scope &amp; out of scope</span><span class="qb-mean">what is included, and just as important, what is explicitly not</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Requirements</span><span class="qb-mean">the numbered list of business needs, in business language</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Assumptions &amp; sign-off</span><span class="qb-mean">what is being taken for granted, and who formally approves it</span></div>
  </div>
  <p class="body">For TastyGo's automated refund project, a BRD objective would read "reduce average refund turnaround from 3 days to under 1 hour," not "build an auto-refund microservice," which belongs in the FRD instead.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Writing in system/technical language.</b> A BRD that a business stakeholder cannot fully read and approve has failed its one job.</li>
    <li><b>No explicit out-of-scope section.</b> What is left unsaid gets assumed differently by different readers.</li>
    <li><b>No named approver.</b> A BRD nobody signed off on is not really approved, whatever anyone believes.</li>
  </ul></div>
  <div class="sec-num">9.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A BRD states the business problem, objective, and scope in language a non-technical stakeholder can read and approve, with a named sign-off. It says what and why, leaving how to the FRD.</p>
  ${qMC('q1', 'easy', 'A BRD should primarily be written in:',
    ['Technical, system-level language for developers', 'Business language a non-technical stakeholder can read and approve', 'SQL and pseudocode'],
    1, 'A BRD exists so a business stakeholder can understand and sign off on it; technical detail belongs in the FRD.')}
  ${qMC('q2', 'med', 'Why does a BRD need an explicit "out of scope" section?',
    ['It is optional and rarely useful', 'Without it, different readers will silently assume different boundaries for the project', 'It only matters for very large projects'],
    1, 'Being explicit about what is excluded prevents scope disagreements from surfacing later, once work is already underway.')}
  ${qScenario('q3', 'med', 'Write one business objective (not a technical solution) for TastyGo\'s "let customers cancel an order after acceptance" project.',
    'A good business objective is outcome-focused and measurable, for example: "Reduce customer complaints related to unwanted orders by allowing cancellation within a defined window, without increasing restaurant food waste costs by more than 2%." Notice it states the business outcome and a guardrail, not implementation details like buttons or APIs.')}
`
};

lessons['10'] = {
  short: 'FRD', where: 'Part III · <b>Functional Requirements Document</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 10</div>
  <h2 class="title">The Functional Requirements Document (FRD)</h2>
  <p class="lead">Where a BRD says what and why, an ${term('frd', 'FRD')} says exactly how the system should behave, precisely enough that two different developers would build the same thing.</p>
  <hr class="rule">
  <p class="body">Take the BRD objective from the last chapter ("reduce refund turnaround to under 1 hour"). An FRD turns that into specific, testable rules:</p>
  <div class="qb"><div class="qb-title">Example FRD excerpt: auto-refund eligibility</div>
    <div class="qb-row"><span class="qb-kw kw-p">Rule 1</span><span class="qb-mean">orders under ₹500 with no prior refund this month auto-approve instantly</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Rule 2</span><span class="qb-mean">orders ₹500 and above route to manual review within 1 business hour</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Rule 3</span><span class="qb-mean">a customer with 3+ refunds in 30 days always routes to manual review, regardless of amount</span></div>
  </div>
  <p class="body">Notice each rule is precise enough to test directly: you can write a test case for exactly ₹499 vs. exactly ₹500, and for a customer's 3rd refund. Vague FRD language like "the system should handle refunds sensibly" cannot be tested at all.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Writing the FRD before the BRD is approved.</b> Detailed rules for an unapproved business objective often get rewritten, wasting the detail work.</li>
    <li><b>Vague, untestable wording.</b> "Fast," "user-friendly," and "sensible" are not requirements until they have a number or a specific rule attached.</li>
  </ul></div>
  <div class="sec-num">10.1</div><h3 class="section-h">Recap</h3>
  <p class="body">An FRD converts an approved business objective into specific, testable system rules. If a rule cannot be turned into a pass/fail test case, it is not precise enough yet.</p>
  ${qMC('q1', 'easy', 'Which of these is a properly specific FRD rule?',
    ['"The refund process should be fast and easy."', '"Orders under ₹500 with no refund in the last 30 days auto-approve within 1 minute."', '"The system should handle refunds well."'],
    1, 'It names an exact threshold and exact timing, both of which can be directly tested; the other two are not testable as written.')}
  ${qMC('q2', 'med', 'What is the main risk of writing detailed FRD rules before the BRD is signed off?',
    ['There is no risk, order does not matter', 'The detailed work may need to be redone if the business objective changes during approval', 'FRDs must always be written first'],
    1, 'Detailed functional rules are built on top of the business objective; if that objective shifts during BRD approval, the FRD work built on the old version is wasted.')}
  ${qScenario('q3', 'hard', 'Turn this vague FRD line into a specific, testable rule: "The system should notify customers about delays."',
    'A specific version: "If an order\'s estimated delivery time is exceeded by more than 10 minutes, send the customer a push notification with the new estimated time, within 2 minutes of the delay being detected." This adds a measurable trigger (10 minutes late), a channel (push notification), content (new estimate), and a timing rule (within 2 minutes) — all things a tester could actually check.')}
`
};

lessons['11'] = {
  short: 'User stories & AC', where: 'Part III · <b>User stories &amp; acceptance criteria</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 11</div>
  <h2 class="title">User stories &amp; acceptance criteria</h2>
  <p class="lead">A ${term('user_story', 'user story')} is the smallest useful unit of a requirement, written from the user's point of view. It only becomes buildable once paired with clear ${term('acceptance_criteria', 'acceptance criteria')}.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The shape of a user story</div>
    <div class="qb-row"><span class="qb-kw kw-p">As a</span><span class="qb-mean">[role] — who wants this?</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">I want</span><span class="qb-mean">[goal] — what are they trying to do?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">So that</span><span class="qb-mean">[benefit] — why does it matter to them?</span></div>
  </div>
  <p class="body">Example, live order tracking: "As a customer, I want to see my order's live status, so that I don't have to message support to ask where it is."</p>
  <div class="sec-num">11.1</div><h3 class="section-h">Acceptance criteria, in Given/When/Then</h3>
  <div class="code">Given a customer has placed an order
When the restaurant marks it "out for delivery"
Then the app shows "Out for delivery" with an updated ETA within 1 minute</div>
  <p class="body">Good acceptance criteria are specific enough that a tester and a developer would independently agree on whether the story is done, without asking anyone else.</p>
  <div class="qb"><div class="qb-title">INVEST: a quick quality check for a story</div>
    <div class="qb-row"><span class="qb-kw kw-p">Independent</span><span class="qb-mean">does not depend on another unfinished story</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Negotiable</span><span class="qb-mean">details can still be discussed, it is not a rigid spec</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Valuable</span><span class="qb-mean">delivers something a real user cares about on its own</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Estimable</span><span class="qb-mean">the team can roughly size how much work it is</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Small &amp; Testable</span><span class="qb-mean">fits in one sprint, and has clear pass/fail criteria</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Stories too big to finish in a sprint.</b> "As a customer, I want a great ordering experience" is a whole epic, not a story.</li>
    <li><b>Missing acceptance criteria entirely.</b> Without them, "done" means something different to everyone on the team.</li>
  </ul></div>
  <div class="sec-num">11.2</div><h3 class="section-h">Recap</h3>
  <p class="body">A user story names who, what, and why in one sentence. Acceptance criteria, ideally in Given/When/Then form, make "done" objective rather than a matter of opinion.</p>
  ${qMC('q1', 'easy', 'Which part of "As a customer, I want live order tracking, so that I don\'t have to message support" is the benefit?',
    ['"As a customer"', '"I want live order tracking"', '"so that I don\'t have to message support"'],
    2, 'The "so that" clause is always the benefit, the reason the goal matters to that role.')}
  ${qMC('q2', 'med', 'What does the "S" in INVEST stand for, and why does it matter?',
    ['Scalable — the feature must support millions of users', 'Small — the story should fit within one sprint', 'Secure — the story must pass a security review'],
    1, 'INVEST\'s "Small" criterion keeps stories sized so a team can realistically finish one within a single sprint.')}
  ${qScenario('q3', 'med', 'Write a user story and two acceptance criteria for: "customers should be able to cancel an order within 2 minutes of placing it."',
    'Story: "As a customer, I want to cancel my order within 2 minutes of placing it, so that I am not charged for a mistaken order." Acceptance criteria: (1) Given an order was placed less than 2 minutes ago, When the customer taps Cancel, Then the order is cancelled and no charge is made. (2) Given an order was placed more than 2 minutes ago, When the customer taps Cancel, Then the app explains cancellation is no longer available and directs them to contact support.')}
`
};

lessons['12'] = {
  short: 'Use cases', where: 'Part III · <b>Use cases &amp; diagrams</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 12</div>
  <h2 class="title">Use cases &amp; use case diagrams</h2>
  <p class="lead">A ${term('use_case', 'use case')} is a bigger, more complete picture than a user story: not just the happy path, but every realistic way an interaction can go.</p>
  <hr class="rule">
  <svg viewBox="0 0 500 200" class="diagram" role="img" aria-label="Use case diagram: a Customer actor connected to a Track Order use case, an oval labelled Track Order">
    <circle cx="60" cy="100" r="8" fill="none" stroke="var(--ink)" stroke-width="2"/>
    <line x1="60" y1="108" x2="60" y2="140" stroke="var(--ink)" stroke-width="2"/>
    <line x1="40" y1="120" x2="80" y2="120" stroke="var(--ink)" stroke-width="2"/>
    <line x1="60" y1="140" x2="40" y2="165" stroke="var(--ink)" stroke-width="2"/>
    <line x1="60" y1="140" x2="80" y2="165" stroke="var(--ink)" stroke-width="2"/>
    <text x="60" y="185" text-anchor="middle" font-size="11" fill="var(--ink)">Customer</text>
    <line x1="88" y1="115" x2="240" y2="100" stroke="var(--ink-faint)" stroke-width="2"/>
    <ellipse cx="330" cy="100" rx="140" ry="45" fill="var(--teal-soft)" stroke="var(--teal)"/>
    <text x="330" y="105" text-anchor="middle" font-size="13" font-weight="700" fill="var(--teal-deep)">Track Order</text>
  </svg>
  <div class="qb"><div class="qb-title">Use case: Track Order</div>
    <div class="qb-row"><span class="qb-kw kw-p">Main flow</span><span class="qb-mean">customer opens order, sees current status and ETA</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Alternate flow</span><span class="qb-mean">restaurant has not updated status; app shows last known status with a timestamp</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Alternate flow</span><span class="qb-mean">order is already delivered; app shows delivery confirmation instead of a live map</span></div>
  </div>
  <p class="body">The alternate flows are exactly what a user story often leaves out. A use case forces you to think through what happens when the "normal" path does not hold.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Only documenting the happy path.</b> Most production bugs live in the alternate flows nobody wrote down.</li>
    <li><b>Confusing a use case with a user story.</b> A story is a small, sprint-sized slice; a use case is the fuller picture a set of stories is often carved out of.</li>
  </ul></div>
  <div class="sec-num">12.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A use case names an actor, a goal, a main flow, and its alternate flows. It is broader than a single user story and is especially useful for surfacing edge cases before they become bugs.</p>
  ${qMC('q1', 'easy', 'In a use case diagram, what does the stick figure represent?',
    ['The system being built', 'An actor, a person or system interacting with the system', 'A single acceptance criterion'],
    1, 'The stick figure is standard use-case-diagram notation for an actor: anyone or anything interacting with the system from the outside.')}
  ${qMC('q2', 'med', 'What is the main value of writing "alternate flows" for a use case?',
    ['They make the diagram look more complete', 'They surface realistic exceptions to the happy path before they become bugs', 'They are required by convention but rarely useful'],
    1, 'Alternate flows force you to think through non-ideal but realistic situations, which is exactly where requirements gaps and bugs tend to hide.')}
  ${qScenario('q3', 'med', 'For TastyGo\'s "Cancel Order" use case, write the main flow and one alternate flow.',
    'Main flow: customer opens their active order and taps Cancel; the system cancels the order and confirms with no charge. Alternate flow: the restaurant has already started preparing the order; the system blocks cancellation and instead shows a message explaining a refund request can be raised with support instead. The alternate flow is what stops "just let people cancel anytime" from becoming a costly, unrestricted rule.')}
`
};

lessons['13'] = {
  short: 'Process mapping', where: 'Part IV · <b>Process mapping basics</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 13</div>
  <h2 class="title">Process mapping basics</h2>
  <p class="lead">Before BPMN's full notation, it helps to get comfortable with the basic shapes every process map is built from.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The four basic shapes</div>
    <div class="qb-row"><span class="qb-kw kw-p">Oval</span><span class="qb-mean">start or end of the process</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Rectangle</span><span class="qb-mean">a step or activity someone performs</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Diamond</span><span class="qb-mean">a decision point, with a different arrow for each possible answer</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Arrow</span><span class="qb-mean">the sequence, which step leads to which</span></div>
  </div>
  <svg viewBox="0 0 600 130" class="diagram" role="img" aria-label="Simple process flow: start, submit refund request, decision under 500 rupees, then either auto-approve or manual review, ending at refunded">
    <ellipse cx="40" cy="65" rx="35" ry="24" fill="var(--surface)" stroke="var(--ink-faint)"/><text x="40" y="69" text-anchor="middle" font-size="10.5">Start</text>
    <rect x="105" y="42" width="110" height="46" rx="6" fill="var(--surface)" stroke="var(--ink-faint)"/><text x="160" y="69" text-anchor="middle" font-size="10">Submit refund</text>
    <path d="M255 65 L300 40 L345 65 L300 90 Z" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="300" y="60" text-anchor="middle" font-size="9">&lt; ₹500?</text><text x="300" y="72" text-anchor="middle" font-size="9">decision</text>
    <rect x="385" y="10" width="110" height="40" rx="6" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="440" y="34" text-anchor="middle" font-size="10">Auto-approve</text>
    <rect x="385" y="80" width="110" height="40" rx="6" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="440" y="104" text-anchor="middle" font-size="10">Manual review</text>
    <ellipse cx="560" cy="65" rx="35" ry="24" fill="var(--surface)" stroke="var(--ink-faint)"/><text x="560" y="69" text-anchor="middle" font-size="10.5">Refunded</text>
    <g stroke="var(--ink-faint)" stroke-width="1.6" fill="none" marker-end="url(#arrBA4)">
      <path d="M75,65 L104,65"/><path d="M215,65 L254,65"/>
      <path d="M320,50 L384,30"/><path d="M320,80 L384,100"/>
      <path d="M495,30 L558,55"/><path d="M495,100 L558,75"/>
    </g>
    <defs><marker id="arrBA4" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>No clear start or end.</b> A map that just floats in the middle of a process is missing context.</li>
    <li><b>Decisions with only one arrow out.</b> A diamond needs at least two paths, or it is not really a decision.</li>
  </ul></div>
  <div class="sec-num">13.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Ovals for start/end, rectangles for steps, diamonds for decisions with multiple labelled paths out, arrows for sequence. Every more advanced notation (BPMN included) builds on these same four ideas.</p>
  ${qMC('q1', 'easy', 'In a basic process map, a diamond shape represents:',
    ['A start or end point', 'A decision point with more than one possible path', 'A single, simple activity'],
    1, 'Diamonds mark branching points where the process can go one of several ways, based on a condition.')}
  ${qMC('q2', 'easy', 'How many arrows should typically leave a decision diamond?',
    ['Exactly one', 'Two or more, one for each possible answer', 'Zero, diamonds do not connect to arrows'],
    1, 'A decision needs at least two outgoing paths (e.g. yes/no) or it is not actually representing a choice.')}
  ${qScenario('q3', 'med', 'Describe, in words, a simple process map (start to end) for a customer leaving a rating after their TastyGo order is delivered.',
    'Start → Order marked delivered → Decision: did the customer open the rating prompt? → If yes: customer submits a star rating → rating saved to the order → End. If no: after 24 hours, the prompt is dismissed automatically → End. This includes a clear start and end and a decision with two distinct paths, matching the pattern from this chapter.')}
`
};

lessons['14'] = {
  short: 'BPMN fundamentals', where: 'Part IV · <b>BPMN fundamentals</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 14</div>
  <h2 class="title">BPMN fundamentals</h2>
  <p class="lead">${term('bpmn', 'BPMN')} adds one powerful idea on top of a basic process map: swimlanes, showing exactly who or what system does each step.</p>
  <hr class="rule">
  <svg viewBox="0 0 620 220" class="diagram" role="img" aria-label="BPMN swimlane diagram for the refund process across Customer, System, and Support lanes">
    <rect x="0" y="0" width="80" height="220" fill="var(--sidebar-soft)"/><text x="40" y="30" text-anchor="middle" font-size="10.5" fill="#fff" font-weight="700" transform="rotate(0)">Customer</text>
    <rect x="80" y="0" width="540" height="70" fill="var(--surface)" stroke="var(--line)"/>
    <rect x="0" y="70" width="80" height="80" fill="var(--sidebar)"/><text x="40" y="115" text-anchor="middle" font-size="10.5" fill="#fff" font-weight="700">System</text>
    <rect x="80" y="70" width="540" height="80" fill="var(--surface)" stroke="var(--line)"/>
    <rect x="0" y="150" width="80" height="70" fill="var(--sidebar-soft)"/><text x="40" y="190" text-anchor="middle" font-size="10.5" fill="#fff" font-weight="700">Support</text>
    <rect x="80" y="150" width="540" height="70" fill="var(--surface)" stroke="var(--line)"/>

    <circle cx="130" cy="35" r="14" fill="none" stroke="var(--teal)" stroke-width="2"/><text x="130" y="60" text-anchor="middle" font-size="9">Requests refund</text>
    <rect x="220" y="18" width="120" height="34" rx="6" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="280" y="39" text-anchor="middle" font-size="10">Fill refund form</text>

    <path d="M420 95 L460 75 L500 95 L460 115 Z" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="460" y="99" text-anchor="middle" font-size="9">&lt; ₹500?</text>
    <rect x="200" y="95" width="120" height="34" rx="6" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="260" y="116" text-anchor="middle" font-size="10">Auto-check eligibility</text>

    <rect x="220" y="168" width="130" height="34" rx="6" fill="var(--sidebar-soft)" stroke="var(--sidebar-line)"/><text x="285" y="189" text-anchor="middle" font-size="10" fill="#fff">Manual review</text>
    <circle cx="560" cy="185" r="14" fill="none" stroke="var(--rose)" stroke-width="3"/><text x="560" y="210" text-anchor="middle" font-size="9">End</text>
    <circle cx="560" cy="35" r="14" fill="none" stroke="var(--teal)" stroke-width="3"/><text x="560" y="60" text-anchor="middle" font-size="9">End</text>

    <g stroke="var(--ink-faint)" stroke-width="1.6" fill="none" marker-end="url(#arrBA5)">
      <path d="M144,35 L219,35"/>
      <path d="M280,52 L280,95 L318,111"/>
      <path d="M340,112 L419,105"/>
      <path d="M460,75 L460,50 L546,38"/>
      <path d="M460,115 L460,145 L350,178"/>
      <path d="M285,202 L285,185 L546,185"/>
    </g>
    <defs><marker id="arrBA5" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <div class="qb"><div class="qb-title">Core BPMN elements</div>
    <div class="qb-row"><span class="qb-kw kw-p">Pool / lane</span><span class="qb-mean">who or what performs the steps in that row</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Task</span><span class="qb-mean">a rounded rectangle, one unit of work</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Gateway</span><span class="qb-mean">a diamond, splits or merges the flow based on a condition</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Event</span><span class="qb-mean">a circle, a start, end, or something that happens (like a timer)</span></div>
  </div>
  <p class="body">The swimlanes above make the handoffs obvious at a glance: the customer only touches the first step, the system does the heavy lifting, and Support only gets involved for the review path, exactly the kind of clarity RACI gave you in chapter 01, now shown visually.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Every gateway drawn as the same type.</b> An exclusive gateway (only one path taken) and a parallel gateway (all paths taken at once) mean very different things; mixing them up misrepresents the process.</li>
    <li><b>Missing end events.</b> Every path through the diagram should visibly terminate somewhere.</li>
  </ul></div>
  <div class="sec-num">14.1</div><h3 class="section-h">Recap</h3>
  <p class="body">BPMN swimlanes show who performs each step; tasks, gateways, and events are its basic shapes. The visual handoff between lanes is often the most useful thing the diagram reveals.</p>
  ${qMC('q1', 'easy', 'What does a swimlane in a BPMN diagram represent?',
    ['A single step in the process', 'Who or what (a person, team, or system) performs the steps within it', 'The overall duration of the process'],
    1, 'Swimlanes group steps by who performs them, making responsibility and handoffs visible at a glance.')}
  ${qMC('q2', 'med', 'What is the key difference between an exclusive gateway and a parallel gateway?',
    ['There is no difference, they are drawn identically', 'An exclusive gateway picks exactly one path; a parallel gateway takes all paths at once', 'A parallel gateway is only used at the very start of a process'],
    1, 'This distinction changes the actual behaviour being modeled: only one branch executes vs. every branch executing simultaneously.')}
  ${qScenario('q3', 'hard', 'Describe, lane by lane, a BPMN-style flow for a restaurant marking an order "ready for pickup" and a delivery partner collecting it.',
    'Restaurant lane: prepares order, marks it "ready for pickup" (task). System lane: notifies the nearest available delivery partner (task), waits for acceptance (gateway: accepted vs. timed out). Delivery Partner lane: accepts the notification, arrives at the restaurant, collects the order (task), ends the restaurant\'s involvement. If the gateway times out, the System lane loops back to notify the next nearest partner instead. Naming the lanes explicitly is what makes a BPMN diagram different from a plain flowchart.')}
`
};

lessons['15'] = {
  short: 'Data flow diagrams', where: 'Part IV · <b>Data flow diagrams</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 15</div>
  <h2 class="title">Data flow diagrams (DFD)</h2>
  <p class="lead">A process map shows the order steps happen in. A DFD shows something different: where data comes from, what touches it, and where it ends up.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">DFD's four building blocks</div>
    <div class="qb-row"><span class="qb-kw kw-p">External entity</span><span class="qb-mean">a square, something outside the system (a customer, a payment gateway)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Process</span><span class="qb-mean">a circle or rounded box, something that transforms data</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Data store</span><span class="qb-mean">an open-ended rectangle, where data is held (a database table)</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Data flow</span><span class="qb-mean">a labelled arrow, naming exactly what data moves, not just that something happens</span></div>
  </div>
  <svg viewBox="0 0 600 160" class="diagram" role="img" aria-label="Data flow diagram for placing an order: customer sends order details to a place order process, which writes to the orders data store and reads from the restaurants data store">
    <rect x="10" y="60" width="100" height="45" fill="var(--surface)" stroke="var(--ink-faint)"/><text x="60" y="86" text-anchor="middle" font-size="10.5">Customer</text>
    <ellipse cx="300" cy="82" rx="90" ry="42" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="300" y="80" text-anchor="middle" font-size="11" font-weight="700" fill="var(--teal-deep)">Place Order</text>
    <rect x="470" y="10" width="120" height="34" fill="none" stroke="var(--ink-faint)"/><line x1="470" y1="10" x2="470" y2="44" stroke="var(--ink-faint)"/><text x="530" y="31" text-anchor="middle" font-size="10">Orders (store)</text>
    <rect x="470" y="115" width="120" height="34" fill="none" stroke="var(--ink-faint)"/><line x1="470" y1="115" x2="470" y2="149" stroke="var(--ink-faint)"/><text x="530" y="136" text-anchor="middle" font-size="10">Restaurants (store)</text>
    <g stroke="var(--ink-faint)" stroke-width="1.6" fill="none" marker-end="url(#arrBA6)">
      <path d="M110,82 L208,82"/>
      <path d="M388,70 L470,35"/>
      <path d="M470,120 L388,90"/>
    </g>
    <text x="150" y="72" font-size="9" fill="var(--ink-soft)">order details</text>
    <text x="400" y="45" font-size="9" fill="var(--ink-soft)">new order record</text>
    <text x="400" y="115" font-size="9" fill="var(--ink-soft)">restaurant availability</text>
    <defs><marker id="arrBA6" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">Notice the DFD does not care about sequence or decisions at all, only what data moves where. That is exactly what makes it the wrong tool for showing "what happens if the restaurant is closed," and the right tool for spotting, say, that a process reads from a data store it was never given permission to touch.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Confusing a DFD with a process flow.</b> A DFD has no decision diamonds and no explicit sequence; it is a map of data, not control flow.</li>
    <li><b>Unlabelled arrows.</b> An arrow that does not say what data is moving defeats the entire purpose of the diagram.</li>
  </ul></div>
  <div class="sec-num">15.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A DFD maps external entities, processes, and data stores, connected by labelled data flows. Use it to answer "where does this data come from and go to," not "what order do steps happen in."</p>
  ${qMC('q1', 'easy', 'What does a labelled arrow represent in a DFD?',
    ['The passage of time', 'A specific piece of data moving between two elements', 'A decision point'],
    1, 'DFD arrows must be labelled with the actual data moving, distinguishing them from generic sequence arrows in a process map.')}
  ${qMC('q2', 'med', 'Which question is a DFD best suited to answer?',
    ['"What happens if the customer cancels partway through?"', '"Which stored data does the refund process actually read and write?"', '"How long does the whole process take end to end?"'],
    1, 'DFDs specifically map data movement and storage, not sequencing, timing, or decision logic.')}
  ${qScenario('q3', 'med', 'Sketch (in words) a DFD for a customer submitting a rating: what external entity, process, and data store(s) would be involved?',
    'External entity: Customer. Process: "Submit Rating," which takes the star rating and optional comment as an input data flow from the customer. Data store: "Orders" (to confirm the order belongs to this customer and is eligible to be rated) and "Ratings" (where the new rating record is written). The data flows would be labelled "rating submission" (customer → process) and "new rating record" (process → Ratings store).')}
`
};

lessons['16'] = {
  short: 'ER modeling', where: 'Part IV · <b>ER modeling for BAs</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 16</div>
  <h2 class="title">ER modeling for BAs</h2>
  <p class="lead">If you've been through SQLingo, this chapter is the same idea from the other direction: not writing queries against tables, but designing what those tables and their relationships should be in the first place.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The three building blocks</div>
    <div class="qb-row"><span class="qb-kw kw-p">Entity</span><span class="qb-mean">a thing worth tracking on its own (Customer, Restaurant, Order)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Attribute</span><span class="qb-mean">a property of an entity (a customer's name, a restaurant's rating)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Relationship &amp; cardinality</span><span class="qb-mean">how entities connect, and how many of one relate to how many of the other</span></div>
  </div>
  <svg viewBox="0 0 600 170" class="diagram" role="img" aria-label="ER diagram: Customer to Order is one to many, Restaurant to Order is one to many">
    <rect x="10" y="60" width="130" height="50" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="75" y="90" text-anchor="middle" font-size="12" font-weight="700" fill="var(--teal-deep)">Customer</text>
    <rect x="470" y="60" width="130" height="50" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="535" y="90" text-anchor="middle" font-size="12" font-weight="700" fill="var(--teal-deep)">Restaurant</text>
    <rect x="235" y="60" width="130" height="50" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="300" y="90" text-anchor="middle" font-size="12" font-weight="700" fill="#7a4b0a">Order</text>
    <line x1="140" y1="85" x2="234" y2="85" stroke="var(--ink-faint)" stroke-width="1.6"/>
    <line x1="366" y1="85" x2="469" y2="85" stroke="var(--ink-faint)" stroke-width="1.6"/>
    <text x="150" y="78" font-size="14" font-weight="700" fill="var(--ink-soft)">1</text><text x="222" y="78" font-size="14" font-weight="700" fill="var(--ink-soft)">M</text>
    <text x="378" y="78" font-size="14" font-weight="700" fill="var(--ink-soft)">M</text><text x="452" y="78" font-size="14" font-weight="700" fill="var(--ink-soft)">1</text>
    <text x="300" y="140" text-anchor="middle" font-size="11" fill="var(--ink-soft)">One customer places many orders. One restaurant fulfils many orders.</text>
  </svg>
  <p class="body">This is exactly the customers/restaurants/orders schema from SQLingo, just drawn as a model instead of queried as tables. Order is a many-to-many junction between Customer and Restaurant precisely because a customer orders from many restaurants, and a restaurant serves many customers.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Modeling an attribute as its own entity.</b> "City" is an attribute of Customer, not a separate entity, unless you actually need to track facts about cities themselves.</li>
    <li><b>Skipping cardinality.</b> "Customer relates to Order" is incomplete without saying one-to-many, which is what actually constrains the design.</li>
  </ul></div>
  <div class="sec-num">16.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Entities are the things worth tracking, attributes are their properties, and cardinality (one-to-one, one-to-many, many-to-many) defines exactly how entities relate. A many-to-many relationship (like Customer to Restaurant) is usually resolved with a junction entity, like Order.</p>
  ${qMC('q1', 'easy', 'In ER modeling, what is an "attribute"?',
    ['A separate entity worth tracking on its own', 'A property belonging to an entity, like a customer\'s name', 'A relationship between two entities'],
    1, 'Attributes describe an entity; they are not independent things worth tracking on their own unless promoted deliberately.')}
  ${qMC('q2', 'med', 'Why is Order modeled as its own entity rather than just a link between Customer and Restaurant?',
    ['It is not necessary, a direct link would work identically', 'Because Order carries its own attributes (amount, date, rating) and resolves the many-to-many relationship between Customer and Restaurant', 'Because SQLite requires it'],
    1, 'A many-to-many relationship needs a junction entity to be represented cleanly, and that entity is a natural place to store details specific to each order.')}
  ${qScenario('q3', 'hard', 'TastyGo wants to let restaurants respond to ratings with a reply. Describe the new entity you would add and its relationship to the existing Rating (or Order) entity.',
    'Add a "Review Reply" entity with attributes like reply_text and reply_date, in a one-to-one relationship with Rating (each rating can have at most one restaurant reply). The cardinality matters here: it should not be one-to-many unless TastyGo actually wants to allow multiple replies per rating, which is a business decision worth confirming before modeling it.')}
`
};

lessons['17'] = {
  short: 'Gap analysis', where: 'Part V · <b>Gap analysis</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 17</div>
  <h2 class="title">Gap analysis</h2>
  <p class="lead">${term('gap_analysis', 'Gap analysis')} is the as-is/to-be thinking from chapter 03, made explicit and structured enough to plan a project from.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Current → Desired → Gap</div>
    <div class="qb-row"><span class="qb-kw kw-r">Current state</span><span class="qb-mean">restaurants are onboarded manually over 5 days by one ops person</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Desired state</span><span class="qb-mean">low-risk restaurants onboard in under 24 hours, automatically</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">The gap</span><span class="qb-mean">no automated eligibility check exists yet; onboarding has no fast-track path</span></div>
  </div>
  <p class="body">The gap itself is often the most useful output: it becomes almost directly the list of things the project actually needs to build, rather than a vague goal like "improve onboarding."</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Vague desired state.</b> "Onboarding should be better" cannot produce a specific gap. It needs a number or a concrete condition, like the 24-hour target above.</li>
    <li><b>Skipping straight to solutions.</b> The gap should describe what is missing, not yet how to build it, that comes after in the FRD.</li>
  </ul></div>
  <div class="sec-num">17.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Gap analysis states the current state and the desired state in specific, comparable terms, then names the concrete gap between them. That gap becomes the backbone of the project's scope.</p>
  ${qMC('q1', 'easy', 'What makes a desired state usable in a gap analysis?',
    ['It sounds ambitious', 'It is specific and measurable enough to compare against the current state', 'It matches what a competitor is doing'],
    1, 'A vague desired state cannot be meaningfully compared to the current state, which is the entire point of gap analysis.')}
  ${qMC('q2', 'med', 'The "gap" in a gap analysis should describe:',
    ['The exact technical solution to build', 'What is missing between current and desired state, without yet specifying how to fix it', 'A list of stakeholders involved'],
    1, 'The gap is a description of the missing capability; the "how to fix it" comes later, in requirements and design.')}
  ${qScenario('q3', 'med', 'TastyGo currently has no way to flag repeat-refund customers. The desired state is catching abuse before a refund is auto-approved. Write the current state, desired state, and the gap.',
    'Current state: any refund under ₹500 auto-approves with no check on the customer\'s refund history. Desired state: a customer with 3 or more refunds in the last 30 days is automatically routed to manual review regardless of amount. Gap: there is no tracking of a customer\'s refund count over a rolling 30-day window, and no rule connecting that count to the auto-approval logic.')}
`
};

lessons['18'] = {
  short: 'Impact & traceability', where: 'Part V · <b>Impact analysis &amp; traceability</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 18</div>
  <h2 class="title">Impact analysis &amp; traceability matrix</h2>
  <p class="lead">Before a change ships, two questions matter: what else does this touch, and can we prove every requirement actually got built and tested?</p>
  <hr class="rule">
  <p class="body">Impact analysis asks the first question. Automating refunds at TastyGo does not just touch the refund screen, it touches: the Finance reporting dashboard (refund totals now update instantly, not in daily batches), the Support team's tools (agents need to see auto-approved refunds too), and the restaurant payout calculation (a refunded order should not count toward a restaurant's earnings).</p>
  <div class="qb"><div class="qb-title">A small ${term('traceability', 'traceability matrix')}</div>
    <div class="qb-row"><span class="qb-kw kw-p">REQ-04</span><span class="qb-mean">Auto-approve refunds under ₹500 → FRD Rule 1 → built in Sprint 12 → tested in TC-021</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">REQ-05</span><span class="qb-mean">Route refunds ₹500+ to review → FRD Rule 2 → built in Sprint 12 → tested in TC-022</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">REQ-06</span><span class="qb-mean">Flag repeat-refund customers → FRD Rule 3 → <b>not yet built</b> → no test case</span></div>
  </div>
  <p class="body">REQ-06 falling through the cracks is exactly the kind of gap a traceability matrix catches before launch, instead of a customer or auditor catching it after.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Skipping impact analysis on "small" changes.</b> Small changes to shared data are exactly what quietly break other teams' dashboards and reports.</li>
    <li><b>Building a traceability matrix once and never updating it.</b> It only protects you if it is kept current as requirements change.</li>
  </ul></div>
  <div class="sec-num">18.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Impact analysis maps what else a change touches beyond the obvious. A traceability matrix links every requirement to its design, build, and test, so nothing silently falls through.</p>
  ${qMC('q1', 'easy', 'What is the main purpose of a traceability matrix?',
    ['To track project budget', 'To confirm every requirement is linked through to design, build, and test, with nothing missed', 'To record meeting attendance'],
    1, 'It exists specifically to catch requirements that were written down but never actually built or tested.')}
  ${qMC('q2', 'med', 'Why is impact analysis still necessary for a change that looks small and isolated?',
    ['It is not, small changes can skip this step', 'Small changes to shared data or systems can still break other teams\' dependent processes', 'It is only required for changes affecting the user interface'],
    1, 'A change\'s size in code is not the same as its size in impact; shared data and systems can carry effects far beyond the obvious change.')}
  ${qScenario('q3', 'hard', 'TastyGo plans to let customers edit their delivery address after placing an order. List two areas beyond the ordering screen this change might impact.',
    'Two reasonable impacts: (1) The delivery-partner assignment logic, since an address change after a partner is already assigned might require reassigning to someone closer to the new address. (2) The restaurant\'s prep-time estimate, if the new address is significantly farther and would change the expected delivery window shown to the customer. A real impact analysis would also check payment/tax calculations if delivery zones affect pricing.')}
`
};

lessons['19'] = {
  short: 'Prioritization', where: 'Part V · <b>Prioritization (MoSCoW, Kano)</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 19</div>
  <h2 class="title">Prioritization: MoSCoW &amp; Kano</h2>
  <p class="lead">Not every requirement deserves equal urgency. Two simple models keep prioritization from becoming "everything is a Must."</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">${term('moscow', 'MoSCoW')}, for one release</div>
    <div class="qb-row"><span class="qb-kw kw-r">Must have</span><span class="qb-mean">auto-approve small refunds — without this, the project fails its goal</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Should have</span><span class="qb-mean">flag repeat-refund customers — important, survivable if delayed one sprint</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Could have</span><span class="qb-mean">a refund-status email, not just an in-app update — nice, not essential</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Won't have (this release)</span><span class="qb-mean">letting customers choose store credit instead of a refund — explicitly deferred</span></div>
  </div>
  <div class="sec-num">19.1</div><h3 class="section-h">Kano: not all features earn happiness equally</h3>
  <svg viewBox="0 0 500 260" class="diagram" role="img" aria-label="Kano model chart: basic features prevent dissatisfaction, performance features scale with satisfaction, excitement features delight unexpectedly">
    <line x1="60" y1="20" x2="60" y2="240" stroke="var(--ink-faint)" stroke-width="1.5"/>
    <line x1="60" y1="130" x2="480" y2="130" stroke="var(--ink-faint)" stroke-width="1.5"/>
    <text x="30" y="30" font-size="10" fill="var(--ink-soft)">Satisfied</text>
    <text x="20" y="235" font-size="10" fill="var(--ink-soft)">Unhappy</text>
    <path d="M80,150 C150,150 200,150 460,60" fill="none" stroke="var(--teal)" stroke-width="2.5"/>
    <text x="330" y="55" font-size="10" fill="var(--teal-deep)">Excitement (surprise discount)</text>
    <path d="M80,220 L460,45" fill="none" stroke="var(--amber)" stroke-width="2.5"/>
    <text x="330" y="110" font-size="10" fill="#7a4b0a">Performance (delivery speed)</text>
    <path d="M80,130 L250,130 L460,128" fill="none" stroke="var(--rose)" stroke-width="2.5"/>
    <text x="330" y="150" font-size="10" fill="#7a251c">Basic (app doesn't crash)</text>
  </svg>
  <p class="body">A basic feature (the app working at all) never makes anyone happy, it just avoids anger. A performance feature (faster delivery) makes people steadily happier the better it gets. An excitement feature (a surprise loyalty bonus) delights precisely because nobody expected it, but its absence is not noticed at all.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Marking everything "Must have."</b> If nothing is Should/Could/Won't, MoSCoW has not actually done its job.</li>
    <li><b>Investing heavily in basics expecting delight.</b> A rock-solid basic feature stops complaints, it rarely generates enthusiasm on its own.</li>
  </ul></div>
  <div class="sec-num">19.2</div><h3 class="section-h">Recap</h3>
  <p class="body">MoSCoW forces a release-level priority call on every requirement. Kano reminds you that not all features earn the same kind of satisfaction, basics prevent anger, performance features scale with investment, and excitement features delight through surprise.</p>
  ${qMC('q1', 'easy', 'In MoSCoW, which category is meant for something explicitly excluded from this release?',
    ['Must have', 'Could have', 'Won\'t have'],
    2, '"Won\'t have (this time)" explicitly documents what is out of scope for now, which prevents it from being silently assumed as included.')}
  ${qMC('q2', 'med', 'According to the Kano model, why doesn\'t investing more in a "basic" feature usually increase customer delight?',
    ['Basic features are unimportant and can be skipped', 'Basic features only prevent dissatisfaction; they have little room to create positive delight even when improved further', 'Kano does not apply to basic features'],
    1, 'Basic features have an asymmetric effect: their absence causes real anger, but their presence, even improved, is simply expected and does not generate excitement.')}
  ${qScenario('q3', 'med', 'Classify these three TastyGo ideas using Kano: (1) the app not crashing during checkout, (2) faster average delivery time, (3) a free surprise dessert added occasionally to an order.',
    '(1) The app not crashing is a Basic feature: expected, its absence causes anger, its presence is simply assumed. (2) Faster delivery time is a Performance feature: satisfaction scales roughly with how much faster it gets. (3) A surprise free dessert is an Excitement feature: unexpected, it delights precisely because nobody was counting on it, and its absence would not be noticed as a loss.')}
`
};

lessons['20'] = {
  short: 'Data analysis for BAs', where: 'Part V · <b>Data analysis for BAs</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 20</div>
  <h2 class="title">Data analysis for BAs</h2>
  <p class="lead">Every technique in this course gets sharper with real numbers behind it. This is exactly where the <a href="/courses/sql">SQLingo</a> skillset pays off directly.</p>
  <hr class="rule">
  <p class="body">Suppose the Support Lead claims "most refund requests come from just a handful of repeat customers." Before treating that as fact, a BA who knows SQL can check it directly against TastyGo's own orders table:</p>
  <div class="code">SELECT customer_id, COUNT(*) AS refund_count
FROM orders
WHERE rating_given IS NULL  -- standing in for "flagged" orders here
GROUP BY customer_id
ORDER BY refund_count DESC;</div>
  <p class="body">In minutes, that either confirms the claim (a few customers dominate the count) or quietly disproves it (refunds are actually spread evenly), and either answer changes what gets prioritized. This is the same <code class="inl">GROUP BY</code> and <code class="inl">ORDER BY</code> from SQLingo chapters 04 and 10, now used to settle a real business argument instead of a classroom exercise.</p>
  <div class="qb"><div class="qb-title">Where a BA reaches for real data</div>
    <div class="qb-row"><span class="qb-kw kw-p">Validating a claim</span><span class="qb-mean">"most complaints are about X" — is that actually true?</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Sizing a problem</span><span class="qb-mean">how many customers, orders, or rupees does this actually affect?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Checking a fix worked</span><span class="qb-mean">did the number actually move after the change shipped?</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Presenting an anecdote as if it were data.</b> "One customer complained loudly" is not the same as "this affects 40% of orders."</li>
    <li><b>Not sanity-checking a surprising number.</b> An unusually large or small result is often a data or query mistake before it is a real insight.</li>
  </ul></div>
  <div class="sec-num">20.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Wherever possible, replace a stakeholder's impression with an actual number pulled from real data. It is faster to be right, and far more persuasive when proposing a change.</p>
  ${qMC('q1', 'easy', 'Why is pulling real data preferable to relying on a stakeholder\'s general impression?',
    ['It is not, impressions are just as reliable', 'A stakeholder\'s impression can be based on a few memorable cases rather than the full picture', 'Data is always faster to obtain than asking someone'],
    1, 'People naturally generalize from memorable or recent cases, which real data can confirm or correct.')}
  ${qMC('q2', 'med', 'A query returns a surprisingly large number for "orders refunded this month." What should you do first?',
    ['Report it immediately as a major finding', 'Sanity-check the query and data before treating the number as reliable', 'Assume the business has a serious problem'],
    1, 'Surprising results are more often a query or data issue than a genuine finding; verifying first avoids reporting something wrong with confidence.')}
  ${qScenario('q3', 'med', 'Marketing claims "most customers who stop ordering do so after a bad rating experience." How would you use TastyGo\'s data to check this claim, in plain terms (no SQL needed)?',
    'Pull the list of customers who have not ordered in, say, 60+ days, and separately check what proportion of them had a low-rated order (or gave a low rating themselves) in the weeks before they stopped, compared to the proportion among customers who are still ordering regularly. If the "stopped ordering" group does not show a meaningfully higher rate of bad ratings than the still-active group, the claim likely does not hold and the real cause is probably elsewhere.')}
`
};

lessons['21'] = {
  short: 'Agile for BAs', where: 'Part VI · <b>Agile fundamentals for BAs</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 21</div>
  <h2 class="title">Agile fundamentals for BAs</h2>
  <p class="lead">${term('agile', 'Agile')} does not remove the need for BA work, it just changes its rhythm: from one big upfront document to a steady drip of refined, ready stories.</p>
  <hr class="rule">
  <svg viewBox="0 0 500 220" class="diagram" role="img" aria-label="Sprint cycle: planning, daily standups, sprint work, review, retrospective, looping back to planning">
    <circle cx="250" cy="110" r="95" fill="none" stroke="var(--line)" stroke-width="1.5"/>
    <g font-size="11" text-anchor="middle">
      <circle cx="250" cy="20" r="30" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="250" y="24" fill="var(--teal-deep)">Planning</text>
      <circle cx="345" cy="80" r="30" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="345" y="76" fill="#7a4b0a">Daily</text><text x="345" y="88" fill="#7a4b0a">standup</text>
      <circle cx="315" cy="180" r="30" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="315" y="184" fill="#7a251c">Sprint</text>
      <circle cx="185" cy="180" r="30" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="185" y="176" fill="var(--teal-deep)">Sprint</text><text x="185" y="188" fill="var(--teal-deep)">review</text>
      <circle cx="155" cy="80" r="30" fill="var(--line-soft)" stroke="var(--ink-faint)"/><text x="155" y="84" fill="var(--ink-soft)">Retro</text>
    </g>
  </svg>
  <div class="qb"><div class="qb-title">Where a BA fits into each ceremony</div>
    <div class="qb-row"><span class="qb-kw kw-p">Backlog refinement</span><span class="qb-mean">write and clarify stories before they enter a sprint, ideally 1-2 sprints ahead</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Sprint planning</span><span class="qb-mean">answer the team's clarifying questions on the stories being pulled in</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Sprint review</span><span class="qb-mean">confirm the delivered work actually matches the acceptance criteria</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Disappearing after backlog grooming.</b> Questions come up mid-sprint; a BA who is unreachable slows the whole team down.</li>
    <li><b>Treating "agile" as "no documentation."</b> Agile favours lighter, just-in-time documentation, not none at all; acceptance criteria are still required.</li>
  </ul></div>
  <div class="sec-num">21.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Agile spreads BA work across the sprint cycle rather than front-loading it into one document: refine stories ahead of time, support planning, and confirm delivered work against acceptance criteria at review.</p>
  ${qMC('q1', 'easy', 'When should a BA typically refine and clarify upcoming stories?',
    ['Only after the sprint has already started', 'Ahead of time, ideally 1-2 sprints before they are pulled into a sprint', 'Agile does not require story refinement'],
    1, 'Refining stories ahead of time is what keeps sprint planning fast and avoids surprises mid-sprint.')}
  ${qMC('q2', 'med', 'What is a common misconception about BA work in Agile teams?',
    ['That BAs should refine stories ahead of sprints', 'That "agile" means no documentation is needed at all', 'That a BA supports sprint planning and review'],
    1, 'Agile favours lighter, just-in-time documentation like acceptance criteria, not the absence of documentation entirely.')}
  ${qScenario('q3', 'med', 'A developer asks a clarifying question about a story mid-sprint, and the BA who wrote it is on leave with no backup. What went wrong, and what would you do differently going forward?',
    'The gap is a lack of continuity planning: acceptance criteria should be detailed enough that most questions are already answered in writing, and a designated backup (another BA or the product owner) should be able to answer what is not. Going forward, ensure every story has sufficiently explicit acceptance criteria and a named backup contact before a BA takes planned leave.')}
`
};

lessons['22'] = {
  short: 'Backlog management', where: 'Part VI · <b>Backlog management</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 22</div>
  <h2 class="title">Backlog management &amp; grooming</h2>
  <p class="lead">A ${term('backlog', 'backlog')} that only grows and never gets pruned or refined stops being useful, it becomes a graveyard nobody trusts.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Definition of Ready vs. Definition of Done</div>
    <div class="qb-row"><span class="qb-kw kw-p">Definition of Ready</span><span class="qb-mean">a story has clear acceptance criteria, is sized, and has no unresolved blockers, before it enters a sprint</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Definition of Done</span><span class="qb-mean">the team agrees on exactly what "finished" means: coded, tested, reviewed, deployed</span></div>
  </div>
  <p class="body">Grooming (or refinement) is where a BA earns their keep in this rhythm: splitting an oversized story ("redesign the whole checkout flow") into sized, independently valuable pieces ("add a promo code field," "show an order summary before payment"), each small enough to actually finish in a sprint, per the INVEST criteria from chapter 11.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Never pruning the backlog.</b> Stories from a year ago that no longer matter should be archived, not left to clutter every grooming session.</li>
    <li><b>Splitting a story badly.</b> Splitting by technical layer ("frontend part," "backend part") usually creates two pieces neither of which delivers value alone; split by user-visible slices instead.</li>
  </ul></div>
  <div class="sec-num">22.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Definition of Ready gates what enters a sprint, Definition of Done gates what counts as finished. Regular grooming keeps the backlog sized, current, and trustworthy instead of an ever-growing pile.</p>
  ${qMC('q1', 'easy', '"Definition of Ready" is checked:',
    ['After a story is marked complete', 'Before a story is pulled into a sprint', 'Only at the end of a project'],
    1, 'It is a gate for entering a sprint: a story should meet it before the team commits to building it in that sprint.')}
  ${qMC('q2', 'med', 'What is usually wrong with splitting a story into "frontend part" and "backend part"?',
    ['Nothing, this is the standard way to split stories', 'Neither half delivers value to a user on its own, which breaks the INVEST "Valuable" criterion', 'Frontend and backend should never be built by the same team'],
    1, 'A good split preserves value in each piece; splitting by technical layer usually leaves both halves individually useless to an actual user.')}
  ${qScenario('q3', 'med', 'Split this oversized story into two or three smaller, independently valuable stories: "As a customer, I want a completely redesigned checkout experience."',
    'Possible split: (1) "As a customer, I want to see an order summary with itemized costs before I pay, so that I know exactly what I am being charged." (2) "As a customer, I want to apply a promo code at checkout, so that I can use available discounts." (3) "As a customer, I want to choose between saved payment methods at checkout, so that I don\'t have to re-enter card details every time." Each piece is independently useful and testable on its own, unlike "redesign checkout" as a whole.')}
`
};

lessons['23'] = {
  short: 'Working with UX', where: 'Part VI · <b>Working with UX</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 23</div>
  <h2 class="title">Working with UX</h2>
  <p class="lead">A BA and a designer solve overlapping problems from different angles: the BA protects what the business needs, the designer protects how it feels to actually use.</p>
  <hr class="rule">
  <p class="body">A low-fidelity wireframe (boxes and labels, no colours or polish) is usually the right level of detail for a BA to review against requirements. It answers "does this screen include everything the acceptance criteria require," without getting pulled into a debate about button colour, which is the designer's call to make.</p>
  <div class="qb"><div class="qb-title">Good feedback vs. overstepping</div>
    <div class="qb-row"><span class="qb-kw kw-p">Good BA feedback</span><span class="qb-mean">"the acceptance criteria requires showing the ETA, I don't see it in this wireframe"</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Overstepping</span><span class="qb-mean">"I think this button should be blue instead of green"</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Dictating visual design decisions.</b> That is the designer's expertise, not the BA's role, unless there is a genuine business or accessibility requirement behind it.</li>
    <li><b>Approving a wireframe without checking it against acceptance criteria.</b> A beautiful screen that is missing a required field is still an incomplete requirement.</li>
  </ul></div>
  <div class="sec-num">23.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Review designs against acceptance criteria and business requirements, not personal visual taste. Give feedback on what is missing or wrong against the requirement, and leave visual craft decisions to the designer.</p>
  ${qMC('q1', 'easy', 'Which of these is appropriate BA feedback on a wireframe?',
    ['"I don\'t like this shade of blue."', '"The acceptance criteria requires a cancel option here, and I don\'t see one in this design."', '"Can we make the logo bigger?"'],
    1, 'This ties feedback directly to a documented requirement, which is squarely the BA\'s responsibility, unlike pure visual preference.')}
  ${qMC('q2', 'med', 'Why is a low-fidelity wireframe often the right level of detail for a BA to review?',
    ['It is the only format designers are able to produce', 'It focuses attention on content and structure against requirements, without getting distracted by visual polish', 'High-fidelity designs are never useful'],
    1, 'Low-fidelity wireframes strip away visual polish so the review can focus on whether required content and flows are present.')}
  ${qScenario('q3', 'med', 'A designer shows you a wireframe for the refund screen. Acceptance criteria require showing the refund amount and expected timing. The wireframe only shows the amount. What do you say?',
    '"This looks good overall, one gap against the acceptance criteria: we also need to show the expected refund timing (like \'refund in 3-5 business days\') somewhere on this screen, customers ask about that a lot in support tickets. Everything else, layout and styling, looks like your call." This flags the missing requirement specifically while explicitly leaving visual decisions to the designer.')}
`
};

lessons['24'] = {
  short: 'UAT & sign-off', where: 'Part VI · <b>UAT &amp; sign-off</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 24</div>
  <h2 class="title">UAT &amp; sign-off</h2>
  <p class="lead">${term('uat', 'UAT')} is the last checkpoint before something ships: not "does the code work," but "does this actually solve the business problem we started with."</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">UAT test cases come straight from acceptance criteria</div>
    <div class="qb-row"><span class="qb-kw kw-p">Acceptance criterion</span><span class="qb-mean">Given an order over ₹500, When a refund is requested, Then it routes to manual review</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">UAT test case</span><span class="qb-mean">place a ₹600 test order, request a refund, confirm it appears in the manual review queue, not auto-approved</span></div>
  </div>
  <p class="body">Notice the test case is nearly a direct translation of the acceptance criterion. If a story's acceptance criteria are vague, UAT test cases become impossible to write precisely, one more reason chapter 11's Given/When/Then discipline pays off later.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>UAT performed only by the people who wrote the requirements.</b> Fresh eyes, ideally actual business users, catch what the requirement's own author has gone blind to.</li>
    <li><b>No named sign-off owner.</b> If nobody specific approves it, "UAT passed" is just an impression, not a decision anyone is accountable for.</li>
  </ul></div>
  <div class="sec-num">24.1</div><h3 class="section-h">Recap</h3>
  <p class="body">UAT test cases should trace directly back to acceptance criteria. Ideally real business users perform it, and a named person formally signs off, closing the loop that started with the BRD's objective.</p>
  ${qMC('q1', 'easy', 'UAT test cases should be derived from:',
    ['The developer\'s personal judgement of what to test', 'The story\'s acceptance criteria', 'A generic checklist used for every project'],
    1, 'Acceptance criteria define what "done" means for a story, making them the natural, traceable source for UAT test cases.')}
  ${qMC('q2', 'med', 'Why is it best if UAT is not performed solely by the people who wrote the requirements?',
    ['It is fine either way, UAT does not require independence', 'People who wrote the requirement may be blind to gaps or ambiguities they themselves introduced', 'Only developers should be allowed to test'],
    1, 'Fresh eyes, especially actual business users, are more likely to catch gaps that the requirement\'s own author has stopped noticing.')}
  ${qScenario('q3', 'med', 'Write one UAT test case for this acceptance criterion: "Given a customer has 3 or more refunds in 30 days, When they request a new refund of any amount, Then it is routed to manual review."',
    'Test case: set up a test customer with exactly 3 prior refunds within the last 30 days. Place a new order for a small amount (e.g. ₹200, which would normally auto-approve). Request a refund. Confirm the refund is routed to the manual review queue rather than auto-approved, specifically because of the repeat-refund count, not the order amount. Testing the edge case (small amount that would normally auto-approve) is what actually proves the override rule works.')}
`
};

lessons['25'] = {
  short: 'Stakeholder reporting', where: 'Part VII · <b>Stakeholder reporting</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 25</div>
  <h2 class="title">Stakeholder reporting</h2>
  <p class="lead">A status update has one job: let a busy stakeholder know, in seconds, whether they need to act on anything right now.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">RAG status, at a glance</div>
    <div class="qb-row"><span class="qb-kw kw-p">Green</span><span class="qb-mean">on track, nothing needed from the stakeholder</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Amber</span><span class="qb-mean">at risk, stakeholder should be aware, may need a decision soon</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Red</span><span class="qb-mean">blocked or off track, needs stakeholder action now</span></div>
  </div>
  <p class="body">The auto-refund project, honestly reported: "Amber. Auto-approval logic is on track for Sprint 12. The repeat-refund detection story is blocked on a data question for Finance; need an answer by Thursday to stay on schedule." That single paragraph tells a busy Ops Head exactly what is fine, what is not, and what they specifically need to do.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Reporting everything as Green to avoid a hard conversation.</b> This just delays the hard conversation to a worse moment, usually right before a deadline.</li>
    <li><b>Too much technical detail for an executive audience.</b> Match depth to the reader; a technical deep-dive belongs in a separate, optional appendix, not the headline status.</li>
  </ul></div>
  <div class="sec-num">25.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Use RAG status to communicate at-a-glance health, be honest about Amber and Red rather than defaulting to Green, and match the level of detail to the audience reading it.</p>
  ${qMC('q1', 'easy', 'What does a "Red" RAG status typically signal?',
    ['Everything is on track', 'The project is blocked or off track and needs stakeholder action', 'The project has not started yet'],
    1, 'Red is reserved for genuine blockers or serious risk requiring the stakeholder\'s attention or decision.')}
  ${qMC('q2', 'med', 'Why is marking a struggling project "Green" to avoid a difficult conversation harmful?',
    ['It is not harmful, it keeps stakeholders calm', 'It delays the difficult conversation to a later point, usually closer to the deadline when options are fewer', 'RAG status has no real effect on stakeholders'],
    1, 'Hiding real risk just postpones the reckoning to when there is less time and fewer options to respond.')}
  ${qScenario('q3', 'med', 'Write a short, honest status update for a TastyGo project that is one week behind because a third-party payment gateway integration is taking longer than expected.',
    'Example: "Amber. Core refund logic is complete and on track. The payment gateway\'s refund API is taking longer to integrate than estimated, currently about one week behind. We are in contact with their support team and expect resolution by [date]; if it slips further we may need to descope automatic refunds for one payment method in this release." This names the real status, the specific cause, and a concrete fallback, rather than vague reassurance.')}
`
};

lessons['26'] = {
  short: 'Scope creep', where: 'Part VII · <b>Managing scope creep</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 26</div>
  <h2 class="title">Managing scope creep &amp; change requests</h2>
  <p class="lead">${term('scope_creep', 'Scope creep')} rarely arrives as one big demand. It arrives as a dozen small, reasonable-sounding "while we're at it" additions.</p>
  <hr class="rule">
  <p class="body">"Since we're touching the refund screen anyway, can we also add a reason dropdown? And a refund history tab? And let support override the auto-approval manually?" Each request sounds small and reasonable alone. Together, they can double the size of the project no one ever formally approved.</p>
  <div class="qb"><div class="qb-title">A simple change-request process</div>
    <div class="qb-row"><span class="qb-kw kw-p">Log it</span><span class="qb-mean">write the request down, do not just verbally agree in the moment</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Assess impact</span><span class="qb-mean">what does this cost in time, and what does it put at risk?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Get an explicit decision</span><span class="qb-mean">approved now, deferred to next release, or rejected, decided by whoever owns that call</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Silently absorbing small requests to avoid friction.</b> Being agreeable in the moment is what causes deadlines to quietly slip later.</li>
    <li><b>No visible change log.</b> Without a record, nobody, including the requester, remembers what was added and why the timeline moved.</li>
  </ul></div>
  <div class="sec-num">26.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Treat every "small addition" as a real change request: log it, assess its actual impact, and get an explicit decision, rather than silently absorbing it and hoping the deadline still holds.</p>
  ${qMC('q1', 'easy', 'Scope creep most often happens through:',
    ['One large, clearly announced change', 'Several small, individually reasonable-sounding additions that are never formally assessed', 'Formal, logged change requests'],
    1, 'It is the accumulation of small, informally accepted additions that most often causes uncontrolled scope growth.')}
  ${qMC('q2', 'med', 'What is the risk of silently agreeing to a stakeholder\'s "quick addition" in the moment?',
    ['There is no risk if the addition is genuinely small', 'The added work is invisible to planning and quietly erodes the schedule without anyone deciding to accept that trade-off', 'It always improves stakeholder relationships'],
    1, 'Even small unlogged additions accumulate, and because they bypass impact assessment, nobody actually chose to accept the resulting schedule risk.')}
  ${qScenario('q3', 'med', 'The Support Lead asks, mid-sprint, "can we also let agents manually re-trigger a failed refund while we\'re building this?" How do you respond?',
    '"That\'s a reasonable ask, let\'s log it as a change request rather than just adding it now. I\'ll check what it adds to this sprint\'s scope and whether it risks the current deadline, then bring you a quick recommendation: either we fit it in with a short delay, or we ship the current scope first and take this up as the very next item." This respects the request without silently expanding scope.')}
`
};

lessons['27'] = {
  short: 'Presenting findings', where: 'Part VII · <b>Presenting findings</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 27</div>
  <h2 class="title">Presenting findings</h2>
  <p class="lead">A good BA presentation answers three things in order: what did you find, why does it matter, and what do you want the room to do about it.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Situation → So what → Recommendation</div>
    <div class="qb-row"><span class="qb-kw kw-p">Situation</span><span class="qb-mean">refunds currently take 3 days on average, and cost the support team 40 hours a week</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">So what</span><span class="qb-mean">this delays customers, costs staff time, and is worse than two competitors' stated refund times</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Recommendation</span><span class="qb-mean">automate refunds under ₹500; expected to cut turnaround to under 1 hour and save ~30 support hours weekly</span></div>
  </div>
  <p class="body">Notice the recommendation is specific and has a number attached, "we should improve refunds" gives an executive nothing to actually approve or reject.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Leading with detail instead of the headline.</b> An executive audience wants the recommendation first, detail available if asked, not the reverse.</li>
    <li><b>No clear ask.</b> Every presentation to decision-makers should end with a specific thing you want them to approve, fund, or decide.</li>
  </ul></div>
  <div class="sec-num">27.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Structure findings as situation, so-what, and a specific recommendation. Lead with the headline for senior audiences, and always end with a clear, actionable ask.</p>
  ${qMC('q1', 'easy', 'In the "situation, so what, recommendation" structure, the "so what" explains:',
    ['The raw facts only', 'Why the situation actually matters to the business', 'The technical implementation plan'],
    1, 'The "so what" bridges the raw facts to their real consequence for the business, which is what makes the audience care.')}
  ${qMC('q2', 'med', 'For a senior executive audience with limited time, what is the best presentation structure?',
    ['Start with full technical detail, end with the recommendation', 'Lead with the headline recommendation, keep detail available if asked', 'Present findings with no specific recommendation, let them decide'],
    1, 'Senior audiences with limited time benefit most from the headline and ask up front, with supporting detail available on demand rather than forced upfront.')}
  ${qScenario('q3', 'med', 'Write a one-paragraph "situation, so what, recommendation" summary for the finding that 60% of support tickets are refund status questions.',
    'Situation: 60% of TastyGo\'s support tickets are customers asking about refund status. So what: this consumes significant support capacity on a question customers should be able to answer themselves, and each one represents a moment of unnecessary frustration. Recommendation: add a self-serve refund status view in the app; based on similar changes elsewhere, this could plausibly cut refund-related tickets by more than half, freeing support capacity for issues that actually need a person.')}
`
};

lessons['28'] = {
  short: 'Certifications & careers', where: 'Part VIII · <b>Certifications &amp; career paths</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 28</div>
  <h2 class="title">Certifications &amp; career paths</h2>
  <p class="lead">A certification can open a door, especially early on with no BA experience to point to, but it does not substitute for having actually done the work in this course.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The common BA certifications</div>
    <div class="qb-row"><span class="qb-kw kw-p">ECBA</span><span class="qb-mean">entry-level, no experience required, good starting signal for a career switcher</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">CCBA</span><span class="qb-mean">mid-level, requires a couple years of documented BA experience</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">CBAP</span><span class="qb-mean">senior-level, requires several years of substantial BA experience</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">PMI-PBA</span><span class="qb-mean">PMI's equivalent, often favoured in project-heavy, PMI-aligned organizations</span></div>
  </div>
  <p class="body">A typical path: Business Analyst → Senior Business Analyst → either Product Owner/Product Manager (leaning toward what to build and why) or BA Lead/Practice Lead (leaning toward how a team of BAs works). Neither direction is objectively better, they suit different strengths: product roles reward ownership over outcomes, lead roles reward mentoring and process.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Collecting certifications before any real experience.</b> Interviewers weigh demonstrated judgement (like the scenarios throughout this course) far more heavily than a certificate alone.</li>
    <li><b>Assuming one certification body is universally "the best."</b> Fit depends on your target industry and geography more than any absolute ranking.</li>
  </ul></div>
  <div class="sec-num">28.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Certifications signal commitment and baseline knowledge, especially useful early in a career switch, but demonstrated judgement on real scenarios is what actually gets you hired and promoted.</p>
  ${qMC('q1', 'easy', 'Which certification is generally most appropriate for someone with no prior BA experience?',
    ['CBAP', 'ECBA', 'CCBA'],
    1, 'ECBA is the entry-level certification with no experience prerequisite, making it the fit for someone starting out.')}
  ${qMC('q2', 'med', 'What do interviewers typically weigh most heavily for a BA role?',
    ['Which certification body issued your certificate', 'Demonstrated judgement on realistic scenarios and past decisions', 'How many certifications you hold in total'],
    1, 'Certificates show baseline knowledge, but interviewers are mainly trying to assess how you actually think through ambiguous, realistic situations.')}
`
};

lessons['29'] = {
  short: 'Interview prep', where: 'Part VIII · <b>Interview questions &amp; cases</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 29</div>
  <h2 class="title">Common BA interview questions &amp; case studies</h2>
  <p class="lead">The last chapter is a rehearsal. Most BA interviews are really testing whether you can apply exactly the judgement this course has been building, out loud, under a little pressure.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The STAR structure for behavioural answers</div>
    <div class="qb-row"><span class="qb-kw kw-p">Situation</span><span class="qb-mean">brief context, just enough to understand the stakes</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Task</span><span class="qb-mean">what you specifically were responsible for</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Action</span><span class="qb-mean">what you actually did, the most important part, be specific</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">Result</span><span class="qb-mean">what happened, ideally with a number or concrete outcome</span></div>
  </div>
  <p class="body">A common prompt: "Tell me about a time you had to deal with conflicting stakeholder requirements." That is chapter 08, almost word for word, waiting for a STAR-shaped answer built from a real (or realistic) example.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Vague, generic answers.</b> "I'm good at communication" convinces nobody; a specific situation and a specific action does.</li>
    <li><b>Skipping the "Result."</b> An answer without an outcome leaves the interviewer wondering whether the action actually worked.</li>
  </ul></div>
  <div class="sec-num">29.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This entire course has been the substance behind good BA interview answers: RACI, root-cause thinking, BRDs and user stories, process modeling, prioritization, and honest stakeholder communication. STAR is just the structure that presents that substance clearly under interview pressure.</p>
  ${qScenario('q1', 'med', 'Using STAR, answer: "Tell me about a time (real or realistic) you had to prioritize between conflicting stakeholder requests."',
    'A strong STAR answer names a brief situation (two stakeholders wanting opposite things, as in chapter 08\'s TastyGo refund-policy example), the specific task you owned (finding a workable resolution before a deadline), the concrete action you took (naming the conflict openly, finding the shared underlying goal, proposing a specific middle-ground option), and a clear result (both stakeholders agreed to the compromise, and the project stayed on schedule). The strongest answers are specific enough that a follow-up question could not easily catch them out.')}
  ${qScenario('q2', 'hard', 'Case study: a mid-size company\'s customer support tickets have doubled in 3 months, but nobody knows why. As the BA brought in to investigate, describe your first three concrete steps.',
    'A strong first-three-steps answer draws on the whole course: (1) Elicit from multiple angles, don\'t just ask one person, interview support agents, pull real ticket-category data, and check if a recent product or policy change lines up with the timing (elicitation + root-cause thinking). (2) Map the as-is support process to see where the actual friction is, rather than assuming the cause (as-is/to-be analysis). (3) Quantify the problem with real data (which ticket categories doubled specifically, is it one category or all of them) before proposing any fix (data analysis for BAs). Only after these three steps would you move to recommending a specific solution, since jumping straight to a fix before understanding the actual cause is exactly the mistake chapter 02 warned against.')}
`
};

/* ---------- cheat sheet ---------- */
const CHEATS = {
  '00': { note: 'A BA elicits, documents, and validates — sitting between business needs and the delivery team, translating vague asks into precise, buildable requirements.' },
  '0b': { note: 'JIRA/Azure DevOps for tracking, Confluence/Notion for documents, Excel for matrices, Visio/draw.io for diagrams, SQL for answering real data questions directly.' },
  '0i': { note: 'TastyGo: a food-delivery company (customers, restaurants, orders) making money on commission. Recurring stakeholders: Ops Head, Support Lead, Engineering Manager, Marketing Lead.' },
  '01': { code: 'RACI: Responsible (does the work), Accountable (owns the outcome, exactly one), Consulted (input before), Informed (told after).' },
  '02': { code: '5 Whys: keep asking "why" 3-5 times past the first stated want, until you reach an actual, fixable root cause.' },
  '03': { code: 'Map the as-is (how it works today) before designing the to-be (the improved version) — target only the documented bottleneck.' },
  '04': { code: 'SWOT: Strengths, Weaknesses (internal) / Opportunities, Threats (external). Feasibility: Technical, Operational, Financial, Schedule.' },
  '05': { code: 'Elicitation toolbox: interviews (depth), workshops (group agreement), surveys (breadth), observation (say vs. do), document analysis (already half-written).' },
  '06': { code: 'Workshops: send the agenda ahead, timebox topics and use a parking lot for tangents, send written notes right after.' },
  '07': { code: 'Prefer open questions over leading ones ("walk me through..." not "don\'t you think..."). Ask one thing at a time. Use "why" and "how often" follow-ups.' },
  '08': { code: 'Conflicting stakeholders: name the conflict openly, find the shared underlying goal, escalate with a specific recommendation, not just the problem.' },
  '09': { code: 'BRD sections: Purpose & background, Business objectives, Scope & out of scope, Requirements, Assumptions & sign-off. Business language, not technical.' },
  '10': { code: 'FRD turns an approved BRD into specific, testable system rules. If a rule can\'t become a pass/fail test case, it isn\'t precise enough yet.' },
  '11': { code: 'User story: "As a [role], I want [goal], so that [benefit]." Acceptance criteria in Given/When/Then. Check quality with INVEST.' },
  '12': { code: 'Use case = actor + goal + main flow + alternate flows. Broader than a user story; alternate flows catch what the happy path misses.' },
  '13': { code: 'Process map shapes: oval (start/end), rectangle (step), diamond (decision, 2+ paths out), arrow (sequence).' },
  '14': { code: 'BPMN: pools/lanes (who), tasks (steps), gateways (exclusive = one path, parallel = all paths), events (start/end/timer).' },
  '15': { code: 'DFD building blocks: external entity (square), process (circle), data store (open rectangle), labelled data flow (arrow). Maps data movement, not sequence.' },
  '16': { code: 'ER modeling: entity (thing), attribute (property), relationship + cardinality (1:1, 1:M, M:M). M:M relationships usually need a junction entity.' },
  '17': { code: 'Gap analysis: current state vs. specific, measurable desired state = the gap, which becomes the project\'s scope.' },
  '18': { code: 'Impact analysis: what else does this change touch? Traceability matrix: requirement → design → build → test, nothing falls through.' },
  '19': { code: 'MoSCoW: Must / Should / Could / Won\'t (this release). Kano: Basic (prevents anger), Performance (scales with investment), Excitement (delights via surprise).' },
  '20': { code: 'Validate stakeholder claims against real data (GROUP BY / ORDER BY from SQLingo) before treating an impression as fact.' },
  '21': { code: 'Agile spreads BA work across the sprint: refine stories ahead of time, support planning, confirm delivered work at review against acceptance criteria.' },
  '22': { code: 'Definition of Ready (gate to enter a sprint) vs. Definition of Done (gate to call it finished). Split oversized stories by value, not by technical layer.' },
  '23': { code: 'Review wireframes against acceptance criteria and requirements; leave visual/styling calls to the designer.' },
  '24': { code: 'UAT test cases translate directly from acceptance criteria. Independent testers plus a named sign-off owner.' },
  '25': { code: 'RAG status: Green (on track), Amber (at risk, be aware), Red (blocked, needs action). Be honest, match detail to the audience.' },
  '26': { code: 'Treat every "small addition" as a change request: log it, assess impact, get an explicit approve/defer/reject decision.' },
  '27': { code: 'Structure findings as Situation → So what → Recommendation. Lead with the headline and a specific ask for senior audiences.' },
  '28': { code: 'ECBA (entry) → CCBA (mid) → CBAP (senior); PMI-PBA as an alternative. Demonstrated judgement matters more than the certificate alone.' },
  '29': { code: 'STAR for interview answers: Situation, Task, Action, Result. Most BA interview questions map directly onto a chapter in this course.' },
};
function renderCheatsheet() {
  let h = `<div class="eyebrow">Quick reference</div>
  <h2 class="title">Cheat sheet</h2>
  <p class="lead">Every published chapter's core idea on one page.</p>
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
  const raci = `<table class="iq-table"><thead><tr><th>Task</th><th>Sponsor</th><th>BA</th><th>Dev team</th><th>End users</th></tr></thead><tbody>
    <tr><td>Approve budget</td><td>A</td><td>C</td><td>I</td><td>I</td></tr>
    <tr><td>Gather requirements</td><td>C</td><td>R</td><td>C</td><td>C</td></tr>
    <tr><td>Build the feature</td><td>I</td><td>C</td><td>R / A</td><td>I</td></tr>
    <tr><td>User acceptance testing</td><td>I</td><td>C</td><td>C</td><td>R</td></tr></tbody></table>
    <p style="font-size:12.5px;color:var(--ink-faint);margin-top:2px">R = Responsible, A = Accountable, C = Consulted, I = Informed. Exactly one A per row.</p>`;
  const flow = `<div class="iq-flow"><span>As-is process</span><i>&rarr;</i><span>Analyse gaps</span><i>&rarr;</i><span>To-be process</span><i>&rarr;</i><span>Requirements</span></div>`;
  return `
  <div class="eyebrow">Interview prep</div>
  <h2 class="title">Business Analyst interview questions</h2>
  <p class="lead">A deep, topic-by-topic bank of the questions BA interviews actually turn on, grouped by area, with concise answers and the frameworks interviewers want named. Click any question to expand it.</p>
  <button class="pg-btn pg-ghost" style="margin:6px 0 10px" onclick="window.print()">Print / save as PDF</button>
  <hr class="rule">

  <h3 class="section-h">Role &amp; fundamentals</h3>
  ${iq('Beginner','What does a Business Analyst actually do?',`<p>A BA sits between the people who need something and the people who build it: eliciting the real need, documenting it clearly as requirements, and making sure what gets built solves the problem. They describe the <b>what</b>, not dictate the <b>how</b>.</p>`)}
  ${iq('Beginner','BA vs Product Owner vs Project Manager?',`<p>The <b>BA</b> defines and clarifies requirements; the <b>Product Owner</b> owns and prioritises the product backlog and the vision; the <b>Project Manager</b> owns scope, schedule, budget and risk. On small teams one person may wear more than one hat, but the accountabilities differ.</p>`)}
  ${iq('Beginner','Functional vs non-functional requirements?',`<p><b>Functional</b>: what the system must do ("a user can reset a password"). <b>Non-functional</b>: how well it must do it &mdash; performance, security, availability, usability ("pages load under 2 seconds"). Interviewers listen for whether you remember the non-functionals.</p>`)}
  ${iq('Beginner','BRD vs FRD vs SRS?',`<p><b>BRD</b> &mdash; high-level business needs and goals. <b>FRD</b> &mdash; detailed functional behaviour that satisfies the BRD. <b>SRS</b> &mdash; functional plus non-functional and technical detail for the build.</p>`)}
  ${iq('Intermediate','What makes a good requirement?',`<p>Clear, unambiguous, testable, feasible, necessary, consistent with others, and traceable to a business need. If two readers could interpret it differently, it is not done. Describe the need, not a premature solution.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Eliciting requirements</h3>
  ${iq('Intermediate','How do you elicit requirements?',`<p>Pick a mix: interviews, facilitated workshops (JAD), surveys, observation/job-shadowing, document analysis, and prototyping. Then model and play them back to confirm understanding.</p>`)}
  ${iq('Intermediate','Interviews vs workshops?',`<p>Interviews go deep with one stakeholder and surface individual detail; workshops bring many stakeholders together to build shared understanding and resolve conflicts quickly. Workshops are efficient but need strong facilitation and preparation.</p>`)}
  ${iq('Intermediate','How do you handle an unavailable or uncooperative stakeholder?',`<p>Escalate through the sponsor if needed, but first reduce the ask: use asynchronous methods (short surveys, review-by-email), lean on documents and proxies, and make the cost of their absence visible (decisions blocked, risk logged). Keep them informed so they stay engaged.</p>`)}
  ${iq('Intermediate','What is the role of prototypes and wireframes?',`<p>They turn abstract requirements into something stakeholders can react to, surfacing misunderstandings early and cheaply. "I will know it when I see it" stakeholders especially benefit &mdash; a wireframe elicits far more than a paragraph.</p>`)}
  ${iq('Advanced','How do you validate and verify requirements?',`<p><b>Verification</b>: are we building the requirement right (complete, consistent, testable)? <b>Validation</b>: are these the right requirements (do they meet the business need)? Techniques: reviews/walkthroughs, prototypes, traceability back to objectives, and stakeholder sign-off.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Stakeholders</h3>
  ${iq('Beginner','What is stakeholder analysis?',`<p>Identifying everyone affected by or able to affect the project and planning how to engage them &mdash; commonly on a <b>power/interest grid</b>: manage closely (high/high), keep satisfied (high power, low interest), keep informed (low power, high interest), monitor (low/low).</p>`)}
  ${iq('Intermediate','What is a RACI matrix?',`<p>A responsibility grid naming who is Responsible, Accountable, Consulted and Informed for each task, with exactly one Accountable per task.</p>${raci}`)}
  ${iq('Intermediate','How do you handle conflicting stakeholder requirements?',`<p>Surface the conflict early, trace each requirement to a business objective, and facilitate a decision rather than pick sides &mdash; using prioritisation (MoSCoW), data, and the accountable owner (sponsor/PO). Document the decision and its trade-off.</p>`)}
  ${iq('Intermediate','How do you tailor communication to different stakeholders?',`<p>Executives want outcomes, cost and risk in a page; developers want precise, testable detail; end users want workflows and screens. Match the medium and level of detail to the audience, and confirm understanding rather than assume it.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Documentation &amp; modelling</h3>
  ${iq('Beginner','What is a user story and what makes a good one?',`<p>Format: <i>"As a &lt;role&gt;, I want &lt;goal&gt;, so that &lt;benefit&gt;."</i> A good one follows <b>INVEST</b> (Independent, Negotiable, Valuable, Estimable, Small, Testable) with clear acceptance criteria.</p>`)}
  ${iq('Intermediate','How do you write good acceptance criteria?',`<p>Make them testable and unambiguous; the Gherkin Given/When/Then format works well:</p><pre class="code">Given an order is out for delivery
When the customer opens the app
Then they see a live status and an ETA</pre>`)}
  ${iq('Intermediate','Use case vs user story?',`<p>A <b>user story</b> is a lightweight reminder to have a conversation; a <b>use case</b> fully describes the actor-system interaction including main, alternate and exception flows. Stories suit Agile; use cases suit detailed up-front analysis.</p>`)}
  ${iq('Advanced','Which UML diagrams does a BA use?',`<p>Most often: <b>use case</b> diagrams (actors and system scope), <b>activity</b> diagrams (workflow/business process), and <b>sequence</b> diagrams (interaction over time). Class/ER diagrams help when modelling data.</p>`)}
  ${iq('Intermediate','What is as-is vs to-be process mapping?',`<p>You map the current ("as-is") process to expose pain points, then design the improved ("to-be") process the solution enables. The gap between them drives the requirements.</p>${flow}`)}
  ${iq('Advanced','What is BPMN?',`<p>Business Process Model and Notation &mdash; a standard visual language for process flows (events, activities, gateways, swimlanes). Its value is a shared, unambiguous notation that both business and technical readers understand.</p>`)}
  ${iq('Advanced','What is an ERD, and why would a BA care?',`<p>An Entity-Relationship Diagram models data entities and their relationships (one-to-many, etc.). A BA uses it to agree what data the business needs, its rules and cardinality, before developers design tables.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Prioritisation &amp; scope</h3>
  ${iq('Beginner','How do you prioritise requirements (MoSCoW)?',`<p><b>MoSCoW</b>: Must have, Should have, Could have, Will not have (this time). It forces explicit trade-offs and a shared view of what is essential versus nice-to-have.</p>`)}
  ${iq('Intermediate','What is the Kano model?',`<p>It classifies features by how they affect satisfaction: <b>basic</b> (expected; absence angers), <b>performance</b> (more is better), and <b>delighters</b> (unexpected wins). It helps balance must-haves against differentiators.</p>`)}
  ${iq('Intermediate','What is scope creep and how do you manage it?',`<p>Uncontrolled growth of scope after baseline. Prevent it with a clear signed-off baseline and traceability; manage it with a change-control process where new asks get impact-assessed (cost, time, risk) and approved by the accountable owner. Say yes to change, but make the trade-off explicit.</p>`)}
  ${iq('Advanced','What is a requirements traceability matrix?',`<p>An RTM links each requirement forward to its design, build and test cases (and back to the business objective). It proves coverage and makes impact analysis easy when something changes.</p>`)}
  ${iq('Intermediate','What is an MVP?',`<p>Minimum Viable Product &mdash; the smallest release that delivers real value and lets you learn from users. It is about validated learning and early value, not a half-built product.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Methodologies</h3>
  ${iq('Intermediate','Waterfall vs Agile?',`<p>Waterfall gathers all requirements up front in sequential phases (predictable, rigid). Agile delivers iteratively and welcomes change (adaptive, needs engagement). Choice depends on how well requirements are understood and how much change is expected.</p>`)}
  ${iq('Advanced','What is the BA role in Agile / Scrum?',`<p>Often working as or with the Product Owner: maintaining and refining the backlog, writing stories and acceptance criteria, clarifying scope during the sprint, and participating in planning, refinement, review and retrospective to keep the team aligned with business value.</p>`)}
  ${iq('Intermediate','Epic vs feature vs user story?',`<p>An <b>epic</b> is a large body of work spanning many sprints; it breaks into <b>features</b>, which break into <b>user stories</b> small enough to deliver within a sprint. It is a hierarchy of decreasing size and increasing detail.</p>`)}
  ${iq('Intermediate','What is backlog refinement (grooming)?',`<p>An ongoing activity where the team clarifies, estimates, splits and re-prioritises upcoming backlog items so they are "ready" before sprint planning. The BA/PO drives clarity and acceptance criteria.</p>`)}
  ${iq('Beginner','What are the phases of the SDLC?',`<p>Planning, requirements/analysis, design, development, testing, deployment, and maintenance. Different models (Waterfall, iterative, Agile) sequence or repeat these differently, but the activities recur.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Analysis techniques</h3>
  ${iq('Intermediate','What is gap analysis?',`<p>Comparing the current state to the desired state to identify the "gap" &mdash; the capabilities, processes or data that must change. The gaps become the requirements/initiatives.</p>`)}
  ${iq('Intermediate','What is SWOT analysis?',`<p>A strategic scan of Strengths, Weaknesses (internal), Opportunities and Threats (external). A BA uses it to frame context and justify why a change is worth doing.</p>`)}
  ${iq('Advanced','How do you do root-cause analysis?',`<p>Get past symptoms to the underlying cause. <b>5 Whys</b>: ask "why" repeatedly until you reach the root. <b>Fishbone (Ishikawa)</b>: categorise possible causes (people, process, tools, etc.) to structure the search. Fixing the root prevents recurrence.</p>`)}
  ${iq('Advanced','What is a cost-benefit or feasibility analysis?',`<p>A cost-benefit analysis weighs the expected value of a change against its cost (often as ROI/payback). A feasibility study checks whether it is viable technically, operationally and economically before committing. Both support the go/no-go decision.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Delivery, testing &amp; behavioural</h3>
  ${iq('Intermediate','What is the BA role in UAT?',`<p>The BA helps define acceptance criteria, plans UAT scenarios from the requirements, supports business users running them, and triages defects &mdash; confirming the solution actually meets the documented need before go-live.</p>`)}
  ${iq('Intermediate','Acceptance criteria vs test cases?',`<p>Acceptance criteria define, in business terms, when a story is done and acceptable. Test cases are the concrete step-by-step checks (inputs, actions, expected results) QA runs to verify those criteria. Criteria are the "what"; test cases are the "how to prove it".</p>`)}
  ${iq('Intermediate','Definition of Ready vs Definition of Done?',`<p><b>Ready</b>: the item is clear, estimated and has acceptance criteria, so the team can start it. <b>Done</b>: the agreed quality bar (built, tested, documented, accepted) for calling work complete. They guard the entry and exit of the sprint.</p>`)}
  ${iq('Advanced','How do you handle requirements that change mid-project?',`<p>Treat change as normal, not failure. Assess impact (scope, cost, time, risk), route it through change control, re-prioritise with the owner, and update the requirements and traceability. In Agile, changes flow through the backlog for the next sprint rather than disrupting the current one.</p>`)}
  ${iq('Advanced','How do you push back on a stakeholder request you disagree with?',`<p>Anchor on the business objective and data, not opinion. Clarify the underlying need (they may be proposing a solution), show the trade-off or evidence, offer an alternative, and let the accountable owner decide. Disagree respectfully, document the decision, and commit.</p>`)}
  ${iq('Advanced','How would you structure a "tell me about a conflict you resolved" answer?',`<p>Use <b>STAR</b>: Situation (context), Task (your responsibility), Action (what you specifically did, emphasising facilitation and data), Result (the outcome, ideally quantified, and what you learned). Keep it concise and centred on your role.</p>`)}

  <div class="foot" style="margin-top:30px"><span></span><button class="f-btn f-next" onclick="go('${order[0]}')">Back to the course &rarr;</button></div>`;
}
lessons['interview'] = { short: 'Interview Q&A', where: '<b>Interview Q&A</b>', render: renderInterview };

/* ---------- boot ---------- */
computeTotals();
go((function(){try{var l=localStorage.getItem('ba_last');return (l&&lessons[l])?l:'00';}catch(e){return '00';}})());

/* Re-entry hook: see the matching comment in public/app.js. The BA course now lives inside a
   multi-page hub, so a learner can navigate away and back via client-side routing without a
   full page reload. This script only ever runs once per browser tab; on re-entry we just need
   to re-render against the freshly mounted DOM, not re-run the whole script. */
window.__baReinit = function () {
  const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
  buildNav();
  computeTotals();
  go(curCh || order[0] || '00');
};
