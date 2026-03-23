"use client"

import { useEffect, useRef } from "react"

export default function SmokeSimulation() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        let animationFrameId
        let particles = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        const mouse = { x: -1000, y: -1000 }

        const handleMouseMove = (e) => {
            mouse.x = e.clientX
            mouse.y = e.clientY
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("resize", resize)
        resize()

        class Particle {
            constructor() {
                this.reset()
            }

            reset() {
                this.x = Math.random() * canvas.width
                this.y = canvas.height + Math.random() * 100
                this.size = Math.random() * 150 + 50
                this.speedY = Math.random() * 0.8 + 0.3
                this.speedX = Math.random() * 1 - 0.5
                this.opacity = Math.random() * 0.4 + 0.1
                this.hue = 240 + Math.random() * 40 // Variations of blue/purple
            }

            update() {
                this.y -= this.speedY
                this.x += this.speedX

                // Mouse influence
                const dx = this.x - mouse.x
                const dy = this.y - mouse.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                if (distance < 200) {
                    const force = (200 - distance) / 200
                    this.x += dx * force * 0.1
                    this.y += dy * force * 0.1
                }

                this.size += 0.2
                this.opacity -= 0.001

                if (this.opacity <= 0 || this.y < -this.size) {
                    this.reset()
                }
            }

            draw() {
                ctx.beginPath()
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size
                )
                gradient.addColorStop(0, `hsla(${this.hue}, 80%, 60%, ${this.opacity})`)
                gradient.addColorStop(0.5, `hsla(${this.hue}, 80%, 40%, ${this.opacity * 0.5})`)
                gradient.addColorStop(1, `hsla(${this.hue}, 80%, 20%, 0)`)
                
                ctx.fillStyle = gradient
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        for (let i = 0; i < 50; i++) {
            particles.push(new Particle())
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach((p) => {
                p.update()
                p.draw()
            })
            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener("resize", resize)
            window.removeEventListener("mousemove", handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen"
        />
    )
}
