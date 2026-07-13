import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import MyProgress from "../../components/MyProgress";
import ProgressDataControls from "../../components/ProgressDataControls";

export const metadata = {
  title: "Your progress — CareerLadder",
  description: "Track how far you've come across every CareerLadder course. Your progress is saved in your browser — no signup needed.",
  alternates: { canonical: "/progress" },
  robots: { index: false, follow: true },
};

export default function ProgressPage() {
  return (
    <>
      <SiteHeader />
      <main className="hub-main">
        <MyProgress variant="full" />
        <section className="hub-section" style={{ paddingTop: 24 }}>
          <p className="hub-lead" style={{ fontSize: 15 }}>
            Progress is stored in this browser on this device — there are no accounts. To move it to another device, or
            keep it safe before clearing your browser, back it up to a file and restore it wherever you like.
          </p>
          <div style={{ marginTop: 16 }}>
            <ProgressDataControls />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
