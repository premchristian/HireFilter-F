"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Settings, 
    Shield, 
    Lock, 
    Bell, 
    Database, 
    Globe, 
    Cpu,
    Save,
    RefreshCw,
    Loader2,
    X,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminSettingsPage() {
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPhone, setAdminPhone] = useState("");
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    // Password State
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
    const [otpMethod, setOtpMethod] = useState("email"); // email or phone

    const handleRequestOTP = async (method = "email") => {
        const email = localStorage.getItem("userEmail");
        const identifier = method === "phone" ? adminPhone : email;

        if (!identifier) {
            setPasswordError(method === "phone" ? "Phone number not found in profile." : "Session expired. Please log in again.");
            return;
        }

        setIsSendingOTP(true);
        setPasswordError("");
        setOtpSent(false);
        setOtpMethod(method);

        try {
            console.log(`Requesting OTP for admin ${method}:`, identifier.trim());
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password`, {
                [method === "phone" ? "identifier" : "email"]: identifier.trim()
            });
            console.log("OTP Request Response:", res.data);
            setOtpSent(true);
        } catch (err) {
            console.error("OTP Request Failed:", err.response?.data);
            setPasswordError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOTP(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/getProfile`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.ok) {
                    const json = await res.json();
                    const profile = json.data;
                    setAdminName(profile.name || "");
                    setAdminEmail(profile.email || "");
                    setAdminPhone(profile.phone || "");
                }
            } catch (err) {
                console.error("Failed to fetch admin profile:", err);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

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
            const identifier = otpMethod === "phone" ? adminPhone : email;
            console.log(`Attempting admin password reset for ${otpMethod}:`, identifier.trim());
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`,
                {
                    [otpMethod === "phone" ? "identifier" : "email"]: identifier.trim(),
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

    return (
        <div className="space-y-8 max-w-5xl mx-auto relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">System <span className="text-amber-500">Settings</span></h1>
                    <p className="text-gray-500 text-sm mt-1">Configure global platform parameters and security protocols</p>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* General Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-3xl bg-[#111418] border border-white/5 space-y-8"
                    >
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Settings className="w-5 h-5 text-amber-500" />
                            Platform Configuration
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Platform Name</label>
                                <input className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-all outline-none" defaultValue="HireFilter" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Admin Email</label>
                                {isLoadingProfile ? (
                                    <div className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                        <span className="text-gray-500 text-sm">Loading…</span>
                                    </div>
                                ) : (
                                    <input
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-all outline-none"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Admin Name</label>
                                {isLoadingProfile ? (
                                    <div className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                        <span className="text-gray-500 text-sm">Loading…</span>
                                    </div>
                                ) : (
                                    <input
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-all outline-none"
                                        value={adminName}
                                        onChange={(e) => setAdminName(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                    </motion.div>

                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-8 rounded-3xl bg-[#111418] border border-white/5 space-y-6"
                    >
                         <h3 className="text-lg font-bold text-white flex items-center gap-3">
                            <Shield className="w-5 h-5 text-red-500" />
                            Security
                        </h3>
                        <div className="space-y-4">
                            <button 
                                onClick={() => {
                                    setShowPasswordModal(true);
                                }}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Lock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                UPDATE ADMIN PASSWORD
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Password Update Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#111418] border border-white/10 rounded-[32px] p-8 relative z-10 shadow-2xl"
                        >
                            <button 
                                onClick={() => setShowPasswordModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                                    <Lock className="w-8 h-8 text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">Update Password</h2>
                                <p className="text-gray-500 mb-8 text-sm font-medium">
                                    Ensure your account stays secure with a strong password.
                                </p>

                                <form onSubmit={handleUpdatePassword} className="w-full space-y-4">
                                    <div className="text-left space-y-2">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Request OTP via:</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRequestOTP("email")}
                                                    disabled={isSendingOTP}
                                                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${otpMethod === "email" && otpSent ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-gray-500 border-white/5 hover:border-amber-500/20'}`}
                                                >
                                                    {isSendingOTP && otpMethod === "email" ? "SENDING..." : "OTP ON EMAIL"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRequestOTP("phone")}
                                                    disabled={isSendingOTP || !adminPhone}
                                                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${otpMethod === "phone" && otpSent ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-gray-500 border-white/5 hover:border-amber-500/20'} ${!adminPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={!adminPhone ? "Phone number not available" : ""}
                                                >
                                                    {isSendingOTP && otpMethod === "phone" ? "SENDING..." : "OTP ON NUMBER"}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                required
                                                value={passwordForm.otp}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, otp: e.target.value }))}
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-all outline-none pr-12"
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="text-left space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showPasswords.new ? "text" : "password"}
                                                required
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-all outline-none pr-12"
                                                placeholder="••••••••"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="text-left space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showPasswords.confirm ? "text" : "password"}
                                                required
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-all outline-none pr-12"
                                                placeholder="••••••••"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
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
                                                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold w-full"
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
                                                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold w-full"
                                            >
                                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                                Password updated successfully!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button 
                                        type="submit"
                                        disabled={isUpdatingPassword || passwordSuccess}
                                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-black transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                                    >
                                        {isUpdatingPassword ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                UPDATING...
                                            </>
                                        ) : passwordSuccess ? (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                SUCCESS
                                            </>
                                        ) : (
                                            "CONFIRM UPDATE"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
