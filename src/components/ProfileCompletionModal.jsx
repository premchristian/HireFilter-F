"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, CheckCircle2, ArrowRight, X, Sparkles } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function ProfileCompletionModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const checkProfileCompleteness = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                // Check if already dismissed in this session
                const isDismissed = sessionStorage.getItem("profile_modal_dismissed");
                if (isDismissed) {
                    setLoading(false);
                    return;
                }

                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/getProfile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data?.success) {
                    const data = res.data.data;
                    setProfileData(data);

                    // Criteria for completeness
                    const hasBio = !!data.profile?.bio;
                    const hasSkills = data.profile?.skills?.length > 0;
                    const hasImage = !!(data.profileImage || data.avatar);
                    
                    // If any core field is missing, show modal
                    if (!hasBio || !hasSkills || !hasImage) {
                        // Small delay for better UX after login
                        setTimeout(() => setIsOpen(true), 1500);
                    }
                }
            } catch (error) {
                console.error("Error checking profile completeness:", error);
            } finally {
                setLoading(false);
            }
        };

        checkProfileCompleteness();
    }, []);

    const handleDismiss = () => {
        setIsOpen(false);
        sessionStorage.setItem("profile_modal_dismissed", "true");
    };

    if (loading || !isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDismiss}
                    className="absolute inset-0 bg-[#080808]/40 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[32px] shadow-[0px_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
                >
                    {/* Decorative Header Background */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#7C5CFC] to-[#9D85FF] opacity-10" />
                    
                    <button 
                        onClick={handleDismiss}
                        className="absolute top-6 right-6 p-2 hover:bg-[#F4F7FE] rounded-full transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-[#71717A]" />
                    </button>

                    <div className="p-8 pt-12 relative text-center">
                        <div className="w-20 h-20 bg-[#EBE8FF] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
                            <Sparkles className="w-10 h-10 text-[#7C5CFC]" />
                        </div>

                        <h2 className="text-2xl font-bold text-[#080808] mb-3">
                            Complete Your Profile
                        </h2>
                        
                        <p className="text-[#71717A] mb-8 font-medium leading-relaxed">
                            A complete profile makes you stand out and increases your chances of getting hired by <span className="text-[#7C5CFC] font-bold">3x</span>.
                        </p>

                        <div className="space-y-3 mb-8 text-left max-w-[280px] mx-auto">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className={`w-5 h-5 ${profileData?.profile?.bio ? 'text-[#27C052]' : 'text-[#F1F1F1]'}`} />
                                <span className={`text-sm font-semibold ${profileData?.profile?.bio ? 'text-[#080808]' : 'text-[#71717A]'}`}>Professional Bio</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className={`w-5 h-5 ${profileData?.profile?.skills?.length > 0 ? 'text-[#27C052]' : 'text-[#F1F1F1]'}`} />
                                <span className={`text-sm font-semibold ${profileData?.profile?.skills?.length > 0 ? 'text-[#080808]' : 'text-[#71717A]'}`}>Skills & Expertise</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className={`w-5 h-5 ${(profileData?.profileImage || profileData?.avatar) ? 'text-[#27C052]' : 'text-[#F1F1F1]'}`} />
                                <span className={`text-sm font-semibold ${(profileData?.profileImage || profileData?.avatar) ? 'text-[#080808]' : 'text-[#71717A]'}`}>Profile Picture</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link href={profileData?.role?.toLowerCase() === 'hr' ? "/hr/profile" : "/candidate/profile"} className="w-full">
                                <button 
                                    onClick={() => sessionStorage.setItem("profile_modal_dismissed", "true")}
                                    className="w-full bg-[#7C5CFC] hover:bg-[#6b4ce6] text-white py-4 rounded-[16px] font-bold transition-all shadow-[0px_8px_20px_rgba(124,92,252,0.25)] flex items-center justify-center gap-2 group active:scale-[0.98]"
                                >
                                    Complete Profile Now
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>

                            <button 
                                onClick={handleDismiss}
                                className="w-full text-[#71717A] hover:text-[#080808] py-2 text-sm font-bold transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="h-2 bg-[#7C5CFC] w-full" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
