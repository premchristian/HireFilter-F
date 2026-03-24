"use client";

import { motion } from "framer-motion";
import { Search, Filter, Phone, MoreHorizontal, Download, ArrowLeft, Loader2, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useJobContext } from "@/context/JobContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ApplicantsListPage() {
    const params = useParams();
    const router = useRouter();
    const { getJobById } = useJobContext();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    const [applicants, setApplicants] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (params.jobId) {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        router.push('/login');
                        return;
                    }
                    
                    // Fetch Job Details
                    const jobData = await getJobById(params.jobId);
                    setJob(jobData);

                    // Fetch Applicants via dedicated API
                    const appResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${params.jobId}/getAll`,
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    
                    console.log("Dedicated Applicants API Response:", appResponse.data);
                    
                    if (appResponse.data.success) {
                        setApplicants(appResponse.data.data || []);
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                    if (error.response && error.response.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        router.push('/login');
                    }
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [params.jobId, getJobById, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh] text-[#080808]">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C5CFC]" />
            </div>
        );
    }

    if (!job) {
        return <div className="text-[#080808] p-6">Job not found.</div>;
    }

    const calculateScore = (candidateSkills, jobSkills) => {
        if (!jobSkills || jobSkills.length === 0) return 0;
        if (!candidateSkills || candidateSkills.length === 0) return 0;

        const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
        const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase().trim());

        const matchedSkills = normalizedJobSkills.filter(skill => 
            normalizedCandidateSkills.includes(skill)
        );

        return Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);
    };

    const handleDelete = async (applicationId) => {
        if (!confirm("Are you sure you want to delete this application? \n\nNote: This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from state
            setApplicants(prev => prev.filter(app => app._id !== applicationId));
            alert("Application deleted successfully.");
        } catch (error) {
            console.error("Error deleting application:", error);
            alert("Failed to delete application. Please try again.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                 <Link href="/hr/applicants">
                    <button className="p-2 hover:bg-[#F4F7FE] rounded-[12px] transition-colors text-[#71717A] hover:text-[#080808]">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold flex items-center text-[#080808]">
                        Applicants
                        <span className="ml-4 text-lg font-medium text-[#7C5CFC] bg-[#EBE8FF] px-3 py-1 rounded-full border border-[#7C5CFC]/20">
                            {applicants.length} Total
                        </span>
                    </h1>
                    <p className="text-[#71717A] mt-1">{job.title}</p>
                </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-4 border-b border-[#F1F1F1] flex gap-4">
                     <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                        <input 
                            type="text" 
                            placeholder="Search applicants..." 
                            className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] pl-9 pr-4 py-2 text-[#080808] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50" 
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#F4F7FE] text-[#71717A] border-b border-[#F1F1F1] text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Applied</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F1F1]">
                            {applicants.length > 0 ? (
                                [...applicants].sort((a, b) => {
                                    const scoreA = calculateScore(a.user?.profile?.skills || a.skills || [], job?.skills || []);
                                    const scoreB = calculateScore(b.user?.profile?.skills || b.skills || [], job?.skills || []);
                                    // Ascending order as requested (lowest score first, highest score last)
                                    return scoreA - scoreB;
                                }).map((app, index) => {
                                    const getImgUrl = (img) => {
                                        if (!img) return null;
                                        if (typeof img === "string") return img;
                                        return img.url || img.imageUrl || img.secure_url || null;
                                    };
                                    const avatarUrl = getImgUrl(app.profileImage) || getImgUrl(app.user?.profileImage) || getImgUrl(app.user?.profile?.image) || getImgUrl(app.user?.avatar);
                                    return (
                                    <tr key={app._id || index} className="hover:bg-[#F4F7FE] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#EBE8FF] flex items-center justify-center text-xs font-bold text-[#7C5CFC] uppercase border border-[#F1F1F1] overflow-hidden shrink-0">
                                                    {avatarUrl ? (
                                                        <img src={avatarUrl} alt={app.user?.name || app.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (app.user?.name || app.name || "U").charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-[#080808] font-medium">{app.user?.name || app.name || "Unknown Candidate"}</div>
                                                    <div className="text-xs text-[#71717A]">{app.user?.email || app.email || "No email"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const score = calculateScore(
                                                    app.user?.profile?.skills || app.skills || [], 
                                                    job.skills
                                                );
                                                return (
                                                    <span className={`font-bold ${score >= 75 ? 'text-[#27C052]' : score >= 50 ? 'text-[#FFD66B]' : 'text-[#71717A]'}`}>
                                                        {score}%
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                app.status === 'New' ? 'bg-[#E3F2FD] text-[#2196F3] border-[#2196F3]/20' :
                                                app.status === 'Rejected' ? 'bg-[#FFEDE1] text-[#FF5C5C] border-[#FF5C5C]/20' :
                                                'bg-[#FFF9E6] text-[#FFD66B] border-[#FFD66B]/20'
                                            }`}>
                                                {app.status || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[#71717A] text-sm">
                                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/hr/applicants/${params.jobId}/${app._id}`}>
                                                    <button 
                                                        className="p-2 hover:bg-[#EBE8FF] rounded-[8px] text-[#71717A] hover:text-[#7C5CFC] transition-colors"
                                                        title="View Applicant Profile"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(app._id)}
                                                    className="p-2 hover:bg-[#FFEDE1] rounded-[8px] text-[#71717A] hover:text-[#FF5C5C] transition-colors"
                                                    title="Delete Application"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-[#71717A]">
                                        No applicants found for this job.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
