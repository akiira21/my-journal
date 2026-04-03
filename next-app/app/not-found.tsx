import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default function NotFound() {
  return (
    <section className="grid min-h-[60vh] w-full place-items-center border-b border-line px-6 py-16 sm:px-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Page did not exist</h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          The page you are looking for could not be found.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-blue-500 transition-colors hover:text-blue-400"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Go back to home
        </Link>
      </div>
    </section>
  );
}
