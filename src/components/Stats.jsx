'use client'
import { useEffect } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function Stats() {

  useEffect(() => {
    gsap.from(".stat", {
      scrollTrigger: {
        trigger: ".stats",
        start: "top 80%"
      },
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.2
    })
  }, [])

  return (
    <section className="stats py-24 bg-black">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6 text-center">
        <div className="stat">
          <h3 className="text-5xl font-bold text-blue-500">90%</h3>
          <p className="text-gray-400 mt-2">Hiring Time Reduced</p>
        </div>
        <div className="stat">
          <h3 className="text-5xl font-bold text-blue-500">50K+</h3>
          <p className="text-gray-400 mt-2">Resumes Screened</p>
        </div>
        <div className="stat">
          <h3 className="text-5xl font-bold text-blue-500">1K+</h3>
          <p className="text-gray-400 mt-2">HR Teams Trust Us</p>
        </div>
      </div>
    </section>
  )
}
