/* ============================================================
   Developer Track — DevOps course engine
   Fifth of six Developer courses. Mirrors public/django.js /
   public/fastapi.js: manifest, lessons, progress tracking,
   search, cheat sheet, glossary. Practice is qMC (predict
   behaviour/correctness) + qScenario (write config/commands by
   hand, compare with a model answer) — a real Linux host,
   Docker daemon, and CI/CD pipeline aren't feasible to run live
   in-browser, same reasoning as Django and FastAPI.
   ============================================================ */

document.getElementById('loader').style.display = 'none';

/* ---------- glossary ---------- */
const glossary = {
  permissions: { short: 'Rules controlling who can read, write, or execute a file.', long: "File permissions determine, separately for the file's owner, its group, and everyone else, whether they can read it, write to it, or execute it, the foundation of Linux security." },
  docker_image: { short: 'A packaged, read-only template containing an app and everything it needs to run.', long: 'A Docker image is a built, immutable snapshot: your application code plus its exact dependencies and configuration, ready to be started as a container anywhere Docker runs, identically every time.' },
  docker_container: { short: 'A running instance of a Docker image.', long: 'A container is what you get when you actually run an image: a live, isolated process (or set of processes) with its own filesystem view, started from that image\'s frozen template.' },
  volume: { short: "A way to persist data outside a container's own filesystem.", long: "A Docker volume stores data outside any single container's own writable layer, so that data survives even if the container is stopped, removed, and recreated from the same image." },
  compose: { short: 'A tool for defining and running multi-container applications from one config file.', long: 'Docker Compose lets you describe an entire multi-container application (a web app, a database, a cache) in one YAML file, then start, stop, and rebuild the whole thing with a single command.' },
  load_balancing: { short: 'Distributing incoming requests across multiple servers so none gets overwhelmed.', long: 'Load balancing spreads incoming traffic across several running instances of an application, so no single instance handles more than its share, and traffic can keep flowing even if one instance goes down.' },
  tls: { short: 'The encryption protocol behind HTTPS, protecting data in transit.', long: 'TLS (Transport Layer Security) encrypts the connection between a client and a server, so data traveling between them cannot be read or tampered with by anyone intercepting it in transit, the "S" in HTTPS.' },
  infra_as_code: { short: 'Defining and managing infrastructure through versioned config files, not manual setup.', long: 'Infrastructure as Code means describing servers, networks, and other infrastructure in version-controlled configuration files, so infrastructure can be recreated reliably and reviewed like any other code change, instead of being manually clicked together and only living in one person\'s memory.' },
  horizontal_scaling: { short: 'Handling more load by adding more instances, rather than a bigger single instance.', long: 'Horizontal scaling adds more running copies of an application to handle increased load, spread across a load balancer, as opposed to vertical scaling, which makes one single instance more powerful (more CPU/RAM).' },
  monitoring: { short: "Continuously observing a system's health and performance to catch problems early.", long: 'Monitoring collects ongoing metrics (response times, error rates, resource usage) about a running system, so problems can be caught and understood before, or as, they start affecting real users, rather than only learning about them from customer complaints.' },
};
function term(w, label) {
  const g = glossary[w];
  return `<span class="term" tabindex="0" role="button" aria-label="${label || w}, glossary term, press Enter to read more" onclick="devopsMore('${w}',this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();devopsMore('${w}',this)}">${label || w}<span class="tip">${g.short}<br><span style="color:#7fd8cb;font-size:11px">press Enter or click to read more</span></span></span>`;
}
function devopsMore(w, el) {
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
    <textarea class="scenario-ed" id="ed-${id}" placeholder="Write your own answer (config, commands, or reasoning) here, then compare it with a model answer. This is not auto-graded, you judge for yourself."></textarea>
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
try { PROG = JSON.parse(localStorage.getItem('devops_progress') || '{}'); } catch (_) { PROG = {}; }
function markProg(ch, id) { if (!ch) return; if (!PROG[ch]) PROG[ch] = {}; PROG[ch][id] = true; try { localStorage.setItem('devops_progress', JSON.stringify(PROG)); } catch (_) { } updateCourse(); }
function overallSolved() { let n = 0; for (const c in PROG) { n += Object.keys(PROG[c]).length; } return n; }
function updateCourse() {
  const el = document.getElementById('courseProg'); const fill = document.getElementById('courseProgFill'); const n = overallSolved();
  const done = TOTAL_Q > 0 && n >= TOTAL_Q;
  if (el) el.textContent = TOTAL_Q ? (done ? `Course complete — ${n} / ${TOTAL_Q} solved` : `Overall: ${n} / ${TOTAL_Q} solved`) : '';
  if (fill) fill.style.width = TOTAL_Q ? ((n / TOTAL_Q) * 100) + '%' : '0%';
  if (done) celebrateOnce();
}
function celebrateOnce() {
  let shown = false; try { shown = localStorage.getItem('devops_celebrated') === '1'; } catch (_) { }
  if (shown) return;
  try { localStorage.setItem('devops_celebrated', '1'); } catch (_) { }
  const t = document.createElement('div'); t.className = 'celebrate-toast';
  t.innerHTML = '<b>Every chapter solved.</b><br>You have worked through the whole DevOps course. The Capstone Project is next.';
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('show'); }, 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 6000);
}
function computeTotals() { const sq = qCount; TOTAL_Q = 0; for (const k in lessons) { qCount = 0; try { lessons[k].render(); } catch (_) { } TOTAL_Q += qCount; } qCount = sq; for (const kk in answers) delete answers[kk]; updateCourse(); }
function resetProgress() { if (!window.confirm('Reset all solved progress across every chapter? This cannot be undone.')) return; PROG = {}; try { localStorage.removeItem('devops_progress'); } catch (_) { } updateCourse(); if (curCh) go(curCh); }
function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('navOverlay').classList.toggle('show'); }
function closeMenu() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('navOverlay').classList.remove('show'); }

/* ---------- navigation ---------- */
const manifest = [
  { p: 'Groundwork', items: [['00', 'What DevOps actually is', 1], ['0b', 'The DevOps toolkit overview', 1], ['0i', 'Meet the project: deploying TastyGo for real', 1]] },
  { p: 'Part I · Linux & the command line', items: [['01', 'Essential Linux commands', 1], ['02', 'File permissions and users', 1], ['03', 'Processes and system resources', 1], ['04', 'Environment variables and secrets', 1]] },
  { p: 'Part II · Docker fundamentals', items: [['05', 'Why Docker, in real depth', 1], ['06', 'Writing a Dockerfile', 1], ['07', 'Building and running images', 1], ['08', 'Volumes and persistence', 1]] },
  { p: 'Part III · Docker Compose', items: [['09', 'Why multiple containers', 1], ['10', 'docker-compose.yml basics', 1], ['11', 'Networking between containers', 1], ['12', 'Environment-specific compose files', 1]] },
  { p: 'Part IV · Reverse proxies, hands-on', items: [['13', 'Configuring nginx as a reverse proxy', 1], ['14', 'Load balancing across instances', 1], ['15', 'HTTPS/TLS termination', 1], ['16', 'Serving static files efficiently', 1]] },
  { p: 'Part V · CI/CD pipelines', items: [['17', 'Anatomy of a CI/CD pipeline', 1], ['18', 'Writing a GitHub Actions workflow', 1], ['19', 'Automated testing in the pipeline', 1], ['20', 'Automated deployment (CD)', 1]] },
  { p: 'Part VI · Cloud & infrastructure', items: [['21', 'Cloud provider basics, revisited', 1], ['22', 'Infrastructure as Code', 1], ['23', 'Managed vs. self-hosted databases', 1], ['24', 'Scaling: vertical vs. horizontal', 1]] },
  { p: 'Part VII · Monitoring & incidents', items: [['25', 'Logging: what to log, and why', 1], ['26', 'Monitoring and alerting', 1], ['27', 'Incident response basics', 1]] },
  { p: 'Part VIII · Bringing it together', items: [['28', "A complete deployment architecture for TastyGo", 1], ['29', 'Where to go next: the Capstone Project', 1]] },
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
  try { localStorage.setItem('devops_last', num); } catch (_) {}
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
  short: 'What DevOps is', where: 'Groundwork · <b>What DevOps actually is</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 00</div>
  <h2 class="title">What DevOps actually is</h2>
  <p class="lead">DevOps is often mistaken for a job title or a toolset. It's really a culture and set of practices, breaking down the wall between "writing code" and "running it in production."</p>
  <hr class="rule">
  <p class="body">Before DevOps became common practice, developers wrote code and "threw it over the wall" to a separate operations team to actually deploy and run, each blaming the other when something broke in production. DevOps merges these responsibilities: the people building software also own, at least in part, how it runs for real, closing the gap between "it works on my machine" and "it works for real users."</p>
  <div class="analogy"><div class="lab">The plain-language version</div><div class="txt">Imagine a restaurant where the chefs cook food but have zero visibility into whether customers actually enjoy it, and a completely separate team serves it with no understanding of how it was made. DevOps is closer to a kitchen where the same people (or tightly connected teams) care about both the cooking and the customer's actual experience, automating the repetitive parts so they can focus on both well.</div></div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Treating "DevOps" as just a job title for one specific person.</b> It's better understood as a set of practices and shared responsibility a whole team adopts, not a role that absolves everyone else of caring about deployment.</li>
    <li><b>Reducing DevOps to "knows Docker and CI/CD."</b> Tools support DevOps practices; the underlying goal, fast, safe, reliable delivery of working software, is the actual point.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">DevOps is a culture of shared ownership between building and running software, supported by tools and automation, not a job title or a specific toolset in itself.</p>
  ${qMC('q1', 'easy', 'What best describes DevOps?',
    ['A specific programming language', 'A culture and set of practices merging development and operations responsibilities, supported by automation and tools', 'A replacement for QA testing'],
    1, 'DevOps is fundamentally about shared ownership and closing the gap between building software and running it reliably, with tools serving that goal rather than being the goal itself.')}
`
};

lessons['0b'] = {
  short: 'The DevOps toolkit', where: 'Groundwork · <b>The DevOps toolkit overview</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0b</div>
  <h2 class="title">The DevOps toolkit overview</h2>
  <p class="lead">This course goes deep on a specific, practical toolkit, each solving a distinct real problem in getting software running reliably.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">What's ahead, and why</div>
    <div class="qb-row"><span class="qb-kw kw-p">Docker</span><span class="qb-mean">packaging an app so it runs identically everywhere, first introduced conceptually in the Fundamentals course</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">nginx</span><span class="qb-mean">a real reverse proxy configuration, not just the concept from Fundamentals chapter 23</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">CI/CD (GitHub Actions)</span><span class="qb-mean">automatically testing and deploying every code change, building on the QA and Python courses' testing chapters</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Monitoring &amp; logging</span><span class="qb-mean">knowing what's actually happening in a running system before customers have to tell you</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Trying to learn every DevOps tool that exists.</b> The landscape is huge; this course focuses on the small, foundational set that covers the large majority of real, everyday needs.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This course covers Docker, nginx, CI/CD, cloud/infrastructure basics, and monitoring/logging, in real depth, the practical core of everyday DevOps work.</p>
  ${qMC('q1', 'easy', 'What is this course\'s general approach to the wide DevOps tooling landscape?',
    ['Cover every DevOps tool that exists, briefly', 'Focus on a small, foundational toolkit (Docker, nginx, CI/CD, monitoring) in real depth, covering most everyday needs', 'Skip tools entirely and only cover theory'],
    1, 'Given how vast the DevOps tooling landscape is, this course deliberately focuses depth on a foundational, widely-applicable set rather than shallow breadth across everything.')}
`
};

