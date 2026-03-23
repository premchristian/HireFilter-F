"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { FaRobot, FaBrain, FaClipboardCheck, FaChartLine } from "react-icons/fa"

gsap.registerPlugin(ScrollTrigger)
 
const features = [
    { title: "AI Resume Screening", desc: "Automatically shortlist candidates.", icon: <FaRobot suppressHydrationWarning /> },
    { title: "Skill Intelligence", desc: "Deep skill-based evaluation.", icon: <FaBrain suppressHydrationWarning /> },
    { title: "Smart Assessments", desc: "Role-based hiring tests.", icon: <FaClipboardCheck suppressHydrationWarning /> },
    { title: "Hiring Analytics", desc: "Track performance metrics.", icon: <FaChartLine suppressHydrationWarning /> }
]

export default function Features() {
    const cardsRef = useRef([])

    useEffect(() => {
        cardsRef.current.forEach((card, i) => {
            gsap.fromTo(
                card,
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: i * 0.15,
                    scrollTrigger: { trigger: card, start: "top 85%" }
                }
            )
        })
    }, [])

    return (
        <section className="py-24 bg-black text-white">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-4">Why HireFilter?</h2>
                <p className="text-center text-white/60 mb-16">Smarter hiring with AI</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((item, i) => (
                        <div
                            key={i}
                            ref={(el) => (cardsRef.current[i] = el)}
                            className="feature-card relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 hover:border-blue-500"
                        >
                            <div className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-blue-500/10 to-blue-500/10" />

                            <div className="relative z-10">
                                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 text-3xl mb-6">
                                    {item.icon}
                                </div>

                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-white/60 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
