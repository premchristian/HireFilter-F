"use client";

import { motion } from "framer-motion";
import { 
    Download, 
    Plus, 
    Trash2, 
    ArrowLeft, 
    Save, 
    Briefcase, 
    GraduationCap, 
    User, 
    Award,
    Eye,
    ChevronRight,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ResumeBuilderPage() {
    const resumeRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        fullName: "PATHY KRISHNA",
        address: "123 Anywhere Street, Any City, ST 12345",
        phone: "+123-456-7890",
        email: "hello@reallygreatsite.com",
        website: "www.reallygreatsite.com",
        professionalSummary: "Motivated Business student at the University of Connecticut with experience in data analysis, business operations, and information technology. Certified in Bloomberg Market Concepts and skilled in Excel, SQL, and SAS. Skilled in data-driven decision-making, developing analysis models and optimizing business practices.",
        education: [
            {
                institution: "University of Connecticut",
                location: "Storrs, CT",
                date: "May 2020",
                degree: "Bachelor of Science, Business",
                details: "Related Coursework: Database Systems, Computer Science, Operations Management, Management, Business Software Development\nGPA: 3.79/4.00"
            }
        ],
        experience: [
            {
                company: "The Travelers Company",
                location: "Hartford, CT",
                role: "Information Technology Intern",
                date: "January 2020 - Present",
                bullets: [
                    "Collaborate with a team of three staff members on an innovation project to determine a business practice model that will promote and improve operational systems between internal and external stakeholders",
                    "Review previous program contracts and develop an analysis model to assess future contracts within the department",
                    "Conduct research on current business solutions with clients to determine additional services to increase department revenue"
                ]
            },
            {
                company: "UConn Information Management Association",
                location: "Storrs, CT",
                role: "Vice President",
                date: "September 2020 - Present",
                bullets: [
                    "Collaborate with board members of the IMA to create programs and events for all participants throughout the year",
                    "Manage and facilitate meetings that focus on increasing members' awareness of careers and topics within the IT business industry",
                    "Organize networking and training opportunities with guest speakers including business professionals from a variety of industries"
                ]
            }
        ],
        additionalExperience: [
            {
                company: "Spare Time Entertainment",
                location: "Vernon, CT",
                role: "Game Room Attendant",
                date: "April 2020 - Present",
                bullets: [
                    "Maintain operations of all video and table games by scheduling service requests, troubleshooting malfunctions, and responding to player requests for assistance",
                    "Collaborate with management to source new machines for game room, organize delivery and create mock floorplan, process invoices, and promote game arrival to rewards club members"
                ]
            }
        ],
        skills: [
            { label: "Certification", value: "Bloomberg Market Concepts" },
            { label: "Computer", value: "Microsoft Excel, Access, PowerPoint, Visual Basic, Windows OS, OSX, SAS, SQL" },
            { label: "Language", value: "Conversational Spanish, Intermediate level American Sign Language" }
        ]
    });

    const handleDownloadPDF = async () => {
        setLoading(true);
        const element = resumeRef.current;
        
        // Temporarily remove transform for clean capture
        const originalStyle = element.style.cssText;
        element.style.transform = 'none';
        element.style.margin = '0';
        element.style.width = '210mm'; // Fixed width for A4
        
        try {
            const canvasOptions = {
                scale: 1.5,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                // CRITICAL: Ignore all external LINK tags to prevent html2canvas from 
                // trying to parse massive Tailwind CSS files that contain modern color functions (lab, oklch)
                ignoreElements: (element) => element.tagName === 'LINK',
                onclone: (clonedDoc) => {
                    // Force simple colors for everything in the clone just to be safe
                    const safeStyle = clonedDoc.createElement('style');
                    safeStyle.textContent = `
                        * { 
                            -webkit-print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        /* Ensure specific IDs or classes don't have problematic backgrounds */
                        [style*="lab("], [style*="oklch("] {
                            background-color: transparent !important;
                            color: #000000 !important;
                        }
                    `;
                    clonedDoc.head.appendChild(safeStyle);
                }
            };

            const canvas = await html2canvas(element, canvasOptions);
            const imgData = canvas.toDataURL("image/jpeg", 0.8);
            
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;
            const margin = 0;

            // Add first page
            pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add additional pages if content overflows
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`${formData.fullName.replace(/\s+/g, "_")}_Resume.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("There was an error generating your PDF. Please try again or check the console for details.");
        } finally {
            // Restore original styles
            element.style.cssText = originalStyle;
            setLoading(false);
        }
    };

    const addEntry = (type) => {
        if (type === 'education') {
            setFormData({
                ...formData,
                education: [...formData.education, { institution: "", location: "", date: "", degree: "", details: "" }]
            });
        } else if (type === 'experience') {
            setFormData({
                ...formData,
                experience: [...formData.experience, { company: "", location: "", role: "", date: "", bullets: [""] }]
            });
        } else if (type === 'additionalExperience') {
            setFormData({
                ...formData,
                additionalExperience: [...formData.additionalExperience, { company: "", location: "", role: "", date: "", bullets: [""] }]
            });
        }
    };

    const updateEntry = (type, index, field, value) => {
        const newData = { ...formData };
        newData[type][index][field] = value;
        setFormData(newData);
    };

    const updateBullet = (type, entryIndex, bulletIndex, value) => {
        const newData = { ...formData };
        newData[type][entryIndex].bullets[bulletIndex] = value;
        setFormData(newData);
    };

    const addBullet = (type, entryIndex) => {
        const newData = { ...formData };
        newData[type][entryIndex].bullets.push("");
        setFormData(newData);
    };

    return (
        <div className="min-h-screen bg-[#F4F7FE] pb-24">
            <div className="max-w-[1400px] mx-auto px-6 pt-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/candidate/resume">
                            <button className="p-3 bg-white border border-[#F1F1F1] rounded-2xl text-[#71717A] hover:text-[#080808] transition-all shadow-sm">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-[#080808]">Resume <span className="text-[#7C5CFC]">Builder</span></h1>
                            <p className="text-[#71717A] font-medium">Create and refine your professional profile</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={loading}
                        className="px-8 py-4 bg-[#7C5CFC] hover:bg-[#6b4ce6] text-white rounded-[16px] font-bold transition-all shadow-xl shadow-[#7C5CFC]/20 flex items-center gap-3 active:scale-95 disabled:opacity-70"
                    >
                        {loading ? "Generating..." : "Download PDF"}
                        <Download className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Editor Side */}
                    <div className="space-y-8">
                        {/* Steps Indicator */}
                        <div className="flex gap-2 mb-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setStep(i)}
                                    className={`h-2 flex-1 rounded-full cursor-pointer transition-all ${step >= i ? "bg-[#7C5CFC]" : "bg-[#F1F1F1]"}`} 
                                />
                            ))}
                        </div>

                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-white border border-[#F1F1F1] rounded-[32px] p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-[#080808] mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-[#F4F7FE] rounded-lg"><User className="w-5 h-5 text-[#7C5CFC]" /></div>
                                        Personal Contact Info
                                    </h2>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Full Name</label>
                                            <input 
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                                className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 font-bold"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Address</label>
                                            <input 
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C5CFC]/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Phone</label>
                                            <input 
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C5CFC]/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Email</label>
                                            <input 
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C5CFC]/20"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Website / Portfolio</label>
                                            <input 
                                                value={formData.website}
                                                onChange={(e) => setFormData({...formData, website: e.target.value})}
                                                className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C5CFC]/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-[#F1F1F1] rounded-[32px] p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-[#080808] mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-[#F4F7FE] rounded-lg"><Award className="w-5 h-5 text-[#7C5CFC]" /></div>
                                        Professional Summary
                                    </h2>
                                    <textarea 
                                        rows="6"
                                        value={formData.professionalSummary}
                                        onChange={(e) => setFormData({...formData, professionalSummary: e.target.value})}
                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all resize-none"
                                    />
                                </div>
                                <button onClick={() => setStep(2)} className="w-full py-5 bg-white border border-[#F1F1F1] rounded-[16px] font-bold text-[#080808] hover:bg-[#F4F7FE] transition-all flex items-center justify-center gap-2">
                                    Next: Education & Experience <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-white border border-[#F1F1F1] rounded-[32px] p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-[#080808] flex items-center gap-3">
                                            <div className="p-2 bg-[#F4F7FE] rounded-lg"><GraduationCap className="w-5 h-5 text-[#7C5CFC]" /></div>
                                            Education
                                        </h2>
                                        <button onClick={() => addEntry('education')} className="p-2 bg-[#F4F7FE] rounded-full text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white transition-all"><Plus className="w-5 h-5" /></button>
                                    </div>
                                    <div className="space-y-8">
                                        {formData.education.map((edu, idx) => (
                                            <div key={idx} className="space-y-4 border-b border-[#F1F1F1] pb-6 last:border-0 last:pb-0">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input 
                                                        placeholder="Institution"
                                                        value={edu.institution}
                                                        onChange={(e) => updateEntry('education', idx, 'institution', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none"
                                                    />
                                                    <input 
                                                        placeholder="Location"
                                                        value={edu.location}
                                                        onChange={(e) => updateEntry('education', idx, 'location', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none"
                                                    />
                                                    <input 
                                                        placeholder="Degree"
                                                        value={edu.degree}
                                                        onChange={(e) => updateEntry('education', idx, 'degree', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none"
                                                    />
                                                    <input 
                                                        placeholder="Date (e.g. May 2020)"
                                                        value={edu.date}
                                                        onChange={(e) => updateEntry('education', idx, 'date', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none"
                                                    />
                                                </div>
                                                <textarea 
                                                    placeholder="Details / Coursework"
                                                    rows="3"
                                                    value={edu.details}
                                                    onChange={(e) => updateEntry('education', idx, 'details', e.target.value)}
                                                    className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none resize-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => setStep(3)} className="w-full py-5 bg-white border border-[#F1F1F1] rounded-[16px] font-bold text-[#080808] hover:bg-[#F4F7FE] transition-all flex items-center justify-center gap-2">
                                    Next: Core Experience <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-white border border-[#F1F1F1] rounded-[32px] p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-[#080808] flex items-center gap-3">
                                            <div className="p-2 bg-[#F4F7FE] rounded-lg"><Briefcase className="w-5 h-5 text-[#7C5CFC]" /></div>
                                            Relevant Experience
                                        </h2>
                                        <button onClick={() => addEntry('experience')} className="p-2 bg-[#F4F7FE] rounded-full text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white transition-all"><Plus className="w-5 h-5" /></button>
                                    </div>
                                    <div className="space-y-8">
                                        {formData.experience.map((exp, idx) => (
                                            <div key={idx} className="space-y-4 border-b border-[#F1F1F1] pb-8 last:border-0 last:pb-0">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input 
                                                        placeholder="Company"
                                                        value={exp.company}
                                                        onChange={(e) => updateEntry('experience', idx, 'company', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none font-bold"
                                                    />
                                                    <input 
                                                        placeholder="Location"
                                                        value={exp.location}
                                                        onChange={(e) => updateEntry('experience', idx, 'location', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none"
                                                    />
                                                    <input 
                                                        placeholder="Role title"
                                                        value={exp.role}
                                                        onChange={(e) => updateEntry('experience', idx, 'role', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none"
                                                    />
                                                    <input 
                                                        placeholder="Date (e.g. Jan 2020 - Present)"
                                                        value={exp.date}
                                                        onChange={(e) => updateEntry('experience', idx, 'date', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-xs font-bold text-[#71717A]">Bullet Points</p>
                                                    {exp.bullets.map((bullet, bIdx) => (
                                                        <div key={bIdx} className="flex gap-2">
                                                            <input 
                                                                value={bullet}
                                                                onChange={(e) => updateBullet('experience', idx, bIdx, e.target.value)}
                                                                placeholder={`Achievement ${bIdx + 1}`}
                                                                className="flex-1 bg-white border border-[#F1F1F1] rounded-lg px-3 py-2 text-sm outline-none shadow-sm"
                                                            />
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addBullet('experience', idx)} className="text-xs text-[#7C5CFC] font-bold">+ Add Bullet</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => setStep(4)} className="w-full py-5 bg-white border border-[#F1F1F1] rounded-[16px] font-bold text-[#080808] hover:bg-[#F4F7FE] transition-all flex items-center justify-center gap-2">
                                    Next: Skills & Finalizing <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-white border border-[#F1F1F1] rounded-[32px] p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-[#080808] mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-[#F4F7FE] rounded-lg"><TrendingUp className="w-5 h-5 text-[#7C5CFC]" /></div>
                                        Core Skills & Certifications
                                    </h2>
                                    <div className="space-y-6">
                                        {formData.skills.map((skill, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">{skill.label}</label>
                                                <input 
                                                    value={skill.value}
                                                    onChange={(e) => {
                                                        const newSkills = [...formData.skills];
                                                        newSkills[idx].value = e.target.value;
                                                        setFormData({...formData, skills: newSkills});
                                                    }}
                                                    className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C5CFC]/20"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="bg-white border border-[#F1F1F1] rounded-[32px] p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-[#080808] flex items-center gap-3">
                                            <div className="p-2 bg-[#F4F7FE] rounded-lg"><Plus className="w-5 h-5 text-[#7C5CFC]" /></div>
                                            Additional Experience
                                        </h2>
                                        <button onClick={() => addEntry('additionalExperience')} className="p-2 bg-[#F4F7FE] rounded-full text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white transition-all"><Plus className="w-5 h-5" /></button>
                                    </div>
                                    <div className="space-y-8">
                                        {formData.additionalExperience.map((exp, idx) => (
                                            <div key={idx} className="space-y-4 border-b border-[#F1F1F1] pb-6 last:border-0 last:pb-0">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input 
                                                        placeholder="Company"
                                                        value={exp.company}
                                                        onChange={(e) => updateEntry('additionalExperience', idx, 'company', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none font-bold"
                                                    />
                                                    <input 
                                                        placeholder="Date"
                                                        value={exp.date}
                                                        onChange={(e) => updateEntry('additionalExperience', idx, 'date', e.target.value)}
                                                        className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none"
                                                    />
                                                </div>
                                                <input 
                                                    placeholder="Role"
                                                    value={exp.role}
                                                    onChange={(e) => updateEntry('additionalExperience', idx, 'role', e.target.value)}
                                                    className="w-full bg-[#F4F7FE]/30 border border-[#F1F1F1] rounded-xl px-4 py-3 outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white border border-[#F1F1F1] rounded-[16px] font-bold text-[#71717A] hover:bg-gray-50 transition-all">Restart</button>
                                    <button onClick={handleDownloadPDF} className="flex-[2] py-5 bg-[#7C5CFC] hover:bg-[#6b4ce6] text-white rounded-[16px] font-bold transition-all shadow-lg">Download Your Resume</button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Preview Side */}
                    <div className="top-10 h-fit">
                        <div className="flex items-center gap-2 mb-4 text-[#71717A]">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-widest">Live Preview (A4 Classic)</span>
                        </div>
                        <div className="bg-[#DFE1E5] p-10 rounded-[4px] shadow-2xl overflow-auto max-h-[1000px]">
                            {/* PDF Render Container */}
                            <div 
                                ref={resumeRef}
                                className="bg-white mx-auto shadow-sm"
                                style={{ 
                                    width: '210mm',
                                    minHeight: '297mm',
                                    padding: '2cm',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    fontFamily: "'Times New Roman', Times, serif",
                                    lineHeight: '1.5',
                                    color: '#080808',
                                    backgroundColor: '#FFFFFF',
                                    transform: 'scale(0.7)',
                                    transformOrigin: 'top',
                                    marginTop: '-15%',
                                    marginBottom: '-15%'
                                }}
                            >
                                {/* Header */}
                                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                    <h1 style={{ 
                                        fontSize: '24pt', 
                                        fontWeight: 'bold', 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '2px',
                                        marginBottom: '8px',
                                        fontFamily: 'Arial, sans-serif'
                                    }}>
                                        {formData.fullName}
                                    </h1>
                                    <div style={{ fontSize: '10pt', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
                                        <span>{formData.address}</span>
                                        <span style={{ color: '#dfe1e5' }}>|</span>
                                        <span>{formData.phone}</span>
                                    </div>
                                    <div style={{ fontSize: '10pt', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
                                        <span>{formData.email}</span>
                                        <span style={{ color: '#dfe1e5' }}>|</span>
                                        <span>{formData.website}</span>
                                    </div>
                                </div>

                                {/* Sections */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Summary */}
                                    <section>
                                        <h2 style={{ 
                                            fontSize: '11pt', 
                                            fontWeight: 'bold', 
                                            textTransform: 'uppercase', 
                                            marginBottom: '12px', 
                                            letterSpacing: '1.5px',
                                            borderBottom: '1px solid #000000',
                                            paddingBottom: '4px'
                                        }}>Professional Summary</h2>
                                        <p style={{ fontSize: '10pt', textAlign: 'justify', lineHeight: '1.6' }}>{formData.professionalSummary}</p>
                                    </section>

                                    {/* Education */}
                                    <section>
                                        <h2 style={{ 
                                            fontSize: '11pt', 
                                            fontWeight: 'bold', 
                                            textTransform: 'uppercase', 
                                            marginBottom: '12px', 
                                            letterSpacing: '1.5px',
                                            borderBottom: '1px solid #000000',
                                            paddingBottom: '4px'
                                        }}>Education</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {formData.education.map((edu, idx) => (
                                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold' }}>
                                                        <span style={{ fontSize: '11pt', flex: 1 }}>{edu.institution}</span>
                                                        <span style={{ fontSize: '10pt' }}>{edu.date}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontStyle: 'italic' }}>
                                                        <span style={{ fontSize: '10pt', fontWeight: '500', flex: 1 }}>{edu.degree}</span>
                                                        <span style={{ fontSize: '10pt' }}>{edu.location}</span>
                                                    </div>
                                                    {edu.details && (
                                                        <p style={{ fontSize: '10pt', whiteSpace: 'pre-wrap', color: '#1f2937', marginTop: '4px' }}>{edu.details}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Experience */}
                                    <section>
                                        <h2 style={{ 
                                            fontSize: '11pt', 
                                            fontWeight: 'bold', 
                                            textTransform: 'uppercase', 
                                            marginBottom: '12px', 
                                            letterSpacing: '1.5px',
                                            borderBottom: '1px solid #000000',
                                            paddingBottom: '4px'
                                        }}>Experience</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {formData.experience.map((exp, idx) => (
                                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold' }}>
                                                        <span style={{ fontSize: '11pt', flex: 1 }}>{exp.company}</span>
                                                        <span style={{ fontSize: '10pt' }}>{exp.date}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontStyle: 'italic', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '10pt', fontWeight: '500', flex: 1 }}>{exp.role}</span>
                                                        <span style={{ fontSize: '10pt' }}>{exp.location}</span>
                                                    </div>
                                                    <ul style={{ listStyleType: 'disc', marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {exp.bullets.filter(b => b.trim()).map((bullet, bIdx) => (
                                                            <li key={bIdx} style={{ fontSize: '10pt', color: '#1f2937' }}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Additional Experience */}
                                    {formData.additionalExperience.length > 0 && formData.additionalExperience[0].company && (
                                        <section>
                                            <h2 style={{ 
                                                fontSize: '11pt', 
                                                fontWeight: 'bold', 
                                                textTransform: 'uppercase', 
                                                marginBottom: '12px', 
                                                letterSpacing: '1.5px',
                                                borderBottom: '1px solid #000000',
                                                paddingBottom: '4px'
                                            }}>Additional Experience</h2>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {formData.additionalExperience.map((exp, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0 }}>{exp.company}</p>
                                                            <p style={{ fontSize: '10pt', fontStyle: 'italic', fontWeight: '500', margin: 0 }}>{exp.role}</p>
                                                        </div>
                                                        <span style={{ fontSize: '10pt', fontWeight: 'bold' }}>{exp.date}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Skills */}
                                    <section>
                                        <h2 style={{ 
                                            fontSize: '11pt', 
                                            fontWeight: 'bold', 
                                            textTransform: 'uppercase', 
                                            marginBottom: '12px', 
                                            letterSpacing: '1.5px',
                                            borderBottom: '1px solid #000000',
                                            paddingBottom: '4px'
                                        }}>Skills & Certifications</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {formData.skills.map((skill, idx) => (
                                                <div key={idx} style={{ fontSize: '10pt', display: 'flex' }}>
                                                    <span style={{ fontWeight: 'bold', minWidth: '120px' }}>{skill.label}:</span> 
                                                    <span style={{ color: '#1f2937' }}>{skill.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @font-face {
                    font-family: 'Georgia';
                    src: local('Georgia');
                }
            `}</style>
        </div>
    );
}

