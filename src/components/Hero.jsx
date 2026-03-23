"use client"

import { useRef, useEffect, useState } from "react"
import gsap from "gsap"
import Image from "next/image"
import Link from "next/link"
import SmokeCanvas from "./SmokeCanvas"
const jobs = [
    "Web Developer",
    "Data Analyst",
    "UI/UX Designer",
    "AI Engineer",
    "HR Manager"
]

export default function Hero() {
    const titleRef = useRef(null)
    const subRef = useRef(null)
    const btnRef = useRef(null)
    const jobsRef = useRef([])
    const [showMagnify, setShowMagnify] = useState(false)

    // Entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline()

            tl.from(titleRef.current.children, {
                y: 80,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power4.out"
            })
                .from(
                    subRef.current,
                    {
                        opacity: 0,
                        y: 30,
                        duration: 0.8
                    },
                    "-=0.4"
                )
                .from(
                    btnRef.current.children,
                    {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.5,
                        stagger: 0.2
                    },
                    "-=0.3"
                )
        })

        return () => ctx.revert()
    }, [])

    // Hover handlers
    const handleHover = () => {
        setShowMagnify(true)
        gsap.fromTo(
            jobsRef.current,
            { y: 30, opacity: 0, scale: 0.8 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: "back.out(1.7)"
            }
        )
    }

    const handleLeave = () => {
        setShowMagnify(false)
        gsap.to(jobsRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.3,
            stagger: 0.05
        })
    }

    return (
        // <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden px-6">
        <section className="relative min-h-screen w-full flex items-center justify-center bg-black text-white overflow-hidden px-6">
            <SmokeCanvas />

            {/* Gradient Blobs */}
            <div className="absolute w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-3xl top-30 left-20 animate-pulse" />
            <div className="absolute w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-3xl bottom-50 right-10 animate-pulse" />

            {/* Glass Card */}
            {/* <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-xl rounded-3xl w-[90%] max-w-5xl h-[73%] border border-white/30 shadow-2xl" />
            </div> */}

            {/* Content */}
            <div className="relative z-10 text-center">

                {/* Title */}
                <h1
                    ref={titleRef}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleLeave}
                    className="text-5xl md:text-7xl font-extrabold cursor-pointer relative inline-block"
                >
                    <span className="block">Hire Smarter.</span>
                    <span className="block text-blue-500">Not Harder.</span>

                    {/* Magnifying Glass */}
                    {showMagnify && (
                        <div className="absolute -right-24 top-1/2 -translate-y-1/2">
                            {/* <Image
                                src="/Images/magnify.png"
                                alt="Magnify Glass"
                                width={120}
                                height={120}
                                priority
                            /> */}
                        </div>
                    )}
                </h1>

                {/* Job Tags */}
                <div className="flex gap-4 flex-wrap justify-center mt-10">
                    {jobs.map((job, i) => (
                        <span
                            key={i}
                            ref={(el) => (jobsRef.current[i] = el)}
                            className="opacity-0 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm cursor-pointer hover:scale-110 transition-transform"
                        >
                            {job}
                        </span>
                    ))}
                </div>

                {/* Sub text */}
                <p
                    ref={subRef}
                    className="mt-8 max-w-xl mx-auto text-white/70"
                >
                    resume screening, skill assessment, and smart hiring
                    workflows built for modern HR teams.
                </p>

                {/* Buttons */}
                <div
                    ref={btnRef}
                    className="mt-10 flex justify-center gap-6"
                >
                    <button className="bg-blue-500 px-8 py-4 rounded-xl font-semibold text-black hover:scale-105 transition-transform">
                         <Link href="/Register">Get Started</Link>
                      
                    </button>
                    {/* <button className="border border-white/20 px-8 py-4 rounded-xl text-white hover:bg-white/10 transition-colors">
                        View Demo
                    </button> */}
                </div>
            </div>
        </section>
    )
}