lessons['0i'] = {
  short: 'Meet the project', where: 'Groundwork · <b>Meet the project: deploying TastyGo for real</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0i</div>
  <h2 class="title">Meet the project: deploying TastyGo for real</h2>
  <p class="lead">Same TastyGo backend built in the Python, Django, and FastAPI courses. This course takes it from "runs on my machine" to "runs reliably for real users."</p>
  <hr class="rule">
  <p class="body">By chapter 28, you'll have designed a complete deployment architecture: TastyGo's backend containerized with Docker, multiple instances behind an nginx reverse proxy handling HTTPS and load balancing, deployed via an automated CI/CD pipeline, with logging and monitoring in place, exactly what the Capstone Project asks you to actually build.</p>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This course's arc mirrors a real deployment journey: from a single script running locally to a containerized, load-balanced, automatically deployed, monitored system.</p>
  ${qMC('q1', 'easy', 'By the end of this course, what will you have designed for TastyGo?', ['A brand new frontend design', 'A complete, real deployment architecture: containerized, load-balanced, automatically deployed, and monitored', 'A new database schema'], 1, 'This course builds toward one concrete, practical outcome: a real, production-shaped deployment architecture for the backend built in earlier courses.')}
`
};

lessons['01'] = {
  short: 'Essential Linux commands', where: 'Part I · <b>Essential Linux commands</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 01</div>
  <h2 class="title">Essential Linux commands</h2>
  <p class="lead">Nearly every real server runs Linux. A small set of commands covers the large majority of everyday DevOps work, building directly on the Fundamentals course's "shape" of terminal commands.</p>
  <hr class="rule">
  <pre class="code">ls -la              # list files, including hidden ones, in detail
cd /var/log         # change directory
cat app.log         # print a file's contents
tail -f app.log      # watch a file for new lines in real time
grep "ERROR" app.log # search a file's contents for a pattern
df -h               # disk space, human-readable</pre>
  <p class="body"><code class="inl">tail -f</code> is especially useful for DevOps work: watching a log file update live as a deployed application actually runs, exactly what you'd do while investigating a problem in real time.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting -f on tail while trying to watch logs live.</b> Plain tail just shows the last few lines once; -f keeps following the file as new lines are appended.</li>
  </ul></div>
  <div class="sec-num">1.1</div><h3 class="section-h">Recap</h3>
  <p class="body">ls, cd, cat, tail -f, grep, and df cover most everyday Linux server navigation and investigation tasks.</p>
  ${qScenario('q1', 'easy', 'You suspect TastyGo\'s backend is throwing errors right now. Write the command to watch its log file live and filter for lines containing "ERROR".',
    'tail -f app.log | grep "ERROR" — tail -f follows the file live as new lines are written, and piping to grep filters for only the lines containing "ERROR".')}
`
};

lessons['02'] = {
  short: 'Permissions & users', where: 'Part I · <b>File permissions and users</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 02</div>
  <h2 class="title">File permissions and users</h2>
  <p class="lead">${term('permissions', 'Permissions')} decide, separately for the owner, a group, and everyone else, what can actually be done with a file.</p>
  <hr class="rule">
  <pre class="code">$ ls -l deploy.sh
-rwxr-xr-- 1 alice devops 220 Jun 1 deploy.sh
# owner (alice): read, write, execute
# group (devops): read, execute
# everyone else: read only

$ chmod +x deploy.sh   # add execute permission
$ chown alice:devops deploy.sh   # change owner and group</pre>
  <p class="body">The three characters after the first (<code class="inl">rwx</code>) repeat three times: owner, group, others. <code class="inl">r</code> (read), <code class="inl">w</code> (write), <code class="inl">x</code> (execute), each either present or replaced with a dash.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Running chmod 777 (full permissions for everyone) "to make an error go away."</b> This is a common but genuinely risky shortcut, granting far more access than almost anything actually needs.</li>
    <li><b>Forgetting a script needs execute permission to run directly.</b> A file can be perfectly readable but still fail to run as a program without the execute bit set.</li>
  </ul></div>
  <div class="sec-num">2.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Permissions (read/write/execute) apply separately to a file's owner, group, and everyone else. chmod changes permissions; chown changes ownership.</p>
  ${qMC('q1', 'easy', 'Why is running chmod 777 on a file "to make an error go away" generally considered risky?',
    ['It has no real effect', 'It grants full read/write/execute access to absolutely everyone, far more than almost anything actually needs', '777 is not a valid chmod value'],
    1, '777 grants unrestricted access to the owner, group, and everyone else simultaneously, usually far more permissive than the actual problem requires, and a common source of real security issues.')}
`
};

lessons['03'] = {
  short: 'Processes & resources', where: 'Part I · <b>Processes and system resources</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 03</div>
  <h2 class="title">Processes and system resources</h2>
  <p class="lead">Building directly on the Fundamentals course's "programs, processes, and the OS" chapter, here's how to actually observe and manage processes on a real server.</p>
  <hr class="rule">
  <pre class="code">$ ps aux | grep gunicorn        # find a running process
alice   4821  0.3  1.2  ... gunicorn main:app

$ top                            # live view of CPU/memory usage per process
$ kill 4821                      # stop a process by its ID (PID)
$ kill -9 4821                   # force-stop an unresponsive process</pre>
  <p class="body"><code class="inl">ps aux</code> and <code class="inl">top</code> answer "what's actually running, and how much of the machine's resources is it using," essential for diagnosing a server that's slow or unresponsive. <code class="inl">kill</code> (and <code class="inl">kill -9</code> as a last resort) stops a process by its process ID.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Reaching for kill -9 by default.</b> A plain kill asks a process to shut down cleanly; -9 force-kills it immediately, potentially leaving work half-done. Try a plain kill first.</li>
  </ul></div>
  <div class="sec-num">3.1</div><h3 class="section-h">Recap</h3>
  <p class="body">ps aux and top show running processes and resource usage; kill (a clean request) and kill -9 (a forced stop) manage them, with a plain kill preferred first.</p>
  ${qMC('q1', 'easy', 'Why try a plain kill before kill -9 on a misbehaving process?',
    ['kill -9 is always safer', 'A plain kill lets the process shut down cleanly, potentially finishing in-progress work; kill -9 force-terminates it immediately, which can leave things half-done', 'kill -9 is required for all processes'],
    1, 'A regular kill sends a signal the process can respond to and shut down gracefully; -9 skips that entirely, immediately terminating it, which can interrupt work mid-operation.')}
`
};

