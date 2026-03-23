"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Upload,
    FileText,
    Check,
    ChevronRight,
    Plus,
    Trash2,
    Briefcase,
    GraduationCap,
    Code,
    Link as LinkIcon,
    Globe,
    Cpu,
    Target,
    Phone,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

export default function ApplyPage() {
    const router = useRouter();
    const params = useParams();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        linkedin: "",
        portfolio: "",
        experience: [{ id: Date.now(), company: "", role: "", duration: "", description: "" }],
        education: [{ id: Date.now(), institution: "", degree: "", year: "" }],
        skills: [""],
        projects: [{ id: Date.now(), name: "", link: "", description: "" }],
        coverLetter: "",
        yearsOfExperience: "",
        salary: "",
        phone: "",
        resumeName: "",
        resumeLink: ""
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedAppId, setSubmittedAppId] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const validateStep = (currentStep) => {
        const errors = {};
        if (currentStep === 1) {
            if (!formData.phone || formData.phone.trim().length < 10) {
                errors.phone = "Required (min 10 digits)";
            }
            if (!formData.resumeLink && !formData.resumeName) {
                errors.resume = "Required";
            }
        } else if (currentStep === 2) {
            if (!formData.yearsOfExperience || formData.yearsOfExperience === "") {
                errors.yearsOfExperience = "Required";
            }
        } else if (currentStep === 3) {
            const validSkills = formData.skills.filter(s => s && s.trim().length > 0);
            if (validSkills.length === 0) {
                errors.skills = "Required (Add at least one)";
            }
        } else if (currentStep === 4) {
            if (!formData.salary || formData.salary.trim() === "") {
                errors.salary = "Required";
            }
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const res = await axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/getProfile", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.success && res.data.data) {
                        const data = res.data.data;
                        setFormData(prev => ({
                            ...prev,
                            phone: data.phone || localStorage.getItem("userPhone") || "",
                            resumeName: localStorage.getItem(`resume_name_${data.email || localStorage.getItem("userEmail")}`) || "",
                            resumeLink: localStorage.getItem(`resume_url_${data.email || localStorage.getItem("userEmail")}`) || ""
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching user data for application:", err);
            }
        };
        fetchUserData();
    }, []);


    const totalSteps = 5;

    // Helper functions for dynamic lists
    const addEntry = (key, template) => {
        setFormData(prev => ({
            ...prev,
            [key]: [...prev[key], { ...template, id: Date.now() }]
        }));
    };

    const removeEntry = (key, id) => {
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].filter(item => item.id !== id)
        }));
    };

    const updateEntry = (key, id, field, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Final validation check for all steps
        let isValid = true;
        for (let i = 1; i <= 4; i++) {
            if (!validateStep(i)) {
                setStep(i); // Move to first step with error
                isValid = false;
                break;
            }
        }

        if (!isValid) return;

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const email = localStorage.getItem("userEmail");

            if (!token) {
                router.push("/login");
                return;
            }

            // Construct payload based on validation errors
            // 1. "Experience must be a number" -> Try to parse years or default to 0. 
            //    We should probably add a field for this, but for now let's derive/default.
            //    Or better, let's look for a years input. If not present, send 0 or valid number.
            //    Actually, let's parse a number from the first duration or just send 1 for now to pass validation.
            //    NOTE: Ideally we add a "Years of Experience" input. I will add one to state.

            // 2. Sanitize arrays
            const sanitizedEducation = formData.education.map(({ id, ...rest }) => rest);

            const sanitizedProjects = formData.projects.map(({ id, name, link, description, ...rest }) => ({
                projectName: name, // Remap name -> projectName
                description: link ? `${description} (Link: ${link})` : description, // Merge link
                ...rest
            }));

            const payload = {
                job: params.id,
                email: email,
                name: localStorage.getItem("userName") || "Candidate",
                phone: formData.phone || "0000000000",
                phoneNumber: formData.phone, // Alternative
                resumeName: formData.resumeName || localStorage.getItem(`resume_name_${email}`) || "resume.pdf",
                resume: formData.resumeLink || localStorage.getItem(`resume_url_${email}`) || "https://example.com/resume.pdf",
                status: "Applied",

                experience: parseInt(formData.yearsOfExperience) || 0, // Fallback to number for total years
                totalExperience: parseInt(formData.yearsOfExperience) || 0,
                experienceYears: parseInt(formData.yearsOfExperience) || 0,
                
                experienceList: formData.experience.map(({ id, ...rest }) => rest), // Detailed array in new field
                education: sanitizedEducation,
                skills: formData.skills,
                projects: sanitizedProjects,
                salaryExpectation: formData.salary,
                salary: formData.salary, // More conventional
                links: {
                    linkedin: formData.linkedin,
                    portfolio: formData.portfolio
                }
            };

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${params.id}/apply`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Success
            if (response.data.success) {
                console.log("Application Submit Response Data:", response.data);
                // Extract Application ID robustly
                const data = response.data.data || response.data.application || response.data;
                const appId = data._id || data.id || (data.application ? data.application._id : null);

                if (appId) {
                    setSubmittedAppId(appId);
                } else {
                    console.error("Could not find Application ID in response:", response.data);
                }

                setIsSubmitted(true);
            } else {
                router.push("/candidate/applications");
            }

        } catch (err) {
            console.error("Application error:", err);

            if (err.response && err.response.status === 409) {
                setError("You have already applied for this job.");
            } else {
                setError(err.response?.data?.message || err.message || "Failed to submit application");
            }
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 px-4">
            <Link href={`/candidate/jobs/${params.id || 1}`}>
                <button className="flex items-center gap-2 text-[#71717A] hover:text-[#7C5CFC] transition-all font-semibold group/back">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover/back:-translate-x-1" />
                    Back to Job Details
                </button>
            </Link>

            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-[#080808]">
                    Apply to <span className="text-[#7C5CFC]">TechFlow</span>
                </h1>
                <div className="flex items-center gap-3">
                    <p className="text-[#71717A] font-medium flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#7C5CFC]" />
                        Senior Product Designer • Remote
                    </p>
                </div>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center gap-6 mb-12">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-3">
                        <div className="h-2 bg-[#F4F7FE] rounded-full overflow-hidden border border-[#F1F1F1] shadow-inner">
                            <motion.div
                                initial={false}
                                animate={{ width: step > i ? "100%" : step === i + 1 ? "50%" : "0%" }}
                                className={`h-full ${step > i ? "bg-green-500" : "bg-[#7C5CFC]"}`}
                            />
                        </div>
                        <span className={`text-[11px] uppercase tracking-widest font-bold ${step >= i + 1 ? "text-[#7C5CFC]" : "text-[#71717A]"}`}>
                            Step {i + 1}
                        </span>
                    </div>
                ))}
            </div>

            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-[#F1F1F1] rounded-[32px] p-10 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden"
            >
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#F4F7FE] rounded-full blur-3xl pointer-events-none" />

                {isSubmitted ? (
                    <div className="text-center py-16 space-y-8">
                        <div className="w-32 h-32 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-8 shadow-[0px_10px_30px_rgba(34,197,94,0.1)] animate-bounce-slow">
                            <Check className="w-16 h-16 text-green-500" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-4xl font-bold text-[#080808]">Application Submitted!</h2>
                            <p className="text-[#71717A] max-w-md mx-auto font-medium text-lg">
                                Your application has been successfully received. We'll notify you as soon as there's an update.
                            </p>
                        </div>

                        <div className="pt-8 flex flex-col items-center gap-4">
                            <Link href="/candidate/applications" className="w-full max-w-xs">
                                <button className="w-full py-4 bg-[#7C5CFC] hover:bg-[#6b4ce6] text-white rounded-[16px] font-bold transition-all shadow-lg">
                                    Track Application
                                </button>
                            </Link>
                            <Link href="/candidate/dashboard">
                                <button className="text-[#71717A] hover:text-[#7C5CFC] transition-colors font-bold text-sm">
                                    Return to Home
                                </button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Global step validation error */}
                        {Object.keys(validationErrors).length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 font-bold mb-6"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm">Please fill all required fields to proceed.</p>
                            </motion.div>
                        )}

                        {/* STEP 1: CONTACT & SOCIALS */}
                        {step === 1 && (
                            <div className="space-y-10">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-[#080808]">Social & Professional Links</h2>
                                    <p className="text-[#71717A] font-medium">Let HR find your professional presence online.</p>
                                </div>

                                <div className="p-8 rounded-[24px] bg-[#F4F7FE]/50 border border-[#F1F1F1] flex items-center justify-between group hover:border-[#7C5CFC]/30 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-white rounded-[16px] shadow-sm group-hover:scale-110 transition-transform">
                                            <FileText className="w-7 h-7 text-[#7C5CFC]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#080808] text-lg">{formData.resumeName || "No Resume Uploaded"}</p>
                                            <p className={`text-sm font-medium ${validationErrors.resume ? "text-red-500" : "text-[#71717A]"}`}>
                                                {validationErrors.resume ? "Required: Please upload your resume" : (formData.resumeName ? "Successfully attached to application" : "Please upload your resume")}
                                            </p>
                                        </div>
                                    </div>
                                    <label className="text-sm font-bold text-[#7C5CFC] hover:bg-[#EBE8FF] px-5 py-2.5 rounded-[12px] transition-all border border-transparent hover:border-[#7C5CFC]/20 cursor-pointer">
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if(file) {
                                                    setFormData({...formData, resumeName: file.name, resumeLink: URL.createObjectURL(file)});
                                                    if (validationErrors.resume) setValidationErrors({...validationErrors, resume: ""});
                                                }
                                            }}
                                        />
                                        {formData.resumeName ? "Change" : "Upload"}
                                    </label>
                                </div>
                                {validationErrors.resume && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{validationErrors.resume}</p>}

                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-[#71717A] flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-[#7C5CFC]" />
                                            Phone Number <span className="text-red-500 font-black">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                setFormData({ ...formData, phone: e.target.value });
                                                if (validationErrors.phone) setValidationErrors({...validationErrors, phone: ""});
                                            }}
                                            placeholder="Your mobile number"
                                            className={`w-full bg-[#F4F7FE]/30 border ${validationErrors.phone ? "border-red-500" : "border-[#F1F1F1]"} rounded-[16px] px-6 py-4 text-[#080808] font-medium focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white transition-all outline-none`}
                                        />
                                        {validationErrors.phone && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{validationErrors.phone}</p>}
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-[#71717A] flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4 text-[#7C5CFC]" />
                                            LinkedIn Profile
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                            placeholder="https://linkedin.com/in/..."
                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] font-medium focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-[#71717A] flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-[#7C5CFC]" />
                                            Portfolio Website
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.portfolio}
                                            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                                            placeholder="https://yourportfolio.com"
                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] font-medium focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: EXPERIENCE & EDUCATION */}
                        {step === 2 && (
                            <div className="space-y-12">
                                {/* Experience Section */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#080808] mb-1 flex items-center gap-3">
                                                <div className="p-2 bg-[#F4F7FE] rounded-lg">
                                                    <Briefcase className="w-6 h-6 text-[#7C5CFC]" />
                                                </div>
                                                Work Experience
                                            </h2>
                                            <p className="text-[#71717A] text-sm font-medium">Add your relevant career history.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addEntry('experience', { company: "", role: "", duration: "", description: "" })}
                                            className="p-3 rounded-[12px] bg-[#7C5CFC]/10 text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white transition-all shadow-sm"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                    
                                    <div className="bg-[#F4F7FE]/30 p-6 rounded-[24px] border border-[#F1F1F1] border-dashed">
                                        <label className="text-sm font-bold text-[#71717A] mb-3 block">
                                            Total Years of Experience <span className="text-red-500 font-black">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="e.g. 5"
                                            value={formData.yearsOfExperience}
                                            onChange={(e) => {
                                                setFormData({ ...formData, yearsOfExperience: e.target.value });
                                                if (validationErrors.yearsOfExperience) setValidationErrors({...validationErrors, yearsOfExperience: ""});
                                            }}
                                            className={`w-full md:w-1/3 bg-white border ${validationErrors.yearsOfExperience ? "border-red-500" : "border-[#F1F1F1]"} rounded-[16px] px-6 py-4 text-[#080808] font-bold focus:ring-2 focus:ring-[#7C5CFC]/20 outline-none shadow-sm transition-all`}
                                        />
                                        {validationErrors.yearsOfExperience && <p className="text-red-500 text-xs font-bold mt-2">{validationErrors.yearsOfExperience}</p>}
                                    </div>

                                    <div className="space-y-8">
                                        {formData.experience.map((exp, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                key={exp.id}
                                                className="p-8 rounded-[24px] bg-white border border-[#F1F1F1] relative group hover:border-[#7C5CFC]/20 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.02)]"
                                            >
                                                {formData.experience.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEntry('experience', exp.id)}
                                                        className="absolute -top-3 -right-3 p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg border border-red-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Company Name</label>
                                                        <input
                                                            placeholder="e.g. Google"
                                                            value={exp.company}
                                                            onChange={(e) => updateEntry('experience', exp.id, 'company', e.target.value)}
                                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] font-medium focus:ring-2 focus:ring-[#7C5CFC]/20 outline-none transition-all focus:bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Your Role</label>
                                                        <input
                                                            placeholder="e.g. Senior UI Designer"
                                                            value={exp.role}
                                                            onChange={(e) => updateEntry('experience', exp.id, 'role', e.target.value)}
                                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] font-medium focus:ring-2 focus:ring-[#7C5CFC]/20 outline-none transition-all focus:bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 mb-6">
                                                    <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Duration</label>
                                                    <input
                                                        placeholder="e.g. 2021 - Present"
                                                        value={exp.duration}
                                                        onChange={(e) => updateEntry('experience', exp.id, 'duration', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] font-medium focus:ring-2 focus:ring-[#7C5CFC]/20 outline-none transition-all focus:bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Description</label>
                                                    <textarea
                                                        placeholder="Key accomplishments..."
                                                        value={exp.description}
                                                        onChange={(e) => updateEntry('experience', exp.id, 'description', e.target.value)}
                                                        rows="3"
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] font-medium focus:ring-2 focus:ring-[#7C5CFC]/20 outline-none resize-none transition-all focus:bg-white"
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Education Section */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold text-[#080808] flex items-center gap-3">
                                            <div className="p-2 bg-[#F4F7FE] rounded-lg">
                                                <GraduationCap className="w-6 h-6 text-[#7C5CFC]" />
                                            </div>
                                            Education
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => addEntry('education', { institution: "", degree: "", year: "" })}
                                            className="p-3 rounded-[12px] bg-[#7C5CFC]/10 text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white transition-all shadow-sm"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {formData.education.map((edu) => (
                                            <div key={edu.id} className="p-8 rounded-[24px] bg-white border border-[#F1F1F1] relative group hover:border-[#7C5CFC]/20 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
                                                {formData.education.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEntry('education', edu.id)}
                                                        className="absolute top-4 right-4 text-[#71717A] hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <div className="grid md:grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Institution</label>
                                                        <input
                                                            placeholder="e.g. Stanford University"
                                                            value={edu.institution}
                                                            onChange={(e) => updateEntry('education', edu.id, 'institution', e.target.value)}
                                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Degree</label>
                                                        <input
                                                            placeholder="e.g. Master in Design"
                                                            value={edu.degree}
                                                            onChange={(e) => updateEntry('education', edu.id, 'degree', e.target.value)}
                                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Year</label>
                                                        <input
                                                            placeholder="e.g. 2021"
                                                            value={edu.year}
                                                            onChange={(e) => updateEntry('education', edu.id, 'year', e.target.value)}
                                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SKILLS & PROJECTS */}
                        {step === 3 && (
                            <div className="space-y-12">
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-bold text-[#080808] flex items-center gap-3">
                                        <div className="p-2 bg-[#F4F7FE] rounded-lg">
                                            <Cpu className="w-6 h-6 text-[#7C5CFC]" />
                                        </div>
                                        Technical Skills <span className="text-red-500 font-black">*</span>
                                    </h2>
                                    <div className="flex flex-wrap gap-4 p-8 rounded-[32px] bg-[#F4F7FE]/30 border border-[#F1F1F1] border-dashed">
                                        {formData.skills.map((skill, idx) => (
                                            <div key={idx} className="flex-1 min-w-[180px] relative group/skill">
                                                <input
                                                    value={skill}
                                                    onChange={(e) => {
                                                        const newSkills = [...formData.skills];
                                                        newSkills[idx] = e.target.value;
                                                        setFormData({ ...formData, skills: newSkills });
                                                        if (validationErrors.skills) setValidationErrors({...validationErrors, skills: ""});
                                                    }}
                                                    placeholder="e.g. React.js"
                                                    className={`w-full bg-white border ${validationErrors.skills ? "border-red-500" : "border-[#F1F1F1]"} rounded-[16px] px-6 py-3.5 text-[#080808] font-bold text-sm outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:border-[#7C5CFC]/30 shadow-sm transition-all`}
                                                />
                                                {formData.skills.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== idx) })}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[12px] opacity-0 group-hover/skill:opacity-100 transition-all shadow-lg"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, skills: [...formData.skills, ""] })}
                                            className="px-6 py-3.5 rounded-[16px] bg-white border border-dashed border-[#F1F1F1] text-[#71717A] font-bold hover:text-[#7C5CFC] hover:border-[#7C5CFC]/30 transition-all text-sm shadow-sm flex items-center gap-2 group/add"
                                        >
                                            <Plus className="w-4 h-4 transition-transform group-hover/add:rotate-90" />
                                            Add Skill
                                        </button>
                                    </div>
                                    {validationErrors.skills && <p className="text-red-500 text-sm font-bold">{validationErrors.skills}</p>}
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold text-[#080808] flex items-center gap-3">
                                            <div className="p-2 bg-[#F4F7FE] rounded-lg">
                                                <Code className="w-6 h-6 text-[#7C5CFC]" />
                                            </div>
                                            Featured Projects
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => addEntry('projects', { name: "", link: "", description: "" })}
                                            className="p-3 rounded-[12px] bg-[#7C5CFC]/10 text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white transition-all shadow-sm"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {formData.projects.map((proj) => (
                                            <div key={proj.id} className="p-8 rounded-[24px] bg-white border border-[#F1F1F1] relative group hover:border-[#7C5CFC]/20 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
                                                <button
                                                    type="button"
                                                    onClick={() => removeEntry('projects', proj.id)}
                                                    className="absolute top-4 right-4 text-[#71717A] hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="space-y-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Project Name</label>
                                                        <input
                                                            placeholder="e.g. AI Portfolio"
                                                            value={proj.name}
                                                            onChange={(e) => updateEntry('projects', proj.id, 'name', e.target.value)}
                                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] font-bold outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Link</label>
                                                        <input
                                                            placeholder="e.g. github.com/username/project"
                                                            value={proj.link}
                                                            onChange={(e) => updateEntry('projects', proj.id, 'link', e.target.value)}
                                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] text-sm outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Brief Description</label>
                                                        <textarea
                                                            placeholder="What did you build?"
                                                            value={proj.description}
                                                            onChange={(e) => updateEntry('projects', proj.id, 'description', e.target.value)}
                                                            rows="3"
                                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[16px] px-6 py-4 text-[#080808] text-sm outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: COVER LETTER & QUESTIONS */}
                        {step === 4 && (
                            <div className="space-y-10">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-[#080808]">Final Details</h2>
                                    <p className="text-[#71717A] font-medium">Tell us something the resume doesn't show.</p>
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-[#71717A]">Cover Letter (Optional)</label>
                                        <textarea
                                            rows="8"
                                            value={formData.coverLetter}
                                            onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                            placeholder="Dear Hiring Manager..."
                                            className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-[24px] px-8 py-6 text-[#080808] font-medium focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white transition-all outline-none resize-none"
                                        />
                                    </div>
                                    <div className="space-y-3 max-w-md">
                                        <label className="text-sm font-bold text-[#71717A]">
                                            Desired Salary Range <span className="text-red-500 font-black">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.salary}
                                            onChange={(e) => {
                                                setFormData({ ...formData, salary: e.target.value });
                                                if (validationErrors.salary) setValidationErrors({...validationErrors, salary: ""});
                                            }}
                                            placeholder="e.g. ₹20,00,000 - ₹25,00,000"
                                            className={`w-full bg-[#F4F7FE]/30 border ${validationErrors.salary ? "border-red-500" : "border-[#F1F1F1]"} rounded-[16px] px-6 py-4 text-[#080808] font-bold outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:bg-white transition-all shadow-sm`}
                                        />
                                        {validationErrors.salary && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{validationErrors.salary}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: REVIEW & SUBMIT */}
                        {step === 5 && (
                            <div className="space-y-10">
                                <div className="text-center py-6">
                                    <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <Check className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-[#080808] mb-2">Review & Submit</h2>
                                    <p className="text-[#71717A] font-medium">Double-check your information before finalizing.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="p-8 rounded-[24px] bg-[#F4F7FE]/30 border border-[#F1F1F1] space-y-5">
                                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7C5CFC]">Application Roadmap</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">1</div>
                                                <p className="text-sm text-[#080808] font-bold">Submit Application</p>
                                            </div>
                                            <div className="flex items-center gap-4 opacity-50">
                                                <div className="w-8 h-8 rounded-full bg-white border border-[#F1F1F1] text-[#71717A] flex items-center justify-center text-xs font-bold shadow-sm">2</div>
                                                <p className="text-sm text-[#71717A] font-bold">HR Review</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[24px] bg-[#F4F7FE]/30 border border-[#F1F1F1] space-y-5">
                                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7C5CFC]">Current Role</h4>
                                        <div className="space-y-3">
                                            {formData.experience.slice(0, 2).map((exp, i) => (
                                                <div key={i} className="flex flex-col">
                                                    <p className="font-bold text-[#080808] text-sm">{exp.role || "Role"}</p>
                                                    <p className="text-[#71717A] text-xs font-medium">{exp.company || "Company"}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[24px] bg-[#F4F7FE]/30 border border-[#F1F1F1] space-y-5">
                                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7C5CFC]">Skills Highlight</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.skills.filter(s => s).slice(0, 6).map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-white text-[#7C5CFC] text-[11px] font-bold rounded-full border border-[#F1F1F1] shadow-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[24px] bg-[#F4F7FE]/30 border border-[#F1F1F1] space-y-4">
                                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7C5CFC]">Digital Prescence</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-[#71717A] font-bold">LinkedIn</span>
                                                <span className={`font-bold ${formData.linkedin ? "text-[#080808]" : "text-gray-300 italic"}`}>{formData.linkedin ? "Connected" : "Not Provided"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-[#71717A] font-bold">Portfolio</span>
                                                <span className={`font-bold ${formData.portfolio ? "text-[#080808]" : "text-gray-300 italic"}`}>{formData.portfolio ? "Connected" : "Not Provided"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-xs text-text-muted px-8 leading-relaxed">
                                    By clicking submit, you agree to हमारी terms are you sure all details correct?
                                </p>
                            </div>
                        )}

                        <div className="flex justify-between pt-10 border-t border-[#F1F1F1] mt-10">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="px-8 py-4 rounded-[16px] border border-[#F1F1F1] text-[#080808] hover:bg-[#F4F7FE] transition-all font-bold flex items-center gap-3 shadow-sm"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {step < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (validateStep(step)) {
                                            setStep(step + 1);
                                        }
                                    }}
                                    className="px-10 py-4 rounded-[16px] bg-[#7C5CFC] hover:bg-[#6b4ce6] text-white transition-all font-bold flex items-center gap-3 shadow-lg group"
                                >
                                    <span>Continue</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-12 py-4 rounded-[16px] bg-[#7C5CFC] hover:bg-[#6b4ce6] text-white transition-all font-bold flex items-center gap-3 shadow-lg active:scale-95 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                    >
                                        <span>{loading ? "Processing..." : "Submit Application"}</span>
                                        {!loading && <Check className="w-5 h-5" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                )}

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
                        <p>{error}</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

