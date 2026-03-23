"use client";

import { motion } from "framer-motion";
import { Bell, Lock, User, Globe, ChevronRight, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { useNotificationContext } from "@/context/NotificationContext";
import axios from "axios";

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true
    });

    const { pushNotificationsMuted, setPushNotificationsMuted } = useNotificationContext();

    // Password Update State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });

    const handleRequestOTP = async () => {
        const email = localStorage.getItem("userEmail");
        if (!email) {
            setPasswordError("Session expired. Please log in again.");
            return;
        }

        setIsSendingOTP(true);
        setPasswordError("");
        setOtpSent(false);

        try {
            console.log("Requesting OTP for email:", email.trim());
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password`, {
                email: email.trim()
            });
            console.log("OTP Request Response:", res.data);
            setOtpSent(true);
        } catch (err) {
            console.error("OTP Request Failed. Status:", err.response?.status);
            console.error("Error Data:", err.response?.data);
            setPasswordError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOTP(false);
        }
    };

    const toggleNotification = (key) => {
        if (key === "push") {
            setPushNotificationsMuted(!pushNotificationsMuted);
        } else {
            setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        const email = localStorage.getItem("userEmail");

        if (!passwordForm.otp) {
            setPasswordError("Please enter the OTP");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setIsUpdatingPassword(true);
        setPasswordError("");

        try {
            console.log("Attempting password reset for:", email.trim(), "with OTP:", passwordForm.otp.trim());
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`,
                {
                    email: email.trim(),
                    otp: passwordForm.otp.trim(),
                    newPassword: passwordForm.newPassword
                }
            );
            console.log("Password Reset Response:", res.data);

            setPasswordSuccess(true);
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess(false);
                setOtpSent(false);
                setPasswordForm({ otp: "", newPassword: "", confirmPassword: "" });
            }, 2000);
        } catch (err) {
            console.error("Password Update Failed. Status:", err.response?.status);
            console.error("Error Data:", err.response?.data);
            setPasswordError(err.response?.data?.message || "Failed to update password. Please check your OTP.");
        } finally {
            setIsUpdatingPassword(false);
        }
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
            className="max-w-4xl mx-auto space-y-8 pb-12 relative"
        >
             <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-[#080808]">
                    Account <span className="text-[#7C5CFC]">Settings</span>
                </h1>
                <p className="text-[#71717A] mt-1 font-medium">Manage your profile, notifications and privacy</p>
             </motion.div>
             
             <div className="grid gap-8">
                 <motion.div 
                    variants={itemVariants}
                    className="bg-white border border-[#F1F1F1] rounded-[24px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]"
                 >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#F4F7FE] rounded-xl flex items-center justify-center">
                            <Bell className="w-5 h-5 text-[#7C5CFC]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#080808]">Notifications</h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "Email alerts for new jobs", key: "email" },
                            { label: "SMS for interview reminders", key: "sms" },
                            { label: "Browser push notifications", key: "push" }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-4 rounded-[16px] bg-[#F4F7FE]/50 border border-[#F1F1F1] hover:border-[#7C5CFC]/20 transition-all">
                                <span className="text-[#080808] font-medium">{item.label}</span>
                                <button 
                                    onClick={() => toggleNotification(item.key)}
                                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 outline-none ${
                                        item.key === "push" 
                                            ? (pushNotificationsMuted ? 'bg-gray-200' : 'bg-[#7C5CFC]')
                                            : (notifications[item.key] ? 'bg-[#7C5CFC]' : 'bg-gray-200')
                                    }`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
                                        item.key === "push"
                                            ? (!pushNotificationsMuted ? 'left-7' : 'left-1')
                                            : (notifications[item.key] ? 'left-7' : 'left-1')
                                    }`} />
                                </button>
                            </div>
                        ))}
                    </div>
                 </motion.div>

                 <motion.div 
                    variants={itemVariants}
                    className="bg-white border border-[#F1F1F1] rounded-[24px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]"
                 >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#F4F7FE] rounded-xl flex items-center justify-center">
                            <Lock className="w-5 h-5 text-[#7C5CFC]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#080808]">Privacy & Security</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-[16px] bg-[#F4F7FE]/50 border border-[#F1F1F1]">
                            <div className="flex flex-col">
                                <span className="text-[#080808] font-medium">Profile Visibility</span>
                                <span className="text-[#71717A] text-xs">Currently visible to recruiters</span>
                            </div>
                            <span className="bg-[#EBE8FF] text-[#7C5CFC] px-3 py-1 rounded-full text-xs font-bold">Public</span>
                        </div>
                        
                        <button 
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-between p-4 rounded-[16px] text-left hover:bg-[#F4F7FE] transition-colors border border-transparent hover:border-[#F1F1F1]"
                        >
                            <span className="text-[#080808] font-medium">Change Password</span>
                            <ChevronRight className="w-4 h-4 text-[#71717A]" />
                        </button>
                        
                        <button className="w-full flex items-center justify-between p-4 rounded-[16px] text-left hover:bg-red-50 transition-colors border border-transparent hover:border-red-100 group">
                            <span className="text-red-500 font-medium group-hover:text-red-600">Delete Account</span>
                            <ChevronRight className="w-4 h-4 text-red-400" />
                        </button>
                    </div>
                 </motion.div>
             </div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute inset-0 bg-[#F4F7FE]/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#FFFFFF] border border-[#F1F1F1] rounded-[32px] p-8 relative z-10 shadow-[0px_20px_40px_rgba(0,0,0,0.1)]"
                        >
                            <button 
                                onClick={() => setShowPasswordModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F4F7FE] text-[#71717A] hover:text-[#080808] transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-[#7C5CFC]/10 flex items-center justify-center mb-6 shadow-[0px_4px_20px_rgba(124,92,252,0.15)] border border-[#7C5CFC]/20">
                                    <Lock className="w-8 h-8 text-[#7C5CFC]" />
                                </div>
                                <h2 className="text-2xl font-black text-[#080808] mb-2">Change Password</h2>
                                <p className="text-[#71717A] mb-8 font-medium">
                                    Update your password to keep your account secure.
                                </p>

                                <form onSubmit={handleUpdatePassword} className="w-full space-y-4">
                                    {/* OTP Field */}
                                    <div className="text-left space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">OTP (Sent to Email)</label>
                                            <button 
                                                type="button"
                                                onClick={handleRequestOTP}
                                                disabled={isSendingOTP}
                                                className="text-[10px] font-bold text-[#7C5CFC] hover:text-[#5B3FD7] mb-1 transition-colors disabled:opacity-50"
                                            >
                                                {isSendingOTP ? "Sending..." : otpSent ? "Resend OTP" : "Request OTP"}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                required
                                                value={passwordForm.otp}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, otp: e.target.value }))}
                                                className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent outline-none transition-all pr-12 font-medium"
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A]">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="text-left space-y-2">
                                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showPasswords.new ? "text" : "password"}
                                                required
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent outline-none transition-all pr-12 font-medium"
                                                placeholder="••••••••"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#7C5CFC] transition-colors"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="text-left space-y-2">
                                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showPasswords.confirm ? "text" : "password"}
                                                required
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent outline-none transition-all pr-12 font-medium"
                                                placeholder="••••••••"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#7C5CFC] transition-colors"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {passwordError && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-2 p-3 rounded-[12px] bg-[#FF5C5C]/10 border border-[#FF5C5C]/20 text-[#FF5C5C] text-xs font-bold w-full"
                                            >
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                {passwordError}
                                            </motion.div>
                                        )}
                                        {passwordSuccess && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-2 p-3 rounded-[12px] bg-[#27C052]/10 border border-[#27C052]/20 text-[#27C052] text-xs font-bold w-full"
                                            >
                                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                                Password updated successfully!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button 
                                        type="submit"
                                        disabled={isUpdatingPassword || passwordSuccess}
                                        className="w-full py-4 bg-[#7C5CFC] hover:bg-[#5B3FD7] text-white rounded-[12px] font-bold transition-all shadow-lg shadow-[#7C5CFC]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                                    >
                                        {isUpdatingPassword ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Updating...
                                            </>
                                        ) : passwordSuccess ? (
                                            "Done"
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
