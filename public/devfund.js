/* ============================================================
   Developer Track — Fundamentals course engine
   First of six Developer courses (Fundamentals, Python, Django,
   FastAPI, DevOps, Capstone Project). Mirrors public/qa.js and
   public/ba.js exactly: manifest, lessons, progress tracking,
   search, cheat sheet, glossary. Auto-graded MC + scenario
   self-check practice, since there is no live code engine here
   (Python/Django/FastAPI courses will add one).
   ============================================================ */

document.getElementById('loader').style.display = 'none';

/* ---------- glossary ---------- */
const glossary = {
  process: { short: 'A running instance of a program, with its own memory.', long: 'A process is what an operating system creates when a program starts running: its own private slice of memory, its own execution state, tracked separately from every other running program, even other copies of the same program.' },
  compiler: { short: 'Translates all of your source code into a lower-level form before it ever runs.', long: 'A compiler reads your entire source file (or project), translates it into machine code or another lower-level form, and produces something that can be run later, entirely separately from the translation step. Errors are caught during this upfront translation, before execution.' },
  interpreter: { short: 'Reads and runs your source code directly, line by line.', long: 'An interpreter executes source code directly, without a separate upfront translation step. This makes the write-run loop faster, but some mistakes only surface once the interpreter actually reaches that line while running.' },
  git: { short: 'A tool that tracks changes to files over time, so people can collaborate without overwriting each other.', long: 'Git is a version control system: it records snapshots of your project over time, lets you branch off to try something without touching the main version, and lets multiple people work on the same codebase and later merge their changes back together safely.' },
  http: { short: 'The protocol browsers and servers use to request and send information.', long: 'HTTP (HyperText Transfer Protocol) defines the format of a request (a method, an address, optional data) and a response (a status code, headers, a body), so any browser can talk to any server regardless of what each is built with.' },
  dns: { short: "Translates a domain name like tastygo.com into the IP address computers actually use.", long: 'DNS (Domain Name System) is essentially the internet\'s phone book: humans type readable names, DNS looks up the actual numeric IP address behind that name, and only then can your computer actually connect to the right machine.' },
  sdlc: { short: 'The repeatable phases software goes through, from idea to retirement.', long: 'The Software Development Life Cycle (SDLC) is the structured set of phases, planning, designing, building, testing, releasing, and maintaining, that a piece of software moves through, repeated again for every new version.' },
  agile: { short: 'Building software in small, frequent iterations with constant feedback.', long: 'Agile is an approach to software delivery built around short iterations (often 1-2 weeks), frequent working releases, and constant re-prioritization based on feedback, instead of one long upfront plan followed rigidly to the end.' },
  environment: { short: 'A distinct copy of a system used for a specific purpose (dev, staging, production).', long: 'An environment is a separate running copy of an application and its supporting infrastructure, used for a specific purpose: developing safely, testing realistically, or actually serving real users, kept apart so changes in one don\'t endanger the others.' },
  reverse_proxy: { short: 'A server that sits in front of your app and forwards requests to it.', long: 'A reverse proxy receives requests on behalf of one or more backend servers and forwards them along, often also handling TLS/HTTPS termination, load balancing across multiple app instances, and serving static files, so the app server itself can focus purely on application logic.' },
  container: { short: 'A lightweight, isolated package with an app and everything it needs to run.', long: 'A container packages an application together with its dependencies and configuration into one portable unit that runs consistently anywhere, without needing a full separate operating system per app the way a traditional virtual machine does.' },
  serverless: { short: "Running code where the cloud provider manages the servers, and you're billed only for actual execution time.", long: 'Serverless computing lets you deploy a function without provisioning or managing any server yourself; the cloud provider runs it on demand when triggered, scales it automatically, and you are billed only for the time it actually executes, not for idle capacity.' },
  api: { short: 'A defined way for one piece of software to ask another for something.', long: 'An API (Application Programming Interface) is a contract: send a request in an agreed format, get a response back in an agreed format, without needing to know anything about how the other side is actually built internally.' },
  server: { short: 'A program (or the machine running it) that listens for requests and responds to them.', long: '"Server" refers to either a physical/virtual machine, or the specific software running on it that listens for incoming requests and responds to them. One machine can run several different server programs, and one logical service can span many machines.' },
};
function term(w, label) {
  const g = glossary[w];
  return `<span class="term" tabindex="0" role="button" aria-label="${label || w}, glossary term, press Enter to read more" onclick="devfundMore('${w}',this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();devfundMore('${w}',this)}">${label || w}<span class="tip">${g.short}<br><span style="color:#7fd8cb;font-size:11px">press Enter or click to read more</span></span></span>`;
}
function devfundMore(w, el) {
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
  else { fb.className = 'q-fb no'; fb.innerHTML = '&#10007; Not quite. ' + (m.explain || 'Re-read the explanation above and try again.'); }
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
try { PROG = JSON.parse(localStorage.getItem('devfund_progress') || '{}'); } catch (_) { PROG = {}; }
function markProg(ch, id) { if (!ch) return; if (!PROG[ch]) PROG[ch] = {}; PROG[ch][id] = true; try { localStorage.setItem('devfund_progress', JSON.stringify(PROG)); } catch (_) { } updateCourse(); }
function overallSolved() { let n = 0; for (const c in PROG) { n += Object.keys(PROG[c]).length; } return n; }
function updateCourse() {
  const el = document.getElementById('courseProg'); const fill = document.getElementById('courseProgFill'); const n = overallSolved();
  const done = TOTAL_Q > 0 && n >= TOTAL_Q;
  if (el) el.textContent = TOTAL_Q ? (done ? `Course complete — ${n} / ${TOTAL_Q} solved` : `Overall: ${n} / ${TOTAL_Q} solved`) : '';
  if (fill) fill.style.width = TOTAL_Q ? ((n / TOTAL_Q) * 100) + '%' : '0%';
  if (done) celebrateOnce();
}
function celebrateOnce() {
  let shown = false; try { shown = localStorage.getItem('devfund_celebrated') === '1'; } catch (_) { }
  if (shown) return;
  try { localStorage.setItem('devfund_celebrated', '1'); } catch (_) { }
  const t = document.createElement('div'); t.className = 'celebrate-toast';
  t.innerHTML = '<b>Every chapter solved.</b><br>You have worked through the whole Fundamentals course. On to Python next.';
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('show'); }, 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 6000);
}
function computeTotals() { const sq = qCount; TOTAL_Q = 0; for (const k in lessons) { qCount = 0; try { lessons[k].render(); } catch (_) { } TOTAL_Q += qCount; } qCount = sq; for (const kk in answers) delete answers[kk]; updateCourse(); }
function resetProgress() { if (!window.confirm('Reset all solved progress across every chapter? This cannot be undone.')) return; PROG = {}; try { localStorage.removeItem('devfund_progress'); } catch (_) { } updateCourse(); if (curCh) go(curCh); }
function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('navOverlay').classList.toggle('show'); }
function closeMenu() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('navOverlay').classList.remove('show'); }

/* ---------- navigation ---------- */
const manifest = [
  { p: 'Groundwork', items: [['00', 'What even is "software"?', 1], ['0b', 'Your toolkit: terminal, editor, and Git', 1], ['0i', 'Meet the project', 1]] },
  { p: 'Part I · How computers run your code', items: [['01', 'Programs, processes, and the operating system', 1], ['02', 'Source code, compilers, and interpreters', 1], ['03', 'Variables, memory, and data types', 1], ['04', 'The command line: your most important tool', 1]] },
  { p: 'Part II · Version control & collaboration', items: [['05', 'What is Git, really?', 1], ['06', 'Commits, branches, and merges', 1], ['07', 'Working with GitHub: remotes, PRs, code review', 1], ['08', 'Merge conflicts and team workflows', 1]] },
  { p: 'Part III · How the internet actually works', items: [['09', 'The client-server model', 1], ['10', 'IP addresses, DNS, and domains', 1], ['11', 'HTTP and HTTPS: requests, responses, status codes', 1], ['12', 'What "the cloud" actually means', 1]] },
  { p: 'Part IV · The software development lifecycle', items: [['13', 'SDLC: from idea to maintenance', 1], ['14', 'Waterfall vs. Agile vs. Scrum/Kanban', 1], ['15', 'Where QA, BA, and DevOps fit in', 1], ['16', 'Dev, staging, and production environments', 1]] },
  { p: 'Part V · Databases, APIs, and the shape of an app', items: [['17', 'What a database actually is', 1], ['18', 'What an API actually is', 1], ['19', 'Frontend, backend, and full-stack', 1], ['20', 'Authentication vs. authorization', 1]] },
  { p: 'Part VI · Servers, proxies, containers, and the cloud', items: [['21', 'What is a "server," really?', 1], ['22', 'Web servers vs. application servers', 1], ['23', 'Proxies and reverse proxies, explained simply', 1], ['24', 'Containers, Docker, and serverless', 1]] },
  { p: 'Part VII · Building and shipping software', items: [['25', 'Package managers and dependencies', 1], ['26', 'Testing your own code', 1], ['27', "CI/CD, from a builder's perspective", 1]] },
  { p: 'Part VIII · Where to go next', items: [['28', 'Choosing your path: Python, Django, FastAPI, DevOps', 1], ['29', 'Career paths in software development', 1]] },
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
  try { localStorage.setItem('devfund_last', num); } catch (_) {}
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
  short: 'What is software?', where: 'Groundwork · <b>What even is &quot;software&quot;?</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 00</div>
  <h2 class="title">What even is "software"?</h2>
  <p class="lead">You've used software your whole life. This chapter asks the question most courses skip: what actually is it, physically and conceptually?</p>
  <hr class="rule">
  <p class="body">A computer, at the hardware level, only ever does one kind of thing: move and manipulate numbers stored as electrical signals. Software is a precise, exhaustive list of instructions, ultimately reducible to those same numbers, that tells the hardware exactly what sequence of tiny operations to perform. A word processor, a food delivery app, and a video game are all, underneath everything, just very long, very specific instruction lists.</p>
  <svg viewBox="0 0 620 130" class="diagram" role="img" aria-label="Idea, source code, translated instructions, running program">
    <rect x="10" y="40" width="130" height="55" rx="10" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="75" y="72" text-anchor="middle" font-size="11" font-weight="700" fill="var(--teal-deep)">An idea</text>
    <rect x="175" y="40" width="130" height="55" rx="10" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="240" y="72" text-anchor="middle" font-size="11" font-weight="700" fill="#7a4b0a">Source code</text>
    <rect x="340" y="40" width="130" height="55" rx="10" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="405" y="65" text-anchor="middle" font-size="11" font-weight="700" fill="#7a4b0a">Instructions</text><text x="405" y="80" text-anchor="middle" font-size="9" fill="#7a4b0a">the computer understands</text>
    <rect x="505" y="40" width="105" height="55" rx="10" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="557" y="72" text-anchor="middle" font-size="11" font-weight="700" fill="var(--teal-deep)">Running app</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDF1)">
      <path d="M140,67 L174,67"/><path d="M305,67 L339,67"/><path d="M470,67 L504,67"/>
    </g>
    <defs><marker id="arrDF1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">"Source code" is the human-readable version a developer writes, in a programming language like Python or JavaScript. Something (a compiler or interpreter, covered in chapter 02) turns that into instructions the actual hardware can carry out. Everything you'll learn across this whole Developer track lives somewhere along this pipeline.</p>
  <div class="analogy"><div class="lab">A plain-language version</div><div class="txt">A recipe written in English is source code: precise, but not something a stove understands on its own. A chef reading and following it step by step, at the exact moment of cooking, is closer to an interpreter. A recipe translated in advance into a fully automated robot-arm program, ready to run without a human present, is closer to a compiler. Either way, "the recipe" (the software) and "the cooking" (running it) are two separate things.</div></div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Thinking "software" means "an app icon."</b> The operating system itself, the tiny script formatting your file names, and the massive banking system processing your card, all equally "software."</li>
    <li><b>Assuming code and the running program are the same thing.</b> Source code is a static file sitting on disk; a running program is that code actually executing, with its own memory and state, right now.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Software is an exact instruction list for hardware, written first as human-readable source code, then translated into a form the machine can actually execute. This course exists to make every step of that pipeline, and everything built on top of it, make sense.</p>
  ${qMC('q1', 'easy', 'At the most basic level, what is software?',
    ['A physical piece of computer hardware', 'A precise set of instructions that tells hardware what operations to perform', 'Only the visual interface you see on screen'],
    1, 'Software is fundamentally an instruction list, ultimately reducible to operations on the hardware; the visual interface is just one small part of that.')}
  ${qMC('q2', 'med', 'What is the difference between "source code" and a "running program"?',
    ['They are the same thing', 'Source code is the static, human-readable file; a running program is that code actually executing with its own live memory and state', 'Source code only exists after a program has finished running'],
    1, 'Source code sits on disk as a file, unchanging until edited; the running program is a live, in-memory execution of instructions derived from that code.')}
