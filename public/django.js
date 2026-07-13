/* ============================================================
   Developer Track — Django course engine
   Third of six Developer courses. Mirrors public/qa.js /
   public/ba.js: manifest, lessons, progress tracking, search,
   cheat sheet, glossary. Practice is qMC (predict behaviour/
   correctness) + qScenario (write code by hand, compare with a
   model answer) — a real Django + database + WSGI server stack
   isn't feasible to run live in-browser, so code is shown and
   reasoned about rather than executed, unlike the Python course.
   ============================================================ */

document.getElementById('loader').style.display = 'none';

/* ---------- glossary ---------- */
const glossary = {
  framework: { short: 'A pre-built structure and toolset for building applications, handling common problems for you.', long: 'A framework provides the scaffolding, conventions, and tools for a whole category of application, so you build on top of solved problems (routing, database access, security basics) instead of solving them yourself from a blank file.' },
  orm: { short: 'Lets you work with a database using Python objects instead of writing raw SQL.', long: 'An ORM (Object-Relational Mapper) translates Python classes and method calls into SQL queries behind the scenes, so you write Order.objects.filter(...) instead of hand-written SQL, while the database underneath is still a real relational database exactly like the one SQLingo teaches.' },
  migration: { short: "A recorded, versioned change to a database's schema.", long: 'A migration is a generated file describing one change to your database structure (a new table, a new column), created from changes to your models, and applied in order so every environment\'s database schema stays in sync with your code.' },
  model: { short: 'A Python class defining the shape of one kind of data, mapped to a database table.', long: 'A Django model is a class where each attribute becomes a column in a database table. Defining class Order(models.Model) with fields creates both the Python interface and, via migrations, the actual underlying table.' },
  view: { short: 'A function or class that receives a request and returns a response.', long: 'A view is where request-handling logic lives: it receives an incoming request, does whatever work is needed (querying the database, checking permissions), and returns a response, often rendered HTML or JSON.' },
  template: { short: 'An HTML file with placeholders filled in with real data before being sent to a browser.', long: 'A template is HTML mixed with a small templating language ({{ variable }}, {% tag %}) that gets replaced with real data at render time, keeping presentation separate from the view logic that gathers the data.' },
  url_routing: { short: "The system that matches an incoming request's URL to the view that should handle it.", long: "URL routing is a table of patterns (like /orders/<id>/) each mapped to a specific view function or class, so Django knows exactly which code should run for any given incoming request path." },
  admin_panel: { short: "A ready-made web interface for viewing and editing your app's data.", long: "Django's admin panel is automatically generated from your models, giving you a working, permission-aware interface to browse, add, and edit your data without writing any of that interface yourself." },
  middleware: { short: 'Code that runs on every request/response, before it reaches your view or after it leaves it.', long: 'Middleware sits between the web server and your views, running on every single request and response, useful for cross-cutting concerns like authentication checks, logging, or security headers that shouldn\'t be repeated in every view.' },
  queryset: { short: 'A collection of database rows, represented as Python objects, from an ORM query.', long: 'A QuerySet represents a database query that hasn\'t necessarily run yet; it can be filtered and refined further before actually hitting the database, letting the ORM build one efficient final query instead of many small ones.' },
};
function term(w, label) {
  const g = glossary[w];
  return `<span class="term" tabindex="0" role="button" aria-label="${label || w}, glossary term, press Enter to read more" onclick="djangoMore('${w}',this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();djangoMore('${w}',this)}">${label || w}<span class="tip">${g.short}<br><span style="color:#7fd8cb;font-size:11px">press Enter or click to read more</span></span></span>`;
}
function djangoMore(w, el) {
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
    <textarea class="scenario-ed" id="ed-${id}" placeholder="Write your own answer (or code) here, then compare it with a model answer. This is not auto-graded, you judge for yourself."></textarea>
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
try { PROG = JSON.parse(localStorage.getItem('django_progress') || '{}'); } catch (_) { PROG = {}; }
function markProg(ch, id) { if (!ch) return; if (!PROG[ch]) PROG[ch] = {}; PROG[ch][id] = true; try { localStorage.setItem('django_progress', JSON.stringify(PROG)); } catch (_) { } updateCourse(); }
function overallSolved() { let n = 0; for (const c in PROG) { n += Object.keys(PROG[c]).length; } return n; }
function updateCourse() {
  const el = document.getElementById('courseProg'); const fill = document.getElementById('courseProgFill'); const n = overallSolved();
  const done = TOTAL_Q > 0 && n >= TOTAL_Q;
  if (el) el.textContent = TOTAL_Q ? (done ? `Course complete — ${n} / ${TOTAL_Q} solved` : `Overall: ${n} / ${TOTAL_Q} solved`) : '';
  if (fill) fill.style.width = TOTAL_Q ? ((n / TOTAL_Q) * 100) + '%' : '0%';
  if (done) celebrateOnce();
}
function celebrateOnce() {
  let shown = false; try { shown = localStorage.getItem('django_celebrated') === '1'; } catch (_) { }
  if (shown) return;
  try { localStorage.setItem('django_celebrated', '1'); } catch (_) { }
  const t = document.createElement('div'); t.className = 'celebrate-toast';
  t.innerHTML = '<b>Every chapter solved.</b><br>You have worked through the whole Django course. FastAPI or DevOps next.';
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('show'); }, 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 6000);
}
function computeTotals() { const sq = qCount; TOTAL_Q = 0; for (const k in lessons) { qCount = 0; try { lessons[k].render(); } catch (_) { } TOTAL_Q += qCount; } qCount = sq; for (const kk in answers) delete answers[kk]; updateCourse(); }
function resetProgress() { if (!window.confirm('Reset all solved progress across every chapter? This cannot be undone.')) return; PROG = {}; try { localStorage.removeItem('django_progress'); } catch (_) { } updateCourse(); if (curCh) go(curCh); }
function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('navOverlay').classList.toggle('show'); }
function closeMenu() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('navOverlay').classList.remove('show'); }

/* ---------- navigation ---------- */
const manifest = [
  { p: 'Groundwork', items: [['00', 'What is Django, and why a "framework" at all?', 1], ['0b', "Django's toolkit: manage.py, apps, and project structure", 1], ['0i', "Meet the project: building TastyGo's backend in Django", 1]] },
  { p: 'Part I · Project & app structure', items: [['01', 'Projects vs. apps', 1], ['02', 'settings.py and configuration', 1], ['03', 'The MTV pattern', 1], ['04', 'The dev server, conceptually', 1]] },
  { p: 'Part II · URL routing', items: [['05', 'urls.py and URL patterns', 1], ['06', 'Path converters and dynamic URLs', 1], ['07', 'Named URLs and reverse()', 1], ['08', "Including an app's URLs", 1]] },
  { p: 'Part III · Models & the ORM', items: [['09', 'Defining a model', 1], ['10', 'Field types and options', 1], ['11', 'Querying with the ORM', 1], ['12', 'Relationships: ForeignKey', 1]] },
  { p: 'Part IV · Migrations', items: [['13', 'What migrations are, and why', 1], ['14', 'makemigrations and migrate', 1], ['15', 'Changing a model safely', 1], ['16', 'Migration gotchas', 1]] },
  { p: 'Part V · Views', items: [['17', 'Function-based views', 1], ['18', 'Class-based views', 1], ['19', 'Request and response objects', 1], ['20', 'Handling forms and POST data', 1]] },
  { p: 'Part VI · Templates', items: [['21', 'The template language', 1], ['22', 'Template inheritance', 1], ['23', 'Passing context to templates', 1], ['24', 'Static files', 1]] },
  { p: 'Part VII · Admin, auth, and APIs', items: [['25', 'The Django admin panel', 1], ['26', 'Authentication and permissions', 1], ['27', 'Django REST Framework, briefly', 1]] },
  { p: 'Part VIII · Shipping it', items: [['28', 'Settings for production', 1], ['29', "Where to go next: FastAPI, DevOps, Capstone", 1]] },
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
  try { localStorage.setItem('django_last', num); } catch (_) {}
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
  short: 'What is Django?', where: 'Groundwork · <b>What is Django, and why a &quot;framework&quot; at all?</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 00</div>
  <h2 class="title">What is Django, and why a "framework" at all?</h2>
  <p class="lead">Django is a full-featured Python web ${term('framework', 'framework')}: batteries included, opinionated, and built to get a complete, working web application running fast.</p>
  <hr class="rule">
  <p class="body">Without a framework, building TastyGo's backend from raw Python would mean writing your own URL-matching logic, your own database connection handling, your own HTML templating, your own admin interface, your own security protections, all before writing a single line of actual TastyGo-specific logic. Django provides all of that already, solved and battle-tested, so you focus on what makes TastyGo TastyGo.</p>
  <div class="analogy"><div class="lab">The plain-language version</div><div class="txt">Building a restaurant from raw materials means sourcing your own wood, forging your own nails, building your own tables. A framework is closer to leasing a fully fitted-out restaurant space: kitchen, tables, and utilities already there, so you focus on the food and the menu, exactly what makes your restaurant yours.</div></div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming a framework does everything for you.</b> Django removes a huge amount of repetitive infrastructure work, but your application's actual logic and design are still entirely up to you.</li>
    <li><b>Fighting the framework's conventions.</b> Django is "opinionated," it has a preferred way of doing things; working with that grain is far smoother than working against it.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Django is a batteries-included Python web framework, providing URL routing, database access, templating, an admin interface, and security defaults out of the box, so you build application-specific logic instead of infrastructure.</p>
  ${qMC('q1', 'easy', 'What does a framework like Django primarily provide?',
    ['Nothing, it is just documentation', 'Pre-built structure and tools (routing, database access, templating, admin) so you don\'t solve those problems from scratch', 'A replacement for learning Python itself'],
    1, 'A framework\'s core value is solving common, repetitive infrastructure problems once, well, so every project built on it doesn\'t have to solve them again from a blank file.')}
`
};

lessons['0b'] = {
  short: "Django's toolkit", where: 'Groundwork · <b>Django&#39;s toolkit: manage.py, apps, and project structure</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0b</div>
  <h2 class="title">Django's toolkit: manage.py, apps, and project structure</h2>
  <p class="lead">A new Django project has a predictable shape, worth knowing before diving into any one piece of it.</p>
  <hr class="rule">
  <pre class="code">tastygo/
    manage.py            # command-line tool for running/managing the project
    tastygo/
        settings.py       # project-wide configuration
        urls.py           # top-level URL routing
    orders/               # one Django "app": a self-contained feature area
        models.py         # this app's data
        views.py          # this app's request-handling logic
        urls.py           # this app's own URL patterns</pre>
  <p class="body"><code class="inl">manage.py</code> is the command-line entry point for nearly everything: running the dev server, creating migrations, creating an admin user. A Django "project" is the whole site; each "app" inside it is a self-contained feature area (orders, restaurants, accounts), which keeps a growing codebase organized rather than one giant tangle of files.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Confusing a Django "project" with a Django "app."</b> A project is the whole site; an app is one feature area within it. One project can, and usually does, contain several apps.</li>
    <li><b>Cramming everything into one giant app.</b> Splitting by feature area (orders, restaurants, accounts) keeps each app focused and easier to reason about as the project grows.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">manage.py is the command-line entry point. A project is the whole site; apps are self-contained feature areas within it, each with their own models, views, and URLs.</p>
  ${qMC('q1', 'easy', 'What is the difference between a Django "project" and a Django "app"?',
    ['They are the same thing', 'A project is the whole site; an app is one self-contained feature area within it', 'An app contains many projects'],
    1, 'A project represents the entire site\'s configuration and URL routing; apps are the individual, focused feature areas (like orders or accounts) that live inside it.')}
`
};

