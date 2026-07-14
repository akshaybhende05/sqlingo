/* ============================================================
   Developer Track — FastAPI course engine
   Fourth of six Developer courses. Mirrors public/django.js:
   manifest, lessons, progress tracking, search, cheat sheet,
   glossary. Practice is qMC (predict behaviour/correctness) +
   qScenario (write code by hand, compare with a model answer) —
   a real FastAPI + ASGI server + database stack isn't feasible
   to run live in-browser, same reasoning as the Django course.
   ============================================================ */

document.getElementById('loader').style.display = 'none';

/* ---------- glossary ---------- */
const glossary = {
  pydantic: { short: 'A library FastAPI uses to define data shapes as classes and validate data against them automatically.', long: 'Pydantic lets you describe the exact shape of expected data (field names, types, constraints) as a plain Python class. FastAPI uses this to automatically validate incoming requests and serialize outgoing responses, rejecting anything that doesn\'t match.' },
  path_operation: { short: 'A function connected to a specific URL path and HTTP method.', long: 'A path operation is the core building block of a FastAPI app: a function decorated with something like @app.get("/orders/{id}"), telling FastAPI exactly which path and HTTP method should trigger it.' },
  dependency_injection: { short: 'A function declares what it needs, and the framework supplies it automatically.', long: 'Dependency injection means a path operation can simply declare "I need a database session" or "I need the current user," and FastAPI figures out how to provide it, without the function needing to know how that dependency is actually constructed.' },
  async_await: { short: 'A way of writing code that can pause while waiting, without blocking everything else.', long: 'async/await lets a function pause at a slow operation (a database query, a network call) and let other work happen in the meantime, resuming once the slow operation finishes, instead of the whole program sitting idle waiting.' },
  concurrency: { short: 'Handling many tasks by interleaving their waiting periods.', long: 'Concurrency means making progress on multiple tasks by switching between them, especially useful when tasks spend a lot of time waiting (on a network or disk), without necessarily running literally simultaneously the way true parallelism does.' },
  cors: { short: 'A browser rule controlling which websites can call your API directly from their own pages.', long: 'CORS (Cross-Origin Resource Sharing) is a browser-enforced security rule: by default, a page on one website cannot make a request to an API on a different domain unless that API explicitly allows it, protecting users from certain kinds of malicious cross-site requests.' },
  jwt: { short: "A compact, signed token proving a user's identity across requests.", long: 'A JWT (JSON Web Token) is a signed, tamper-evident token containing claims about a user (like their id), which a server can verify without needing to store session state itself, commonly used for API authentication.' },
  uvicorn: { short: 'The ASGI server that actually runs a FastAPI application.', long: 'Uvicorn is a lightweight, fast ASGI server, the actual program that listens for HTTP requests and hands them to your FastAPI application code, similar in role to how gunicorn runs a WSGI application like Django.' },
  type_hint: { short: 'A Python annotation stating what type a value is expected to be.', long: 'A type hint, like def get_total(amount: float) -> float:, tells both readers and tools (including FastAPI itself) what type a value is expected to be, which FastAPI reads directly to generate validation and automatic documentation.' },
};
function term(w, label) {
  const g = glossary[w];
  return `<span class="term" tabindex="0" role="button" aria-label="${label || w}, glossary term, press Enter to read more" onclick="fastapiMore('${w}',this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();fastapiMore('${w}',this)}">${label || w}<span class="tip">${g.short}<br><span style="color:#7fd8cb;font-size:11px">press Enter or click to read more</span></span></span>`;
}
function fastapiMore(w, el) {
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
try { PROG = JSON.parse(localStorage.getItem('fastapi_progress') || '{}'); } catch (_) { PROG = {}; }
function markProg(ch, id) { if (!ch) return; if (!PROG[ch]) PROG[ch] = {}; PROG[ch][id] = true; try { localStorage.setItem('fastapi_progress', JSON.stringify(PROG)); } catch (_) { } updateCourse(); }
function overallSolved() { let n = 0; for (const c in PROG) { n += Object.keys(PROG[c]).length; } return n; }
function updateCourse() {
  const el = document.getElementById('courseProg'); const fill = document.getElementById('courseProgFill'); const n = overallSolved();
  const done = TOTAL_Q > 0 && n >= TOTAL_Q;
  if (el) el.textContent = TOTAL_Q ? (done ? `Course complete — ${n} / ${TOTAL_Q} solved` : `Overall: ${n} / ${TOTAL_Q} solved`) : '';
  if (fill) fill.style.width = TOTAL_Q ? ((n / TOTAL_Q) * 100) + '%' : '0%';
  if (done) celebrateOnce();
}
function celebrateOnce() {
  let shown = false; try { shown = localStorage.getItem('fastapi_celebrated') === '1'; } catch (_) { }
  if (shown) return;
  try { localStorage.setItem('fastapi_celebrated', '1'); } catch (_) { }
  const t = document.createElement('div'); t.className = 'celebrate-toast';
  t.innerHTML = '<b>Every chapter solved.</b><br>You have worked through the whole FastAPI course. DevOps and the Capstone are next.';
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('show'); }, 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 6000);
}
function computeTotals() { const sq = qCount; TOTAL_Q = 0; for (const k in lessons) { qCount = 0; try { lessons[k].render(); } catch (_) { } TOTAL_Q += qCount; } qCount = sq; for (const kk in answers) delete answers[kk]; updateCourse(); }
function resetProgress() { if (!window.confirm('Reset all solved progress across every chapter? This cannot be undone.')) return; PROG = {}; try { localStorage.removeItem('fastapi_progress'); } catch (_) { } updateCourse(); if (curCh) go(curCh); }
function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('navOverlay').classList.toggle('show'); }
function closeMenu() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('navOverlay').classList.remove('show'); }

/* ---------- navigation ---------- */
const manifest = [
  { p: 'Groundwork', items: [['00', 'What is FastAPI, and how is it different from Django?', 1], ['0b', "FastAPI's toolkit: uvicorn, Pydantic, and automatic docs", 1], ['0i', "Meet the project: building TastyGo's API with FastAPI", 1]] },
  { p: 'Part I · Path operations & routing', items: [['01', 'Your first path operation', 1], ['02', 'Path parameters', 1], ['03', 'Query parameters', 1], ['04', 'Combining path and query parameters', 1]] },
  { p: 'Part II · Request & response bodies', items: [['05', 'Pydantic models: request bodies', 1], ['06', 'Response models', 1], ['07', 'Optional fields and defaults', 1], ['08', 'Nested Pydantic models', 1]] },
  { p: 'Part III · Validation', items: [['09', 'Type-based validation, automatically', 1], ['10', 'Field constraints', 1], ['11', 'Custom validators', 1], ['12', 'Handling validation errors', 1]] },
  { p: 'Part IV · Async & performance', items: [['13', 'What async/await actually means', 1], ['14', 'When to use async def vs. def', 1], ['15', 'Concurrency vs. parallelism', 1], ['16', 'Common async pitfalls', 1]] },
  { p: 'Part V · Dependency injection', items: [['17', 'What dependency injection is, and why', 1], ['18', 'Depends() basics', 1], ['19', 'Shared dependencies', 1], ['20', 'Dependencies with parameters', 1]] },
  { p: 'Part VI · Real-world API design', items: [['21', 'Status codes and error responses', 1], ['22', 'Authentication with OAuth2/JWT', 1], ['23', 'CORS, and why it matters', 1], ['24', 'Versioning an API', 1]] },
  { p: 'Part VII · Docs & testing', items: [['25', 'Swagger UI and ReDoc, automatically', 1], ['26', 'Testing with TestClient', 1], ['27', 'Connecting a real database', 1]] },
  { p: 'Part VIII · Shipping it', items: [['28', 'Running FastAPI in production', 1], ['29', 'Where to go next: DevOps, Capstone', 1]] },
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
  try { localStorage.setItem('fastapi_last', num); } catch (_) {}
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
  short: 'What is FastAPI?', where: 'Groundwork · <b>What is FastAPI, and how is it different from Django?</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 00</div>
  <h2 class="title">What is FastAPI, and how is it different from Django?</h2>
  <p class="lead">FastAPI is a modern Python ${term('path_operation', 'framework')} built specifically for one job: fast, well-documented APIs, with data validation built in from the ground up.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Django vs. FastAPI, at a glance</div>
    <div class="qb-row"><span class="qb-kw kw-p">Django</span><span class="qb-mean">batteries-included: templates, admin panel, auth, ORM, built for full web applications</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">FastAPI</span><span class="qb-mean">lean and focused: no templates or admin panel, built specifically for APIs, with validation and automatic documentation as first-class features</span></div>
  </div>
  <p class="body">Where Django's views return rendered HTML, a FastAPI path operation typically returns data (JSON), meant to be consumed by a separate frontend, a mobile app, or another service, exactly the API-first shape the Fundamentals course's "frontend, backend, and full-stack" chapter described.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming FastAPI is simply "a smaller Django."</b> It's built around a different core idea entirely: Python type hints driving automatic validation and documentation, not templates and an ORM.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">FastAPI is a lean, API-focused framework, built around type hints for automatic validation and documentation, a different tool for a different shape of problem than Django's full-application approach.</p>
  ${qMC('q1', 'easy', 'What is FastAPI primarily built for?',
    ['Rendering server-side HTML templates', 'Building fast, well-documented APIs with built-in data validation', 'Managing database migrations'],
    1, 'FastAPI is deliberately focused on APIs specifically, using Python type hints to drive automatic request validation and documentation generation.')}
`
};

lessons['0b'] = {
  short: "FastAPI's toolkit", where: 'Groundwork · <b>FastAPI&#39;s toolkit: uvicorn, Pydantic, and automatic docs</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0b</div>
  <h2 class="title">FastAPI's toolkit: uvicorn, Pydantic, and automatic docs</h2>
  <p class="lead">Three pieces work together, each doing a distinct job.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">The three pieces</div>
    <div class="qb-row"><span class="qb-kw kw-p">${term('uvicorn', 'uvicorn')}</span><span class="qb-mean">the ASGI server that actually runs your FastAPI app and listens for requests</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">${term('pydantic', 'Pydantic')}</span><span class="qb-mean">validates and shapes request/response data based on classes you define</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Automatic docs</span><span class="qb-mean">an interactive API reference (Swagger UI / ReDoc) generated for free from your code</span></div>
  </div>
  <pre class="code">$ uvicorn main:app --reload
INFO:     Uvicorn running on http://127.0.0.1:8000</pre>
  <p class="body">Running <code class="inl">uvicorn main:app</code> starts the server; visiting <code class="inl">/docs</code> shows a fully interactive page listing every endpoint, generated automatically from the same type hints and Pydantic models you'll write throughout this course, no separate documentation effort required.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting FastAPI itself doesn't run the server.</b> FastAPI defines the application; uvicorn (or another ASGI server) is what actually runs it and handles real network connections.</li>
  </ul></div>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">uvicorn runs the app, Pydantic validates data, and automatic docs are generated for free from your own type hints and models, no extra documentation work required.</p>
  ${qMC('q1', 'easy', 'What is uvicorn\'s role in a FastAPI application?',
    ['It validates incoming request data', 'It is the ASGI server that actually runs the application and handles real network connections', 'It generates the interactive API documentation'],
    1, 'FastAPI defines the application logic; uvicorn is the separate server process that actually runs it and listens for real requests.')}
`
};

