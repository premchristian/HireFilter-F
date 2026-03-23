"use client";

import Link from "next/link";

export default function Logo({ className = "h-10", textClassName = "text-xl md:text-2xl text-inherit" }) {
    return (
        <Link href="/" className="flex items-center gap-2">
            <img 
                src="/logo.png" 
                alt="HireFilter Logo" 
                className={`${className} w-auto object-contain cursor-pointer transition-transform hover:scale-105`}
            />
            <h1 className={`font-bold tracking-tight ${textClassName}`}>
                <span className="text-inherit">Hire</span><span className="text-blue-500">Filter</span>
            </h1>
        </Link>
    );
}