lessons['0i'] = {
  short: 'Meet the project', where: 'Groundwork · <b>Meet the project: building TastyGo&#39;s backend in Django</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0i</div>
  <h2 class="title">Meet the project: building TastyGo's backend in Django</h2>
  <p class="lead">Same TastyGo used across every CareerLadder course. This time, you're designing the actual Django project that would power it.</p>
  <hr class="rule">
  <p class="body">TastyGo's Django project will have three apps mirroring exactly the tables you already know from SQLingo: <code class="inl">customers</code>, <code class="inl">restaurants</code>, and <code class="inl">orders</code>. Each chapter ahead builds one real piece of this: models mapping to those tables, views handling requests about them, templates displaying them, and eventually an admin panel for managing them, all without writing raw SQL by hand, the ORM (chapter 09 onward) generates it for you.</p>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TastyGo's Django backend mirrors the same customers/restaurants/orders structure from SQLingo, giving you a concrete, familiar target to build toward chapter by chapter.</p>
  ${qMC('q1', 'easy', "TastyGo's Django project will have apps for which three areas?", ['Frontend, backend, and database', 'customers, restaurants, and orders', 'Models, views, and templates'], 1, 'These mirror the exact same three tables taught in SQLingo, giving this course a familiar, consistent target throughout.')}
`
};

lessons['01'] = {
  short: 'Projects vs. apps', where: 'Part I · <b>Projects vs. apps</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 01</div>
  <h2 class="title">Projects vs. apps</h2>
  <p class="lead">Deciding how to split a Django project into apps is one of the first real design decisions you'll make.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">A reasonable split for TastyGo</div>
    <div class="qb-row"><span class="qb-kw kw-p">accounts</span><span class="qb-mean">customer sign-up, login, profile</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">restaurants</span><span class="qb-mean">restaurant listings, menus, ratings</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">orders</span><span class="qb-mean">placing, tracking, and refunding orders</span></div>
  </div>
  <p class="body">Each app can (and should) be reasonably self-contained: <code class="inl">orders</code> needing to reference a restaurant or a customer is normal and expected, but an app that reaches deep into unrelated logic across the whole project is usually a sign the split needs rethinking.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Splitting apps too finely.</b> An app per model is usually overkill; group closely related functionality together.</li>
    <li><b>One giant "core" app holding everything.</b> This defeats the entire purpose of splitting into apps in the first place.</li>
  </ul></div>
  <div class="sec-num">1.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Split a project into apps by feature area, each reasonably self-contained, neither too fine-grained nor one giant catch-all.</p>
  ${qScenario('q1', 'med', 'TastyGo wants to add restaurant-owner-facing tools (managing their own menu, seeing their own orders). Would you add this to the existing "restaurants" app, or create a new app? Explain your reasoning.',
    'A reasonable answer: create a new app (e.g., "restaurant_portal" or "dashboard") rather than folding it into "restaurants," since it represents a distinct feature area (owner-facing tools) with different views, permissions, and templates than the customer-facing restaurant listings, even though it relates to the same underlying data. Keeping them separate keeps each app\'s views and permissions logic focused and easier to reason about.')}
`
};

lessons['02'] = {
  short: 'settings.py', where: 'Part I · <b>settings.py and configuration</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 02</div>
  <h2 class="title">settings.py and configuration</h2>
  <p class="lead">Every project-wide decision, which database to use, which apps are installed, security settings, lives in one file.</p>
  <hr class="rule">
  <pre class="code">INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "orders",
    "restaurants",
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "tastygo",
    }
}

DEBUG = True   # never True in production, chapter 28</pre>
  <p class="body"><code class="inl">INSTALLED_APPS</code> tells Django which apps (yours and built-in ones like the admin) are actually active. <code class="inl">DATABASES</code> configures which real database engine to connect to, exactly what the Fundamentals course's "what a database actually is" chapter was preparing you for, this is where you'd plug in PostgreSQL, MySQL, or SQLite.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting to add a new app to INSTALLED_APPS.</b> An app that exists as a folder but isn't registered here won't have its models recognized by migrations, or its admin registered.</li>
    <li><b>Leaving DEBUG = True in production.</b> This can leak sensitive internal information (like full stack traces) to real users; covered in depth in chapter 28.</li>
  </ul></div>
  <div class="sec-num">2.1</div><h3 class="section-h">Recap</h3>
  <p class="body">settings.py centralizes project-wide configuration: installed apps, database connection, and security-relevant flags like DEBUG.</p>
  ${qMC('q1', 'easy', 'What happens if you create a new Django app but forget to add it to INSTALLED_APPS?',
    ['Nothing, it works exactly the same either way', "Django won't recognize its models for migrations or register it properly, even though the folder exists", 'The project fails to start entirely'],
    1, 'INSTALLED_APPS is what actually activates an app within the project; without it, Django doesn\'t know to look at that app\'s models, admin registrations, or other functionality.')}
`
};

lessons['03'] = {
  short: 'The MTV pattern', where: 'Part I · <b>The MTV pattern</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 03</div>
  <h2 class="title">The MTV pattern</h2>
  <p class="lead">Django organizes every request around three roles: Model, Template, View, each with one clear job.</p>
  <hr class="rule">
  <svg viewBox="0 0 620 220" class="diagram" role="img" aria-label="Request flows to the URL router, to a view, which asks a model for data, then renders a template, returning a response">
    <rect x="10" y="90" width="110" height="50" rx="8" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="65" y="120" text-anchor="middle" font-size="10" fill="#7a251c">Browser request</text>
    <rect x="170" y="90" width="110" height="50" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="225" y="115" text-anchor="middle" font-size="10" fill="#7a4b0a">URL router</text><text x="225" y="128" text-anchor="middle" font-size="9" fill="#7a4b0a">(urls.py)</text>
    <rect x="330" y="90" width="110" height="50" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="385" y="120" text-anchor="middle" font-size="10" fill="var(--teal-deep)">View</text>
    <rect x="330" y="10" width="110" height="50" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="385" y="40" text-anchor="middle" font-size="10" fill="var(--teal-deep)">Model (ORM)</text>
    <rect x="330" y="165" width="110" height="50" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="385" y="195" text-anchor="middle" font-size="10" fill="var(--teal-deep)">Template</text>
    <rect x="490" y="90" width="110" height="50" rx="8" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="545" y="120" text-anchor="middle" font-size="10" fill="#7a251c">HTML response</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDJ1)">
      <path d="M120,115 L169,115"/><path d="M280,115 L329,115"/><path d="M385,90 L385,60"/><path d="M385,140 L385,165"/><path d="M440,115 L489,115"/>
    </g>
    <defs><marker id="arrDJ1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">The URL router (urls.py) picks a view based on the request path. The view asks the Model layer for whatever data it needs, then hands that data to a Template, which renders it into real HTML sent back as the response. Each piece only does its own job: models don't format HTML, templates don't query the database directly.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Putting database queries directly inside a template.</b> Templates are for presentation only; data-fetching belongs in the view.</li>
    <li><b>Confusing Django's MTV with the more commonly known MVC pattern.</b> They're closely related; Django's "View" plays the role most other frameworks call a "Controller," and Django's "Template" plays the role most call a "View."</li>
  </ul></div>
  <div class="sec-num">3.1</div><h3 class="section-h">Recap</h3>
  <p class="body">MTV splits responsibility cleanly: Models hold and query data, Views contain request-handling logic, Templates render the final HTML, connected by URL routing that decides which view handles which request.</p>
  ${qMC('q1', 'easy', 'In Django\'s MTV pattern, which piece is responsible for actually querying the database?',
    ['The Template', 'The Model (via the ORM)', 'The URL router'],
    1, 'Models, through the ORM, are where data access lives; views call into models to get data, and templates only render whatever the view already gathered.')}
`
};