lessons['04'] = {
  short: 'Env vars & secrets', where: 'Part I · <b>Environment variables and secrets</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 04</div>
  <h2 class="title">Environment variables and secrets</h2>
  <p class="lead">Directly building on the Django course's production-settings chapter, here's how secrets actually get into a running application without ever being committed to code.</p>
  <hr class="rule">
  <pre class="code">$ export DATABASE_URL="postgres://user:pass@db.internal:5432/tastygo"
$ export SECRET_KEY="a-real-random-secret"

# read inside the application:
import os
db_url = os.environ["DATABASE_URL"]</pre>
  <p class="body">An environment variable is set outside the application's own code, at the OS or deployment-platform level, and read at runtime. This keeps secrets out of version control entirely: the code only ever references the variable's name, never the actual secret value.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Committing a .env file containing real secrets to version control.</b> Even a file meant only for local convenience becomes a real leak once committed; it should typically be listed in .gitignore.</li>
    <li><b>Hardcoding a secret directly "just for now."</b> This is precisely how secrets end up in a repository's permanent history, discoverable long after being "temporarily" added.</li>
  </ul></div>
  <div class="sec-num">4.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Environment variables inject configuration and secrets at runtime, from outside the code, keeping real secret values out of version control entirely.</p>
  ${qMC('q1', 'easy', 'Why read a secret like DATABASE_URL from an environment variable instead of hardcoding it in the source file?',
    ['Environment variables are always faster to read', 'It keeps the real secret value out of version control, since the code only ever references the variable\'s name', 'Python cannot read hardcoded strings'],
    1, 'The code committed to version control never contains the actual secret; only the reference to an environment variable name, which is populated separately and safely at deploy time.')}
`
};

lessons['05'] = {
  short: 'Why Docker, revisited', where: 'Part II · <b>Why Docker, in real depth</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 05</div>
  <h2 class="title">Why Docker, in real depth</h2>
  <p class="lead">Fundamentals chapter 22 introduced ${term('docker_container', 'containers')} conceptually. Here's the actual problem Docker solves, and how it solves it.</p>
  <hr class="rule">
  <p class="body">"It works on my machine" happens because a machine's exact environment, OS version, installed libraries, environment variables, is never perfectly identical between a developer's laptop, a teammate's laptop, and the actual production server. A ${term('docker_image', 'Docker image')} packages an application together with its exact dependencies and runtime, so the same image runs identically anywhere Docker itself is installed, a laptop, a teammate's machine, or a cloud server.</p>
  <div class="analogy"><div class="lab">The plain-language version</div><div class="txt">A Docker image is like a fully-stocked shipping container: everything the app needs is packed inside, so it doesn't matter what kind of ship (which underlying server/OS) is carrying it, the contents work identically once it's opened.</div></div>
  <p class="body">A container is not a full virtual machine: it shares the host machine's underlying kernel, making it far lighter and faster to start than a VM, while still isolating the application's files, processes, and network from everything else running on the host.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Thinking a container is a lightweight virtual machine.</b> It shares the host OS kernel rather than virtualizing an entire separate OS, which is exactly why it starts in milliseconds rather than minutes.</li>
  </ul></div>
  <div class="sec-num">5.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Docker solves environment inconsistency by packaging an app with its exact dependencies into a portable image, run as a lightweight, isolated container sharing the host's kernel.</p>
  ${qMC('q1', 'med', 'Why does a Docker container start much faster than a full virtual machine?', ['Containers use no CPU at all', "A container shares the host machine's kernel instead of virtualizing an entire separate operating system", 'Containers are not actually isolated from each other'], 1, "Because a container reuses the host's existing kernel rather than booting a whole separate OS, it starts in milliseconds, unlike a full VM.")}
`
};

lessons['06'] = {
  short: 'Writing a Dockerfile', where: 'Part II · <b>Writing a Dockerfile</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 06</div>
  <h2 class="title">Writing a Dockerfile</h2>
  <p class="lead">A Dockerfile is a plain-text recipe: the exact steps Docker follows to build an image from your application's code.</p>
  <hr class="rule">
  <pre class="code">FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]</pre>
  <p class="body">Each line is a build instruction, executed top to bottom. <code class="inl">FROM</code> picks a starting base image (here, a slim Python environment). <code class="inl">WORKDIR</code> sets the working directory inside the image. <code class="inl">COPY</code> copies files from your project into the image. <code class="inl">RUN</code> executes a command during the build (installing dependencies). <code class="inl">CMD</code> is the command that runs when a container actually starts from this image.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Copying requirements.txt and the rest of the code in one single COPY step.</b> Copying dependencies first and installing them before copying the rest of the code lets Docker reuse ("cache") that slow install step on future builds, as long as dependencies haven't changed, dramatically speeding up rebuilds.</li>
    <li><b>Confusing RUN and CMD.</b> RUN executes once, during the image build itself (like installing packages); CMD defines what happens each time a container is actually started from the finished image.</li>
  </ul></div>
  <div class="sec-num">6.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A Dockerfile's instructions build an image step by step: FROM (base), WORKDIR, COPY, RUN (build-time), and CMD (what runs when the container starts).</p>
  ${qMC('q1', 'med', "Why copy requirements.txt and run pip install before copying the rest of the application's code?", ['It has no effect on build speed', 'Docker can reuse the cached dependency-install step on future builds as long as requirements.txt itself hasn\'t changed, making rebuilds much faster', 'Dependencies must always be installed last'], 1, "Ordering the Dockerfile so dependencies are installed before the rest of the (more frequently changing) code is copied lets Docker's build cache skip re-running the slow install step on every single rebuild.")}
  ${qScenario('q2', 'med', "Write a one-line explanation of what CMD does differently from RUN in a Dockerfile.", "RUN executes a command once, during the image build itself (for example, installing dependencies); CMD specifies the command that runs every time a new container is started from the finished image (for example, starting the actual web server).")}
`
};

lessons['07'] = {
  short: 'Building & running images', where: 'Part II · <b>Building and running images</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 07</div>
  <h2 class="title">Building and running images</h2>
  <p class="lead">With a Dockerfile written, two commands take it from recipe to a running application: build, then run.</p>
  <hr class="rule">
  <pre class="code">$ docker build -t tastygo-api .
$ docker images
REPOSITORY    TAG      IMAGE ID       SIZE
tastygo-api   latest   3f8a9c2d1e4b   142MB

$ docker run -p 8000:8000 tastygo-api
$ docker ps
CONTAINER ID   IMAGE         PORTS                    STATUS
7a1b2c3d4e5f   tastygo-api   0.0.0.0:8000->8000/tcp   Up 2 minutes</pre>
  <p class="body"><code class="inl">docker build -t tastygo-api .</code> builds an image from the Dockerfile in the current directory, tagging it <code class="inl">tastygo-api</code>. <code class="inl">docker run -p 8000:8000 tastygo-api</code> starts a container from that image, mapping port 8000 on your machine to port 8000 inside the container, exactly how the outside world actually reaches an app running inside a container.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting -p entirely, then wondering why the app is unreachable.</b> A container's ports are isolated by default; -p host:container explicitly maps a port through to the outside.</li>
  </ul></div>
  <div class="sec-num">7.1</div><h3 class="section-h">Recap</h3>
  <p class="body">docker build creates an image from a Dockerfile; docker run starts a container from it, with -p mapping a container's internal port to a reachable port on the host.</p>
  ${qMC('q1', 'easy', 'What does -p 8000:8000 in "docker run -p 8000:8000 tastygo-api" actually do?', ['Sets the image size limit to 8000MB', "Maps port 8000 on the host machine to port 8000 inside the container, so the app becomes reachable from outside", 'Runs the container 8000 times'], 1, "A container's internal ports are isolated by default; -p host:container explicitly connects a port on the host machine through to a port inside the running container.")}
`
};

lessons['08'] = {
  short: 'Volumes & persistence', where: 'Part II · <b>Volumes and persistence</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 08</div>
  <h2 class="title">Volumes and persistence</h2>
  <p class="lead">A container's own filesystem is thrown away when the container is removed. ${term('volume', 'Volumes')} are how real data survives that.</p>
  <hr class="rule">
  <pre class="code">$ docker run -v tastygo-db-data:/var/lib/postgresql/data postgres:16</pre>
  <p class="body">Without a volume, TastyGo's database would lose every row the moment its container was removed or recreated, exactly the situation you don't want for real customer and order data. <code class="inl">-v tastygo-db-data:/var/lib/postgresql/data</code> mounts a named volume (managed by Docker, living outside any single container) at that path inside the container, so the data survives container restarts, removals, and even image updates.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming a database container's data is automatically safe.</b> Without an explicit volume, a container's writable filesystem is exactly as temporary as the container itself.</li>
    <li><b>Confusing a bind mount (a specific host folder) with a named volume (managed by Docker).</b> Both persist data outside the container, but a named volume is the more portable, Docker-managed default for most production database use.</li>
  </ul></div>
  <div class="sec-num">8.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A container's own filesystem disappears with the container. Volumes store data outside that lifecycle, essential for anything, like a database, that must survive container restarts and rebuilds.</p>
  ${qMC('q1', 'med', "Why does TastyGo's Postgres container need an explicit volume, rather than just writing to its own internal filesystem?", ["It doesn't, containers persist data automatically", "A container's own writable filesystem is deleted along with the container; a volume stores the data separately so it survives removal and recreation", 'Volumes make the database run faster, nothing to do with persistence'], 1, "Without an explicit volume, a database container's data would vanish the instant that container was removed or recreated, since a container's own filesystem is exactly as temporary as the container itself.")}
`
};

lessons['09'] = {
  short: 'Why multiple containers', where: 'Part III · <b>Why multiple containers</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 09</div>
  <h2 class="title">Why multiple containers</h2>
  <p class="lead">A real deployment of TastyGo isn't one container: it's several, each doing one job, running together.</p>
  <hr class="rule">
  <p class="body">TastyGo's real deployment needs at minimum: the API application itself, a Postgres database, and likely a cache like Redis. Cramming all three into a single container is possible but goes against a core Docker principle, one container, one concern, making each piece harder to update, scale, or replace independently. Instead, each runs in its own container, and they're connected together to form one working system.</p>
  <div class="analogy"><div class="lab">The plain-language version</div><div class="txt">Think of a restaurant kitchen with a dedicated chef for grilling, another for salads, and another for desserts, rather than one person doing everything alone. Each specializes, can be replaced or scaled independently, and the kitchen as a whole still produces one coherent meal.</div></div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Running the database inside the same container as the application.</b> This makes scaling the app (running more copies) and managing the database's data lifecycle much harder, since they're now tied together.</li>
  </ul></div>
  <div class="sec-num">9.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Real applications are usually made of several single-purpose containers (app, database, cache) working together, not one container doing everything.</p>
  ${qMC('q1', 'easy', 'Why run TastyGo\'s API and its Postgres database in separate containers rather than one combined container?', ['Separate containers use less disk space', 'Each container can then be updated, scaled, or replaced independently, following the "one container, one concern" principle', 'Docker does not allow databases inside containers'], 1, 'Keeping each concern in its own container means the API can be scaled to multiple instances, or updated, without touching the database\'s own lifecycle, and vice versa.')}
`
};

