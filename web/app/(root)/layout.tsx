import Footer from "@/custom_components/footer";
import Navbar from "./_components/nav";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto mt-24 px-4 min-h-[60vh]">
        {children}
      </div>

       <Footer />
    </>
  );
}