lessons['0i'] = {
  short: 'Meet the project', where: 'Groundwork · <b>Meet the project: building TastyGo&#39;s API with FastAPI</b>', render: () => `
  <div class="eyebrow">Groundwork · Chapter 0i</div>
  <h2 class="title">Meet the project: building TastyGo's API with FastAPI</h2>
  <p class="lead">Same TastyGo, same customers/restaurants/orders shape. This time, you're building the pure API layer a mobile app or frontend would actually call.</p>
  <hr class="rule">
  <p class="body">Throughout this course, you'll design endpoints like <code class="inl">GET /restaurants</code>, <code class="inl">POST /orders</code>, and <code class="inl">GET /orders/{id}</code>, each backed by a Pydantic model describing exactly what data goes in and comes out, building toward the same Capstone Project the Django course pointed to, just via a different, API-first route.</p>
  <div class="sec-num">0.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This course builds TastyGo's API layer directly, endpoint by endpoint, using the same customers/restaurants/orders shape from every other CareerLadder course.</p>
  ${qMC('q1', 'easy', 'What will this course primarily have you design and build?', ['HTML templates for TastyGo\'s website', 'API endpoints for TastyGo, backed by Pydantic models', 'A relational database schema from scratch'], 1, 'This course is specifically about the API layer: endpoints, request/response shapes, and the validation behind them.')}
`
};

lessons['01'] = {
  short: 'Your first path operation', where: 'Part I · <b>Your first path operation</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 01</div>
  <h2 class="title">Your first path operation</h2>
  <p class="lead">A ${term('path_operation', 'path operation')} connects a URL path and an HTTP method to a Python function, FastAPI's most fundamental building block.</p>
  <hr class="rule">
  <pre class="code">from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Welcome to TastyGo"}

@app.get("/restaurants")
def list_restaurants():
    return [{"name": "Domino's"}, {"name": "KFC"}]</pre>
  <p class="body"><code class="inl">@app.get("/restaurants")</code> means "when a GET request arrives for /restaurants, run this function," and whatever the function returns (here, a Python list of dicts) is automatically converted into a JSON response, no manual serialization needed.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using the wrong HTTP method decorator.</b> @app.get is for reading data; @app.post, @app.put, @app.delete match their respective methods, using the wrong one means clients calling with the "right" method get a 405 (method not allowed).</li>
  </ul></div>
  <div class="sec-num">1.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A path operation is a decorated function (@app.get, @app.post, etc.) connecting an HTTP method and path to Python code; returned Python data is automatically converted to JSON.</p>
  ${qScenario('q1', 'easy', 'Write a path operation for GET /orders that returns a hardcoded list containing one example order dict with id and total.',
`@app.get("/orders")
def list_orders():
    return [{"id": 1, "total": 450}]`)}
`
};

lessons['02'] = {
  short: 'Path parameters', where: 'Part I · <b>Path parameters</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 02</div>
  <h2 class="title">Path parameters</h2>
  <p class="lead">A variable part of the URL, like which specific order to fetch, is declared directly as a typed function parameter.</p>
  <hr class="rule">
  <pre class="code">@app.get("/orders/{order_id}")
def get_order(order_id: int):
    return {"id": order_id, "total": 450}</pre>
  <p class="body">The ${term('type_hint', 'type hint')} <code class="inl">: int</code> does real work here: FastAPI automatically converts the URL text into an actual Python int, and automatically rejects the request with a clear validation error if someone requests <code class="inl">/orders/abc</code>, no manual parsing or checking required.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting the type hint entirely.</b> Without it, FastAPI still works, but you lose automatic validation and the parameter arrives as a plain string, exactly like the boundary-value bugs the QA course warned about.</li>
  </ul></div>
  <div class="sec-num">2.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Path parameters are declared as typed function parameters matching the {name} in the decorated path; FastAPI converts and validates them automatically.</p>
  ${qScenario('q1', 'easy', 'Write a path operation for GET /restaurants/{restaurant_id} that takes restaurant_id as an int and returns {"id": restaurant_id}.',
`@app.get("/restaurants/{restaurant_id}")
def get_restaurant(restaurant_id: int):
    return {"id": restaurant_id}`)}
`
};

lessons['03'] = {
  short: 'Query parameters', where: 'Part I · <b>Query parameters</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 03</div>
  <h2 class="title">Query parameters</h2>
  <p class="lead">Parameters that aren't part of the URL path itself, like optional filters, are just extra function parameters with default values.</p>
  <hr class="rule">
  <pre class="code">@app.get("/restaurants")
def list_restaurants(city: str = None, min_rating: float = 0.0):
    # GET /restaurants?city=Mumbai&min_rating=4.5
    ...</pre>
  <p class="body">Any parameter not captured in the path's <code class="inl">{ }</code> is automatically treated as a query parameter, read from after the <code class="inl">?</code> in the URL. Giving it a default value (like <code class="inl">= 0.0</code>) makes it optional; omitting a default makes it required.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Expecting a query parameter without a default to be optional.</b> Without a default value, FastAPI treats it as required, and requests omitting it get a validation error.</li>
  </ul></div>
  <div class="sec-num">3.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Function parameters not present in the path become query parameters automatically. A default value makes one optional; no default makes it required.</p>
  ${qMC('q1', 'easy', 'In def list_restaurants(city: str = None, min_rating: float = 0.0):, are city and min_rating required or optional?',
    ['Both required', 'Both optional, since both have default values', 'city is required, min_rating is optional'],
    1, 'Both parameters have default values (None and 0.0 respectively), which makes both optional query parameters.')}
`
};

lessons['04'] = {
  short: 'Combining path & query', where: 'Part I · <b>Combining path and query parameters</b>', render: () => `
  <div class="eyebrow">Part I · Chapter 04</div>
  <h2 class="title">Combining path and query parameters</h2>
  <p class="lead">Real endpoints often need both: a required path parameter identifying a specific resource, plus optional query parameters refining the request further.</p>
  <hr class="rule">
  <pre class="code">@app.get("/restaurants/{restaurant_id}/orders")
def restaurant_orders(restaurant_id: int, status: str = None, limit: int = 10):
    # GET /restaurants/7/orders?status=delivered&limit=5
    ...</pre>
  <p class="body">FastAPI figures out which is which automatically: <code class="inl">restaurant_id</code> matches the <code class="inl">{restaurant_id}</code> in the path, while <code class="inl">status</code> and <code class="inl">limit</code>, not present in the path, become query parameters, no special syntax needed to distinguish them beyond the function signature itself.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Renaming a function parameter without updating the path.</b> The parameter name must exactly match the name inside {} in the path string, or FastAPI treats it as an unrelated query parameter instead.</li>
  </ul></div>
  <div class="sec-num">4.1</div><h3 class="section-h">Recap</h3>
  <p class="body">FastAPI matches function parameters to path parameters by name; anything left over becomes a query parameter automatically, no extra configuration required.</p>
  ${qScenario('q1', 'med', 'Write a path operation for GET /customers/{customer_id}/orders with an optional query parameter min_amount (int, default 0), returning a dict of both values.',
`@app.get("/customers/{customer_id}/orders")
def customer_orders(customer_id: int, min_amount: int = 0):
    return {"customer_id": customer_id, "min_amount": min_amount}`)}
`
};

lessons['05'] = {
  short: 'Pydantic request bodies', where: 'Part II · <b>Pydantic models: request bodies</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 05</div>
  <h2 class="title">Pydantic models: request bodies</h2>
  <p class="lead">For anything more complex than a single value, a ${term('pydantic', 'Pydantic')} model defines the exact shape of the data a request body should contain.</p>
  <hr class="rule">
  <pre class="code">from pydantic import BaseModel

class OrderCreate(BaseModel):
    restaurant_id: int
    amount: int

@app.post("/orders")
def create_order(order: OrderCreate):
    return {"received": order.amount, "restaurant_id": order.restaurant_id}</pre>
  <p class="body">FastAPI reads the <code class="inl">order: OrderCreate</code> type hint and automatically: parses the incoming JSON body, validates every field matches the declared types, and rejects the request with a clear error if anything is missing or the wrong type, all before your function body even runs.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using a plain dict instead of a Pydantic model for a request body.</b> This loses all of FastAPI's automatic validation and documentation generation for that data.</li>
  </ul></div>
  <div class="sec-num">5.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A Pydantic model (subclassing BaseModel) declares a request body's expected shape; FastAPI parses and validates incoming JSON against it automatically before your function runs.</p>
  ${qScenario('q1', 'med', 'Write a Pydantic model CustomerCreate with fields name (str) and city (str), and a POST /customers path operation accepting it.',
`class CustomerCreate(BaseModel):
    name: str
    city: str

@app.post("/customers")
def create_customer(customer: CustomerCreate):
    return {"name": customer.name, "city": customer.city}`)}
`
};

