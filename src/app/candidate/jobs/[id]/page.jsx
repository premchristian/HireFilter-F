"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, IndianRupee, Clock, Briefcase, CheckCircle, Bookmark } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useJobContext } from "@/context/JobContext";

export default function JobDetailsPage() {
    const { id } = useParams();
    const { getJobById, toggleSaveJob, savedJobIds } = useJobContext();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchJob = async () => {
            if (id) {
                console.log("[JobDetails] Fetching job details for:", id);
                const data = await getJobById(id);
                if (data) {
                    setJob(data);
                }
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    // Sync isSaved status separately to avoid re-fetching the whole job
    useEffect(() => {
        if (job) {
            const isSavedNow = savedJobIds.includes(id);
            if (job.isSaved !== isSavedNow) {
                console.log(`[JobDetails] Syncing saved status for ${id}:`, isSavedNow);
                setJob(prev => ({ ...prev, isSaved: isSavedNow }));
            }
        }
    }, [savedJobIds, id, job?.id]);

    const handleToggleSave = async () => {
        try {
            // Optimistically update local state for immediate feedback
            const newIsSaved = !job.isSaved;
            setJob(prev => ({
                ...prev,
                isSaved: newIsSaved,
                saveCount: newIsSaved ? prev.saveCount + 1 : Math.max(0, prev.saveCount - 1)
            }));

            await toggleSaveJob(id);
        } catch (error) {
            console.error("Failed to toggle save:", error);
            // Revert on error
            const data = await getJobById(id);
            if (data) setJob(data);
        }
    };

    if (loading) {
        return <div className="text-muted p-6 max-w-4xl mx-auto">Loading job details...</div>;
    }

    if (!job) {
        return <div className="text-muted p-6 max-w-4xl mx-auto">Job not found.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <Link href="/candidate/jobs">
                <button className="flex items-center gap-3 text-muted hover:text-text transition-all mb-6 group font-bold">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Jobs
                </button>
            </Link>

            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#F1F1F1] rounded-4xl p-10 relative overflow-hidden shadow-soft"
            >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                
                <div className="absolute top-8 right-8 flex gap-4">
                    <button 
                        onClick={handleToggleSave}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all shadow-md font-bold ${
                            job.isSaved 
                            ? "bg-primary border-primary text-white shadow-primary/30 scale-105" 
                            : "bg-background border-[#F1F1F1] text-muted hover:text-primary hover:bg-white"
                        }`}
                    >
                        <Bookmark className={`w-5 h-5 ${job.isSaved ? "fill-white" : ""}`} />
                        {job.isSaved ? "Saved" : "Save Job"}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-primary/20 shrink-0">
                        {job.title.charAt(0)}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-black text-text mb-3 tracking-tight">{job.title}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted font-bold">
                            <span className="text-primary">{job.department}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F1F1F1]" />
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F1F1F1]" />
                            <div className={`flex items-center gap-2 transition-colors ${job.isSaved ? "text-primary" : ""}`}>
                                <Bookmark className={`w-4 h-4 ${job.isSaved ? "fill-current" : ""}`} />
                                <span>{job.saveCount} candidate{job.saveCount !== 1 ? 's' : ''} saved this job</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-8">
                            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#F4F7FE] text-[#080808] font-bold text-sm shadow-sm border border-[#F1F1F1]">
                                <Briefcase className="w-4 h-4 text-[#7C5CFC]" />
                                {job.type}
                            </div>
                            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#F4F7FE] text-[#080808] font-bold text-sm shadow-sm border border-[#F1F1F1]">
                                <IndianRupee className="w-4 h-4 text-[#7C5CFC]" />
                                {job.salary}
                            </div>
                            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#F4F7FE] text-[#080808] font-bold text-sm shadow-sm border border-[#F1F1F1]">
                                <Clock className="w-4 h-4 text-[#7C5CFC]" />
                                Posted {job.posted}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Description */}
                <div className="lg:col-span-2 space-y-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border border-[#F1F1F1] rounded-[32px] p-10 space-y-10 shadow-[0px_4px_24px_rgba(0,0,0,0.02)]"
                    >
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[#080808] flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#7C5CFC] rounded-full" />
                                About the Role
                            </h2>
                            <p className="text-[#71717A] leading-relaxed whitespace-pre-wrap font-medium text-lg">{job.description}</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[#080808] flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#7C5CFC] rounded-full" />
                                Requirements
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-[#F4F7FE]/50 border border-[#F1F1F1]">
                                    <h4 className="text-xs font-bold text-[#71717A] uppercase mb-2 tracking-widest">Education</h4>
                                    <p className="text-[#080808] font-bold">{job.education}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-[#F4F7FE]/50 border border-[#F1F1F1]">
                                    <h4 className="text-xs font-bold text-[#71717A] uppercase mb-2 tracking-widest">Experience</h4>
                                    <p className="text-[#080808] font-bold">{job.experience}</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[#080808] flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#7C5CFC] rounded-full" />
                                Technical Stack
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {job.skills.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#F1F1F1] text-[#7C5CFC] font-bold shadow-sm hover:border-[#7C5CFC]/30 transition-all">
                                        <CheckCircle className="w-4 h-4" />
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                </div>

                {/* Right Column: CTA */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-[#F1F1F1] rounded-[32px] p-8 sticky top-8 shadow-[0px_8px_32px_rgba(0,0,0,0.04)] text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#F4F7FE] flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="w-8 h-8 text-[#7C5CFC]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#080808] mb-3">Ready to Apply?</h3>
                        <p className="text-[#71717A] font-medium mb-8">
                            Take the next step in your career journey. Use your tailored profile for a fast application.
                        </p>
                        
                        <div className="p-4 rounded-2xl bg-amber-50 text-amber-700 text-sm font-bold mb-8 flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4" />
                            Deadline: {job.lastDate}
                        </div>

                        <Link href={`/candidate/apply/${id}`}>
                            <button className="w-full py-5 bg-[#7C5CFC] hover:bg-[#6b4ce6] text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-[#7C5CFC]/20 mb-4 active:scale-95">
                                Apply Now
                            </button>
                        </Link>

                    </div>
                </div>
            </div>
        </div>
    );
}