`
};

lessons['0b'] = {
  short: 'Your toolkit', where: 'Groundwork · <b>Your toolkit: terminal, editor, and Git</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0b</div>
  <h2 class="title">Your toolkit: terminal, editor, and Git</h2>
  <p class="lead">Before any language-specific course, three tools show up in literally every developer's daily work, regardless of what they build.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The three constants</div>
    <div class="qb-row"><span class="qb-kw kw-p">A code editor</span><span class="qb-mean">where you actually write source code (VS Code is the most common today)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">The terminal / command line</span><span class="qb-mean">a text-based way to run programs and manage files directly, covered in depth in chapter 04</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Git</span><span class="qb-mean">${term('git', 'version control')}, covered in depth across Part II</span></div>
  </div>
  <p class="body">You do not need to master any of these before starting. This whole course is built so each gets introduced properly, with real depth, exactly where it becomes relevant, rather than as an intimidating wall up front.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Feeling like you need to "learn the terminal" fully before writing any code.</b> Most developers pick it up gradually, command by command, as a real need for each one comes up.</li>
    <li><b>Skipping Git because "it's just for teams."</b> Even solo, Git gives you an undo history far more powerful than your editor's built-in undo.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A code editor, a terminal, and Git are the three tools that show up regardless of language or framework. Each gets its own proper introduction later in this course; nothing here needs to be mastered up front.</p>
  ${qMC('q1', 'easy', 'Which of these three tools is specific to only some kinds of programming, and which apply to virtually all of it?',
    ['All three are only used by advanced developers', 'A code editor, terminal, and Git are all used across virtually every kind of software development, regardless of language', 'Only the terminal is commonly used; editors and Git are optional'],
    1, 'All three, a code editor, the terminal, and Git, show up in essentially every developer\'s daily work, no matter what specific language or framework they use.')}
`
};

lessons['0i'] = {
  short: 'Meet the project', where: 'Groundwork · <b>Meet the project</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0i</div>
  <h2 class="title">Meet the project</h2>
  <p class="lead">Every course on CareerLadder uses the same running example: TastyGo, a food delivery app connecting customers to restaurants through orders. Here's where it's headed in the Developer track.</p>
  <hr class="rule">
  <p class="body">SQLingo taught you to query TastyGo's data. The Business Analyst track taught you to define TastyGo's requirements. The QA track taught you to test TastyGo. This Developer track's Capstone Project has you actually build a working slice of TastyGo's backend, yourself, from scratch: an API that lets a customer place an order, containerized, sitting behind a real reverse proxy, deployed like a real application.</p>
  <div class="qb"><div class="qb-title">The road from here to that capstone</div>
    <div class="qb-row"><span class="qb-kw kw-p">This course (Fundamentals)</span><span class="qb-mean">the concepts and vocabulary everything else builds on</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Python</span><span class="qb-mean">the language you'll actually write TastyGo's backend in</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Django or FastAPI</span><span class="qb-mean">the framework used to build TastyGo's actual web application or API</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">DevOps</span><span class="qb-mean">containerizing it, putting a reverse proxy in front, and deploying it for real</span></div>
  </div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This entire Developer track builds toward one concrete outcome: a real, working, deployed slice of TastyGo you built yourself. Every course between here and the capstone exists to get you the specific skill needed for the next step.</p>
  ${qMC('q1', 'easy', 'What is the ultimate goal of the Capstone Project at the end of this Developer track?',
    ['To memorize definitions from every course', 'To actually build, containerize, and deploy a working slice of TastyGo\'s backend', 'To take a multiple-choice exam'],
    1, 'The whole track is structured to lead to one concrete, hands-on outcome: a real, deployed piece of software you built yourself, not just theoretical knowledge.')}
`
};

lessons['01'] = {
  short: 'Programs & processes', where: 'Part I · <b>Programs, processes, and the operating system</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 01</div>
  <h2 class="title">Programs, processes, and the operating system</h2>
  <p class="lead">"Program," "${term('process', 'process')}," and "operating system" get used loosely. Precisely defined, they explain a lot about how your computer actually behaves.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Three distinct things</div>
    <div class="qb-row"><span class="qb-kw kw-p">A program</span><span class="qb-mean">a file sitting on disk, not currently doing anything</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">A process</span><span class="qb-mean">that same program, actually running, with its own private memory and state</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">The operating system</span><span class="qb-mean">the software (Windows, macOS, Linux) that manages every process, shares the CPU between them, and controls access to hardware</span></div>
  </div>
  <p class="body">Open two browser windows and you have two separate processes of the same program, each with its own memory, each unaware of the other's state unless they deliberately communicate. The operating system is what decides which process gets a slice of CPU time next, and cleans up a process's memory once it exits.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming "running the same program twice" shares memory.</b> Each process usually gets its own isolated memory unless it deliberately opts into sharing.</li>
    <li><b>Confusing "program" (the file) with "process" (the running instance).</b> A single program file can be the source of many simultaneous processes.</li>
  </ul></div>
  <div class="sec-num">1.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A program is a dormant file; a process is that program actually running, with its own memory; the operating system manages every process and mediates access to shared hardware like the CPU.</p>
  ${qMC('q1', 'easy', 'What is the key difference between a "program" and a "process"?',
    ['They mean exactly the same thing', 'A program is a file on disk; a process is that program actually running, with its own live memory', 'A process is always faster than a program'],
    1, 'A program is dormant until executed; once it runs, the operating system creates a process for it, with its own memory and execution state.')}
  ${qMC('q2', 'med', 'If you open the same application twice, what happens?',
    ['It is not possible to open the same application twice', 'Two separate processes are created, each with its own isolated memory by default', 'Both windows automatically share the exact same memory and state'],
    1, 'Each launch typically creates a distinct process with its own private memory, which is why one copy crashing does not usually crash the other.')}
`
};

lessons['02'] = {
  short: 'Compilers & interpreters', where: 'Part I · <b>Source code, compilers, and interpreters</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 02</div>
  <h2 class="title">Source code, compilers, and interpreters</h2>
  <p class="lead">Every programming language uses one of two broad strategies (or a hybrid) to turn your source code into something that actually runs.</p>
  <hr class="rule">
  <svg viewBox="0 0 600 190" class="diagram" role="img" aria-label="Compiled languages translate all code upfront then run it; interpreted languages read and run line by line">
    <text x="10" y="25" font-size="12" font-weight="700" fill="var(--ink-soft)">Compiled (e.g. C, Go, Rust)</text>
    <rect x="10" y="35" width="160" height="45" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="90" y="62" text-anchor="middle" font-size="11" fill="#7a4b0a">Compile (all at once)</text>
    <rect x="210" y="35" width="160" height="45" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="290" y="62" text-anchor="middle" font-size="11" fill="var(--teal-deep)">Run (separately, later)</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDF2)"><path d="M170,57 L209,57"/></g>
    <text x="10" y="115" font-size="12" font-weight="700" fill="var(--ink-soft)">Interpreted (e.g. Python, JavaScript)</text>
    <rect x="10" y="125" width="360" height="45" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="190" y="152" text-anchor="middle" font-size="11" fill="var(--teal-deep)">Read and run, one line/statement at a time</text>
    <defs><marker id="arrDF2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">A ${term('compiler', 'compiler')} translates your entire program upfront, catching many mistakes before it ever runs, but requiring a separate build step every time you change something. An ${term('interpreter', 'interpreter')} reads and executes as it goes, which makes trying things out faster, but means some mistakes only surface once execution actually reaches that specific line.</p>
  <p class="body">Python, the language you'll learn next in this track, is interpreted, which is exactly why you can open a Python shell and try a line of code immediately, with no separate compile step first.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming compiled languages are always "better."</b> Compiled code often runs faster once built, but interpreted languages are usually faster to write and experiment with.</li>
    <li><b>Believing an interpreted language has "no errors caught early."</b> Many modern interpreters still catch obvious syntax mistakes before running anything.</li>
  </ul></div>
  <div class="sec-num">2.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Compiled languages translate the whole program upfront, then run it separately. Interpreted languages read and execute as they go. Neither is strictly better, they trade off differently between upfront safety and iteration speed.</p>
  ${qMC('q1', 'easy', 'Why can you type a line of Python into a shell and see it run immediately, with no separate build step?',
    ['Python code never contains errors', 'Python is interpreted: it reads and executes code directly, without a separate upfront compilation step', 'This is only possible in compiled languages'],
    1, 'Interpreted languages like Python read and run source code line by line, which is exactly what allows immediate, no-build-step execution.')}
`
};

lessons['03'] = {
  short: 'Variables & memory', where: 'Part I · <b>Variables, memory, and data types</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 03</div>
  <h2 class="title">Variables, memory, and data types</h2>
  <p class="lead">Before touching any specific language, it helps to understand what a "variable" actually is underneath the syntax.</p>
  <hr class="rule">
  <p class="body">A variable is a named label pointing at a specific location in memory where a value is stored. Writing <code class="inl">customer_name = "Aarav"</code> doesn't create a magical box called <code class="inl">customer_name</code>, it reserves some memory, stores the text "Aarav" there, and lets you refer to that memory location by a readable name instead of a raw address.</p>
  <div class="qb"><div class="qb-title">Common data types you'll meet across every language</div>
    <div class="qb-row"><span class="qb-kw kw-p">Integer / number</span><span class="qb-mean">a whole number or decimal, like an order's item count or total price</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">String</span><span class="qb-mean">text, like a customer's name or a restaurant's address</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Boolean</span><span class="qb-mean">true or false, like whether an order has been delivered</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">List / collection</span><span class="qb-mean">an ordered group of values, like all items in one order</span></div>
  </div>
  <p class="body">Types matter because the same operation can mean different things depending on type: adding two numbers (<code class="inl">2 + 2</code>) gives <code class="inl">4</code>, but "adding" two pieces of text often means joining them together, not arithmetic. Mixing up types is one of the most common sources of early bugs.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Treating a number stored as text ("42") as if it were the actual number 42.</b> Depending on the language, adding "42" + "8" might give "428", not 50.</li>
    <li><b>Assuming a variable "is" its value permanently.</b> A variable is just a current label pointing at a value; reassigning it points the same name at something new entirely.</li>
  </ul></div>
  <div class="sec-num">3.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A variable is a name pointing at a value stored in memory. Data types (numbers, text, booleans, collections) determine what operations actually mean for that value, and mixing types up is a very common source of bugs.</p>
  ${qMC('q1', 'easy', 'What does a variable actually represent underneath the syntax?',
    ['A permanent, unchangeable box', 'A readable name pointing at a value stored somewhere in memory', 'A type of data type'],
    1, 'A variable is a label for a memory location holding a value; the label can later point at a different value entirely.')}
  ${qMC('q2', 'med', 'Why might "42" + "8" not equal 50 in some languages?',
    ['It always equals 50 in every language', 'If both values are stored as text (strings) rather than numbers, "adding" them may join the text together instead of doing arithmetic', 'Addition is undefined for the number 42'],
    1, 'When values are strings rather than numeric types, the "+" operator often means concatenation (joining text) rather than arithmetic addition, a classic type-related bug.')}
`
};