lessons['10'] = {
  short: 'docker-compose.yml basics', where: 'Part III · <b>docker-compose.yml basics</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 10</div>
  <h2 class="title">docker-compose.yml basics</h2>
  <p class="lead">${term('compose', 'Docker Compose')} describes an entire multi-container application in one file, then starts, stops, and rebuilds it with one command each.</p>
  <hr class="rule">
  <pre class="code">services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/tastygo
    depends_on:
      - db
  db:
    image: postgres:16
    volumes:
      - tastygo-db-data:/var/lib/postgresql/data

volumes:
  tastygo-db-data:</pre>
  <pre class="code">$ docker compose up -d      # start every service, in the background
$ docker compose down       # stop and remove every service
$ docker compose logs -f api   # follow one service's logs</pre>
  <p class="body">Each entry under <code class="inl">services</code> becomes its own container. <code class="inl">depends_on</code> tells Compose to start <code class="inl">db</code> before <code class="inl">api</code>. The whole multi-container application starts or stops together with one command, instead of manually running several separate <code class="inl">docker run</code> commands in the right order every time.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming depends_on waits for the database to be fully ready, not just started.</b> depends_on only orders container start-up; the application itself typically still needs its own retry logic for the brief window before the database is actually accepting connections.</li>
  </ul></div>
  <div class="sec-num">10.1</div><h3 class="section-h">Recap</h3>
  <p class="body">docker-compose.yml describes every service (api, db, etc.) in one file; docker compose up/down starts and stops the whole application together.</p>
  ${qMC('q1', 'med', 'Does depends_on in docker-compose.yml guarantee the database is fully ready to accept connections before the API container starts?', ['Yes, completely', 'No, it only orders container start-up; the application typically still needs its own retry logic for the brief window before the database is actually ready', 'depends_on has no effect on start order at all'], 1, 'depends_on controls the order containers are started in, not whether the service inside is actually finished initializing, so a short gap can still exist where the database container has started but isn\'t yet accepting connections.')}
`
};

lessons['11'] = {
  short: 'Networking between containers', where: 'Part III · <b>Networking between containers</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 11</div>
  <h2 class="title">Networking between containers</h2>
  <p class="lead">Notice <code class="inl">DATABASE_URL=postgres://user:pass@db:5432/tastygo</code> from the last chapter used <code class="inl">db</code>, not an IP address. Here's why that works.</p>
  <hr class="rule">
  <p class="body">Docker Compose automatically creates a private network shared by every service in the same file, and gives each service a hostname matching its name in the YAML. The <code class="inl">api</code> service can reach the database simply by using the hostname <code class="inl">db</code>, exactly as if it were a real server name, no manual IP configuration, port-forwarding, or hardcoded addresses required.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Trying to reach another container using localhost.</b> Inside a container, localhost refers to that container itself, not to a sibling container; you need the sibling's service name from docker-compose.yml instead.</li>
  </ul></div>
  <div class="sec-num">11.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Compose gives every service its own hostname on a shared private network, matching its name in the YAML file, so services reach each other by name rather than by IP address.</p>
  ${qMC('q1', 'med', 'Why does the api service in docker-compose.yml connect to postgres://...@db:5432/... using the hostname "db" instead of an IP address?', ['Docker requires all connections to use the word "db"', 'Compose automatically gives each service a hostname matching its name in the YAML, on a shared private network', 'It is a coincidence; any hostname would work identically'], 1, 'Docker Compose creates a private network for every service defined in the same file and resolves each service\'s name to its container automatically, so "db" reliably refers to the database service.')}
`
};

lessons['12'] = {
  short: 'Env-specific compose files', where: 'Part III · <b>Environment-specific compose files</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 12</div>
  <h2 class="title">Environment-specific compose files</h2>
  <p class="lead">Local development and production usually need slightly different setups, hot-reloading locally, real resource limits and no debug tools in production.</p>
  <hr class="rule">
  <pre class="code"># docker-compose.yml  (shared base)
# docker-compose.override.yml  (auto-applied locally, e.g. mounts source code for hot reload)
# docker-compose.prod.yml      (applied explicitly in production)

$ docker compose up                                   # dev: base + override, automatically
$ docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d   # prod: base + prod file</pre>
  <p class="body">Compose supports layering multiple files: a shared base plus an environment-specific overlay. Locally, <code class="inl">docker-compose.override.yml</code> is applied automatically (useful for mounting live source code so changes reflect instantly). In production, you explicitly combine the base file with a production-specific one (resource limits, no debug mode, real environment variables).</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Accidentally deploying local development settings (like debug mode) to production.</b> Keeping dev-only convenience settings in an override file that's never referenced in the production command line avoids this entirely.</li>
  </ul></div>
  <div class="sec-num">12.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Layering a shared base compose file with environment-specific overlays (an automatic local override, an explicit production file) keeps dev convenience and production correctness both possible without duplicating the whole config.</p>
  ${qScenario('q1', 'med', 'Explain in one or two sentences why keeping debug-mode settings only in docker-compose.override.yml (not the base file) helps avoid accidentally shipping debug mode to production.', 'The override file is only applied automatically during local development and is never referenced in the production deploy command, so anything placed only there (like debug mode) simply never reaches production, unlike settings placed in the shared base file, which apply everywhere by default.')}
`
};

lessons['13'] = {
  short: 'nginx as a reverse proxy', where: 'Part IV · <b>Configuring nginx as a reverse proxy</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 13</div>
  <h2 class="title">Configuring nginx as a reverse proxy</h2>
  <p class="lead">Fundamentals chapter 21 explained what a reverse proxy is conceptually. Here's an actual nginx config doing that job for TastyGo.</p>
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
  <p class="body">This tells nginx: for any request to <code class="inl">api.tastygo.com</code>, forward it to the actual application running on port 8000, and pass along the original Host header and the real client IP (since, from the app's point of view, every request would otherwise appear to come from nginx itself). The client never talks to the application directly, only to nginx, which sits in front of it.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting proxy_set_header X-Real-IP.</b> Without it, the application sees every request as coming from nginx's own IP, breaking anything relying on the real client's IP (like rate limiting or logging).</li>
  </ul></div>
  <div class="sec-num">13.1</div><h3 class="section-h">Recap</h3>
  <p class="body">An nginx reverse proxy config forwards matching requests to the real application (proxy_pass), while passing along the original host and client IP so the application can still see them accurately.</p>
  ${qMC('q1', 'med', "Why does the nginx config include proxy_set_header X-Real-IP $remote_addr?", ['It is required syntax with no functional effect', 'Without it, the application would see every request as coming from nginx\'s own IP rather than the real client, breaking anything relying on the true client IP', 'It encrypts the connection'], 1, "Since nginx sits between the client and the application, the application would otherwise only ever see nginx's IP as the source of every request; this header preserves the real client IP for the application to use.")}
`
};

lessons['14'] = {
  short: 'Load balancing', where: 'Part IV · <b>Load balancing across instances</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 14</div>
  <h2 class="title">Load balancing across instances</h2>
  <p class="lead">${term('load_balancing', 'Load balancing')} means nginx doesn't just forward to one app instance, it spreads requests across several.</p>
  <hr class="rule">
  <pre class="code">upstream tastygo_api {
    server app1:8000;
    server app2:8000;
    server app3:8000;
}

server {
    listen 80;
    location / {
        proxy_pass http://tastygo_api;
    }
}</pre>
  <p class="body">The <code class="inl">upstream</code> block names a pool of app instances (three copies of the exact same TastyGo application, each in its own container). By default nginx spreads requests round-robin across them. If <code class="inl">app2</code> goes down, nginx can be configured to simply stop sending it traffic, so the other two keep serving requests without any visible interruption to real users.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming a load balancer needs different servers behind it.</b> The whole point is usually the opposite: multiple identical copies of the same application, so any one of them can serve any given request.</li>
  </ul></div>
  <div class="sec-num">14.1</div><h3 class="section-h">Recap</h3>
  <p class="body">An nginx upstream block spreads requests across multiple identical app instances, so no single instance is overwhelmed, and the system keeps serving traffic even if one instance fails.</p>
  ${qMC('q1', 'easy', "In the nginx upstream block above, what are app1, app2, and app3?", ['Three different, unrelated applications', 'Three identical instances of the same TastyGo application, each able to serve any incoming request', 'Three separate databases'], 1, "Load balancing across identical instances is exactly the point: any of the three copies of the same running application can handle any given request, and nginx distributes requests across all of them.")}
`
};

lessons['15'] = {
  short: 'HTTPS/TLS termination', where: 'Part IV · <b>HTTPS/TLS termination</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 15</div>
  <h2 class="title">HTTPS/TLS termination</h2>
  <p class="lead">${term('tls', 'TLS')} is usually handled once, at the reverse proxy, rather than inside every single application instance.</p>
  <hr class="rule">
  <pre class="code">server {
    listen 443 ssl;
    server_name api.tastygo.com;

    ssl_certificate     /etc/nginx/ssl/tastygo.crt;
    ssl_certificate_key /etc/nginx/ssl/tastygo.key;

    location / {
        proxy_pass http://tastygo_api;   # plain HTTP from here on, inside the private network
    }
}</pre>
  <p class="body">"TLS termination" means encrypted HTTPS traffic from real users is decrypted once, at nginx, using a certificate and private key nginx holds. From nginx onward, to the actual app instances, traffic can travel as plain HTTP, since that hop stays inside a private, trusted network. This avoids configuring certificates separately on every single application instance.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming "TLS termination" means encryption stops mattering entirely.</b> It means encryption is handled at one well-defended point (the proxy) rather than duplicated everywhere; the internal network still needs to actually be private and trusted for this to be safe.</li>
  </ul></div>
  <div class="sec-num">15.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TLS termination at the reverse proxy decrypts HTTPS traffic once, centrally, letting internal traffic to app instances stay plain HTTP within a trusted private network.</p>
  ${qMC('q1', 'med', 'What does "TLS termination at the reverse proxy" mean?', ['Every app instance must independently handle its own HTTPS certificate', 'HTTPS traffic is decrypted once, at nginx, and can then travel as plain HTTP to app instances over the trusted internal network', 'TLS is disabled entirely once traffic reaches nginx'], 1, 'Centralizing TLS at the proxy means certificates are managed in one place, and the app instances behind it don\'t each need their own separate HTTPS configuration.')}
`
};

