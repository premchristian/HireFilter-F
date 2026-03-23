"use client";

import { motion } from "framer-motion";
import { Wrench, Clock, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full text-center relative z-10"
            >
                <motion.div 
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(245,158,11,0.2)]"
                >
                    <Wrench className="w-12 h-12 text-amber-500 animate-pulse" />
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    System Under <span className="text-amber-500">Maintenance</span>
                </h1>
                
                <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                    Our engineering team is performing scheduled upgrades to improve platform performance and security. We'll be back online shortly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 text-left">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Estimated Time</p>
                            <p className="text-white font-bold">~45 Minutes</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 text-left">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                            <p className="text-white font-bold">Upgrading DB</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link href="/">
                        <button className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all w-full flex items-center justify-center gap-2 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return to Homepage
                        </button>
                    </Link>
                    <p className="text-xs text-gray-500 mt-4">
                        Admin access is still available via direct login.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
