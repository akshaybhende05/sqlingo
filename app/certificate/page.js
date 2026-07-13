"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { courses } from "../../lib/courses";

const TRACKED = courses.filter((c) => c.progressKey && c.questions);
const NAME_KEY = "cc_learner_name";

function readSolved(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const prog = JSON.parse(raw);
    if (!prog || typeof prog !== "object") return 0;
    let n = 0;
    for (const ch in prog) {
      const v = prog[ch];
      if (v && typeof v === "object") n += Object.keys(v).length;
    }
    return n;
  } catch (_) {
    return 0;
  }
}

// Deterministic, decorative reference code (no server verification — this is a local certificate).
function refCode(name, slug) {
  const s = (name + "|" + slug).toUpperCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return "CL-" + slug.slice(0, 3).toUpperCase() + "-" + h.toString(36).toUpperCase().slice(0, 6);
}

export default function CertificatePage() {
  const [mounted, setMounted] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = TRACKED
      .filter((c) => readSolved(c.progressKey) >= c.questions && c.questions > 0)
      .map((c) => ({ slug: c.slug, name: c.name, tagline: c.tagline, chapters: c.chapters, questions: c.questions }));
    setCompleted(done);
    if (done.length) setSlug(done[0].slug);
    try { setName(localStorage.getItem(NAME_KEY) || ""); } catch (_) {}
    setMounted(true);
  }, []);

  function onName(v) {
    setName(v);
    try { localStorage.setItem(NAME_KEY, v); } catch (_) {}
  }

  const course = completed.find((c) => c.slug === slug);
  const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const displayName = name.trim() || "Your Name";

  return (
    <>
      <div className="cert-chrome"><SiteHeader /></div>
      <main className="hub-main">
        <section className="hub-section">
          <div className="cert-chrome">
            <div className="eyebrow">Certificate</div>
            <h1 className="hub-title">Your certificate of completion</h1>

            {!mounted ? (
              <p className="hub-lead">Loading your progress…</p>
            ) : completed.length === 0 ? (
              <>
                <p className="hub-lead">
                  Certificates unlock when you finish every graded exercise in a course. You haven&apos;t completed one
                  yet — keep going and it&apos;ll appear here automatically.
                </p>
                <p style={{ marginTop: 16 }}>
                  <Link href="/progress" className="btn-secondary">See your progress →</Link>
                </p>
              </>
            ) : (
              <>
                <p className="hub-lead">
                  You&apos;ve completed {completed.length === 1 ? "a course" : `${completed.length} courses`}. Add your
                  name, then print or save it as a PDF to share.
                </p>
                <div className="cert-controls">
                  <label className="cert-field">
                    <span>Your name</span>
                    <input type="text" value={name} onChange={(e) => onName(e.target.value)} placeholder="e.g. Priya Patel" maxLength={60} />
                  </label>
                  {completed.length > 1 && (
                    <label className="cert-field">
                      <span>Course</span>
                      <select value={slug} onChange={(e) => setSlug(e.target.value)}>
                        {completed.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                      </select>
                    </label>
                  )}
                  <button type="button" className="btn-primary cert-print-btn" onClick={() => window.print()}>Print / Save as PDF</button>
                </div>
              </>
            )}
          </div>

          {mounted && course && (
            <div className="cert-card" role="img" aria-label={`Certificate of completion for ${course.name} awarded to ${displayName}`}>
              <div className="cert-inner">
                <div className="cert-brand">Career<span>Ladder</span></div>
                <div className="cert-kicker">Certificate of Completion</div>
                <div className="cert-presented">This certifies that</div>
                <div className="cert-name">{displayName}</div>
                <div className="cert-presented">has completed</div>
                <div className="cert-course">{course.name}</div>
                <div className="cert-tagline">{course.tagline}</div>
                <div className="cert-meta">
                  {course.chapters} chapters · {course.questions} graded exercises · completed hands-on, in the browser
                </div>
                <div className="cert-foot">
                  <div className="cert-foot-col">
                    <div className="cert-foot-val">{today}</div>
                    <div className="cert-foot-label">Date issued</div>
                  </div>
                  <div className="cert-seal" aria-hidden="true">CL</div>
                  <div className="cert-foot-col cert-foot-right">
                    <div className="cert-foot-val">{refCode(displayName, course.slug)}</div>
                    <div className="cert-foot-label">Reference</div>
                  </div>
                </div>
                <div className="cert-note">Free, hands-on IT courses · careerladder.io · Completion tracked in the learner&apos;s browser.</div>
              </div>
            </div>
          )}
        </section>
      </main>
      <div className="cert-chrome"><SiteFooter /></div>
    </>
  );
}