lessons['16'] = {
  short: 'Serving static files', where: 'Part IV · <b>Serving static files efficiently</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 16</div>
  <h2 class="title">Serving static files efficiently</h2>
  <p class="lead">Images, CSS, and JS files don't need to go through the application at all, nginx can serve them directly, much faster.</p>
  <hr class="rule">
  <pre class="code">location /static/ {
    alias /var/www/tastygo/static/;
    expires 30d;
}

location / {
    proxy_pass http://tastygo_api;
}</pre>
  <p class="body">Requests to <code class="inl">/static/...</code> are served directly from disk by nginx, never touching the application at all, while everything else is proxied through to the app. <code class="inl">expires 30d</code> tells browsers to cache these files for 30 days, since static assets rarely change and don't need to be re-fetched on every visit.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Routing every request, including static files, through the application.</b> This wastes the application's resources on work nginx can do directly and far faster, serving a file straight from disk.</li>
  </ul></div>
  <div class="sec-num">16.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Serving static files directly from nginx, rather than routing them through the application, is faster and frees the application to focus on real request logic.</p>
  ${qMC('q1', 'easy', "Why serve TastyGo's static image and CSS files directly through nginx instead of routing them through the application?", ['nginx cannot serve files at all', "nginx can serve a file straight from disk far faster, freeing the application's resources for actual request logic", 'Static files must always go through the database'], 1, 'nginx serving static content directly avoids spending the application\'s own processing resources on simple file delivery, which nginx can do more efficiently on its own.')}
`
};

lessons['17'] = {
  short: 'Anatomy of a CI/CD pipeline', where: 'Part V · <b>Anatomy of a CI/CD pipeline</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 17</div>
  <h2 class="title">Anatomy of a CI/CD pipeline</h2>
  <p class="lead">CI/CD automates what would otherwise be manual, error-prone steps every time code changes: testing it, and deploying it.</p>
  <hr class="rule">
  <p class="body">Continuous Integration (CI) means every code change is automatically built and tested, catching problems immediately rather than after they've been merged and forgotten about. Continuous Deployment/Delivery (CD) means a change that passes those checks is automatically shipped toward production, without someone manually repeating the same deploy steps by hand each time.</p>
  <div class="analogy"><div class="lab">The plain-language version</div><div class="txt">Think of a pipeline as an assembly line: code goes in one end, gets automatically checked (does it build? do the tests pass?), and, if it clears every stage, comes out the other end already deployed, with no manual hand-cranking at any step.</div></div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Treating "CI/CD" as one single thing.</b> CI (automatically testing every change) and CD (automatically deploying changes that pass) are related but distinct, and a team can have solid CI with no CD at all, deploying manually after automated tests pass.</li>
  </ul></div>
  <div class="sec-num">17.1</div><h3 class="section-h">Recap</h3>
  <p class="body">CI automatically builds and tests every code change; CD automatically ships changes that pass those checks toward production, together removing manual, repetitive, error-prone steps.</p>
  ${qMC('q1', 'easy', 'What is the key difference between Continuous Integration (CI) and Continuous Deployment (CD)?', ['They are two names for the exact same thing', 'CI automatically builds and tests every change; CD automatically deploys changes that pass those checks', 'CI only runs once a year'], 1, 'CI and CD are related but distinct stages: CI focuses on automatically verifying every change (build + tests), while CD focuses on automatically shipping verified changes onward.')}
`
};

lessons['18'] = {
  short: 'A GitHub Actions workflow', where: 'Part V · <b>Writing a GitHub Actions workflow</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 18</div>
  <h2 class="title">Writing a GitHub Actions workflow</h2>
  <p class="lead">GitHub Actions is one of the most common ways to actually implement CI/CD, triggered directly by events in a GitHub repository.</p>
  <hr class="rule">
  <pre class="code">name: TastyGo CI
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest</pre>
  <p class="body"><code class="inl">on.push.branches: [main]</code> triggers this workflow every time code is pushed to <code class="inl">main</code>. Each <code class="inl">step</code> runs in order: check out the code, set up Python, install dependencies, run the test suite. If any step fails, the whole workflow fails, and GitHub reports it directly on the commit or pull request.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Only running this workflow on pushes to main, missing problems in pull requests before merge.</b> Adding pull_request alongside push catches failing tests before code is even merged, not just after.</li>
  </ul></div>
  <div class="sec-num">18.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A GitHub Actions workflow YAML defines what triggers it (on:) and what steps run (jobs.steps), automatically executing on real repository events like a push.</p>
  ${qScenario('q1', 'med', 'Modify the "on" section of the workflow above so it runs both on pushes to main AND on every pull request, catching failures before merge.', "on:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\nAdding pull_request alongside push means the same tests run automatically on every pull request targeting main, surfacing failures before the code is even merged, not only after.")}
`
};

lessons['19'] = {
  short: 'Automated testing in the pipeline', where: 'Part V · <b>Automated testing in the pipeline</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 19</div>
  <h2 class="title">Automated testing in the pipeline</h2>
  <p class="lead">Building directly on the QA course's test pyramid and Python/FastAPI's testing chapters, here's how those same tests plug into CI.</p>
  <hr class="rule">
  <p class="body">The exact same <code class="inl">pytest</code> suite written for TastyGo's API (unit tests for individual functions, integration tests hitting a real test database, FastAPI's TestClient for endpoint tests) runs automatically on every push, in a clean, disposable environment, rather than only ever being run manually by a developer before remembering (or forgetting) to push.</p>
  <pre class="code">jobs:
  test:
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
    steps:
      - run: pytest --maxfail=1</pre>
  <p class="body">CI environments can even spin up a real, disposable test database (a <code class="inl">services</code> entry, similar in spirit to a Compose service) purely for the duration of the test run, then discard it, so integration tests run against something real without touching any actual production data.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Running tests against a shared, real database in CI.</b> A disposable, per-run test database avoids one CI run's test data corrupting another's, or ever touching real production data.</li>
  </ul></div>
  <div class="sec-num">19.1</div><h3 class="section-h">Recap</h3>
  <p class="body">CI runs the same automated test suite already written for the application, in a clean, disposable environment (including a throwaway test database), on every relevant push or pull request.</p>
  ${qMC('q1', 'med', 'Why does the CI job above spin up its own disposable Postgres "services" instance rather than reusing a shared real database?', ['Disposable databases are required by GitHub Actions for any job', 'It avoids one test run\'s data corrupting another\'s, and keeps tests from ever touching real production data', 'It makes the tests run in a different programming language'], 1, "A fresh, disposable database per CI run isolates each test run's data completely, preventing cross-contamination between runs and any risk to real production data.")}
`
};

lessons['20'] = {
  short: 'Automated deployment (CD)', where: 'Part V · <b>Automated deployment (CD)</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 20</div>
  <h2 class="title">Automated deployment (CD)</h2>
  <p class="lead">Once tests pass, CD takes over: building the Docker image and shipping it to real servers, automatically.</p>
  <hr class="rule">
  <pre class="code">jobs:
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t tastygo-api:${'${'}{ github.sha }${'}'} .
      - run: docker push registry.example.com/tastygo-api:${'${'}{ github.sha }${'}'}
      - run: ssh deploy@prod "docker compose pull && docker compose up -d"</pre>
  <p class="body"><code class="inl">needs: test</code> makes this job wait for the test job to pass first, deployment never happens on broken code. It then builds a new image tagged with the exact commit hash, pushes it to a registry, and tells the production server to pull and restart with the new image, all without a human manually running these same commands by hand each time.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Deploying without needs: test.</b> Without that dependency, a deploy job could run in parallel with, or even before, the test job finishes, potentially shipping broken code straight to production.</li>
  </ul></div>
  <div class="sec-num">20.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A CD job depends on the test job passing first, then builds, pushes, and deploys the new image automatically, removing manual, repetitive deploy steps entirely.</p>
  ${qMC('q1', 'med', 'What would happen if the deploy job did NOT have needs: test?', ['Nothing would change, needs: test has no real effect', 'The deploy job could run in parallel with or even before the tests finish, potentially shipping broken, untested code straight to production', 'The workflow would fail to parse'], 1, 'needs: test creates an explicit dependency, ensuring deployment only happens once the tests have actually passed, precisely the safeguard that prevents broken code reaching production.')}
`
};

lessons['21'] = {
  short: 'Cloud provider basics, revisited', where: 'Part VI · <b>Cloud provider basics, revisited</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 21</div>
  <h2 class="title">Cloud provider basics, revisited</h2>
  <p class="lead">Fundamentals touched on "the cloud" conceptually. Here's what actually gets used day to day when deploying something like TastyGo.</p>
  <hr class="rule">
  <p class="body">A cloud provider (AWS, Google Cloud, Azure, and similar) rents out computing resources, servers (often called "instances" or "virtual machines"), storage, managed databases, and networking, by the hour or by usage, instead of a company buying and physically maintaining its own hardware. For a project like TastyGo, this typically means a handful of running instances (or a managed container service) behind a load balancer, a managed database, and object storage for things like uploaded images.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming "the cloud" is one single thing rather than a wide menu of separate, individually-billed services.</b> Compute, storage, databases, and networking are typically separate services, each with its own cost and configuration, that you assemble together.</li>
  </ul></div>
  <div class="sec-num">21.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A cloud provider offers a menu of separately billed services (compute, storage, managed databases, networking) that are assembled together to run a real application, rather than a single monolithic product.</p>
  ${qMC('q1', 'easy', 'What best describes a cloud provider like AWS or Google Cloud?', ['A single all-in-one product with no separate components', 'A menu of separate, individually billed services (compute, storage, managed databases, networking) assembled together to run an application', 'A free service with no cost'], 1, 'Cloud providers offer a range of distinct services, each billed separately, that a team combines to build the actual infrastructure their application needs.')}
`
};