lessons['04'] = {
  short: 'The command line', where: 'Part I · <b>The command line: your most important tool</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 04</div>
  <h2 class="title">The command line: your most important tool</h2>
  <p class="lead">The terminal looks intimidating mainly because it's unfamiliar, not because it's actually complex. A handful of concepts cover almost everything you'll do with it early on.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The core idea</div>
    <div class="qb-row"><span class="qb-kw kw-p">Command</span><span class="qb-mean">the name of the program you want to run, e.g. <code class="inl">ls</code>, <code class="inl">git</code>, <code class="inl">python</code></span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Arguments</span><span class="qb-mean">extra words telling the command what to act on, e.g. <code class="inl">cd projects</code> ("cd" the command, "projects" the argument)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Flags/options</span><span class="qb-mean">extra settings, usually starting with a dash, e.g. <code class="inl">ls -la</code> ("show me everything, in a detailed list")</span></div>
  </div>
  <p class="body">Almost every terminal command follows the same shape: <code class="inl">command argument --flag</code>. You are simply telling the operating system, in text, exactly what you'd otherwise do by clicking through folders and menus, just more precisely and far more repeatably.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Memorizing commands instead of understanding the shape.</b> Once "command, argument, flag" clicks, unfamiliar commands become much less intimidating to guess at from documentation.</li>
    <li><b>Fearing that one wrong command will "break everything."</b> Most everyday commands (moving around folders, listing files, running a program) are completely safe; only a small number (like deleting files) genuinely need caution.</li>
  </ul></div>
  <div class="sec-num">4.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Terminal commands follow a consistent shape: a command, optional arguments telling it what to act on, and optional flags adjusting its behaviour. This shape, once internalized, makes new commands far less intimidating.</p>
  ${qMC('q1', 'easy', 'In the command "ls -la", what is "-la"?',
    ['The command itself', 'A flag/option adjusting how the command behaves', 'An argument telling the command what folder to look in'],
    1, '"-la" is a flag (combining "-l" for detailed list format and "-a" for showing hidden files too), modifying how the "ls" command runs rather than being the command itself.')}
`
};

lessons['05'] = {
  short: 'What is Git, really?', where: 'Part II · <b>What is Git, really?</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 05</div>
  <h2 class="title">What is Git, really?</h2>
  <p class="lead">${term('git', 'Git')} is often taught as a list of commands to memorize. Understanding what it's actually doing underneath makes those commands click.</p>
  <hr class="rule">
  <p class="body">Git keeps a history of snapshots of your entire project folder. Every time you "commit," you're telling Git "remember exactly what every file looks like right now, under this description." Unlike a single "undo" button, you can jump back to any past snapshot, compare any two snapshots, or branch off from one to try something risky without touching anything else.</p>
  <div class="qb"><div class="qb-title">Three core Git concepts</div>
    <div class="qb-row"><span class="qb-kw kw-p">Repository (repo)</span><span class="qb-mean">a project folder that Git is tracking the history of</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Commit</span><span class="qb-mean">a saved snapshot of the whole project at one point in time, with a message describing it</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Branch</span><span class="qb-mean">a separate line of commits, letting you work on something without affecting the main version</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Treating Git like cloud backup (like Dropbox).</b> Git only remembers what you explicitly commit; it does not automatically save every keystroke.</li>
    <li><b>Fearing that using Git "wrong" will lose work permanently.</b> Almost every Git mistake is recoverable, since old commits are rarely truly deleted.</li>
  </ul></div>
  <div class="sec-num">5.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Git tracks a history of deliberate snapshots (commits) of your project, and lets you branch off to work on something separately without disturbing the main line of history.</p>
  ${qMC('q1', 'easy', 'What does a Git "commit" actually represent?',
    ['A permanent, unchangeable copy of the entire hard drive', 'A saved snapshot of the whole tracked project at one point in time, with a description', 'An automatic save that happens on every keystroke'],
    1, 'A commit is a deliberate, described snapshot of the project\'s current state; Git does not save automatically on every change the way some cloud-sync tools do.')}
`
};

lessons['06'] = {
  short: 'Commits, branches, merges', where: 'Part II · <b>Commits, branches, and merges</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 06</div>
  <h2 class="title">Commits, branches, and merges</h2>
  <p class="lead">A visual picture of how commits and branches actually relate makes the whole model click far faster than memorizing commands.</p>
  <hr class="rule">
  <svg viewBox="0 0 560 190" class="diagram" role="img" aria-label="Main branch with three commits, a feature branch splitting off and later merging back in">
    <line x1="40" y1="140" x2="500" y2="140" stroke="var(--ink-faint)" stroke-width="2"/>
    <circle cx="80" cy="140" r="10" fill="var(--teal)"/><circle cx="200" cy="140" r="10" fill="var(--teal)"/><circle cx="460" cy="140" r="10" fill="var(--teal)"/>
    <text x="80" y="168" text-anchor="middle" font-size="10" fill="var(--ink-soft)">commit 1</text><text x="200" y="168" text-anchor="middle" font-size="10" fill="var(--ink-soft)">commit 2</text><text x="460" y="168" text-anchor="middle" font-size="10" fill="var(--ink-soft)">merge commit</text>
    <path d="M200,140 C260,80 320,80 380,80" stroke="var(--amber)" stroke-width="2" fill="none"/>
    <circle cx="300" cy="88" r="10" fill="var(--amber)"/><text x="300" y="65" text-anchor="middle" font-size="10" fill="#7a4b0a">feature branch commit</text>
    <path d="M380,80 C420,80 440,110 460,140" stroke="var(--amber)" stroke-width="2" fill="none"/>
    <text x="40" y="30" font-size="11" font-weight="700" fill="var(--ink-soft)">main</text>
  </svg>
  <p class="body">A branch is just a movable label pointing at a specific commit. Creating one costs almost nothing, it's simply a new pointer. Working on a feature branch keeps your in-progress, possibly-broken changes completely separate from <code class="inl">main</code> until you're ready to merge them back in with a merge commit.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Doing all work directly on main.</b> This means an in-progress, broken change is visible to (and could be pulled by) everyone else immediately.</li>
    <li><b>Thinking branches are expensive or slow to create.</b> A branch is just a lightweight pointer, creating dozens costs almost nothing.</li>
  </ul></div>
  <div class="sec-num">6.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Commits form a chain of snapshots. A branch is a movable pointer letting you diverge from that chain safely. Merging brings a branch's changes back into another, usually <code class="inl">main</code>.</p>
  ${qMC('q1', 'easy', 'What is a Git branch, underneath the concept?',
    ['A full, separate copy of the entire project history', 'A lightweight, movable pointer to a specific commit', 'A backup stored on a different computer'],
    1, 'A branch is simply a pointer to a commit; creating one is cheap since it does not duplicate the whole project history.')}
  ${qScenario('q2', 'med', 'You want to try a risky change to TastyGo\'s checkout page without risking the working version everyone else uses. What Git workflow would you follow?',
    'Create a new branch off of main (e.g. "checkout-experiment"), make and commit your changes there, and only merge it back into main once you\'re confident it works, leaving main untouched and safe the whole time you were experimenting.')}
`
};

lessons['07'] = {
  short: 'GitHub, PRs & review', where: 'Part II · <b>Working with GitHub: remotes, PRs, code review</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 07</div>
  <h2 class="title">Working with GitHub: remotes, PRs, code review</h2>
  <p class="lead">Git itself works entirely on your own machine. GitHub adds a shared, hosted copy plus tools for reviewing and merging others' changes safely.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Key vocabulary</div>
    <div class="qb-row"><span class="qb-kw kw-p">Remote</span><span class="qb-mean">a copy of the repository hosted elsewhere (like GitHub), that you push to and pull from</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Pull request (PR)</span><span class="qb-mean">a request to merge your branch's changes into another branch, opened for discussion first</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Code review</span><span class="qb-mean">teammates reading your proposed changes, leaving comments, before it gets merged</span></div>
  </div>
  <p class="body">A pull request is not the merge itself, it's a proposal: "here's what I changed, here's why, please look before this becomes part of main." This is exactly the checkpoint that catches bugs, style issues, or missed edge cases before they reach everyone else, similar in spirit to the QA gates you'd have learned about in the QA track.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Confusing "pushing to a branch" with "it's now part of main."</b> Pushing just updates the remote copy of your branch; merging into main is a separate, deliberate step.</li>
    <li><b>Skipping review "just this once."</b> The whole value of a PR is a second set of eyes before a change reaches everyone; skipping it defeats that purpose.</li>
  </ul></div>
  <div class="sec-num">7.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A remote is a hosted copy of your repo. A pull request proposes merging one branch into another and opens the door for code review before that merge actually happens.</p>
  ${qMC('q1', 'easy', 'What is a pull request?',
    ['An automatic merge into main with no review', 'A proposal to merge one branch\'s changes into another, opened for discussion and review first', 'A way to delete a branch permanently'],
    1, 'A pull request proposes a merge and invites review/discussion before it actually happens, rather than merging immediately and silently.')}
`
};

lessons['08'] = {
  short: 'Merge conflicts & teams', where: 'Part II · <b>Merge conflicts and team workflows</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 08</div>
  <h2 class="title">Merge conflicts and team workflows</h2>
  <p class="lead">A merge conflict sounds alarming the first time it happens. It's actually Git being careful, not broken.</p>
  <hr class="rule">
  <p class="body">A merge conflict happens when two branches changed the exact same lines of the exact same file in different ways, and Git genuinely cannot guess which version you want. It stops and asks you to decide, rather than silently picking one and possibly losing someone's work.</p>
  <div class="qb"><div class="qb-title">Resolving one, step by step</div>
    <div class="qb-row"><span class="qb-kw kw-p">Git marks the conflict</span><span class="qb-mean">the file shows both versions side by side, clearly marked</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">You decide</span><span class="qb-mean">keep one version, the other, or manually combine them</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">You commit the resolution</span><span class="qb-mean">telling Git "this is what I decided, continue"</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Panicking and force-deleting a branch to "make the conflict go away."</b> This can discard real work; resolving the conflict directly is almost always the right move.</li>
    <li><b>Assuming conflicts mean you did something wrong.</b> They're a natural consequence of multiple people changing the same code, not a sign of an error.</li>
  </ul></div>
  <div class="sec-num">8.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A merge conflict happens when two branches edit the same lines differently; Git pauses and asks you to decide, rather than guessing and potentially losing work.</p>
  ${qMC('q1', 'easy', 'What causes a Git merge conflict?',
    ['Using the terminal instead of a graphical Git tool', 'Two branches changing the exact same lines of the same file in different ways', 'Committing too frequently'],
    1, 'Git can only auto-merge changes it can confidently reconcile; when the same lines were changed differently in two branches, it needs a human decision instead.')}
`
};

lessons['09'] = {
  short: 'Client-server model', where: 'Part III · <b>The client-server model</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 09</div>
  <h2 class="title">The client-server model</h2>
  <p class="lead">Almost everything you do online, checking TastyGo's menu, sending a message, watching a video, follows the exact same basic shape.</p>
  <hr class="rule">
  <svg viewBox="0 0 500 140" class="diagram" role="img" aria-label="Client sends a request to a server, server sends back a response">
    <rect x="20" y="35" width="150" height="70" rx="10" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="95" y="65" text-anchor="middle" font-size="12" font-weight="700" fill="var(--teal-deep)">Client</text><text x="95" y="82" text-anchor="middle" font-size="9" fill="var(--teal-deep)">(your phone/browser)</text>
    <rect x="330" y="35" width="150" height="70" rx="10" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="405" y="65" text-anchor="middle" font-size="12" font-weight="700" fill="#7a4b0a">Server</text><text x="405" y="82" text-anchor="middle" font-size="9" fill="#7a4b0a">(TastyGo's backend)</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDF3)">
      <path d="M170,55 L329,55"/><path d="M329,90 L170,90"/>
    </g>
    <text x="250" y="45" text-anchor="middle" font-size="9" fill="var(--ink-soft)">request: "show me nearby restaurants"</text>
    <text x="250" y="105" text-anchor="middle" font-size="9" fill="var(--ink-soft)">response: restaurant list</text>
    <defs><marker id="arrDF3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">A client asks for something; a ${term('http', 'server')} answers. The client is usually something a person interacts with directly (an app, a browser); the server usually runs elsewhere, often always-on, waiting to answer requests from many clients at once, not just yours.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming "server" means one specific physical box.</b> A server is a role (something that listens and responds), which today often runs across many machines, or none you'd recognize as a traditional "computer" at all.</li>
    <li><b>Thinking the client does the real work.</b> For most apps, the client mainly displays things and collects input; the server holds the actual data and business logic.</li>
  </ul></div>
  <div class="sec-num">9.1</div><h3 class="section-h">Recap</h3>
  <p class="body">The client-server model splits responsibility: a client asks, a server answers. This single shape underlies nearly everything you do on the internet.</p>
  ${qMC('q1', 'easy', 'In the client-server model, which one typically holds the actual data and business logic?',
    ['The client', 'The server', 'Neither, data lives only on the user\'s device'],
    1, 'The server typically owns the real data and core logic; the client mainly displays information and sends requests on the user\'s behalf.')}
`
};

lessons['10'] = {
  short: 'IPs, DNS, domains', where: 'Part III · <b>IP addresses, DNS, and domains</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 10</div>
  <h2 class="title">IP addresses, DNS, and domains</h2>
  <p class="lead">Typing "tastygo.com" doesn't directly connect you to anything, a hidden lookup step happens first.</p>
  <hr class="rule">
  <svg viewBox="0 0 560 130" class="diagram" role="img" aria-label="Browser looks up tastygo.com via DNS, gets back an IP address, then connects to that address">
    <rect x="10" y="40" width="140" height="50" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="80" y="70" text-anchor="middle" font-size="11" fill="var(--teal-deep)">"tastygo.com"</text>
    <rect x="210" y="40" width="140" height="50" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="280" y="70" text-anchor="middle" font-size="11" fill="#7a4b0a">DNS lookup</text>
    <rect x="410" y="40" width="140" height="50" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="480" y="65" text-anchor="middle" font-size="11" fill="var(--teal-deep)">203.0.113.42</text><text x="480" y="80" text-anchor="middle" font-size="9" fill="var(--teal-deep)">(the real address)</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDF4)"><path d="M150,65 L209,65"/><path d="M350,65 L409,65"/></g>
    <defs><marker id="arrDF4" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">Every device on the internet has an IP address, a numeric identifier computers use to actually find each other. ${term('dns', 'DNS')} is the lookup system translating a human-friendly domain name into that numeric address, so you never have to remember or type a string of numbers to reach TastyGo.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming a domain name "is" the server.</b> A domain name is just a friendly label; DNS maps it to whatever IP address the server actually happens to be running at, which can even change over time.</li>
    <li><b>Not realizing DNS results are cached.</b> Your device and network often remember a lookup for a while, which is why DNS changes can take time to "propagate" everywhere.</li>
  </ul></div>
  <div class="sec-num">10.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Every server has a numeric IP address. DNS translates human-readable domain names into that address, a lookup step that happens before your device can actually connect to anything.</p>
  ${qMC('q1', 'easy', 'What is the main job of DNS?',
    ['Encrypting data sent over the internet', 'Translating a human-readable domain name into the numeric IP address computers actually use', 'Speeding up how fast a webpage loads once connected'],
    1, 'DNS specifically handles the lookup step: turning a readable name like tastygo.com into the actual numeric address needed to connect.')}