lessons['06'] = {
  short: 'Response models', where: 'Part II · <b>Response models</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 06</div>
  <h2 class="title">Response models</h2>
  <p class="lead">Just as a Pydantic model can describe an expected request, one can describe exactly what a response should contain, controlling what actually gets sent back.</p>
  <hr class="rule">
  <pre class="code">class OrderOut(BaseModel):
    id: int
    total: int

@app.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: int):
    return {"id": order_id, "total": 450, "internal_notes": "flagged for review"}
    # "internal_notes" is automatically stripped, since it's not part of OrderOut</pre>
  <p class="body"><code class="inl">response_model</code> acts as a filter and a contract: even if your function's returned data has extra fields, only what's declared in the response model actually gets sent, preventing accidental leaks of internal-only data, exactly the kind of "sensitive data exposure" the QA course's security chapter warned about.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Skipping response_model and returning raw internal data directly.</b> Without it, whatever your function returns goes straight to the client, including fields you may not have meant to expose.</li>
  </ul></div>
  <div class="sec-num">6.1</div><h3 class="section-h">Recap</h3>
  <p class="body">response_model declares and enforces the exact shape of a response, filtering out any extra fields your function might otherwise accidentally return.</p>
  ${qMC('q1', 'med', 'If a path operation returns a dict with an extra field not declared in its response_model, what happens?',
    ['The extra field is included in the response anyway', 'The extra field is automatically stripped out, since only the declared response_model fields are sent', 'FastAPI raises an error and the request fails'],
    1, 'response_model acts as an output filter/contract; fields not declared in it are dropped from the actual response sent to the client.')}
`
};

lessons['07'] = {
  short: 'Optional fields & defaults', where: 'Part II · <b>Optional fields and defaults</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 07</div>
  <h2 class="title">Optional fields and defaults</h2>
  <p class="lead">Not every field a client might send is required. Pydantic models express this the same way plain Python does: with default values.</p>
  <hr class="rule">
  <pre class="code">from typing import Optional

class OrderCreate(BaseModel):
    restaurant_id: int
    amount: int
    notes: Optional[str] = None
    is_gift: bool = False</pre>
  <p class="body"><code class="inl">notes</code> and <code class="inl">is_gift</code> are optional: a client can omit them entirely, and Pydantic fills in the default. <code class="inl">restaurant_id</code> and <code class="inl">amount</code>, with no default, are required, omitting either one produces a validation error.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming Optional[str] alone makes a field optional.</b> Optional[str] means the value can be a string or None, but without a default value, it's still required to be present (even if it's explicitly None); the = None is what actually makes it optional to omit.</li>
  </ul></div>
  <div class="sec-num">7.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A default value makes a Pydantic field optional to omit; no default makes it required, exactly the same rule as regular Python function parameters.</p>
  ${qMC('q1', 'med', 'Given <code class="inl">notes: Optional[str] = None</code>, what happens if a client sends a request with no "notes" field at all?',
    ['The request is rejected as invalid', 'notes defaults to None, since a default value was provided', 'notes becomes an empty string automatically'],
    1, 'Since notes has a default value (None), a client can omit it entirely and Pydantic fills in that default rather than requiring it to be present.')}
`
};

lessons['08'] = {
  short: 'Nested Pydantic models', where: 'Part II · <b>Nested Pydantic models</b>', render: () => `
  <div class="eyebrow">Part II · Chapter 08</div>
  <h2 class="title">Nested Pydantic models</h2>
  <p class="lead">Real data is rarely flat. A Pydantic model can contain other Pydantic models, mirroring exactly the nested JSON shape a real API needs to send or receive.</p>
  <hr class="rule">
  <svg viewBox="0 0 460 170" class="diagram" role="img" aria-label="An Order model containing a nested Customer model and a list of nested OrderItem models">
    <rect x="140" y="20" width="180" height="40" rx="8" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="230" y="45" text-anchor="middle" font-size="11" fill="#7a251c">Order</text>
    <rect x="20" y="100" width="180" height="40" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="110" y="125" text-anchor="middle" font-size="11" fill="var(--teal-deep)">Customer</text>
    <rect x="260" y="100" width="180" height="40" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="350" y="125" text-anchor="middle" font-size="11" fill="#7a4b0a">list[OrderItem]</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrFA1)"><path d="M200,60 L130,99"/><path d="M260,60 L330,99"/></g>
    <defs><marker id="arrFA1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <pre class="code">class Customer(BaseModel):
    name: str
    city: str

class OrderItem(BaseModel):
    name: str
    price: int

class Order(BaseModel):
    customer: Customer
    items: list[OrderItem]
    total: int</pre>
  <p class="body">FastAPI validates every level automatically: a malformed nested customer object, or an item in the list missing its price, is caught with a clear error pointing at exactly which nested field failed, without you writing any of that validation logic by hand.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Flattening deeply nested data into one giant model.</b> Composing smaller models (like Customer and OrderItem here) mirrors the real data shape and keeps each piece independently reusable and testable.</li>
  </ul></div>
  <div class="sec-num">8.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Pydantic models can nest inside each other (including lists of models), and FastAPI validates every level automatically, matching real-world nested JSON shapes directly.</p>
  ${qScenario('q1', 'hard', 'Write nested Pydantic models for a Restaurant that has a name (str) and a list of MenuItem, each with a name (str) and price (int).',
`class MenuItem(BaseModel):
    name: str
    price: int

class Restaurant(BaseModel):
    name: str
    menu: list[MenuItem]`)}
`
};

lessons['09'] = {
  short: 'Type-based validation', where: 'Part III · <b>Type-based validation, automatically</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 09</div>
  <h2 class="title">Type-based validation, automatically</h2>
  <p class="lead">The same type hints that give you editor autocomplete also drive FastAPI's entire validation system, no separate validation code required for the basics.</p>
  <hr class="rule">
  <pre class="code">class OrderCreate(BaseModel):
    amount: int   # a request sending "amount": "abc" is rejected automatically

# FastAPI's automatic error response for invalid input:
# {"detail": [{"loc": ["body", "amount"], "msg": "value is not a valid integer", ...}]}</pre>
  <p class="body">Declaring <code class="inl">amount: int</code> is simultaneously documentation, editor support, and a validation rule. This directly answers the QA course's negative-testing question, "what happens with invalid input", for the most basic case: it's rejected before your own code ever runs, with a precise, structured error message.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming type-based validation covers every business rule.</b> It confirms the shape and basic type of data; genuine business rules (like "amount must be positive") need the field constraints or custom validators covered in the next two chapters.</li>
  </ul></div>
  <div class="sec-num">9.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Type hints on a Pydantic model automatically drive request validation; invalid data is rejected with a structured error before your own function code ever runs.</p>
  ${qMC('q1', 'easy', 'If a client sends "amount": "not-a-number" for a field declared as amount: int, what happens?',
    ['Your function receives the string as-is and must check it manually', 'FastAPI automatically rejects the request with a validation error before your function runs', 'FastAPI silently converts it to 0'],
    1, 'Type-based validation happens automatically before your path operation function body executes; invalid data never reaches your own code.')}
`
};

lessons['10'] = {
  short: 'Field constraints', where: 'Part III · <b>Field constraints</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 10</div>
  <h2 class="title">Field constraints</h2>
  <p class="lead">Beyond basic type, Pydantic's Field lets you declare real constraints, directly implementing the QA course's boundary-value thinking as executable validation rules.</p>
  <hr class="rule">
  <pre class="code">from pydantic import BaseModel, Field

class OrderCreate(BaseModel):
    amount: int = Field(gt=0, le=50000)
    notes: str = Field(default="", max_length=200)</pre>
  <div class="qb"><div class="qb-title">Common constraints</div>
    <div class="qb-row"><span class="qb-kw kw-p">gt / ge</span><span class="qb-mean">greater than / greater than or equal</span></div>
    <div class="qb-row"><span class="qb-kw kw-a">lt / le</span><span class="qb-mean">less than / less than or equal</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">max_length / min_length</span><span class="qb-mean">for strings</span></div>
  </div>
  <p class="body">An order amount of 0 or -50 is now rejected automatically, the exact boundary values the QA course's boundary-value-analysis chapter would test for, enforced here directly in the data model rather than scattered checks throughout view logic.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Relying only on the frontend to enforce constraints like this.</b> A backend must enforce its own constraints independently; a determined client can bypass frontend-only validation entirely.</li>
  </ul></div>
  <div class="sec-num">10.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Field() adds real constraints (ranges, lengths) on top of basic type checking, enforced automatically, directly encoding boundary values as part of the data model itself.</p>
  ${qScenario('q1', 'med', 'Add a constraint to a rating: float field so it must be between 0 and 5 inclusive.',
    'rating: float = Field(ge=0, le=5) — ge (greater than or equal) and le (less than or equal) together express the inclusive 0-5 range.')}
`
};

