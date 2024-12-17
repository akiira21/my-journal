import MainNav from "../navigation/main-nav";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MainNav />
      <div className="mt-20 min-h-[calc(100vh-13rem)] h-full w-full relative">
        {children}
      </div>
    </>
  );
}
