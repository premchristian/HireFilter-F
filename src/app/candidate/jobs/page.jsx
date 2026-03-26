// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { Search, MapPin, IndianRupee, Clock, Briefcase, Filter, ArrowRight, RotateCcw } from "lucide-react";
// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// import { useJobContext } from "@/context/JobContext";
// import { JobsSkeleton } from "@/components/Skeleton";

// export default function CandidateJobsPage() {
//     const router = useRouter();
//     const [searchQuery, setSearchQuery] = useState("");
//     const [locationQuery, setLocationQuery] = useState("");

//     const { jobs: contextJobs, loading, toggleSaveJob, fetchJobs } = useJobContext();

//     const jobs = contextJobs.map((job, index) => {
//         const colors = [
//             "bg-[#EBE8FF] text-[#7C5CFC]",
//             "bg-[#FFEDE1] text-[#FF5C5C]",
//             "bg-[#EFFFED] text-[#27C052]",
//             "bg-[#F4F7FE] text-[#7C5CFC]",
//             "bg-[#FFF2E0] text-[#FF9900]",
//             "bg-[#E8F8FF] text-[#0EA5E9]"
//         ];

//         return {
//             ...job,
//             company: job.department, 
//             logo: job.title.charAt(0).toUpperCase(),
//             logoStyle: colors[index % colors.length],
//             tags: job.skills || []
//         };
//     });

//     const filteredJobs = jobs.filter(job => {
//         const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
//         const matchesLocation = (job.location || "").toLowerCase().includes(locationQuery.toLowerCase());
//         return matchesSearch && matchesLocation;
//     });

//     const containerVariants = {
//         hidden: { opacity: 0 },
//         show: {
//             opacity: 1,
//             transition: {
//                 staggerChildren: 0.1
//             }
//         }
//     };

//     const itemVariants = {
//         hidden: { opacity: 0, y: 20 },
//         show: { opacity: 1, y: 0 }
//     };

//     if (loading) return <JobsSkeleton />;

//     return (
//         <motion.div 
//             variants={containerVariants}
//             initial="hidden"
//             animate="show"
//             className="space-y-8 max-w-6xl mx-auto pb-12"
//         >
//             <motion.div variants={itemVariants} className="px-2">
//                 <h1 className="text-3xl font-bold text-[#080808]">
//                     Find Your <span className="text-[#7C5CFC]">Next Role</span>
//                 </h1>
//                 <p className="text-[#71717A] mt-1 font-medium">Browse thousands of jobs from top companies</p>
//             </motion.div>

//             {/* Search Bar */}
//             <motion.div variants={itemVariants} className="px-2">
//                 <div className="p-2 bg-white border border-[#F1F1F1] rounded-[24px] shadow-[0px_4px_30px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-2">
//                     <div className="flex-1 relative">
//                         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
//                         <input
//                             type="text"
//                             placeholder="Job title, keywords, or company..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             className="w-full h-14 bg-transparent pl-14 pr-4 text-[#080808] font-medium focus:outline-none placeholder:text-[#71717A]"
//                         />
//                     </div>
//                     <div className="w-px bg-[#F1F1F1] hidden md:block my-2" />
//                     <div className="flex-1 relative">
//                         <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
//                         <input
//                             type="text"
//                             placeholder="City, state, or 'Remote'"
//                             value={locationQuery}
//                             onChange={(e) => setLocationQuery(e.target.value)}
//                             className="w-full h-14 bg-transparent pl-14 pr-4 text-[#080808] font-medium focus:outline-none placeholder:text-[#71717A]"
//                         />
//                     </div>
//                     <div className="flex items-center gap-2 pr-2">
//                         {(searchQuery || locationQuery) && (
//                             <button
//                                 onClick={() => {
//                                     setSearchQuery("");
//                                     setLocationQuery("");
//                                 }}
//                                 className="p-3 text-[#71717A] hover:text-[#080808] hover:bg-[#F4F7FE] rounded-[12px] transition-all"
//                                 title="Reset filters"
//                             >
//                                 <RotateCcw className="w-5 h-5" />
//                             </button>
//                         )}
//                         <button className="h-12 px-8 bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white rounded-[16px] font-bold transition-all shadow-[0px_4px_20px_rgba(124,92,252,0.3)] whitespace-nowrap active:scale-95">
//                             Search Jobs
//                         </button>
//                     </div>
//                 </div>
//             </motion.div>

