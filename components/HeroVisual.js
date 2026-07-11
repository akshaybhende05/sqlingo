"use client";
import { useEffect, useState } from "react";

const SLIDES = [
  { url: "careerladder.io/courses/sql", label: "SQL" },
  { url: "careerladder.io/courses/business-analyst", label: "Business Analyst" },
  { url: "careerladder.io/courses/dev-python", label: "Python" },
  { url: "careerladder.io/courses/dev-django", label: "Django" },
  { url: "careerladder.io/courses/dev-fastapi", label: "FastAPI" },
  { url: "careerladder.io/courses/dev-devops", label: "DevOps" },
  { url: "careerladder.io/courses/dev-capstone", label: "Capstone" },
  { url: "careerladder.io/courses/dev-fundamentals", label: "Developer" },
  { url: "careerladder.io/courses/qa", label: "QA" },
];

const INTERVAL_MS = 4200;

function SqlSlide() {
  return (
    <>
      <pre className="mockup-code"><span className="tok-k">SELECT</span> c.name, <span className="tok-k">COUNT</span>(o.id) <span className="tok-k">AS</span> orders
<span className="tok-k">FROM</span> customers c
<span className="tok-k">LEFT JOIN</span> orders o <span className="tok-k">ON</span> c.id = o.customer_id
<span className="tok-k">GROUP BY</span> c.id
<span className="tok-k">ORDER BY</span> orders <span className="tok-k">DESC</span>;</pre>
      <table className="mockup-table">
        <thead><tr><th>name</th><th>orders</th></tr></thead>
        <tbody>
          <tr><td>Aarav Sharma</td><td>3</td></tr>
          <tr><td>Priya Patel</td><td>2</td></tr>
          <tr><td>Rohan Mehta</td><td>2</td></tr>
          <tr><td>Sneha Reddy</td><td>1</td></tr>
        </tbody>
      </table>
      <div className="mockup-status"><span className="mockup-status-dot"></span>4 rows returned</div>
    </>
  );
}

function BaSlide() {
  return (
    <div className="mockup-ba">
      <div className="mockup-ba-label">USER STORY</div>
      <p className="mockup-ba-story">
        "As a customer, I want to see my order's live status, so that I don't have to message support to ask where it is."
      </p>
      <div className="mockup-ba-label" style={{ marginTop: 14 }}>ACCEPTANCE CRITERIA</div>
      <div className="mockup-ba-ac">
        <div><span className="tok-given">Given</span> an order is out for delivery</div>
        <div><span className="tok-when">When</span> the customer opens the app</div>
        <div><span className="tok-then">Then</span> they see a live status and ETA</div>
      </div>
      <div className="mockup-status"><span className="mockup-status-dot"></span>Acceptance criteria met</div>
    </div>
  );
}

function PythonSlide() {
  return (
    <>
      <pre className="mockup-code"><span className="tok-k">def</span> per_person_cost(total, people):
    <span className="tok-k">return</span> total / people

print(per_person_cost(<span className="tok-k">600</span>, <span className="tok-k">3</span>))</pre>
      <div className="mockup-test-row"><span className="mockup-pass">PASS</span> per_person_cost(600, 3) == 200</div>
      <div className="mockup-status"><span className="mockup-status-dot"></span>Run &amp; Check · real Python, in your browser</div>
    </>
  );
}

function DjangoSlide() {
  return (
    <>
      <pre className="mockup-code"><span className="tok-k">class</span> Restaurant(models.Model):
    name = models.CharField(max_length=<span className="tok-k">100</span>)
    rating = models.FloatField()</pre>
      <table className="mockup-table">
        <thead><tr><th>Name</th><th>City</th><th>Rating</th></tr></thead>
        <tbody>
          <tr><td>Domino's</td><td>Mumbai</td><td>4.8</td></tr>
          <tr><td>KFC</td><td>Bangalore</td><td>4.3</td></tr>
        </tbody>
      </table>
      <div className="mockup-status"><span className="mockup-status-dot"></span>Admin panel · generated from the model</div>
    </>
  );
}

