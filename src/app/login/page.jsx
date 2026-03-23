"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  User,
  Building2,
  Shield,
  ArrowRight,
  CheckCircle,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useMaintenance } from "@/context/MaintenanceContext";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMaintenanceMode } = useMaintenance();

  const [isLogin, setIsLogin] = useState(true);
  
  // Login State
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Register State
  const [regRole, setRegRole] = useState("");
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regAdminKey, setRegAdminKey] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Global Error Popup
  const [errorPopup, setErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  /* Clear localStorage on page load */
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        { email: loginEmail.trim(), password: loginPassword.trim() }
      );

      const responseData = res.data.data || res.data;
      const token = responseData.token;
      const role = responseData.role;

      if (!token || !role) throw new Error("Invalid login response");

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", loginEmail);
      localStorage.setItem("userName", responseData.name || responseData.user?.name || loginEmail.split('@')[0]);

      window.dispatchEvent(new Event("auth-change"));

      const userRole = role.toLowerCase();
      if (isMaintenanceMode && userRole !== "admin") {
        setErrorMessage("System is in maintenance mode. Only Admins can log in.");
        setErrorPopup(true);
        localStorage.clear();
        return;
      }

      if (userRole === "admin") router.push("/admin/dashboard");
      else if (userRole === "hr") router.push("/hr/dashboard");
      else router.push("/candidate/dashboard");

    } catch (err) {
      setLoginError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");

    try {
      // Step 1: Request OTP
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/send-signup-otp`, { 
        email: regEmail.trim() 
      });
      setOtpSent(true);
      setRegError("OTP sent to your email. Please verify.");
    } catch (err) {
      setRegError(err.response?.data?.message || err.response?.data?.errors?.[0] || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");
    try {
      // Step 1: Verify OTP
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify-signup-otp`, {
        email: regEmail.trim(),
        otp: otpCode.trim()
      });

      // Step 2: Complete the Signup
      const payload = {
        name: regName,
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
      };

      if (regRole === "hr") payload.company = regCompany;

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`, payload);

      setOtpSent(false);
      setRegSuccess(true);
    } catch (err) {
      setRegError(err.response?.data?.message || err.response?.data?.errors?.[0] || "OTP verification or registration failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) {
      handleRegisterSubmit(e);
    } else {
      handleVerifyOtp(e);
    }
  };

  return (
    <div className="w-full max-w-6xl h-full min-h-[700px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative flex shadow-primary/10 border border-white">
      
      {/* Forms Container */}
      <div className="w-full h-full flex relative z-0">
        
        {/* Register Side (Left half under cover when login active) */}
        <div className={`w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 transition-all duration-700 ${isLogin ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-500 mb-8">Join HireFilter and start your journey</p>
          
          <div className="flex gap-2 mb-6">
            {["user", "hr"].map((r) => (
              <button
                key={r}
                onClick={() => setRegRole(r)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${regRole === r ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary" />
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                required
                disabled={otpSent}
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary" />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                required
                disabled={otpSent}
              />
            </div>

            {regRole === "hr" && (
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary" />
                <input
                  type="text"
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="Company Name"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                  required
                  disabled={otpSent}
                />
              </div>
            )}


            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary" />
              <input
                type={regShowPassword ? "text" : "password"}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Create Password"
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                required
                disabled={otpSent}
              />
              <button 
                type="button"
                onClick={() => setRegShowPassword(!regShowPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                disabled={otpSent}
              >
                {regShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {otpSent && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative group"
              >
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary" />
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none text-gray-800 font-mono tracking-[0.5em]"
                  maxLength={6}
                  required
                />
              </motion.div>
            )}

            {regError && <p className={`text-sm font-medium ${otpSent && regError.includes('OTP sent') ? 'text-green-500' : 'text-red-500'}`}>{regError}</p>}

            <button
              type="submit"
              disabled={regLoading || otpLoading || !regRole}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {regLoading || otpLoading ? <Loader2 className="animate-spin" /> : (otpSent ? "Verify & Create Account" : "Create Account")}
            </button>
            {otpSent && (
              <button 
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode("");
                  setRegError("");
                }}
                className="w-full text-sm text-gray-400 hover:text-primary transition-colors mt-2"
              >
                Change details or resend OTP
              </button>
            )}
          </form>
        </div>

        {/* Login Side (Right half under cover when register active) */}
        <div className={`w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 md:ml-auto transition-all duration-700 ${!isLogin ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Sign In</h2>
          <p className="text-gray-500 mb-10">Welcome back to HireFilter</p>
          
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary" />
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary" />
              <input
                type={loginShowPassword ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                required
              />
               <button 
                type="button"
                onClick={() => setLoginShowPassword(!loginShowPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
              >
                {loginShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" size="sm" className="text-sm font-medium text-gray-400 hover:text-primary">
                Forgot password?
              </Link>
            </div>

            {loginError && <p className="text-red-500 text-sm font-medium">{loginError}</p>}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loginLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </button>
          </form>
        </div>

      </div>

      {/* Sliding Sliding Cover Panel */}
      <motion.div
        animate={{ 
          x: isLogin ? "0%" : "100%",
          borderRadius: isLogin ? "0 2.5rem 2.5rem 0" : "2.5rem 0 0 2.5rem"
        }}
        initial={false}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="absolute top-0 left-0 w-full md:w-1/2 h-full bg-gradient-to-br from-primary to-primary-dark z-10 flex flex-col items-center justify-center p-12 text-center text-white overflow-hidden pointer-events-auto"
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <motion.path 
              animate={{ d: isLogin ? "M0,100 Q100,150 200,100 T400,100" : "M0,300 Q100,250 200,300 T400,300" }}
              fill="none" stroke="white" strokeWidth="0.5" 
            />
            <circle cx="50" cy="50" r="2" fill="white" />
            <circle cx="350" cy="350" r="2" fill="white" />
            <path d="M10,80 L30,80 M20,70 L20,90" stroke="white" strokeWidth="0.5" opacity="0.3" />
          </svg>
        </div>

        <motion.div
          key={isLogin ? 'login-cover' : 'register-cover'}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-8 backdrop-blur-xl border border-white/20">
            <Zap className="text-white w-8 h-8" />
          </div>

          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            {isLogin ? "Hello, Friend!" : "Welcome back!"}
          </h2>
          <p className="text-white/80 mb-10 max-w-[280px]">
            {isLogin 
              ? "New here? Enter your personal details and start your journey with us." 
              : "To keep connected with us please login with your personal info."
            }
          </p>
          
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="px-10 py-3 border-2 border-white rounded-2xl font-bold hover:bg-white hover:text-primary transition-all active:scale-95"
          >
            {isLogin ? "SIGN UP" : "SIGN IN"}
          </button>
        </motion.div>
      </motion.div>

      {/* Mobile Switching Bar (Shown only on small screens) */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 p-6 flex justify-center bg-white border-t border-gray-100 z-20">
         <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold">
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
         </button>
      </div>

      {/* Register Success Popup */}
      {regSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-[2.5rem] text-center max-w-sm w-full shadow-2xl"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Well done!</h3>
            <p className="text-gray-500 mb-8">Registration successful. Let's get you signed in.</p>
            <button 
              onClick={() => { setRegSuccess(false); setIsLogin(true); }}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
            >
              Log In Now
            </button>
          </motion.div>
        </div>
      )}

      {/* Removed OTP Verification Popup */}

      {/* Login Error Global Popup */}
      {errorPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-[2.5rem] text-center max-w-sm w-full shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Authentication Failed</h3>
            <p className="text-gray-500 mb-8">{errorMessage}</p>
            <button 
              onClick={() => setErrorPopup(false)}
              className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F4F7FE] p-4 md:p-8">
      <Suspense fallback={<div className="text-primary font-bold">Loading...</div>}>
        <AuthContent />
      </Suspense>
    </main>
  );
}