lessons['11'] = {
  short: 'Custom validators', where: 'Part III · <b>Custom validators</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 11</div>
  <h2 class="title">Custom validators</h2>
  <p class="lead">Some rules can't be expressed as a simple range or length. A custom validator runs your own logic as part of the same automatic validation process.</p>
  <hr class="rule">
  <pre class="code">from pydantic import BaseModel, field_validator

class OrderCreate(BaseModel):
    promo_code: str

    @field_validator("promo_code")
    @classmethod
    def promo_code_must_be_uppercase(cls, v):
        if not v.isupper():
            raise ValueError("promo_code must be uppercase")
        return v</pre>
  <p class="body">This runs automatically, alongside the built-in type and constraint checks, for every request, raising the same kind of structured validation error a client sees for a plain type mismatch, keeping all of a request's validation logic in one consistent place: the model itself.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Putting this kind of validation inside the path operation function instead.</b> Keeping it in the model keeps validation logic reusable and consistent everywhere that model is used, not just in one specific endpoint.</li>
  </ul></div>
  <div class="sec-num">11.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A custom validator (@field_validator) runs your own logic as part of Pydantic's normal validation process, for rules too specific for a simple type or Field constraint.</p>
  ${qMC('q1', 'med', 'Why define a custom validator on the model rather than checking the rule manually inside the path operation function?',
    ['Model-level validators run slower', 'Keeping validation in the model makes it consistent and reusable everywhere that model is used, not just in one endpoint', 'Path operation functions cannot contain any logic at all'],
    1, 'A validator defined on the model applies consistently wherever that model is used to parse data, rather than needing to be manually repeated in every endpoint that happens to use it.')}
`
};

lessons['12'] = {
  short: 'Handling validation errors', where: 'Part III · <b>Handling validation errors</b>', render: () => `
  <div class="eyebrow">Part III · Chapter 12</div>
  <h2 class="title">Handling validation errors</h2>
  <p class="lead">When validation fails, FastAPI already returns a structured, useful error automatically, worth understanding rather than fighting.</p>
  <hr class="rule">
  <pre class="code">// A request sending {"amount": -50, "restaurant_id": "abc"} produces:
{
  "detail": [
    {"loc": ["body", "amount"], "msg": "Input should be greater than 0", ...},
    {"loc": ["body", "restaurant_id"], "msg": "value is not a valid integer", ...}
  ]
}</pre>
  <p class="body">This is a real, automatic 422 (Unprocessable Entity) response, precisely pinpointing every field that failed and why, in one response, exactly the kind of clear, actionable error a good bug report (from the QA course) aims for, except generated automatically for every endpoint.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Writing your own generic "invalid input" catch-all instead of trusting this default.</b> FastAPI's default validation errors are already detailed and standardized; replacing them usually loses useful information without a good reason.</li>
  </ul></div>
  <div class="sec-num">12.1</div><h3 class="section-h">Recap</h3>
  <p class="body">FastAPI automatically returns a 422 response with a structured list of every failed field and why, for any request that fails Pydantic validation, no extra code required.</p>
  ${qMC('q1', 'easy', 'What HTTP status code does FastAPI return automatically for a request that fails Pydantic validation?',
    ['200', '422', '500'],
    1, '422 Unprocessable Entity is the standard status FastAPI uses automatically for requests that are well-formed but fail validation, distinct from a 500 server error.')}
`
};

lessons['13'] = {
  short: 'async/await', where: 'Part IV · <b>What async/await actually means</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 13</div>
  <h2 class="title">What async/await actually means</h2>
  <p class="lead">${term('async_await', 'async/await')} lets a function pause during a slow operation and let other work happen, instead of the whole program sitting idle.</p>
  <hr class="rule">
  <svg viewBox="0 0 600 150" class="diagram" role="img" aria-label="Synchronous code blocks entirely during a slow database call; async code can handle another request while waiting">
    <text x="10" y="20" font-size="11" font-weight="700" fill="var(--ink-soft)">Synchronous: blocks entirely while waiting</text>
    <rect x="10" y="30" width="580" height="30" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="300" y="50" text-anchor="middle" font-size="10" fill="#7a251c">Request A: -----waiting for database (nothing else happens)-----&gt; done</text>
    <text x="10" y="95" font-size="11" font-weight="700" fill="var(--ink-soft)">Async: other work happens during the wait</text>
    <rect x="10" y="105" width="280" height="30" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="150" y="125" text-anchor="middle" font-size="10" fill="var(--teal-deep)">Request A: waiting for DB...</text>
    <rect x="300" y="105" width="280" height="30" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="440" y="125" text-anchor="middle" font-size="10" fill="#7a4b0a">Request B handled meanwhile</text>
  </svg>
  <pre class="code">@app.get("/orders/{order_id}")
async def get_order(order_id: int):
    order = await fetch_order_from_db(order_id)
    return order</pre>
  <p class="body"><code class="inl">await</code> marks the exact point where a function pauses for something slow (a database query, an external API call), letting the server handle other incoming requests during that wait, then resuming exactly where it left off once the result is ready.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming async makes individual requests faster.</b> A single request doesn't complete quicker; async lets the server handle many more requests concurrently during their respective waiting periods.</li>
  </ul></div>
  <div class="sec-num">13.1</div><h3 class="section-h">Recap</h3>
  <p class="body">async/await lets a function pause during slow I/O and let other work proceed, improving how many requests a server can handle concurrently, not the speed of any single request.</p>
  ${qMC('q1', 'easy', 'What does async/await primarily improve?',
    ['How fast a single request completes', 'How many requests a server can handle concurrently by not blocking during slow waits', 'The accuracy of Pydantic validation'],
    1, 'async/await\'s benefit is concurrency: not blocking the whole server during a slow operation, letting other requests get handled during that wait, rather than speeding up any one request itself.')}
`
};

lessons['14'] = {
  short: 'async def vs. def', where: 'Part IV · <b>When to use async def vs. def</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 14</div>
  <h2 class="title">When to use async def vs. def</h2>
  <p class="lead">FastAPI supports both; picking correctly matters more than defaulting to async everywhere.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">A simple rule of thumb</div>
    <div class="qb-row"><span class="qb-kw kw-p">async def</span><span class="qb-mean">use when the function awaits something (an async database driver, an async HTTP call)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">def</span><span class="qb-mean">use for regular, synchronous code, FastAPI runs it in a separate thread pool automatically so it still doesn't block the whole server</span></div>
  </div>
  <pre class="code">@app.get("/orders/{order_id}")
def get_order(order_id: int):
    # a plain, synchronous database call: no "await" involved, use plain def
    return db.query_order(order_id)</pre>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Marking a function async def without actually awaiting anything inside it.</b> This provides no real benefit and can even hurt performance if the function does slow, blocking work without yielding control.</li>
    <li><b>Calling a blocking (non-async) library function directly inside an async def function.</b> This blocks the entire event loop, defeating the purpose of async entirely; use the plain def form instead in that case.</li>
  </ul></div>
  <div class="sec-num">14.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Use async def when a function genuinely awaits async operations; use plain def for regular synchronous code, FastAPI handles both correctly without you managing threads yourself.</p>
  ${qMC('q1', 'med', 'What is the risk of calling a blocking (non-async) database call directly inside an async def function without awaiting it properly?',
    ['There is no risk, async def handles everything automatically', 'It can block the entire event loop, preventing the server from handling any other requests during that call', 'FastAPI would refuse to start'],
    1, 'A genuinely blocking call inside an async function ties up the whole event loop, defeating the very concurrency async/await is meant to provide.')}
`
};

lessons['15'] = {
  short: 'Concurrency vs. parallelism', where: 'Part IV · <b>Concurrency vs. parallelism</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 15</div>
  <h2 class="title">Concurrency vs. parallelism</h2>
  <p class="lead">Two words often used interchangeably, but describing genuinely different things worth telling apart.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">Two different ideas</div>
    <div class="qb-row"><span class="qb-kw kw-p">${term('concurrency', 'Concurrency')}</span><span class="qb-mean">making progress on multiple tasks by interleaving their waiting periods (what async/await provides)</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Parallelism</span><span class="qb-mean">literally running multiple tasks at the exact same instant, on multiple CPU cores</span></div>
  </div>
  <p class="body">async/await gives you concurrency: one process can juggle many waiting requests efficiently. True parallelism (using multiple CPU cores at once) in a Python web app usually comes from running multiple worker processes side by side, covered in chapter 28's production deployment, not from async/await itself.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Assuming async/await gives you parallelism.</b> A single async process still runs on one core; it just avoids sitting idle during waits. Real parallel CPU usage comes from running multiple worker processes.</li>
  </ul></div>
  <div class="sec-num">15.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Concurrency (async/await) interleaves waiting periods efficiently on one process. Parallelism runs tasks literally simultaneously across multiple cores, typically via multiple worker processes in production.</p>
  ${qMC('q1', 'med', 'Does async/await, by itself, provide true parallelism across multiple CPU cores?',
    ['Yes, that is exactly what it does', 'No, it provides concurrency (efficiently interleaving waits) within one process; true parallelism typically comes from running multiple worker processes', 'Parallelism and concurrency are the same thing'],
    1, 'async/await is a concurrency tool, letting one process handle many waiting tasks efficiently; genuine parallel CPU usage requires multiple processes, covered in the production deployment chapter.')}
`
};