lessons['04'] = {
  short: 'The dev server', where: 'Part I · <b>The dev server, conceptually</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 04</div>
  <h2 class="title">The dev server, conceptually</h2>
  <p class="lead"><code class="inl">python manage.py runserver</code> starts a lightweight web server for local development, connecting everything from this course into something you can actually visit in a browser.</p>
  <hr class="rule">
  <pre class="code">$ python manage.py runserver
Watching for file changes with StatReloader
Starting development server at http://127.0.0.1:8000/</pre>
  <p class="body">This dev server is deliberately simple and not meant for real users, exactly the "dev environment" concept from the Fundamentals course: fast to restart, forgiving, and never what you'd actually deploy. The DevOps course later covers what does run Django in production (a real WSGI/ASGI server, often behind a reverse proxy like nginx).</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using <code class="inl">runserver</code> in production.</b> It's explicitly documented as unsuitable for real traffic; it lacks the performance and security hardening a real deployment needs.</li>
  </ul></div>
  <div class="sec-num">4.1</div><h3 class="section-h">Recap</h3>
  <p class="body"><code class="inl">runserver</code> is a simple, convenient local development server, never meant for production traffic, which uses a proper WSGI/ASGI server instead.</p>
  ${qMC('q1', 'easy', 'Why shouldn\'t Django\'s runserver be used to serve real production traffic?',
    ['It is actually fine for production', 'It is deliberately simple, meant for local development, and lacks the performance/security a real deployment needs', 'It cannot serve HTML at all'],
    1, 'runserver is explicitly built for convenience during development, not for the performance or security hardening real production traffic requires.')}
`
};

lessons['05'] = {
  short: 'urls.py and patterns', where: 'Part II · <b>urls.py and URL patterns</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 05</div>
  <h2 class="title">urls.py and URL patterns</h2>
  <p class="lead">${term('url_routing', 'URL routing')} is a list of patterns, checked top to bottom, each mapped to the view that should handle a matching request.</p>
  <hr class="rule">
  <pre class="code">from django.urls import path
from . import views

urlpatterns = [
    path("restaurants/", views.restaurant_list),
    path("restaurants/nearby/", views.nearby_restaurants),
]</pre>
  <p class="body">Django checks each pattern in order and uses the first one that matches the request's path. A request for <code class="inl">/restaurants/nearby/</code> matches the second pattern; note that if it were listed before a broader pattern that could also match it, order would matter a great deal.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Ordering a broad, catch-all pattern before a more specific one.</b> Since Django stops at the first match, a broad pattern listed first can silently "steal" requests meant for a more specific pattern listed after it.</li>
  </ul></div>
  <div class="sec-num">5.1</div><h3 class="section-h">Recap</h3>
  <p class="body">urlpatterns is an ordered list of path-to-view mappings, checked top to bottom; the first matching pattern wins.</p>
  ${qMC('q1', 'easy', 'If a broad pattern like path("restaurants/<str:name>/") is listed before path("restaurants/nearby/"), what happens to a request for /restaurants/nearby/?',
    ['Django always finds the most specific match automatically, so this is fine', 'The broad pattern matches first and "nearby" gets treated as the name parameter, likely not reaching the intended view', 'Django raises an error for ambiguous patterns'],
    1, 'Since Django checks patterns in order and stops at the first match, a broader pattern listed earlier can unintentionally capture a request meant for a more specific pattern listed later.')}
`
};

lessons['06'] = {
  short: 'Path converters', where: 'Part II · <b>Path converters and dynamic URLs</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 06</div>
  <h2 class="title">Path converters and dynamic URLs</h2>
  <p class="lead">Most real URLs aren't fixed text, they contain a variable part, like which specific order you're looking at.</p>
  <hr class="rule">
  <pre class="code">urlpatterns = [
    path("orders/<int:order_id>/", views.order_detail),
    path("restaurants/<slug:slug>/", views.restaurant_detail),
]

def order_detail(request, order_id):
    # order_id arrives already converted to an int
    ...</pre>
  <div class="qb"><div class="qb-title">Common converters</div>
    <div class="qb-row"><span class="qb-kw kw-p">&lt;int:x&gt;</span><span class="qb-mean">matches digits, converts to a Python int</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">&lt;str:x&gt;</span><span class="qb-mean">matches any non-slash text</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">&lt;slug:x&gt;</span><span class="qb-mean">matches URL-friendly text (letters, numbers, hyphens, underscores)</span></div>
  </div>
  <p class="body">The converted value is passed directly into the view function as a parameter with that same name, already the right Python type, so <code class="inl">order_id</code> arrives as a real int, not a string you'd need to convert yourself.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using &lt;str:x&gt; when &lt;int:x&gt; is more correct.</b> &lt;int:x&gt; also validates the URL actually contains digits, rejecting non-numeric input before it ever reaches your view.</li>
  </ul></div>
  <div class="sec-num">6.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Path converters (&lt;int:x&gt;, &lt;str:x&gt;, &lt;slug:x&gt;) capture a variable part of the URL, validate its shape, and pass it into the view already converted to the right Python type.</p>
  ${qScenario('q1', 'med', 'Write a urls.py pattern for viewing a specific restaurant by its numeric id, at a path like /restaurants/42/, mapped to a view called restaurant_detail.',
    'path("restaurants/<int:restaurant_id>/", views.restaurant_detail) — using <int:...> both validates that the URL segment is actually numeric and passes it into the view function as restaurant_id, already converted to a Python int.')}
`
};

lessons['07'] = {
  short: 'Named URLs & reverse()', where: 'Part II · <b>Named URLs and reverse()</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 07</div>
  <h2 class="title">Named URLs and reverse()</h2>
  <p class="lead">Hard-coding a URL path as a string everywhere it's used is fragile. Naming a URL pattern lets you refer to it by name instead.</p>
  <hr class="rule">
  <pre class="code">path("orders/<int:order_id>/", views.order_detail, name="order-detail")

# elsewhere, instead of hard-coding "/orders/42/":
from django.urls import reverse
url = reverse("order-detail", args=[42])</pre>
  <p class="body">If the actual URL structure ever changes (say, <code class="inl">/orders/&lt;id&gt;/</code> becomes <code class="inl">/order/&lt;id&gt;/details/</code>), every place using <code class="inl">reverse("order-detail", ...)</code> keeps working automatically, since it looks the path up by name rather than assuming it stays fixed text forever.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Hard-coding URL strings throughout templates and views.</b> This breaks silently the moment a URL pattern changes; named URLs with reverse() (or the equivalent {% url %} template tag) avoid this entirely.</li>
  </ul></div>
  <div class="sec-num">7.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Naming a URL pattern and using reverse() (or {% url %} in templates) to generate links to it means URL structure can change in one place without breaking every reference to it.</p>
  ${qMC('q1', 'med', 'Why prefer reverse("order-detail", args=[42]) over hard-coding the string "/orders/42/" throughout the codebase?',
    ['reverse() is always faster to type', 'If the URL pattern\'s actual path ever changes, every reverse() call keeps working automatically, while hard-coded strings would all silently break', 'Hard-coded strings are not valid Python'],
    1, 'Named URLs decouple "what this page is called" from "what its exact path currently is," so a later path change doesn\'t require hunting down every hard-coded reference.')}
`
};

lessons['08'] = {
  short: "Including app URLs", where: 'Part II · <b>Including an app&#39;s URLs</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 08</div>
  <h2 class="title">Including an app's URLs</h2>
  <p class="lead">Each app typically owns its own urls.py, and the project's top-level urls.py simply includes them, keeping URL routing organized the same way apps organize everything else.</p>
  <hr class="rule">
  <pre class="code"># tastygo/urls.py (project-level)
from django.urls import path, include

urlpatterns = [
    path("orders/", include("orders.urls")),
    path("restaurants/", include("restaurants.urls")),
]

# orders/urls.py (app-level)
urlpatterns = [
    path("<int:order_id>/", views.order_detail),
]</pre>
  <p class="body">A request for <code class="inl">/orders/42/</code> first matches <code class="inl">orders/</code> at the project level, then Django continues matching the rest of the path (<code class="inl">42/</code>) against <code class="inl">orders/urls.py</code>. This keeps each app's URL patterns self-contained and independent of the others.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Defining every URL pattern directly in the project-level urls.py.</b> This quickly becomes unmanageable as the project grows; include() keeps each app's routing scoped to itself.</li>
  </ul></div>
  <div class="sec-num">8.1</div><h3 class="section-h">Recap</h3>
  <p class="body">include() lets the project-level urls.py delegate a whole URL prefix to an app's own urls.py, keeping routing organized per feature area as the project grows.</p>
  ${qMC('q1', 'easy', 'What does include("orders.urls") do in the project-level urls.py?',
    ['It copies the app\'s views into the project directly', 'It delegates matching for that URL prefix to the orders app\'s own urls.py', 'It disables the orders app\'s URLs'],
    1, 'include() hands off further URL matching (for anything under that prefix) to the specified app\'s own urls.py, keeping each app\'s routing self-contained.')}
`
};

lessons['09'] = {
  short: 'Defining a model', where: 'Part III · <b>Defining a model</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 09</div>
  <h2 class="title">Defining a model</h2>
  <p class="lead">A ${term('model', 'model')} is a Python class where each attribute becomes a database column, the ORM's bridge between your code and a real table.</p>
  <hr class="rule">
  <pre class="code">from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=50)
    rating = models.FloatField()
    cost_for_two = models.IntegerField()

    def __str__(self):
        return self.name</pre>
  <p class="body">This should look immediately familiar: it's the exact same <code class="inl">restaurants</code> table from SQLingo, just declared as a Python class instead of a <code class="inl">CREATE TABLE</code> statement. A migration (Part IV) is what actually turns this class definition into a real table.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting <code class="inl">__str__</code>.</b> Without it, objects display as an unhelpful "Restaurant object (1)" everywhere, including the admin panel; defining it costs one line and helps constantly.</li>
    <li><b>Defining a model but never running a migration for it.</b> The Python class alone doesn't create the table; a migration (chapter 13-14) has to actually apply that change to the database.</li>
  </ul></div>
  <div class="sec-num">9.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A model class, subclassing models.Model, defines fields that become database columns. Migrations (covered next in Part IV) turn that definition into a real table.</p>
  ${qScenario('q1', 'med', 'Write a Django model called Customer with fields name (text, up to 100 characters), city (text, up to 50 characters), and joined (a date).',
`class Customer(models.Model):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=50)
    joined = models.DateField()

    def __str__(self):
        return self.name`)}
`
};

