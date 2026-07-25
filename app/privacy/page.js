import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata = {
  title: "Privacy — CareerLadder",
  description:
    "CareerLadder has no accounts and no tracking. Your progress is stored only in your own browser. Here's exactly what that means.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="hub-main">
        <section className="hub-section" style={{ maxWidth: 760 }}>
          <div className="eyebrow">Privacy</div>
          <h1 className="hub-title">Your privacy, in plain English</h1>
          <p className="hub-lead">
            CareerLadder is free, with no accounts and no tracking. There is very little to say here, which is the point.
          </p>

          <h2 className="section-h" style={{ marginTop: 28 }}>What we collect</h2>
          <p className="body">
            Nothing about you on our servers. There is no sign-up, no login, and no database of users. We do not ask for
            your name, email, or any personal detail to use the courses.
          </p>

          <h2 className="section-h" style={{ marginTop: 28 }}>What is stored in your browser</h2>
          <p className="body">
            To make the courses work, a few things are saved in your own browser using local storage, on your device only:
          </p>
          <ul className="body" style={{ paddingLeft: 22 }}>
            <li style={{ margin: "6px 0" }}>Your course progress and which exercises you have solved.</li>
            <li style={{ margin: "6px 0" }}>The chapter you last had open, so you can pick up where you left off.</li>
            <li style={{ margin: "6px 0" }}>A name you type in only if you generate a completion certificate.</li>
            <li style={{ margin: "6px 0" }}>Your light or dark theme choice.</li>
          </ul>
          <p className="body">
            This data never leaves your device and is never sent to us. You can export it to a file, restore it, or clear
            it at any time from the <a href="/progress">Progress</a> page. Clearing your browser data removes it.
          </p>

          <h2 className="section-h" style={{ marginTop: 28 }}>No tracking or ads</h2>
          <p className="body">
            We do not use advertising, third-party trackers, or analytics that follow you around the web. We do not set
            tracking cookies. The site runs entirely as static pages.
          </p>

          <h2 className="section-h" style={{ marginTop: 28 }}>Third-party services</h2>
          <p className="body">
            To keep the courses hands-on, some run real code in your browser using libraries loaded from public CDNs —
            SQLite (via sql.js) for SQL, and Python (via Pyodide) for the Python and Capstone courses. Your browser
            fetches those files directly; nothing about your work is shared with them.
          </p>

          <h2 className="section-h" style={{ marginTop: 28 }}>Changes</h2>
          <p className="body">
            If this ever changes — for example, if we add an optional account for syncing progress across devices — it
            will be opt-in, and this page will say so clearly.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
