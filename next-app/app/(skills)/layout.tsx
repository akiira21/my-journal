import { Footer } from "@/components/footer";
import { MainNavbar } from "@/components/main-navbar";

export default function SkillsPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-background pt-12 text-foreground">
      <MainNavbar />

      <main className="mx-auto flex w-full flex-1 border-x border-line pb-14 sm:pb-16 overflow-visible">
        {children}
      </main>

      <Footer />
    </div>
  );
}
