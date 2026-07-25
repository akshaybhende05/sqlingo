import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { entries as sqlEntries } from "../../lib/sql-reference";
import { entries as pyEntries } from "../../lib/python-reference";
import { entries as djangoEntries } from "../../lib/django-reference";
import { entries as fastapiEntries } from "../../lib/fastapi-reference";
import { entries as devopsEntries } from "../../lib/devops-reference";

export const metadata = {
  title: "Reference — quick, searchable SQL, Python and Django reference | CareerLadder",
  description:
    "Look up any SQL command, Python concept or Django feature — each on its own page with a plain explanation and an example. Free companions to the hands-on courses.",
  alternates: { canonical: "/reference" },
};

const SECTIONS = [
  { href: "/sql-reference", name: "SQL reference", count: sqlEntries.length, blurb: "Every clause, operator, join, function and constraint, with runnable examples." },
  { href: "/python-reference", name: "Python reference", count: pyEntries.length, blurb: "Core concepts, data structures, functions, OOP and built-ins, each explained plainly." },
  { href: "/django-reference", name: "Django reference", count: djangoEntries.length, blurb: "Models, the ORM, views, templates, forms and the admin, with short examples." },
  { href: "/fastapi-reference", name: "FastAPI reference", count: fastapiEntries.length, blurb: "Routes, Pydantic validation, dependencies, async and CORS, each explained plainly." },
  { href: "/devops-reference", name: "DevOps reference", count: devopsEntries.length, blurb: "Docker, CI/CD, Kubernetes, reverse proxies, monitoring, scaling and secrets." },
];

export default function ReferenceHub() {
  return (
    <>
      <SiteHeader />
      <main className="hub-main">
        <section className="hub-section">
          <div className="eyebrow">Reference</div>
          <h1 className="hub-title">Look it up</h1>
          <p className="hub-lead">
            Searchable, plain-English references — one page per topic, each with a short example. These are the
            look-it-up companions to the <Link href="/courses">hands-on courses</Link>.
          </p>
          <div className="explain-grid" style={{ marginTop: 24 }}>
            {SECTIONS.map((s) => (
              <Link href={s.href} className="explain-card" key={s.href}>
                <span className="explain-term">{s.name} <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>· {s.count} pages</span></span>
                <span className="explain-one">{s.blurb}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
