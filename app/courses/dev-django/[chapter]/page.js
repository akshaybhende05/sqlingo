import content from "../../../../lib/content/dev-django.json";
import ChapterReading, { chapterParams, chapterMetadata } from "../../../../components/ChapterReading";

const SLUG = "dev-django";
export const dynamicParams = false;

export function generateStaticParams() {
  return chapterParams(content);
}

export function generateMetadata({ params }) {
  return chapterMetadata(content, SLUG, params.chapter);
}

export default function Page({ params }) {
  return <ChapterReading content={content} slug={SLUG} chapter={params.chapter} />;
}
