import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CourseCard from "../components/CourseCard";
import HeroVisual from "../components/HeroVisual";
import MyProgress from "../components/MyProgress";
import { courses } from "../lib/courses";

export const metadata = { alternates: { canonical: "/" } };

const SITE_URL = "https://careerladder.io";

const STEPS = [
  {
    n: "01",
    title: "Pick a course",
    body: "SQL, Business Analyst, QA, and the full six-course Developer track (Fundamentals, Python, Django, FastAPI, DevOps, and a Capstone Project) are all ready now. No prerequisites, no signup.",
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
  { n: "285", label: "chapters across all courses" },
  { n: "469", label: "graded practice questions" },
  { n: "9", label: "real, hands-on courses" },
  { n: "0", label: "signups, paywalls, or dark patterns" },
];

const AUDIENCE = [
  {
    icon: "→",
    title: "Career switchers",
    body: "Coming from a non-tech job and want a real, practical way in — without a bootcamp's price tag or a year of your life.",
  },
  {
    icon: "★",
    title: "Students & new grads",
    body: "Bridging the gap between what college covered and what the job interview and the first week actually demand.",
  },
  {
    icon: "↑",
    title: "Professionals upskilling",
    body: "Adding SQL, Python, or DevOps to the role you already have, on your own schedule, one chapter at a time.",
  },
];

const FAQS = [
  {
    q: "Is CareerLadder really free?",
    a: "Yes, completely. There is no signup, no paywall, no trial that expires, and no card required. Every chapter of every course is open, and it will stay that way.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Everything runs in your browser. SQLingo runs a real SQLite database, and the Python and Capstone courses run a real Python interpreter, so the code you write actually executes, with nothing to set up.",
  },
  {
    q: "Do I need prior experience?",
    a: "No. Every course starts from first principles and builds up in small steps. If you have never written a line of code or a single query, you are exactly who these courses are written for.",
  },
  {
    q: "How is the practice graded?",
    a: "It depends on the course. Live-code courses (SQL, Python, Capstone) auto-grade your code against real output. Guided courses (BA, QA, and the other Developer tracks) use graded multiple-choice plus write-it-yourself exercises you compare against a model answer, so every course still involves doing, not just reading.",
  },
  {
    q: "Is my progress saved?",
    a: "Yes, your progress and completed exercises are saved automatically in your browser on the device you are using. Because there are no accounts, progress is per-device: clearing your browser data or switching devices starts you fresh.",
  },
  {
    q: "Which course should I start with?",
    a: "SQLingo is the best starting point for most people. It is the most hands-on, useful in almost every tech role, and needs no background at all. From there, follow whichever track matches the job you want.",
  },
];

function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "CareerLadder",
      url: SITE_URL,
      description: "Free, hands-on IT courses for people switching careers into tech.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "CareerLadder",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "ItemList",
      name: "CareerLadder courses",
      itemListElement: courses
        .filter((c) => c.status === "available" && c.href)
        .map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Course",
            name: c.name,
            description: c.description,
            url: `${SITE_URL}${c.href}`,
            provider: { "@id": `${SITE_URL}/#organization` },
            isAccessibleForFree: true,
          },
        })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main className="hub-main">
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">Free · No signup · Hands-on</div>
              <h1 className="hero-title">Learn the skills IT jobs actually need.</h1>
              <p className="hero-lead">
                Real practice, not video lectures. Start with SQLingo, our free, hands-on SQL handbook, then move on
                to Business Analyst, QA, or the full six-course Developer track, from first principles through a
                real Capstone Project.
              </p>
              <div className="hero-cta-row">
                <Link href="/courses/sql" className="btn-primary">Start SQLingo →</Link>
                <Link href="/courses" className="btn-secondary">Browse all courses</Link>
              </div>
              <div className="hero-trust">
                {["Real SQL & Python in your browser", "No signup, ever", "Works offline"].map((t) => (
                  <span key={t}>
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t}
                  </span>
                ))}
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

        <MyProgress variant="landing" />

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
          <h2 className="section-h">Who it&apos;s for</h2>
          <div className="audience-grid">
            {AUDIENCE.map((a) => (
              <div className="audience-card" key={a.title}>
                <div className="audience-icon" aria-hidden="true">{a.icon}</div>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
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
              <p>SQLingo runs a real database in your browser and Python runs a real interpreter. You write real code, see real results, and every exercise is graded, every chapter.</p>
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

        <section className="hub-section faq-section">
          <h2 className="section-h">Frequently asked questions</h2>
          <div className="faq-list">
            {FAQS.map((f) => (
              <details className="faq-item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <div className="final-cta-inner">
            <h2>Start learning today, for free.</h2>
            <p>No signup, no card, no catch. Write your first real SQL query in the next two minutes.</p>
            <div className="hero-cta-row">
              <Link href="/courses/sql" className="btn-primary">Start SQLingo →</Link>
              <Link href="/courses" className="btn-secondary">Browse all courses</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
