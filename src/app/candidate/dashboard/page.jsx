"use client";

import { motion } from "framer-motion";
import {
    Briefcase,
    CheckCircle,
    Clock,
    Search,
    MapPin,
    IndianRupee,
    ArrowRight,
    Calendar,
    Target,
    XCircle,
    Eye
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useJobContext } from "@/context/JobContext";
import axios from "axios";
import { DashboardSkeleton } from "@/components/Skeleton";

export default function CandidateDashboard() {
    const [userName, setUserName] = useState("Candidate");
    const [dashboardStats, setDashboardStats] = useState([
        { label: "Applications", value: "0", icon: Briefcase, color: "text-[#7C5CFC]", bg: "bg-[#EBE8FF]" },
        { label: "Shortlisted", value: "0", icon: Target, color: "text-[#FF5C5C]", bg: "bg-[#FFEDE1]" },
        { label: "Interviews", value: "0", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Offers", value: "0", icon: CheckCircle, color: "text-[#27C052]", bg: "bg-[#EFFFED]" },
    ]);

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingActivities, setLoadingActivities] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const allData = response.data.data || response.data || [];
                
                // Calculate dynamic stats
                const appCount = allData.length;
                const shortlistedCount = allData.filter(app => ["shortlisted", "shortlist"].includes((app.status || "").toLowerCase())).length;
                const interviewCount = allData.filter(app => ["interviewing", "interview", "scheduled"].includes((app.status || "").toLowerCase())).length;
                const offerCount = allData.filter(app => ["offer", "hired", "offer sent"].includes((app.status || "").toLowerCase())).length;

                setDashboardStats(prev => [
                    { ...prev[0], value: appCount.toString() },
                    { ...prev[1], value: shortlistedCount.toString() },
                    { ...prev[2], value: interviewCount.toString() },
                    { ...prev[3], value: offerCount.toString() }
                ]);

                // Sort by updatedAt and take top 4
                const latestApps = [...allData]
                    .filter(app => app.job)
                    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                    .slice(0, 4);

                const mappedActivities = latestApps.map(app => {
                    const status = (app.status || "applied").toLowerCase();
                    const company = app.job?.department || "Company";
                    const jobTitle = app.job?.jobTitle || "Position";
                    const updatedAt = new Date(app.updatedAt || app.createdAt);
                    const now = new Date();
                    const diffInHours = Math.floor((now - updatedAt) / (1000 * 60 * 60));
                    
                    let timeAgo = "Recently";
                    if (diffInHours < 1) timeAgo = "Just now";
                    else if (diffInHours < 24) timeAgo = `${diffInHours} hours ago`;
                    else timeAgo = `${Math.floor(diffInHours / 24)} days ago`;

                    // Logic for display text
                    let title = "";
                    let icon = Briefcase;
                    let color = "text-[#7C5CFC]";
                    let bg = "bg-[#EBE8FF]";

                    if (status === "hired") {
                        title = `Hired for <span class="text-[#080808] font-bold">${jobTitle}</span> at <span class="text-[#7C5CFC] font-bold">${company}</span>! 🎉`;
                        icon = CheckCircle;
                        color = "text-[#27C052]";
                        bg = "bg-[#EFFFED]";
                    } else if (status === "offer" || status === "offer sent") {
                        title = `Offer received for <span class="text-[#080808] font-bold">${jobTitle}</span> at <span class="text-[#7C5CFC] font-bold">${company}</span>`;
                        icon = Target;
                        color = "text-[#27C052]";
                        bg = "bg-[#EFFFED]";
                    } else if (status === "interviewing" || status === "interview") {
                        title = `Interview for <span class="text-[#080808] font-bold">${jobTitle}</span> with <span class="text-[#7C5CFC] font-bold">${company}</span>`;
                        icon = Calendar;
                        color = "text-blue-500";
                        bg = "bg-blue-50";
                    } else if (status === "shortlisted" || status === "shortlist") {
                        title = `Shortlisted for <span class="text-[#080808] font-bold">${jobTitle}</span> at <span class="text-[#7C5CFC] font-bold">${company}</span>`;
                        icon = Target;
                        color = "text-[#7C5CFC]";
                        bg = "bg-[#EBE8FF]";
                    } else if (status === "rejected") {
                        title = `Update for <span class="text-[#080808] font-bold">${jobTitle}</span> at <span class="text-[#7C5CFC] font-bold">${company}</span>`;
                        icon = XCircle;
                        color = "text-[#FF5C5C]";
                        bg = "bg-[#FFEDE1]";
                    } else {
                        title = `Applied for <span class="text-[#080808] font-bold">${jobTitle}</span> at <span class="text-[#7C5CFC] font-bold">${company}</span>`;
                        icon = Briefcase;
                        color = "text-[#7C5CFC]";
                        bg = "bg-[#EBE8FF]";
                    }

                    return {
                        id: app._id,
                        title,
                        timeAgo,
                        icon,
                        color,
                        bg
                    };
                });

                setActivities(mappedActivities);

                // Fetch real name
                const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/getProfile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (profileRes.data?.success && profileRes.data.data?.name) {
                    setUserName(profileRes.data.data.name);
                }
            } catch (error) {
                console.error("Error fetching activities:", error);
                if (error.response?.status === 401) {
                    logout(); // Redirect to login on unauthorized
                }
            } finally {
                setLoadingActivities(false);
            }
        };

        fetchActivities();
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setUserName(storedName);
        }
        
        // Overall loading state
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };


    const { jobs } = useJobContext();
    const [userSkills, setUserSkills] = useState([]);

    useEffect(() => {
        const fetchUserSkills = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/getProfile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data?.success && res.data.data?.profile?.skills) {
                    setUserSkills(res.data.data.profile.skills);
                }
            } catch (e) {
                console.error("Error fetching user skills for matching:", e);
                if (e.response?.status === 401) {
                    logout();
                }
            }
        };
        fetchUserSkills();
    }, []);

    // Get latest 5 active jobs and match with user skills
    const recommendedJobs = jobs
        .filter(job => (job.status || "").toLowerCase() === "active")
        .map(job => {
            let matchScore = 70;
            let matchingSkills = [];
            if (userSkills.length > 0 && job.skills?.length > 0) {
                const jobSkills = job.skills.map(s => s.toLowerCase());
                matchingSkills = userSkills.filter(s => jobSkills.includes(s.toLowerCase()));
                const ratio = matchingSkills.length / Math.max(jobSkills.length, 1);
                matchScore = 70 + (ratio * 25);
            } else {
                matchScore = Math.floor(Math.random() * (85 - 75) + 75);
            }

            return {
                id: job.id,
                title: job.title,
                company: job.department || "Engineering",
                location: job.location,
                type: job.type,
                salary: job.salary,
                match: `${Math.floor(matchScore)}%`,
                matchingSkills: matchingSkills
            };
        })
        .sort((a, b) => parseInt(b.match) - parseInt(a.match))
        .slice(0, 5);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 p-6 bg-[#F4F7FE] min-h-[calc(100vh-80px)]"
        >
            {/* Welcome Section */}
            <motion.div variants={item} className="px-2">
                <h1 className="text-3xl font-bold text-[#080808]">
                    Welcome back, <span className="text-[#080808] font-semibold">{userName}</span>
                </h1>
                <p className="text-[#71717A] mt-1">Here's what's happening with your job search today.</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                {dashboardStats.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={item}
                        initial="hidden"
                        animate="show"
                        className={`group relative p-6 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] overflow-hidden transition-all duration-300 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)]`}
                    >
                        <div className="flex justify-between items-start mb-4 z-10 relative">
                            <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-sm font-semibold ${stat.color}`}>
                                +2 this week
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-[#080808] mb-1 z-10 relative">{stat.value}</h3>
                        <p className="text-[#71717A] text-sm font-medium z-10 relative">{stat.label}</p>
                        
                        {/* Soft decorative blur */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7C5CFC]/5 rounded-full blur-2xl group-hover:bg-[#7C5CFC]/10 transition-colors duration-500"></div>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                {/* Recommended Jobs */}
                <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[#080808]">Recommended for You</h2>
                        <Link href="/candidate/jobs">
                            <button className="text-sm font-semibold text-[#7C5CFC] hover:text-[#6A4FE0] transition-colors bg-[#EBE8FF] px-4 py-1.5 rounded-full flex items-center gap-2">
                                View All <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recommendedJobs.length > 0 ? (
                            recommendedJobs.map((job) => (
                                <Link href={`/candidate/jobs/${job.id}`} key={job.id}>
                                    <motion.div
                                        variants={item}
                                        initial="hidden"
                                        animate="show"
                                        className="flex items-start gap-4 p-4 rounded-[12px] hover:bg-[#F4F7FE] transition-all cursor-pointer border border-[#FFFFFF] hover:border-[#EBE8FF] group relative overflow-hidden"
                                    >
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs text-[#71717A] font-medium bg-[#F4F7FE] px-2 py-1 rounded-[8px] whitespace-nowrap">{job.type}</span>
                                        </div>
                                    </div>

                                    <div className="w-12 h-12 rounded-[12px] bg-[#EBE8FF] text-[#7C5CFC] flex items-center justify-center text-lg font-bold shrink-0 border border-transparent group-hover:border-[#7C5CFC]/30">
                                        {job.company.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-24">
                                        <h3 className="text-[#080808] text-[15px] font-semibold group-hover:text-[#7C5CFC] transition-colors truncate">{job.title}</h3>
                                        <p className="text-[#71717A] text-sm font-medium mb-2 truncate">{job.company}</p>

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#71717A] font-medium">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <IndianRupee className="w-3.5 h-3.5" />
                                                {job.salary ? job.salary.replace(/\$/g, '') : 'N/A'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                Posted recently
                                            </span>
                                        </div>

                                        {/* Matching Skills Tags */}
                                        {job.matchingSkills?.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className="text-[10px] text-[#71717A] uppercase tracking-wider font-bold h-fit mt-1">Matched:</span>
                                                {job.matchingSkills.slice(0, 3).map((skill, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-[#EBE8FF] text-[#7C5CFC] rounded-md text-[10px] font-bold border border-[#7C5CFC]/10">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.matchingSkills.length > 3 && (
                                                    <span className="text-[10px] text-[#71717A] font-medium mt-0.5">+{job.matchingSkills.length - 3} more</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-[#71717A] text-sm">No recommended jobs found at the moment.</p>
                        </div>
                    )}
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Activity Feed */}
                    <div className="bg-white border border-[#F1F1F1] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all">
                        <h3 className="font-bold text-[#080808] mb-6 text-lg">Recent Activity</h3>
                        <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#F1F1F1]">
                            {loadingActivities ? (
                                <div className="flex items-center justify-center py-10">
                                    <Clock className="w-5 h-5 animate-spin text-[#7C5CFC]" />
                                </div>
                            ) : activities.length > 0 ? (
                                activities.map((activity) => (
                                    <div key={activity.id} className="relative flex gap-4">
                                        <div className={`w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center shrink-0 z-10`}>
                                            <activity.icon className={`w-4 h-4 ${activity.color}`} />
                                        </div>
                                        <div className="pt-1">
                                            <p className="text-sm text-[#71717A] font-medium" dangerouslySetInnerHTML={{ __html: activity.title }} />
                                            <span className="text-xs text-[#71717A] font-medium">{activity.timeAgo}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-[#71717A] text-center py-4">No recent activity yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