lessons['22'] = {
  short: 'Infrastructure as Code', where: 'Part VI · <b>Infrastructure as Code</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 22</div>
  <h2 class="title">Infrastructure as Code</h2>
  <p class="lead">${term('infra_as_code', 'Infrastructure as Code')} (IaC) means describing servers and infrastructure in files, not by manually clicking through a cloud provider's dashboard.</p>
  <hr class="rule">
  <pre class="code"># a simplified, illustrative example (Terraform-style)
resource "cloud_instance" "tastygo_api" {
  count = 3
  image = "tastygo-api:latest"
  size  = "small"
}</pre>
  <p class="body">Instead of a person manually creating three server instances by clicking through a dashboard (and hoping to remember the exact same settings if it ever needs to be redone), this configuration describes the desired end state, three instances of a given size, running a given image, in a version-controlled file. Running the IaC tool against this file creates (or updates) real infrastructure to match exactly what's described.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Manually changing infrastructure that's also managed by IaC.</b> A manual dashboard change and the IaC file describing the same infrastructure can drift out of sync, causing confusing, hard-to-diagnose differences later.</li>
  </ul></div>
  <div class="sec-num">22.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Infrastructure as Code describes infrastructure in version-controlled files rather than manual dashboard clicks, making it reproducible, reviewable, and far less reliant on any one person's memory.</p>
  ${qMC('q1', 'med', 'What real problem does describing infrastructure as code (rather than manual dashboard clicks) solve?', ['It makes infrastructure completely free', 'It makes infrastructure reproducible and reviewable, instead of depending on one person manually remembering the exact right settings each time', 'It removes the need for a cloud provider entirely'], 1, 'By capturing the desired infrastructure in a version-controlled file, IaC makes it possible to recreate, review, and audit infrastructure changes the same way code changes are, rather than relying on undocumented manual steps.')}
`
};

lessons['23'] = {
  short: 'Managed vs. self-hosted databases', where: 'Part VI · <b>Managed vs. self-hosted databases</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 23</div>
  <h2 class="title">Managed vs. self-hosted databases</h2>
  <p class="lead">TastyGo's database could run in its own Docker container, or as a managed service the cloud provider operates. The trade-off is real.</p>
  <hr class="rule">
  <p class="body">A self-hosted database (running yourself, in a container you manage) gives full control but means you're responsible for backups, security patches, scaling, and recovering from failures yourself. A managed database service (like Amazon RDS or Google Cloud SQL) costs more but handles backups, patching, and failover automatically, in exchange for a bit less low-level control.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming self-hosting is always cheaper.</b> It's cheaper in direct cost, but that cost is partly replaced by the ongoing engineering time spent on backups, patching, and incident response, which a managed service takes on instead.</li>
  </ul></div>
  <div class="sec-num">23.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Self-hosted databases offer more control at the cost of managing backups, patching, and failure recovery yourself; managed database services trade some control for that operational burden being handled automatically.</p>
  ${qScenario('q1', 'med', 'A small team with no dedicated database administrator is deploying TastyGo for the first time. Would you lean toward a self-hosted or a managed database, and why, in one or two sentences?', 'A managed database service is usually the better fit here: it handles backups, security patching, and failover automatically, which matters most for a small team without dedicated database expertise, even though it costs more directly than self-hosting.')}
`
};

lessons['24'] = {
  short: 'Vertical vs. horizontal scaling', where: 'Part VI · <b>Scaling: vertical vs. horizontal</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 24</div>
  <h2 class="title">Scaling: vertical vs. horizontal</h2>
  <p class="lead">When TastyGo gets more traffic than one instance can handle, there are two fundamentally different ways to respond.</p>
  <hr class="rule">
  <p class="body">Vertical scaling means making one instance more powerful, more CPU, more RAM, on the same single server. It's simple, but has a hard ceiling (there's a limit to how large a single machine can get) and no protection if that one instance fails entirely. ${term('horizontal_scaling', 'Horizontal scaling')} means running more instances instead, each handling a share of the traffic behind a load balancer, exactly the nginx pattern from chapter 14. It scales further and survives any single instance failing, at the cost of needing the application to work correctly across multiple instances (for example, not storing session data only in one instance's memory).</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming vertical scaling has no limit.</b> There's always a ceiling on how much a single machine can be upgraded, and it offers zero redundancy if that one machine goes down.</li>
  </ul></div>
  <div class="sec-num">24.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Vertical scaling makes one instance bigger (simple, but limited and fragile); horizontal scaling adds more instances behind a load balancer (scales further, survives single-instance failure, requires the app to work across instances).</p>
  ${qMC('q1', 'med', 'What is a key downside of relying purely on vertical scaling (making one instance bigger) for TastyGo as it grows?', ['It is always more expensive than horizontal scaling', 'There is a hard ceiling on how powerful a single machine can get, and zero redundancy if that one instance fails', 'It requires a load balancer'], 1, 'Vertical scaling eventually runs into the physical limits of a single machine, and offers no protection if that one machine fails, unlike horizontal scaling across multiple instances.')}
`
};

lessons['25'] = {
  short: 'Logging: what and why', where: 'Part VII · <b>Logging: what to log, and why</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 25</div>
  <h2 class="title">Logging: what to log, and why</h2>
  <p class="lead">A running application that logs nothing is a black box: when something goes wrong, there's no record of what actually happened.</p>
  <hr class="rule">
  <pre class="code">2026-07-11T09:14:02Z INFO  order_created order_id=4821 customer_id=112 amount=540
2026-07-11T09:14:05Z ERROR payment_failed order_id=4821 reason="card_declined"</pre>
  <p class="body">Good logs record what happened, when, and with enough context (like an order ID) to trace a specific event later, without logging so much noise that finding the actually useful line becomes its own problem. Structured logs (consistent key=value pairs, as above) are far easier to search and filter than free-form sentences once there are millions of log lines.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Logging sensitive data (passwords, full card numbers) in plain text.</b> Logs are often stored and searched broadly; sensitive fields should be masked or omitted entirely, never logged in the clear.</li>
    <li><b>Logging so much that finding the important line becomes as hard as the original problem.</b> Logging every single detail at the same importance level buries genuinely useful information in noise.</li>
  </ul></div>
  <div class="sec-num">25.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Structured, appropriately-detailed logs (with context like order IDs, and without sensitive data) make it possible to actually reconstruct what happened during an incident, rather than guessing.</p>
  ${qMC('q1', 'easy', 'Why should sensitive data like full card numbers never be written to plain-text application logs?', ['Logs are automatically encrypted, so this is not actually a concern', 'Logs are often stored and searched broadly, so sensitive data in them is exposed far more widely than intended', 'Card numbers take up too much disk space'], 1, "Log files and logging systems are typically accessible to a wide range of people and tools for debugging purposes, making them a poor place to store anything genuinely sensitive.")}
`
};

lessons['26'] = {
  short: 'Monitoring & alerting', where: 'Part VII · <b>Monitoring and alerting</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 26</div>
  <h2 class="title">Monitoring and alerting</h2>
  <p class="lead">${term('monitoring', 'Monitoring')} means knowing a problem exists before a customer has to tell you about it.</p>
  <hr class="rule">
  <p class="body">Monitoring tools continuously track metrics like response time, error rate, and CPU/memory usage across every running instance, usually visualized on dashboards. Alerting builds on top of monitoring: automatically notifying a real person (via email, Slack, or a paging tool) when a metric crosses a concerning threshold, like error rate suddenly spiking, rather than requiring someone to be staring at a dashboard around the clock.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Setting alert thresholds so sensitive that they fire constantly for non-issues.</b> "Alert fatigue," being paged so often for non-problems that real alerts start getting ignored, is a genuine, common failure mode worth actively avoiding.</li>
  </ul></div>
  <div class="sec-num">26.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Monitoring continuously tracks a system's health metrics; alerting notifies a real person automatically when those metrics cross a genuinely concerning threshold, without needing constant manual watching.</p>
  ${qMC('q1', 'med', 'What is "alert fatigue," and why is it a real risk when setting up monitoring alerts?', ['A type of server hardware failure', 'Being paged so frequently for non-issues that people start ignoring alerts altogether, including genuinely important ones', 'A feature that automatically fixes bugs'], 1, 'If alert thresholds are too sensitive and fire constantly for things that are not actually problems, the people receiving them can start tuning them out, which is exactly when a real, important alert risks being missed.')}
`
};

lessons['27'] = {
  short: 'Incident response basics', where: 'Part VII · <b>Incident response basics</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 27</div>
  <h2 class="title">Incident response basics</h2>
  <p class="lead">When an alert does fire for a real problem, having a clear, calm process matters more than any single tool.</p>
  <hr class="rule">
  <p class="body">A basic incident response flow: acknowledge the alert so others know it's being handled, assess impact (how many users, how severe), mitigate first (restore service, even with a temporary fix, like rolling back a bad deploy) before fully diagnosing the root cause, then afterward write a blameless postmortem, what happened, why, and what changes will help prevent it recurring, without assigning personal blame.</p>
  <div class="analogy"><div class="lab">The plain-language version</div><div class="txt">If a small kitchen fire starts, the first move is to put it out, not to investigate exactly which ingredient caused it. Root-cause analysis matters, but only after the immediate danger to real customers is handled.</div></div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Trying to find the exact root cause before restoring service.</b> Mitigating impact (like rolling back a bad deploy) first, then investigating deeply afterward, keeps the damage smaller while still leading to a real fix.</li>
    <li><b>Postmortems that assign blame to a person.</b> Blameless postmortems focus on what in the system or process allowed the incident to happen, which tends to produce far more honest, useful reporting than blaming an individual.</li>
  </ul></div>
  <div class="sec-num">27.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Incident response prioritizes mitigating real impact quickly (even with a temporary fix), then investigates and documents the root cause afterward in a blameless postmortem.</p>
  ${qMC('q1', 'med', "During an incident, why is it usually better to mitigate impact first (e.g. roll back a bad deploy) rather than fully diagnosing the root cause before restoring service?", ['Root cause never actually matters', 'Restoring service quickly limits ongoing harm to real users, while a full investigation can safely happen afterward without users continuing to be affected', 'Diagnosing root cause first is always faster'], 1, 'Prioritizing a quick mitigation limits how long real users are affected, and a thorough root-cause investigation can then happen without the pressure of an ongoing, active outage.')}
`
};

