"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Upload, Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminCreateJobPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        jobTitle: "",
        department: "Engineering", 
        jobType: "Full-Time", 
        location: "",
        jobDescription: "",
        requiredSkills: "", 
        experienceMin: "",
        experienceMax: "",
        education: "Graduate", 
        lastDate: "",
        salaryMin: "",
        salaryMax: ""
    });

    const [loading, setLoading] = useState(false);

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    
    const handlePublish = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You must be logged in to post a job.");
                router.push("/login"); 
                return;
            }

            const payload = {
                jobTitle: formData.jobTitle,
                jobDescription: formData.jobDescription,
                jobType: formData.jobType,
                location: formData.location,
                requiredSkills: formData.requiredSkills.split(",").map(s => s.trim()),
                experience: { 
                    min: Number(formData.experienceMin),
                    max: Number(formData.experienceMax)
                },
                salary: { 
                    min: Number(formData.salaryMin), 
                    max: Number(formData.salaryMax),
                    currency: "USD" 
                },
                education: formData.education, 
                lastDate: formData.lastDate,
                department: formData.department 
            };
            
            // For admin, we might need a specific endpoint or just use the same if admin is also an HR or Super Admin
            // Assuming same endpoint works for now, backend might handle roles.
            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL + "/api/jobs",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201 || response.status === 200) {
                alert("Job posted successfully!");
                router.push("/admin/jobs");
            }
        } catch (error) {
            console.error("Error creating job:", error);
            if (error.response?.data?.errors) {
                console.log("Validation Errors:", error.response.data.errors);
                alert("Validation Failed:\n" + error.response.data.errors.join("\n"));
            } else {
                alert(error.response?.data?.message || "Failed to create job. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/jobs">
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Post a New Job
                    </h1>
                    <p className="text-gray-400 mt-1">Create a comprehensive job posting to attract the best talent</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex-1">
                        <div className={`h-2 rounded-full transition-colors ${s <= step ? 'bg-[#6366F1]' : 'bg-white/10'}`} />
                        <span className={`text-xs mt-2 block font-medium ${s <= step ? 'text-[#6366F1]' : 'text-gray-500'}`}>
                            {s === 1 ? 'Job Details' : s === 2 ? 'Requirements' : 'Review'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Form Section */}
            <motion.div 
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
            >
                <form className="space-y-6">
                    {/* Step 1: Job Details */}
                    {step === 1 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Job Title</label>
                                    <input 
                                        type="text" 
                                        defaultValue={formData.jobTitle}
                                        onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                                        placeholder="e.g. Senior Product Designer" 
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Department</label>
                                    <select 
                                        defaultValue={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all appearance-none"
                                    >
                                        <option>Engineering</option>
                                        <option>Design</option>
                                        <option>Marketing</option>
                                        <option>Sales</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Employment Type</label>
                                    <select 
                                        defaultValue={formData.jobType}
                                        onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all appearance-none"
                                    >
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Part-Time">Part-Time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Remote">Remote</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Location</label>
                                    <input 
                                        type="text" 
                                        defaultValue={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        placeholder="e.g. Remote / New York" 
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Job Description</label>
                                <textarea 
                                    rows="6"
                                    defaultValue={formData.jobDescription}
                                    onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
                                    placeholder="Describe the role, responsibilities, and what you're looking for..." 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all resize-none"
                                />
                            </div>
                        </>
                    )}

                    {/* Step 2: Requirements */}
                    {step === 2 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Experience (Years)</label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="number" 
                                            placeholder="Min"
                                            defaultValue={formData.experienceMin}
                                            onChange={(e) => setFormData({...formData, experienceMin: e.target.value})}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all"
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Max"
                                            defaultValue={formData.experienceMax}
                                            onChange={(e) => setFormData({...formData, experienceMax: e.target.value})}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Salary Range (Optional)</label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="number" 
                                            placeholder="Min"
                                            defaultValue={formData.salaryMin}
                                            onChange={(e) => setFormData({...formData, salaryMin: e.target.value})}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all"
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Max"
                                            defaultValue={formData.salaryMax}
                                            onChange={(e) => setFormData({...formData, salaryMax: e.target.value})}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Education Level</label>
                                <select 
                                    defaultValue={formData.education}
                                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all appearance-none"
                                >
                                    <option value="Any">Any</option>
                                    <option value="10th">10th</option>
                                    <option value="12th">12th</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Graduate">Graduate</option>
                                    <option value="Post-Graduate">Post-Graduate</option>
                                </select>
                            </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Application Deadline</label>
                                    <input 
                                        type="date" 
                                        defaultValue={formData.lastDate}
                                        onChange={(e) => setFormData({...formData, lastDate: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Required Skills</label>
                                    <textarea 
                                        rows="4"
                                        defaultValue={formData.requiredSkills}
                                        onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
                                        placeholder="e.g. React, Node.js, TypeScript (comma separated)"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Attachments (Optional)</label>
                                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#6366F1] transition-colors" />
                                        </div>
                                        <p className="text-sm text-gray-400">Drag & drop files here, or <span className="text-[#6366F1]">browse</span></p>
                                        <p className="text-xs text-gray-600 mt-1">PDF, DOCX up to 10MB</p>
                                    </div>
                                </div>
                        </>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-xl p-6 space-y-4">
                                <h3 className="text-xl font-bold text-white">Job Summary</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400 block">Title</span>
                                        <span className="text-white font-medium">{formData.jobTitle || "Untitled Job"}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Department</span>
                                        <span className="text-white font-medium">{formData.department}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Type</span>
                                        <span className="text-white font-medium">{formData.jobType}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Location</span>
                                        <span className="text-white font-medium">{formData.location || "Not specified"}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/5 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2">Description</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {formData.jobDescription || "No description provided."}
                                </p>
                            </div>

                            <div className="bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl p-4 flex gap-3 text-sm text-[#6366F1]">
                                <Check className="w-5 h-5 shrink-0" />
                                <p>Your job posting is ready to be published. You can edit this later from the active jobs dashboard.</p>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3 border-t border-white/10">
                        {step > 1 && (
                            <button 
                                type="button" 
                                onClick={prevStep}
                                className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
                            >
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button 
                                type="button" 
                                onClick={nextStep}
                                className="px-6 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#5558DD] text-white transition-colors font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                <span>Next Step</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                onClick={handlePublish}
                                disabled={loading}
                                className={`px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span>{loading ? 'Publishing...' : 'Publish Job'}</span>
                                {!loading && <Check className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
