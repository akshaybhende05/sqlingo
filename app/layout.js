import "./globals.css";
import ServiceWorkerRegistrar from "../components/ServiceWorkerRegistrar";

const title = "CareerLadder — Free, hands-on IT courses";
const description = "Learn the skills real IT jobs need, one hands-on course at a time. SQL, Business Analyst, QA, Python, Django, FastAPI, DevOps and more — hands-on and graded. Free, no signup.";

export const metadata = {
  metadataBase: new URL("https://careerladder.io"),
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

const THEME_INIT = `(function(){try{var t=localStorage.getItem('cc_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