//             {/* Job Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
//                 <AnimatePresence mode="popLayout">
//                     {filteredJobs.length > 0 ? (
//                         filteredJobs.map((job) => (
//                             <motion.div
//                                 key={job.id}
//                                 variants={itemVariants}
//                                 layout
//                                 initial={{ opacity: 0, scale: 0.95 }}
//                                 animate={{ opacity: 1, scale: 1 }}
//                                 exit={{ opacity: 0, scale: 0.95 }}
//                                 transition={{ duration: 0.2 }}
//                                 className="group p-6 bg-white border border-[#F1F1F1] rounded-[24px] hover:border-[#7C5CFC]/30 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] transition-all cursor-pointer relative overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
//                                 onClick={() => router.push(`/candidate/jobs/${job.id}`)}
//                             >
//                                 <div className="flex justify-between items-start mb-5 relative z-10">
//                                     <div className={`w-14 h-14 rounded-[16px] ${job.logoStyle} flex items-center justify-center text-2xl font-bold shrink-0 shadow-sm border border-transparent group-hover:border-[#7C5CFC]/20 transition-all`}>
//                                         {job.logo}
//                                     </div>
//                                     <div className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#F4F7FE] border border-[#F1F1F1] text-[#71717A] uppercase tracking-wider">
//                                         {job.posted || "New"}
//                                     </div>
//                                 </div>

//                                 <div className="relative z-10">
//                                     <h3 className="text-xl font-bold text-[#080808] mb-1 group-hover:text-[#7C5CFC] transition-colors">{job.title}</h3>
//                                     <p className="text-[#71717A] font-semibold text-sm mb-5">{job.company}</p>

//                                     <div className="flex flex-wrap gap-2 mb-6">
//                                         {job.tags.slice(0, 3).map((tag, i) => (
//                                             <span key={i} className="px-3 py-1 rounded-full bg-[#F4F7FE] text-[10px] font-bold text-[#71717A] uppercase tracking-wider border border-[#F1F1F1]">
//                                                 {tag}
//                                             </span>
//                                         ))}
//                                         {job.tags.length > 3 && (
//                                             <span className="px-3 py-1 rounded-full bg-[#FFFFFF] text-[10px] font-bold text-[#7C5CFC] uppercase tracking-wider border border-[#EBE8FF]">
//                                                 +{job.tags.length - 3} More
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="flex items-center justify-between pt-5 border-t border-[#F1F1F1] relative z-10">
//                                     <div className="flex items-center gap-4 text-xs font-bold text-[#71717A]">
//                                         <span className="flex items-center gap-2 bg-[#F4F7FE] px-3 py-1.5 rounded-[10px]">
//                                             <MapPin className="w-3.5 h-3.5 text-[#7C5CFC]" />
//                                             {job.location}
//                                         </span>
//                                         <span className="flex items-center gap-2 bg-[#EFFFED] px-3 py-1.5 rounded-[10px] text-[#27C052]">
//                                             <IndianRupee className="w-3.5 h-3.5" />
//                                             {job.salary ? job.salary.replace(/\$/g, '') : 'Best in Industry'}
//                                         </span>
//                                     </div>
//                                     <span className="p-2.5 rounded-[12px] bg-[#F4F7FE] text-[#71717A] group-hover:bg-[#7C5CFC] group-hover:text-white transition-all border border-[#F1F1F1] group-hover:border-[#7C5CFC] shadow-sm">
//                                         <ArrowRight className="w-4 h-4" />
//                                     </span>
//                                 </div>
//                                 <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7C5CFC]/5 rounded-full blur-2xl group-hover:bg-[#7C5CFC]/10 transition-colors duration-500"></div>
//                             </motion.div>
//                         ))
//                     ) : (
//                         <motion.div
//                             initial={{ opacity: 0, scale: 0.95 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             className="col-span-full py-24 flex flex-col items-center justify-center bg-[#FFFFFF] border border-dashed border-[#F1F1F1] rounded-[32px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
//                         >
//                             <div className="w-20 h-20 rounded-[24px] bg-[#F4F7FE] flex items-center justify-center mb-6">
//                                 <Search className="w-10 h-10 text-[#71717A]" />
//                             </div>
//                             <h3 className="text-2xl font-bold text-[#080808] tracking-tight">No jobs found</h3>
//                             <p className="text-[#71717A] mt-2 text-sm max-w-xs text-center font-medium">Try adjusting your keywords or location to find more opportunities.</p>
//                             <button
//                                 onClick={() => {
//                                     setSearchQuery("");
//                                     setLocationQuery("");
//                                 }}
//                                 className="mt-8 flex items-center gap-2 px-8 py-3 bg-[#7C5CFC] text-white font-bold uppercase tracking-widest rounded-[12px] hover:bg-[#6A4FE0] transition-all shadow-[0px_4px_20px_rgba(124,92,252,0.3)] active:scale-95"
//                             >
//                                 <RotateCcw className="w-4 h-4" />
//                                 Clear All Search
//                             </button>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>
//             </div>
//         </motion.div>
//     );
// }




