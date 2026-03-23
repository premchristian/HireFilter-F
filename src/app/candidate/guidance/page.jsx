"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, BookOpen, Target, ArrowRight, BarChart3, Award, Clock } from "lucide-react";

export default function GuidancePage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-5xl mx-auto pb-12"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-[#080808]">
                    Career <span className="text-[#7C5CFC]">Guidance</span>
                </h1>
                <p className="text-[#71717A] mt-1 font-medium">AI-powered suggestions to accelerate your career growth</p>
            </motion.div>

            {/* Hero AI Insight */}
            <motion.div 
                variants={itemVariants}
                className="bg-[#7C5CFC] rounded-[32px] p-10 text-white shadow-[0px_20px_40px_rgba(124,92,252,0.15)] relative overflow-hidden group"
            >
                <div className="absolute -top-12 -right-12 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Sparkles className="w-80 h-80" />
                </div>
                
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-bold mb-6 backdrop-blur-md border border-white/10">
                        <Sparkles className="w-4 h-4" />
                        AI Career Coach
                    </div>
                    <h2 className="text-4xl font-bold mb-4 leading-tight">You're ready for a Senior Role.</h2>
                    <p className="text-white/80 text-lg leading-relaxed mb-8 font-medium">
                        Based on your recent assessment scores (92%) and 5 years of experience, our AI suggests you target <span className="text-white font-bold underline decoration-white/30 truncate">Senior Product Designer</span> roles. Your profile matches 85% of requirements.
                    </p>
                    <button className="px-8 py-4 bg-white text-[#7C5CFC] rounded-[16px] font-bold hover:bg-[#F4F7FE] transition-all shadow-lg flex items-center gap-2 group/btn">
                        View Senior Roles
                        <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Market Trends */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white border border-[#F1F1F1] rounded-[24px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]"
                >
                    <h3 className="text-xl font-bold text-[#080808] mb-8 flex items-center gap-3">
                        <div className="p-2 bg-[#F4F7FE] rounded-lg">
                            <TrendingUp className="w-5 h-5 text-[#7C5CFC]" />
                        </div>
                        Market Trends
                    </h3>
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[#71717A] font-bold">Remote Opportunities</span>
                                <span className="text-green-500 font-bold px-2 py-0.5 bg-green-50 rounded-full text-xs">+15%</span>
                            </div>
                            <div className="h-2.5 w-full bg-[#F4F7FE] rounded-full overflow-hidden border border-[#F1F1F1]">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "65%" }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-green-500 rounded-full" 
                                />
                            </div>
                            <p className="text-xs text-[#71717A] mt-3 font-medium">Remote design roles are increasing this quarter.</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[#71717A] font-bold">Salary Benchmark</span>
                                <span className="text-[#7C5CFC] font-bold px-2 py-0.5 bg-[#F4F7FE] rounded-full text-xs">₹45L avg</span>
                            </div>
                            <div className="h-2.5 w-full bg-[#F4F7FE] rounded-full overflow-hidden border border-[#F1F1F1]">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "80%" }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                    className="h-full bg-[#7C5CFC] rounded-full" 
                                />
                            </div>
                             <p className="text-xs text-[#71717A] mt-3 font-medium">You are currently in the top 20% salary range.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Skill Gaps */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white border border-[#F1F1F1] rounded-[24px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]"
                >
                     <h3 className="text-xl font-bold text-[#080808] mb-8 flex items-center gap-3">
                        <div className="p-2 bg-[#F4F7FE] rounded-lg">
                            <Target className="w-5 h-5 text-[#7C5CFC]" />
                        </div>
                        Recommended Focus
                    </h3>
                    <div className="space-y-4">
                        {[
                            { title: "Design Systems Leadership", desc: "Add this to your portfolio to increase senior role matches by 40%.", count: "3 Courses" },
                            { title: "Data-Driven Design", desc: "Learn to articulate design decisions with metrics.", count: "1 Workshop" }
                        ].map((item, i) => (
                            <div key={i} className="p-5 rounded-[20px] bg-[#F4F7FE]/50 border border-[#F1F1F1] hover:border-[#7C5CFC]/30 transition-all cursor-pointer group">
                                 <h4 className="font-bold text-[#080808] mb-1 group-hover:text-[#7C5CFC] transition-colors">{item.title}</h4>
                                 <p className="text-sm text-[#71717A] mb-4 font-medium leading-relaxed">{item.desc}</p>
                                 <div className="flex items-center gap-2 text-xs font-bold text-[#7C5CFC] px-3 py-1 bg-[#EBE8FF] rounded-full w-fit">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>{item.count} Available</span>
                                 </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
