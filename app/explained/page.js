import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { terms, categories } from "../../lib/explained";

const SITE_URL = "https://careerladder.io";

export const metadata = {
  title: "Software terms explained in plain English — CareerLadder",
  description:
    "Docker, nginx, reverse proxy, API, backend, gunicorn and more — every confusing software term explained simply, with everyday analogies. Free, no jargon.",
  alternates: { canonical: "/explained" },
};

export default function ExplainedHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Software terms explained",
    url: `${SITE_URL}/explained`,
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.oneLiner,
      url: `${SITE_URL}/explained/${t.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="hub-main">
        <section className="hub-section">
          <div className="eyebrow">Explained simply</div>
          <h1 className="hub-title">Software terms, in plain English</h1>
          <p className="hub-lead">
            Every confusing word — Docker, nginx, reverse proxy, backend, gunicorn — explained with a simple, everyday
            analogy, in a sentence or two. No jargon, no assumed knowledge.
          </p>

          {categories.map((cat) => {
            const items = terms.filter((t) => t.category === cat);
            if (!items.length) return null;
            return (
              <div className="explain-cat" key={cat}>
                <h2 className="section-h">{cat}</h2>
                <div className="explain-grid">
                  {items.map((t) => (
                    <Link href={`/explained/${t.slug}`} className="explain-card" key={t.slug}>
                      <span className="explain-term">{t.term}</span>
                      <span className="explain-one">{t.oneLiner}</span>
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