"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, IndianRupee, Clock, Briefcase, Filter, ArrowRight, RotateCcw, Bookmark } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useJobContext } from "@/context/JobContext";
import { JobsSkeleton } from "@/components/Skeleton";

export default function CandidateJobsPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");

    const { jobs: contextJobs, loading, toggleSaveJob, fetchJobs } = useJobContext();

    const jobs = contextJobs.map((job, index) => {
        const colors = [
            "bg-[#EBE8FF] text-[#7C5CFC]",
            "bg-[#FFEDE1] text-[#FF5C5C]",
            "bg-[#EFFFED] text-[#27C052]",
            "bg-[#F4F7FE] text-[#7C5CFC]",
            "bg-[#FFF2E0] text-[#FF9900]",
            "bg-[#E8F8FF] text-[#0EA5E9]"
        ];

        return {
            ...job,
            company: job.company || job.department || "Unknown Company", 
            logo: job.title.charAt(0).toUpperCase(),
            logoStyle: colors[index % colors.length],
            tags: job.skills || []
        };
    });

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesLocation = (job.location || "").toLowerCase().includes(locationQuery.toLowerCase());
        return matchesSearch && matchesLocation;
    });

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

    if (loading) return <JobsSkeleton />;

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-6xl mx-auto pb-12"
        >
            <motion.div variants={itemVariants} className="px-2">
                <h1 className="text-3xl font-bold text-[#080808]">
                    Find Your <span className="text-[#7C5CFC]">Next Role</span>
                </h1>
                <p className="text-[#71717A] mt-1 font-medium">Browse thousands of jobs from top companies</p>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={itemVariants} className="px-2">
                <div className="p-2 bg-white border border-[#F1F1F1] rounded-[24px] shadow-[0px_4px_30px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                        <input
                            type="text"
                            placeholder="Job title, keywords, or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 bg-transparent pl-14 pr-4 text-[#080808] font-medium focus:outline-none placeholder:text-[#71717A]"
                        />
                    </div>
                    <div className="w-px bg-[#F1F1F1] hidden md:block my-2" />
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                        <input
                            type="text"
                            placeholder="City, state, or 'Remote'"
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            className="w-full h-14 bg-transparent pl-14 pr-4 text-[#080808] font-medium focus:outline-none placeholder:text-[#71717A]"
                        />
                    </div>
                    <div className="flex items-center gap-2 pr-2">
                        {(searchQuery || locationQuery) && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setLocationQuery("");
                                }}
                                className="p-3 text-[#71717A] hover:text-[#080808] hover:bg-[#F4F7FE] rounded-[12px] transition-all"
                                title="Reset filters"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        )}
                        <button className="h-12 px-8 bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white rounded-[16px] font-bold transition-all shadow-[0px_4px_20px_rgba(124,92,252,0.3)] whitespace-nowrap active:scale-95">
                            Search Jobs
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                <AnimatePresence mode="popLayout">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <motion.div
                                key={job.id}
                                variants={itemVariants}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="group p-6 bg-white border border-[#F1F1F1] rounded-[24px] hover:border-[#7C5CFC]/30 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] transition-all cursor-pointer relative overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                                onClick={() => router.push(`/candidate/jobs/${job.id}`)}
                            >
                                <div className="flex justify-between items-start mb-5 relative z-10">
                                    <div className={`w-14 h-14 rounded-[16px] ${job.logoStyle} flex items-center justify-center text-2xl font-bold shrink-0 shadow-sm border border-transparent group-hover:border-[#7C5CFC]/20 transition-all`}>
                                        {job.logo}
                                    </div>
                                    <div className="flex gap-3 items-center relative z-20">
                                        <button 
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    // Optimistically update the context-derived job (this is tricky in the current structure)
                                                    // Instead, we will rely on the backend toggle and only refresh if actually needed
                                                    // But for now, let's just make the call and trust the backend or add a local toggle if we had local state
                                                    await toggleSaveJob(job.id);
                                                    // fetchJobs(); // Removed to prevent 'flip-back'
                                                } catch (err) {
                                                    console.error("Error toggling save:", err);
                                                }
                                            }}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                                                job.isSaved 
                                                    ? "bg-[#7C5CFC] border-[#7C5CFC] text-white shadow-lg shadow-[#7C5CFC]/20" 
                                                    : "bg-[#F4F7FE] border-[#F1F1F1] text-[#71717A] hover:text-[#7C5CFC] hover:bg-white"
                                            }`}
                                        >
                                            <Bookmark className={`w-3.5 h-3.5 ${job.isSaved ? "fill-white" : ""}`} />
                                            {job.savedCount > 0 && <span className="text-[10px] font-bold">{job.savedCount}</span>}
                                        </button>
                                        <div className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#F4F7FE] border border-[#F1F1F1] text-[#71717A] uppercase tracking-wider">
                                            {job.posted || "New"}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-[#080808] mb-1 group-hover:text-[#7C5CFC] transition-colors">{job.title}</h3>
                                    <p className="text-[#71717A] font-semibold text-sm mb-5">{job.company}</p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {job.tags.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-[#F4F7FE] text-[10px] font-bold text-[#71717A] uppercase tracking-wider border border-[#F1F1F1]">
                                                {tag}
                                            </span>
                                        ))}
                                        {job.tags.length > 3 && (
                                            <span className="px-3 py-1 rounded-full bg-[#FFFFFF] text-[10px] font-bold text-[#7C5CFC] uppercase tracking-wider border border-[#EBE8FF]">
                                                +{job.tags.length - 3} More
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-[#F1F1F1] relative z-10">
                                    <div className="flex items-center gap-4 text-xs font-bold text-[#71717A]">
                                        <span className="flex items-center gap-2 bg-[#F4F7FE] px-3 py-1.5 rounded-[10px]">
                                            <MapPin className="w-3.5 h-3.5 text-[#7C5CFC]" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center gap-2 bg-[#EFFFED] px-3 py-1.5 rounded-[10px] text-[#27C052]">
                                            <IndianRupee className="w-3.5 h-3.5" />
                                            {job.salary ? job.salary.replace(/[₹$]/g, '') : 'Best in Industry'}
                                        </span>
                                    </div>
                                    <span className="p-2.5 rounded-[12px] bg-[#F4F7FE] text-[#71717A] group-hover:bg-[#7C5CFC] group-hover:text-white transition-all border border-[#F1F1F1] group-hover:border-[#7C5CFC] shadow-sm">
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7C5CFC]/5 rounded-full blur-2xl group-hover:bg-[#7C5CFC]/10 transition-colors duration-500"></div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-24 flex flex-col items-center justify-center bg-[#FFFFFF] border border-dashed border-[#F1F1F1] rounded-[32px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                        >
                            <div className="w-20 h-20 rounded-[24px] bg-[#F4F7FE] flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-[#71717A]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#080808] tracking-tight">No jobs found</h3>
                            <p className="text-[#71717A] mt-2 text-sm max-w-xs text-center font-medium">Try adjusting your keywords or location to find more opportunities.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setLocationQuery("");
                                }}
                                className="mt-8 flex items-center gap-2 px-8 py-3 bg-[#7C5CFC] text-white font-bold uppercase tracking-widest rounded-[12px] hover:bg-[#6A4FE0] transition-all shadow-[0px_4px_20px_rgba(124,92,252,0.3)] active:scale-95"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Clear All Search
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
