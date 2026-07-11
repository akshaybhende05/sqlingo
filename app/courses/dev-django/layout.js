const title = "Django — build a full web application | CareerLadder";
const description = "A free, hands-on Django course: models, the ORM, migrations, views, templates, the admin panel, and auth, building TastyGo's backend as a full Django web application.";

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "CareerLadder",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

import CourseSchema from "../../../components/CourseSchema";

export default function DjangoLayout({ children }) {
  return (
    <>
      {children}
      <CourseSchema slug="dev-django" />
    </>
  );
}
