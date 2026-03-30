"use client";

import { useEffect, useState } from "react";
import { useJobContext } from "@/context/JobContext";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Users, Calendar, Briefcase, IndianRupee, Clock, ArrowLeft, AlertCircle, Edit2, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { getJobById } = useJobContext();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobToEdit, setJobToEdit] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const fetchData = async () => {
        if (params.jobId) {
            setLoading(true);
            const data = await getJobById(params.jobId);
            setJob(data);
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, [params.jobId]);

    const handleEditClick = (job) => {
        setJobToEdit(job);
        setEditFormData({
            jobTitle: job.title || "",
            location: job.location || "",
            jobType: job.type || "Full-Time",
            department: job.department || "Engineering",
            jobDescription: job.description || ""
        });
    };

    const handleUpdateJob = async () => {
        if (!jobToEdit) return;

        const token = localStorage.getItem("token");
        if (!token) return alert("Please log in again.");

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

            // Fetch raw job details from DB to ensure we have all fields
            const rawJobRes = await axios.get(`${baseUrl}/api/jobs/${jobToEdit.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const rawJob = rawJobRes.data?.data || rawJobRes.data?.job || rawJobRes.data;

            if (!rawJob) {
                return alert("Could not fetch the full job details. Try again.");
            }

            // Construct payload with ONLY allowed Joi schema fields!
            const payload = {
                jobTitle: editFormData.jobTitle || rawJob.jobTitle,
                jobDescription: editFormData.jobDescription || rawJob.jobDescription || "Not provided",
                jobType: editFormData.jobType || rawJob.jobType,
                location: editFormData.location || rawJob.location,
                requiredSkills: Array.isArray(rawJob.requiredSkills) ? rawJob.requiredSkills : [],
                experience: rawJob.experience || { min: 0, max: 0 },
                salary: rawJob.salary || { min: 0, max: 0, currency: "INR" },
                education: jobToEdit.education || rawJob.education || "Any",
                lastDate: rawJob.lastDate || new Date().toISOString(),
                department: editFormData.department || rawJob.department || "Engineering"
            };

            await axios.put(`${baseUrl}/api/jobs/${jobToEdit.id}`, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            await fetchData();
            setJobToEdit(null);
            alert("Job updated successfully");
        } catch (error) {
            console.error("Error updating job:", error);
            const errMsg = error.response?.data?.errors 
                ? error.response.data.errors.join(", ") 
                : error.response?.data?.message || "Failed to update job";
            alert("Validation Error: " + errMsg);
        }
    };





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
                                
                                <div className="grid gap-3">
                                    <button 
                                        onClick={() => handleEditClick(job)}
                                        className="w-full py-4 bg-[#EBE8FF] text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white rounded-[16px] font-bold text-sm transition-all active:scale-[0.98] border border-[#7C5CFC]/10 flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Update Job
                                    </button>
                                    <Link href={`/hr/applicants/${job.id}`} className="w-full">
                                        <button className="w-full py-4 bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white rounded-[16px] font-bold text-sm shadow-[0px_4px_20px_rgba(124,92,252,0.3)] transition-all active:scale-[0.98]">
                                            Manage Applications
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Job Modal */}
            <AnimatePresence>
                {jobToEdit && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[24px] p-8 max-w-2xl w-full shadow-[0px_8px_30px_rgba(0,0,0,0.1)] relative max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setJobToEdit(null)} className="absolute top-6 right-6 text-[#71717A] hover:text-[#080808]">
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-2xl font-black text-[#080808] mb-8 flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#7C5CFC] rounded-full" />
                                Edit Job Details
                            </h2>
                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="text-sm font-black text-[#080808] uppercase tracking-wider">Job Title</label>
                                    <input 
                                        type="text" 
                                        value={editFormData.jobTitle} 
                                        onChange={(e) => setEditFormData({...editFormData, jobTitle: e.target.value})}
                                        className="w-full mt-2 bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 font-medium"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-black text-[#080808] uppercase tracking-wider">Job Type</label>
                                        <select 
                                            value={editFormData.jobType} 
                                            onChange={(e) => setEditFormData({...editFormData, jobType: e.target.value})}
                                            className="w-full mt-2 bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 font-medium"
                                        >
                                            <option>Full-Time</option>
                                            <option>Part-Time</option>
                                            <option>Contract</option>
                                            <option>Internship</option>
                                            <option>Remote</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-black text-[#080808] uppercase tracking-wider">Department</label>
                                        <select 
                                            value={editFormData.department} 
                                            onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                                            className="w-full mt-2 bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 font-medium"
                                        >
                                            <option>Engineering</option>
                                            <option>IT</option>
                                            <option>Design</option>
                                            <option>Marketing</option>
                                            <option>Sales</option>
                                            <option>Account</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-black text-[#080808] uppercase tracking-wider">Location</label>
                                    <input 
                                        type="text" 
                                        value={editFormData.location} 
                                        onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                                        className="w-full mt-2 bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-black text-[#080808] uppercase tracking-wider">Description</label>
                                    <textarea 
                                        value={editFormData.jobDescription} 
                                        onChange={(e) => setEditFormData({...editFormData, jobDescription: e.target.value})}
                                        rows={5}
                                        className="w-full mt-2 bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 font-medium resize-none"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setJobToEdit(null)} 
                                    className="flex-1 px-6 py-4 rounded-[16px] border border-[#F1F1F1] text-[#71717A] hover:bg-[#F4F7FE] font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdateJob} 
                                    className="flex-1 px-6 py-4 rounded-[16px] bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white font-bold transition-all shadow-lg shadow-[#7C5CFC]/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
