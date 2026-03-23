"use client";

import { useEffect, useState } from "react";
import { useJobContext } from "@/context/JobContext";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Users, Calendar, Briefcase, IndianRupee, Clock, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { getJobById } = useJobContext();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
            if (params.jobId) {
                const data = await getJobById(params.jobId);
                setJob(data);


                setLoading(false);
            }
        };
        fetchData();
    }, [params.jobId]);





    if (loading) {
        return <div className="text-text-primary p-6">Loading job details...</div>;
    }

    if (!job) {
        return <div className="text-text-primary p-6">Job not found.</div>;
    }

    return (
        <div className="space-y-6">
            <Link href="/hr/jobs">
                <button className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Jobs
                </button>
            </Link>

            <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[24px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden">
                {/* Decorative Blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#EBE8FF]/50 rounded-full blur-3xl -mr-32 -mt-32" />
                
                {/* Header */}
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h1 className="text-4xl font-black text-[#080808] mb-3 tracking-tight">{job.title}</h1>
                        <div className="flex flex-wrap gap-6 text-[#71717A] font-medium">
                            <span className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-[#7C5CFC]" />
                                {job.department}
                            </span>
                            <span className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#7C5CFC]" />
                                {job.location}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#7C5CFC]" />
                                Posted {job.posted || new Date().toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
                        job.status?.toLowerCase() === 'active'
                            ? 'bg-[#EFFFED] border-[#27C052]/20 text-[#27C052] shadow-sm'
                            : 'bg-[#F4F7FE] border-[#F1F1F1] text-[#71717A]'
                    }`}>
                        {job.status || 'Active'}
                    </span>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 relative z-10">
                    <div className="lg:col-span-2 space-y-10">
                        <section className="bg-[#F4F7FE]/30 p-6 rounded-[20px] border border-[#F1F1F1]">
                            <h2 className="text-xl font-bold text-[#080808] mb-5 flex items-center gap-3">
                                <div className="w-2 h-6 bg-[#7C5CFC] rounded-full" />
                                Description
                            </h2>
                            <p className="text-[#71717A] font-medium leading-relaxed whitespace-pre-wrap">{job.description}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#080808] mb-5 flex items-center gap-3">
                                <div className="w-2 h-6 bg-[#7C5CFC] rounded-full" />
                                Required Skills
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {job.skills.map((skill, index) => (
                                    <span key={index} className="px-4 py-2 rounded-[12px] bg-[#EBE8FF] border border-[#7C5CFC]/10 text-[#7C5CFC] font-bold text-sm shadow-sm hover:scale-105 transition-transform">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="p-8 rounded-[24px] bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0px_8px_30px_rgba(0,0,0,0.04)] space-y-6">
                                <h3 className="text-lg font-black text-[#080808] border-b border-[#F1F1F1] pb-4 uppercase tracking-wider">Job Overview</h3>

                                <div className="space-y-5">
                                    {[
                                        { label: "Type", value: job.type, icon: Clock },
                                        { label: "Experience", value: job.experience, icon: Briefcase },
                                        { label: "Salary", value: job.salary, icon: IndianRupee },
                                        { label: "Education", value: job.education, icon: Users },
                                        { label: "Deadline", value: job.lastDate, icon: Calendar },
                                        { label: "Applicants", value: job.applicants ? job.applicants.length : 0, icon: Users }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-[10px] bg-[#F4F7FE] text-[#71717A] group-hover:bg-[#EBE8FF] group-hover:text-[#7C5CFC] transition-colors">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-[#71717A]">{item.label}</span>
                                            </div>
                                            <span className="text-sm font-black text-[#080808]">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <button className="w-full py-4 bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white rounded-[16px] font-bold text-sm shadow-[0px_4px_20px_rgba(124,92,252,0.3)] transition-all active:scale-[0.98]">
                                    Manage Applications
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