lessons['10'] = {
  short: 'Field types & options', where: 'Part III · <b>Field types and options</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 10</div>
  <h2 class="title">Field types and options</h2>
  <p class="lead">Beyond the field type itself, options control validation and database-level constraints, directly echoing the "constraints" idea from SQLingo.</p>
  <hr class="rule">
  <pre class="code">class Order(models.Model):
    amount = models.IntegerField()
    order_date = models.DateField(auto_now_add=True)
    rating_given = models.IntegerField(null=True, blank=True)
    notes = models.CharField(max_length=200, default="")</pre>
  <div class="qb"><div class="qb-title">Common field options</div>
    <div class="qb-row"><span class="qb-kw kw-p">null=True</span><span class="qb-mean">allows NULL at the database level (like SQLingo's rating_given)</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">blank=True</span><span class="qb-mean">allows the field to be empty in forms/validation (a separate concern from null)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">default=...</span><span class="qb-mean">value used automatically if none is provided</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Confusing null and blank.</b> null is about the database column; blank is about form validation. A field can allow one without the other, and text fields conventionally use blank=True rather than null=True, to avoid two different ways of representing "empty."</li>
  </ul></div>
  <div class="sec-num">10.1</div><h3 class="section-h">Recap</h3>
  <p class="body">null=True permits NULL at the database level; blank=True permits an empty value in form validation, two related but distinct concerns.</p>
  ${qMC('q1', 'med', 'What is the difference between null=True and blank=True on a Django model field?',
    ['They are exactly the same option under two names', 'null=True controls whether NULL is allowed in the database column; blank=True controls whether the field can be empty in form validation', 'blank=True is only relevant for numeric fields'],
    1, 'null is a database-level concern (can this column store NULL), while blank is a validation-level concern (can a form submit this field empty); they are related but independently configurable.')}
`
};

lessons['11'] = {
  short: 'Querying with the ORM', where: 'Part III · <b>Querying with the ORM</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 11</div>
  <h2 class="title">Querying with the ORM</h2>
  <p class="lead">The ${term('orm', 'ORM')} translates Python method calls into real SQL, run against a real database, no raw SQL required for most everyday queries.</p>
  <hr class="rule">
  <svg viewBox="0 0 600 130" class="diagram" role="img" aria-label="Python ORM call translates into a real SQL query sent to the database">
    <rect x="10" y="35" width="230" height="60" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="125" y="60" text-anchor="middle" font-size="10" fill="var(--teal-deep)">Restaurant.objects.filter(</text><text x="125" y="76" text-anchor="middle" font-size="10" fill="var(--teal-deep)">city="Mumbai", rating__gte=4.5)</text>
    <rect x="360" y="35" width="230" height="60" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="475" y="60" text-anchor="middle" font-size="10" fill="#7a4b0a">SELECT * FROM restaurants</text><text x="475" y="76" text-anchor="middle" font-size="10" fill="#7a4b0a">WHERE city='Mumbai' AND rating>=4.5</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDJ2)"><path d="M240,65 L359,65"/></g>
    <defs><marker id="arrDJ2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <pre class="code">Restaurant.objects.filter(city="Mumbai", rating__gte=4.5)
Restaurant.objects.get(id=1)          # exactly one, or raises an error
Restaurant.objects.exclude(city="Delhi")
Restaurant.objects.filter(city="Mumbai").order_by("-rating")</pre>
  <p class="body">A ${term('queryset', 'QuerySet')} is "lazy," <code class="inl">.filter()</code> doesn't hit the database immediately; it builds up a query that only actually runs once you use the result (looping over it, converting to a list, and so on). This lets you chain several filters together before Django builds one final, efficient SQL query.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using .get() when a query might return zero or multiple rows.</b> .get() raises an error unless exactly one row matches; use .filter() (returning a QuerySet, possibly empty) when that's not guaranteed.</li>
    <li><b>Assuming .filter() immediately queries the database.</b> QuerySets are lazy, useful to know when reasoning about performance.</li>
  </ul></div>
  <div class="sec-num">11.1</div><h3 class="section-h">Recap</h3>
  <p class="body">.filter() returns a (possibly empty) lazy QuerySet; .get() returns exactly one object or raises an error. Field lookups like __gte add SQL-level comparisons directly in Python.</p>
  ${qMC('q1', 'easy', 'Why might Restaurant.objects.get(id=1) raise an error where .filter(id=1) would not, for the same data?',
    ['.get() is broken and should never be used', '.get() expects exactly one matching row and raises an error if zero or more than one exist; .filter() always returns a QuerySet, even if empty', 'They are functionally identical'],
    1, '.get() is specifically for "there should be exactly one," raising DoesNotExist or MultipleObjectsReturned otherwise; .filter() makes no such assumption.')}
  ${qScenario('q2', 'med', 'Write an ORM query returning all restaurants in "Pune" with a rating of at least 4.0, ordered by rating, highest first.',
    'Restaurant.objects.filter(city="Pune", rating__gte=4.0).order_by("-rating") — the leading "-" on "rating" reverses the default ascending order to descending (highest first).')}
`
};

lessons['12'] = {
  short: 'Relationships: ForeignKey', where: 'Part III · <b>Relationships: ForeignKey</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 12</div>
  <h2 class="title">Relationships: ForeignKey</h2>
  <p class="lead">A ForeignKey is Django's model-level version of exactly the SQL foreign key relationship SQLingo teaches: one row pointing at another table's row.</p>
  <hr class="rule">
  <svg viewBox="0 0 560 170" class="diagram" role="img" aria-label="Order model has a ForeignKey to Customer and a ForeignKey to Restaurant">
    <rect x="20" y="20" width="180" height="50" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="110" y="50" text-anchor="middle" font-size="11" fill="var(--teal-deep)">Customer</text>
    <rect x="20" y="100" width="180" height="50" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="110" y="130" text-anchor="middle" font-size="11" fill="#7a4b0a">Restaurant</text>
    <rect x="340" y="60" width="200" height="50" rx="8" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="440" y="90" text-anchor="middle" font-size="11" fill="#7a251c">Order</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDJ3)"><path d="M200,45 L339,80"/><path d="M200,125 L339,95"/></g>
    <defs><marker id="arrDJ3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <pre class="code">class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    amount = models.IntegerField()

# following the relationship in Python:
order.customer.name
customer.order_set.all()   # every order this customer has placed</pre>
  <p class="body"><code class="inl">on_delete</code> decides what happens to an Order if its Customer is deleted; <code class="inl">CASCADE</code> deletes the order too, matching the referential integrity concerns from SQLingo's own foreign key chapter.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting on_delete entirely.</b> Django requires it explicitly, precisely because silently picking a default behaviour for something this consequential would be risky.</li>
    <li><b>Choosing CASCADE without thinking it through.</b> Deleting a customer and silently deleting all their historical orders may not actually be the right business behaviour; SET_NULL or PROTECT are sometimes more appropriate.</li>
  </ul></div>
  <div class="sec-num">12.1</div><h3 class="section-h">Recap</h3>
  <p class="body">ForeignKey models a real relationship between tables, requiring an explicit on_delete behaviour, and lets you traverse the relationship in both directions directly in Python.</p>
  ${qMC('q1', 'med', 'What does on_delete=models.CASCADE mean on a ForeignKey?',
    ['Nothing happens when the referenced row is deleted', 'When the referenced row (e.g. a Customer) is deleted, rows referencing it (e.g. their Orders) are deleted too', 'It prevents the referenced row from ever being deleted'],
    1, 'CASCADE propagates a deletion: removing a Customer also removes every Order that pointed at it via that ForeignKey.')}
`
};

lessons['13'] = {
  short: 'What migrations are', where: 'Part IV · <b>What migrations are, and why</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 13</div>
  <h2 class="title">What migrations are, and why</h2>
  <p class="lead">A ${term('migration', 'migration')} is Django's answer to a simple problem: your models describe the database you want, but something has to actually make the real database match.</p>
  <hr class="rule">
  <svg viewBox="0 0 600 130" class="diagram" role="img" aria-label="Model change generates a migration file, which is applied to update the real database schema">
    <rect x="10" y="35" width="170" height="60" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="95" y="60" text-anchor="middle" font-size="10" fill="var(--teal-deep)">Change a model</text><text x="95" y="76" text-anchor="middle" font-size="9" fill="var(--teal-deep)">(models.py)</text>
    <rect x="220" y="35" width="170" height="60" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="305" y="60" text-anchor="middle" font-size="10" fill="#7a4b0a">makemigrations</text><text x="305" y="76" text-anchor="middle" font-size="9" fill="#7a4b0a">generates a migration file</text>
    <rect x="430" y="35" width="160" height="60" rx="8" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="510" y="60" text-anchor="middle" font-size="10" fill="#7a251c">migrate</text><text x="510" y="76" text-anchor="middle" font-size="9" fill="#7a251c">applies it to the real DB</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDJ4)"><path d="M180,65 L219,65"/><path d="M390,65 L429,65"/></g>
    <defs><marker id="arrDJ4" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">Migration files are checked into version control alongside your code, so every environment, your machine, a teammate's, staging, production, applies the exact same sequence of schema changes in the exact same order, keeping every database's actual structure in sync with what the code expects.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Changing a model and forgetting to generate/apply a migration.</b> The Python class and the real database silently disagree until a migration catches them up, which can cause confusing runtime errors.</li>
    <li><b>Not committing migration files to version control.</b> Without them, nobody else (or no other environment) can reproduce the same schema changes.</li>
  </ul></div>
  <div class="sec-num">13.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Migrations are generated files describing a schema change, applied in order to keep every environment's real database structure in sync with the models in code.</p>
  ${qMC('q1', 'easy', 'Why are migration files checked into version control alongside the rest of the code?',
    ['They are not usually version-controlled', 'So every environment (teammates, staging, production) applies the exact same schema changes in the exact same order', 'Version control cannot track non-Python files'],
    1, 'Committing migrations ensures every environment can reproduce the identical sequence of schema changes, keeping every database in sync with the code that expects it.')}
`
};

