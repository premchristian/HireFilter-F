"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MoreVertical, MapPin, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, ExternalLink, RotateCcw, Trash2, X } from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApplicationsSkeleton } from "@/components/Skeleton";

export default function ApplicationsPage() {
    const router = useRouter();
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Delete state
    const [openMenuId, setOpenMenuId] = useState(null);
    const [applicationToDelete, setApplicationToDelete] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            console.log("[Applications] fetchApplications started");
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.warn("[Applications] No token found, redirecting...");
                    router.push("/login"); // Redirect if not logged in
                    return;
                }

                // Call the API
                const response = await axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/application/my", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const data = response.data.data || response.data || [];
                console.log("[Applications] Raw data received:", data.length, "items");
                
                const mappedApps = await Promise.all(Array.isArray(data) ? data
                    .filter(app => {
                        if (!app.job) {
                            console.warn("[Applications] Skipping app with missing job:", app._id);
                            return false;
                        }
                        return true;
                    }) 
                    .map(async (app, index) => {
                        return {
                            id: app._id || `temp-${index}`,
                            role: app.job.jobTitle || "Unknown Role", 
                            company: app.job.createdBy?.company?.name || app.job.department || "Company",
                            logo: (app.job.jobTitle || "C").charAt(0),
                            logoColor: "bg-[#EBE8FF] text-[#7C5CFC]", 
                            status: app.status || "Applied",
                            date: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Unknown Date",
                            location: app.job.location || "Remote",
                            derivedStatus: app.status,
                            jobId: app.job._id
                        };
                    }) : []);

                console.log("[Applications] Mapped apps count:", mappedApps.length);
                setApplications(mappedApps);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching applications:", err);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    router.push("/login");
                    return;
                }
                setError("Failed to load applications.");
                setLoading(false);
            }
        };

        fetchApplications();
    }, [router]);

    const getStatusColor = (status = "") => {
        const s = status.toLowerCase();
        switch (s) {
            case "interviewing": return "text-[#7C5CFC] bg-[#EBE8FF] border-[#EBE8FF]";
            case "shortlisted": return "text-[#7C5CFC] bg-[#EBE8FF] border-[#EBE8FF]";
            case "reviewing": return "text-[#FF9900] bg-[#FFF2E0] border-[#FFF2E0]";
            case "rejected": return "text-white bg-[#FF3B30] border-[#FF3B30]";
            case "offer": 
            case "offer sent":
            case "hired":
                return "text-[#27C052] bg-[#EFFFED] border-[#EFFFED]";
            default: return "text-[#71717A] bg-[#F4F7FE] border-[#F1F1F1]";
        }
    };

    const handleDeleteApplication = async () => {
        if (!applicationToDelete) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication token not found. Please log in again.");
            return;
        }

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${applicationToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setApplications(prev => prev.filter(app => app.id !== applicationToDelete.id));
            setApplicationToDelete(null);
        } catch (error) {
            console.error("Error deleting application:", error);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
                return;
            }
            const errorMessage = error.response?.data?.message || "Failed to delete application";
            alert(`Error: ${errorMessage}`);
        }
    };

    const filteredApplications = applications.filter(app => {
        const role = (app.role || "").toLowerCase();
        const company = (app.company || "").toLowerCase();
        const search = (searchQuery || "").toLowerCase();

        const matchesSearch = role.includes(search) || company.includes(search);
        
        let matchesTab = true;
        const status = (app.status || "").toLowerCase();
        
        if (filter === "Active") {
            matchesTab = ["reviewing", "interviewing", "offer", "offer sent", "shortlisted", "applied"].includes(status);
        } else if (filter === "Interviewing") {
            matchesTab = status === "interviewing";
        } else if (filter === "Hired") {
            matchesTab = status === "hired";
        } else if (filter === "Archived") {
            matchesTab = ["rejected", "withdrawn"].includes(status);
        }

        return matchesSearch && matchesTab;
    });

    console.log("[Applications] Render State:", {
        filter,
        searchQuery,
        totalApps: applications.length,
        filteredApps: filteredApplications.length,
        loading,
        hasError: !!error
    });

    if (loading) return <ApplicationsSkeleton />;
    if (error) return <div className="text-[#FF5C5C] text-center font-medium py-20">{error}</div>;

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

    console.log("[Applications] Rendering component. Loading:", loading, "Apps:", applications.length);

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-6xl mx-auto pb-12"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="px-2">
                <h1 className="text-3xl font-bold text-[#080808]">
                    My <span className="text-[#7C5CFC]">Applications</span>
                </h1>
                <p className="text-[#71717A] mt-1 font-medium">Track the status of your job applications</p>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 px-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                    <input 
                        type="text" 
                        placeholder="Search by role or company..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] pl-12 pr-4 py-3 text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05)]" 
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {["All", "Active", "Interviewing", "Hired", "Archived"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-6 py-2.5 rounded-[12px] border font-bold uppercase tracking-widest text-[10px] whitespace-nowrap transition-all ${
                                filter === tab 
                                    ? "bg-[#7C5CFC] border-[#7C5CFC] text-white shadow-[0px_4px_20px_rgba(124,92,252,0.3)]" 
                                    : "bg-[#FFFFFF] border-[#F1F1F1] text-[#71717A] hover:bg-[#F4F7FE] hover:text-[#080808] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Application List */}
            <div className="space-y-4 px-2 min-h-[200px]">
                <AnimatePresence mode="popLayout">
                    {filteredApplications.length > 0 ? (
                        filteredApplications.map((app, index) => (
                            <motion.div 
                                key={app.id || index}
                                variants={itemVariants}
                                initial="hidden"
                                animate="show"
                                layout
                                className={`group border border-[#F1F1F1] rounded-[20px] p-6 hover:border-[#7C5CFC]/30 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] transition-all relative shadow-[0px_4px_20px_rgba(0,0,0,0.05)] ${app.status?.toLowerCase() === "rejected" ? "bg-[#FFF5F5] border-[#FF3B30]/30" : "bg-[#FFFFFF]"}`}
                            >
                                <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
                                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7C5CFC]/5 rounded-full blur-2xl group-hover:bg-[#7C5CFC]/10 transition-colors duration-500"></div>
                                </div>
                                <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                                    {/* Logo & Basic Info */}
                                    <div className="flex gap-4 min-w-[300px]">
                                        <div className={`w-16 h-16 rounded-[16px] ${app.logoColor} flex items-center justify-center text-2xl font-bold shrink-0 border border-transparent group-hover:border-[#7C5CFC]/30`}>
                                            {app.logo}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-[#080808] group-hover:text-[#7C5CFC] transition-colors">{app.role}</h3>
                                            <p className="text-[#71717A] font-semibold">{app.company}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-[#71717A] font-medium">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {app.location}
                                                </span>
                                                <span className="text-[#F1F1F1]">•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {app.date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex-1 flex flex-col justify-center gap-2 lg:items-center">
                                       <div className="text-[#71717A] text-sm font-medium">
                                            Current Status: <span className={`font-bold ${app.status?.toLowerCase() === "rejected" ? "text-[#FF3B30]" : "text-[#080808]"}`}>{app.status}</span>
                                       </div>
                                    </div>

                                    {/* Actions & Status Badge */}
                                    <div className="flex flex-row lg:flex-col justify-between items-end gap-4 min-w-[140px]">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border leading-tight ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                        <div className="flex gap-2 relative">
                                            <Link href={`/candidate/jobs/${app.jobId}`}>
                                                <button className="p-2.5 bg-[#F4F7FE] hover:bg-[#EBE8FF] rounded-[12px] text-[#71717A] hover:text-[#7C5CFC] transition-all border border-[#F1F1F1]" title="View Details">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                                                    className="p-2.5 bg-[#F4F7FE] hover:bg-[#EBE8FF] rounded-[12px] text-[#71717A] hover:text-[#080808] transition-all border border-[#F1F1F1]"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                <AnimatePresence>
                                                    {openMenuId === app.id && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[12px] shadow-[0px_8px_30px_rgba(0,0,0,0.1)] z-50 overflow-hidden"
                                                        >
                                                            <button 
                                                                onClick={() => {
                                                                    setApplicationToDelete(app);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full text-left px-4 py-3 text-sm text-[#FF5C5C] hover:bg-[#FFEDE1] flex items-center gap-2 transition-colors font-semibold"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Withdraw Application
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-24 bg-[#FFFFFF] border border-dashed border-[#F1F1F1] rounded-[32px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                        >
                            <div className="w-20 h-20 rounded-[24px] bg-[#F4F7FE] flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-[#71717A]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#080808] tracking-tight">No applications found</h3>
                            <p className="text-[#71717A] mt-2 text-sm max-w-xs text-center font-medium">Try adjusting your search query or switching categories to find what you're looking for.</p>
                            <button 
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilter("All");
                                }}
                                className="mt-8 flex items-center gap-2 px-8 py-3 bg-[#7C5CFC] text-white font-bold uppercase tracking-widest rounded-[12px] hover:bg-[#6A4FE0] transition-all shadow-[0px_4px_20px_rgba(124,92,252,0.3)] active:scale-95"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset Filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Withdraw Confirmation Modal */}
            <AnimatePresence>
                {applicationToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[24px] p-8 max-w-md w-full shadow-[0px_8px_50px_rgba(0,0,0,0.15)] relative"
                        >
                            <button 
                                onClick={() => setApplicationToDelete(null)}
                                className="absolute top-6 right-6 text-[#71717A] hover:text-[#080808] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-20 h-20 rounded-full bg-[#FFEDE1] flex items-center justify-center mb-6 text-[#FF5C5C]">
                                    <Trash2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#080808] mb-2">Withdraw Application?</h2>
                                <p className="text-[#71717A] text-sm font-medium">
                                    Are you sure you want to withdraw your application for <span className="text-[#080808] font-bold">"{applicationToDelete.role}"</span>? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setApplicationToDelete(null)}
                                    className="flex-1 px-4 py-3 rounded-[12px] border border-[#F1F1F1] text-[#71717A] hover:bg-[#F4F7FE] font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDeleteApplication}
                                    className="flex-1 px-4 py-3 rounded-[12px] bg-[#FF5C5C] hover:bg-[#E04B4B] text-white font-bold transition-all shadow-[0px_4px_20px_rgba(255,92,92,0.3)]"
                                >
                                    Withdraw
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

