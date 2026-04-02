import Link from "next/link";
import Logo from "./logo";
import { GITHUB, PORTFOLIO, XPROFILE } from "@/personal-links";

export default function Footer() {
    return (
        <footer className="max-w-screen overflow-x-hidden px-2">
            <div className="screen-line-top mx-auto border-x border-line md:max-w-3xl">
                <div className="screen-line-bottom flex items-center justify-between gap-4 px-4 py-3 max-sm:flex-col">
                    <div className="flex items-center gap-3">
                        <Logo width={24} height={24} />
                        <p className="font-mono text-xs text-muted-foreground">
                            Thoughts, stories, and reflections from a wandering mind.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                        <Link
                            href={XPROFILE}
                            className="transition-colors hover:text-foreground"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Twitter
                        </Link>
                        <div className="h-3 w-px bg-line" />
                        <Link
                            href={GITHUB}
                            className="transition-colors hover:text-foreground"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </Link>
                        <div className="h-3 w-px bg-line" />
                        <Link
                            href={PORTFOLIO}
                            className="transition-colors hover:text-foreground"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Portfolio
                        </Link>
                    </div>
                </div>

                <div className="px-4 py-2 text-center font-mono text-[11px] text-muted-foreground">
                    © {new Date().getFullYear()} Arun Kumar. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