`
};

lessons['11'] = {
  short: 'HTTP & HTTPS', where: 'Part III · <b>HTTP and HTTPS: requests, responses, status codes</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 11</div>
  <h2 class="title">HTTP and HTTPS: requests, responses, status codes</h2>
  <p class="lead">${term('http', 'HTTP')} is the shared language browsers and servers use so any client can talk to any server, regardless of what either is built with.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Anatomy of an HTTP exchange</div>
    <div class="qb-row"><span class="qb-kw kw-p">Method</span><span class="qb-mean">what kind of action, e.g. GET (fetch something), POST (create/send something)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">URL/path</span><span class="qb-mean">what resource is being asked for, e.g. /restaurants/42</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Status code</span><span class="qb-mean">a standardized signal of what happened: 200 (success), 404 (not found), 500 (server error)</span></div>
  </div>
  <p class="body">HTTPS is HTTP with encryption added, so the contents of a request or response can't be read or tampered with by anyone intercepting it in between. This is exactly what a TLS certificate provides, and exactly what a reverse proxy (chapter 23) is often responsible for handling on a server's behalf.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming HTTP and HTTPS are entirely different protocols.</b> HTTPS is HTTP plus an encryption layer (TLS); the request/response shape underneath is the same.</li>
    <li><b>Treating any error status the same.</b> A 404 (client asked for something that doesn't exist) is a very different problem from a 500 (the server itself broke), worth distinguishing when debugging.</li>
  </ul></div>
  <div class="sec-num">11.1</div><h3 class="section-h">Recap</h3>
  <p class="body">HTTP defines a standard request (method, path) and response (status code, body) shape. HTTPS adds encryption on top via TLS, so the same conversation can't be read or altered in transit.</p>
  ${qMC('q1', 'easy', 'What does HTTPS add on top of plain HTTP?',
    ['A faster connection speed', 'Encryption, so the contents of requests and responses can\'t be read or tampered with in transit', 'A completely different request/response format'],
    1, 'HTTPS is HTTP plus a TLS encryption layer; the underlying request and response structure stays the same, but the contents are protected in transit.')}
`
};

lessons['12'] = {
  short: 'What "the cloud" means', where: 'Part III · <b>What &quot;the cloud&quot; actually means</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 12</div>
  <h2 class="title">What "the cloud" actually means</h2>
  <p class="lead">"The cloud" is not a magical, placeless thing. It is, very concretely, someone else's computers, that you rent instead of own.</p>
  <hr class="rule">
  <p class="body">Before cloud computing, running TastyGo would mean buying, physically housing, and maintaining your own servers. Cloud providers (AWS, Google Cloud, Azure, and others) instead let you rent computing power, storage, and networking by the hour or by usage, from data centers they own and maintain, accessible over the internet from anywhere.</p>
  <div class="qb"><div class="qb-title">What you're actually renting</div>
    <div class="qb-row"><span class="qb-kw kw-p">Compute</span><span class="qb-mean">a virtual machine or container to actually run your application on</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Storage</span><span class="qb-mean">a place to keep files, database data, backups</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Networking</span><span class="qb-mean">the ability to actually be reached over the internet, securely</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Thinking "the cloud" means "no physical hardware anywhere."</b> It just means hardware someone else owns and operates, that you access remotely.</li>
    <li><b>Assuming cloud computing is automatically cheaper.</b> It trades upfront hardware cost for ongoing usage-based billing, which can be cheaper or more expensive depending on usage patterns.</li>
  </ul></div>
  <div class="sec-num">12.1</div><h3 class="section-h">Recap</h3>
  <p class="body">"The cloud" is renting compute, storage, and networking from a provider's data centers over the internet, instead of buying and running your own physical hardware.</p>
  ${qMC('q1', 'easy', 'What does "the cloud" fundamentally mean?',
    ['Data floating somewhere with no physical location', 'Renting computing power, storage, and networking from a provider\'s data centers, instead of owning your own hardware', 'A single company\'s proprietary network, unrelated to the regular internet'],
    1, 'Cloud computing is fundamentally about renting someone else\'s physical infrastructure over the internet rather than buying and maintaining your own.')}
`
};

lessons['13'] = {
  short: 'SDLC basics', where: 'Part IV · <b>SDLC: from idea to maintenance</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 13</div>
  <h2 class="title">SDLC: from idea to maintenance</h2>
  <p class="lead">The ${term('sdlc', 'SDLC')} is the repeatable shape every piece of real software goes through, whether the team calls it that explicitly or not.</p>
  <hr class="rule">
  <svg viewBox="0 0 560 220" class="diagram" role="img" aria-label="Six phase cycle: planning, design, build, test, release, maintain, looping back to planning">
    <circle cx="280" cy="110" r="95" fill="none" stroke="var(--ink-faint)" stroke-dasharray="4"/>
    <g font-size="10" fill="var(--ink-soft)" text-anchor="middle">
      <circle cx="280" cy="20" r="26" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="280" y="24">Plan</text>
      <circle cx="365" cy="55" r="26" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="365" y="59">Design</text>
      <circle cx="365" cy="165" r="26" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="365" y="169">Build</text>
      <circle cx="280" cy="200" r="26" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="280" y="204">Test</text>
      <circle cx="195" cy="165" r="26" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="195" y="169">Release</text>
      <circle cx="195" cy="55" r="26" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="195" y="59">Maintain</text>
    </g>
  </svg>
  <p class="body">Planning defines what to build and why. Design figures out how. Building is writing the actual code. Testing (the entire focus of the QA track) confirms it works. Releasing ships it to real users. Maintaining keeps it running and fixes what breaks, feeding straight back into planning the next round.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Treating SDLC as a strict, one-time, top-to-bottom sequence.</b> In practice, especially with Agile (next chapter), teams cycle through these phases repeatedly, in small loops, not once for the whole product.</li>
    <li><b>Skipping "maintain" mentally.</b> Most of a real application's total lifetime and cost is spent here, not in the initial build.</li>
  </ul></div>
  <div class="sec-num">13.1</div><h3 class="section-h">Recap</h3>
  <p class="body">The SDLC's six phases, plan, design, build, test, release, maintain, describe the repeatable shape any real software project follows, looping back into planning for the next cycle.</p>
  ${qMC('q1', 'easy', 'Which SDLC phase typically takes up the most of a real application\'s total lifetime?',
    ['Planning', 'Maintenance', 'Design'],
    1, 'Once released, an application is typically maintained, patched, and improved for far longer than the time it took to originally plan, design, and build it.')}
`
};

lessons['14'] = {
  short: 'Waterfall vs. Agile', where: 'Part IV · <b>Waterfall vs. Agile vs. Scrum/Kanban</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 14</div>
  <h2 class="title">Waterfall vs. Agile vs. Scrum/Kanban</h2>
  <p class="lead">These describe how a team moves through the SDLC's phases, not different phases themselves.</p>
  <hr class="rule">
  <svg viewBox="0 0 560 170" class="diagram" role="img" aria-label="Waterfall as one long sequential flow versus agile as repeated small loops">
    <text x="10" y="20" font-size="11" font-weight="700" fill="var(--ink-soft)">Waterfall: one long pass</text>
    <g fill="var(--amber-soft)" stroke="var(--amber)">
      <rect x="10" y="30" width="80" height="35"/><rect x="100" y="30" width="80" height="35"/><rect x="190" y="30" width="80" height="35"/><rect x="280" y="30" width="80" height="35"/>
    </g>
    <text x="50" y="52" text-anchor="middle" font-size="9" fill="#7a4b0a">Plan</text><text x="140" y="52" text-anchor="middle" font-size="9" fill="#7a4b0a">Design</text><text x="230" y="52" text-anchor="middle" font-size="9" fill="#7a4b0a">Build</text><text x="320" y="52" text-anchor="middle" font-size="9" fill="#7a4b0a">Test</text>
    <text x="10" y="100" font-size="11" font-weight="700" fill="var(--ink-soft)">Agile: many small loops, each shipping something</text>
    <g fill="var(--teal-soft)" stroke="var(--teal)">
      <rect x="10" y="110" width="60" height="30"/><rect x="80" y="110" width="60" height="30"/><rect x="150" y="110" width="60" height="30"/><rect x="220" y="110" width="60" height="30"/>
    </g>
    <text x="40" y="129" text-anchor="middle" font-size="8" fill="var(--teal-deep)">Sprint 1</text><text x="110" y="129" text-anchor="middle" font-size="8" fill="var(--teal-deep)">Sprint 2</text><text x="180" y="129" text-anchor="middle" font-size="8" fill="var(--teal-deep)">Sprint 3</text><text x="250" y="129" text-anchor="middle" font-size="8" fill="var(--teal-deep)">Sprint 4</text>
  </svg>
  <p class="body">Waterfall plans everything upfront and moves through each phase once, in order, only reaching users at the very end. ${term('agile', 'Agile')} instead repeats the whole cycle in small increments (often called sprints), shipping something real every couple of weeks and adjusting based on feedback. Scrum and Kanban are two specific, popular ways of organizing Agile work day to day.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming Agile means "no planning."</b> Agile still plans, just in smaller, more frequent increments, adjusting as real feedback comes in rather than committing to one huge upfront plan.</li>
    <li><b>Treating Waterfall as always wrong.</b> For projects with genuinely fixed, well-understood requirements (some regulated or safety-critical systems), a more sequential approach can still make sense.</li>
  </ul></div>
  <div class="sec-num">14.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Waterfall moves through the SDLC once, sequentially. Agile repeats it in small increments, shipping and adjusting frequently. Scrum and Kanban are specific ways teams organize Agile work.</p>
  ${qMC('q1', 'easy', 'What is the key difference between Waterfall and Agile?',
    ['Agile skips testing entirely', 'Waterfall moves through the SDLC once sequentially; Agile repeats it in small, frequent increments with continuous feedback', 'Waterfall is only used for mobile apps'],
    1, 'The core distinction is sequencing: one long upfront pass (Waterfall) versus many small repeated cycles with regular feedback (Agile).')}
`
};

lessons['15'] = {
  short: 'Where QA, BA, DevOps fit', where: 'Part IV · <b>Where QA, BA, and DevOps fit in</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 15</div>
  <h2 class="title">Where QA, BA, and DevOps fit in</h2>
  <p class="lead">If you've taken CareerLadder's other tracks, this chapter connects them directly to the SDLC you just learned.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Mapping roles onto SDLC phases</div>
    <div class="qb-row"><span class="qb-kw kw-p">Business Analyst</span><span class="qb-mean">heaviest in Planning: turning a vague idea into clear, agreed requirements</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Developer (you)</span><span class="qb-mean">heaviest in Design and Build: turning requirements into working code</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">QA</span><span class="qb-mean">heaviest in Test, but really involved from the start, reviewing requirements for testability early</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">DevOps</span><span class="qb-mean">heaviest in Release and Maintain: getting code out safely and keeping it running</span></div>
  </div>
  <p class="body">In practice these overlap constantly, a good developer thinks about testability while building, and a good BA stays involved well past the planning phase. But this mapping is a useful starting mental model for understanding who does what, and why they need each other.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Treating these as strict, siloed handoffs.</b> "Throwing requirements over the wall" to developers, or code "over the wall" to QA, tends to produce worse software than close, continuous collaboration.</li>
    <li><b>Assuming DevOps is just "the person who deploys stuff."</b> Modern DevOps is as much about culture and process (automating repeatable work, catching problems early) as any specific tool.</li>
  </ul></div>
  <div class="sec-num">15.1</div><h3 class="section-h">Recap</h3>
  <p class="body">BA, Developer, QA, and DevOps roles map loosely onto SDLC phases, planning, build, test, and release/maintain respectively, but real teams collaborate across all phases rather than working in strict silos.</p>
  ${qMC('q1', 'easy', 'Which role is typically heaviest during the Planning phase of the SDLC?',
    ['QA', 'Business Analyst', 'DevOps'],
    1, 'A Business Analyst\'s core work, turning a vague idea into clear, agreed requirements, sits primarily in the Planning phase, even though good BAs stay involved afterward too.')}
`
};

