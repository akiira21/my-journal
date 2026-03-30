import Link from "next/link";
import Logo from "./logo";
import { GITHUB, PORTFOLIO, XPROFILE } from "@/personal-links";

export default function Footer() {
    return (
        <footer className="border-t mt-16">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="flex flex-col items-center space-y-6">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Logo width={32} height={32}/>
                    </div>
                    
                    {/* Tagline */}
                    <p className="text-gray-600 text-center text-sm italic max-w-md">
                        Thoughts, stories, and reflections from a wandering mind
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex items-center space-x-6">
                        <Link 
                            href={XPROFILE} 
                            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Twitter
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link 
                            href={GITHUB} 
                            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link 
                            href={PORTFOLIO} 
                            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Portfolio
                        </Link>
                    </div>
                    
                    {/* Copyright */}
                    <div className="text-center text-xs text-gray-400 pt-4 border-t w-full">
                        <p>© {new Date().getFullYear()} All rights reserved. Made with care and curiosity.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
