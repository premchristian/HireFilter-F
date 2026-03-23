"use client";

import { motion } from "framer-motion";
import { Bookmark, MapPin, IndianRupee, ArrowRight, Trash2, Briefcase, Clock } from "lucide-react";
import Link from "next/link";

export default function SavedJobsPage() {
    const jobs = [
        {
            id: 1,
            title: "Senior Product Designer",
            company: "TechFlow",
            logo: "T",
            bg: "bg-[#F4F7FE]",
            color: "text-[#7C5CFC]",
            location: "Remote",
            type: "Full-time",
            salary: "₹12L - ₹15L",
            savedDate: "Saved yesterday"
        },
        {
            id: 4,
            title: "Marketing Manager",
            company: "GrowthX",
            logo: "G",
            bg: "bg-[#F4F7FE]",
            color: "text-[#7C5CFC]",
            location: "London, UK",
            type: "Full-time",
            salary: "₹8L - ₹10L",
            savedDate: "Saved 2 days ago"
        }
    ];

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
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-6xl mx-auto pb-12"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-[#080808]">
                    Saved <span className="text-[#7C5CFC]">Jobs</span>
                </h1>
                <p className="text-[#71717A] mt-1 font-medium">Opportunities you bookmarked for later</p>
            </motion.div>

            <div className="grid gap-6">
                {jobs.map((job) => (
                    <motion.div
                        key={job.id}
                        variants={itemVariants}
                        className="group p-6 bg-white border border-[#F1F1F1] rounded-[24px] hover:border-[#7C5CFC]/30 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.03)] transition-all flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto text-center md:text-left">
                            <div className={`w-16 h-16 rounded-[20px] ${job.bg} flex items-center justify-center text-2xl font-bold ${job.color} shadow-sm shrink-0`}>
                                {job.logo}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#080808] group-hover:text-[#7C5CFC] transition-colors">{job.title}</h3>
                                <p className="text-[#71717A] font-semibold">{job.company}</p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-[#71717A] mt-2 font-medium">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F4F7FE] rounded-full">
                                        <MapPin className="w-3.5 h-3.5 text-[#7C5CFC]" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F4F7FE] rounded-full">
                                        <IndianRupee className="w-3.5 h-3.5 text-[#7C5CFC]" />
                                        {job.salary}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F4F7FE] rounded-full">
                                        <Briefcase className="w-3.5 h-3.5 text-[#7C5CFC]" />
                                        {job.type}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs">
                                        <Clock className="w-3.5 h-3.5" />
                                        {job.savedDate}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                            <button className="p-4 rounded-[16px] bg-[#F4F7FE] text-[#71717A] hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 group/trash shadow-sm">
                                <Trash2 className="w-5 h-5 transition-transform group-hover/trash:scale-110" />
                            </button>
                            <Link href={`/candidate/jobs/${job.id}`} className="flex-1 md:flex-none">
                                <button className="w-full px-8 py-4 bg-[#7C5CFC] hover:bg-[#6b4ce6] text-white rounded-[16px] font-bold transition-all shadow-[0px_4px_20px_rgba(124,92,252,0.15)] flex items-center justify-center gap-2 group/btn">
                                    Apply Now
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
