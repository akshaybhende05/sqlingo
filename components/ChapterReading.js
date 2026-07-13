import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { courses } from "../lib/courses";

const SITE_URL = "https://careerladder.io";

function course(slug) {
  return courses.find((c) => c.slug === slug);
}
function allEntries(content) {
  return [...content.chapters, ...(content.extras || [])];
}

// generateStaticParams helper — one static page per chapter AND per extra (interview, cheat sheet).
export function chapterParams(content) {
  return allEntries(content).map((c) => ({ chapter: c.n }));
}

// generateMetadata helper.
export function chapterMetadata(content, slug, chapterParam) {
  const co = course(slug);
  const c = allEntries(content).find((x) => x.n === chapterParam);
  if (!c || !co) return {};
  const title = `${c.title} — ${co.name}`;
  const description = (c.lead || `Learn ${c.title} in ${co.name}, a free hands-on course from CareerLadder.`).slice(0, 155);
  const url = `${SITE_URL}${co.href}/${c.n}`;
  return {
    title,
    description,
    alternates: { canonical: `${co.href}/${c.n}` },
    openGraph: { title, description, url, type: "article", siteName: "CareerLadder" },
    twitter: { card: "summary", title, description },
  };
}

export default function ChapterReading({ content, slug, chapter }) {
  const co = course(slug);
  const chapters = content.chapters;
  const extras = content.extras || [];
  const c = allEntries(content).find((x) => x.n === chapter);
  if (!c || !co) notFound();

  const isChapter = c.kind !== "extra";
  const idx = chapters.findIndex((x) => x.n === c.n);
  const prev = isChapter && idx > 0 ? chapters[idx - 1] : null;
  const next = isChapter && idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: c.title,
    description: (c.lead || "").slice(0, 200),
    url: `${SITE_URL}${co.href}/${c.n}`,
    isPartOf: { "@type": "Course", name: co.name, url: `${SITE_URL}${co.href}` },
    isAccessibleForFree: true,
    inLanguage: "en",
    learningResourceType: isChapter ? "Tutorial chapter" : c.title,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Courses", item: `${SITE_URL}/courses` },
      { "@type": "ListItem", position: 3, name: co.name, item: `${SITE_URL}${co.href}` },
      { "@type": "ListItem", position: 4, name: c.title, item: `${SITE_URL}${co.href}/${c.n}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumb]) }} />
      <SiteHeader />
      <main className="hub-main">
        <article className="reading">
          <nav className="reading-crumb" aria-label="Breadcrumb">
            <Link href="/courses">Courses</Link> <span>›</span> <Link href={co.href}>{co.name}</Link> <span>›</span> <span>{c.part}</span>
          </nav>

          <div className="reading-banner">
            Reading version. <Link href={co.href}>Open the interactive {co.name} course →</Link> to practise it yourself.
          </div>

          <div className="reading-content" dangerouslySetInnerHTML={{ __html: c.html }} />

          {isChapter && (
            <nav className="reading-pager" aria-label="Chapter navigation">
              {prev ? <Link href={`${co.href}/${prev.n}`} className="reading-prev">← {prev.title}</Link> : <span />}
              {next ? <Link href={`${co.href}/${next.n}`} className="reading-next">{next.title} →</Link> : <span />}
            </nav>
          )}

          {extras.length > 0 && (
            <section className="reading-extras">
              <h2>Reference &amp; practice</h2>
              <ul>
                {extras.map((x) => (
                  <li key={x.n}>
                    {x.n === c.n ? <span aria-current="page">{x.title}</span> : <Link href={`${co.href}/${x.n}`}>{x.title}</Link>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="reading-index">
            <h2>All {co.name} chapters</h2>
            <ol>
              {chapters.map((x) => (
                <li key={x.n}>
                  {x.n === c.n ? <span aria-current="page">{x.title}</span> : <Link href={`${co.href}/${x.n}`}>{x.title}</Link>}
                </li>
              ))}
            </ol>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
