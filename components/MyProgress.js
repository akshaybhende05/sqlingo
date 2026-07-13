"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { courses } from "../lib/courses";

const TRACKED = courses.filter((c) => c.progressKey && c.questions && c.href);

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

// variant: "landing" (compact, hidden until there is progress) | "full" (dedicated page)
export default function MyProgress({ variant = "landing" }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = TRACKED.map((c) => {
      const solved = Math.min(readSolved(c.progressKey), c.questions);
      return {
        slug: c.slug,
        name: c.name,
        href: c.href,
        solved,
        total: c.questions,
        pct: c.questions ? Math.round((solved / c.questions) * 100) : 0,
      };
    });
    setRows(data);
  }, []);

  if (rows === null) return null; // pre-mount: avoid hydration mismatch

  const started = rows.filter((r) => r.solved > 0);
  const completed = rows.filter((r) => r.solved >= r.total);
  const totalSolved = rows.reduce((s, r) => s + r.solved, 0);
  const totalQuestions = rows.reduce((s, r) => s + r.total, 0);

  // On the landing page, stay out of the way until the learner has actually started something.
  if (variant === "landing" && started.length === 0) return null;

  const shown = variant === "full" ? rows : started;

  return (
    <section className={`myprog ${variant === "full" ? "myprog-full" : ""}`}>
      {variant === "full" && <div className="eyebrow">Your learning</div>}
      <div className="myprog-head">
        <h2 className={variant === "full" ? "hub-title" : "section-h"}>
          {variant === "full" ? "Your progress" : "Pick up where you left off"}
        </h2>
        <div className="myprog-summary">
          <span><strong>{totalSolved}</strong> of {totalQuestions} exercises solved</span>
          <span className="myprog-dot" aria-hidden="true">·</span>
          <span><strong>{started.length}</strong> started</span>
          <span className="myprog-dot" aria-hidden="true">·</span>
          <span><strong>{completed.length}</strong> completed</span>
        </div>
      </div>

      <div className="myprog-list">
        {shown.map((r) => {
          const done = r.solved >= r.total;
          const label = done ? "Review course" : r.solved > 0 ? "Resume" : "Start";
          return (
            <div className={`myprog-row ${done ? "is-done" : ""}`} key={r.slug}>
              <div className="myprog-row-top">
                <span className="myprog-name">{r.name}{done && <span className="myprog-check" aria-label="completed"> ✓</span>}</span>
                <span className="myprog-count">{r.solved} / {r.total}</span>
              </div>
              <div className="myprog-bar"><div className="myprog-fill" style={{ width: `${r.pct}%` }} /></div>
              <div className="myprog-row-foot">
                <span className="myprog-pct">{r.pct}%</span>
                <Link href={r.href} className="myprog-cta">{label} →</Link>
              </div>
            </div>
          );
        })}
      </div>

      {variant === "landing" && (
        <div className="myprog-more">
          <Link href="/progress">See full progress →</Link>
        </div>
      )}
      {variant === "full" && completed.length > 0 && (
        <div className="myprog-more">
          <Link href="/certificate">Get your certificate →</Link>
        </div>
      )}
    </section>
  );
}
