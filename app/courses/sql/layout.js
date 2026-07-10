const title = "SQLingo — Learn SQL, properly";
const description = "A free, interactive SQL handbook. Learn SQL from first principles with a real database running in your browser, no signup needed.";

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "SQLingo",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function SqlLayout({ children }) {
  return children;
}
