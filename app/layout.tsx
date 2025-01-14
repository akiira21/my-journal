import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arun Kumar's Blog",
  description:
    "Welcome to Arun Kumar's personal blog where he shares insights, experiences, and stories about his journey in software development and beyond.",
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
        </ThemeProvider>
      </body>
    </html>
  );
}