lessons['28'] = {
  short: 'A complete deployment architecture', where: 'Part VIII · <b>A complete deployment architecture for TastyGo</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 28</div>
  <h2 class="title">A complete deployment architecture for TastyGo</h2>
  <p class="lead">Every piece from this course, put together into one coherent picture of how TastyGo actually runs in production.</p>
  <hr class="rule">
  <svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:640px;display:block;margin:10px auto" role="img" aria-label="TastyGo deployment architecture diagram">
    <rect x="10" y="10" width="620" height="60" rx="8" fill="none" stroke="var(--edge,#3a4a55)"/>
    <text x="320" y="35" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="14">Users (HTTPS)</text>
    <text x="320" y="55" text-anchor="middle" fill="var(--muted,#93a4ac)" font-size="11">api.tastygo.com</text>
    <line x1="320" y1="70" x2="320" y2="100" stroke="var(--edge,#3a4a55)"/>
    <rect x="220" y="100" width="200" height="50" rx="8" fill="none" stroke="var(--accent,#5ec8bd)"/>
    <text x="320" y="122" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="13">nginx</text>
    <text x="320" y="140" text-anchor="middle" fill="var(--muted,#93a4ac)" font-size="11">TLS termination + load balancing</text>
    <line x1="270" y1="150" x2="120" y2="190" stroke="var(--edge,#3a4a55)"/>
    <line x1="320" y1="150" x2="320" y2="190" stroke="var(--edge,#3a4a55)"/>
    <line x1="370" y1="150" x2="520" y2="190" stroke="var(--edge,#3a4a55)"/>
    <rect x="50" y="190" width="140" height="44" rx="8" fill="none" stroke="var(--edge,#3a4a55)"/>
    <text x="120" y="216" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="12">API instance 1</text>
    <rect x="250" y="190" width="140" height="44" rx="8" fill="none" stroke="var(--edge,#3a4a55)"/>
    <text x="320" y="216" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="12">API instance 2</text>
    <rect x="450" y="190" width="140" height="44" rx="8" fill="none" stroke="var(--edge,#3a4a55)"/>
    <text x="520" y="216" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="12">API instance 3</text>
    <line x1="120" y1="234" x2="270" y2="270" stroke="var(--edge,#3a4a55)"/>
    <line x1="320" y1="234" x2="300" y2="270" stroke="var(--edge,#3a4a55)"/>
    <line x1="520" y1="234" x2="340" y2="270" stroke="var(--edge,#3a4a55)"/>
    <rect x="220" y="270" width="200" height="40" rx="8" fill="none" stroke="var(--accent,#5ec8bd)"/>
    <text x="320" y="295" text-anchor="middle" fill="var(--fg,#e8eef1)" font-size="12">Managed Postgres (volume-backed)</text>
  </svg>
  <p class="body">Users reach nginx over HTTPS, which terminates TLS and load-balances across three identical containerized API instances, each connecting to one shared managed database. CI/CD builds and deploys a new image to all three instances automatically on every passing change. Logging and monitoring run alongside every instance, feeding alerts to the team if anything goes wrong.</p>
  <div class="sec-num">28.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This full architecture, nginx, multiple containerized app instances, a managed database, CI/CD, and monitoring, is exactly what the Capstone Project asks you to actually build, piece by piece.</p>
  ${qMC('q1', 'easy', 'In the architecture diagram above, why do all three API instances connect to the same single managed database rather than each having their own?', ['Databases cannot be shared between instances', 'All instances need to see and modify the same consistent data (orders, customers), so a single shared database keeps that data consistent across every instance', 'It is cheaper to only pay for one database, with no other reason'], 1, 'Every API instance must operate on the same real, consistent data (the same customers and orders), so they share one database rather than each keeping their own separate, inconsistent copy.')}
`
};

lessons['29'] = {
  short: 'Where to go next', where: 'Part VIII · <b>Where to go next: the Capstone Project</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 29</div>
  <h2 class="title">Where to go next: the Capstone Project</h2>
  <p class="lead">Python, a web framework (Django or FastAPI), and now DevOps. The Capstone Project brings all three together into one real, working thing.</p>
  <hr class="rule">
  <p class="body">The Capstone asks you to actually build a working slice of TastyGo's backend: real Python code, a real web framework serving real endpoints, containerized with Docker, and (at whatever depth you're ready for) fronted by nginx and deployed with the CI/CD patterns from this course. It's designed to be the place where every separate course's ideas stop being separate and become one real project you built yourself.</p>
  <div class="sec-num">29.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This course closes the loop from "writes code" to "ships and runs it reliably." The Capstone Project is where all of it comes together into one real, working system.</p>
  ${qMC('q1', 'easy', "What is the Capstone Project designed to do?", ['Introduce a brand new, unrelated topic', 'Bring Python, a web framework, and DevOps practices together into one real, working slice of TastyGo\'s backend, built by you', 'Repeat the Fundamentals course content'], 1, 'The Capstone is explicitly the integration point: taking the language, framework, and deployment skills built across the previous courses and combining them into one real, working project.')}
`
};

