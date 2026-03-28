"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobContext } from "@/context/JobContext";
import axios from "axios";

export default function CreateJobPage() {
    const router = useRouter();
    const { addJob } = useJobContext();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        jobTitle: "",
        department: "Engineering", // UI only
        jobType: "Full-Time", // Changed case to match API
        location: "",
        jobDescription: "",
        requiredSkills: "", // will convert to array on submit if needed, but keeping as string in form for now
        experienceMin: "",
        experienceMax: "",
        education: "Graduate", // Changed default to valid enum
        lastDate: "",
        salaryMin: "",
        salaryMax: "",
        // Exam Fields


    });

    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    
    const handlePublish = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You must be logged in to post a job.");
                router.push("/login"); // Optional: redirect to login
                return;
            }

            console.log("Submitting Job Form Data:", formData);

            // Transform data to match API schema
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
                    currency: "USD" // Default currency
                },
                education: formData.education, // Assumption: key is 'education'
                lastDate: formData.lastDate,
                // department: formData.department, // Removed: Not allowed by API
            };
            
            // Remove department from payload based on error message
            // payload.department = formData.department; 

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

            console.log("Job Create Response:", response);

            if (response.status === 201 || response.status === 200) {
                const newJobId = response.data.data?._id || response.data._id || response.data.data?.id; 
                console.log("Extracted New Job ID:", newJobId);
                

                

                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    // Force a full page reload to the new job page
                    window.location.href = `/hr/jobs/${newJobId}`;
                }, 2000);
            }
        } catch (error) {
            console.error("Error creating job:", error);
            // Log the validation errors if available
            if (error.response?.data?.errors) {
                console.log("Validation Errors:", error.response.data.errors);
                // Show more detailed errors to user
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
                <Link href="/hr/jobs">
                    <button className="p-2 hover:bg-[#F4F7FE] rounded-[12px] transition-colors text-[#71717A] hover:text-[#080808]">
                        <ArrowLeft className="w-5 h-5" suppressHydrationWarning />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-[#080808]">
                        Post a New Job
                    </h1>
                    <p className="text-[#71717A] mt-1">Create a comprehensive job posting to attract the best talent</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex-1">
                        <div className={`h-2 rounded-full transition-colors ${s <= step ? 'bg-[#7C5CFC]' : 'bg-[#F4F7FE]'}`} />
                        <span className={`text-xs mt-2 block font-medium ${s <= step ? 'text-[#7C5CFC]' : 'text-[#71717A]'}`}>
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
                className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
            >
                <form className="space-y-6">
                    {/* Step 1: Job Details */}
                    {step === 1 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#080808]">Job Title</label>
                                    <input 
                                        type="text" 
                                        defaultValue={formData.jobTitle}
                                        onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                                        placeholder="e.g. Senior Product Designer" 
                                        className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#080808]">Department</label>
                                    <select 
                                        defaultValue={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all appearance-none"
                                    >
                                        <option className="bg-[#FFFFFF] text-[#080808]">Engineering</option>
                                        <option className="bg-[#FFFFFF] text-[#080808]">IT</option>
                                        <option className="bg-[#FFFFFF] text-[#080808]">Design</option>
                                        <option className="bg-[#FFFFFF] text-[#080808]">Marketing</option>
                                        <option className="bg-[#FFFFFF] text-[#080808]">Sales</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#080808]">Employment Type</label>
                                    <select 
                                        defaultValue={formData.jobType}
                                        onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                                        className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all appearance-none"
                                    >
                                        <option value="Full-Time" className="bg-[#FFFFFF] text-[#080808]">Full-Time</option>
                                        <option value="Part-Time" className="bg-[#FFFFFF] text-[#080808]">Part-Time</option>
                                        <option value="Contract" className="bg-[#FFFFFF] text-[#080808]">Contract</option>
                                        <option value="Internship" className="bg-[#FFFFFF] text-[#080808]">Internship</option>
                                        <option value="Remote" className="bg-[#FFFFFF] text-[#080808]">Remote</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#080808]">Location</label>
                                    <input 
                                        type="text" 
                                        defaultValue={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        placeholder="e.g. Remote / New York" 
                                        className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#080808]">Job Description</label>
                                <textarea 
                                    rows="6"
                                    defaultValue={formData.jobDescription}
                                    onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
                                    placeholder="Describe the role, responsibilities, and what you're looking for..." 
                                    className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all resize-none"
                                />
                            </div>
                        </>
                    )}

                    {/* Step 2: Requirements */}
                    {step === 2 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#080808]">Experience (Years)</label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="number" 
                                            placeholder="Min"
                                            defaultValue={formData.experienceMin}
                                            onChange={(e) => setFormData({...formData, experienceMin: e.target.value})}
                                            className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all"
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Max"
                                            defaultValue={formData.experienceMax}
                                            onChange={(e) => setFormData({...formData, experienceMax: e.target.value})}
                                            className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#080808]">Salary Range (Optional)</label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="number" 
                                            placeholder="Min"
                                            defaultValue={formData.salaryMin}
                                            onChange={(e) => setFormData({...formData, salaryMin: e.target.value})}
                                            className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all"
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Max"
                                            defaultValue={formData.salaryMax}
                                            onChange={(e) => setFormData({...formData, salaryMax: e.target.value})}
                                            className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#080808]">Education Level</label>
                                <select 
                                    defaultValue={formData.education}
                                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                                    className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all appearance-none"
                                >
                                    <option value="Any" className="bg-[#FFFFFF] text-[#080808]">Any</option>
                                    <option value="10th" className="bg-[#FFFFFF] text-[#080808]">10th</option>
                                    <option value="12th" className="bg-[#FFFFFF] text-[#080808]">12th</option>
                                    <option value="Diploma" className="bg-[#FFFFFF] text-[#080808]">Diploma</option>
                                    <option value="Graduate" className="bg-[#FFFFFF] text-[#080808]">Graduate</option>
                                    <option value="Post-Graduate" className="bg-[#FFFFFF] text-[#080808]">Post-Graduate</option>
                                </select>
                            </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#080808]">Application Deadline</label>
                                    <input 
                                        type="date" 
                                        defaultValue={formData.lastDate}
                                        onChange={(e) => setFormData({...formData, lastDate: e.target.value})}
                                        className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#080808]">Required Skills</label>
                                    <textarea 
                                        rows="4"
                                        defaultValue={formData.requiredSkills}
                                        onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
                                        placeholder="e.g. React, Node.js, TypeScript (comma separated)"
                                        className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                        </>
                    )}



                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] p-6 space-y-4">
                                <h3 className="text-xl font-bold text-[#080808]">Job Summary</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-[#71717A] block">Title</span>
                                        <span className="text-[#080808] font-medium">{formData.jobTitle || "Untitled Job"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#71717A] block">Department</span>
                                        <span className="text-[#080808] font-medium">{formData.department}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#71717A] block">Type</span>
                                        <span className="text-[#080808] font-medium">{formData.jobType}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#71717A] block">Location</span>
                                        <span className="text-[#080808] font-medium">{formData.location || "Not specified"}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#F1F1F1] grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-[#71717A] block">Experience required</span>
                                        <span className="text-[#080808] font-medium">{formData.experienceMin} - {formData.experienceMax} Years</span>
                                    </div>
                                    <div>
                                        <span className="text-[#71717A] block">Salary Range</span>
                                        <span className="text-[#080808] font-medium">₹{formData.salaryMin} - ₹{formData.salaryMax}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#71717A] block">Education Level</span>
                                        <span className="text-[#080808] font-medium">{formData.education}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#71717A] block">Application Deadline</span>
                                        <span className="text-[#080808] font-medium">{formData.lastDate ? new Date(formData.lastDate).toLocaleDateString() : "Not set"}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] p-6">
                                <h3 className="text-lg font-bold text-[#080808] mb-2">Required Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {formData.requiredSkills ? formData.requiredSkills.split(",").map((skill, index) => (
                                        <span key={index} className="px-3 py-1 bg-[#EBE8FF] text-[#7C5CFC] border border-[#7C5CFC]/20 rounded-[8px] text-sm font-medium">
                                            {skill.trim()}
                                        </span>
                                    )) : <span className="text-[#71717A] text-sm">No skills specified</span>}
                                </div>
                            </div>
                            <div className="bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] p-6">
                                <h3 className="text-lg font-bold text-[#080808] mb-2">Description</h3>
                                <p className="text-[#71717A] text-sm leading-relaxed">
                                    {formData.jobDescription || "No description provided."}
                                </p>
                            </div>

                            <div className="bg-[#EBE8FF] border border-[#7C5CFC]/20 rounded-[12px] p-4 flex gap-3 text-sm text-[#7C5CFC]">
                                <Check className="w-5 h-5 shrink-0" suppressHydrationWarning />
                                <p>Your job posting is ready to be published. You can edit this later from the active jobs dashboard.</p>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3 border-t border-[#F1F1F1]">
                        {step > 1 && (
                            <button 
                                type="button" 
                                onClick={prevStep}
                                className="px-6 py-2.5 rounded-[12px] border border-[#F1F1F1] text-[#71717A] hover:bg-[#F4F7FE] hover:text-[#080808] transition-colors font-medium"
                            >
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button 
                                type="button" 
                                onClick={nextStep}
                                className="px-6 py-2.5 rounded-[12px] bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white transition-colors font-medium flex items-center gap-2 shadow-[0px_4px_20px_rgba(124,92,252,0.3)] border border-[#7C5CFC]"
                            >
                                <span>Next Step</span>
                                <ChevronRight className="w-4 h-4" suppressHydrationWarning />
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                onClick={handlePublish}
                                disabled={loading}
                                className={`px-6 py-2.5 rounded-[12px] bg-[#27C052] hover:bg-[#209F44] text-white transition-colors font-medium flex items-center gap-2 shadow-[0px_4px_20px_rgba(39,192,82,0.3)] border border-[#27C052] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span>{loading ? 'Publishing...' : 'Publish Job'}</span>
                                {!loading && <Check className="w-4 h-4" suppressHydrationWarning />}
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>

            {/* Success Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 font-medium"
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5" />
                        </div>
                        Job posted successfully!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