function FastApiSlide() {
  return (
    <>
      <pre className="mockup-code"><span className="tok-k">class</span> OrderCreate(BaseModel):
    restaurant_id: <span className="tok-k">int</span>
    amount: <span className="tok-k">int</span> = Field(gt=<span className="tok-k">0</span>)</pre>
      <div className="mockup-test-row"><span className="mockup-pass">201</span> POST /orders → created</div>
      <div className="mockup-test-row"><span className="mockup-fail">422</span> amount: -50 → validation error</div>
      <div className="mockup-status"><span className="mockup-status-dot"></span>/docs · generated automatically</div>
    </>
  );
}

function DevOpsSlide() {
  return (
    <>
      <pre className="mockup-code"><span className="tok-k">upstream</span> tastygo_api {"{"}
    server app1:8000;
    server app2:8000;
    server app3:8000;
{"}"}</pre>
      <div className="mockup-test-row"><span className="mockup-pass">UP</span> app1:8000 · app2:8000 · app3:8000</div>
      <div className="mockup-status"><span className="mockup-status-dot"></span>nginx · load balanced · TLS terminated</div>
    </>
  );
}

function CapstoneSlide() {
  return (
    <>
      <pre className="mockup-code"><span className="tok-k">def</span> order_total(items):
    <span className="tok-k">return</span> sum(i[<span className="tok-k">"price"</span>] * i[<span className="tok-k">"quantity"</span>] <span className="tok-k">for</span> i <span className="tok-k">in</span> items)</pre>
      <div className="mockup-test-row"><span className="mockup-pass">PASS</span> order_total([...]) == 600</div>
      <div className="mockup-status"><span className="mockup-status-dot"></span>Run &amp; Check · real Python · your own backend logic</div>
    </>
  );
}

function CodeSlide() {
  return (
    <>
      <pre className="mockup-code"><span className="tok-k">function</span> etaMinutes(order) {"{"}
  <span className="tok-k">const</span> prep = order.avgPrepMinutes;
  <span className="tok-k">const</span> travel = order.deliveryKm * 3;
  <span className="tok-k">return</span> prep + travel;
{"}"}</pre>
      <div className="mockup-test-row"><span className="mockup-pass">PASS</span> etaMinutes({"{prep:10, km:4}"}) === 22</div>
      <div className="mockup-test-row"><span className="mockup-pass">PASS</span> etaMinutes({"{prep:5, km:0}"}) === 5</div>
      <div className="mockup-status"><span className="mockup-status-dot"></span>2 / 2 tests passing</div>
    </>
  );
}

function QaSlide() {
  return (
    <table className="mockup-table mockup-qa-table">
      <thead><tr><th>Test case</th><th>Result</th></tr></thead>
      <tbody>
        <tr><td>Login, valid credentials</td><td><span className="mockup-pass">PASS</span></td></tr>
        <tr><td>Login, wrong password</td><td><span className="mockup-pass">PASS</span></td></tr>
        <tr><td>Refund under ₹500 auto-approves</td><td><span className="mockup-pass">PASS</span></td></tr>
        <tr><td>Refund ₹500+ routes to review</td><td><span className="mockup-fail">FAIL</span></td></tr>
      </tbody>
    </table>
  );
}

const RENDERERS = [SqlSlide, BaSlide, PythonSlide, DjangoSlide, FastApiSlide, DevOpsSlide, CapstoneSlide, CodeSlide, QaSlide];

export default function HeroVisual() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused]);

  const Slide = RENDERERS[i];

  return (
    <div
      className="hero-visual"
      aria-hidden="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mockup-window">
        <div className="mockup-titlebar">
          <span className="mockup-dot dot-r"></span>
          <span className="mockup-dot dot-y"></span>
          <span className="mockup-dot dot-g"></span>
          <span className="mockup-url">{SLIDES[i].url}</span>
        </div>
        <div className="mockup-progress">
          <div key={i} className={`mockup-progress-fill ${paused ? "is-paused" : ""}`} style={{ animationDuration: `${INTERVAL_MS}ms` }}></div>
        </div>
        <div className="mockup-body" key={i}>
          <Slide />
        </div>
      </div>
      <div className="mockup-dots-nav">
        {SLIDES.map((s, idx) => (
          <button
            key={s.url}
            type="button"
            className={idx === i ? "active" : ""}
            aria-label={`Show ${s.label} preview`}
            onClick={() => setI(idx)}
          />
        ))}
      </div>
    </div>
  );
}