lessons['16'] = {
  short: 'Common async pitfalls', where: 'Part IV · <b>Common async pitfalls</b>', render: () => `
  <div class="eyebrow">Part IV · Chapter 16</div>
  <h2 class="title">Common async pitfalls</h2>
  <p class="lead">A few mistakes account for most real-world async bugs and performance surprises.</p>
  <hr class="rule">
  <div class="gotcha"><div class="lab">The big ones</div><ul>
    <li><b>Forgetting <code class="inl">await</code> on an async call.</b> This doesn't run the operation and wait for it, it returns an unfinished "coroutine" object instead, a common and confusing early mistake.</li>
    <li><b>Mixing a blocking library with async def, as covered last chapter.</b> This silently blocks the whole event loop rather than raising an obvious error.</li>
    <li><b>Assuming async makes a CPU-heavy calculation faster.</b> async/await helps with waiting on I/O (network, disk, database); it does nothing for a genuinely slow calculation that keeps the CPU busy the whole time.</li>
  </ul></div>
  <div class="sec-num">16.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Forgetting await, mixing blocking calls into async code, and expecting async to speed up CPU-bound work are the most common async mistakes, all stemming from misunderstanding what async/await actually solves: waiting, not computing.</p>
  ${qMC('q1', 'easy', 'Would async/await help speed up a function doing a genuinely slow, CPU-heavy calculation (no waiting on network/disk involved)?',
    ['Yes, async always makes code faster', 'No, async/await specifically helps with waiting on slow I/O, not with speeding up CPU-bound computation', 'Only if the function uses Pydantic models'],
    1, 'async/await\'s benefit is not blocking during I/O waits; a purely CPU-bound calculation has no waiting to overlap with other work, so async provides no benefit there.')}
`
};

lessons['17'] = {
  short: 'Why dependency injection', where: 'Part V · <b>What dependency injection is, and why</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 17</div>
  <h2 class="title">What dependency injection is, and why</h2>
  <p class="lead">${term('dependency_injection', 'Dependency injection')} lets a path operation simply declare what it needs, without knowing how to construct it.</p>
  <hr class="rule">
  <svg viewBox="0 0 500 130" class="diagram" role="img" aria-label="A path operation declares it needs a database session; FastAPI supplies it automatically before the function runs">
    <rect x="10" y="40" width="180" height="50" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="100" y="70" text-anchor="middle" font-size="10" fill="var(--teal-deep)">"I need a db session"</text>
    <rect x="230" y="40" width="150" height="50" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="305" y="70" text-anchor="middle" font-size="10" fill="#7a4b0a">FastAPI supplies it</text>
    <rect x="420" y="40" width="70" height="50" rx="8" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="455" y="70" text-anchor="middle" font-size="10" fill="#7a251c">View runs</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrFA2)"><path d="M190,65 L229,65"/><path d="M380,65 L419,65"/></g>
    <defs><marker id="arrFA2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">Without dependency injection, every path operation needing a database connection would repeat the same connect/close logic itself. With it, that logic lives in one place, and any function that needs it simply asks for it as a parameter, exactly the "don't repeat yourself" idea behind reusable functions, applied at the framework level.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Manually constructing shared resources (like a DB connection) inside every path operation.</b> This duplicates setup/teardown logic everywhere; dependencies centralize it once.</li>
  </ul></div>
  <div class="sec-num">17.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Dependency injection lets a path operation declare what it needs (a DB session, the current user) without constructing it itself, avoiding repeated setup logic across every endpoint that needs the same thing.</p>
  ${qMC('q1', 'easy', 'What problem does dependency injection primarily solve?',
    ['It makes Pydantic validation faster', 'It avoids repeating the same setup logic (like constructing a database session) in every path operation that needs it', 'It replaces the need for path parameters'],
    1, 'Dependency injection centralizes shared setup logic in one place, letting many path operations simply declare they need it rather than duplicating construction code everywhere.')}
`
};

lessons['18'] = {
  short: 'Depends() basics', where: 'Part V · <b>Depends() basics</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 18</div>
  <h2 class="title">Depends() basics</h2>
  <p class="lead"><code class="inl">Depends()</code> is how a path operation actually declares a dependency it needs.</p>
  <hr class="rule">
  <pre class="code">def get_db():
    db = DatabaseSession()
    try:
        yield db
    finally:
        db.close()

@app.get("/orders/{order_id}")
def get_order(order_id: int, db = Depends(get_db)):
    return db.query_order(order_id)</pre>
  <p class="body">FastAPI calls <code class="inl">get_db()</code> automatically before <code class="inl">get_order</code> runs, passes its result in as <code class="inl">db</code>, and, because <code class="inl">get_db</code> uses <code class="inl">yield</code>, runs the code after <code class="inl">yield</code> (closing the session) automatically once the request finishes, whether it succeeded or raised an error.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Forgetting the cleanup after yield.</b> Without it, resources like database connections can leak over time as more requests are handled.</li>
  </ul></div>
  <div class="sec-num">18.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Depends(some_function) tells FastAPI to call that function and inject its result as a parameter; a yield-based dependency also runs cleanup automatically after the request completes.</p>
  ${qMC('q1', 'med', 'In a dependency function using yield, when does the code after yield run?',
    ['Immediately, before the path operation runs', 'Automatically after the request finishes, whether it succeeded or raised an error', 'It never runs automatically'],
    1, 'The yield pattern lets FastAPI run setup before the request and guaranteed cleanup after it, regardless of whether the request succeeded or failed.')}
`
};

