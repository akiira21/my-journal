import Link from "next/link";
import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="px-12 py-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-8 md:gap-16">
          <div className="flex flex-col space-y-4 items-start">
            <Link
              href="/"
              className="text-sm font-medium text-neutral-500 hover:text-neutral-700"
            >
              Home
            </Link>
            <Link
              href="/design"
              className="text-sm font-medium text-neutral-500 hover:text-neutral-700"
            >
              Design
            </Link>
          </div>
          <div className="flex flex-col space-y-4 items-start">
            <Link
              href="https://x.com/meArun_Kumar_"
              target="_blank"
              className="text-sm font-medium text-neutral-500 hover:text-neutral-700"
            >
              Twitter
            </Link>
            <Link
              href="https://github.com/Arun-Kumar21"
              target="_blank"
              className="text-sm font-medium text-neutral-500 hover:text-neutral-700"
            >
              Github
            </Link>
          </div>
          <div className="flex flex-col space-y-4 items-start">
            <Link
              href="https://arun-kumar.vercel.app/"
              target="_blank"
              className="text-sm font-medium text-neutral-500 hover:text-neutral-700"
            >
              Portfolio
            </Link>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between pe-6">
          <div className="flex items-center space-x-2 text-sm text-neutral-800 font-semibold">
            <span>© 2025 Arun Kumar</span>
          </div>
          <Logo width={28} height={28} />
        </div>
      </div>
    </footer>
  );
}
