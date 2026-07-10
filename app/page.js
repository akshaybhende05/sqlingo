import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CourseCard from "../components/CourseCard";
import HeroVisual from "../components/HeroVisual";
import { courses } from "../lib/courses";

const STEPS = [
  {
    n: "01",
    title: "Pick a course",
    body: "SQL today, Business Analyst right alongside it, QA and Developer tracks on the way. No prerequisites, no signup.",
  },
  {
    n: "02",
    title: "Learn by doing",
    body: "Every chapter mixes a plain-English explanation with practice you actually do yourself, right in the browser, and check yourself.",
  },
  {
    n: "03",
    title: "Track real progress",
    body: "A running progress bar and per-chapter checkpoints, so you always know exactly how far through the course you are.",
  },
];

const STATS = [
  { n: "61", label: "chapters across both courses" },
  { n: "200+", label: "graded practice questions" },
  { n: "2", label: "real, hands-on courses (more coming)" },
  { n: "0", label: "signups, paywalls, or dark patterns" },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="hub-main">
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">Free · No signup · Hands-on</div>
              <h1 className="hero-title">Learn the skills IT jobs actually need.</h1>
              <p className="hero-lead">
                Real practice, not video lectures. Start with SQLingo, our free, hands-on SQL handbook, then move on
                to the Business Analyst track, with QA and Developer tracks on the way.
              </p>
              <div className="hero-cta-row">
                <Link href="/courses/sql" className="btn-primary">Start SQLingo →</Link>
                <Link href="/courses" className="btn-secondary">Browse all courses</Link>
              </div>
            </div>
            <HeroVisual />
          </div>
        </section>

        <section className="stats-bar">
          <div className="stats-bar-inner">
            {STATS.map((s) => (
              <div className="stat" key={s.label}>
                <div className="stat-n">{s.n}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="hub-section">
          <h2 className="section-h">How it works</h2>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div className="step-card" key={s.n}>
                <div className="step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="hub-section">
          <h2 className="section-h">Courses</h2>
          <div className="course-grid">
            {courses.map((c) => <CourseCard course={c} key={c.slug} />)}
          </div>
        </section>

        <section className="hub-section why-section">
          <h2 className="section-h">Why CareerLadder</h2>
          <div className="why-grid">
            <div className="why-card">
              <h3>Actually hands-on</h3>
              <p>SQLingo runs a real database in your browser. You write real queries and see real results, every chapter.</p>
            </div>
            <div className="why-card">
              <h3>Built at real depth</h3>
              <p>30+ chapters per course, from first principles to the topics that come up in real interviews and real jobs.</p>
            </div>
            <div className="why-card">
              <h3>Free, always</h3>
              <p>No signup, no paywall, no dark patterns. Just the material, built for people changing careers into tech.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
