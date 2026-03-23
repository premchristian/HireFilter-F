"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MoreHorizontal, Phone, Mail, MapPin, Download, CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useJobContext } from "@/context/JobContext";
import axios from "axios";
import Link from "next/link";
import { getUserId, logout } from "@/utils/auth";

const tabs = ["All", "Shortlisted", "Interviewing", "Offer", "Hired"];

export default function ShortlistPage() {
    const { jobs } = useJobContext();
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const userId = getUserId();
        console.log("[Shortlist] Current User ID from token:", userId);
        if (userId) {
            setCurrentUserId(userId);
        } else {
            console.warn("[Shortlist] No user ID found in token, redirecting...");
            // Optionally redirect to login if no ID is found at all
            // window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        const fetchAllCandidates = async () => {
             // Wait for jobs and user ID to be loaded
             if (!jobs || jobs.length === 0 || !currentUserId) {
                 if (jobs && jobs.length === 0) setLoading(false); 
                 console.log("[Shortlist] Waiting for jobs or currentUserId...", { jobsLength: jobs?.length, currentUserId });
                 return; 
             }

             setLoading(true);
             const token = localStorage.getItem("token");
             let allApplicants = [];

             try {
                 console.log(`[Shortlist] Filtering for HR User ID: ${currentUserId}`);
                 // Filter jobs created by the current user
                 const myJobs = jobs.filter(job => {
                     const creatorId = typeof job.createdBy === 'object' ? job.createdBy?._id : job.createdBy;
                     return creatorId === currentUserId;
                 });

                 console.log(`[Shortlist] Found ${myJobs.length} jobs created by this HR.`);

                 if (myJobs.length === 0) {
                     setCandidates([]);
                     setLoading(false);
                     return;
                 }

                 // Fetch applicants for each of MY jobs
                 // Note: Ideally, there would be a single API endpoint for this.
                 const promises = myJobs.map(job => 
                     axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${job.id}/getAll`, {
                         headers: { Authorization: `Bearer ${token}` }
                     }).then(res => {
                         if (res.data.success && Array.isArray(res.data.data)) {
                             // Attach job details to each applicant for context
                             return res.data.data.map(app => ({ ...app, jobRole: job.title, jobId: job.id }));
                         }
                         return [];
                     }).catch(err => {
                         console.error(`Error fetching applicants for job ${job.id}:`, err);
                         return [];
                     })
                 );

                 const results = await Promise.all(promises);
                 allApplicants = results.flat();
                 console.log(`[Shortlist] Total applicants across all jobs: ${allApplicants.length}`);

                 // Map to UI format
                 const mappedCandidates = allApplicants.map(app => {
                     const getImgUrl = (img) => {
                         if (!img) return null;
                         if (typeof img === "string") return img;
                         return img.url || img.imageUrl || img.secure_url || null;
                     };
                     
                     return {
                         id: app._id,
                         name: app.user?.name || app.name || "Unknown Candidate",
                         role: app.jobRole || "Unknown Role",
                         status: app.status || "New",
                         location: app.user?.profile?.location || "Remote", // Fallback
                         email: app.user?.email || app.email || "No email",
                         phone: app.user?.phone || app.phone || "No phone",
                         jobId: app.jobId,
                         avatar: getImgUrl(app.profileImage) || getImgUrl(app.user?.profileImage) || getImgUrl(app.user?.profile?.image) || getImgUrl(app.user?.avatar),
                         match: calculateMatchScore(app.skills || app.user?.profile?.skills || [], getJobSkills(app.jobId))
                     };
                 });
                 
                 console.log("[Shortlist] Mapped Candidates Sample Status:", mappedCandidates.slice(0, 3).map(c => c.status));
                 setCandidates(mappedCandidates);
             } catch (error) {
                 console.error("Error fetching candidates:", error);
                 if (error.response?.status === 401) {
                     console.warn("[Shortlist] 401 Unauthorized - logging out...");
                     logout();
                 }
             } finally {
                 setLoading(false);
             }
        };

        if (currentUserId) {
            fetchAllCandidates();
        }
    }, [jobs, currentUserId]); // Re-run when jobs or user ID changes

    // Helper to get skills for a job (needed for match score)
    const getJobSkills = (jobId) => {
        const job = jobs.find(j => j.id === jobId);
        return job ? job.skills : [];
    };

    // Helper to calculate match score
    const calculateMatchScore = (candidateSkills, jobSkills) => {
        if (!jobSkills || jobSkills.length === 0) return "0%";
        if (!candidateSkills || candidateSkills.length === 0) return "0%";

        const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
        const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase().trim());

        const matchedSkills = normalizedJobSkills.filter(skill => 
            normalizedCandidateSkills.includes(skill)
        );

        const score = Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);
        return `${score}%`;
    };

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            setUpdatingId(appId);
            const token = localStorage.getItem("token");
            await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${appId}/status`, 
                { status: newStatus.toLowerCase() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setCandidates(prev => prev.map(c => 
                c.id === appId ? { ...c, status: newStatus } : c
            ));
            
            console.log(`[Shortlist] Candidate ${appId} status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating status:", error);
            if (error.response?.status === 401) {
                logout();
            } else {
                alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setUpdatingId(null);
        }
    };


    const filteredCandidates = candidates.filter(candidate => {
        const candidateStatusLower = candidate.status.toLowerCase();
        let matchesTab = false;
        if (activeTab === "All") {
            matchesTab = true;
        } else if (activeTab === "Offer") {
            matchesTab = candidateStatusLower === "offer";
        } else {
            matchesTab = candidateStatusLower === activeTab.toLowerCase();
        }
        
        const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             candidate.role.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
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

    if (loading && candidates.length === 0) {
        return (
            <div className="flex items-center justify-center h-[50vh] text-[#080808]">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C5CFC]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#080808]">
                    Candidate Pipeline
                </h1>
                <p className="text-[#71717A] mt-1 font-medium">Manage and track shortlisted candidates</p>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 border-b border-[#F1F1F1] scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-[12px] text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === tab 
                                ? "bg-[#EBE8FF] border border-[#7C5CFC]/20 text-[#7C5CFC] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]" 
                                : "text-[#71717A] hover:text-[#080808] hover:bg-[#F4F7FE]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                    <input 
                        type="text" 
                        placeholder="Search candidates by name or role..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 w-full bg-[#FFFFFF] border border-[#F1F1F1] text-[#080808] placeholder:text-[#71717A] rounded-[12px] pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#080808] border border-[#080808] rounded-[12px] text-[#FFFFFF] hover:bg-[#27272A] transition-colors shadow-[0px_4px_20px_rgba(0,0,0,0.2)]">
                    <Filter className="w-4 h-4" />
                    <span className="font-bold">Filter</span>
                </button>
            </div>

            {/* Candidates List */}
            {filteredCandidates.length > 0 ? (
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredCandidates.map((candidate) => (
                            <motion.div 
                                key={candidate.id}
                                layout
                                variants={item}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative p-6 bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-[16px] hover:border-[#EBE8FF] transition-all"
                            >
                                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                                    <div className="flex items-start gap-4 w-full min-w-0">
                                        <div className="w-12 h-12 rounded-[12px] bg-[#EBE8FF] flex items-center justify-center text-[#7C5CFC] font-bold text-lg shadow-[0px_4px_20px_rgba(124,92,252,0.15)] group-hover:scale-110 transition-transform duration-300 overflow-hidden shrink-0 border border-[#F1F1F1]">
                                            {candidate.avatar ? (
                                                <img src={candidate.avatar} alt={candidate.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <>{candidate.name.charAt(0)}{candidate.name.split(' ')[1]?.charAt(0)}</>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-xl font-bold text-[#080808] truncate">{candidate.name}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-[8px] text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                                                    candidate.status.toLowerCase() === 'hired' ? 'bg-[#EFFFED] text-[#27C052] border-[#27C052]/20' :
                                                    candidate.status.toLowerCase() === 'offer' ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]/20' :
                                                    candidate.status.toLowerCase() === 'interviewing' ? 'bg-blue-50 text-blue-500 border-blue-500/20' :
                                                    candidate.status.toLowerCase() === 'shortlisted' ? 'bg-[#EBE8FF] text-[#7C5CFC] border-[#7C5CFC]/20' :
                                                    candidate.status.toLowerCase() === 'rejected' ? 'bg-[#FF5C5C]/10 text-[#FF5C5C] border-[#FF5C5C]/20' :
                                                    'bg-[#FFF5E5] text-[#FF9E2C] border-[#FF9E2C]/20'
                                                }`}>
                                                    {candidate.status}
                                                </span>
                                            </div>
                                            <p className="text-[#7C5CFC] font-bold text-sm mt-1 truncate">{candidate.role}</p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-[#71717A] font-medium">
                                                <span className="flex items-center gap-1.5 hover:text-[#080808] transition-colors cursor-pointer shrink-0">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {candidate.location}
                                                </span>
                                                <span className="flex items-center gap-1.5 hover:text-[#080808] transition-colors cursor-pointer break-all">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {candidate.email}
                                                </span>
                                                <span className="flex items-center gap-1.5 hover:text-[#080808] transition-colors cursor-pointer shrink-0">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {candidate.phone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-[#F1F1F1] pt-4 lg:pt-0">
                                        <div className="text-center px-4 md:px-6 border-r border-[#F1F1F1] last:border-0 shrink-0">
                                            <div className="text-2xl font-black text-[#080808]">
                                                {candidate.match}
                                            </div>
                                            <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-tighter mt-1">Match Score</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link href={`/hr/applicants/${candidate.jobId}/${candidate.id}`}>
                                                <button 
                                                    className="p-2.5 bg-[#EBE8FF] text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-[#FFFFFF] border border-[#7C5CFC]/20 rounded-[12px] transition-all shadow-sm"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </Link>
                                             <button className="p-2.5 bg-[#F4F7FE] text-[#71717A] hover:bg-[#FFFFFF] hover:text-[#080808] border border-[#F1F1F1] rounded-[12px] transition-all shadow-sm">
                                                <Download className="w-5 h-5" />
                                            </button>
                                            {/* Final Actions based on status */}
                                            {candidate.status.toLowerCase() !== 'hired' && candidate.status.toLowerCase() !== 'rejected' && (
                                                <>
                                                    {candidate.status.toLowerCase() === 'shortlisted' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(candidate.id, 'Interviewing')}
                                                            disabled={updatingId === candidate.id}
                                                            className={`p-2.5 bg-[#EFFFED] text-[#27C052] hover:bg-[#D4F8D3] border border-[#27C052]/20 rounded-[12px] transition-all shadow-sm ${updatingId === candidate.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            title="Move to Interviewing"
                                                        >
                                                            {updatingId === candidate.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                                        </button>
                                                    )}
                                                     {candidate.status.toLowerCase() === 'interviewing' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(candidate.id, 'Offer')}
                                                            disabled={updatingId === candidate.id}
                                                            className={`p-2.5 bg-[#EFFFED] text-[#27C052] hover:bg-[#D4F8D3] border border-[#27C052]/20 rounded-[12px] transition-all shadow-sm ${updatingId === candidate.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            title="Move to Offer"
                                                        >
                                                            {updatingId === candidate.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                                        </button>
                                                    )}
                                                    {candidate.status.toLowerCase() === 'offer' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(candidate.id, 'Hired')}
                                                            disabled={updatingId === candidate.id}
                                                            className={`p-2.5 bg-[#EFFFED] text-[#27C052] hover:bg-[#D4F8D3] border border-[#27C052]/20 rounded-[12px] transition-all shadow-sm ${updatingId === candidate.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            title="Hire Candidate"
                                                        >
                                                            {updatingId === candidate.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleStatusUpdate(candidate.id, 'Rejected')}
                                                        disabled={updatingId === candidate.id}
                                                        className={`p-2.5 bg-[#FF5C5C]/10 text-[#FF5C5C] hover:bg-[#FF5C5C]/20 border border-[#FF5C5C]/20 rounded-[12px] transition-all shadow-sm ${updatingId === candidate.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title="Reject Candidate"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 bg-[#FFFFFF] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-dashed border-[#F1F1F1] rounded-[24px]"
                >
                    <div className="w-16 h-16 rounded-[16px] bg-[#F4F7FE] flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-[#71717A]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#080808]">No candidates found</h3>
                    <p className="text-[#71717A] mt-2 font-medium">Try adjusting your filters or search query</p>
                    <button 
                        onClick={() => {
                            setSearchQuery("");
                            setActiveTab("All");
                        }}
                        className="mt-6 text-[#7C5CFC] font-bold hover:underline"
                    >
                        Clear All Filters
                    </button>
                </motion.div>
            )}
        </div>
    );
}
