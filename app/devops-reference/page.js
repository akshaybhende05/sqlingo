import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { entries, categories } from "../../lib/devops-reference";

const SITE_URL = "https://careerladder.io";

export const metadata = {
  title: "DevOps reference — Docker, CI/CD, Kubernetes and more, explained | CareerLadder",
  description:
    "A quick, searchable DevOps reference: Docker, Dockerfiles, CI/CD, Kubernetes, reverse proxies, monitoring, scaling and secrets — each explained plainly with an example.",
  alternates: { canonical: "/devops-reference" },
};

export default function DevopsReferenceHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DevOps reference",
    url: `${SITE_URL}/devops-reference`,
    itemListElement: entries.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.name, url: `${SITE_URL}/devops-reference/${e.slug}` })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="hub-main">
        <section className="hub-section">
          <div className="eyebrow">DevOps reference</div>
          <h1 className="hub-title">DevOps reference</h1>
          <p className="hub-lead">
            DevOps concepts and tools — containers, CI/CD, orchestration, monitoring — each on its own page with a plain
            explanation. New to it? Take the guided <Link href="/courses/dev-devops">DevOps course</Link> instead.
          </p>
          {categories.map((cat) => {
            const items = entries.filter((e) => e.category === cat);
            if (!items.length) return null;
            return (
              <div className="explain-cat" key={cat}>
                <h2 className="section-h">{cat}</h2>
                <div className="explain-grid">
                  {items.map((e) => (
                    <Link href={`/devops-reference/${e.slug}`} className="explain-card" key={e.slug}>
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
