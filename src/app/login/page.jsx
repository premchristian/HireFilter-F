"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone,
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  User,
  Building2,
  Shield,
  ArrowRight,
  CheckCircle,
  Zap,
  ChevronDown,
  Search,
  Globe
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [regPhone, setRegPhone] = useState("");
  const [countries, setCountries] = useState([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showLoginCountryDropdown, setShowLoginCountryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState({ code: '+91', flag: '🇮🇳' });
  const [selectedLoginCountry, setSelectedLoginCountry] = useState({ code: '+91', flag: '🇮🇳' });

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get("https://restcountries.com/v3.1/all?fields=name,flags,idd");
        const countryData = res.data
          .filter(c => c.idd?.root)
          .map(c => {
            const root = c.idd.root || "";
            const suffixes = c.idd.suffixes || [];
            // For countries with many suffixes like USA/Canada (+1), just use the root
            const code = (root === "+1" || suffixes.length > 5) ? root : (root + (suffixes[0] || ""));
            return {
              name: c.name.common,
              flag: c.flags.emoji || '🌐',
              code: code
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        
        // Find India and put it first
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
  const [regMethod, setRegMethod] = useState("email"); // Added regMethod
  const [regCompany, setRegCompany] = useState("");
  const [regAdminKey, setRegAdminKey] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState("");

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
      let identifier = loginEmail.trim();
      const isEmail = identifier.includes('@');
      const startsWithPlus = identifier.startsWith('+');

      if (!isEmail && !startsWithPlus && identifier.length > 0) {
        identifier = selectedLoginCountry.code + identifier;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        { identifier, password: loginPassword.trim() }
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
      // Logic: Respect regMethod selection
      let identifier = "";
      if (regMethod === "mobile") {
        if (!regPhone.trim()) throw new Error("Please provide a Mobile Number");
        identifier = regPhone.trim();
        if (!identifier.startsWith('+')) {
            identifier = '+' + identifier;
        }
      } else {
        if (!regEmail.trim()) throw new Error("Please provide an Email Address");
        identifier = regEmail.trim();
      }

      setOtpIdentifier(identifier);

      // Step 1: Request OTP
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/send-signup-otp`, { 
        identifier: identifier
      });
      setOtpSent(true);
      setRegError(`OTP sent to ${identifier}. Please verify.`);
    } catch (err) {
      setRegError(err.response?.data?.message || err.response?.data?.errors?.[0] || err.message || "Registration failed");
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
        identifier: otpIdentifier,
        otp: otpCode.trim()
      });

      // Step 2: Complete the Signup
      const payload = {
        name: regName,
        email: regMethod === "email" ? regEmail.trim() : undefined,
        phone: regMethod === "mobile" ? (regPhone.trim().startsWith('+') ? regPhone.trim() : '+' + regPhone.trim()) : undefined,
        password: regPassword,
        role: regRole,
      };

      if (regRole === "hr") {
        payload.company = regCompany;
      }

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
    <div className="w-full max-w-6xl h-auto md:h-full md:min-h-[700px] bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row shadow-primary/10 border border-white">
      
      {/* Forms Container */}
      <div className="w-full h-full flex flex-col md:flex-row relative z-0">
        
        {/* Register Side (Left half under cover when login active) */}
        <div className={`w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12 transition-all duration-700 ${isLogin ? 'hidden md:flex opacity-0 pointer-events-none' : 'opacity-100 flex'} ${isLogin ? '' : 'pb-24 md:pb-12'}`}>
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

          <div className="flex gap-2 mb-4">
            {["email", "mobile"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setRegMethod(m)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${regMethod === m ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
              >
                {m === "email" ? "REGISTER VIA EMAIL" : "REGISTER VIA MOBILE"}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 md:max-h-[400px] overflow-y-visible md:overflow-y-auto pr-2 scrollbar-hide">
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
                required={regMethod === "email"}
                disabled={otpSent}
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 font-bold border border-gray-200"
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
                            setRegPhone(c.code + regPhone.replace(/^\+\d+/, ""));
                            setShowCountryDropdown(false);
                            setSearchQuery("");
                          }}
                          className="w-full flex items-center justify-between p-2 hover:bg-primary/5 rounded-xl transition-colors group"
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
                value={regPhone}
                onChange={(e) => {
                    let val = e.target.value;
                    if (val && !val.startsWith('+')) val = '+' + val;
                    setRegPhone(val);
                }}
                placeholder={regMethod === "mobile" ? "Mobile Number (Required)" : "Mobile Number (Optional)"}
                className="w-full pl-28 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                required={regMethod === "mobile"}
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
        <div className={`w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12 md:ml-auto transition-all duration-700 ${!isLogin ? 'hidden md:flex opacity-0 pointer-events-none' : 'opacity-100 flex'}`}>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Sign In</h2>
          <p className="text-gray-500 mb-10">Welcome back to HireFilter</p>
          
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginCountryDropdown(!showLoginCountryDropdown)}
                  className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 font-bold border border-gray-200"
                >
                  <span>{selectedLoginCountry.flag}</span>
                  <span className="text-xs">{selectedLoginCountry.code}</span>
                  <ChevronDown size={14} className={`transition-transform ${showLoginCountryDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showLoginCountryDropdown && (
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
                            setSelectedLoginCountry({ code: c.code, flag: c.flag });
                            setShowLoginCountryDropdown(false);
                            setSearchQuery("");
                          }}
                          className="w-full flex items-center justify-between p-2 hover:bg-primary/5 rounded-xl transition-colors group"
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
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email or Mobile Number"
                className="w-full pl-28 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
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
        className="hidden md:flex absolute top-0 left-0 w-full md:w-1/2 h-full bg-gradient-to-br from-primary to-primary-dark z-10 flex-col items-center justify-center p-12 text-center text-white overflow-hidden pointer-events-auto"
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

      <div className="md:hidden sticky md:absolute bottom-0 left-0 right-0 p-6 flex justify-center bg-white border-t border-gray-100 z-20">
         <button onClick={() => {
            setIsLogin(!isLogin);
            window.scrollTo({ top: 0, behavior: 'smooth' });
         }} className="text-primary font-bold">
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
            className="bg-white p-8 rounded-[2.5rem] text-center max-w-sm w-full shadow-2xl relative overflow-hidden"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-50`}>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Authentication Failed
            </h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">{errorMessage}</p>
            
            <button 
              onClick={() => {
                setErrorPopup(false);
              }}
              className={`w-full py-4 rounded-2xl font-bold transition-all bg-gray-100 text-gray-700`}
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