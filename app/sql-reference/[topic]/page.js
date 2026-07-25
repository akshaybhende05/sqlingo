import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { entries, bySlug } from "../../../lib/sql-reference";

const SITE_URL = "https://careerladder.io";

export const dynamicParams = false;

export function generateStaticParams() {
  return entries.map((e) => ({ topic: e.slug }));
}

export function generateMetadata({ params }) {
  const e = bySlug[params.topic];
  if (!e) return {};
  const title = `${e.name} in SQL — syntax and example | CareerLadder`;
  const description = `${e.name}: ${e.summary}`.slice(0, 155);
  const url = `${SITE_URL}/sql-reference/${e.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/sql-reference/${e.slug}` },
    openGraph: { title, description, url, type: "article", siteName: "CareerLadder" },
    twitter: { card: "summary", title, description },
  };
}

export default function SqlReferenceTopic({ params }) {
  const e = bySlug[params.topic];
  if (!e) notFound();
  const related = (e.related || []).map((s) => bySlug[s]).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${e.name} in SQL`,
    description: e.summary,
    url: `${SITE_URL}/sql-reference/${e.slug}`,
    isAccessibleForFree: true,
    inLanguage: "en",
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "SQL reference", item: `${SITE_URL}/sql-reference` },
      { "@type": "ListItem", position: 3, name: e.name, item: `${SITE_URL}/sql-reference/${e.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumb]) }} />
      <SiteHeader />
      <main className="hub-main">
        <article className="explain-article">
          <nav className="reading-crumb" aria-label="Breadcrumb">
            <Link href="/sql-reference">SQL reference</Link> <span>›</span> <span>{e.category}</span>
          </nav>

          <div className="eyebrow">{e.category}</div>
          <h1 className="explain-title">{e.name}</h1>
          <p className="explain-lead">{e.summary}</p>

          {e.detail && e.detail.map((p, i) => <p className="explain-body" key={i}>{p}</p>)}

          {e.syntax && (
            <>
              <h2 className="section-h" style={{ marginTop: 24 }}>Syntax</h2>
              <pre className="code">{e.syntax}</pre>
            </>
          )}

          {e.examples && e.examples.length > 0 && (
            <>
              <h2 className="section-h" style={{ marginTop: 24 }}>{e.examples.length > 1 ? "Examples" : "Example"}</h2>
              {e.examples.map((ex, i) => (
                <div key={i} style={{ margin: "0 0 16px" }}>
                  <pre className="code">{ex.code}</pre>
                  {ex.note && <p className="explain-body" style={{ marginTop: 6 }}>{ex.note}</p>}
                </div>
              ))}
            </>
          )}

          {e.notes && (
            <p className="explain-body"><b>Good to know:</b> {e.notes}</p>
          )}

          <p className="explain-course">
            Want to run it? <Link href="/courses/sql">Practise SQL live in SQLingo →</Link>
          </p>

          {related.length > 0 && (
            <section className="explain-related">
              <h2>Related</h2>
              <ul>
                {related.map((r) => (
                  <li key={r.slug}><Link href={`/sql-reference/${r.slug}`}>{r.name}</Link></li>
                ))}
              </ul>
            </section>
          )}

          <p className="explain-back"><Link href="/sql-reference">← All SQL reference</Link></p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