lessons['16'] = {
  short: 'Dev, staging, production', where: 'Part IV · <b>Dev, staging, and production environments</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 16</div>
  <h2 class="title">Dev, staging, and production environments</h2>
  <p class="lead">The same code often runs in several separate ${term('environment', 'environments')}, each existing for a distinct, deliberate reason.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The typical three</div>
    <div class="qb-row"><span class="qb-kw kw-p">Development (dev)</span><span class="qb-mean">a developer's own machine or a shared unstable environment, changing constantly while building</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Staging / QA</span><span class="qb-mean">a stable copy closely mirroring production, used for realistic pre-release testing</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Production</span><span class="qb-mean">the real, live system actual customers use</span></div>
  </div>
  <p class="body">Keeping these separate means a developer experimenting on their own machine can't accidentally break the real app real customers are using right now, and a nearly-final feature can be tested thoroughly on staging without any risk to production.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Testing directly in production "just this once."</b> Even a small, "harmless" test can have real, customer-visible side effects.</li>
    <li><b>Letting staging drift far out of sync with production.</b> If staging doesn't closely resemble production (different data, different configuration), tests there stop being reliable predictors of real behaviour.</li>
  </ul></div>
  <div class="sec-num">16.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Dev, staging, and production are kept separate so risky, unfinished work never endangers the real system, and pre-release testing happens somewhere realistic but safe.</p>
  ${qMC('q1', 'easy', 'Why keep a separate staging environment instead of testing new features directly in production?',
    ['Staging is always faster than production', 'To test realistically without risking real customer-visible side effects on the live system', 'Production environments cannot run new code at all'],
    1, 'Staging lets you test thoroughly in a production-like setting without any risk to the actual live system real customers depend on.')}
`
};

lessons['17'] = {
  short: 'What is a database?', where: 'Part V · <b>What a database actually is</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 17</div>
  <h2 class="title">What a database actually is</h2>
  <p class="lead">A database is simply a system built specifically for storing, organizing, and reliably retrieving data, far better suited to the job than a plain text file.</p>
  <hr class="rule">
  <svg viewBox="0 0 460 130" class="diagram" role="img" aria-label="A simple orders table with rows and columns">
    <rect x="20" y="20" width="420" height="30" fill="var(--teal-soft)" stroke="var(--teal)"/>
    <text x="80" y="40" text-anchor="middle" font-size="10" font-weight="700" fill="var(--teal-deep)">id</text>
    <text x="230" y="40" text-anchor="middle" font-size="10" font-weight="700" fill="var(--teal-deep)">customer_id</text>
    <text x="380" y="40" text-anchor="middle" font-size="10" font-weight="700" fill="var(--teal-deep)">total</text>
    <rect x="20" y="50" width="420" height="30" fill="#fff" stroke="var(--ink-faint)"/>
    <text x="80" y="70" text-anchor="middle" font-size="10">101</text><text x="230" y="70" text-anchor="middle" font-size="10">7</text><text x="380" y="70" text-anchor="middle" font-size="10">₹450</text>
    <rect x="20" y="80" width="420" height="30" fill="#fff" stroke="var(--ink-faint)"/>
    <text x="80" y="100" text-anchor="middle" font-size="10">102</text><text x="230" y="100" text-anchor="middle" font-size="10">12</text><text x="380" y="100" text-anchor="middle" font-size="10">₹610</text>
  </svg>
  <p class="body">This is exactly the "orders" table from SQLingo, one row per order, one column per attribute. A database engine (like PostgreSQL, MySQL, or SQLite) handles the hard parts for you: keeping data consistent when many people write at once, retrieving exactly the rows you ask for quickly even with millions of rows, and enforcing rules like "an order must belong to a real customer."</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Thinking a database is "just a big spreadsheet."</b> A real database engine enforces consistency and handles many simultaneous users safely, which a spreadsheet cannot.</li>
    <li><b>Storing everything in one giant table.</b> Splitting data into related tables (customers, restaurants, orders, as SQLingo teaches) avoids duplication and keeps data consistent.</li>
  </ul></div>
  <div class="sec-num">17.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A database is a system purpose-built for reliably storing, organizing, and retrieving structured data, handling consistency and concurrent access far better than a plain file could. <a href="/courses/sql">SQLingo</a> teaches how to actually query one.</p>
  ${qMC('q1', 'easy', 'What can a real database engine handle that a plain spreadsheet generally cannot?',
    ['Storing text', 'Reliably handling many simultaneous writes while keeping data consistent, at scale', 'Displaying data in rows and columns'],
    1, 'A database engine is purpose-built for concurrency and consistency at scale, which is exactly where a plain spreadsheet or flat file starts to break down.')}
`
};

lessons['18'] = {
  short: 'What is an API?', where: 'Part V · <b>What an API actually is</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 18</div>
  <h2 class="title">What an API actually is</h2>
  <p class="lead">An ${term('api', 'API')} is how one piece of software asks another for something, without needing to know how the other side is actually built.</p>
  <hr class="rule">
  <p class="body">When TastyGo's mobile app shows you nearby restaurants, it isn't reaching directly into a database. It sends an HTTP request to a defined API endpoint (like <code class="inl">GET /restaurants?near=me</code>), and the backend responds with exactly the data it agreed to provide, in an agreed format like JSON. The app never needs to know what language or database the backend actually uses underneath.</p>
  <div class="qb"><div class="qb-title">Why this separation matters</div>
    <div class="qb-row"><span class="qb-kw kw-p">Flexibility</span><span class="qb-mean">the backend can change its internal implementation freely, as long as the API contract stays the same</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Reuse</span><span class="qb-mean">the same API can serve a mobile app, a website, and a partner's system, all at once</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Testability</span><span class="qb-mean">exactly what the QA track's API testing chapter is built around: testing the contract directly, independent of any UI</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming "API" only means something exposed to outside companies.</b> Most APIs are internal, used only by your own app's own frontend talking to its own backend.</li>
    <li><b>Confusing the API with the database directly.</b> An API is a controlled, intentional gateway; it deliberately exposes only what it chooses to, not raw database access.</li>
  </ul></div>
  <div class="sec-num">18.1</div><h3 class="section-h">Recap</h3>
  <p class="body">An API is a defined, agreed contract for how one piece of software can ask another for something, keeping the two sides' internal implementations independent and swappable.</p>
  ${qMC('q1', 'easy', 'Why does an API let a backend change its internal implementation freely?',
    ['APIs cannot actually be changed once created', 'As long as the API contract (what requests it accepts, what responses it returns) stays the same, the internals behind it can change freely', 'Internal implementation and the API are always the same thing'],
    1, 'The API is a stable, agreed contract; anything behind it can be rewritten or replaced entirely as long as that outward contract keeps being honoured.')}
`
};

lessons['19'] = {
  short: 'Frontend, backend, full-stack', where: 'Part V · <b>Frontend, backend, and full-stack</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 19</div>
  <h2 class="title">Frontend, backend, and full-stack</h2>
  <p class="lead">These terms describe which side of the client-server model a developer mostly works on.</p>
  <hr class="rule">
  <svg viewBox="0 0 500 160" class="diagram" role="img" aria-label="Layered diagram: frontend on top, backend below, database at the bottom">
    <rect x="80" y="20" width="340" height="40" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="250" y="45" text-anchor="middle" font-size="12" font-weight="700" fill="var(--teal-deep)">Frontend — what the user sees and clicks</text>
    <rect x="80" y="65" width="340" height="40" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="250" y="90" text-anchor="middle" font-size="12" font-weight="700" fill="#7a4b0a">Backend — business logic, APIs</text>
    <rect x="80" y="110" width="340" height="40" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="250" y="135" text-anchor="middle" font-size="12" font-weight="700" fill="#7a251c">Database — where the data actually lives</text>
  </svg>
  <p class="body">Frontend developers build what runs in the user's browser or app: layout, buttons, what happens when you tap something. Backend developers build what runs on the server: business rules ("can this refund be auto-approved?"), talking to the database, exposing APIs. A full-stack developer works across both. This whole Developer track focuses primarily on the backend, exactly where Python, Django, and FastAPI live.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming frontend is "easier" than backend, or vice versa.</b> Each has its own real complexity: frontend deals with countless devices/browsers and real-time interactivity; backend deals with data integrity, security, and scale.</li>
    <li><b>Believing "full-stack" means equally expert at everything.</b> Most full-stack developers still lean stronger in one direction; the label mainly means comfortable working across the boundary.</li>
  </ul></div>
  <div class="sec-num">19.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Frontend is what the user directly sees and interacts with; backend is the server-side logic and data underneath it; full-stack spans both. This Developer track focuses on backend skills.</p>
  ${qMC('q1', 'easy', 'Which layer would typically decide whether a refund should be auto-approved or routed to manual review?',
    ['Frontend', 'Backend', 'Neither, this decision happens in the database automatically'],
    1, 'Business rules like refund approval logic live in the backend, which the frontend simply calls via an API and displays the result of.')}
`
};

lessons['20'] = {
  short: 'Auth vs. authz', where: 'Part V · <b>Authentication vs. authorization</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 20</div>
  <h2 class="title">Authentication vs. authorization</h2>
  <p class="lead">Two words that sound almost identical, but answer genuinely different questions, and both matter every time you build anything that logs users in.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Two separate questions</div>
    <div class="qb-row"><span class="qb-kw kw-p">Authentication</span><span class="qb-mean">who are you? (usually: proving it via a password, an app token, or similar)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Authorization</span><span class="qb-mean">now that we know who you are, what are you allowed to do or see?</span></div>
  </div>
  <p class="body">Logging into TastyGo proves who you are (authentication). Whether you're then allowed to view someone else's order history is a completely separate check (authorization), and a system can absolutely get one right while getting the other wrong, exactly the kind of bug the QA track's security testing chapter is built to catch.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming being logged in means you're allowed to do anything.</b> Being authenticated only proves identity; every specific action still needs its own authorization check.</li>
    <li><b>Building authorization checks only in the frontend.</b> A backend must independently verify authorization itself, since a determined user can bypass frontend-only checks entirely.</li>
  </ul></div>
  <div class="sec-num">20.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Authentication confirms identity; authorization determines permission. Both need to be enforced on the backend itself, not just assumed from a successful login.</p>
  ${qMC('q1', 'easy', 'A customer logs in successfully but then tries to view another customer\'s private order history. Which check should prevent this?',
    ['Authentication, since they are not logged in as themselves', 'Authorization, since being logged in doesn\'t automatically grant permission to see anyone\'s data', 'Neither check applies here'],
    1, 'Login (authentication) confirms who they are; a separate authorization check is what should actually determine whether they can see someone else\'s data.')}
`
};

lessons['21'] = {
  short: 'What is a server?', where: 'Part VI · <b>What is a &quot;server,&quot; really?</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 21</div>
  <h2 class="title">What is a "server," really?</h2>
  <p class="lead">This is where the words that trip up even experienced developers, ${term('reverse_proxy', 'reverse proxy')}, ${term('container', 'container')}, ${term('serverless', 'serverless')}, actually get untangled, one at a time, starting with "server" itself.</p>
  <hr class="rule">
  <p class="body">"Server" gets used to mean at least two different things, and mixing them up is exactly why the word feels confusing: (1) a physical or virtual machine, the actual hardware (or a cloud provider's virtualized slice of hardware) something runs on, and (2) a piece of ${term('server', 'server')} software running on that machine, listening for requests and responding to them. You can run several different server programs on one machine, or spread one logical service across many machines.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming "the server" always means one physical box.</b> A single logical "server" (like TastyGo's backend) commonly runs across many machines behind the scenes.</li>
    <li><b>Conflating the machine with the software running on it.</b> "The web server" almost always refers to the software (like nginx), not the physical hardware underneath it.</li>
  </ul></div>
  <div class="sec-num">21.1</div><h3 class="section-h">Recap</h3>
  <p class="body">"Server" can mean either the machine (hardware) or the software running on it that listens for and responds to requests. Keeping these two meanings separate makes every following chapter in this Part much clearer.</p>
  ${qMC('q1', 'easy', 'What are the two different things "server" commonly refers to?',
    ['A frontend and a backend', 'A physical/virtual machine, and separately, the software running on it that listens for and responds to requests', 'A database and an API'],
    1, '"Server" is genuinely ambiguous between the machine itself and the specific software (like a web server program) running on that machine; distinguishing them clears up a lot of confusion.')}
`
};