lessons['14'] = {
  short: 'makemigrations & migrate', where: 'Part IV · <b>makemigrations and migrate</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 14</div>
  <h2 class="title">makemigrations and migrate</h2>
  <p class="lead">Two separate commands, each with a distinct job, easy to mix up as a beginner.</p>
  <hr class="rule">
  <pre class="code">$ python manage.py makemigrations
Migrations for 'orders':
  orders/migrations/0004_order_notes.py
    - Add field notes to order

$ python manage.py migrate
Applying orders.0004_order_notes... OK</pre>
  <div class="qb"><div class="qb-title">Two distinct steps</div>
    <div class="qb-row"><span class="qb-kw kw-p">makemigrations</span><span class="qb-mean">looks at your model changes and generates a migration file describing them (doesn't touch the database yet)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">migrate</span><span class="qb-mean">actually applies pending migration files to the real database</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Running makemigrations and assuming the database already changed.</b> It only generates the file; migrate is the step that actually applies it.</li>
    <li><b>Running migrate without makemigrations first, after a model change.</b> There's no migration file yet describing the new change, so nothing new gets applied.</li>
  </ul></div>
  <div class="sec-num">14.1</div><h3 class="section-h">Recap</h3>
  <p class="body">makemigrations generates a migration file from model changes; migrate applies pending migration files to the real database. Neither replaces the other.</p>
  ${qMC('q1', 'easy', 'After running makemigrations, has the real database schema already changed?',
    ['Yes, makemigrations applies the change immediately', 'No, makemigrations only generates the migration file; migrate is what actually applies it to the database', 'Only for SQLite databases'],
    1, 'makemigrations is purely a generation step; the real schema only changes once migrate is run afterward.')}
`
};

lessons['15'] = {
  short: 'Changing a model safely', where: 'Part IV · <b>Changing a model safely</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 15</div>
  <h2 class="title">Changing a model safely</h2>
  <p class="lead">Some model changes are simple for Django to figure out automatically; others need a decision only you can make.</p>
  <hr class="rule">
  <p class="body">Adding a brand-new field with no default value is exactly this kind of case: existing rows already have no value for it, so Django needs to know what to fill in for them. Running <code class="inl">makemigrations</code> for such a change interactively asks you to either supply a one-time default, or provide a callable/value in the field itself.</p>
  <pre class="code">You are trying to add a non-nullable field 'notes' to order
without a default; we can't do that (the database needs
something to populate existing rows).
Please select a fix:
 1) Provide a one-off default now
 2) Quit and add a default in models.py</pre>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Adding a required field with no default to a table that already has real data.</b> This is exactly the scenario above, Django cannot invent a sensible value for existing rows on its own.</li>
    <li><b>Renaming a field and expecting Django to know that's what happened.</b> Without extra care, Django may interpret it as removing the old field and adding an unrelated new one, potentially losing data; a genuine rename needs to be handled explicitly.</li>
  </ul></div>
  <div class="sec-num">15.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Adding a required field to a table with existing data needs a default, since existing rows need some real value for it. Renaming fields needs explicit care to avoid Django treating it as an unrelated remove-and-add.</p>
  ${qScenario('q1', 'hard', 'You need to add a required (non-nullable) "phone_number" field to the existing Customer model, which already has real customer rows. What are your options, and what would you actually choose for TastyGo?',
    'Options: (1) give the field a sensible default (like an empty string) so existing rows get filled in automatically, or (2) make the field nullable (null=True) instead, if "unknown phone number" is a legitimate state, or (3) provide a one-off default interactively during makemigrations, then follow up with a data migration to correctly backfill real values later. For TastyGo, allowing null (since not all in-progress customer records may have a phone number yet) combined with a follow-up plan to encourage or require it going forward is usually more honest than inventing a fake default value.')}
`
};

lessons['16'] = {
  short: 'Migration gotchas', where: 'Part IV · <b>Migration gotchas</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 16</div>
  <h2 class="title">Migration gotchas</h2>
  <p class="lead">A handful of migration mistakes account for the vast majority of real production incidents involving schema changes.</p>
  <hr class="rule">
  <div class="gotcha"><div class="lab">The big ones</div><ul>
    <li><b>Deleting a column that's still in use.</b> Removing a field's migration drops the real database column; if any still-running code expects it, this causes immediate errors.</li>
    <li><b>Running migrations without a backup, on a production database with real data.</b> A migration that goes wrong partway through can leave a database in an inconsistent state.</li>
    <li><b>Large table migrations locking the table during business hours.</b> Changing a column type on a huge table can take real time and, on some databases, lock it for reads/writes while it runs.</li>
  </ul></div>
  <p class="body">This is exactly the "risk-based testing" and "dev/staging/production" thinking from the QA and Fundamentals courses applied to schema changes specifically: test a migration thoroughly on staging with realistic data volume first, and have a rollback plan before ever running one against production.</p>
  <div class="sec-num">16.1</div><h3 class="section-h">Recap</h3>
  <p class="body">The riskiest migrations remove or fundamentally change something still in use, or run against a large, live production table without a tested plan and a rollback path.</p>
  ${qMC('q1', 'med', 'Why is testing a migration on staging with realistic data volume important before running it on production?',
    ['Staging and production always behave identically regardless of data volume', 'A migration\'s behaviour and duration (and risk of locking a table) can depend heavily on how much real data exists, which staging with unrealistic data might not reveal', 'Migrations never behave differently based on data volume'],
    1, 'Some migrations are fast and safe on a small staging dataset but slow or lock-prone on a much larger production table; testing with realistic volume is what actually reveals that risk in advance.')}
`
};

lessons['17'] = {
  short: 'Function-based views', where: 'Part V · <b>Function-based views</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 17</div>
  <h2 class="title">Function-based views</h2>
  <p class="lead">A ${term('view', 'view')} is where request-handling logic actually lives. The simplest form is just a regular Python function.</p>
  <hr class="rule">
  <pre class="code">from django.shortcuts import render, get_object_or_404

def restaurant_detail(request, restaurant_id):
    restaurant = get_object_or_404(Restaurant, id=restaurant_id)
    return render(request, "restaurant_detail.html", {"restaurant": restaurant})</pre>
  <p class="body">Every view takes <code class="inl">request</code> as its first parameter (plus any URL-captured values, like <code class="inl">restaurant_id</code>), and must return an HttpResponse of some kind, <code class="inl">render()</code> is a shortcut that renders a template with the given context and wraps it in a response for you.</p>
  <p class="body"><code class="inl">get_object_or_404</code> looks a record up and automatically returns a proper 404 response (rather than crashing with an unhandled error) if it doesn't exist, directly echoing the HTTP status code chapter from the QA and Fundamentals courses.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting a view must always return a response.</b> A view function that falls through without returning anything raises an error.</li>
    <li><b>Using Model.objects.get() directly instead of get_object_or_404.</b> This raises an unhandled 500-style error for a missing record instead of a proper, expected 404.</li>
  </ul></div>
  <div class="sec-num">17.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A function-based view takes request (plus URL parameters) and returns a response. get_object_or_404 is the idiomatic way to fetch-or-404 in one step.</p>
  ${qScenario('q1', 'med', 'Write a function-based view order_detail(request, order_id) that fetches the order or returns a proper 404, then renders "order_detail.html" with it in context.',
`def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    return render(request, "order_detail.html", {"order": order})`)}
`
};

lessons['18'] = {
  short: 'Class-based views', where: 'Part V · <b>Class-based views</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 18</div>
  <h2 class="title">Class-based views</h2>
  <p class="lead">For common patterns, listing objects, showing one object's detail, Django provides ready-made view classes, directly building on this Developer track's Python course's OOP chapters.</p>
  <hr class="rule">
  <pre class="code">from django.views.generic import ListView, DetailView

class RestaurantListView(ListView):
    model = Restaurant
    template_name = "restaurant_list.html"
    context_object_name = "restaurants"

class RestaurantDetailView(DetailView):
    model = Restaurant
    template_name = "restaurant_detail.html"</pre>
  <p class="body">These classes already know how to fetch the right data and render a template, following the exact inheritance pattern taught in the Python course: you're overriding or setting a small number of attributes on a well-tested parent class, rather than writing the whole request-handling flow yourself.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Reaching for a class-based view when a simple function would be clearer.</b> For genuinely simple, one-off logic, a function-based view can be easier to read; class-based views shine for common, repeatable patterns.</li>
  </ul></div>
  <div class="sec-num">18.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Class-based generic views (ListView, DetailView, and others) implement common request-handling patterns for you; you customize by setting attributes or overriding specific methods, not rewriting the whole view.</p>
  ${qMC('q1', 'med', 'What is the main advantage of using ListView instead of writing a function-based view that does the same thing?',
    ['ListView is always faster at runtime', 'ListView already implements the common "fetch a list of objects and render a template" pattern, so you only configure a few attributes instead of writing that logic yourself', 'Function-based views cannot fetch lists of objects'],
    1, 'Class-based generic views exist specifically to avoid re-writing very common patterns from scratch; you configure them rather than reimplement the underlying logic.')}
`
};

lessons['19'] = {
  short: 'Request & response objects', where: 'Part V · <b>Request and response objects</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 19</div>
  <h2 class="title">Request and response objects</h2>
  <p class="lead">Every view receives a rich request object and must produce a response object, both worth knowing in some depth.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Useful bits of the request object</div>
    <div class="qb-row"><span class="qb-kw kw-p">request.method</span><span class="qb-mean">"GET", "POST", etc.</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">request.GET / request.POST</span><span class="qb-mean">query string parameters / submitted form data</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">request.user</span><span class="qb-mean">the currently authenticated user (or an anonymous user object)</span></div>
  </div>
  <pre class="code">def search_restaurants(request):
    city = request.GET.get("city", "")
    results = Restaurant.objects.filter(city__icontains=city)
    return render(request, "search.html", {"results": results})</pre>
  <p class="body">A response can be <code class="inl">render()</code> (rendered HTML), <code class="inl">JsonResponse</code> (for JSON APIs, foreshadowing FastAPI), or a bare <code class="inl">HttpResponse</code>, but a view must always return one of these, exactly as the client-server chapter from the Fundamentals course described: every request gets an answer.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Reading form data from request.GET on a POST request.</b> Submitted form data lives in request.POST, not request.GET; mixing these up is a common early bug.</li>
  </ul></div>
  <div class="sec-num">19.1</div><h3 class="section-h">Recap</h3>
  <p class="body">The request object carries the method, submitted data, and the current user. A view must return a response object of some kind, whether rendered HTML, JSON, or a bare HTTP response.</p>
  ${qMC('q1', 'easy', 'Where does submitted form data from a POST request live on the request object?',
    ['request.GET', 'request.POST', 'request.user'],
    1, 'request.POST specifically holds submitted form data from a POST request; request.GET holds query string parameters instead.')}
`
};

lessons['20'] = {
  short: 'Forms & POST data', where: 'Part V · <b>Handling forms and POST data</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 20</div>
  <h2 class="title">Handling forms and POST data</h2>
  <p class="lead">Django's Form classes validate submitted data before you ever touch it, directly applying the QA course's "never trust unvalidated input" principle.</p>
  <hr class="rule">
  <pre class="code">from django import forms

class OrderForm(forms.Form):
    restaurant_id = forms.IntegerField()
    amount = forms.IntegerField(min_value=1)

def place_order(request):
    if request.method == "POST":
        form = OrderForm(request.POST)
        if form.is_valid():
            # form.cleaned_data holds validated, correctly-typed values
            ...
        else:
            return render(request, "order_form.html", {"form": form})
    return render(request, "order_form.html", {"form": OrderForm()})</pre>
  <p class="body"><code class="inl">form.is_valid()</code> runs all the field-level validation at once (type checks, min/max, required fields), and <code class="inl">form.cleaned_data</code> gives back validated, correctly-typed Python values, never raw, unchecked request data.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using request.POST data directly without validating it through a Form.</b> This skips type checking and validation entirely, exactly the kind of unvalidated-input risk the QA and Fundamentals security chapters warned about.</li>
    <li><b>Forgetting to handle the invalid case.</b> Re-rendering the form with its errors (rather than silently failing) is what lets the user actually fix their mistake.</li>
  </ul></div>
  <div class="sec-num">20.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A Form class validates and type-converts submitted data. Always check form.is_valid() before trusting form.cleaned_data, and re-render the form with errors if it's not.</p>
  ${qMC('q1', 'med', 'Why use form.cleaned_data instead of reading request.POST directly?',
    ['They contain exactly the same data either way', 'cleaned_data holds data that has already been validated and correctly type-converted by the form, unlike raw request.POST', 'request.POST is only available for GET requests'],
    1, 'cleaned_data is only populated after successful validation, and values are converted to their proper Python types (e.g. actual ints, not strings), unlike the raw, unvalidated request.POST.')}
`
};

lessons['21'] = {
  short: 'Template language', where: 'Part VI · <b>The template language</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 21</div>
  <h2 class="title">The template language</h2>
  <p class="lead">A ${term('template', 'template')} is HTML with a small amount of logic mixed in, deliberately less powerful than full Python, to keep presentation logic simple.</p>
  <hr class="rule">
  <pre class="code">&lt;h1&gt;{{ restaurant.name }}&lt;/h1&gt;
&lt;p&gt;Rating: {{ restaurant.rating }}&lt;/p&gt;

&lt;ul&gt;
{% for order in orders %}
  &lt;li&gt;Order #{{ order.id }}: ₹{{ order.amount }}&lt;/li&gt;
{% empty %}
  &lt;li&gt;No orders yet.&lt;/li&gt;
{% endfor %}
&lt;/ul&gt;</pre>
  <div class="qb"><div class="qb-title">The two syntaxes</div>
    <div class="qb-row"><span class="qb-kw kw-p">{{ variable }}</span><span class="qb-mean">outputs a value</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">{% tag %}</span><span class="qb-mean">logic: loops, conditionals, template inheritance</span></div>
  </div>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Trying to do heavy logic (complex calculations, database writes) inside a template.</b> Templates are deliberately limited; that logic belongs in the view, keeping presentation and logic cleanly separated, exactly the MTV pattern from chapter 03.</li>
  </ul></div>
  <div class="sec-num">21.1</div><h3 class="section-h">Recap</h3>
  <p class="body">{{ }} outputs values; {% %} handles logic like loops and conditionals. Templates are deliberately limited to keep presentation logic simple and separate from view logic.</p>
  ${qMC('q1', 'easy', 'What is the correct template syntax for outputting a variable\'s value?',
    ['{% variable %}', '{{ variable }}', '<variable>'],
    1, 'Double curly braces {{ }} are used for outputting values; {% %} is reserved for logic tags like loops and conditionals.')}
`
};

lessons['22'] = {
  short: 'Template inheritance', where: 'Part VI · <b>Template inheritance</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 22</div>
  <h2 class="title">Template inheritance</h2>
  <p class="lead">Repeating the same header, navigation, and footer HTML in every single template is exactly the kind of duplication template inheritance exists to avoid.</p>
  <hr class="rule">
  <svg viewBox="0 0 460 170" class="diagram" role="img" aria-label="base.html defines shared layout with a content block, extended by restaurant_list.html and order_detail.html">
    <rect x="140" y="20" width="180" height="50" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="230" y="50" text-anchor="middle" font-size="11" fill="var(--teal-deep)">base.html</text>
    <rect x="20" y="110" width="180" height="50" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="110" y="140" text-anchor="middle" font-size="10" fill="#7a4b0a">restaurant_list.html</text>
    <rect x="260" y="110" width="180" height="50" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="350" y="140" text-anchor="middle" font-size="10" fill="#7a4b0a">order_detail.html</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrDJ5)"><path d="M180,70 L120,109"/><path d="M280,70 L330,109"/></g>
    <defs><marker id="arrDJ5" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <pre class="code">&lt;!-- base.html --&gt;
&lt;html&gt;&lt;body&gt;
  &lt;nav&gt;...TastyGo nav...&lt;/nav&gt;
  {% block content %}{% endblock %}
&lt;/body&gt;&lt;/html&gt;

&lt;!-- restaurant_list.html --&gt;
{% extends "base.html" %}
{% block content %}
  &lt;h1&gt;Restaurants&lt;/h1&gt;
{% endblock %}</pre>
  <p class="body">Every page extending <code class="inl">base.html</code> automatically gets the shared nav and layout, and only needs to fill in its own <code class="inl">{% block content %}</code>, changing the shared layout once updates every page that extends it.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Copy-pasting the same header/nav HTML into every template.</b> This is exactly the duplication template inheritance solves; a later design change would otherwise need updating in every single file.</li>
  </ul></div>
  <div class="sec-num">22.1</div><h3 class="section-h">Recap</h3>
  <p class="body">{% extends %} and {% block %} let child templates inherit shared layout from a base template, overriding only the specific sections that differ.</p>
  ${qMC('q1', 'easy', 'What is the main benefit of {% extends "base.html" %} across many templates?',
    ['It makes pages load faster', 'Shared layout (nav, header, footer) lives in one place, so changing it updates every template that extends it', 'It replaces the need for CSS entirely'],
    1, 'Template inheritance centralizes shared layout in a base template, avoiding duplicated HTML and letting one change propagate everywhere it\'s used.')}
`
};

lessons['23'] = {
  short: 'Passing context', where: 'Part VI · <b>Passing context to templates</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 23</div>
  <h2 class="title">Passing context to templates</h2>
  <p class="lead">A template only sees exactly what the view explicitly hands it, the "context" dictionary, nothing more.</p>
  <hr class="rule">
  <pre class="code">def restaurant_detail(request, restaurant_id):
    restaurant = get_object_or_404(Restaurant, id=restaurant_id)
    similar = Restaurant.objects.filter(city=restaurant.city).exclude(id=restaurant.id)[:3]
    return render(request, "restaurant_detail.html", {
        "restaurant": restaurant,
        "similar_restaurants": similar,
    })</pre>
  <p class="body">The template can use <code class="inl">{{ restaurant.name }}</code> and loop over <code class="inl">similar_restaurants</code>, but it has no way to reach anything not explicitly passed in this dictionary, reinforcing MTV's separation: the view decides exactly what data is available, the template only decides how to display it.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming a template can access anything the view has access to.</b> Only what's explicitly included in the context dictionary is visible; forgetting to pass something is a very common source of a template silently rendering blank.</li>
  </ul></div>
  <div class="sec-num">23.1</div><h3 class="section-h">Recap</h3>
  <p class="body">The context dictionary is the entire, explicit interface between a view and its template; nothing else the view has access to is automatically visible to it.</p>
  ${qMC('q1', 'easy', 'If a view forgets to include "similar_restaurants" in the context dictionary, but the template references {{ similar_restaurants }}, what happens?',
    ['Django automatically finds it anyway', 'It renders as empty/nothing, since the template only sees what was explicitly passed in context', 'The page fails to load entirely'],
    1, 'Django templates silently render a missing variable as empty by default, rather than erroring, which is exactly why forgetting to pass something in context is such a common, easy-to-miss bug.')}
`
};

