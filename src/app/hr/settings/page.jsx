"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useNotificationContext } from "@/context/NotificationContext";
import { Bell, Lock, User, Shield, Moon, Globe, Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('notifications');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    
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
    const [profilePhone, setProfilePhone] = useState("");
    const [otpMethod, setOtpMethod] = useState("email"); // email or phone

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/getProfile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data?.success) {
                    setProfilePhone(res.data.data.phone || "");
                }
            } catch (err) {
                console.error("Failed to fetch profile for phone number:", err);
            }
        };
        fetchProfile();
    }, []);

    const router = useRouter();
    const { pushNotificationsMuted, setPushNotificationsMuted } = useNotificationContext();

    const tabs = [
        // { id: 'general', label: 'General', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    const handleRequestOTP = async (method = "email") => {
        const email = localStorage.getItem("userEmail");
        const identifier = method === "phone" ? profilePhone : email;

        if (!identifier) {
            setPasswordError(method === "phone" ? "Phone number not found in profile." : "Session expired. Please log in again.");
            return;
        }

        setIsSendingOTP(true);
        setPasswordError("");
        setOtpSent(false);
        setOtpMethod(method);

        try {
            console.log(`Requesting OTP for HR ${method}:`, identifier.trim());
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
            const identifier = otpMethod === "phone" ? profilePhone : email;
            console.log(`Attempting HR password reset for ${otpMethod}:`, identifier.trim());
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

    const handleDeleteAccount = async () => {
        if (!password) {
            setError("Please enter your password to confirm");
            return;
        }

        setIsDeleting(true);
        setError("");
        
        try {
            const currentToken = localStorage.getItem("token"); // Fallback
            const email = localStorage.getItem("userEmail");
            
            if (!email) {
                router.push('/login');
                throw new Error("Session expired");
            }

            // 1. Verify Password & Get Fresh Token
            let newToken = currentToken;
            try {
                const loginRes = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
                    email, 
                    password
                });
                
                // Extract token from response (handling potential nesting)
                const loginData = loginRes.data.data || loginRes.data;
                if (loginData?.token) {
                    newToken = loginData.token;
                }
            } catch (loginErr) {
                console.error("Password verification failed:", loginErr);
                throw new Error(loginErr.response?.status === 401 || loginErr.response?.status === 400 
                    ? "Incorrect password" 
                    : "Password verification failed");
            }

            // 2. Delete Profile using FRESH token
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/deleteProfile`, {
                    headers: { Authorization: `Bearer ${newToken}` }
                });
            } catch (deleteErr) {
                console.error("Delete API failed:", deleteErr);
                // If 401 here, it's a real permission/auth issue with the backend logic
                throw deleteErr; 
            }

            // Logout & Redirect
            localStorage.clear();
            window.dispatchEvent(new Event("auth-change"));
            router.push('/login');
        } catch (err) {
            console.error("Delete Account Error:", err);
            setError(err.message || err.response?.data?.message || "Failed to delete account");
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 relative">
            <h1 className="text-3xl font-bold text-[#080808]">
                Settings
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all font-bold ${
                                activeTab === tab.id 
                                    ? "bg-[#EBE8FF] border border-[#7C5CFC]/20 text-[#7C5CFC] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]" 
                                    : "text-[#71717A] hover:text-[#080808] hover:bg-[#F4F7FE]"
                            }`}
                        >
                            <tab.icon className="w-5 h-5" suppressHydrationWarning />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-[16px] p-8 min-h-[500px]">
{/*                     {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[#080808] mb-6">General Preferences</h2>
                            
                            <div className="flex items-center justify-between p-4 bg-[#F4F7FE] rounded-[12px] border border-[#F1F1F1]">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-violet-500/10 text-violet-400 rounded-[8px]">
                                        <Moon className="w-5 h-5" suppressHydrationWarning />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#080808]">Appearance</h3>
                                        <p className="text-sm text-[#71717A]">Customize the look and feel</p>
                                    </div>
                                </div>
                                <select className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[8px] px-3 py-2 text-[#080808] text-sm font-medium">
                                    <option>Dark Mode</option>
                                    <option>Light Mode</option>
                                    <option>System</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#F4F7FE] rounded-[12px] border border-[#F1F1F1]">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-[8px]">
                                        <Globe className="w-5 h-5" suppressHydrationWarning />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#080808]">Language</h3>
                                        <p className="text-sm text-[#71717A]">Select your preferred language</p>
                                    </div>
                                </div>
                                <select className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[8px] px-3 py-2 text-[#080808] text-sm font-medium">
                                    <option>English (US)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                        </div>
                    )} */}
                    
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[#080808] mb-6">Notification Settings</h2>
                            {[
                                { label: 'Push Notifications', key: 'push' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-4 border-b border-[#F1F1F1] last:border-0">
                                    <div>
                                        <h3 className="font-bold text-[#080808]">{item.label}</h3>
                                        <p className="text-sm text-[#71717A]">Receive real-time desktop alerts</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={!pushNotificationsMuted} 
                                            onChange={() => setPushNotificationsMuted(!pushNotificationsMuted)}
                                        />
                                        <div className="w-11 h-6 bg-[#F4F7FE] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#F1F1F1] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C5CFC] border border-[#F1F1F1]"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[#080808] mb-6">Security & Login</h2>
                            <div className="space-y-4">
                                <button 
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full flex items-center justify-between p-4 bg-[#F4F7FE] hover:bg-[#EBE8FF] border border-[#F1F1F1] rounded-[12px] transition-all text-left group shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-[8px] group-hover:bg-blue-500/20 transition-colors">
                                            <Lock className="w-5 h-5" suppressHydrationWarning />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#080808]">Change Password</h3>
                                            <p className="text-sm text-[#71717A]">Update your password regularly</p>
                                        </div>
                                    </div>
                                    <div className="text-[#71717A] group-hover:text-[#7C5CFC] transition-colors font-medium">
                                        Edit
                                    </div>
                                </button>

                                <div className="pt-8 border-t border-[#F1F1F1]">
                                    <h3 className="text-[#FF5C5C] font-bold mb-2">Danger Zone</h3>
                                    <p className="text-[#71717A] text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                                    <button 
                                        onClick={() => setShowDeleteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#FF5C5C]/10 hover:bg-[#FF5C5C]/20 text-[#FF5C5C] border border-[#FF5C5C]/20 rounded-[12px] transition-all font-bold shadow-[0px_4px_20px_rgba(255,92,92,0.15)]"
                                    >
                                        <Trash2 className="w-4 h-4" suppressHydrationWarning />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {/* Delete Account Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute inset-0 bg-[#F4F7FE]/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#FFFFFF] border border-[#F1F1F1] rounded-[32px] p-8 relative z-10 shadow-[0px_20px_40px_rgba(0,0,0,0.1)]"
                        >
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F4F7FE] text-[#71717A] hover:text-[#080808] transition-colors"
                            >
                                <X className="w-6 h-6" suppressHydrationWarning />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-[#FF5C5C]/10 flex items-center justify-center mb-6 shadow-[0px_4px_20px_rgba(255,92,92,0.15)] border border-[#FF5C5C]/20">
                                    <AlertTriangle className="w-8 h-8 text-[#FF5C5C]" suppressHydrationWarning />
                                </div>
                                <h2 className="text-2xl font-black text-[#080808] mb-2">Delete Account?</h2>
                                <p className="text-[#71717A] mb-8 font-medium">
                                    This action cannot be undone. All your data, job postings, and history will be permanently removed.
                                </p>

                                <div className="w-full mb-6">
                                    <label className="block text-sm font-bold text-[#080808] mb-2 text-left">
                                        Enter Password to Confirm
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" suppressHydrationWarning />
                                        <input 
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Your Password"
                                            className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] pl-10 pr-4 py-3 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]/50 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-[#FF5C5C] font-medium text-sm mb-4 bg-[#FF5C5C]/10 border border-[#FF5C5C]/20 p-3 rounded-[12px] w-full">{error}</p>
                                )}

                                <div className="flex gap-4 w-full">
                                    <button 
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-3 bg-[#F4F7FE] hover:bg-[#F1F1F1] text-[#080808] rounded-[12px] font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                        className="flex-1 py-3 bg-[#FF5C5C] hover:bg-[#E04848] text-white rounded-[12px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0px_4px_20px_rgba(255,92,92,0.3)]"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" suppressHydrationWarning />
                                                Deleting...
                                            </>
                                        ) : (
                                            "Yes, Delete"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
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
                                <X className="w-6 h-6" suppressHydrationWarning />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-[#7C5CFC]/10 flex items-center justify-center mb-6 shadow-[0px_4px_20px_rgba(124,92,252,0.15)] border border-[#7C5CFC]/20">
                                    <Lock className="w-8 h-8 text-[#7C5CFC]" suppressHydrationWarning />
                                </div>
                                <h2 className="text-2xl font-black text-[#080808] mb-2">Change Password</h2>
                                <p className="text-[#71717A] mb-8 font-medium">
                                    Update your password to keep your account secure.
                                </p>

                                <form onSubmit={handleUpdatePassword} className="w-full space-y-4">
                                    {/* OTP Field */}
                                    <div className="text-left space-y-2">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Request OTP via:</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRequestOTP("email")}
                                                    disabled={isSendingOTP}
                                                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${otpMethod === "email" && otpSent ? 'bg-[#7C5CFC] text-white' : 'bg-[#F4F7FE] text-[#71717A] hover:border-[#7C5CFC]/20'}`}
                                                >
                                                    {isSendingOTP && otpMethod === "email" ? "Sending..." : "OTP on Email"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRequestOTP("phone")}
                                                    disabled={isSendingOTP || !profilePhone}
                                                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${otpMethod === "phone" && otpSent ? 'bg-[#7C5CFC] text-white' : 'bg-[#F4F7FE] text-[#71717A] hover:border-[#7C5CFC]/20'} ${!profilePhone ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={!profilePhone ? "Phone number not available" : ""}
                                                >
                                                    {isSendingOTP && otpMethod === "phone" ? "Sending..." : "OTP on Number"}
                                                </button>
                                            </div>
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
                                                <Shield className="w-4 h-4" />
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
                                                {showPasswords.new ? <X className="w-4 h-4 rotate-45" /> : <Lock className="w-4 h-4" />}
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
                                                {showPasswords.confirm ? <X className="w-4 h-4 rotate-45" /> : <Lock className="w-4 h-4" />}
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
                                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
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
                                                <div className="w-4 h-4 bg-[#27C052] rounded-full flex items-center justify-center">
                                                    <X className="w-2.5 h-2.5 text-white" />
                                                </div>
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
        </div>
    );
}
