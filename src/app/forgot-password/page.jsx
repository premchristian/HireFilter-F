"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock,
  ArrowRight, 
  Loader2, 
  ArrowLeft,
  Zap,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  Phone,
  ChevronDown,
  Search,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

/* ---------- Theme Components ---------- */

// Input Component matching Login page style
function Input({ icon: Icon, className = "", rightIcon: RightIcon, onRightClick, ...props }) {
    return (
        <div className="relative group">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary" />
            <input
                {...props}
                className={`w-full pl-12 ${RightIcon ? 'pr-12' : 'pr-4'} py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none text-gray-800 ${className}`}
            />
            {RightIcon && (
                <button 
                    type="button"
                    onClick={onRightClick}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                >
                    <RightIcon className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("request"); // request, reset, success
    const [error, setError] = useState("");
    const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
    const [method, setMethod] = useState("email"); // email or phone
    const [countries, setCountries] = useState([]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCountry, setSelectedCountry] = useState({ code: '+91', flag: '🇮🇳' });

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await axios.get("https://restcountries.com/v3.1/all?fields=name,flags,idd");
                const countryData = res.data
                    .filter(c => c.idd?.root)
                    .map(c => {
                        const root = c.idd.root || "";
                        const suffixes = c.idd.suffixes || [];
                        const code = (root === "+1" || suffixes.length > 5) ? root : (root + (suffixes[0] || ""));
                        return {
                            name: c.name.common,
                            flag: c.flags.emoji || '🌐',
                            code: code
                        };
                    })
                    .sort((a, b) => a.name.localeCompare(b.name));
                
                const indiaIndex = countryData.findIndex(c => c.name === "India");
                if (indiaIndex > -1) {
                    const india = countryData.splice(indiaIndex, 1)[0];
                    countryData.unshift(india);
                }
                setCountries(countryData);
            } catch (err) {
                console.error("Failed to fetch countries:", err);
            }
        };
        fetchCountries();
    }, []);

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const finalIdentifier = method === "phone" ? (selectedCountry.code + email.trim().replace(/^\+/, "")) : email.trim();
            console.log(`Requesting OTP for ${method}:`, finalIdentifier);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password`, {
                [method === "phone" ? "identifier" : "email"]: finalIdentifier
            });
            console.log("OTP Request Response:", res.data);
            setStep("reset");
        } catch (err) {
            console.error("OTP Request Failed:", err.response?.data);
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const finalIdentifier = method === "phone" ? (selectedCountry.code + email.trim().replace(/^\+/, "")) : email.trim();
            console.log(`Attempting password reset for ${method}:`, finalIdentifier, "with OTP:", otp.trim());
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`, {
                [method === "phone" ? "identifier" : "email"]: finalIdentifier,
                otp: otp.trim(),
                newPassword: newPassword
            });
            console.log("Password Reset Response:", res.data);
            setStep("success");
        } catch (err) {
            console.error("Password Reset Failed:", err.response?.data);
            setError(err.response?.data?.message || "Reset failed. Please check your OTP and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-[#F4F7FE] p-4 md:p-8 font-inter">
            <div className="noise" />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl h-full min-h-[600px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative flex shadow-primary/10 border border-white"
            >
                {/* Left Side: Illustration / Banner */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary to-primary-dark p-12 flex-col items-center justify-center text-center text-white relative overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <svg viewBox="0 0 400 400" className="w-full h-full">
                            <motion.path 
                                animate={{ d: ["M0,100 Q100,150 200,100 T400,100", "M0,300 Q100,250 200,300 T400,300", "M0,100 Q100,150 200,100 T400,100"] }}
                                transition={{ duration: 10, repeat: Infinity }}
                                fill="none" stroke="white" strokeWidth="0.5" 
                            />
                            <circle cx="50" cy="50" r="2" fill="white" />
                            <circle cx="350" cy="350" r="2" fill="white" />
                        </svg>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-8 backdrop-blur-xl border border-white/20">
                            <Zap className="text-white w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 tracking-tight">Security First</h2>
                        <p className="text-white/80 max-w-[280px]">
                            Maintaining a secure environment for your career journey is our top priority.
                        </p>
                    </motion.div>
                </div>

                {/* Right Side: Form Content */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12">
                    <AnimatePresence mode="wait">
                        {step === "request" && (
                            <motion.div
                                key="request-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center md:text-left">
                                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Forgot Password</h1>
                                    <p className="text-gray-500">Don't worry! select a method and we'll send you an OTP to reset your password.</p>
                                </div>

                                {/* Method Selection */}
                                <div className="flex p-1 bg-gray-100 rounded-2xl">
                                    <button
                                        onClick={() => setMethod("email")}
                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${method === "email" ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </button>
                                    <button
                                        onClick={() => setMethod("phone")}
                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${method === "phone" ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Phone className="w-4 h-4" />
                                        Phone Number
                                    </button>
                                </div>

                                <form onSubmit={handleRequestOTP} className="space-y-6">
                                    {method === "phone" ? (
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                    className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 font-bold border border-gray-200 bg-white"
                                                >
                                                    <span>{selectedCountry.flag}</span>
                                                    <span className="text-xs">{selectedCountry.code}</span>
                                                    <ChevronDown size={14} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>

                                            {showCountryDropdown && (
                                                <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-3 animate-in fade-in zoom-in duration-200">
                                                    <div className="relative mb-3">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search country..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
                                                        />
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                                                        {countries
                                                            .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.includes(searchQuery))
                                                            .map((c, i) => (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedCountry({ code: c.code, flag: c.flag });
                                                                        setShowCountryDropdown(false);
                                                                        setSearchQuery("");
                                                                    }}
                                                                    className="w-full flex items-center justify-between p-2 hover:bg-primary/5 rounded-xl transition-colors group text-left"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xl">{c.flag}</span>
                                                                        <span className="text-sm font-bold text-gray-700 group-hover:text-primary">{c.name}</span>
                                                                    </div>
                                                                    <span className="text-xs font-bold text-primary">{c.code}</span>
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                            <input
                                                type="tel"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your phone number"
                                                className="w-full pl-28 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none text-gray-800"
                                            />
                                        </div>
                                    ) : (
                                        <Input 
                                            icon={Mail}
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                        />
                                    )}

                                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                Send OTP
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center md:text-left pt-4">
                                    <Link 
                                        href="/login" 
                                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-primary transition-colors group"
                                    >
                                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                        Back to Sign In
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {step === "reset" && (
                            <motion.div
                                key="reset-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center md:text-left">
                                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Reset Password</h1>
                                    <p className="text-gray-500">Enter the OTP sent to <span className="text-primary font-bold">{method === "phone" ? (selectedCountry.code + email) : email}</span> and your new password.</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary" />
                                            <input
                                                type="text"
                                                required
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter 6-digit OTP"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none text-gray-800 font-mono tracking-[0.5em] text-center text-lg"
                                                maxLength={6}
                                            />
                                        </div>

                                        <Input 
                                            icon={Lock}
                                            type={showPasswords.new ? "text" : "password"}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New Password"
                                            rightIcon={showPasswords.new ? EyeOff : Eye}
                                            onRightClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                        />

                                        <Input 
                                            icon={Lock}
                                            type={showPasswords.confirm ? "text" : "password"}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm New Password"
                                            rightIcon={showPasswords.confirm ? EyeOff : Eye}
                                            onRightClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                        />
                                    </div>

                                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                Reset Password
                                                <CheckCircle className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center md:text-left pt-4 flex flex-col gap-2">
                                    <button 
                                        onClick={() => setStep("request")}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-primary transition-colors group self-start"
                                    >
                                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                        Wrong {method}? Try again
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success-state"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8"
                            >
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="text-green-500 w-10 h-10" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Password Reset Successful</h2>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        Your password has been successfully updated. You can now use your new password to sign in.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Link href="/login">
                                        <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                            Sign In Now
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </main>
    );
}