lessons['22'] = {
  short: 'Web vs. app servers', where: 'Part VI · <b>Web servers vs. application servers</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 22</div>
  <h2 class="title">Web servers vs. application servers</h2>
  <p class="lead">Here's where nginx specifically fits, a piece of software with a genuinely narrow, well-defined job.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Two different jobs, often on the same machine</div>
    <div class="qb-row"><span class="qb-kw kw-p">Web server (e.g. nginx, Apache)</span><span class="qb-mean">extremely good at serving static files quickly and handling huge numbers of simultaneous connections; often sits in front as a reverse proxy too</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Application server (e.g. gunicorn for Python, or your Django/FastAPI app itself)</span><span class="qb-mean">actually runs your application's code: the logic that decides what a request should do</span></div>
  </div>
  <p class="body">A typical real setup: nginx receives every incoming request first. Requests for static files (images, CSS) it answers directly, extremely fast. Requests that need actual logic (place an order, check a status) it forwards along to the application server running your Python/Django/FastAPI code, then relays that response back to the client.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming you need only one or the other.</b> Real production setups very commonly use both together, each doing what it's best at.</li>
    <li><b>Thinking your application code "is" the web server.</b> Your Django/FastAPI app is usually run by an application server, often sitting behind a separate web server/reverse proxy in front of it.</li>
  </ul></div>
  <div class="sec-num">22.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A web server (like nginx) excels at serving static content and handling connections at scale; an application server actually runs your code's logic. Production setups typically use both together.</p>
  ${qMC('q1', 'easy', 'In a typical setup, what happens to a request for a static image versus a request to place an order?',
    ['Both are always handled identically by the application code', 'The web server (nginx) can answer the static image request directly, while the order request gets forwarded to the application server running your actual code', 'Static files are never served by a web server'],
    1, 'Web servers are specifically optimized to serve static content directly and fast, while requests needing real logic get forwarded to the application server that actually runs your code.')}
`
};

lessons['23'] = {
  short: 'Reverse proxies', where: 'Part VI · <b>Proxies and reverse proxies, explained simply</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 23</div>
  <h2 class="title">Proxies and reverse proxies, explained simply</h2>
  <p class="lead">One of the most commonly confused pairs in all of backend development, cleared up with a single question: whose side is it standing on?</p>
  <hr class="rule">
  <svg viewBox="0 0 560 230" class="diagram" role="img" aria-label="Forward proxy sits in front of clients hiding them from the internet; reverse proxy sits in front of servers hiding them from clients">
    <text x="10" y="20" font-size="11" font-weight="700" fill="var(--ink-soft)">Forward proxy — stands in front of clients</text>
    <rect x="10" y="30" width="90" height="40" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="55" y="54" text-anchor="middle" font-size="10" fill="var(--teal-deep)">Client(s)</text>
    <rect x="150" y="30" width="110" height="40" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="205" y="54" text-anchor="middle" font-size="10" fill="#7a4b0a">Forward proxy</text>
    <rect x="330" y="30" width="90" height="40" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="375" y="54" text-anchor="middle" font-size="10" fill="#7a251c">Internet</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDF5)"><path d="M100,50 L149,50"/><path d="M260,50 L329,50"/></g>
    <text x="10" y="115" font-size="11" font-weight="700" fill="var(--ink-soft)">Reverse proxy — stands in front of servers</text>
    <rect x="10" y="125" width="90" height="40" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="55" y="149" text-anchor="middle" font-size="10" fill="#7a251c">Client(s)</text>
    <rect x="150" y="125" width="110" height="40" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="205" y="149" text-anchor="middle" font-size="10" fill="#7a4b0a">Reverse proxy</text>
    <rect x="330" y="105" width="90" height="30" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="375" y="125" text-anchor="middle" font-size="9" fill="var(--teal-deep)">App server 1</text>
    <rect x="330" y="145" width="90" height="30" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="375" y="165" text-anchor="middle" font-size="9" fill="var(--teal-deep)">App server 2</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDF5)"><path d="M100,145 L149,145"/><path d="M260,140 L329,120"/><path d="M260,150 L329,160"/></g>
    <defs><marker id="arrDF5" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">A forward proxy sits in front of clients, hiding and managing their traffic out to the internet (common in corporate networks, or privacy tools). A ${term('reverse_proxy', 'reverse proxy')} sits in front of servers instead, hiding and managing how traffic reaches them: it can route requests to whichever of several app server instances is free, handle HTTPS/TLS in one central place, and shield the actual application servers from being directly exposed to the internet.</p>
  <p class="body">This is precisely nginx's most common real-world role in front of a Python backend: nginx (the reverse proxy) receives every request from the internet, and only it, then decides where each request actually goes.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Mixing up which side each proxy protects.</b> The simplest memory aid: a forward proxy works for the client asking; a reverse proxy works for the server(s) answering.</li>
    <li><b>Assuming a reverse proxy is optional overhead.</b> In production, it's usually what provides load balancing, centralized HTTPS, and hides your real app servers from direct exposure, real, valuable jobs, not just extra complexity.</li>
  </ul></div>
  <div class="sec-num">23.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A reverse proxy sits in front of one or more backend servers, routing, load balancing, and often handling HTTPS on their behalf, exactly the role nginx commonly plays in front of a real application.</p>
  ${qMC('q1', 'easy', 'What is the simplest way to remember the difference between a forward proxy and a reverse proxy?',
    ['They are the same thing with different names', 'A forward proxy works on behalf of clients; a reverse proxy works on behalf of servers', 'A reverse proxy is only used for databases'],
    1, 'The direction each one protects is the key distinction: forward proxies sit in front of clients, reverse proxies sit in front of servers.')}
  ${qScenario('q2', 'med', 'TastyGo runs three copies of its backend for reliability. Explain, in plain terms, what role a reverse proxy plays here.',
    'The reverse proxy (like nginx) sits in front of all three backend copies and is the only thing directly exposed to the internet. When a request comes in, it decides which of the three app server copies should handle it (load balancing), so no single copy gets overwhelmed, and if one copy goes down, it can simply stop routing traffic to it without customers noticing.')}
`
};

lessons['24'] = {
  short: 'Containers, Docker, serverless', where: 'Part VI · <b>Containers, Docker, and serverless</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 24</div>
  <h2 class="title">Containers, Docker, and serverless</h2>
  <p class="lead">The last set of "words that confused you": what problem each of these actually solves, and how they relate.</p>
  <hr class="rule">
  <svg viewBox="0 0 560 200" class="diagram" role="img" aria-label="Virtual machines each need a full guest OS; containers share one host OS kernel, each just packaging the app and its dependencies">
    <text x="10" y="20" font-size="11" font-weight="700" fill="var(--ink-soft)">Virtual machines — each needs a full OS</text>
    <g fill="var(--amber-soft)" stroke="var(--amber)">
      <rect x="10" y="30" width="120" height="70"/><rect x="140" y="30" width="120" height="70"/>
    </g>
    <text x="70" y="50" text-anchor="middle" font-size="9" fill="#7a4b0a">App A</text><text x="70" y="65" text-anchor="middle" font-size="8" fill="#7a4b0a">Guest OS</text>
    <text x="200" y="50" text-anchor="middle" font-size="9" fill="#7a4b0a">App B</text><text x="200" y="65" text-anchor="middle" font-size="8" fill="#7a4b0a">Guest OS</text>
    <rect x="10" y="105" width="250" height="20" fill="var(--ink-faint)"/><text x="135" y="120" text-anchor="middle" font-size="9" fill="#fff">Shared physical hardware</text>
    <text x="330" y="20" font-size="11" font-weight="700" fill="var(--ink-soft)">Containers — share one host OS kernel</text>
    <g fill="var(--teal-soft)" stroke="var(--teal)">
      <rect x="330" y="30" width="100" height="50"/><rect x="440" y="30" width="100" height="50"/>
    </g>
    <text x="380" y="60" text-anchor="middle" font-size="9" fill="var(--teal-deep)">App A</text><text x="490" y="60" text-anchor="middle" font-size="9" fill="var(--teal-deep)">App B</text>
    <rect x="330" y="85" width="210" height="20" fill="var(--ink-soft)"/><text x="435" y="100" text-anchor="middle" font-size="9" fill="#fff">Shared host OS kernel</text>
    <rect x="330" y="110" width="210" height="15" fill="var(--ink-faint)"/><text x="435" y="122" text-anchor="middle" font-size="9" fill="#fff">Shared physical hardware</text>
  </svg>
  <p class="body">A traditional virtual machine gives each app its own complete, separate operating system, safe but heavy, slow to start, and resource-hungry. A ${term('container', 'container')} instead packages just the app and its exact dependencies, sharing the host machine's OS kernel underneath, making it far lighter and faster to start. Docker is simply the most popular tool for building, running, and sharing containers.</p>
  <p class="body">${term('serverless', 'Serverless')} takes this a step further: you don't manage a container or a server at all, you just deploy a function, and the cloud provider runs it only when triggered, scaling automatically, billing you only for actual execution time, not for sitting idle. It solves a different problem than containers: not "how do I package my app efficiently," but "how do I avoid managing any server infrastructure whatsoever" for things that don't need to run constantly.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming Docker and containers are the same word for the same thing.</b> "Container" is the general concept; Docker is one (very popular) specific tool for working with containers.</li>
    <li><b>Assuming serverless means "no servers exist."</b> Servers still run your code, you simply never provision or manage them yourself.</li>
    <li><b>Picking serverless for something that runs constantly.</b> Serverless shines for infrequent, bursty, or event-driven work; an always-busy backend often suits a regular container or server better, cost-wise.</li>
  </ul></div>
  <div class="sec-num">24.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Containers package an app with its dependencies, sharing the host OS kernel, lighter than a full virtual machine. Docker is the most common tool for containers. Serverless removes server management entirely, running your code on demand and billing only for actual execution.</p>
  ${qMC('q1', 'easy', 'What is the key difference between a virtual machine and a container?',
    ['They are identical concepts', 'A VM includes a full separate guest OS per app; a container shares the host OS kernel, making it lighter and faster to start', 'Containers require more resources than virtual machines'],
    1, 'The defining difference is that containers share the host machine\'s OS kernel instead of each needing a complete separate guest OS, which is exactly what makes them lighter and faster.')}
  ${qMC('q2', 'med', 'When would serverless generally be a poor fit compared to a regular container or server?',
    ['For an infrequent, event-driven task like resizing an uploaded image', 'For an always-busy backend that runs constantly under steady load', 'Serverless is always the better choice in every situation'],
    1, 'Serverless bills for actual execution time and is optimized for infrequent or bursty workloads; a constantly busy backend often ends up cheaper and simpler on a regular server or container.')}
`
};

lessons['25'] = {
  short: 'Package managers', where: 'Part VII · <b>Package managers and dependencies</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 25</div>
  <h2 class="title">Package managers and dependencies</h2>
  <p class="lead">Almost no real application is written entirely from scratch. Package managers are how you safely borrow other people's already-written code.</p>
  <hr class="rule">
  <p class="body">A dependency is a piece of external code your project relies on, someone else's library that already solves a problem (parsing dates, sending emails, talking to a database) so you don't have to write it yourself. A package manager (like <code class="inl">pip</code> for Python, or <code class="inl">npm</code> for JavaScript) downloads, installs, and tracks exactly which versions of which dependencies your project needs.</p>
  <div class="qb"><div class="qb-title">Why versions matter</div>
    <div class="qb-row"><span class="qb-kw kw-p">Version pinning</span><span class="qb-mean">recording the exact version used, so the project behaves identically on every machine it runs on</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Updating</span><span class="qb-mean">deliberately moving to a newer version, often for security fixes, ideally tested before deploying</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Never pinning dependency versions.</b> Without this, "it works on my machine" can genuinely mean a teammate silently got a different, incompatible version.</li>
    <li><b>Blindly updating every dependency to the latest version right before a release.</b> A newer version can introduce breaking changes; updates deserve their own testing, ideally on staging first.</li>
  </ul></div>
  <div class="sec-num">25.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Package managers install and track external dependencies your code relies on. Pinning exact versions keeps a project's behaviour consistent across every machine it runs on.</p>
  ${qMC('q1', 'easy', 'Why does pinning an exact dependency version matter?',
    ['It makes the code run faster', 'It ensures the project behaves identically across different machines, rather than silently using different versions', 'It is only relevant for very large companies'],
    1, 'Without pinning, different developers (or environments) could end up with different versions of the same dependency, causing "works on my machine" style bugs.')}
`
};

