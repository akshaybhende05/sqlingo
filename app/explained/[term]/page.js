import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { terms, bySlug } from "../../../lib/explained";

const SITE_URL = "https://careerladder.io";

export const dynamicParams = false;

export function generateStaticParams() {
  return terms.map((t) => ({ term: t.slug }));
}

export function generateMetadata({ params }) {
  const t = bySlug[params.term];
  if (!t) return {};
  const title = `What is ${t.term}? Explained simply | CareerLadder`;
  const description = `${t.oneLiner} ${t.analogy}`.slice(0, 155);
  const url = `${SITE_URL}/explained/${t.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/explained/${t.slug}` },
    openGraph: { title, description, url, type: "article", siteName: "CareerLadder" },
    twitter: { card: "summary", title, description },
  };
}

export default function TermPage({ params }) {
  const t = bySlug[params.term];
  if (!t) notFound();
  const related = (t.related || []).map((s) => bySlug[s]).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: t.term,
    description: t.oneLiner,
    url: `${SITE_URL}/explained/${t.slug}`,
    inDefinedTermSet: `${SITE_URL}/explained`,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Explained", item: `${SITE_URL}/explained` },
      { "@type": "ListItem", position: 3, name: t.term, item: `${SITE_URL}/explained/${t.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumb]) }} />
      <SiteHeader />
      <main className="hub-main">
        <article className="explain-article">
          <nav className="reading-crumb" aria-label="Breadcrumb">
            <Link href="/explained">Explained</Link> <span>›</span> <span>{t.category}</span>
          </nav>

          <div className="eyebrow">{t.category}</div>
          <h1 className="explain-title">What is {t.term}?</h1>
          <p className="explain-lead">{t.oneLiner}</p>

          <div className="explain-analogy">
            <div className="explain-analogy-label">The plain-English version</div>
            <p>{t.analogy}</p>
          </div>

          {t.figure && <div className="explain-figure" dangerouslySetInnerHTML={{ __html: t.figure }} />}

          {t.detail.map((p, i) => <p className="explain-body" key={i}>{p}</p>)}

          {t.course && (
            <p className="explain-course">
              Want to go deeper? <Link href={t.course.href}>{t.course.label} →</Link>
            </p>
          )}

          {related.length > 0 && (
            <section className="explain-related">
              <h2>Related terms</h2>
              <ul>
                {related.map((r) => (
                  <li key={r.slug}><Link href={`/explained/${r.slug}`}>{r.term}</Link></li>
                ))}
              </ul>
            </section>
          )}

          <p className="explain-back"><Link href="/explained">← All software terms</Link></p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