/* ---------- cheat sheet ---------- */
const CHEATS = {
  '00': { note: 'DevOps: a culture of shared ownership between building and running software, supported by automation, not a job title or single tool.' },
  '0b': { note: 'This course focuses on Docker, nginx, CI/CD, cloud/infra basics, and monitoring/logging, the practical foundational toolkit.' },
  '0i': { note: 'This course builds toward a complete, real TastyGo deployment architecture: containerized, load-balanced, auto-deployed, monitored.' },
  '01': { code: 'ls -la, cd, cat, tail -f file | grep "pattern", df -h\n# tail -f watches a log file live' },
  '02': { code: 'ls -l file        # shows rwx permissions for owner/group/others\nchmod +x file     # add execute\nchown user:group file' },
  '03': { code: 'ps aux | grep name   # find a running process\ntop                  # live resource usage\nkill PID / kill -9 PID   # clean stop / forced stop' },
  '04': { code: 'export SECRET_KEY="..."\nos.environ["SECRET_KEY"]   # read at runtime; never commit real secrets to version control' },
  '05': { note: "A Docker image packages an app with its exact dependencies; a container is a lightweight, running instance sharing the host's kernel (not a full VM)." },
  '06': { code: 'FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]' },
  '07': { code: 'docker build -t tastygo-api .\ndocker run -p 8000:8000 tastygo-api\ndocker images / docker ps' },
  '08': { code: 'docker run -v tastygo-db-data:/var/lib/postgresql/data postgres:16\n# volumes persist data beyond a container\'s own lifecycle' },
  '09': { note: 'Real apps run as several single-purpose containers (app, database, cache), not one container doing everything.' },
  '10': { code: 'services:\n  api: { build: ., ports: ["8000:8000"], depends_on: [db] }\n  db: { image: postgres:16, volumes: ["tastygo-db-data:/var/lib/postgresql/data"] }\ndocker compose up -d / down / logs -f api' },
  '11': { note: 'Compose gives every service a hostname matching its name in the YAML, on a shared private network — services reach each other by name, not IP.' },
  '12': { note: 'A shared base compose file + an automatic local override + an explicit production file keeps dev convenience and prod correctness separate.' },
  '13': { code: 'location / {\n  proxy_pass http://127.0.0.1:8000;\n  proxy_set_header Host $host;\n  proxy_set_header X-Real-IP $remote_addr;\n}' },
  '14': { code: 'upstream tastygo_api {\n  server app1:8000;\n  server app2:8000;\n  server app3:8000;\n}\n# nginx spreads requests round-robin across identical instances' },
  '15': { note: 'TLS termination: HTTPS is decrypted once at nginx; traffic to app instances can stay plain HTTP inside the trusted private network.' },
  '16': { code: 'location /static/ { alias /var/www/tastygo/static/; expires 30d; }\n# nginx serves static files directly, without touching the app' },
  '17': { note: 'CI automatically builds and tests every change; CD automatically deploys changes that pass those checks. Related, but distinct.' },
  '18': { code: 'on:\n  push: { branches: [main] }\n  pull_request: { branches: [main] }\njobs:\n  test: { steps: [checkout, setup-python, pip install, pytest] }' },
  '19': { note: 'CI runs the real test suite in a clean, disposable environment, including a throwaway test database, never touching real production data.' },
  '20': { code: 'jobs:\n  deploy:\n    needs: test   # never deploy before tests pass\n    steps: [build image, push to registry, ssh + compose pull/up]' },
  '21': { note: 'A cloud provider is a menu of separately billed services (compute, storage, managed databases, networking) assembled together.' },
  '22': { note: 'Infrastructure as Code describes infrastructure in version-controlled files, reproducible and reviewable, instead of manual dashboard clicks.' },
  '23': { note: 'Self-hosted databases: more control, more operational burden. Managed databases: less control, backups/patching/failover handled for you.' },
  '24': { note: 'Vertical scaling: bigger single instance (simple, has a ceiling, no redundancy). Horizontal scaling: more instances behind a load balancer.' },
  '25': { code: '2026-07-11T09:14:02Z INFO order_created order_id=4821 ...\n# structured logs, real context, never log sensitive data in plain text' },
  '26': { note: 'Monitoring tracks metrics continuously; alerting notifies a person when a metric crosses a real threshold. Avoid alert fatigue.' },
  '27': { note: 'Incident response: acknowledge, assess impact, mitigate first (e.g. rollback), diagnose deeply after, write a blameless postmortem.' },
  '28': { note: 'Full architecture: users → nginx (TLS + load balancing) → multiple containerized app instances → one shared managed database, plus CI/CD and monitoring.' },
  '29': { note: 'The Capstone Project brings Python, a web framework, and DevOps together into one real, working slice of TastyGo\'s backend.' },
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
/* ---------- interview questions & answers ---------- */
function iq(level, q, a) { const cls = level === 'Beginner' ? 'lv-e' : level === 'Intermediate' ? 'lv-m' : 'lv-h'; return `<details class="iq"><summary><span class="q-lvl ${cls}">${level}</span><span class="iq-q">${q}</span></summary><div class="iq-a">${a}</div></details>`; }
function renderInterview() {
  const pipeline = `<div class="iq-flow"><span>Commit</span><i>&rarr;</i><span>Build</span><i>&rarr;</i><span>Test</span><i>&rarr;</i><span>Package</span><i>&rarr;</i><span>Deploy staging</span><i>&rarr;</i><span>Deploy prod</span></div>`;
  const deploy = `<table class="iq-table"><thead><tr><th>Strategy</th><th>How</th><th>Trade-off</th></tr></thead><tbody>
    <tr><td>Rolling</td><td>Replace instances a few at a time</td><td>No extra capacity; slow rollback</td></tr>
    <tr><td>Blue-green</td><td>Two full environments; switch traffic</td><td>Instant rollback; double the infra</td></tr>
    <tr><td>Canary</td><td>Send a small % to the new version first</td><td>Safest; needs good monitoring/routing</td></tr></tbody></table>`;
  return `
  <div class="eyebrow">Interview prep</div>
  <h2 class="title">DevOps interview questions</h2>
  <p class="lead">A deep, topic-by-topic bank of the DevOps questions asked in real interviews, grouped by area, with concise answers and the reasoning interviewers listen for. Click any question to expand it.</p>
  <button class="pg-btn pg-ghost" style="margin:6px 0 10px" onclick="window.print()">Print / save as PDF</button>
  <hr class="rule">

  <h3 class="section-h">Culture &amp; CI/CD</h3>
  ${iq('Beginner','What is DevOps?',`<p>A culture and set of practices that unite development and operations to ship software faster and more reliably &mdash; through automation, shared ownership, continuous integration/delivery, and fast feedback. It is a way of working, not a single tool.</p>`)}
  ${iq('Beginner','CI vs CD (continuous delivery vs deployment)?',`<p><b>CI</b> automatically builds and tests every change. <b>Continuous delivery</b> keeps the app always releasable with a manual approval to ship; <b>continuous deployment</b> pushes every passing change to production automatically.</p>`)}
  ${iq('Intermediate','What are the stages of a CI/CD pipeline?',`<p>Typically: commit triggers a build, automated tests run, the app is packaged (e.g. a container image), it deploys to staging for verification, then promotes to production &mdash; with gates and rollbacks along the way.</p>${pipeline}`)}
  ${iq('Beginner','What is a build artifact?',`<p>The versioned output of the build (a container image, jar, zip, binary) that is stored and then deployed. Build once, promote the same artifact through environments &mdash; do not rebuild per environment.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Containers &amp; orchestration</h3>
  ${iq('Beginner','Image vs container?',`<p>An <b>image</b> is an immutable, versioned template (app + dependencies); a <b>container</b> is a running instance of an image. One image, many identical containers.</p>`)}
  ${iq('Advanced','How does Dockerfile layer caching work, and how do you exploit it?',`<p>Each instruction is a cached layer; if nothing above changes, Docker reuses it. Order the Dockerfile from least- to most-frequently-changing &mdash; e.g. copy the dependency manifest and install deps <i>before</i> copying source, so code changes do not bust the dependency layer.</p>`)}
  ${iq('Intermediate','What is container orchestration / Kubernetes?',`<p>Orchestration automates deploying, scaling, networking and healing containers across many machines. Kubernetes is the leading orchestrator: it schedules containers (in pods), restarts failed ones, scales them, and routes traffic via services.</p>`)}
  ${iq('Intermediate','What is a container registry?',`<p>A store for container images (Docker Hub, ECR, GHCR). CI pushes built images there; deployment targets pull them. It is the hand-off point between build and deploy.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Infrastructure as Code</h3>
  ${iq('Intermediate','What is Infrastructure as Code?',`<p>Defining infrastructure (servers, networks, databases) in version-controlled declarative files instead of clicking consoles. Benefits: repeatable, reviewable, auditable, and easy to recreate or roll back.</p>`)}
  ${iq('Intermediate','Terraform vs Ansible?',`<p><b>Terraform</b> provisions infrastructure declaratively (what resources should exist). <b>Ansible</b> is configuration management (bring a machine to a desired state, install/configure software). They are often used together: Terraform builds it, Ansible configures it.</p>`)}
  ${iq('Advanced','What is immutable infrastructure?',`<p>Servers are never modified in place; to change something you build a new image/instance and replace the old one. It eliminates configuration drift and makes rollback a matter of redeploying the previous image.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Deployment &amp; reliability</h3>
  ${iq('Advanced','Compare rolling, blue-green and canary deployments.',`${deploy}`)}
  ${iq('Intermediate','How do you roll back a bad deployment?',`<p>Redeploy the previous known-good artifact (blue-green makes this a traffic switch). Because artifacts are versioned and immutable, rollback is fast and predictable &mdash; and database migrations should be backward-compatible so rollback does not corrupt data.</p>`)}
  ${iq('Intermediate','Horizontal vs vertical scaling?',`<p><b>Vertical</b> = a bigger machine (simple, but a ceiling and a single point of failure). <b>Horizontal</b> = more machines behind a load balancer (scales further and adds redundancy, but needs statelessness and coordination).</p>`)}
  ${iq('Intermediate','What is a health check?',`<p>An endpoint or probe the platform polls to know if an instance is alive/ready. Unhealthy instances are restarted or removed from the load balancer, so traffic only goes to working ones.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Observability &amp; security</h3>
  ${iq('Intermediate','Monitoring vs observability?',`<p><b>Monitoring</b> watches known signals and alerts on thresholds ("is CPU high?"). <b>Observability</b> is the ability to ask new questions about a system you did not predict, from its outputs &mdash; crucial for debugging novel production issues.</p>`)}
  ${iq('Intermediate','What are the three pillars of observability?',`<p><b>Logs</b> (discrete events), <b>metrics</b> (numeric time series like latency/error rate), and <b>traces</b> (the path of a request across services). Together they let you detect, diagnose and locate problems.</p>`)}
  ${iq('Advanced','What are SLI, SLO and SLA?',`<p><b>SLI</b> = a measured indicator (e.g. % of requests under 200ms). <b>SLO</b> = the internal target for that indicator. <b>SLA</b> = the external, often contractual promise with consequences. SLIs drive SLOs; SLAs are looser than SLOs to leave headroom.</p>`)}
  ${iq('Intermediate','How do you manage secrets?',`<p>Never in code or images. Use a secrets manager (Vault, cloud secret stores) or injected environment variables, scoped per environment, rotated regularly, and access-controlled &mdash; with least privilege.</p>`)}
  ${iq('Intermediate','What is the principle of least privilege?',`<p>Give each user, service or process only the permissions it needs, nothing more. It limits the blast radius if credentials leak or a component is compromised.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Process</h3>
  ${iq('Advanced','What is GitOps?',`<p>Using Git as the single source of truth for infrastructure and deployments: the desired state lives in a repo, and an agent continuously reconciles the live environment to match it. Changes happen via pull requests, giving review and an audit trail.</p>`)}
  ${iq('Intermediate','What is trunk-based development?',`<p>Everyone integrates small changes into one main branch frequently (behind feature flags if needed), rather than long-lived branches. It reduces merge pain and pairs naturally with CI/CD.</p>`)}
  ${iq('Beginner','Why promote a build through separate environments?',`<p>To catch problems before users do: the same artifact is validated in staging (production-like) before it reaches production, reducing the risk of each release.</p>`)}

  <div class="foot" style="margin-top:30px"><span></span><button class="f-btn f-next" onclick="go('${order[0]}')">Back to the course &rarr;</button></div>`;
}
lessons['interview'] = { short: 'Interview Q&A', where: '<b>Interview Q&A</b>', render: renderInterview };


/* ---------- boot ---------- */
computeTotals();
go((function(){try{var l=localStorage.getItem('devops_last');return (l&&lessons[l])?l:'00';}catch(e){return '00';}})());

/* Re-entry hook: see the matching comment in public/app.js / public/ba.js / public/qa.js / public/devfund.js / public/django.js / public/fastapi.js. */
window.__devopsReinit = function () {
  const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
  buildNav();
  computeTotals();
  go(curCh || order[0] || '00');
};