lessons['26'] = {
  short: 'Testing your own code', where: 'Part VII · <b>Testing your own code</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 26</div>
  <h2 class="title">Testing your own code</h2>
  <p class="lead">The QA track covered testing an entire application from the outside. As a developer, you also write tests for your own code directly, before QA ever sees it.</p>
  <hr class="rule">
  <p class="body">A unit test checks one small piece of your code (a single function) in isolation. For example, a function computing a delivery ETA can be tested directly with known inputs, without needing a running app, a real database, or a browser at all: give it known inputs, assert the output is exactly what's expected.</p>
  <div class="qb"><div class="qb-title">Why developers test their own code, not just QA</div>
    <div class="qb-row"><span class="qb-kw kw-p">Speed</span><span class="qb-mean">unit tests run in milliseconds, giving instant feedback while you're still writing the code</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Confidence to change things</span><span class="qb-mean">a good test suite tells you immediately if a later change broke something, without waiting for QA to find it</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Cheaper bugs</span><span class="qb-mean">a bug caught by a unit test while writing the code is far cheaper to fix than the same bug found later by QA, or worse, by a customer</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Treating "QA will catch it" as a substitute for writing your own tests.</b> A bug caught earlier, by you, while writing the code, is dramatically cheaper to fix than one found later.</li>
    <li><b>Only testing the happy path in your own tests.</b> The same positive/negative testing principle from the QA track applies here too.</li>
  </ul></div>
  <div class="sec-num">26.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Unit tests check small pieces of your own code in isolation, giving fast feedback and making later changes far safer, complementing (not replacing) the broader testing QA does from the outside.</p>
  ${qMC('q1', 'easy', 'Why is a bug caught by a developer\'s own unit test generally cheaper to fix than one found later by QA?',
    ['Unit tests are not actually useful', 'The earlier a bug is caught in the development process, the less work has been built on top of it, and the cheaper it is to fix', 'QA-found bugs are always more severe'],
    1, 'Catching a bug as early as possible, ideally while writing the code itself, avoids the extra cost of it being found later after more work has been built on top of it.')}
`
};

lessons['27'] = {
  short: "CI/CD for builders", where: "Part VII · <b>CI/CD, from a builder's perspective</b>", render: () => `
  <div class="eyebrow">Part VII · Chapter 27</div>
  <h2 class="title">CI/CD, from a builder's perspective</h2>
  <p class="lead">The QA track covered CI/CD as a way to catch regressions. As the person writing the code, it's also what actually gets your work safely in front of real users.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">CI vs. CD</div>
    <div class="qb-row"><span class="qb-kw kw-p">Continuous Integration (CI)</span><span class="qb-mean">every time code is pushed, it's automatically built and tested, catching problems immediately</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Continuous Deployment/Delivery (CD)</span><span class="qb-mean">code that passes CI is automatically (or with one click) released toward staging or production</span></div>
  </div>
  <p class="body">As a developer, this changes how you work day to day: instead of manually testing and manually copying files to a server, you push your code, an automated pipeline builds it, runs the test suite, and (if everything passes) ships it, often within minutes, with a clear, visible record of exactly what changed and whether it was verified.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Pushing code straight to production manually "to save time."</b> This skips the automated safety net entirely, exactly the regressions CI/CD exists to catch.</li>
    <li><b>Writing code with no tests, then wondering why CI doesn't catch anything.</b> CI can only be as good as the tests it runs, chapter 26's unit tests are what actually give it teeth.</li>
  </ul></div>
  <div class="sec-num">27.1</div><h3 class="section-h">Recap</h3>
  <p class="body">CI automatically builds and tests every code change; CD automatically (or semi-automatically) ships code that passes. Together they turn "did I break anything" into an automatic, fast, visible answer instead of a manual guess.</p>
  ${qMC('q1', 'easy', 'What is the key difference between Continuous Integration and Continuous Deployment?',
    ['They are the same thing', 'CI automatically builds and tests every change; CD automatically releases changes that pass those checks', 'CD happens before CI in the pipeline'],
    1, 'CI focuses on automatically verifying every change (build + test); CD focuses on automatically getting a verified change out to staging/production.')}
`
};

lessons['28'] = {
  short: 'Choosing your path', where: 'Part VIII · <b>Choosing your path: Python, Django, FastAPI, DevOps</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 28</div>
  <h2 class="title">Choosing your path: Python, Django, FastAPI, DevOps</h2>
  <p class="lead">With the vocabulary from this course in place, here's what's actually different about each of the courses ahead.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">What each remaining course actually teaches</div>
    <div class="qb-row"><span class="qb-kw kw-p">Python</span><span class="qb-mean">the language itself: syntax, data structures, functions, object-oriented code, the foundation everything else here is built on</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Django</span><span class="qb-mean">a full-featured web framework: build a complete web application (pages, forms, an admin panel, a database layer) quickly, with a lot of structure provided for you</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">FastAPI</span><span class="qb-mean">a lean, modern framework focused specifically on building fast, well-documented APIs, less "batteries-included" than Django, more focused</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">DevOps</span><span class="qb-mean">taking any of the above and actually running it reliably: containers, reverse proxies, CI/CD, cloud deployment, monitoring</span></div>
  </div>
  <p class="body">You don't have to choose only one. Many real backend developers know Python plus both frameworks, reaching for Django when building a fuller web application with an admin interface, and FastAPI when building a lean, high-performance API. DevOps skills matter regardless of which framework you use.</p>
  <div class="sec-num">28.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Python is the shared foundation. Django and FastAPI are two different tools for two different kinds of backend project. DevOps skills apply to deploying either one reliably. The Capstone Project at the end brings all of this together.</p>
  ${qMC('q1', 'easy', 'What is the main practical difference between Django and FastAPI?',
    ['They are two names for the exact same tool', 'Django is a full-featured framework for complete web applications; FastAPI is a leaner framework focused specifically on building APIs', 'FastAPI can only be used for frontend code'],
    1, 'Django provides a lot of built-in structure for full web applications (admin panel, templates, etc.), while FastAPI is deliberately leaner and focused specifically on building fast, well-documented APIs.')}
`
};

