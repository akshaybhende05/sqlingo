import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-logo">Career<span>Ladder</span></div>
        <p>Free, hands-on IT courses. Built for people switching careers into tech.</p>
        <nav className="site-footer-nav">
          <Link href="/courses">Courses</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </footer>
  );
}
