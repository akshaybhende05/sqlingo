import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { entries, categories } from "../../lib/django-reference";

const SITE_URL = "https://careerladder.io";

export const metadata = {
  title: "Django reference — models, views, the ORM and more with examples | CareerLadder",
  description:
    "A quick, searchable Django reference: models and the ORM, migrations, views, URLs, templates, forms, the admin, and DRF — each with a plain explanation and an example. Free.",
  alternates: { canonical: "/django-reference" },
};

export default function DjangoReferenceHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Django reference",
    url: `${SITE_URL}/django-reference`,
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      url: `${SITE_URL}/django-reference/${e.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="hub-main">
        <section className="hub-section">
          <div className="eyebrow">Django reference</div>
          <h1 className="hub-title">Django reference</h1>
          <p className="hub-lead">
            Django concepts — models, the ORM, views, templates, forms and more — each on its own page with a plain
            explanation and a short example. New to Django? Take the guided{" "}
            <Link href="/courses/dev-django">Django course</Link> instead — this is the look-it-up companion.
          </p>

          {categories.map((cat) => {
            const items = entries.filter((e) => e.category === cat);
            if (!items.length) return null;
            return (
              <div className="explain-cat" key={cat}>
                <h2 className="section-h">{cat}</h2>
                <div className="explain-grid">
                  {items.map((e) => (
                    <Link href={`/django-reference/${e.slug}`} className="explain-card" key={e.slug}>
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
