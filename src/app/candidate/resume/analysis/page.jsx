"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertCircle, ArrowLeft, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ResumeAnalysisPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Link href="/candidate/resume">
                    <button className="p-3 bg-white border border-[#F1F1F1] rounded-2xl transition-all text-[#71717A] hover:text-[#080808] shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-[#080808]">
                        Resume <span className="text-[#7C5CFC]">Analysis</span>
                    </h1>
                    <p className="text-[#71717A] mt-1 font-medium">AI-powered insights to improve your profile</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Overall Score */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-1 bg-white border border-[#F1F1F1] rounded-[32px] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0px_4px_24px_rgba(0,0,0,0.02)]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C5CFC]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-end justify-center mb-2">
                            <span className="text-7xl font-black text-[#080808]">85</span>
                            <span className="text-xl text-[#71717A] font-bold mb-2">/100</span>
                        </div>
                        <div className="flex gap-1.5 justify-center mb-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className={`w-5 h-5 ${i <= 4 ? "text-amber-400 fill-amber-400" : "text-[#F1F1F1] fill-[#F1F1F1]"}`} />
                            ))}
                        </div>
                        <h3 className="text-2xl font-bold text-[#080808] mb-3">Great Profile!</h3>
                        <p className="text-[#71717A] text-sm font-medium leading-relaxed">Your resume is strong, but there are a few areas for improvement to reach the top 5% of candidates.</p>
                    </div>
                </motion.div>

                {/* Score Breakdown */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-white border border-[#F1F1F1] rounded-[32px] p-10 shadow-[0px_4px_24px_rgba(0,0,0,0.02)]"
                >
                    <h3 className="text-xl font-bold text-[#080808] mb-8">Detailed Breakdown</h3>
                    
                    <div className="space-y-6">
                        {[
                            { label: "Technical Skills", score: 92, color: "bg-[#7C5CFC]" },
                            { label: "Experience Relevance", score: 88, color: "bg-[#7C5CFC]/80" },
                            { label: "Formatting & Layout", score: 95, color: "bg-[#7C5CFC]/60" },
                            { label: "Keyword Optimization", score: 70, color: "bg-amber-400" },
                        ].map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-2.5">
                                    <span className="text-[#71717A] font-bold uppercase tracking-wider text-xs">{item.label}</span>
                                    <span className="text-[#080808] font-bold">{item.score}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-[#F4F7FE] rounded-full overflow-hidden border border-[#F1F1F1]">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.score}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                        className={`h-full rounded-full shadow-sm ${item.color}`} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
                
                {/* Suggestions */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-1 lg:col-span-3 bg-white border border-[#F1F1F1] rounded-[32px] p-10 shadow-[0px_4px_24px_rgba(0,0,0,0.02)]"
                >
                     <h3 className="text-xl font-bold text-[#080808] mb-8 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp className="w-6 h-6 text-emerald-500" /></div>
                        Actionable Insights
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                            <h4 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Strengths
                            </h4>
                            <ul className="space-y-3 text-sm text-[#71717A] font-medium">
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-500 mt-1">•</span>
                                    Strong command of React ecosystem and Modern CSS.
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-500 mt-1">•</span>
                                    Experience section uses quantifiable achievements well.
                                </li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100">
                            <h4 className="font-bold text-amber-600 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Areas to Improve
                            </h4>
                            <ul className="space-y-3 text-sm text-[#71717A] font-medium">
                                <li className="flex items-start gap-3">
                                    <span className="text-amber-500 mt-1">•</span>
                                    <span>Include <b className="text-[#080808]">GraphQL</b> and <b className="text-[#080808]">TypeScript</b> keywords more prominently.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-amber-500 mt-1">•</span>
                                    Add a metrics-driven summary to your "Project Manager" role.
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

