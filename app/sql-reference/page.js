import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { entries, categories } from "../../lib/sql-reference";

const SITE_URL = "https://careerladder.io";

export const metadata = {
  title: "SQL reference — every command, clause and operator with examples | CareerLadder",
  description:
    "A quick, searchable SQL reference: SELECT, WHERE, JOINs, GROUP BY, set operations, constraints and more — each with syntax and a runnable example. Free.",
  alternates: { canonical: "/sql-reference" },
};

export default function SqlReferenceHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SQL reference",
    url: `${SITE_URL}/sql-reference`,
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      url: `${SITE_URL}/sql-reference/${e.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="hub-main">
        <section className="hub-section">
          <div className="eyebrow">SQL reference</div>
          <h1 className="hub-title">SQL reference</h1>
          <p className="hub-lead">
            Every SQL command, clause and operator on its own page, with the syntax and a worked example you can run.
            Learning from scratch? Take the guided <Link href="/courses/sql">SQLingo course</Link> instead — this is the
            look-it-up companion.
          </p>

          {categories.map((cat) => {
            const items = entries.filter((e) => e.category === cat);
            if (!items.length) return null;
            return (
              <div className="explain-cat" key={cat}>
                <h2 className="section-h">{cat}</h2>
                <div className="explain-grid">
                  {items.map((e) => (
                    <Link href={`/sql-reference/${e.slug}`} className="explain-card" key={e.slug}>
                      <span className="explain-term">{e.name}</span>
                      <span className="explain-one">{e.summary}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