lessons['29'] = {
  short: 'Career paths', where: 'Part VIII · <b>Career paths in software development</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 29</div>
  <h2 class="title">Career paths in software development</h2>
  <p class="lead">The final chapter of Fundamentals: where developer careers actually lead, and how the vocabulary from this course keeps showing up in interviews.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Common paths from here</div>
    <div class="qb-row"><span class="qb-kw kw-p">Backend developer</span><span class="qb-mean">builds the server-side logic, APIs, and data layer, exactly what Python/Django/FastAPI lead toward</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">Full-stack developer</span><span class="qb-mean">works across both frontend and backend</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">DevOps / Platform engineer</span><span class="qb-mean">focuses on deployment, infrastructure, and reliability, exactly Part VI and VII of this course, deepened</span></div>
  </div>
  <p class="body">Interviewers frequently ask conceptual questions straight from this chapter list: "what's the difference between a process and a thread," "explain what happens when you type a URL into a browser" (client-server, DNS, HTTP, all covered here), "what's a reverse proxy," "why use Docker." Being able to explain these plainly, the way this course tried to, is worth as much as knowing specific syntax.</p>
  <div class="sec-num">29.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This course built the shared vocabulary and mental models, how software runs, how the internet works, the SDLC, and the servers/proxies/containers that confuse even experienced developers, that every course ahead, and most real interviews, will keep building on.</p>
  ${qScenario('q1', 'hard', 'An interviewer asks: "Walk me through what happens, step by step, from typing tastygo.com into a browser to seeing the homepage." Write your own answer using concepts from this course.',
    'A strong answer touches: (1) the browser looks up tastygo.com via DNS to get an IP address, (2) the browser opens a connection to that address and sends an HTTP (or HTTPS) request, (3) that request likely first hits a reverse proxy (like nginx), which may terminate HTTPS and decide which backend app server instance should handle it, (4) the application server runs the actual backend code, which may query a database, and builds a response, (5) the response travels back through the reverse proxy to the browser, which renders the HTML/data it receives as the homepage.')}
  ${qMC('q2', 'med', 'Which single course in this Developer track focuses specifically on deployment, containers, and reliability at a deeper level than this Fundamentals course?',
    ['Python', 'DevOps', 'FastAPI'],
    1, 'The DevOps course picks up exactly where this course\'s Part VI left off, going deep on containers, reverse proxies, CI/CD, and cloud deployment.')}
`
};

/* ---------- cheat sheet ---------- */
const CHEATS = {
  '00': { note: 'Software is a precise instruction list for hardware. Source code (human-readable) gets translated into instructions the machine executes.' },
  '0b': { note: 'A code editor, the terminal, and Git are the three tools that show up across virtually all software development, regardless of language.' },
  '0i': { note: 'This whole track builds toward one capstone: building, containerizing, and deploying a real slice of TastyGo\'s backend.' },
  '01': { code: 'Program = dormant file. Process = that program actually running, with its own memory. The OS manages every process and shares hardware between them.' },
  '02': { code: 'Compiled languages translate all code upfront, then run it separately. Interpreted languages (like Python) read and run line by line.' },
  '03': { code: 'A variable is a name pointing at a value in memory. Data types (number, string, boolean, list) determine what operations actually mean.' },
  '04': { code: 'Terminal commands follow: command argument --flag. E.g. ls -la = command "ls", flag "-la".' },
  '05': { code: 'Git tracks deliberate snapshots (commits) of your project, and lets you branch off to work separately without disturbing the main history.' },
  '06': { code: 'A branch is a lightweight, movable pointer to a commit. Merging brings one branch\'s changes into another.' },
  '07': { code: 'A remote is a hosted copy of your repo (e.g. on GitHub). A pull request proposes a merge and invites review before it happens.' },
  '08': { code: 'A merge conflict happens when two branches changed the same lines differently — Git pauses and asks you to decide, rather than guessing.' },
  '09': { code: 'Client-server model: a client asks, a server (holding the real data/logic) answers. Underlies almost everything on the internet.' },
  '10': { code: 'Every server has a numeric IP address. DNS translates a human-readable domain name into that address before your device can connect.' },
  '11': { code: 'HTTP defines a standard request (method, path) and response (status code, body). HTTPS = HTTP + TLS encryption on top.' },
  '12': { code: '"The cloud" = renting compute, storage, and networking from a provider\'s data centers over the internet, instead of owning hardware.' },
  '13': { code: 'SDLC: Plan → Design → Build → Test → Release → Maintain, looping back to Plan for the next cycle.' },
  '14': { code: 'Waterfall = one long sequential pass. Agile = many small repeated loops (sprints), shipping and adjusting frequently. Scrum/Kanban organize Agile work.' },
  '15': { code: 'BA ≈ Planning. Developer ≈ Design/Build. QA ≈ Test (but involved earlier). DevOps ≈ Release/Maintain. Real teams collaborate across all phases.' },
  '16': { code: 'Dev (unstable, in-progress) → Staging (production-like, safe to test) → Production (the real, live system). Kept separate to protect real users.' },
  '17': { code: 'A database reliably stores, organizes, and retrieves structured data, handling consistency and concurrent access far better than a plain file.' },
  '18': { code: 'An API is a defined contract for one piece of software to ask another for something, keeping both sides\' internals independent and swappable.' },
  '19': { code: 'Frontend = what the user sees/clicks. Backend = server-side logic, APIs, database. Full-stack = both. This track focuses on backend.' },
  '20': { code: 'Authentication = who are you? Authorization = what are you allowed to do/see? Both must be enforced on the backend itself.' },
  '21': { code: '"Server" = either the machine (hardware) or the software listening for and responding to requests. Keep the two meanings separate.' },
  '22': { code: 'Web server (e.g. nginx) serves static files fast and handles connections at scale. Application server actually runs your app\'s code/logic.' },
  '23': { code: 'Forward proxy works on behalf of clients. Reverse proxy (e.g. nginx) works on behalf of servers: routing, load balancing, centralized HTTPS.' },
  '24': { code: 'VMs = full separate guest OS per app (heavy). Containers share the host OS kernel (light). Docker = popular container tool. Serverless = no server management, billed per execution.' },
  '25': { code: 'Package managers (pip, npm) install and track external dependencies. Pin exact versions so behaviour stays consistent across machines.' },
  '26': { code: 'Unit tests check one small piece of your own code in isolation, fast feedback, cheaper bugs than catching them later in QA or production.' },
  '27': { code: 'CI = automatically build + test every change. CD = automatically ship changes that pass. Together: fast, visible, automatic safety net.' },
  '28': { code: 'Python = the shared language. Django = full-featured web framework. FastAPI = lean API-focused framework. DevOps = deploying either reliably.' },
  '29': { code: '"Walk me through typing a URL into a browser": DNS lookup → HTTP(S) request → reverse proxy → app server → (maybe) database → response back.' },
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
  const urlFlow = `<div class="iq-flow"><span>Browser</span><i>&rarr;</i><span>DNS lookup</span><i>&rarr;</i><span>TCP + TLS</span><i>&rarr;</i><span>HTTP request</span><i>&rarr;</i><span>Server</span><i>&rarr;</i><span>Response</span><i>&rarr;</i><span>Render</span></div>`;
  const gitFlow = `<div class="iq-flow"><span>Working dir</span><i>&mdash;add&rarr;</i><span>Staging</span><i>&mdash;commit&rarr;</i><span>Local repo</span><i>&mdash;push&rarr;</i><span>Remote</span></div>`;
  const status = `<table class="iq-table"><thead><tr><th>Range</th><th>Meaning</th><th>Examples</th></tr></thead><tbody>
    <tr><td>1xx</td><td>Informational</td><td>100 Continue</td></tr>
    <tr><td>2xx</td><td>Success</td><td>200 OK, 201 Created, 204 No Content</td></tr>
    <tr><td>3xx</td><td>Redirection</td><td>301 Moved, 304 Not Modified</td></tr>
    <tr><td>4xx</td><td>Client error</td><td>400 Bad Request, 401, 403, 404</td></tr>
    <tr><td>5xx</td><td>Server error</td><td>500 Internal, 502, 503</td></tr></tbody></table>`;
  const vmc = `<table class="iq-table"><thead><tr><th></th><th>Virtual machine</th><th>Container</th></tr></thead><tbody>
    <tr><td>Includes</td><td>A full guest OS</td><td>App + deps only (shares host kernel)</td></tr>
    <tr><td>Size</td><td>Gigabytes</td><td>Megabytes</td></tr>
    <tr><td>Start time</td><td>Minutes</td><td>Seconds</td></tr>
    <tr><td>Isolation</td><td>Strong (own OS)</td><td>Process-level</td></tr></tbody></table>`;
  return `
  <div class="eyebrow">Interview prep</div>
  <h2 class="title">Developer fundamentals interview questions</h2>
  <p class="lead">A deep, topic-by-topic bank of the "how does software actually work" questions that come up in junior developer and DevOps-adjacent interviews. Every answer is short, correct, and points at the reasoning an interviewer wants to hear. Click any question to expand it.</p>
  <button class="pg-btn pg-ghost" style="margin:6px 0 10px" onclick="window.print()">Print / save as PDF</button>
  <hr class="rule">

  <h3 class="section-h">Software &amp; the SDLC</h3>
  ${iq('Beginner','What are the phases of the SDLC?',`<p>Planning, requirements/analysis, design, development, testing, deployment, and maintenance. Models like Waterfall run them once in sequence; Agile repeats them in short iterations.</p>`)}
  ${iq('Beginner','Waterfall vs Agile?',`<p>Waterfall does all requirements and design up front in sequential phases &mdash; predictable but rigid. Agile delivers working software in short iterations and welcomes change &mdash; adaptive but needs continuous engagement.</p>`)}
  ${iq('Beginner','Compiled vs interpreted languages?',`<p>A <b>compiled</b> language (C, Go, Rust) is translated to machine code ahead of time, then run &mdash; fast, errors caught at compile time. An <b>interpreted</b> language (Python, JavaScript) is executed line by line by a runtime &mdash; more flexible, errors often surface at run time. Many (Java, C#) compile to bytecode run by a VM.</p>`)}
  ${iq('Beginner','Frontend vs backend?',`<p><b>Frontend</b> is what runs in the browser (UI, HTML/CSS/JS). <b>Backend</b> is the server side (business logic, database, APIs). They communicate over HTTP, usually via an API.</p>`)}
  ${iq('Intermediate','What is an API?',`<p>An Application Programming Interface: a defined contract for how one piece of software talks to another. A web API exposes endpoints (URLs + methods) that return data (often JSON), hiding the internals behind that contract.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Version control &amp; Git</h3>
  ${iq('Beginner','What is version control, and why Git?',`<p>It tracks changes to code over time, enabling history, collaboration, branching and rollback. Git is distributed &mdash; every clone is a full repository with its own history &mdash; which makes branching cheap and offline work easy.</p>`)}
  ${iq('Beginner','Explain the working directory, staging area and repository.',`<p>You edit files in the <b>working directory</b>, choose what to include with <code class="inl">git add</code> (the <b>staging area</b>), record a snapshot with <code class="inl">git commit</code> (the local <b>repository</b>), and share with <code class="inl">git push</code>.</p>${gitFlow}`)}
  ${iq('Intermediate','git merge vs git rebase?',`<p><b>Merge</b> combines branches and preserves history with a merge commit (non-linear but truthful). <b>Rebase</b> replays your commits on top of another branch for a clean, linear history. Rule of thumb: do not rebase commits that others have already pulled (rewriting shared history).</p>`)}
  ${iq('Intermediate','git pull vs git fetch?',`<p><code class="inl">fetch</code> downloads remote changes but does not touch your working branch; <code class="inl">pull</code> is <code class="inl">fetch</code> + <code class="inl">merge</code> (or rebase) into your branch. Fetch to look first; pull to integrate.</p>`)}
  ${iq('Advanced','git reset vs git revert?',`<p><code class="inl">revert</code> creates a new commit that undoes a previous one &mdash; safe for shared history. <code class="inl">reset</code> moves the branch pointer (and optionally changes the index/working tree), rewriting history &mdash; fine locally, dangerous on pushed commits.</p>`)}
  ${iq('Intermediate','What is a pull request, and why review code?',`<p>A PR proposes merging one branch into another and is the place for review, discussion and automated checks (CI) before merge. Review catches bugs, spreads knowledge, and keeps standards consistent.</p>`)}
  ${iq('Intermediate','How do you resolve a merge conflict?',`<p>Git marks the clashing regions; you open the file, choose the correct combination of both sides, remove the conflict markers, then <code class="inl">git add</code> and complete the merge/commit. Conflicts happen when two branches change the same lines.</p>`)}

  <h3 class="section-h" style="margin-top:26px">How the web works</h3>
  ${iq('Intermediate','What happens when you type a URL and press enter?',`<p>The browser resolves the domain to an IP via <b>DNS</b>, opens a <b>TCP</b> connection (and a <b>TLS</b> handshake for HTTPS), sends an <b>HTTP</b> request, the server responds, and the browser renders the returned HTML/CSS/JS (making more requests for assets).</p>${urlFlow}`)}
  ${iq('Beginner','What is DNS?',`<p>The Domain Name System &mdash; the internet's phone book. It translates a human name like <code class="inl">example.com</code> into the IP address a machine needs to connect to.</p>`)}
  ${iq('Beginner','Name the main HTTP methods.',`<p><b>GET</b> (read), <b>POST</b> (create), <b>PUT</b> (replace), <b>PATCH</b> (partial update), <b>DELETE</b> (remove). GET should be safe and have no side effects; GET/PUT/DELETE are idempotent, POST is not.</p>`)}
  ${iq('Beginner','What do the HTTP status code families mean?',`${status}`)}
  ${iq('Intermediate','HTTP vs HTTPS &mdash; what does TLS add?',`<p>HTTPS is HTTP over <b>TLS</b>, which encrypts traffic (confidentiality), verifies the server via a certificate (authentication), and detects tampering (integrity). Without it, data travels in plain text.</p>`)}
  ${iq('Intermediate','What is REST?',`<p>An architectural style for web APIs: resources identified by URLs, manipulated with standard HTTP methods, stateless requests, and representations (usually JSON). It is convention, not a strict protocol.</p>`)}
  ${iq('Intermediate','HTTP is stateless &mdash; so how do sites remember you?',`<p>Each request is independent, so state is carried explicitly: a <b>cookie</b> holds a session id the server looks up (server-side session), or a signed <b>token</b> (e.g. JWT) carries identity/claims the server verifies without storing session state.</p>`)}
  ${iq('Beginner','What is JSON?',`<p>JavaScript Object Notation &mdash; a lightweight, human-readable text format of key/value pairs and arrays, the common language for API request/response bodies.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Servers &amp; infrastructure</h3>
  ${iq('Intermediate','Web server vs application server?',`<p>A <b>web server</b> (nginx, Apache) serves static files and forwards requests; an <b>application server</b> runs your code to generate dynamic responses. In practice a web server often sits in front of the app server.</p>`)}
  ${iq('Intermediate','What is a reverse proxy, and why use one?',`<p>A server that sits in front of your app servers and forwards client requests to them. It centralises TLS termination, load balancing, caching, compression and routing &mdash; and hides the backend. nginx is a common choice.</p>`)}
  ${iq('Intermediate','What is a load balancer?',`<p>It distributes incoming traffic across multiple servers so no single one is overwhelmed, improving throughput and availability (it routes around unhealthy instances). Strategies include round-robin and least-connections.</p>`)}
  ${iq('Intermediate','What is caching, and what is a CDN?',`<p><b>Caching</b> stores expensive-to-produce results so repeat requests are served fast. A <b>CDN</b> is a network of edge servers that cache static assets close to users, cutting latency and origin load.</p>`)}
  ${iq('Beginner','What is a port, and what is localhost?',`<p>A <b>port</b> is a numbered channel on a host so multiple services can share one IP (80 for HTTP, 443 for HTTPS). <b>localhost</b> (127.0.0.1) is your own machine &mdash; used to reach services running locally.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Containers &amp; deployment</h3>
  ${iq('Intermediate','Container vs virtual machine?',`<p>A VM virtualises hardware and runs a full guest OS; a container shares the host kernel and packages just the app and its dependencies &mdash; lighter, faster to start, and denser, at the cost of weaker isolation.</p>${vmc}`)}
  ${iq('Intermediate','What is Docker, and image vs container?',`<p>Docker packages an app and its dependencies into a portable <b>image</b> (a read-only template) that runs the same everywhere. A <b>container</b> is a running instance of an image. "Works on my machine" problems largely disappear.</p>`)}
  ${iq('Advanced','What is serverless?',`<p>A model where you deploy functions and the cloud provider runs, scales and bills them per use &mdash; no servers to manage (e.g. AWS Lambda). Great for event-driven, bursty workloads; trade-offs include cold starts and vendor lock-in.</p>`)}
  ${iq('Intermediate','What is CI/CD?',`<p><b>CI</b> (continuous integration) automatically builds and tests every change so problems surface early. <b>CD</b> (continuous delivery/deployment) automatically releases passing changes to staging/production. Together they make small, safe, frequent releases.</p>`)}
  ${iq('Beginner','Why have separate dev, staging and production environments?',`<p>To test changes safely before they reach users: <b>dev</b> for building, <b>staging</b> as a production-like rehearsal, <b>production</b> for real users. Keeping them separate prevents experiments from breaking live systems.</p>`)}
  ${iq('Intermediate','What are environment variables and secrets?',`<p>Configuration passed to an app from its environment (e.g. database URL, API keys) rather than hard-coded &mdash; so the same build runs differently per environment. Secrets (passwords, keys) are sensitive env config kept out of source control and injected securely.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Core concepts</h3>
  ${iq('Intermediate','Synchronous vs asynchronous?',`<p><b>Synchronous</b> work blocks until it finishes; <b>asynchronous</b> work is started and the program continues, handling the result later (callback/promise/await). Async keeps apps responsive during slow I/O like network or disk.</p>`)}
  ${iq('Advanced','Process vs thread?',`<p>A <b>process</b> is an independent program with its own memory; a <b>thread</b> is a unit of execution inside a process, sharing that process memory. Threads are lighter and share data easily, but shared memory needs careful synchronisation.</p>`)}
  ${iq('Intermediate','What does an operating system do?',`<p>It manages hardware and resources for programs: scheduling the CPU, allocating memory, handling files and devices, and providing isolation and security between processes.</p>`)}
  ${iq('Intermediate','Monolith vs microservices?',`<p>A <b>monolith</b> is one deployable application &mdash; simple to build and deploy, harder to scale and change in parts. <b>Microservices</b> split it into small independently deployable services &mdash; flexible and scalable, but with added network, data and operational complexity. Start simple; split when you must.</p>`)}
  ${iq('Beginner','SQL vs NoSQL, briefly?',`<p><b>SQL</b> databases store structured data in related tables with a fixed schema and strong consistency. <b>NoSQL</b> (document, key-value, graph) trades some structure for flexible schemas and horizontal scale. Choose by data shape and access pattern.</p>`)}

  <div class="foot" style="margin-top:30px"><span></span><button class="f-btn f-next" onclick="go('${order[0]}')">Back to the course &rarr;</button></div>`;
}
lessons['interview'] = { short: 'Interview Q&A', where: '<b>Interview Q&A</b>', render: renderInterview };


/* ---------- boot ---------- */
computeTotals();
go((function(){try{var l=localStorage.getItem('devfund_last');return (l&&lessons[l])?l:'00';}catch(e){return '00';}})());

/* Re-entry hook: see the matching comment in public/app.js / public/ba.js / public/qa.js. */
window.__devfundReinit = function () {
  const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
  buildNav();
  computeTotals();
  go(curCh || order[0] || '00');
};
