import { courses } from "../lib/courses";

const SITE_URL = "https://careerladder.io";

// Server-rendered JSON-LD Course structured data. Gives search engines rich
// course information even though the lesson body is injected client-side.
export default function CourseSchema({ slug }) {
  const course = courses.find((c) => c.slug === slug);
  if (!course) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    url: `${SITE_URL}${course.href}`,
    provider: {
      "@type": "Organization",
      name: "CareerLadder",
      url: SITE_URL,
    },
    isAccessibleForFree: true,
    inLanguage: "en",
    ...(course.chapters
      ? { numberOfCredits: course.chapters, educationalCredentialAwarded: `${course.chapters} chapters` }
      : {}),
    offers: {
      "@type": "Offer",
      category: "Free",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
