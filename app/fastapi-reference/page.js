import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { entries, categories } from "../../lib/fastapi-reference";

const SITE_URL = "https://careerladder.io";

export const metadata = {
  title: "FastAPI reference — routes, Pydantic, dependencies and more with examples | CareerLadder",
  description:
    "A quick, searchable FastAPI reference: path operations, request bodies, Pydantic validation, response models, dependencies, async and CORS — each with a plain explanation and an example.",
  alternates: { canonical: "/fastapi-reference" },
};

export default function FastapiReferenceHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "FastAPI reference",
    url: `${SITE_URL}/fastapi-reference`,
    itemListElement: entries.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.name, url: `${SITE_URL}/fastapi-reference/${e.slug}` })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="hub-main">
        <section className="hub-section">
          <div className="eyebrow">FastAPI reference</div>
          <h1 className="hub-title">FastAPI reference</h1>
          <p className="hub-lead">
            FastAPI concepts — routes, validation, dependencies, async — each on its own page with a plain explanation
            and a short example. New to it? Take the guided <Link href="/courses/dev-fastapi">FastAPI course</Link> instead.
          </p>
          {categories.map((cat) => {
            const items = entries.filter((e) => e.category === cat);
            if (!items.length) return null;
            return (
              <div className="explain-cat" key={cat}>
                <h2 className="section-h">{cat}</h2>
                <div className="explain-grid">
                  {items.map((e) => (
                    <Link href={`/fastapi-reference/${e.slug}`} className="explain-card" key={e.slug}>
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
