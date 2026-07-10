import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata = {
  title: "About — CareerLadder",
  description: "Why CareerLadder exists and how its courses are built.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="hub-main">
        <section className="hub-section">
          <div className="eyebrow">About</div>
          <h1 className="hub-title">Built for people switching into IT</h1>
          <p className="hub-lead">
            CareerLadder started as SQLingo, a free SQL handbook built for one career-switcher learning SQL from
            scratch. It is growing into a small set of courses for the roles people actually move into: Business
            Analyst, QA, and Developer, each taught the same way SQLingo was.
          </p>
          <h2 className="section-h" style={{ marginTop: 32 }}>How every course is built</h2>
          <p className="body">
            No videos to sit through and no paywalls. Every chapter mixes a plain-English explanation, a worked
            example grounded in one running scenario, and graded practice you check yourself, right in the browser.
          </p>
          <p className="body">
            SQLingo runs a real SQLite database client-side, so every query you write actually executes. Courses
            that cannot run in a database (Business Analyst, QA) use realistic scenario practice and auto-checked
            quizzes instead, so every course still involves doing, not just reading.
          </p>
          <h2 className="section-h" style={{ marginTop: 32 }}>Who it's for</h2>
          <p className="body">
            Anyone changing careers into tech who wants a straight, practical explanation, without jargon, without
            a subscription, and without pretending the material is harder than it is.
          </p>
        </section>

        <section className="hub-section founder-section">
          <h2 className="section-h">The person behind it</h2>
          <div className="founder-card">
            <div className="founder-photo">
              <img src="/founder.png" alt="Akshay S. Bhende" />
            </div>
            <div className="founder-bio">
              <h3>Akshay S. Bhende</h3>
              <p className="founder-role">Founder &amp; software engineer</p>
              <p className="body">
                I built the first version of this as SQLingo, a SQL handbook for one specific person learning to
                query a database for the first time. It kept growing because the same problem shows up everywhere
                in tech hiring: people are told to "learn SQL" or "learn to be a BA," handed a wall of video
                lectures, and left to figure out on their own whether they actually understood any of it.
              </p>
              <p className="body">
                CareerLadder is my attempt to fix that: courses built at real depth, with practice you do yourself
                and check yourself, free, with no signup wall between you and the material. As a software engineer,
                I care more about whether something actually works than whether it looks impressive in a demo, and
                that is the standard every course here is held to.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
