import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import Footer from "@/custom_components/footer";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arun Kumar's Journal",
  description:
    "Welcome to Arun Kumar's personal journal where he shares insights, experiences, and stories about his journey in software development and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} selection:bg-[#F0F5FE] selection:text-[#3579F6] dark:selection:bg-[#0E121F] dark:selection:text-[#5B86F4]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
