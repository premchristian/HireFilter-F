"use client";

import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, MapPin, Globe, Loader2, Download, Briefcase, GraduationCap, FileText, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useJobContext } from "@/context/JobContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ApplicantDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { getJobById } = useJobContext();
    const [job, setJob] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (params.jobId && params.applicantId) {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        router.push('/login');
                        return;
                    }
                    
                    // Fetch Job Details
                    const jobData = await getJobById(params.jobId);
                    setJob(jobData);

                    // Fetch Applicants to find the specific one
                    // Try to fetch single application if endpoint exists, otherwise fallback to getAll
                    let foundApp = null;
                    try {
                        const singleAppRes = await axios.get(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${params.applicantId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (singleAppRes.data.success && singleAppRes.data.data) {
                            foundApp = singleAppRes.data.data;
                            console.log("DEBUG: Fetched Single Application:", foundApp);
                        }
                    } catch (err) {
                        console.log("DEBUG: Single application fetch failed, falling back to getAll");
                    }

                    if (!foundApp) {
                        const appResponse = await axios.get(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${params.jobId}/getAll`,
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        );
                        
                        if (appResponse.data.success && appResponse.data.data) {
                            const allApps = appResponse.data.data;
                            foundApp = allApps.find(app => (app._id === params.applicantId || app.id === params.applicantId));
                            console.log("DEBUG: Found Application in getAll list:", foundApp);
                        }
                    }

                    // Attempt to fetch Candidate Uploads
                    let candidateUploads = null;
                    if (foundApp && foundApp.user) {
                        try {
                            const userId = foundApp.user._id || foundApp.user.id;
                            const uploadsRes = await axios.get(
                                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/my-uploads?userId=${userId}`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            if (uploadsRes.data && (uploadsRes.data.success || uploadsRes.data.data)) {
                                candidateUploads = uploadsRes.data.data || uploadsRes.data;
                                console.log("DEBUG: Fetched Candidate Uploads:", candidateUploads);
                            }
                        } catch (err) {
                            console.error("DEBUG: Failed to fetch candidate uploads", err);
                        }
                    }

                    setApplication({ ...foundApp, candidateUploads });
                } catch (error) {
                    console.error("Error fetching data:", error);
                    console.log("Error details:", error.response?.data);
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
    }, [params.jobId, params.applicantId, getJobById, router]);

    const handleUpdateStatus = async (newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const appId = application._id || application.id;
            const statusValue = newStatus.toLowerCase();
            await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${appId}/status`, 
                { status: statusValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setApplication(prev => ({ ...prev, status: newStatus }));
            alert(`Applicant status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating status:", error);
            console.log("Error details:", error.response?.data);
            alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh] text-[#080808]">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C5CFC]" />
            </div>
        );
    }

    if (!job || !application) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-[#080808] mb-4">Applicant Not Found</h2>
                <Link href={`/hr/applicants/${params.jobId}`}>
                    <button className="px-6 py-2 bg-[#7C5CFC] text-white rounded-[12px] hover:bg-[#6A4FE0] transition-colors shadow-[0px_4px_20px_rgba(124,92,252,0.3)]">
                         Back to Applicants
                    </button>
                </Link>
            </div>
        );
    }

    const applicantUser = application.user || {};
    const profile = applicantUser.profile || {};
    const address = applicantUser.currentAddress || {};
    
    // Pull submitted data first, fallback to profile/user if missing
    const name = application.name || applicantUser.name || "Unknown Candidate";
    const email = application.email || applicantUser.email || "No email provided";
    const phone = application.phone || application.phoneNumber || applicantUser.phone || "No phone provided";
    
    const skills = application.skills && application.skills.length > 0 ? application.skills : (profile.skills || []);
    const bio = application.coverLetter || profile.bio || "No professional bio or cover letter provided.";
    
    // Arrays for Experience and Education submitted during the application
    // Check multiple possible field names for experience list
    const experienceList = Array.isArray(application.experience) ? application.experience : (Array.isArray(application.experienceList) ? application.experienceList : []);
    const educationList = application.education || [];
    const projectsList = application.projects || [];
    
    const expectedSalary = application.salaryExpectation || application.salary || "Not specified";
    // Check for totalExperience field first, fallback to number in experience field or profile
    const totalExperienceYears = application.totalExperience !== undefined ? application.totalExperience : (application.experienceYears !== undefined ? application.experienceYears : (typeof application.experience === 'number' ? application.experience : profile.experience || 0));
    
    const submittedLinks = application.links || {};
    const linkedin = submittedLinks.linkedin || profile.linkedin || "";
    const portfolio = submittedLinks.portfolio || profile.portfolio || "";
    
    const getImgUrl = (img) => {
        if (!img) return null;
        if (typeof img === "string") return img;
        return img.url || img.imageUrl || img.secure_url || null;
    };
    
    const avatarUrl = getImgUrl(application.profileImage) || getImgUrl(applicantUser.profileImage) || getImgUrl(profile.image) || getImgUrl(applicantUser.avatar);
    
    // Resume Extraction
    const getResumeUrl = (res) => {
        if (!res) return null;
        if (typeof res === "string" && res.startsWith("http")) return res;
        return res.url || res.fileUrl || res.secure_url || null;
    };
    
    // Fallback order: the application user's uploads -> the application payload -> the candidate profile directly -> the base user object
    const candidateUploads = application.candidateUploads || {};
    const resumeFromUploads = getResumeUrl(candidateUploads.resume);
    const resumeFromApp = getResumeUrl(application.resume);
    const resumeFromProfile = getResumeUrl(profile.resume);
    const resumeFromUser = getResumeUrl(applicantUser.resume);

    console.log("DEBUG: Resume Sources:", {
        fromUploads: resumeFromUploads,
        fromApp: resumeFromApp,
        fromProfile: resumeFromProfile,
        fromUser: resumeFromUser
    });

    const resumeUrl = resumeFromUploads || resumeFromApp || resumeFromProfile || resumeFromUser;
    console.log("DEBUG: Final Resume URL:", resumeUrl);
    let resumeName = candidateUploads.resumeName || application.resumeName || profile.resumeName || applicantUser.resumeName || "Applicant_Resume.pdf";
    console.log("DEBUG: Final Resume Name:", resumeName);
    if (typeof application.resume === 'object' && application.resume?.name) {
        resumeName = application.resume.name;
    } else if (candidateUploads.resume && typeof candidateUploads.resume === 'string') {
        resumeName = candidateUploads.resume.split('/').pop() || "resume.pdf";
    }
    
    const calculateScore = (candidateSkills, jobSkills) => {
        if (!jobSkills || jobSkills.length === 0) return 0;
        if (!candidateSkills || candidateSkills.length === 0) return 0;
        const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
        const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase().trim());
        const matchedSkills = normalizedJobSkills.filter(skill => normalizedCandidateSkills.includes(skill));
        return Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);
    };

    const matchScore = calculateScore(skills, job.skills);

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                     <Link href={`/hr/applicants/${params.jobId}`}>
                        <button className="p-2 hover:bg-[#F4F7FE] rounded-[12px] transition-colors text-[#71717A] hover:text-[#080808]">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#080808]">
                            Applicant Profile
                        </h1>
                        <p className="text-[#71717A] mt-1">Applying for: <span className="text-[#080808] font-bold">{job.title}</span></p>
                    </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-3 bg-[#FFFFFF] p-2 rounded-[16px] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={() => handleUpdateStatus('Shortlisted')}
                        className={`px-4 py-2 rounded-[12px] text-sm font-bold flex items-center gap-2 transition-all ${application.status?.toLowerCase() === 'shortlisted' ? 'bg-[#EFFFED] text-success shadow-[0px_4px_20px_rgba(39,192,82,0.15)] border border-success/20' : 'text-[#71717A] hover:bg-[#EFFFED] hover:text-success border border-transparent'}`}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Shortlist
                    </button>
                    <button 
                        onClick={() => handleUpdateStatus('Rejected')}
                        className={`px-4 py-2 rounded-[12px] text-sm font-bold flex items-center gap-2 transition-all ${application.status?.toLowerCase() === 'rejected' ? 'bg-[#FFEDE1] text-[#FF5C5C] shadow-[0px_4px_20px_rgba(255,92,92,0.15)] border border-[#FF5C5C]/20' : 'text-[#71717A] hover:bg-[#FFEDE1] hover:text-[#FF5C5C] border border-transparent'}`}
                    >
                        <XCircle className="w-4 h-4" />
                        Reject
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBE8FF] rounded-full blur-3xl" />
                        
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-24 h-24 rounded-full bg-[#EBE8FF] flex items-center justify-center text-3xl font-bold text-[#7C5CFC] uppercase shadow-[0px_4px_20px_rgba(0,0,0,0.05)] mb-4 border-4 border-[#FFFFFF] overflow-hidden">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    name.charAt(0)
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-[#080808]">{name}</h2>
                                 {application.status && (
                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                        application.status.toLowerCase() === 'hired' ? 'bg-[#EFFFED] text-success border-success/20' :
                                        application.status.toLowerCase() === 'offer' ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]/20' :
                                        application.status.toLowerCase() === 'interviewing' ? 'bg-blue-50 text-blue-500 border-blue-500/20' :
                                        application.status.toLowerCase() === 'shortlisted' ? 'bg-[#EBE8FF] text-[#7C5CFC] border-[#7C5CFC]/20' :
                                        application.status.toLowerCase() === 'rejected' ? 'bg-[#FFEDE1] text-[#FF5C5C] border-[#FF5C5C]/20' :
                                        'bg-[#F4F7FE] text-[#71717A] border-[#F1F1F1]'
                                    }`}>
                                        {application.status}
                                    </div>
                                )}
                            </div>
                            <p className="text-[#7C5CFC] font-medium mt-1">{applicantUser.role || "Candidate"}</p>
                            
                            <div className="mt-4 inline-flex items-center px-3 py-1 bg-[#F4F7FE] border border-[#F1F1F1] rounded-[8px] text-sm text-[#71717A] font-medium">
                                Applied: {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Unknown'}
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-[#71717A]">
                                <Mail className="w-5 h-5 opacity-70" />
                                <span className="text-sm truncate">{email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#71717A]">
                                <Phone className="w-5 h-5 opacity-70" />
                                <span className="text-sm">{phone}</span>
                            </div>
                            {address.city && (
                                <div className="flex items-center gap-3 text-[#71717A]">
                                    <MapPin className="w-5 h-5 opacity-70" />
                                    <span className="text-sm">{address.city}{address.state ? `, ${address.state}` : ''}</span>
                                </div>
                            )}
                            {linkedin && (
                                <div className="flex items-center gap-3 text-[#71717A]">
                                    <Globe className="w-5 h-5 opacity-70" />
                                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-[#7C5CFC] hover:underline truncate">
                                        LinkedIn Profile
                                    </a>
                                </div>
                            )}
                            {portfolio && (
                                <div className="flex items-center gap-3 text-[#71717A]">
                                    <Globe className="w-5 h-5 opacity-70" />
                                    <a href={portfolio} target="_blank" rel="noopener noreferrer" className="text-sm text-[#7C5CFC] hover:underline truncate">
                                        Portfolio
                                    </a>
                                </div>
                            )}
                            {expectedSalary && expectedSalary !== "Not specified" && (
                                <div className="flex items-center gap-3 text-[#71717A]">
                                    <Briefcase className="w-5 h-5 opacity-70" />
                                    <span className="text-sm font-medium">Expected Salary: {expectedSalary}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Score Card */}
                    <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 text-center shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                        <h3 className="text-[#71717A] font-bold mb-4 uppercase text-sm tracking-wider">Fit Score</h3>
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[#F4F7FE]" />
                                <circle 
                                    cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                    className={`${matchScore >= 75 ? 'text-[#27C052]' : matchScore >= 50 ? 'text-[#FFD66B]' : 'text-[#FF5C5C]'} transition-all duration-1000 ease-out`}
                                    strokeDasharray={351.86} 
                                    strokeDashoffset={351.86 - (351.86 * matchScore) / 100}
                                />
                            </svg>
                            <span className="absolute text-3xl font-bold text-[#080808]">{matchScore}%</span>
                        </div>
                        <p className="text-sm text-[#71717A] mt-4 px-2 font-medium">Based on required skills overlap</p>
                    </div>
                </div>

                {/* Right Column (Detailed Details) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Bio Section */}
                    <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                        <h3 className="text-xl font-bold text-[#080808] mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#7C5CFC]" />
                            Cover Letter / Bio
                        </h3>
                        <p className="text-[#71717A] text-sm leading-relaxed whitespace-pre-wrap font-medium">
                            {bio}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Experience */}
                        <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-center min-h-[140px]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[#080808] flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-[#7C5CFC]" />
                                    Experience
                                </h3>
                                <span className="text-xs bg-[#EBE8FF] px-3 py-1.5 rounded-[8px] text-[#7C5CFC] border border-[#7C5CFC]/20 font-bold">
                                    {totalExperienceYears} Yrs Total
                                </span>
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col min-h-[140px]">
                            <h3 className="text-lg font-bold text-[#080808] mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-[#7C5CFC]" />
                                Education
                            </h3>
                            <div className="space-y-4 flex-1">
                                {Array.isArray(educationList) && educationList.length > 0 ? (
                                    educationList.map((edu, idx) => (
                                        <div key={idx} className="border-l-2 border-[#F1F1F1] pl-4 py-1">
                                            <h4 className="font-bold text-[#080808]">{edu.degree || "Degree"}</h4>
                                            <p className="text-sm text-[#7C5CFC] font-medium">{edu.institution || "Institution"}</p>
                                            <p className="text-xs text-[#71717A] mt-1">{edu.year || ""}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-[#71717A] italic">
                                        {typeof educationList === 'string' && educationList ? educationList : "No education details provided."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Projects Section (if any) */}
                    {projectsList && projectsList.length > 0 && (
                        <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                            <h3 className="text-xl font-bold text-[#080808] mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-[#7C5CFC]" />
                                Projects
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projectsList.map((proj, idx) => (
                                    <div key={idx} className="bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] p-4">
                                        <h4 className="font-bold text-[#080808]">{proj.projectName || "Project"}</h4>
                                        <p className="text-xs text-[#71717A] mt-2 leading-relaxed">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills Breakdown */}
                    <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                        <h3 className="text-xl font-bold text-[#080808] mb-4">Skills & Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.length > 0 ? skills.map((skill, index) => {
                                const isMatched = job.skills?.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                                return (
                                    <span 
                                        key={index}
                                        className={`px-3 py-1.5 rounded-[8px] text-sm font-bold border ${
                                            isMatched 
                                                ? 'bg-[#EFFFED] text-[#27C052] border-[#27C052]/20 shadow-[0px_4px_20px_rgba(39,192,82,0.05)]' 
                                                : 'bg-[#F4F7FE] text-[#71717A] border-[#F1F1F1]'
                                        }`}
                                    >
                                        {skill}
                                    </span>
                                );
                            }) : (
                                <p className="text-[#71717A] text-sm font-medium">No specific skills listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                        <h3 className="text-xl font-bold text-[#080808] mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#7C5CFC]" />
                            Attachments
                        </h3>
                        
                        <div className="flex items-center justify-between p-4 bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[8px] bg-[#EBE8FF] flex items-center justify-center text-[#7C5CFC]">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[#080808] font-bold text-sm truncate max-w-[200px]" title={resumeName}>{resumeName}</p>
                                    <p className="text-xs text-[#71717A] font-medium">Uploaded Document</p>
                                </div>
                            </div>
                            {resumeUrl ? (
                                <a 
                                    href={resumeUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    download={resumeName}
                                    className="px-4 py-2 bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white shadow-[0px_4px_20px_rgba(124,92,252,0.3)] rounded-[12px] transition-colors flex items-center gap-2 text-sm font-bold"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </a>
                            ) : (
                                <button disabled className="px-4 py-2 bg-[#F1F1F1] text-[#71717A] rounded-[12px] flex items-center gap-2 text-sm font-bold cursor-not-allowed">
                                    <FileText className="w-4 h-4" />
                                    No Resume
                                </button>
                            )}
                        </div>

                        {resumeUrl && (
                            <div className="mt-6 border border-[#F1F1F1] rounded-[16px] overflow-hidden bg-[#F8FAFC] shadow-inner">
                                <div className="bg-[#F8FAFC] px-6 py-3 border-b border-[#F1F1F1] flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#27C052]"></div>
                                        <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Live Document Preview</span>
                                    </div>
                                    <a 
                                        href={resumeUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold text-[#7C5CFC] hover:underline uppercase tracking-tighter"
                                    >
                                        Open in New Tab
                                    </a>
                                </div>
                                <div className="h-[800px] w-full bg-white relative">
                                    <iframe 
                                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
                                        className="w-full h-full border-none"
                                        title="Resume Preview"
                                    />
                                    {/* Fallback overlay for browsers that struggle with nested PDFs */}
                                    <div className="absolute bottom-4 right-4 md:hidden">
                                        <a 
                                            href={resumeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-white border border-[#F1F1F1] rounded-full shadow-lg text-[#7C5CFC]"
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

