"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useMaintenance } from "@/context/MaintenanceContext";

/* ---------- UI Components ---------- */
function Button({ children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={`flex items-center justify-center gap-2 ${className}`}
        >
            {children}
        </button>
    );
}

function Input({ className = "", ...props }) {
    return (
        <input
            {...props}
            className={`w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-[#64748B]
            focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all ${className}`}
        />
    );
}

export default function LoginForm() {
    const router = useRouter();
    const { isMaintenanceMode } = useMaintenance();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [errorPopup, setErrorPopup] = useState(false);

    /* Clear localStorage on page load */
    useEffect(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorPopup(false);
        setError(""); // Clear previous error

        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
                { email: email.trim(), password: password.trim() }
            );

            const responseData = res.data.data || res.data;
            console.log("LOGIN SUCCESS DATA:", responseData);
            
            const token = responseData.token;
            const role = responseData.role;

            if (!token || !role) {
                 throw new Error("Invalid login response: Missing token or role");
            }

            // Save token & role
            localStorage.setItem("token", token);
            localStorage.setItem("userRole", role);
            localStorage.setItem("userEmail", email);

            // Save user name if available, otherwise derive from email
            const userName = responseData.name || responseData.user?.name || email.split('@')[0];
            localStorage.setItem("userName", userName);

            // Dispatch auth-change event to update UI components
            window.dispatchEvent(new Event("auth-change"));

            // Redirect by role
            const userRole = role.toLowerCase();
            
            if (isMaintenanceMode && userRole !== "admin") {
                setError("System is in maintenance mode. Only Admins can log in.");
                setErrorPopup(true);
                // Clear auth to prevent context from redirecting loop
                localStorage.clear();
                return;
            }

            if (userRole === "admin") router.push("/admin/dashboard");
            else if (userRole === "hr") router.push("/hr/dashboard");
            else if (userRole === "user" || userRole === "candidate") router.push("/candidate/dashboard");
            else throw new Error(`Unknown user role: ${role}`);

        } catch (err) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.message || err.message || "Login failed";
            setError(msg); 
            setErrorPopup(true);
            localStorage.clear();
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md relative z-10"
        >
            <div className="flex justify-center mb-8 text-white">
                <Logo className="h-16" />
            </div>

            <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400 text-center mb-2">
                    Welcome Back
                </h1>
                <p className="text-gray-400 text-center mb-6 text-sm">
                    Enter your credentials to access your account
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" suppressHydrationWarning />
                        <Input
                            type="email"
                            placeholder="you@company.com"
                            className="pl-12 py-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" suppressHydrationWarning />
                        <Input
                    
                    type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="pl-12 pr-12 py-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff suppressHydrationWarning /> : <Eye suppressHydrationWarning />}
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-[#6366F1] hover:text-[#818CF8] font-medium transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-[#6366F1] hover:bg-[#5558DD] text-white text-lg font-semibold transition-all shadow-lg shadow-indigo-500/20"
                    >
                        {loading ? <Loader2 className="animate-spin" suppressHydrationWarning /> : <>Sign In <ArrowRight className="w-5 h-5" suppressHydrationWarning /></>}
                    </Button>
                </form>
            </div>

            <p className="text-center text-[#94A3B8] mt-6 bg-black/40 py-2 rounded-xl backdrop-blur-sm border border-white/5 inline-block w-full">
                Don&apos;t have an account?{" "}
                <Link href="/Register" className="text-[#6366F1] font-medium hover:underline">
                    Create account
                </Link>
            </p>

            {/* Error Popup */}
            {errorPopup && (
                <div 
                    className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
                >
                    <div className="bg-[#1F2937] border border-white/10 p-6 rounded-2xl text-center max-w-sm w-full shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Login Failed</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {error || "Please check your credentials and try again."}
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setErrorPopup(false)}
                                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors text-sm font-medium"
                            >
                                Try Again
                            </button>
                            <Link href="/Register" className="flex-1">
                                <button className="w-full px-4 py-2.5 bg-[#6366F1] hover:bg-[#5558DD] rounded-xl text-white transition-colors text-sm font-medium">
                                    Create Account
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
