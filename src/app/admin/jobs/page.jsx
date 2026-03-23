"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    Filter, 
    Briefcase, 
    Building2, 
    MapPin, 
    Clock, 
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Flag,
    ChevronDown,
    RotateCcw,
    Plus,
    GraduationCap,
    Banknote,
    User,
    Trophy,
    Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { createPortal } from "react-dom";



export default function JobModerationPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [riskFilter, setRiskFilter] = useState("All");
    const [selectedJob, setSelectedJob] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedJob) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedJob]);

    const handleBan = async () => {
        if (!jobToDelete) return;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const token = localStorage.getItem("token");
            console.log(`[AdminJobs] Banning job from: ${baseUrl}/api/jobs/${jobToDelete.id}`);
            await axios.delete(`${baseUrl}/api/jobs/${jobToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setJobs(jobs.filter(job => job.id !== jobToDelete.id));
            setJobToDelete(null);
            console.log("[AdminJobs] Job banned successfully");
        } catch (error) {
            console.error("[AdminJobs] Error banning job:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            alert("Failed to ban job: " + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const token = localStorage.getItem("token");
                console.log(`[AdminJobs] Fetching all jobs from: ${baseUrl}/api/jobs`);
                const response = await axios.get(`${baseUrl}/api/jobs`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log("[AdminJobs] Fetch Jobs API Status:", response.status);
                const dataRaw = response.data.data;
                const data = Array.isArray(dataRaw) ? dataRaw : (dataRaw?.jobs || []);
                // Map API data to UI model if fields mismatch, or use directly if valid
                const mappedJobs = data.map(job => {
                    const creator = job.createdBy || job.user || null;
                    
                    // Robust Name Extraction
                    let extractedName = null;
                    if (creator && typeof creator === 'object') {
                        extractedName = creator.name || creator.fullName || creator.username || 
                                       (creator.firstName && creator.lastName ? `${creator.firstName} ${creator.lastName}` : creator.firstName) ||
                                       (creator.profile && typeof creator.profile === 'object' ? creator.profile.name : null);
                    }
                    
                    // Prioritize specific HR names over potential system fallbacks
                    const finalName = (extractedName && extractedName !== "System Admin") 
                        ? extractedName 
                        : (job.hrName || extractedName || job.companyName);

                    let normalizedSkills = job.requiredSkills || job.skills || [];
                    if (typeof normalizedSkills === 'string') {
                        normalizedSkills = normalizedSkills.split(',').map(s => s.trim()).filter(Boolean);
                    }
                    
                    return {
                        id: job._id || job.id,
                        title: job.jobTitle || job.title || "Untitled Role",
                        company: job.department || job.companyName || job.company,
                        location: job.location,
                        posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : null,
                        reports: job.reportCount || 0,
                        status: job.status || "Active",
                        risk: job.riskLevel || (job.reportCount > 0 ? "Medium" : "Low"),
                        description: job.jobDescription || job.description,
                        responsibilities: job.responsibilities,
                        requirements: job.requirements,
                        jobType: job.jobType,
                        education: job.education,
                        salary: job.salary,
                        skills: normalizedSkills,
                        postedBy: finalName,
                        // postedByEmail: job.companyName
                    };
                });
                setJobs(mappedJobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleVerify = (id) => {
        // Removed as per request
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case "Critical": return "text-red-500 bg-red-500/10 border-red-500/20";
            case "High": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
            case "Medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            default: return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             job.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRisk = riskFilter === "All" || job.risk === riskFilter;
        return matchesSearch && matchesRisk;
    });

    const flaggedCount = jobs.filter(j => j.reports > 0 || j.risk === "Critical" || j.risk === "High").length;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Job <span className="text-amber-500 italic">Moderation</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Review, flag, and approve platform-wide job postings</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/jobs/create">
                        <button className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5558DD] text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20">
                            <Plus className="w-5 h-5" />
                            <span>Post New Job</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-4 p-4 lg:p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-xl">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by title, role or ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all font-medium" 
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 hover:text-amber-400 transition-colors bg-amber-500/5 rounded-lg border border-amber-500/10"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Content List */}
            <div className="grid gap-4 min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <motion.div 
                                key={job.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={`p-6 rounded-3xl border transition-all active:scale-[0.98] ${
                                    job.risk === 'Critical' ? 'bg-red-500/[0.03] border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)]' : 
                                    'bg-[#111418] border-white/5 hover:border-amber-500/30'
                                }`}
                            >
                                <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                                                <Briefcase className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{job.title}</h3>
                                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" />
                                                        {job.company}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-white/10 hidden sm:block" />
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {job.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 md:gap-8 w-full md:w-auto">
                                            <div className="flex items-center gap-8 px-4 py-2 bg-white/5 rounded-xl border border-white/5 flex-1 md:flex-none justify-center md:justify-start">
                                                <div className="text-center">
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Posted</p>
                                                    <p className="text-sm font-bold text-white">{job.posted}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 w-full md:w-auto">
                                                <button 
                                                    onClick={() => setSelectedJob(job)}
                                                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:border-amber-500/40 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
                                                >
                                                    <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                    Detail
                                                </button>
                                                <button 
                                                    onClick={() => setJobToDelete(job)}
                                                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group/ban"
                                                >
                                                    <XCircle className="w-4 h-4 group-hover/ban:rotate-90 transition-transform" />
                                                    Ban
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]"
                        >
                            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                                <Search className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">No jobs match your moderation criteria</h3>
                            <p className="text-gray-500 mt-2 text-sm italic">"A clean platform is a happy platform."</p>
                            <button 
                                onClick={() => {
                                    setSearchQuery("");
                                    setRiskFilter("All");
                                }}
                                className="mt-8 px-8 py-3 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
                            >
                                Clear All Filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Job Detail Side Drawer - Portaled to Body */}
            {selectedJob && mounted && typeof document !== 'undefined' && createPortal(
                <AnimatePresence mode="wait">
                    <div className="fixed inset-0 z-[1000] flex justify-end pointer-events-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedJob(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full sm:w-[500px] lg:w-[600px] h-full bg-[#0a0c10] border-l border-white/10 shadow-[-32px_0_64px_rgba(0,0,0,0.5)] overflow-hidden relative z-[1001] flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 sm:p-8 border-b border-white/5 bg-white/[0.01] relative overflow-hidden shrink-0">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -mr-32 -mt-32" />
                                
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                                        <Briefcase className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <button 
                                        onClick={() => setSelectedJob(null)}
                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:rotate-90 border border-white/5"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{selectedJob.title}</h2>
                                        {selectedJob.jobType && (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-500">
                                                {selectedJob.jobType}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-5 text-gray-500">
                                        {selectedJob.company && (
                                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {selectedJob.company}
                                            </span>
                                        )}
                                        {selectedJob.location && (
                                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {selectedJob.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Body */}
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                                            <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Salary Range</div>
                                        </div>
                                        <div className="text-sm font-black text-white truncate">
                                            {typeof selectedJob.salary === 'string' 
                                                ? selectedJob.salary.replace('USD', '₹') 
                                                : (selectedJob.salary?.min || selectedJob.salary?.max)
                                                    ? `₹${selectedJob.salary.min}-${selectedJob.salary.max}`
                                                    : "Negotiable"
                                            }
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                                            <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Education</div>
                                        </div>
                                        <div className="text-sm font-black text-white truncate">{selectedJob.education || "N/A"}</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors col-span-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="w-3.5 h-3.5 text-indigo-500" />
                                            <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Created By</div>
                                        </div>
                                        <div className="text-sm font-black text-white truncate">{selectedJob.postedBy || "Admin"}</div>
                                    </div>
                                </div>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-0.5 w-6 bg-amber-500/40 rounded-full" />
                                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Job Description</h3>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 text-gray-400 leading-relaxed text-sm">
                                        {selectedJob.description}
                                    </div>
                                </section>

                                {selectedJob.responsibilities && (
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-0.5 w-6 bg-emerald-500/40 rounded-full" />
                                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Key Responsibilities</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {(Array.isArray(selectedJob.responsibilities) 
                                                ? selectedJob.responsibilities 
                                                : (typeof selectedJob.responsibilities === 'string' ? selectedJob.responsibilities.split('\n') : [])
                                            ).map((item, idx) => (
                                                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/5 text-sm text-gray-400 group hover:border-white/10 transition-all">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {selectedJob.skills?.length > 0 && (
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-0.5 w-6 bg-amber-500/40 rounded-full" />
                                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Technical Stack</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.skills.map((skill, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="px-4 py-2 rounded-xl bg-amber-500/5 border border-white/5 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:border-amber-500/20 transition-all"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {selectedJob.requirements && (
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-0.5 w-6 bg-blue-500/40 rounded-full" />
                                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Requirements</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {(Array.isArray(selectedJob.requirements) 
                                                ? selectedJob.requirements 
                                                : (typeof selectedJob.requirements === 'string' ? selectedJob.requirements.split('\n') : [])
                                            ).map((req, idx) => (
                                                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/5 text-sm text-gray-400 group hover:border-white/10 transition-all">
                                                    <CheckCircle2 className="w-4 h-4 text-blue-500/40 shrink-0 mt-0.5 group-hover:text-blue-500/60" />
                                                    {req}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                            </div>

                            {/* Drawer Footer */}
                            <div className="p-6 sm:p-8 border-t border-white/5 bg-white/[0.02] flex items-center gap-4 shrink-0">
                                <button 
                                    onClick={() => setSelectedJob(null)}
                                    className="flex-1 py-4 rounded-2xl border border-white/10 text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                                >
                                    Close
                                </button>
                                <button 
                                    onClick={() => {
                                        setJobToDelete(selectedJob);
                                        setSelectedJob(null);
                                    }}
                                    className="flex-1 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.3em] transition-all shadow-[0_8px_32px_rgba(239,68,68,0.2)]"
                                >
                                    Ban Job
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
