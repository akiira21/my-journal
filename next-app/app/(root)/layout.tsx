import { Footer } from "@/components/footer";
import { MainNavbar } from "@/components/main-navbar";

export default function RootPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-background pt-12 text-foreground">
      <MainNavbar />

      <main className="mx-auto flex w-full max-w-3xl flex-1 border-l border-r border-border/70 pb-14 sm:pb-16">
        {children}
      </main>

      <Footer />
    </div>
  );
}