lessons['24'] = {
  short: 'Static files', where: 'Part VI · <b>Static files</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 24</div>
  <h2 class="title">Static files</h2>
  <p class="lead">CSS, JavaScript, and images are "static," they don't change per-request, and Django (and later, a reverse proxy) treats them differently from dynamically rendered HTML.</p>
  <hr class="rule">
  <pre class="code">&lt;!-- in a template --&gt;
{% load static %}
&lt;link rel="stylesheet" href="{% static 'css/tastygo.css' %}"&gt;
&lt;img src="{% static 'images/logo.png' %}"&gt;</pre>
  <p class="body">In development, Django can serve these files itself for convenience. In production, this is exactly where the Fundamentals course's "web server vs. application server" chapter applies directly: a real web server like nginx serves static files far more efficiently than Django itself should, while Django (the application server) focuses purely on dynamic logic.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Relying on Django to serve static files efficiently in production.</b> Django's own static file serving is meant for development convenience only; production setups hand this job to a dedicated web server or CDN.</li>
  </ul></div>
  <div class="sec-num">24.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Static files (CSS, JS, images) are referenced via {% static %} in templates. Development serves them directly; production hands this job to a dedicated web server, exactly the division of labour covered in the Fundamentals course.</p>
  ${qMC('q1', 'med', 'Why shouldn\'t Django itself serve static files in production?',
    ['Django cannot technically serve static files at all', 'A dedicated web server (like nginx) serves static files far more efficiently, letting Django focus purely on dynamic request logic', 'Static files don\'t work with the {% static %} tag in production'],
    1, 'This mirrors the Fundamentals course\'s web-server-vs-application-server distinction directly: efficiently serving unchanging files is a web server\'s specialty, not the application server\'s.')}
`
};

lessons['25'] = {
  short: 'The admin panel', where: 'Part VII · <b>The Django admin panel</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 25</div>
  <h2 class="title">The Django admin panel</h2>
  <p class="lead">The ${term('admin_panel', 'admin panel')} is one of Django's most famous features: a working interface to your data, generated automatically, with almost no extra code.</p>
  <hr class="rule">
  <pre class="code">from django.contrib import admin
from .models import Restaurant

admin.site.register(Restaurant)</pre>
  <table class="mockup-table">
    <thead><tr><th>Name</th><th>City</th><th>Rating</th></tr></thead>
    <tbody>
      <tr><td>Domino's</td><td>Mumbai</td><td>4.8</td></tr>
      <tr><td>KFC</td><td>Bangalore</td><td>4.3</td></tr>
    </tbody>
  </table>
  <p class="body">Three lines of code, and TastyGo staff already have a working, permission-aware interface for browsing and editing restaurant data, no custom HTML, forms, or views written by hand. This is enormously useful for internal tools and content management, though it's rarely the right interface for real customers.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Exposing the admin panel to customers as their main interface.</b> It's built for trusted staff managing data, not designed as a customer-facing product experience.</li>
    <li><b>Leaving the default admin URL and weak credentials in production.</b> The admin panel is a high-value target; strong credentials and access restrictions matter, covered further in chapter 26.</li>
  </ul></div>
  <div class="sec-num">25.1</div><h3 class="section-h">Recap</h3>
  <p class="body">admin.site.register(Model) generates a full working admin interface for that model automatically, ideal for internal/staff data management, not intended as a customer-facing product surface.</p>
  ${qMC('q1', 'easy', 'What does admin.site.register(Restaurant) provide?',
    ['A customer-facing restaurant search page', 'An automatically generated, permission-aware interface for staff to view and edit Restaurant data', 'A REST API endpoint for restaurants'],
    1, 'The admin panel is generated directly from the model for internal data management, not a customer-facing feature or an API.')}
`
};