lessons['19'] = {
  short: 'Shared dependencies', where: 'Part V · <b>Shared dependencies</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 19</div>
  <h2 class="title">Shared dependencies</h2>
  <p class="lead">The same dependency, like "get the current logged-in user," is often needed across many different endpoints.</p>
  <hr class="rule">
  <pre class="code">def get_current_user(token: str):
    user = decode_and_verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return user

@app.get("/orders/mine")
def my_orders(user = Depends(get_current_user)):
    return db.query_orders_for(user.id)

@app.post("/orders")
def create_order(order: OrderCreate, user = Depends(get_current_user)):
    ...</pre>
  <p class="body">Both endpoints declare the exact same dependency; the authentication logic lives in exactly one place, <code class="inl">get_current_user</code>, directly avoiding the kind of copy-pasted, inconsistent security checks that the QA course's authentication/authorization chapters warned could silently drift out of sync across a codebase.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Re-implementing authentication logic separately in each endpoint.</b> Duplicated logic is exactly where inconsistencies (and security bugs) creep in over time as the codebase grows.</li>
  </ul></div>
  <div class="sec-num">19.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Sharing one dependency function (like get_current_user) across many endpoints keeps logic like authentication consistent and centralized, rather than duplicated and prone to drifting out of sync.</p>
  ${qMC('q1', 'easy', 'Why declare Depends(get_current_user) in multiple different endpoints, instead of writing separate authentication logic in each?',
    ['Depends() is required syntax with no functional benefit', 'It keeps authentication logic centralized in one place, consistent across every endpoint that uses it', 'Each endpoint actually needs a different authentication mechanism'],
    1, 'Reusing the same dependency function guarantees every endpoint using it behaves identically for that shared concern, avoiding subtle inconsistencies from separately duplicated logic.')}
`
};

lessons['20'] = {
  short: 'Dependencies with parameters', where: 'Part V · <b>Dependencies with parameters</b>', render: () => `
  <div class="eyebrow">Part V · Chapter 20</div>
  <h2 class="title">Dependencies with parameters</h2>
  <p class="lead">A dependency can itself need configuration, letting the same underlying pattern be reused slightly differently in different places.</p>
  <hr class="rule">
  <pre class="code">def require_role(role: str):
    def checker(user = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(status_code=403, detail=f"Requires role: {role}")
        return user
    return checker

@app.delete("/restaurants/{restaurant_id}")
def delete_restaurant(restaurant_id: int, user = Depends(require_role("admin"))):
    ...</pre>
  <p class="body"><code class="inl">require_role("admin")</code> is a function that returns a dependency, letting the exact same authorization pattern be reused for different required roles across different endpoints, rather than writing a separate, near-identical checker function for each one.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Writing a separate, hardcoded dependency function per role.</b> A parameterized dependency (like require_role above) avoids this near-duplicate code entirely.</li>
  </ul></div>
  <div class="sec-num">20.1</div><h3 class="section-h">Recap</h3>
  <p class="body">A function that returns a dependency lets you configure and reuse the same underlying check (like a required role) differently across different endpoints, without duplicating near-identical logic.</p>
  ${qMC('q1', 'med', 'What does require_role("admin") actually return, based on the pattern shown?',
    ['A boolean indicating whether the current user is an admin', 'A dependency function (checker), configured for the "admin" role, that FastAPI will call via Depends()', 'An HTTP response'],
    1, 'require_role is a factory: calling it with a specific role returns a new, configured dependency function, which is then passed to Depends().')}
`
};

lessons['21'] = {
  short: 'Status codes & errors', where: 'Part VI · <b>Status codes and error responses</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 21</div>
  <h2 class="title">Status codes and error responses</h2>
  <p class="lead">FastAPI defaults to 200 for success, but real endpoints should be deliberate about status codes, directly applying the HTTP status code chapter from the QA and Fundamentals courses.</p>
  <hr class="rule">
  <pre class="code">from fastapi import HTTPException

@app.post("/orders", status_code=201)
def create_order(order: OrderCreate):
    return {"id": 101, **order.dict()}

@app.get("/orders/{order_id}")
def get_order(order_id: int):
    order = db.find(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order</pre>
  <p class="body"><code class="inl">status_code=201</code> (Created) is more precise than the default 200 for something that just created a new resource. <code class="inl">HTTPException</code> is how you deliberately return an error status with a clear message, rather than letting an unhandled error produce a generic, unhelpful 500.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Returning 200 for everything, including errors, with an error message buried in the body.</b> Clients (and monitoring tools) rely on the actual status code, not just the body, to tell success from failure.</li>
  </ul></div>
  <div class="sec-num">21.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Set precise status codes (like 201 for creation) rather than defaulting to 200 everywhere, and raise HTTPException for deliberate, clear error responses instead of letting errors surface as generic 500s.</p>
  ${qMC('q1', 'easy', 'Why use status_code=201 instead of the default 200 for a POST endpoint that creates a new order?',
    ['201 makes the request run faster', '201 (Created) more precisely communicates that a new resource was successfully created, rather than a generic success', 'FastAPI requires 201 for all POST requests'],
    1, '201 is the standard, more precise status code specifically for successful resource creation, giving clients (and monitoring tools) more accurate information than a generic 200.')}
`
};

lessons['22'] = {
  short: 'OAuth2 & JWT', where: 'Part VI · <b>Authentication with OAuth2/JWT</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 22</div>
  <h2 class="title">Authentication with OAuth2/JWT</h2>
  <p class="lead">FastAPI has first-class support for a common, token-based authentication pattern: OAuth2 with ${term('jwt', 'JWTs')}.</p>
  <hr class="rule">
  <svg viewBox="0 0 600 150" class="diagram" role="img" aria-label="Client logs in and receives a JWT, then sends it with future requests to prove identity">
    <rect x="10" y="20" width="150" height="45" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="85" y="47" text-anchor="middle" font-size="10" fill="var(--teal-deep)">POST /login</text>
    <rect x="220" y="20" width="150" height="45" rx="8" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="295" y="47" text-anchor="middle" font-size="10" fill="#7a4b0a">Server verifies, returns JWT</text>
    <rect x="10" y="100" width="150" height="45" rx="8" fill="var(--teal-soft)" stroke="var(--teal)"/><text x="85" y="127" text-anchor="middle" font-size="10" fill="var(--teal-deep)">GET /orders/mine</text>
    <rect x="220" y="100" width="150" height="45" rx="8" fill="var(--rose-soft)" stroke="var(--rose)"/><text x="295" y="120" text-anchor="middle" font-size="10" fill="#7a251c">Authorization:</text><text x="295" y="134" text-anchor="middle" font-size="9" fill="#7a251c">Bearer &lt;jwt&gt;</text>
    <g stroke="var(--ink-faint)" stroke-width="2" fill="none" marker-end="url(#arrFA3)"><path d="M160,42 L219,42"/><path d="M160,122 L219,122"/></g>
    <defs><marker id="arrFA3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-faint)"/></marker></defs>
  </svg>
  <p class="body">A client logs in once and receives a signed JWT. Every subsequent request includes it (typically in an <code class="inl">Authorization: Bearer &lt;token&gt;</code> header); the server verifies its signature and reads the user's identity directly from it, without needing to look up a stored session for every single request.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Storing sensitive data unencrypted inside a JWT.</b> JWTs are signed (tamper-evident) but not necessarily encrypted; their contents can typically be read by anyone who has the token, so sensitive secrets shouldn't be stored inside one.</li>
    <li><b>Never expiring tokens.</b> A JWT with no expiration remains valid indefinitely if intercepted; a reasonable expiration limits the damage of a leaked token.</li>
  </ul></div>
  <div class="sec-num">22.1</div><h3 class="section-h">Recap</h3>
  <p class="body">OAuth2/JWT authentication issues a signed token at login, which the client sends with future requests; the server verifies it without needing per-request session lookups, but tokens should expire and shouldn't hold sensitive plaintext data.</p>
  ${qMC('q1', 'med', 'Why shouldn\'t sensitive secret data be stored directly inside a JWT\'s payload?',
    ['JWTs cannot hold any data at all', 'JWTs are signed (tamper-evident) but generally not encrypted, so their contents can typically be read by anyone holding the token', 'JWTs automatically encrypt everything inside them'],
    1, 'A JWT\'s signature prevents tampering, but the payload itself is typically just base64-encoded, not encrypted, so it should never be assumed private.')}
`
};

lessons['23'] = {
  short: 'CORS', where: 'Part VI · <b>CORS, and why it matters</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 23</div>
  <h2 class="title">CORS, and why it matters</h2>
  <p class="lead">${term('cors', 'CORS')} is a browser-enforced rule, not a FastAPI-specific concept, that trips up nearly every API developer at least once.</p>
  <hr class="rule">
  <pre class="code">from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tastygo.com"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)</pre>
  <p class="body">By default, a browser blocks a page on one domain from calling an API on a different domain via JavaScript, unless that API explicitly allows it. This is a browser security feature protecting users, not a bug in your API; <code class="inl">CORSMiddleware</code> is how you deliberately opt certain origins in.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Setting allow_origins=["*"] in production "to make the error go away."</b> This allows any website whatsoever to call your API from a user's browser, often far more permissive than actually intended or safe.</li>
    <li><b>Confusing a CORS error with the API itself being broken.</b> A CORS error means the browser blocked the request client-side; the API itself may be working perfectly for non-browser clients or correctly configured origins.</li>
  </ul></div>
  <div class="sec-num">23.1</div><h3 class="section-h">Recap</h3>
  <p class="body">CORS is a browser security rule restricting cross-domain requests by default. CORSMiddleware explicitly allows specific origins, and allow_origins=["*"] should be used deliberately, not as a quick fix.</p>
  ${qMC('q1', 'easy', 'A CORS error appears in the browser console when a frontend tries to call an API on a different domain. What does this mean?',
    ['The API server has crashed', "The browser blocked the request client-side because the API hasn't explicitly allowed that origin", 'The request was never actually sent anywhere'],
    1, 'CORS errors happen in the browser, blocking the request before (or after) it reaches the server, specifically because the API hasn\'t declared that origin as allowed.')}
`
};

lessons['24'] = {
  short: 'Versioning an API', where: 'Part VI · <b>Versioning an API</b>', render: () => `
  <div class="eyebrow">Part VI · Chapter 24</div>
  <h2 class="title">Versioning an API</h2>
  <p class="lead">Once real clients (a mobile app, a partner) depend on your API, changing it carelessly can break them. Versioning gives you a way to evolve safely.</p>
  <hr class="rule">
  <pre class="code">@app.get("/v1/orders/{order_id}")
def get_order_v1(order_id: int):
    return {"id": order_id, "total": 450}

@app.get("/v2/orders/{order_id}")
def get_order_v2(order_id: int):
    return {"id": order_id, "total": 450, "currency": "INR"}</pre>
  <p class="body">Existing clients calling <code class="inl">/v1/...</code> keep working exactly as before, unaffected by a breaking change introduced in <code class="inl">/v2/...</code>, letting you evolve the API while giving consumers time to migrate on their own schedule, rather than breaking them the moment something changes.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Changing an existing endpoint's response shape without versioning.</b> This can silently break every client relying on the old shape, with no warning and no migration path.</li>
    <li><b>Versioning every tiny change, even fully backward-compatible ones.</b> Adding a new optional field is usually not a breaking change; reserve a new version for genuinely breaking changes.</li>
  </ul></div>
  <div class="sec-num">24.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Versioning (like /v1/, /v2/ prefixes) lets an API evolve with breaking changes without disrupting existing clients still depending on the previous behaviour.</p>
  ${qMC('q1', 'med', 'Why version an API instead of just changing an existing endpoint\'s response shape directly?',
    ['Versioning is only relevant for internal APIs', 'Changing an existing endpoint directly can silently break every client already depending on its current shape; versioning gives them a migration path', 'APIs cannot be changed once published, regardless of versioning'],
    1, 'A new version preserves the old behaviour for existing clients while allowing genuinely breaking changes to be introduced safely alongside it.')}
`
};

lessons['25'] = {
  short: 'Swagger UI & ReDoc', where: 'Part VII · <b>Swagger UI and ReDoc, automatically</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 25</div>
  <h2 class="title">Swagger UI and ReDoc, automatically</h2>
  <p class="lead">Every path operation, Pydantic model, and type hint you've written throughout this course has been feeding a fully interactive API reference this whole time.</p>
  <hr class="rule">
  <table class="mockup-table">
    <thead><tr><th>Endpoint</th><th>Method</th><th>Try it out</th></tr></thead>
    <tbody>
      <tr><td>/orders/{order_id}</td><td>GET</td><td><span class="mockup-pass">Execute</span></td></tr>
      <tr><td>/orders</td><td>POST</td><td><span class="mockup-pass">Execute</span></td></tr>
    </tbody>
  </table>
  <p class="body">Visiting <code class="inl">/docs</code> shows Swagger UI: every endpoint, its expected request body, its response shape, and a "try it out" button to actually call it right from the browser. <code class="inl">/redoc</code> shows the same information in a different, more reading-friendly layout. Neither requires a single line of separate documentation code.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Writing separate documentation by hand alongside this.</b> The automatic docs are generated directly from your code and stay accurate as it changes; hand-written docs drift out of sync the moment code changes without a matching update.</li>
  </ul></div>
  <div class="sec-num">25.1</div><h3 class="section-h">Recap</h3>
  <p class="body">/docs (Swagger UI) and /redoc are generated automatically from your path operations and Pydantic models, always accurate and always in sync with the actual code.</p>
  ${qMC('q1', 'easy', 'Why does FastAPI\'s automatic documentation stay accurate as the code changes, unlike separately hand-written docs?',
    ['It is manually updated by the FastAPI maintainers for every project', 'It is generated directly from the same code (path operations, type hints, Pydantic models) that defines the actual behaviour, so it can\'t drift out of sync', 'It only covers a small subset of endpoints'],
    1, 'Because the documentation is derived directly from the running code itself rather than written and maintained separately, it can\'t silently become outdated the way hand-written docs can.')}
`
};

lessons['26'] = {
  short: 'Testing with TestClient', where: 'Part VII · <b>Testing with TestClient</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 26</div>
  <h2 class="title">Testing with TestClient</h2>
  <p class="lead">FastAPI provides a TestClient for writing real, automated tests against your API, directly building on the Python course's testing-with-assert chapter.</p>
  <hr class="rule">
  <pre class="code">from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_order():
    response = client.get("/orders/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1

def test_create_order_rejects_negative_amount():
    response = client.post("/orders", json={"restaurant_id": 1, "amount": -50})
    assert response.status_code == 422</pre>
  <p class="body">TestClient calls your actual path operations directly (no real network connection or running server needed), letting you assert on status codes and response bodies, exactly the positive and negative testing principles from the QA course applied directly to an API.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Only testing the successful, valid-input case.</b> The second example above, testing that invalid input is correctly rejected, is just as important, echoing the QA course's positive/negative testing chapter directly.</li>
  </ul></div>
  <div class="sec-num">26.1</div><h3 class="section-h">Recap</h3>
  <p class="body">TestClient lets you write automated tests calling your API's path operations directly, asserting on status codes and response data, for both valid and invalid input.</p>
  ${qScenario('q1', 'med', 'Write a test using TestClient asserting that GET /restaurants/999 (an id that doesn\'t exist) returns a 404.',
`def test_restaurant_not_found():
    response = client.get("/restaurants/999")
    assert response.status_code == 404`)}
`
};

lessons['27'] = {
  short: 'Connecting a real database', where: 'Part VII · <b>Connecting a real database</b>', render: () => `
  <div class="eyebrow">Part VII · Chapter 27</div>
  <h2 class="title">Connecting a real database</h2>
  <p class="lead">Everything so far has used hardcoded example data. A real TastyGo API needs a real database, typically via SQLAlchemy, Python's most widely used ORM.</p>
  <hr class="rule">
  <pre class="code">from sqlalchemy import Column, Integer, String, Float
from database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    rating = Column(Float)

@app.get("/restaurants/{restaurant_id}")
def get_restaurant(restaurant_id: int, db = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404)
    return restaurant</pre>
  <p class="body">This looks deliberately similar to Django's ORM, and for good reason: SQLAlchemy solves the same underlying problem (Python objects mapped to real database tables), just as a separate library rather than bundled into a full framework, exactly matching FastAPI's leaner, compose-your-own-tools philosophy.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Opening a new, separate database connection inside every path operation.</b> The get_db dependency pattern from Part V exists exactly to manage this centrally and safely, opening and closing connections consistently.</li>
  </ul></div>
  <div class="sec-num">27.1</div><h3 class="section-h">Recap</h3>
  <p class="body">SQLAlchemy provides ORM-style database access for FastAPI (unlike Django, which bundles its own ORM), typically combined with the Depends() pattern to manage database sessions per request.</p>
  ${qMC('q1', 'easy', 'Unlike Django, which bundles its own ORM, how does FastAPI typically handle database access?',
    ['FastAPI includes an identical bundled ORM', 'FastAPI has no built-in ORM; a separate library like SQLAlchemy is composed in, matching its leaner philosophy', 'FastAPI cannot connect to a database at all'],
    1, 'FastAPI deliberately doesn\'t bundle an ORM the way Django does; a library like SQLAlchemy is added separately, consistent with FastAPI\'s lean, compose-your-own-tools approach.')}
`
};

lessons['28'] = {
  short: 'Running in production', where: 'Part VIII · <b>Running FastAPI in production</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 28</div>
  <h2 class="title">Running FastAPI in production</h2>
  <p class="lead">A real deployment needs more than <code class="inl">uvicorn main:app --reload</code>, directly applying the DevOps concepts previewed in the Fundamentals course.</p>
  <hr class="rule">
  <pre class="code">$ gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker

# typically sitting behind a reverse proxy:
# nginx (handles HTTPS, load balancing) -> gunicorn (manages worker processes) -> FastAPI app</pre>
  <p class="body">Running multiple worker processes (here, 4) is exactly the "parallelism" from chapter 15: each worker is a separate process that can use a separate CPU core, handling requests genuinely in parallel, not just concurrently within one process. A reverse proxy (nginx, from the Fundamentals and DevOps courses) typically sits in front, handling HTTPS and routing to whichever worker is free.</p>
  <div class="gotcha"><div class="lab">Common trip-ups</div><ul>
    <li><b>Using --reload (meant for development convenience) in production.</b> It watches for file changes and restarts the server, useful while developing, unnecessary overhead and risk in production.</li>
    <li><b>Running only one worker process.</b> This leaves CPU cores unused and gives no redundancy if that one process crashes or gets stuck.</li>
  </ul></div>
  <div class="sec-num">28.1</div><h3 class="section-h">Recap</h3>
  <p class="body">Production deployments run multiple worker processes (for real parallelism) behind a reverse proxy, without development conveniences like --reload, exactly the DevOps concepts from earlier in this Developer track applied to a FastAPI app specifically.</p>
  ${qMC('q1', 'med', 'Why run multiple worker processes in production instead of just one?',
    ['A single worker process is always sufficient for any amount of traffic', 'Multiple worker processes can use multiple CPU cores in parallel and provide redundancy if one crashes', 'Worker processes are only relevant for Django, not FastAPI'],
    1, 'Each worker is a separate OS process; running several lets the application use multiple CPU cores genuinely in parallel and continue serving traffic even if one worker fails.')}
`
};

lessons['29'] = {
  short: 'DevOps & Capstone', where: 'Part VIII · <b>Where to go next: DevOps, Capstone</b>', render: () => `
  <div class="eyebrow">Part VIII · Chapter 29</div>
  <h2 class="title">Where to go next: DevOps, Capstone</h2>
  <p class="lead">You can now design and build a real, validated, documented, tested API, exactly the skillset TastyGo's actual backend would need.</p>
  <hr class="rule">
  <div class="qb"><div class="qb-title">What's ahead</div>
    <div class="qb-row"><span class="qb-kw kw-p">DevOps</span><span class="qb-mean">containerizing this API with Docker, putting a real reverse proxy in front, setting up CI/CD, deploying it for real</span></div>
    <div class="qb-row"><span class="qb-kw kw-r">Capstone Project</span><span class="qb-mean">building, containerizing, and deploying a real slice of TastyGo, likely using either this FastAPI course or the Django course as its backend</span></div>
  </div>
  <p class="body">Whether TastyGo's real backend ends up built with Django, FastAPI, or both serving different purposes (a common real-world pattern: Django for the main web app, FastAPI for a specific high-performance API), the DevOps course ahead applies equally to either, and the Capstone Project is where all of it comes together into one real, running, deployed system.</p>
  <div class="sec-num">29.1</div><h3 class="section-h">Recap</h3>
  <p class="body">This course built real fluency in FastAPI's path operations, Pydantic validation, async basics, dependency injection, auth/CORS/versioning, automatic docs, and testing. DevOps next covers actually deploying it, and the Capstone brings everything together.</p>
  ${qMC('q1', 'easy', 'Is it necessarily an either/or choice between Django and FastAPI in a real-world system?',
    ['Yes, a real system must pick exactly one and never the other', 'No, a common real-world pattern uses Django for a full web app and FastAPI for a separate, high-performance API, serving different purposes', 'FastAPI always replaces Django entirely once learned'],
    1, 'Many real systems use both together for their respective strengths, a full Django web application alongside a separate FastAPI service for performance-sensitive or API-specific needs.')}
`
};

/* ---------- cheat sheet ---------- */
const CHEATS = {
  '00': { note: 'FastAPI: lean, API-focused, type-hint-driven validation and automatic docs. Different tool than Django\'s full-application approach.' },
  '0b': { note: 'uvicorn runs the app. Pydantic validates data. Automatic docs (/docs, /redoc) are generated for free from your own code.' },
  '0i': { note: "This course builds TastyGo's API layer directly: endpoints backed by Pydantic models, same customers/restaurants/orders shape as every other course." },
  '01': { code: '@app.get("/restaurants")\ndef list_restaurants():\n    return [...]   # returned Python data becomes the JSON response automatically' },
  '02': { code: '@app.get("/orders/{order_id}")\ndef get_order(order_id: int):\n    ...   # type hint = automatic conversion + validation' },
  '03': { code: 'def list_restaurants(city: str = None, min_rating: float = 0.0):\n# not in the path -> query parameter. Default = optional.' },
  '04': { code: 'Path params match {name} in the path string by name; everything else becomes a query parameter automatically.' },
  '05': { code: 'class OrderCreate(BaseModel):\n    amount: int\n# FastAPI parses + validates the JSON body against this automatically' },
  '06': { code: '@app.get("/orders/{id}", response_model=OrderOut)\n# extra fields not in OrderOut are stripped from the response automatically' },
  '07': { code: 'field: Optional[str] = None   # optional, defaults to None if omitted\nfield: int                    # no default = required' },
  '08': { code: 'class Order(BaseModel):\n    customer: Customer\n    items: list[OrderItem]\n# models can nest; validated at every level' },
  '09': { code: 'amount: int   # type hints drive automatic validation; invalid input rejected before your code runs' },
  '10': { code: 'amount: int = Field(gt=0, le=50000)   # real constraints: gt/ge/lt/le, max_length/min_length' },
  '11': { code: '@field_validator("field_name")\n@classmethod\ndef check(cls, v): ...   # custom rules beyond simple type/range' },
  '12': { code: 'Failed validation -> automatic 422 response with a structured list of every failed field and why' },
  '13': { code: 'async def view():\n    result = await slow_io_call()\n# pauses during waits, lets other requests be handled meanwhile' },
  '14': { code: 'async def -> when awaiting something. def -> regular sync code (FastAPI runs it in a thread pool).' },
  '15': { code: 'Concurrency (async/await) = interleaving waits on one process. Parallelism = literally simultaneous, multiple processes/cores.' },
  '16': { code: 'Common bugs: forgetting await, blocking calls inside async def, expecting async to speed up CPU-bound work.' },
  '17': { code: 'Dependency injection: a function declares what it needs (a db session, current user); FastAPI supplies it.' },
  '18': { code: 'def get_db():\n    db = Session()\n    try: yield db\n    finally: db.close()\n# Depends(get_db) injects it, with automatic cleanup' },
  '19': { code: 'Depends(get_current_user)   # reused across many endpoints, keeps auth logic centralized and consistent' },
  '20': { code: 'def require_role(role):\n    def checker(user=Depends(get_current_user)): ...\n    return checker\n# a function that returns a configured dependency' },
  '21': { code: '@app.post("/orders", status_code=201)\nraise HTTPException(status_code=404, detail="...")   # deliberate, precise status codes' },
  '22': { code: 'Login -> signed JWT issued. Client sends it via Authorization: Bearer <token> on future requests.' },
  '23': { code: 'CORSMiddleware(allow_origins=[...])   # browser blocks cross-domain calls unless explicitly allowed' },
  '24': { code: '/v1/orders/{id}, /v2/orders/{id}   # existing clients keep working; breaking changes go in a new version' },
  '25': { code: '/docs (Swagger UI), /redoc — generated automatically from your path operations and Pydantic models' },
  '26': { code: 'client = TestClient(app)\nresponse = client.get("/orders/1")\nassert response.status_code == 200' },
  '27': { code: 'SQLAlchemy: Python ORM for FastAPI (not bundled, unlike Django) — Column/table classes, queried via a db session dependency.' },
  '28': { code: 'gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker\n# behind a reverse proxy (nginx) in production' },
  '29': { code: 'DevOps next: containerize, reverse proxy, CI/CD, deploy. Capstone: bring Python + a framework + DevOps together into one real project.' },
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
  const flow = `<div class="iq-flow"><span>Request</span><i>&rarr;</i><span>Pydantic validation</span><i>&rarr;</i><span>Dependencies</span><i>&rarr;</i><span>Path operation</span><i>&rarr;</i><span>Response model</span></div>`;
  return `
  <div class="eyebrow">Interview prep</div>
  <h2 class="title">FastAPI interview questions</h2>
  <p class="lead">A deep, topic-by-topic bank of the FastAPI questions asked in real interviews, grouped by area, with concise answers and the reasoning interviewers listen for. Click any question to expand it.</p>
  <button class="pg-btn pg-ghost" style="margin:6px 0 10px" onclick="window.print()">Print / save as PDF</button>
  <hr class="rule">

  <h3 class="section-h">Fundamentals</h3>
  ${iq('Beginner','What is FastAPI, and why is it popular?',`<p>A modern Python web framework for building APIs, built on type hints. It gives automatic request validation, automatic interactive docs, and high performance (async, on top of Starlette and Pydantic).</p>`)}
  ${iq('Intermediate','How does a request flow through FastAPI?',`<p>The request is routed to a path operation; parameters and body are validated by Pydantic; dependencies resolve; your function runs; and the result is serialised through the response model.</p>${flow}`)}
  ${iq('Intermediate','WSGI vs ASGI &mdash; where does FastAPI sit?',`<p>WSGI is the synchronous standard; ASGI is the async standard supporting concurrency and WebSockets. FastAPI is ASGI-based (run by Uvicorn/Hypercorn), which is what enables its async endpoints.</p>`)}
  ${iq('Beginner','Where do the automatic docs come from?',`<p>FastAPI generates an OpenAPI schema from your type hints and models, and serves interactive docs at <code class="inl">/docs</code> (Swagger UI) and <code class="inl">/redoc</code> &mdash; no extra work.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Validation &amp; parameters</h3>
  ${iq('Beginner','How does FastAPI validate request data?',`<p>You declare a Pydantic model (or typed parameters); FastAPI parses and validates incoming data against it, coercing types and returning a clear <code class="inl">422</code> error automatically if it is invalid.</p><pre class="code">class OrderIn(BaseModel):
    restaurant_id: int
    amount: int = Field(gt=0)</pre>`)}
  ${iq('Intermediate','Path vs query vs body parameters?',`<p><b>Path</b> params come from the URL (<code class="inl">/orders/{id}</code>); <b>query</b> params from the query string (<code class="inl">?limit=10</code>); <b>body</b> from the request payload (a Pydantic model). FastAPI infers which from your function signature.</p>`)}
  ${iq('Intermediate','What is a response_model, and why use one?',`<p>A Pydantic model declaring the shape of the response. It filters/validates output (e.g. hiding a password field), documents the API, and keeps responses consistent.</p>`)}
  ${iq('Beginner','How do you set the HTTP status code?',`<p>Via <code class="inl">status_code=</code> on the decorator (e.g. <code class="inl">201</code> for create) or by raising <code class="inl">HTTPException(status_code=..., detail=...)</code> for errors.</p>`)}
  ${iq('Intermediate','What does a 422 response mean?',`<p>Unprocessable Entity &mdash; FastAPI returns it automatically when request data fails Pydantic validation, with a body detailing which fields failed and why.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Async &amp; performance</h3>
  ${iq('Intermediate','When should an endpoint be async def vs def?',`<p>Use <code class="inl">async def</code> when you await non-blocking I/O (async DB driver, HTTP calls). Use plain <code class="inl">def</code> for blocking work &mdash; FastAPI runs it in a threadpool so it does not block the event loop. Never call blocking code directly inside an async endpoint.</p>`)}
  ${iq('Advanced','Why can FastAPI handle high concurrency?',`<p>Its ASGI/async model lets one worker juggle many in-flight I/O-bound requests without a thread each, since awaiting frees the event loop to serve others. For CPU-bound work you still scale with more workers/processes.</p>`)}
  ${iq('Intermediate','What are background tasks?',`<p><code class="inl">BackgroundTasks</code> lets you run work after returning the response (send an email, write a log) without making the client wait. For heavy/reliable jobs, use a real task queue (Celery/RQ) instead.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Dependency injection</h3>
  ${iq('Intermediate','What is Depends() and why is DI useful?',`<p><code class="inl">Depends()</code> declares that an endpoint needs something (a DB session, the current user, common query params); FastAPI resolves and injects it. It centralises shared logic, aids testing (override dependencies), and keeps endpoints clean.</p>`)}
  ${iq('Advanced','How would you provide a database session per request?',`<p>Write a dependency that yields a session and closes it after the request, then inject it with <code class="inl">Depends</code>. The <code class="inl">yield</code> form guarantees teardown even on errors.</p><pre class="code">def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()</pre>`)}
  ${iq('Advanced','How do you protect a route (auth)?',`<p>Use a dependency that validates a token (OAuth2 bearer/JWT) and returns the current user, raising <code class="inl">401</code> if invalid. Add it via <code class="inl">Depends(get_current_user)</code> so protection is declarative and reusable.</p>`)}

  <h3 class="section-h" style="margin-top:26px">Cross-cutting concerns</h3>
  ${iq('Intermediate','How do you handle errors cleanly?',`<p>Raise <code class="inl">HTTPException</code> for expected errors (404, 403), and register custom exception handlers for app-specific exceptions so you return consistent, well-structured error responses.</p>`)}
  ${iq('Intermediate','What is CORS and how do you enable it?',`<p>Cross-Origin Resource Sharing controls which browser origins may call your API. Add <code class="inl">CORSMiddleware</code> with the allowed origins/methods/headers &mdash; needed when a frontend on another domain calls the API.</p>`)}
  ${iq('Intermediate','What is middleware in FastAPI?',`<p>Code that wraps every request/response &mdash; for logging, timing, CORS, or adding headers. It runs before the path operation and after the response is produced.</p>`)}
  ${iq('Advanced','How do you manage configuration?',`<p>Use Pydantic <code class="inl">BaseSettings</code> to load typed config from environment variables (with validation and defaults), keeping secrets out of code and letting the same build run per environment.</p>`)}
  ${iq('Intermediate','How do you test a FastAPI app?',`<p>Use the built-in <code class="inl">TestClient</code> (or async httpx) to call endpoints in tests and assert on status and JSON, and override dependencies (e.g. a test DB) via <code class="inl">app.dependency_overrides</code>.</p>`)}

  <div class="foot" style="margin-top:30px"><span></span><button class="f-btn f-next" onclick="go('${order[0]}')">Back to the course &rarr;</button></div>`;
}
lessons['interview'] = { short: 'Interview Q&A', where: '<b>Interview Q&A</b>', render: renderInterview };


/* ---------- boot ---------- */
computeTotals();
go((function(){try{var l=localStorage.getItem('fastapi_last');return (l&&lessons[l])?l:'00';}catch(e){return '00';}})());

/* Re-entry hook: see the matching comment in public/app.js / public/ba.js / public/qa.js / public/devfund.js / public/django.js. */
window.__fastapiReinit = function () {
  const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
  buildNav();
  computeTotals();
  go(curCh || order[0] || '00');
};
