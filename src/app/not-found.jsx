"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Ghost, Home, Compass } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-6 overflow-hidden relative font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 max-w-2xl w-full text-center">
                {/* Floating Icon Container */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative mb-8 flex justify-center"
                >
                    <motion.div
                        animate={{ 
                            y: [0, -20, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl relative group"
                    >
                        <Ghost className="w-16 h-16 text-blue-500 group-hover:text-purple-500 transition-colors duration-500" />
                        
                        {/* Orbiting particles */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-4 border border-blue-500/20 rounded-full border-dashed"
                        />
                         <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-8 border border-purple-500/10 rounded-full border-dashed"
                        />
                    </motion.div>
                </motion.div>

                {/* 404 Text */}
                <motion.h1 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-8xl md:text-9xl font-black text-white tracking-tighter mb-4"
                >
                    4<span className="text-blue-500">0</span>4
                </motion.h1>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Lost in the filters?</h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                        The page you're looking for has vanished into thin air. Let's get you back to familiar territory.
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/">
                        <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-black rounded-2xl font-black flex items-center gap-3 transition-all shadow-lg shadow-blue-500/20 active:scale-95 group">
                            <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            Return Home
                        </button>
                    </Link>
                    <button 
                        onClick={() => window.history.back()}
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold flex items-center gap-3 transition-all backdrop-blur-sm active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </motion.div>

                {/* Secondary Indicators */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 1 }}
                    className="mt-16 flex items-center justify-center gap-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]"
                >
                    <div className="flex items-center gap-2">
                        <Compass className="w-3 h-3" />
                        Navigation Failure
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-800" />
                    <div className="flex items-center gap-2">
                         HireFilter Protocol v2.0
                    </div>
                </motion.div>
            </div>

            {/* Decorations */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-purple-500 rounded-full animate-ping shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ animationDelay: '0.5s' }} />
        </div>
    );
}
