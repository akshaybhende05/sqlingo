// FastAPI quick reference — one concise, indexable page per concept.
// Plain voice; examples build a TastyGo-style API.
// Rendered by app/fastapi-reference/[topic]/page.js.

export const categories = [
  "Basics",
  "Path operations & parameters",
  "Validation & models",
  "Dependencies",
  "Async & performance",
  "Cross-cutting",
];

export const entries = [
  // ---------- Basics ----------
  {
    slug: "fastapi-overview", name: "What is FastAPI", category: "Basics",
    summary: "A modern Python framework for building APIs, built on type hints.",
    detail: [
      "FastAPI reads your type hints to validate requests, generate interactive docs, and serialise responses — with very little code.",
      "It is asynchronous and fast, built on Starlette (web) and Pydantic (data validation).",
    ],
    related: ["path-operation", "pydantic-model", "auto-docs"],
  },
  {
    slug: "path-operation", name: "Path operation (route)", category: "Basics",
    summary: "A function tied to a URL and HTTP method by a decorator.",
    syntax: "@app.get('/path')\ndef handler():\n    return {...}",
    examples: [{ code: "from fastapi import FastAPI\napp = FastAPI()\n\n@app.get('/restaurants')\ndef list_restaurants():\n    return [{'name': 'Domino'}]", note: "Use @app.get, @app.post, @app.put, @app.delete for the different methods." }],
    related: ["path-params", "request-body", "auto-docs"],
  },
  {
    slug: "auto-docs", name: "Automatic docs", category: "Basics",
    summary: "FastAPI generates interactive API docs from your code, for free.",
    detail: ["From your routes and models FastAPI builds an OpenAPI schema and serves interactive docs at /docs (Swagger UI) and /redoc — no extra work."],
    related: ["fastapi-overview", "response-model"],
  },
  {
    slug: "uvicorn", name: "Running with Uvicorn", category: "Basics",
    summary: "FastAPI runs on an ASGI server; Uvicorn is the common choice.",
    syntax: "uvicorn main:app --reload",
    examples: [{ code: "# main.py has: app = FastAPI()\nuvicorn main:app --reload", note: "--reload restarts the server when you save a file, which is handy in development." }],
    related: ["fastapi-overview", "concurrency"],
  },

  // ---------- Path operations & parameters ----------
  {
    slug: "path-params", name: "Path parameters", category: "Path operations & parameters",
    summary: "Values captured from the URL itself, like an id.",
    syntax: "@app.get('/items/{item_id}')\ndef read(item_id: int): ...",
    examples: [{ code: "@app.get('/restaurants/{id}')\ndef get_one(id: int):\n    return {'id': id}", note: "The type hint (int) validates and converts it automatically." }],
    related: ["query-params", "request-body"],
  },
  {
    slug: "query-params", name: "Query parameters", category: "Path operations & parameters",
    summary: "Values from the query string, like ?limit=10.",
    syntax: "@app.get('/items')\ndef read(limit: int = 10): ...",
    examples: [{ code: "@app.get('/restaurants')\ndef search(city: str = None, limit: int = 10):\n    return {'city': city, 'limit': limit}", note: "Function arguments that are not in the path become query parameters. A default makes them optional." }],
    related: ["path-params", "request-body"],
  },
  {
    slug: "request-body", name: "Request body", category: "Path operations & parameters",
    summary: "Read and validate the JSON payload using a Pydantic model.",
    syntax: "@app.post('/items')\ndef create(item: ItemModel): ...",
    examples: [{ code: "@app.post('/orders')\ndef create_order(order: OrderCreate):\n    return {'received': order}", note: "Declare a Pydantic model as the parameter and FastAPI parses and validates the body for you." }],
    related: ["pydantic-model", "path-params", "status-code"],
  },
  {
    slug: "status-code", name: "Status codes & HTTPException", category: "Path operations & parameters",
    summary: "Set the response status, and raise errors with the right code.",
    syntax: "@app.post('/items', status_code=201)\nraise HTTPException(status_code=404, detail='not found')",
    examples: [{ code: "from fastapi import HTTPException\n\n@app.get('/restaurants/{id}')\ndef get_one(id: int):\n    if id > 100:\n        raise HTTPException(status_code=404, detail='not found')\n    return {'id': id}", note: "status_code sets the success code (201 for create); HTTPException returns an error with a clear message." }],
    related: ["request-body", "error-handling"],
  },

  // ---------- Validation & models ----------
  {
    slug: "pydantic-model", name: "Pydantic model", category: "Validation & models",
    summary: "A class that describes and validates the shape of your data.",
    syntax: "class Name(BaseModel):\n    field: type",
    examples: [{ code: "from pydantic import BaseModel\n\nclass OrderCreate(BaseModel):\n    restaurant_id: int\n    amount: int", note: "FastAPI checks incoming data against the model and returns a clear error if it does not match." }],
    related: ["field-validation", "response-model", "request-body"],
  },
  {
    slug: "field-validation", name: "Field validation", category: "Validation & models",
    summary: "Add rules to a field, like 'must be greater than zero'.",
    syntax: "field: int = Field(gt=0, le=100)",
    examples: [{ code: "from pydantic import BaseModel, Field\n\nclass OrderCreate(BaseModel):\n    amount: int = Field(gt=0)         # must be positive\n    note: str = Field(max_length=200)", note: "Field() adds constraints; FastAPI rejects data that breaks them with a 422." }],
    related: ["pydantic-model", "validation-error"],
  },
  {
    slug: "response-model", name: "response_model", category: "Validation & models",
    summary: "Declare the shape of the response, to filter and document it.",
    syntax: "@app.get('/items', response_model=ItemOut)",
    examples: [{ code: "@app.get('/users/{id}', response_model=UserOut)\ndef get_user(id: int):\n    return get_from_db(id)   # extra fields (like password) are stripped", note: "The response model documents the API and hides fields you do not want to expose." }],
    related: ["pydantic-model", "auto-docs"],
  },
  {
    slug: "validation-error", name: "422 validation error", category: "Validation & models",
    summary: "The response FastAPI returns automatically when request data is invalid.",
    detail: ["When incoming data fails a Pydantic model or field rule, FastAPI returns HTTP 422 (Unprocessable Entity) with a body listing exactly which fields failed and why — you do not write this yourself."],
    related: ["field-validation", "pydantic-model"],
  },

  // ---------- Dependencies ----------
  {
    slug: "depends", name: "Depends() (dependency injection)", category: "Dependencies",
    summary: "Declare that an endpoint needs something, and let FastAPI provide it.",
    syntax: "def handler(x = Depends(get_x)): ...",
    examples: [{ code: "from fastapi import Depends\n\ndef common_params(limit: int = 10):\n    return {'limit': limit}\n\n@app.get('/items')\ndef read(params = Depends(common_params)):\n    return params", note: "Dependencies centralise shared logic (DB sessions, current user, common params) and make testing easier." }],
    related: ["db-session-dependency", "auth-dependency"],
  },
  {
    slug: "db-session-dependency", name: "Database session dependency", category: "Dependencies",
    summary: "Provide a database session per request and close it afterwards.",
    syntax: "def get_db():\n    db = Session()\n    try: yield db\n    finally: db.close()",
    examples: [{ code: "def get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()\n\n@app.get('/orders')\ndef list_orders(db = Depends(get_db)):\n    return db.query(Order).all()", note: "The yield form guarantees the session is closed even if the request errors." }],
    related: ["depends", "auth-dependency"],
  },
  {
    slug: "auth-dependency", name: "Auth dependency", category: "Dependencies",
    summary: "Protect a route by requiring a valid token via a dependency.",
    syntax: "def get_current_user(token = Depends(oauth2_scheme)): ...",
    examples: [{ code: "@app.get('/me')\ndef me(user = Depends(get_current_user)):\n    return user", note: "The dependency validates the token and returns the user, raising 401 if it is missing or invalid. Reuse it on any protected route." }],
    related: ["depends", "status-code"],
  },

  // ---------- Async & performance ----------
  {
    slug: "async-endpoints", name: "async def vs def", category: "Async & performance",
    summary: "Use async def when you await non-blocking I/O; use plain def otherwise.",
    detail: [
      "Use async def when the endpoint awaits async I/O (an async database driver, an HTTP call). FastAPI runs it on the event loop.",
      "Use plain def for blocking work — FastAPI runs it in a threadpool so it does not block other requests. Never call blocking code directly inside an async endpoint.",
    ],
    related: ["concurrency", "background-tasks"],
  },
  {
    slug: "background-tasks", name: "Background tasks", category: "Async & performance",
    summary: "Run work after sending the response, so the client does not wait.",
    syntax: "def handler(bg: BackgroundTasks):\n    bg.add_task(func, args)",
    examples: [{ code: "from fastapi import BackgroundTasks\n\n@app.post('/orders')\ndef create(order: OrderCreate, bg: BackgroundTasks):\n    bg.add_task(send_email, order)\n    return {'ok': True}", note: "Good for quick side-effects like sending an email. For heavy or reliable jobs, use a real task queue (Celery)." }],
    related: ["async-endpoints"],
  },
  {
    slug: "concurrency", name: "Why FastAPI is fast", category: "Async & performance",
    summary: "Its async model lets one worker handle many waiting requests at once.",
    detail: ["Because it is built on ASGI and async, a single worker can juggle many in-flight I/O-bound requests without a thread each — awaiting frees the loop to serve others. For CPU-heavy work you still scale with more workers or processes."],
    related: ["async-endpoints", "uvicorn"],
  },

  // ---------- Cross-cutting ----------
  {
    slug: "middleware", name: "Middleware", category: "Cross-cutting",
    summary: "Code that wraps every request and response — for logging, timing, headers.",
    syntax: "@app.middleware('http')\nasync def m(request, call_next): ...",
    examples: [{ code: "@app.middleware('http')\nasync def add_timer(request, call_next):\n    response = await call_next(request)\n    response.headers['X-Time'] = '...'\n    return response", note: "Runs before the route and after the response is produced." }],
    related: ["cors", "error-handling"],
  },
  {
    slug: "cors", name: "CORS", category: "Cross-cutting",
    summary: "Allow browsers on other domains to call your API.",
    syntax: "app.add_middleware(CORSMiddleware, allow_origins=[...])",
    examples: [{ code: "from fastapi.middleware.cors import CORSMiddleware\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=['https://myfrontend.com'],\n    allow_methods=['*'],\n)", note: "Needed when a frontend on a different domain calls the API; the browser blocks it otherwise." }],
    related: ["middleware"],
  },
  {
    slug: "error-handling", name: "Error handling", category: "Cross-cutting",
    summary: "Return clean, consistent errors with HTTPException or custom handlers.",
    syntax: "@app.exception_handler(MyError)\nasync def handle(request, exc): ...",
    examples: [{ code: "raise HTTPException(status_code=403, detail='not allowed')", note: "Raise HTTPException for expected errors; register exception handlers for app-specific ones to return a consistent shape." }],
    related: ["status-code", "middleware"],
  },
  {
    slug: "settings", name: "Settings (BaseSettings)", category: "Cross-cutting",
    summary: "Load typed configuration from environment variables.",
    syntax: "class Settings(BaseSettings):\n    database_url: str",
    examples: [{ code: "from pydantic_settings import BaseSettings\n\nclass Settings(BaseSettings):\n    database_url: str\n    debug: bool = False\n\nsettings = Settings()", note: "Reads and validates config from environment variables, keeping secrets out of the code." }],
    related: ["cors", "auth-dependency"],
  },
  {
    slug: "testclient", name: "TestClient", category: "Cross-cutting",
    summary: "Call your API in tests and assert on the results.",
    syntax: "client = TestClient(app)\nclient.get('/path')",
    examples: [{ code: "from fastapi.testclient import TestClient\nclient = TestClient(app)\n\ndef test_list():\n    r = client.get('/restaurants')\n    assert r.status_code == 200", note: "Override dependencies (like a test database) with app.dependency_overrides." }],
    related: ["depends", "path-operation"],
  },
];

export const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));
