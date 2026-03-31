"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import Link from 'next/link';
import { 
  Search, 
  Users, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  LayoutDashboard,
  Menu,
  X,
  Zap,
  Globe,
  Settings,
  MessageSquare,
  ShieldCheck,
  Star,
  Quote,
  BarChart3,
  Bell
} from 'lucide-react';
import { ChatbotProvider } from "@/context/ChatbotContext";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import ChatbotAnalytics from "@/components/chatbot/ChatbotAnalytics";
import { logout } from "@/utils/auth";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      if (token && role) {
        setUser({ token, role });
      } else {
        setUser(null);
      }
    };

    checkAuth();

    window.addEventListener("auth-change", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (!user?.role) return "/";
    const role = user.role === "user" ? "candidate" : user.role;
    return `/${role}/dashboard`;
  };
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 mx-auto max-w-7xl transition-all duration-500 ${scrolled ? 'mt-0 rounded-none w-full glass shadow-lg' : 'mt-6 rounded-2xl glass border-white/50'}`}>
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-text tracking-tight">HireFilter</span>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-muted font-medium">
          <Link href="/" className="hover:text-primary transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>
          <a href="#vision" className="hover:text-primary transition-colors relative group">
            About Us
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </a>
          <a href="#features" className="hover:text-primary transition-colors relative group">
            Our Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </a>
          <a href="#footer" className="hover:text-primary transition-colors relative group">
            Contact Us
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <button 
                onClick={handleLogout}
                className="btn-secondary hover:shadow-primary/5 px-6 py-2"
              >
                Log Out
              </button>
              <Link 
                href={getDashboardLink()} 
                className="btn-primary hover:shadow-primary/30 px-6 py-2"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary hover:shadow-primary/5 px-6 py-2">Log In</Link>
              <Link href="/login?mode=register" className="btn-primary hover:shadow-primary/30 px-6 py-2">Get Started</Link>
            </>
          )}
        </div>

        <button className="md:hidden text-text p-2 hover:bg-primary/5 rounded-lg transition-colors" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute top-full left-0 right-0 glass mt-2 p-6 rounded-2xl flex flex-col gap-4 md:hidden shadow-2xl border-primary/10"
        >
          <Link href="/" className="text-lg font-medium text-text hover:text-primary transition-colors">Home</Link>
          <a href="#vision" className="text-lg font-medium text-text hover:text-primary transition-colors">About Us</a>
          <a href="#features" className="text-lg font-medium text-text hover:text-primary transition-colors">Our Services</a>
          <a href="#footer" className="text-lg font-medium text-text hover:text-primary transition-colors">Contact Us</a>
          <hr className="border-primary/10" />
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <button 
                  onClick={handleLogout}
                  className="w-full btn-secondary text-center px-6 py-3"
                >
                  Log Out
                </button>
                <Link 
                  href={getDashboardLink()} 
                  onClick={() => setIsOpen(false)}
                  className="w-full btn-primary text-center px-6 py-3"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                  className="w-full btn-secondary text-center px-6 py-3"
                >
                  Log In
                </Link>
                <Link 
                  href="/login?mode=register" 
                  onClick={() => setIsOpen(false)}
                  className="w-full btn-primary text-center px-6 py-3"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

const HeroModel = () => {
  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-[3rem] border border-primary/20 backdrop-blur-xl overflow-hidden shadow-2xl"
      >
        {/* Mock UI Header */}
        <div className="p-6 border-b border-primary/10 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400/50" />
            <div className="w-3 h-3 rounded-full bg-amber-400/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
          </div>
          <div className="h-4 w-32 bg-primary/10 rounded-full animate-pulse" />
        </div>

        {/* Floating Cards Animation */}
        <div className="p-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              className="bg-white/40 p-4 rounded-2xl border border-white/60 shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 bg-primary/20 rounded-full" />
                <div className="h-2 w-32 bg-primary/10 rounded-full" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="px-3 py-1 bg-primary/10 rounded-lg text-primary text-[10px] font-bold"
              >
                9{i}% Match
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Scanning Line */}
        <motion.div 
          animate={{ y: [0, 400, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10"
        />
      </motion.div>

      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-6 -right-6 p-6 bg-white rounded-3xl shadow-xl border border-primary/5 z-20"
      >
        <Zap className="text-primary w-10 h-10" />
      </motion.div>
    </div>
  );
};

const RecruiterModel = () => {
  return (
    <div className="relative w-full aspect-video bg-primary-dark rounded-[2.5rem] overflow-hidden shadow-2xl p-8 border border-white/10">
      <div className="flex gap-8 h-full">
        {/* Coding/Data Side */}
        <div className="flex-1 space-y-3 opacity-40">
           {[...Array(8)].map((_, i) => (
             <motion.div 
               key={i}
               initial={{ width: 0 }}
               whileInView={{ width: `${Math.random() * 60 + 40}%` }}
               className="h-2 bg-primary/40 rounded-full" 
             />
           ))}
        </div>
        {/* Verification Hub */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 border-4 border-dashed border-primary/30 rounded-full flex items-center justify-center"
          >
            <div className="w-24 h-24 border-4 border-primary/60 rounded-full flex items-center justify-center">
               <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
               >
                  <Search className="text-primary w-10 h-10" />
               </motion.div>
            </div>
          </motion.div>
          <div className="px-6 py-2 bg-primary/20 rounded-full text-primary font-bold text-sm">
            AI Profiling...
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateModel = () => {
  return (
    <div className="relative h-[400px] w-full max-w-sm mx-auto">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="absolute inset-0 bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-8">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-light-purple flex items-center justify-center text-white">
              <Star className="w-8 h-8" />
           </div>
           <div>
              <div className="h-4 w-24 bg-gray-100 rounded-full mb-2" />
              <div className="h-3 w-16 bg-gray-50 rounded-full" />
           </div>
        </div>
        
        <div className="space-y-6">
           <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-xs font-bold text-primary">Resume Strength</span>
                 <span className="text-xs font-bold text-primary">88%</span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '88%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-primary" 
                 />
              </div>
           </div>
           
           <div className="flex gap-3">
              <div className="flex-1 h-32 rounded-2xl bg-gray-50 flex flex-col items-center justify-center p-4">
                 <Bell className="text-primary/40 w-8 h-8 mb-2" />
                 <div className="h-2 w-12 bg-gray-200 rounded-full" />
              </div>
              <div className="flex-1 h-32 rounded-2xl bg-gray-50 flex flex-col items-center justify-center p-4">
                 <MessageSquare className="text-primary/40 w-8 h-8 mb-2" />
                 <div className="h-2 w-12 bg-gray-200 rounded-full" />
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

const Hero = () => {
  return (
    <section className="pt-48 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20 hero-gradient" id="home">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="flex-1 text-center lg:text-left"
      >
        <motion.h1 variants={fadeInUp} className="text-4xl lg:text-6xl font-extrabold text-text leading-tight mb-6">
          Hire smarter. <br />
          <span className="text-gradient">Get hired faster.</span>
        </motion.h1>
        <motion.p variants={fadeInUp} className="text-lg text-muted mb-10 max-w-lg lg:mx-0 mx-auto leading-relaxed">
          HireFilter is an job posting and job finding platform designed to streamline hiring for HR teams and job discovery for candidates.
        </motion.p>
        <motion.div variants={fadeInUp}>
          <Link href="/Register" className="btn-primary flex items-center gap-3 lg:mx-0 mx-auto group w-max">
            Get Started <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "circOut" }}
        className="flex-1 w-full"
      >
        <HeroModel />
      </motion.div>
    </section>
  );
};

const RecruiterFeatures = () => {
  const features = [
    {
      icon: <Search className="w-6 h-6 text-primary" />,
      title: "Skill Matching",
      description: "Automatically find candidates whose skills match job requirements with high precision."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: "Experience Matching",
      description: "Filter candidates based on relevant experience levels and professional background."
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Fast Hiring Workflow",
      description: "Shortlist and contact candidates quickly through integrated communication tools."
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "Job Posting Portal",
      description: "Create and manage job listings easily with standard-compliant templates."
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
      title: "Management Dashboard",
      description: "View and track all applicants in one centralized candidate management dashboard."
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto" id="recruiters">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1 w-full">
           <RecruiterModel />
        </div>
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-text mb-6">For HR / Recruiters</h2>
          <p className="text-lg text-muted mb-10 leading-relaxed">
            HireFilter helps recruiters hire faster with advanced matching algorithms and seamless candidate tracking.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="p-2 bg-primary/5 rounded-lg text-primary shrink-0">{f.icon}</div>
                <div>
                   <h4 className="font-bold text-text mb-1 text-sm">{f.title}</h4>
                   <p className="text-xs text-muted leading-snug">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const CandidateFeatures = () => {
  const features = [
    {
      icon: <Star className="w-6 h-6 text-primary" />,
      title: "Smart Job Matching",
      description: "Discover jobs matching your skills and experience levels effortlessly."
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "Resume Creator",
      description: "Build professional resumes easily with AI-optimized templates."
    },
    {
      icon: <Bell className="w-6 h-6 text-primary" />, 
      title: "Personalized Job Alerts",
      description: "Get recommended jobs sent directly to your notifications."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
      title: "Direct Communication",
      description: "Chat directly with HR teams and recruiters in real-time."
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Skill Portfolio",
      description: "Showcase your abilities, projects, and certifications in a unified profile."
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto flex flex-col items-center section-bg-gradient rounded-[4rem]" id="candidates">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-text mb-4">For Candidates</h2>
        <p className="text-muted max-w-2xl mx-auto">HireFilter empowers job seekers with tools to get noticed and hired faster by the right companies.</p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-16 w-full">
        <div className="flex-1 w-full">
           <CandidateModel />
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ x: 10 }}
              className="p-6 rounded-3xl bg-white/60 border border-white/80 shadow-sm flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-text mb-1">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CoreFeatures = () => {
  const features = [
     "Resume generation",
     "Real‑time messaging between HR and candidates",
     "Role‑based dashboards (HR & Candidate)",
     "Secure authentication system",
     "Modern responsive UI"
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16" id="features">
      <div className="flex-1">
        <h2 className="text-4xl font-bold text-text mb-8">Core Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-primary/5"
            >
              <CheckCircle2 className="text-success w-5 h-5 shrink-0" />
              <span className="text-sm font-medium text-text">{f}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 relative">
        <div className="h-64 bg-primary rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center p-8 text-center" id="vision">
           <p className="text-white font-bold text-xl italic">"Faster, Smarter, Bias-Free Hiring"</p>
        </div>
        <div className="h-64 bg-white border border-gray-100 rounded-3xl mt-12 shadow-soft flex items-center justify-center">
           <Zap className="w-16 h-16 text-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
};

const TechStack = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto text-center" id="tech-stack">
      <h2 className="text-4xl font-bold text-text mb-16">Building the Future</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-primary/5 rounded-[3rem] p-10 text-left border border-primary/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-primary w-8 h-8" />
            <h3 className="text-2xl font-bold text-text">Tech Stack</h3>
          </div>
          <div className="space-y-6">
            <div>
              <p className="font-bold text-primary mb-2 text-sm uppercase tracking-wider">Frontend</p>
              <p className="text-muted text-sm">Next.js, React, Tailwind CSS, Framer Motion</p>
            </div>
            <div>
              <p className="font-bold text-primary mb-2 text-sm uppercase tracking-wider">Backend</p>
              <p className="text-muted text-sm">Node.js, Express.js, MongoDB</p>
            </div>
            <div>
              <p className="font-bold text-primary mb-2 text-sm uppercase tracking-wider">Other</p>
              <p className="text-muted text-sm">REST APIs, Auth & Authorization, Cloud Deployment</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[3rem] p-10 text-left border border-gray-100 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-primary w-8 h-8" />
            <h3 className="text-2xl font-bold text-text">Vision & Future</h3>
          </div>
          <p className="text-muted text-sm mb-8 leading-relaxed">
            HireFilter aims to make hiring faster, smarter, and bias‑free by leveraging intelligent matching and automation.
          </p>
          <div className="grid grid-cols-2 gap-4">
             {['AI Resume Scoring', 'Interview Scheduling', 'Video Interviews', 'Analytics Dashboard'].map((s, i) => (
               <div key={i} className="flex items-center gap-2 text-xs font-semibold text-text">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {s}
               </div>
             ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="pt-20 pb-10 px-6 max-w-7xl mx-auto border-t border-gray-100" id="footer">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="text-primary w-6 h-6" />
            <span className="text-xl font-bold text-text">HireFilter</span>
          </div>
          <p className="text-muted text-xs mb-6">Hire smarter. Get hired faster.</p>
          <p className="text-xs font-bold text-text">HireFilter Team</p>
        </div>
        
        <div>
          <h4 className="font-bold text-text mb-6">Platform</h4>
          <ul className="space-y-4 text-muted text-sm">
            <li><a href="#features" className="hover:text-primary transition-colors">Skill Matching</a></li>
            <li><a href="#candidates" className="hover:text-primary transition-colors">Resume Creator</a></li>
            <li><a href="#features" className="hover:text-primary transition-colors">Job Alerts</a></li>
          </ul>
        </div>

        <div>
           <h4 className="font-bold text-text mb-6">Company</h4>
           <ul className="space-y-4 text-muted text-sm">
             <li><a href="#vision" className="hover:text-primary transition-colors">Vision</a></li>
             <li><a href="#tech-stack" className="hover:text-primary transition-colors">Tech Stack</a></li>
             <li><a href="#tech-stack" className="hover:text-primary transition-colors">Future</a></li>
           </ul>
        </div>

        <div>
           <h4 className="font-bold text-text mb-6">Legal</h4>
           <ul className="space-y-4 text-muted text-sm">
             <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
             <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
             <li><a href="#" className="hover:text-primary transition-colors">MIT License</a></li>
           </ul>
        </div>
      </div>
      <div className="text-center text-muted text-[10px] opacity-50">
        <p>© 2024 HireFilter Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  return (
    <ChatbotProvider>
      <main className="min-h-screen bg-background relative selection:bg-primary selection:text-white">
        <div className="noise" />
        <Navbar />
        <Hero />
        <RecruiterFeatures />
        <CandidateFeatures />
        <CoreFeatures />
        <TechStack />
        <Footer />
        <ChatbotWidget />
        <ChatbotAnalytics />
      </main>
    </ChatbotProvider>
  );
}