lessons['26'] = {
  short: 'Auth & permissions', where: 'Part VII · <b>Authentication and permissions</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 26</div>
  <h2 class="title">Authentication and permissions</h2>
  <p class="lead">Django ships with a complete user authentication system built in, directly implementing the authentication-vs-authorization distinction from the Fundamentals course.</p>
  <hr class="rule">
  <pre class="code">from django.contrib.auth.decorators import login_required

@login_required
def my_orders(request):
    orders = Order.objects.filter(customer=request.user.customer)
    return render(request, "my_orders.html", {"orders": orders})</pre>
  <div class="qb"><div class="qb-title">Two distinct checks, again</div>
    <div class="qb-row"><span class="qb-kw kw-p">@login_required</span><span class="qb-mean">authentication: is anyone actually logged in?</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">filtering by request.user</span><span class="qb-mean">authorization: showing only this user's own orders, not everyone's</span></div>
  </div>
  <p class="body"><code class="inl">@login_required</code> alone only checks that someone is logged in; it says nothing about which specific orders they should be allowed to see. That second check, filtering by <code class="inl">request.user</code>, is what actually prevents one customer from viewing another's private order history, exactly the QA course's security testing scenario.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming @login_required alone is enough security.</b> It only proves someone is logged in, not that they're allowed to see this specific data; a view still needs its own authorization logic.</li>
  </ul></div>
  <div class="sec-num">26.1</div><h3 class="section-h">Recap</h3>
  <p class="body">@login_required handles authentication (is someone logged in). Filtering data by request.user (or explicit permission checks) handles authorization (are they allowed to see this specific data), and both are needed together.</p>
  ${qScenario('q1', 'hard', 'A view uses @login_required but queries Order.objects.all() instead of filtering by the logged-in customer. What security bug does this create, and how would you fix it?',
    'This lets any logged-in customer see every customer\'s orders, not just their own, an authorization bug: authentication (being logged in) was checked, but authorization (should this specific user see this specific data) was not. Fix: filter the queryset to Order.objects.filter(customer=request.user.customer) so each user only ever retrieves their own orders, regardless of what URL or parameters they might try.')}
`
};

lessons['27'] = {
  short: 'Django REST Framework', where: 'Part VII · <b>Django REST Framework, briefly</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 27</div>
  <h2 class="title">Django REST Framework, briefly</h2>
  <p class="lead">Django itself renders HTML templates by default. When TastyGo needs a real JSON API instead, for a mobile app, or another service, Django REST Framework (DRF) is the standard way to build it.</p>
  <hr class="rule">
  <pre class="code">from rest_framework import serializers, viewsets

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ["id", "name", "city", "rating"]

class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer</pre>
  <p class="body">A serializer converts model instances to and from JSON, directly building on the Python course's json.dumps/loads chapter, and a ViewSet bundles up the typical list/create/retrieve/update/delete operations for a model into ready-made API endpoints.</p>
  <p class="body">This is deliberately a brief introduction: the FastAPI course, next in this Developer track, goes deep on building APIs, using a framework built for that job specifically from the ground up, rather than as an addition to a full web framework.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Building a JSON API by hand-writing JsonResponse everywhere.</b> This works for something tiny, but DRF's serializers and ViewSets remove a large amount of repetitive boilerplate for anything more substantial.</li>
  </ul></div>
  <div class="sec-num">27.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Django REST Framework adds serializers (model &lt;-&gt; JSON conversion) and ViewSets (ready-made CRUD API endpoints) on top of Django, for when you need a real JSON API rather than rendered HTML.</p>
  ${qMC('q1', 'easy', 'What is the main job of a DRF serializer?',
    ['Rendering HTML templates', 'Converting model instances to and from JSON', 'Running database migrations'],
    1, 'A serializer is specifically the translation layer between Python model instances and the JSON representation an API sends and receives.')}
`
};

lessons['28'] = {
  short: 'Production settings', where: 'Part VIII · <b>Settings for production</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 28</div>
  <h2 class="title">Settings for production</h2>
  <p class="lead">A handful of settings.py changes separate a safe, real deployment from a development setup accidentally left exposed to the internet.</p>
  <hr class="rule">
  <pre class="code"># development
DEBUG = True
ALLOWED_HOSTS = []
SECRET_KEY = "hardcoded-for-convenience"

# production
DEBUG = False
ALLOWED_HOSTS = ["tastygo.com"]
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]  # from environment, never committed</pre>
  <div class="qb"><div class="qb-title">Why each one matters</div>
    <div class="qb-row"><span class="qb-kw kw-r">DEBUG = False</span><span class="qb-mean">stops detailed error pages (with internal code/settings) from ever reaching real users</span></div>
    <div class="qb-row"><span class="qb-kw kw-p">ALLOWED_HOSTS</span><span class="qb-mean">rejects requests claiming to be for a domain this server doesn't actually serve</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">SECRET_KEY from environment</span><span class="qb-mean">keeps a sensitive value out of version control entirely</span></div>
  </div>
  <p class="body">This connects directly to the Fundamentals course's dev/staging/production chapter: the same codebase behaves differently depending on environment-specific settings like these, deliberately kept separate from the code itself.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Deploying with DEBUG = True.</b> This can leak internal stack traces, settings, and file paths directly to any user who triggers an error.</li>
    <li><b>Committing SECRET_KEY (or any real credential) into version control.</b> Once committed, it should be considered compromised, even if later removed, since it may remain in the repository's history.</li>
  </ul></div>
  <div class="sec-num">28.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Production settings must set DEBUG = False, configure ALLOWED_HOSTS, and load secrets from the environment rather than hardcoding or committing them.</p>
  ${qMC('q1', 'easy', 'Why is DEBUG = True dangerous in a production deployment?',
    ['It has no real effect, DEBUG only affects development speed', 'It can show detailed internal error pages, potentially leaking sensitive internal information, to real users when something breaks', 'It disables the admin panel entirely'],
    1, 'DEBUG = True shows rich, detailed error pages meant for developers; in production, that same detail becomes a real information leak to anyone who triggers an error.')}
`
};

lessons['29'] = {
  short: 'FastAPI, DevOps, Capstone', where: 'Part VIII · <b>Where to go next: FastAPI, DevOps, Capstone</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 29</div>
  <h2 class="title">Where to go next: FastAPI, DevOps, Capstone</h2>
  <p class="lead">You can now build a real, working Django application: models backed by a real database, views handling requests, templates rendering HTML, an admin panel, and authentication.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">What's ahead</div>
    <div class="qb-row"><span class="qb-kw kw-p">FastAPI</span><span class="qb-mean">a different, leaner approach specifically for building fast, well-documented APIs, worth learning even if Django ends up your main framework</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">DevOps</span><span class="qb-mean">actually deploying a Django app: WSGI/ASGI servers, a reverse proxy in front, containers, CI/CD</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Capstone Project</span><span class="qb-mean">building, containerizing, and deploying a real slice of TastyGo, likely using exactly what this course just taught</span></div>
  </div>
  <p class="body">Django is a strong, complete choice for a full web application with server-rendered pages and an admin panel. FastAPI, taught next, optimizes for a different shape of problem: a lean, fast, well-documented JSON API, often serving a separate frontend or mobile app rather than rendering HTML itself.</p>
  <div class="sec-num">29.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This course built real fluency in Django's MTV pattern, ORM, migrations, views, templates, admin, and auth. FastAPI next explores a different, API-first approach, and DevOps covers actually shipping either one.</p>
  ${qMC('q1', 'easy', 'Which is a more accurate description of when Django tends to be the stronger choice compared to FastAPI?',
    ['Whenever you need any Python code at all', 'When you want a full web application, server-rendered pages, and a built-in admin interface, rather than a lean, API-only backend', 'Django and FastAPI are interchangeable in every situation'],
    1, 'Django\'s strength is being a complete, batteries-included web framework; FastAPI\'s strength is being lean and focused specifically on fast, well-documented APIs, different tools for different shapes of problem.')}
`
};

