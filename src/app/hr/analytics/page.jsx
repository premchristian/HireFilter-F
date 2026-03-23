"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AnalyticsPage() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-[#080808]">
                Analytics & Reports
            </h1>

            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                 {[
                    { label: "Time to Hire", value: "18 Days", change: "-12%", icon: Clock, trend: "down", color: "text-[#27C052]", bg: "bg-[#EFFFED]" },
                    { label: "Offer Acceptance", value: "85%", change: "+5%", icon: Users, trend: "up", color: "text-[#27C052]", bg: "bg-[#EFFFED]" },
                    { label: "Cost per Hire", value: "$1,250", change: "-2%", icon: TrendingUp, trend: "down", color: "text-[#27C052]", bg: "bg-[#EFFFED]" },
                    { label: "Pipeline Velocity", value: "4.2", change: "+0.8", icon: BarChart3, trend: "up", color: "text-[#27C052]", bg: "bg-[#EFFFED]" },
                ].map((stat, i) => (
                    <motion.div key={i} variants={item} className="p-6 bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-[16px] transition-all hover:-translate-y-1 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-[#EBE8FF] rounded-[12px] text-[#7C5CFC]">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-sm font-bold flex items-center gap-1 ${stat.color} ${stat.bg} px-2 py-1 rounded-[8px]`}>
                                {stat.change}
                                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-[#080808] mb-1">{stat.value}</h3>
                        <p className="text-[#71717A] text-sm font-medium">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-[16px] bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] h-96 flex flex-col">
                    <h3 className="text-xl font-bold text-[#080808] mb-6">Hiring Funnel</h3>
                    <div className="flex-1 flex items-end justify-between gap-4 px-4">
                        {[100, 65, 45, 20, 10].map((h, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                <div 
                                    className="w-full bg-[#EBE8FF] rounded-t-[8px] relative group-hover:bg-[#7C5CFC] transition-colors" 
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[#080808] font-bold opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                                        {h}%
                                    </div>
                                </div>
                                <span className="text-xs text-[#71717A] uppercase font-bold">Step {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 rounded-[16px] bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] h-96 flex flex-col">
                     <h3 className="text-xl font-bold text-[#080808] mb-6">Source Quality</h3>
                     <div className="space-y-5">
                        {[
                            { source: "LinkedIn", value: 45, color: "bg-[#7C5CFC]" },
                            { source: "Referrals", value: 30, color: "bg-[#27C052]" },
                            { source: "Career Page", value: 15, color: "bg-[#FFD66B]" },
                            { source: "Indeed", value: 10, color: "bg-[#FF80AC]" },
                        ].map((source, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#080808] font-bold">{source.source}</span>
                                    <span className="text-[#71717A] font-medium">{source.value}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-[#F4F7FE] rounded-full overflow-hidden">
                                    <div className={`h-full ${source.color} rounded-full`} style={{ width: `${source.value}%` }} />
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
}
