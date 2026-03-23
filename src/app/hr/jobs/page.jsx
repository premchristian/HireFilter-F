"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
    Search, 
    Filter, 
    Plus, 
    MoreHorizontal, 
    MapPin, 
    Users, 
    Clock, 
    Briefcase,
    ChevronDown,
    Trash2,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

import { useJobContext } from "@/context/JobContext";

export default function JobsPage() {
    const { jobs, fetchJobs } = useJobContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [showMyJobs, setShowMyJobs] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const [showFilters, setShowFilters] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [applicantCounts, setApplicantCounts] = useState({});

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const token = localStorage.getItem("token");
                if (!token) {
                    console.warn("[JobsPage] No token found in localStorage");
                    return;
                }
                
                console.log(`[JobsPage] Fetching profile from: ${baseUrl}/api/users/getProfile`);
                const res = await axios.get(`${baseUrl}/api/users/getProfile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log("[JobsPage] Profile API Response Status:", res.status);
                if (res.data.success) {
                    setCurrentUserId(res.data.data._id);
                    console.log("[JobsPage] Current User ID set:", res.data.data._id);
                }
            } catch (error) {
                console.error("[JobsPage] Error fetching user profile:", {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
            }
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const fetchCounts = async () => {
            if (jobs.length > 0) {
                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        const counts = {};
                        await Promise.all(jobs.map(async (job) => {
                            try {
                                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                                const res = await fetch(`${baseUrl}/api/application/${job.id}/getAll`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                const data = await res.json();
                                counts[job.id] = (data.success && data.data) ? data.data.length : 0;
                            } catch (err) {
                                console.error(`[JobsPage] Error fetching counts for job ${job.id}`, err);
                                counts[job.id] = 0;
                            }
                        }));
                        setApplicantCounts(counts);
                    } catch (error) {
                        console.error("Error fetching all applicant counts", error);
                    }
                }
            }
        };
        fetchCounts();
    }, [jobs]);
    
    // Delete state
    const [openMenuId, setOpenMenuId] = useState(null);
    const [jobToDelete, setJobToDelete] = useState(null);

    const handleDeleteJob = async () => {
        if (!jobToDelete) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication token not found. Please log in again.");
            return;
        }

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            console.log(`[JobsPage] Deleting job from: ${baseUrl}/api/jobs/${jobToDelete.id}`);
            await axios.delete(`${baseUrl}/api/jobs/${jobToDelete.id}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });
            
            // Refresh jobs list
            fetchJobs();
            setJobToDelete(null);
            alert("Job deleted successfully");
        } catch (error) {
            console.error("Error deleting job:", error);
            if (error.response && error.response.status === 403) {
                alert("Permission Denied: You can only delete jobs that you created.");
            } else {
                const errorMessage = error.response?.data?.message || "Failed to delete job";
                alert(`Error: ${errorMessage}`);
            }
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             job.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === "All" || job.status === statusFilter;
        
        let matchesMyJobs = true;
        if (showMyJobs && currentUserId) {
            const creatorId = typeof job.createdBy === 'object' ? job.createdBy?._id : job.createdBy;
            matchesMyJobs = creatorId === currentUserId;
        }
        
        return matchesSearch && matchesStatus && matchesMyJobs;
    });

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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#080808]">
                        Jobs
                    </h1>
                    <p className="text-[#71717A] mt-1">Manage your job postings and hiring pipeline</p>
                </div>
                <Link href="/hr/jobs/create">
                    <button className="flex items-center gap-2 bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white px-6 py-2.5 rounded-[12px] font-medium transition-colors shadow-[0px_4px_20px_rgba(124,92,252,0.3)] border border-[#7C5CFC]">
                        <Plus className="w-5 h-5" suppressHydrationWarning />
                        <span>Post New Job</span>
                    </button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" suppressHydrationWarning />
                    <input 
                        type="text" 
                        placeholder="Search by title, department, or location..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] pl-10 pr-4 py-2.5 text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all font-medium" 
                    />
                </div>
                <div className="flex gap-4 relative">
                    <button 
                        onClick={() => setShowMyJobs(!showMyJobs)}
                        className={`flex items-center gap-2 px-4 py-2.5 bg-[#FFFFFF] border rounded-[12px] text-[#71717A] transition-colors font-medium ${showMyJobs ? 'border-[#7C5CFC] text-[#7C5CFC] bg-[#EBE8FF]' : 'border-[#F1F1F1] hover:bg-[#F4F7FE] hover:text-[#080808]'}`}
                    >
                        <Briefcase className="w-4 h-4" suppressHydrationWarning />
                        <span>My Jobs</span>
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[12px] text-[#71717A] hover:bg-[#F4F7FE] hover:text-[#080808] transition-colors font-medium ${statusFilter !== 'All' ? 'border-[#7C5CFC] text-[#7C5CFC] bg-[#EBE8FF]' : ''}`}
                        >
                            <Filter className="w-4 h-4" suppressHydrationWarning />
                            <span>{statusFilter}</span>
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} suppressHydrationWarning />
                        </button>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-40 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] shadow-[0px_8px_30px_rgba(0,0,0,0.1)] z-50 p-2"
                                >
                                    {['All', 'Active', 'Closed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setShowFilters(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 rounded-[8px] text-sm transition-colors ${statusFilter === status ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/20 border border-[#7C5CFC]' : 'text-[#71717A] hover:bg-[#F4F7FE] hover:text-[#080808]'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* Reset Button */}
                    {(searchQuery || statusFilter !== 'All') && (
                        <button 
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("All");
                            }}
                            className="text-xs text-[#71717A] hover:text-[#080808] transition-colors underline underline-offset-4"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Jobs List */}
            {filteredJobs.length > 0 ? (
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredJobs.map((job) => (
                                <motion.div 
                                    key={job.id}
                                    layout
                                    variants={item}
                                    initial="hidden"
                                    animate="show"
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group relative p-6 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] hover:border-[#EBE8FF] hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] transition-all cursor-pointer"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-[12px] bg-[#EBE8FF] border border-transparent flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <Briefcase className="w-7 h-7 text-[#7C5CFC]" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-[#080808] group-hover:text-[#7C5CFC] transition-colors">{job.title}</h3>
                                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#71717A] font-medium tracking-wide">
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#F4F7FE] border border-[#F1F1F1]">
                                                        <Briefcase className="w-4 h-4 text-[#7C5CFC]" />
                                                        {job.department}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#F4F7FE] border border-[#F1F1F1]">
                                                        <Clock className="w-4 h-4 text-[#27C052]" />
                                                        {job.type}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#F4F7FE] border border-[#F1F1F1]">
                                                        <MapPin className="w-4 h-4 text-[#FF5C5C]" />
                                                        {job.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                            <div className="flex items-center gap-8">
                                                <div className="text-center w-20">
                                                    <p className="text-2xl font-bold text-[#080808]">
                                                        {applicantCounts[job.id] !== undefined ? applicantCounts[job.id] : (job.applicants || 0)}
                                                    </p>
                                                    <p className="text-[10px] text-[#71717A] uppercase tracking-widest font-bold mt-1">Applicants</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                    job.status === 'Active' 
                                                        ? 'bg-[#EFFFED] text-[#27C052] border-[#27C052]/20' 
                                                        : 'bg-[#FFEDE1] text-[#FF5C5C] border-[#FF5C5C]/20'
                                                }`}>
                                                    {job.status}
                                                </div>
                                            </div>
                                            
                                            <div className="relative z-20">
                                                <button 
                                                    onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                                                    className="p-2 hover:bg-[#F4F7FE] rounded-[8px] transition-colors text-[#71717A] hover:text-[#080808]"
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {openMenuId === job.id && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] shadow-[0px_8px_30px_rgba(0,0,0,0.1)] z-50 overflow-hidden"
                                                        >
                                                        <button 
                                                            onClick={() => {
                                                                setJobToDelete(job);
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-sm text-[#FF5C5C] hover:bg-[#FFEDE1] flex items-center gap-2 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete Job
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                    {/* Hover Overlay Gradient */}
                                    <div className="absolute inset-0 bg-linear-to-r from-[#7C5CFC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[16px]" />
                                </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 bg-[#FFFFFF] border border-dashed border-[#F1F1F1] rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                >
                    <div className="w-16 h-16 rounded-[16px] bg-[#F4F7FE] flex items-center justify-center mb-4 border border-[#F1F1F1] shadow-sm">
                        <Search className="w-8 h-8 text-[#71717A]" suppressHydrationWarning />
                    </div>
                    <h3 className="text-xl font-bold text-[#080808]">No jobs found</h3>
                    <p className="text-[#71717A] mt-2 font-medium">Try adjusting your filters or search query</p>
                    <button 
                        onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("All");
                        }}
                        className="mt-6 text-[#7C5CFC] font-medium hover:underline"
                    >
                        Clear All Filters
                    </button>
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
             <AnimatePresence>
                {jobToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-8 max-w-md w-full shadow-[0px_8px_30px_rgba(0,0,0,0.1)] relative"
                        >
                            <button 
                                onClick={() => setJobToDelete(null)}
                                className="absolute top-4 right-4 text-[#71717A] hover:text-[#080808]"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-[#FFEDE1] flex items-center justify-center mb-4 text-[#FF5C5C]">
                                    <Trash2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#080808] mb-2">Delete Job Post?</h2>
                                <p className="text-[#71717A] text-sm">
                                    Are you sure you want to delete <span className="text-[#080808] font-bold">"{jobToDelete.title}"</span>? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setJobToDelete(null)}
                                    className="flex-1 px-4 py-3 rounded-[12px] border border-[#F1F1F1] text-[#71717A] hover:bg-[#F4F7FE] hover:text-[#080808] font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDeleteJob}
                                    className="flex-1 px-4 py-3 rounded-[12px] bg-[#FF5C5C] hover:bg-[#E04D4D] text-white font-bold transition-all shadow-[0px_4px_15px_rgba(255,92,92,0.3)] border border-[#FF5C5C]"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
