import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { entries, categories } from "../../lib/python-reference";

const SITE_URL = "https://careerladder.io";

export const metadata = {
  title: "Python reference — core concepts and built-ins with examples | CareerLadder",
  description:
    "A quick, searchable Python reference: variables, lists, dicts, loops, functions, and built-ins like len, zip and sorted — each with a plain explanation and an example. Free.",
  alternates: { canonical: "/python-reference" },
};

export default function PythonReferenceHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Python reference",
    url: `${SITE_URL}/python-reference`,
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      url: `${SITE_URL}/python-reference/${e.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="hub-main">
        <section className="hub-section">
          <div className="eyebrow">Python reference</div>
          <h1 className="hub-title">Python reference</h1>
          <p className="hub-lead">
            Core Python concepts and built-in functions, each on its own page with a plain explanation and a short
            example. New to Python? Take the guided <Link href="/courses/dev-python">Python course</Link> instead — this
            is the look-it-up companion.
          </p>

          {categories.map((cat) => {
            const items = entries.filter((e) => e.category === cat);
            if (!items.length) return null;
            return (
              <div className="explain-cat" key={cat}>
                <h2 className="section-h">{cat}</h2>
                <div className="explain-grid">
                  {items.map((e) => (
                    <Link href={`/python-reference/${e.slug}`} className="explain-card" key={e.slug}>
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
