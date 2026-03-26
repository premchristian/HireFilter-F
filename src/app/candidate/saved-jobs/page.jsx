"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, MapPin, IndianRupee, ArrowRight, Trash2, Briefcase, Clock, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { useJobContext } from "@/context/JobContext";

export default function SavedJobsPage() {
    const { toggleSaveJob } = useJobContext();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const fetchSavedJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hire-filter-backend.onrender.com";
            const response = await axios.get(`${baseUrl}/api/jobs/saved`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            let raw = response.data;
            let finalArray = [];
            
            if (Array.isArray(raw)) {
                finalArray = raw;
            } else if (Array.isArray(raw?.data)) {
                finalArray = raw.data;
            } else if (Array.isArray(raw?.savedJobs)) {
                finalArray = raw.savedJobs;
            } else if (raw?.data && Array.isArray(raw.data.savedJobs)) {
                finalArray = raw.data.savedJobs;
            } else if (raw?.data && Array.isArray(raw.data.jobs)) {
                finalArray = raw.data.jobs;
            } else if (raw?.jobs) {
                finalArray = raw.jobs;
            }
            
            // Map Jobs and handle potential backend population wrappers
            const mappedJobs = finalArray.map((item, index) => {
                const job = item.jobTitle ? item : (item.job || item);
                
                const colors = [
                    "bg-[#EBE8FF] text-[#7C5CFC]",
                    "bg-[#FFEDE1] text-[#FF5C5C]",
                    "bg-[#EFFFED] text-[#27C052]",
                    "bg-[#F4F7FE] text-[#7C5CFC]"
                ];

                return {
                    id: job._id || job.id,
                    title: job.jobTitle || "Unknown Role",
                    company: job.createdBy?.company?.name || job.department || "Unknown Company",
                    logo: (job.jobTitle || "U").charAt(0).toUpperCase(),
                    baseStyles: colors[index % colors.length],
                    location: job.location || "Not specified",
                    type: job.jobType || "Full-time",
                    salary: job.salary ? `₹${job.salary.min} - ₹${job.salary.max}` : (typeof job.salary === 'string' ? job.salary : "Not specified"),
                    savedDate: new Date(item.createdAt || job.createdAt || Date.now()).toLocaleDateString()
                };
            }).filter(j => j.id); 
            
            setJobs(mappedJobs);
        } catch (error) {
            console.error("Error fetching saved jobs:", error);
            setError(error.response?.data?.message || error.message || "Failed to load saved jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const handleUnsave = async (jobId) => {
        try {
            // Optimistically remove from UI
            setJobs(prev => prev.filter(j => j.id !== jobId));
            // Toggle save on backend (which will effectively unsave it)
            await toggleSaveJob(jobId);
        } catch (error) {
            console.error("Error unsaving job:", error);
            // Re-fetch if it fails to ensure validity
            fetchSavedJobs();
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
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

            {error && (
                <motion.div variants={itemVariants} className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-medium">
                    {error}
                </motion.div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#F1F1F1] border-t-[#7C5CFC] rounded-full animate-spin" />
                </div>
            ) : jobs.length > 0 ? (
                <div className="grid gap-6">
                    <AnimatePresence>
                        {jobs.map((job) => {
                            const [bgClass, textClass] = job.baseStyles.split(" ");
                            return (
                            <motion.div
                                key={job.id}
                                variants={itemVariants}
                                layout
                                exit="exit"
                                className="group p-6 bg-white border border-[#F1F1F1] rounded-[24px] hover:border-[#7C5CFC]/30 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.03)] transition-all flex flex-col md:flex-row items-center justify-between gap-6"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto text-center md:text-left">
                                    <div className={`w-16 h-16 rounded-[20px] ${bgClass} flex items-center justify-center text-2xl font-bold ${textClass} shadow-sm shrink-0 border border-transparent group-hover:border-[#7C5CFC]/20 transition-all`}>
                                        {job.logo}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#080808] group-hover:text-[#7C5CFC] transition-colors">{job.title}</h3>
                                        <p className="text-[#71717A] font-semibold">{job.company}</p>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-[#71717A] mt-2 font-medium">
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F4F7FE] rounded-full border border-[#F1F1F1]">
                                                <MapPin className="w-3.5 h-3.5 text-[#7C5CFC]" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F4F7FE] rounded-full border border-[#F1F1F1]">
                                                <IndianRupee className="w-3.5 h-3.5 text-[#7C5CFC]" />
                                                {job.salary}
                                            </span>
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F4F7FE] rounded-full border border-[#F1F1F1]">
                                                <Briefcase className="w-3.5 h-3.5 text-[#7C5CFC]" />
                                                {job.type}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs text-[#71717A]/80">
                                                <Clock className="w-3.5 h-3.5" />
                                                Saved {job.savedDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                                    <button 
                                        onClick={() => handleUnsave(job.id)}
                                        className="p-4 rounded-[16px] bg-[#F4F7FE] text-[#71717A] hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 group/trash shadow-sm"
                                        title="Remove from saved jobs"
                                    >
                                        <Trash2 className="w-5 h-5 transition-transform group-hover/trash:scale-110" />
                                    </button>
                                    <Link href={`/candidate/jobs/${job.id}`} className="flex-1 md:flex-none">
                                        <button className="w-full px-8 py-4 bg-[#7C5CFC] hover:bg-[#6b4ce6] text-white rounded-[16px] font-bold transition-all shadow-[0px_4px_20px_rgba(124,92,252,0.15)] flex items-center justify-center gap-2 group/btn active:scale-95">
                                            Apply Now
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-24 flex flex-col items-center justify-center bg-[#FFFFFF] border border-dashed border-[#F1F1F1] rounded-[32px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                >
                    <div className="w-20 h-20 rounded-[24px] bg-[#F4F7FE] flex items-center justify-center mb-6">
                        <Bookmark className="w-10 h-10 text-[#71717A]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#080808] tracking-tight">No saved jobs</h3>
                    <p className="text-[#71717A] mt-2 text-sm max-w-xs text-center font-medium">You haven't bookmarked any opportunities yet. Explore the job board to find your next role.</p>
                    <Link href="/candidate/jobs" className="mt-8">
                        <button className="flex items-center gap-2 px-8 py-3 bg-[#7C5CFC] text-white font-bold uppercase tracking-widest rounded-[12px] hover:bg-[#6A4FE0] transition-all shadow-[0px_4px_20px_rgba(124,92,252,0.3)] active:scale-95">
                            <Search className="w-4 h-4" />
                            Browse Jobs
                        </button>
                    </Link>
                </motion.div>
            )}
        </motion.div>
    );
}
