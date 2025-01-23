import Script from "next/script";
import Footer from "@/custom_components/footer";
import MainNav from "../navigation/main-nav";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />

      <Script strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}',{
          page_path: window.location.pathname,
          });
         `}
      </Script>

      <MainNav />
      <div className="mt-20 min-h-[calc(100vh-13rem)] h-full w-full relative mb-24 px-4">
        {children}
      </div>
      <Footer />
    </>
  );
}
