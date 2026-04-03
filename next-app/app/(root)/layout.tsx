import { Footer } from "@/components/footer";
import { MainNavbar } from "@/components/main-navbar";

export default function RootPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-background text-foreground">
      <MainNavbar />

      <main className="mx-auto w-full max-w-3xl border-l border-r border-border/70 pb-14 sm:pb-16">
        {children}
      </main>

      <Footer />
    </div>
  );
}