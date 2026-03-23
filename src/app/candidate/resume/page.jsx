"use client";

import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Eye, History, Clock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ResumePage() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

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

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto space-y-8 pb-12"
        >
            <motion.div variants={itemVariants} className="text-center">
                <h1 className="text-3xl font-bold text-[#080808]">
                    Resume <span className="text-[#7C5CFC]">Builder</span>
                </h1>
                <p className="text-[#71717A] mt-2 font-medium">Create a professional resume in minutes with our classic templates</p>
            </motion.div>

            <motion.div 
                variants={itemVariants}
                className="max-w-2xl mx-auto"
            >
                <div className="bg-white border border-[#F1F1F1] rounded-[32px] p-12 shadow-[0px_4px_30px_rgba(124,92,252,0.04)] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#7C5CFC]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-[#7C5CFC]/10 transition-colors" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#7C5CFC]/3 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl group-hover:bg-[#7C5CFC]/5 transition-colors" />
                    
                    <div className="w-24 h-24 rounded-[28px] bg-[#F4F7FE] flex items-center justify-center mb-8 shadow-sm border border-[#F1F1F1] group-hover:scale-110 transition-all duration-300">
                        <FileText className="w-12 h-12 text-[#7C5CFC]" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-[#080808] mb-3">Create Your Professional Resume</h3>
                    <p className="text-[#71717A] mb-10 font-medium text-lg px-8 leading-relaxed">
                        Don't have a resume? Our builder helps you create a professional, recruiter-ready resume in minutes.
                    </p>
                    
                    <Link href="/candidate/resume/builder" className="w-full max-w-sm">
                        <button className="w-full py-5 bg-[#7C5CFC] hover:bg-[#6b4ce6] text-white rounded-[20px] font-bold text-lg transition-all shadow-[0px_8px_30px_rgba(124,92,252,0.3)] hover:shadow-[0px_12px_40px_rgba(124,92,252,0.4)] active:scale-95 flex items-center justify-center gap-3">
                            <span>Start Building Now</span>
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}
