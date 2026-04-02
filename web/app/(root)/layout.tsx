import Footer from "@/custom_components/footer";
import Navbar from "./_components/nav";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="group/layout">
      <Navbar />

      <main className="max-w-screen overflow-x-hidden px-2">
        <div className="mx-auto min-h-[60vh] md:max-w-3xl">{children}</div>
      </main>

      <div className="pb-[env(safe-area-inset-bottom,0px)]">
        <div className="h-16 sm:h-8" />
      </div>

      <Footer />
    </div>
  );
}
