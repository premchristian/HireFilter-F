"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function CandidateInterviewsPage() {
    return (
        <div className="flex flex-col h-full gap-6">
            <div>
                <h1 className="text-3xl font-bold text-[#080808]">
                    Your <span className="text-[#7C5CFC]">Interviews</span>
                </h1>
                <p className="text-[#71717A] mt-1 font-medium">Manage and track your interview schedule</p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 min-h-[400px] flex flex-col items-center justify-center bg-white border border-[#F1F1F1] rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.03)] p-8 text-center"
            >
                <div className="w-16 h-16 bg-[#F4F7FE] rounded-2xl flex items-center justify-center mb-6">
                    <Calendar className="w-8 h-8 text-[#7C5CFC]" />
                </div>
                <h2 className="text-2xl font-bold text-[#080808] mb-2">Coming Soon</h2>
                <p className="text-[#71717A] max-w-sm font-medium leading-relaxed">
                    Interview scheduling and management functionality is being refined for the best experience.
                </p>
            </motion.div>
        </div>
    );
}