/* ---------- cheat sheet ---------- */
const CHEATS = {
  '00': { note: 'Django is a batteries-included Python web framework: routing, database access, templating, admin, and security defaults, all provided.' },
  '0b': { note: 'manage.py is the command-line entry point. A project is the whole site; apps are self-contained feature areas within it.' },
  '0i': { note: "TastyGo's Django project mirrors SQLingo's own tables: customers, restaurants, orders apps." },
  '01': { note: 'Split apps by feature area, self-contained but allowed to reference each other; avoid splitting too finely or dumping everything in one giant app.' },
  '02': { code: 'INSTALLED_APPS = [...]   # which apps are active\nDATABASES = {...}        # which real database to connect to\nDEBUG = True/False       # never True in production' },
  '03': { code: 'Request -> urls.py (router) -> View -> Model (ORM, data) -> Template (HTML) -> Response' },
  '04': { code: 'python manage.py runserver   # local dev only, never production' },
  '05': { code: 'urlpatterns = [path("restaurants/", views.restaurant_list), ...]\n# checked top to bottom; first match wins' },
  '06': { code: 'path("orders/<int:order_id>/", views.order_detail)\n# <int:x>, <str:x>, <slug:x> capture and convert part of the URL' },
  '07': { code: 'path(..., name="order-detail")\nreverse("order-detail", args=[42])   # generates the URL by name, not hard-coded text' },
  '08': { code: 'path("orders/", include("orders.urls"))   # delegates a URL prefix to an app\'s own urls.py' },
  '09': { code: 'class Restaurant(models.Model):\n    name = models.CharField(max_length=100)\n    rating = models.FloatField()\n# a model class = a database table' },
  '10': { code: 'null=True     # DB column can be NULL\nblank=True    # form validation allows empty\ndefault=...   # used if no value given' },
  '11': { code: 'Model.objects.filter(...)   # lazy QuerySet, possibly empty\nModel.objects.get(...)      # exactly one, or raises an error' },
  '12': { code: 'customer = models.ForeignKey(Customer, on_delete=models.CASCADE)\n# on_delete is required: CASCADE, SET_NULL, PROTECT, ...' },
  '13': { code: 'Model change -> makemigrations (generates file) -> migrate (applies to real DB). Both committed to version control.' },
  '14': { code: 'python manage.py makemigrations   # generate migration file\npython manage.py migrate          # apply it to the database' },
  '15': { code: 'Adding a required field to a table with existing data needs a default, or the field must allow null.' },
  '16': { code: 'Riskiest migrations: dropping a still-used column, no backup, or locking a large production table. Test on staging with realistic data first.' },
  '17': { code: 'def view(request, id):\n    obj = get_object_or_404(Model, id=id)\n    return render(request, "template.html", {"obj": obj})' },
  '18': { code: 'class RestaurantListView(ListView):\n    model = Restaurant\n# common patterns (list/detail) with no boilerplate' },
  '19': { code: 'request.method, request.GET, request.POST, request.user\n# a view must always return a response (render/JsonResponse/HttpResponse)' },
  '20': { code: 'form = OrderForm(request.POST)\nif form.is_valid():\n    form.cleaned_data   # validated, correctly-typed values' },
  '21': { code: '{{ variable }}   # output\n{% tag %}        # logic: loops, conditionals, inheritance' },
  '22': { code: '{% extends "base.html" %}\n{% block content %}...{% endblock %}   # shared layout, overridden per-page' },
  '23': { code: 'render(request, "t.html", {"key": value})\n# template only sees exactly what\'s in this context dict' },
  '24': { code: '{% static \'css/tastygo.css\' %}\n# dev: Django can serve it. production: a real web server (nginx) should.' },
  '25': { code: 'admin.site.register(Restaurant)\n# instant staff interface, generated from the model, not for customers' },
  '26': { code: '@login_required          # authentication: is anyone logged in?\nfilter(customer=request.user...)   # authorization: is it THEIR data?' },
  '27': { code: 'ModelSerializer   # model <-> JSON\nModelViewSet      # ready-made CRUD API endpoints (Django REST Framework)' },
  '28': { code: 'DEBUG = False\nALLOWED_HOSTS = ["tastygo.com"]\nSECRET_KEY = os.environ["DJANGO_SECRET_KEY"]' },
  '29': { code: 'Django = full app, server-rendered, admin included. FastAPI = lean, API-first. DevOps = deploying either for real.' },
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
  const life = `<div class="iq-flow"><span>Request</span><i>&rarr;</i><span>URLconf</span><i>&rarr;</i><span>Middleware</span><i>&rarr;</i><span>View</span><i>&rarr;</i><span>Model / ORM</span><i>&rarr;</i><span>Template</span><i>&rarr;</i><span>Response</span></div>`;
  return `
  <div class="eyebrow">Interview prep</div>
  <h2 class="title">Django interview questions</h2>
  <p class="lead">A deep, topic-by-topic bank of the Django questions asked in real interviews, grouped by area, with concise answers and the reasoning interviewers listen for. Click any question to expand it.</p>
  <button class="pg-btn pg-ghost" style="margin:6px 0 10px" onclick="window.print()">Print / save as PDF</button>
  <hr class="rule">

  <h3 class="section-h">Fundamentals</h3>
  ${iq('Beginner','What is Django, and what does "batteries included" mean?',`<p>A high-level Python web framework that ships with an ORM, admin, auth, forms, templating, migrations and security defaults out of the box &mdash; so you build features instead of plumbing.</p>`)}
  ${iq('Beginner','What is the MTV pattern (and how does it map to MVC)?',`<p>Django is <b>Model-Template-View</b>: Model = data, Template = presentation, View = logic that ties them together. It maps to MVC where Django "View" is the controller and the "Template" is the view.</p>`)}
  ${iq('Intermediate','Walk through the request-response lifecycle.',`<p>The URLconf matches the path to a view, request middleware runs, the view executes (querying models via the ORM), a template renders the response, response middleware runs, and Django returns it.</p>${life}`)}
  ${iq('Beginner','Project vs app in Django?',`<p>A <b>project</b> is the whole site and its settings; an <b>app</b> is a reusable, self-contained module of functionality (e.g. <code class="inl">orders</code>). A project contains many apps.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Models &amp; the ORM</h3>
  ${iq('Beginner','What is the Django ORM?',`<p>An object-relational mapper: you define models as Python classes and query with Python instead of raw SQL. Django generates the SQL and returns model instances.</p>`)}
  ${iq('Beginner','makemigrations vs migrate?',`<p><code class="inl">makemigrations</code> turns model changes into migration files (a versioned change plan); <code class="inl">migrate</code> applies those files to the database. One authors the change, the other executes it.</p>`)}
  ${iq('Intermediate','QuerySets are lazy &mdash; what does that mean?',`<p>Building a QuerySet does not hit the database; the query runs only when you evaluate it (iterate, slice, <code class="inl">list()</code>, etc.). This lets you chain filters efficiently, but watch for accidental repeated evaluation.</p>`)}
  ${iq('Advanced','select_related vs prefetch_related, and the N+1 problem?',`<p>The <b>N+1</b> problem is one query for a list plus one extra per row for a relation. <code class="inl">select_related</code> fixes it for FK/one-to-one via a SQL JOIN; <code class="inl">prefetch_related</code> fixes it for many-to-many/reverse FK with a second query joined in Python.</p>`)}
  ${iq('Intermediate','Explain the model relationship fields.',`<p><code class="inl">ForeignKey</code> = many-to-one, <code class="inl">ManyToManyField</code> = many-to-many (via a join table), <code class="inl">OneToOneField</code> = one-to-one. Each defines how rows link across tables.</p>`)}
  ${iq('Intermediate','null vs blank on a model field?',`<p><code class="inl">null</code> is database-level (is NULL allowed in the column); <code class="inl">blank</code> is validation-level (may the form field be empty). They are independent &mdash; a common gotcha.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Views, URLs &amp; middleware</h3>
  ${iq('Intermediate','Function-based vs class-based views?',`<p><b>FBVs</b> are simple and explicit &mdash; good for one-off logic. <b>CBVs</b> use inheritance and mixins to reuse common patterns (list, detail, create) with less code, at the cost of a steeper learning curve.</p>`)}
  ${iq('Beginner','How does URL routing work?',`<p><code class="inl">urls.py</code> maps URL patterns to views; Django tries them top to bottom and calls the first match, passing captured path parameters to the view.</p>`)}
  ${iq('Intermediate','What is middleware?',`<p>Hooks that wrap every request/response &mdash; used for auth, sessions, CSRF, security headers, logging. Each middleware can act before the view (on the request) and after (on the response), in order.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Templates, forms &amp; security</h3>
  ${iq('Beginner','What does the template system do?',`<p>It renders HTML from templates with context data, using tags/filters and auto-escaping output to prevent XSS. Logic is intentionally limited to keep presentation and business logic separate.</p>`)}
  ${iq('Intermediate','Forms vs ModelForms?',`<p>A <code class="inl">Form</code> defines fields and validation manually; a <code class="inl">ModelForm</code> builds fields automatically from a model and can save directly to it. Both centralise validation and rendering.</p>`)}
  ${iq('Intermediate','What is CSRF protection and how does Django handle it?',`<p>Cross-Site Request Forgery tricks a logged-in user into submitting an unwanted request. Django issues a per-session CSRF token that must accompany unsafe requests (POST/PUT/DELETE); the middleware rejects mismatches.</p>`)}
  ${iq('Advanced','What security protections does Django provide by default?',`<p>Auto-escaped templates (XSS), CSRF tokens, ORM-parameterised queries (SQL injection), clickjacking protection (X-Frame-Options), secure password hashing, and settings for HTTPS/HSTS/secure cookies.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Admin, auth &amp; APIs</h3>
  ${iq('Beginner','What is the Django admin?',`<p>An auto-generated, model-driven web interface for CRUD on your data &mdash; great for internal/staff tooling with almost no code. You register models and customise list/detail views.</p>`)}
  ${iq('Intermediate','Authentication vs authorization in Django?',`<p><b>Authentication</b> = who you are (the auth system, login, sessions). <b>Authorization</b> = what you may do (permissions, groups, <code class="inl">@login_required</code>, object-level checks).</p>`)}
  ${iq('Intermediate','What is Django REST Framework and a serializer?',`<p>DRF is a toolkit for building web APIs on Django. A <b>serializer</b> converts model instances to/from JSON and validates incoming data &mdash; the API equivalent of a form.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Advanced</h3>
  ${iq('Advanced','What are signals, and when should you be cautious with them?',`<p>Signals let decoupled code react to events (e.g. <code class="inl">post_save</code>). Handy for cross-cutting side effects, but overuse hides control flow and makes debugging harder &mdash; prefer explicit calls when the logic belongs together.</p>`)}
  ${iq('Advanced','Static files vs media files?',`<p><b>Static</b> files are code assets you ship (CSS, JS, images), collected via <code class="inl">collectstatic</code>. <b>Media</b> files are user-uploaded content stored at runtime. They are served and secured differently.</p>`)}
  ${iq('Advanced','WSGI vs ASGI?',`<p><b>WSGI</b> is the traditional synchronous Python web-server interface. <b>ASGI</b> is its async successor, enabling async views, WebSockets and long-lived connections. Modern Django supports both.</p>`)}
  ${iq('Intermediate','How do you manage settings across environments?',`<p>Keep secrets and environment-specific values out of code &mdash; read them from environment variables (dev/staging/prod), split settings modules, and never commit <code class="inl">SECRET_KEY</code> or credentials.</p>`)}
  ${iq('Advanced','How do you improve Django performance?',`<p>Kill N+1 queries (<code class="inl">select_related</code>/<code class="inl">prefetch_related</code>), add DB indexes, cache expensive views/queries, use pagination, defer/only heavy columns, and profile with Django Debug Toolbar.</p>`)}

  <div class="foot" style="margin-top:30px"><span></span><button class="f-btn f-next" onclick="go('${order[0]}')">Back to the course &rarr;</button></div>`;
}
lessons['interview'] = { short: 'Interview Q&A', where: '<b>Interview Q&A</b>', render: renderInterview };


/* ---------- boot ---------- */
computeTotals();
go((function(){try{var l=localStorage.getItem('django_last');return (l&&lessons[l])?l:'00';}catch(e){return '00';}})());

/* Re-entry hook: see the matching comment in public/app.js / public/ba.js / public/qa.js / public/devfund.js. */
window.__djangoReinit = function () {
  const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
  buildNav();
  computeTotals();
  go(curCh || order[0] || '00');
};
