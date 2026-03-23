"use client";

import { motion } from "framer-motion";
import { Search, Filter, MoreHorizontal, Eye, ArrowRight, Users, Briefcase } from "lucide-react";
import Link from "next/link";
import { useJobContext } from "@/context/JobContext";
import { useState, useEffect } from "react";


import axios from "axios";

export default function ApplicationsPage() {
    const { jobs } = useJobContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [showMyJobs, setShowMyJobs] = useState(true); // Force show only my jobs

    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/getProfile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setCurrentUserId(res.data.data._id);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };
        fetchUserProfile();
    }, []);

    const [applicantCounts, setApplicantCounts] = useState({});

    useEffect(() => {
        const fetchCounts = async () => {
            if (jobs.length > 0) {
                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        const counts = {};
                        await Promise.all(jobs.map(async (job) => {
                            try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${job.id}/getAll`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                const data = await res.json();
                                counts[job.id] = (data.success && data.data) ? data.data.length : 0;
                            } catch (err) {
                                console.error(`Error fetching counts for job ${job.id}`, err);
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

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              job.department.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesMyJobs = true;
        if (showMyJobs && currentUserId) {
             const creatorId = typeof job.createdBy === 'object' ? job.createdBy?._id : job.createdBy;
             matchesMyJobs = creatorId === currentUserId;
        }

        return matchesSearch && matchesMyJobs;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            {/* ... */}

            {/* Search and Filter */}
            <div className="bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-[16px] p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                    <input 
                        type="text" 
                        placeholder="Search jobs..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] pl-9 pr-4 py-2 text-[#080808] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50" 
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] hover:bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] text-sm text-[#71717A] transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>


            {/* Jobs List Table */}
            <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#F4F7FE] text-[#71717A] border-b border-[#F1F1F1] text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Job Role</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Applicants</th>
                                <th className="px-6 py-4">Posted Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F1F1]">
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-[#F4F7FE] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-[8px] bg-[#EBE8FF] flex items-center justify-center text-[#7C5CFC]">
                                                    <Briefcase className="w-4 h-4" />
                                                </div>
                                                <span className="text-[#080808] font-medium">{job.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[#71717A]">{job.department}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                job.status === 'Active' 
                                                    ? 'bg-[#EFFFED] text-[#27C052] border-[#27C052]/20' 
                                                    : 'bg-[#FFEDE1] text-[#FF5C5C] border-[#FF5C5C]/20'
                                            }`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[#080808] font-medium">
                                                <Users className="w-4 h-4 text-[#71717A]" />
                                                {applicantCounts[job.id] !== undefined ? applicantCounts[job.id] : (job.applicants || 0)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[#71717A] text-sm">{job.posted}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/hr/applicants/${job.id}`}>
                                                <button className="px-3 py-1.5 bg-[#EBE8FF] hover:bg-[#7C5CFC]/20 border border-[#7C5CFC]/20 rounded-[8px] text-[#7C5CFC] text-xs font-medium transition-colors flex items-center gap-1 ml-auto">
                                                    View Candidates
                                                    <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-[#71717A]">
                                        No jobs found matching your search.
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
