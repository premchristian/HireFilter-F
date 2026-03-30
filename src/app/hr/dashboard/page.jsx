"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Briefcase, FileText, TrendingUp, Clock, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useJobContext } from "@/context/JobContext";
import { DashboardSkeleton } from "@/components/Skeleton";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";

export default function DashboardPage() {
  const { jobs } = useJobContext();
  const [userName, setUserName] = useState("HR Manager");
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    hiredCandidates: 0,
    totalApplications: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/getProfile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setUserName(data.data.name || "HR Manager");
          setCurrentUserId(data.data._id);
        }
      } catch (err) {
        console.error("Error fetching HR profile", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUserId || jobs.length === 0) return;

      // Filter jobs by current user
      const myJobs = jobs.filter(job => {
        const creatorId = typeof job.createdBy === 'object' ? job.createdBy?._id : job.createdBy;
        return creatorId === currentUserId;
      });

      // Active Jobs from myJobs
      const active = myJobs.filter(job => job.status === "Active").length;

      let totalCand = 0;
      let hiredCand = 0;
      let jobData = [];
      let allApps = [];

      const token = localStorage.getItem("token");
      if (token && myJobs.length > 0) {
        try {
          const results = await Promise.all(myJobs.map(async (job) => {
            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application/${job.id}/getAll`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              let appsForThisJob = [];
              if (data.success && data.data) {
                appsForThisJob = data.data;
                data.data.forEach(app => {
                  allApps.push({
                    ...app,
                    jobTitle: job.title || job.role || "Job",
                    jobId: job.id || job._id
                  });
                  if ((app.status || "").toLowerCase() === "hired") {
                    hiredCand++;
                  }
                });
              }
              return { title: job.title || job.role || "Job", count: appsForThisJob.length };
            } catch (err) {
              console.error(`Error fetching counts for job ${job.id}`, err);
              return { title: job.title || job.role || "Job", count: 0 };
            }
          }));
          
          totalCand = allApps.length; // Actually total unique apps across my jobs
          jobData = results;

          // Recent applications from my jobs
          const sortedApps = allApps.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
          setRecentApps(sortedApps);

          // Recent jobs from my jobs
          const sortedJobs = [...myJobs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
          setRecentJobs(sortedJobs);

        } catch (e) {
          console.error("Error fetching candidate stats", e);
        }
      }

      setStats({ 
        totalCandidates: totalCand, 
        activeJobs: active,
        hiredCandidates: hiredCand,
        totalApplications: allApps.length
      });
      setChartData(jobData);
      
      // Artificial delay for smooth transition
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    };

    fetchStats();
  }, [jobs, currentUserId]);

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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 p-6 bg-[#F4F7FE] min-h-[calc(100vh-80px)]"
    >
      {/* Header */}
      <motion.div variants={item} className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold text-[#080808]">
            Overview
          </h1>
          <p className="text-[#71717A] mt-1">Welcome back, <span className="text-[#080808] font-semibold">{userName}</span></p>
        </div>
        <Link href="/hr/jobs/create">
          <button className="bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white px-6 py-2 rounded-[12px] font-medium transition-colors shadow-[0px_4px_20px_rgba(124,92,252,0.3)] border border-[#7C5CFC]">
            + New Job
          </button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {[
          { label: "Total Candidates", value: stats.totalCandidates.toLocaleString(), change: "", icon: Users, bg: "bg-[#EBE8FF] text-[#7C5CFC]" },
          { label: "Active Jobs", value: stats.activeJobs.toString(), change: "", icon: Briefcase, bg: "bg-[#FFEDE1] text-[#FF5C5C]" },
          { label: "Total Applications", value: stats.totalApplications.toString(), change: "", icon: FileText, bg: "bg-[#F4F7FE] text-[#7C5CFC]" },
          { label: "Hired Candidates", value: stats.hiredCandidates.toString(), change: "", icon: TrendingUp, bg: "bg-[#EFFFED] text-[#27C052]" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            className="group relative p-6 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] overflow-hidden transition-all duration-300 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)]"
          >
            <div className="flex justify-between items-start mb-4 z-10 relative">
              <div className={`w-12 h-12 rounded-[12px] ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>  
              <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-[#27C052]' : 'text-[#FF5C5C]'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-[#080808] mb-1 z-10 relative">{stat.value}</h3>
            <p className="text-[#71717A] text-sm font-medium z-10 relative">{stat.label}</p>

            {/* Soft decorative blur */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7C5CFC]/5 rounded-full blur-2xl group-hover:bg-[#7C5CFC]/10 transition-colors duration-500"></div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Line Chart Section */}
      <motion.div variants={item} className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] mx-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#080808]">Applications per Job Post</h3>
            <p className="text-sm text-[#71717A] mt-1">Overview of applicant distribution across your postings</p>
          </div>
          <span className="text-sm text-[#71717A] font-medium px-3 py-1 bg-[#F4F7FE] rounded-[12px] border border-[#F1F1F1]">
            Total Posts: {chartData.length}
          </span>
        </div>

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" vertical={false} />
                <XAxis
                  dataKey="title"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717A', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717A', fontSize: 12, fontWeight: 600 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #F1F1F1',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
                    padding: '12px 16px',
                  }}
                  labelStyle={{ color: '#080808', fontWeight: 700, marginBottom: 4 }}
                  itemStyle={{ color: '#7C5CFC', fontWeight: 600 }}
                  formatter={(value) => [`${value} Applicants`, '']}
                  labelFormatter={(label) => label}
                  cursor={{ stroke: '#7C5CFC', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#7C5CFC"
                  strokeWidth={3}
                  fill="url(#colorApplicants)"
                  dot={{ r: 5, fill: '#FFFFFF', stroke: '#7C5CFC', strokeWidth: 2.5 }}
                  activeDot={{ r: 7, fill: '#7C5CFC', stroke: '#FFFFFF', strokeWidth: 3, style: { filter: 'drop-shadow(0 0 6px rgba(124,92,252,0.4))' } }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-[#71717A] font-medium h-full gap-3 bg-[#F4F7FE] rounded-[16px] border border-dashed border-[#F1F1F1]">
              <FileText className="w-8 h-8 opacity-50" />
              <span>No application data available to display chart.</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Activity Section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">

        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#080808]">Recent Applications</h3>
            <Link href="/hr/applicants">
              <button className="text-sm font-semibold text-[#7C5CFC] hover:text-[#6A4FE0] transition-colors bg-[#EBE8FF] px-4 py-1.5 rounded-full">View All</button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentApps.length > 0 ? recentApps.map((app, i) => (
              <Link 
                key={app._id || app.id || i} 
                href={`/hr/applicants/${app.jobId}/${app._id || app.id}`}
                className="block"
              >
                <div className="flex items-start gap-4 p-4 rounded-[12px] hover:bg-[#F4F7FE] transition-all cursor-pointer border border-[#FFFFFF] hover:border-[#EBE8FF] group">
                  <div className={`w-10 h-10 rounded-full text-[#7C5CFC] bg-[#EBE8FF] flex items-center justify-center shrink-0 border border-transparent group-hover:border-[#7C5CFC]/30`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#080808] text-sm font-semibold group-hover:text-[#7C5CFC] transition-colors">{app.user?.name || app.name || "Candidate"} applied for {app.jobTitle}</h4>
                    <p className="text-sm text-[#71717A] font-medium">Email: {app.user?.email || app.email || "Not provided"}</p>
                  </div>
                  <span className="text-xs text-[#71717A] bg-[#F4F7FE] px-2 py-1 rounded-[8px] whitespace-nowrap font-medium">
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Just now"}
                  </span>
                </div>
              </Link>
            )) : (
              <p className="text-[#71717A] text-sm">No recent applications.</p>
            )}
          </div>
        </div>

        {/* Quick Actions / Mini Profile */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <h3 className="text-lg font-bold text-[#080808] mb-4">Recently Posted Jobs</h3>
            <div className="space-y-4">
              {recentJobs.length > 0 ? recentJobs.map((job, i) => {
                const dateObj = new Date(job.createdAt || Date.now());
                const month = dateObj.toLocaleString('en-US', { month: 'short' });
                const day = dateObj.getDate();
                return (
                  <div key={job.id || i} className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-[#F4F7FE] transition-all cursor-pointer group border border-transparent hover:border-[#EBE8FF]">
                    <div className="w-12 h-12 rounded-[12px] bg-[#F4F7FE] flex flex-col items-center justify-center text-xs font-bold border border-[#F1F1F1] group-hover:bg-[#7C5CFC] group-hover:text-white transition-all">
                      <span className="text-[#7C5CFC] uppercase group-hover:text-white transition-colors">{month}</span>
                      <span className="text-[#080808] text-lg transition-colors group-hover:text-white">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#080808] font-bold text-sm truncate">{job.title || job.role}</p>
                      <p className="text-[#71717A] text-xs font-medium truncate">Created: {new Date(job.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <Link href={`/hr/jobs/${job.id}`}>
                      <button className="ml-auto text-[#71717A] hover:text-[#7C5CFC] transition-colors p-2 z-10 hover:bg-[#EBE8FF] rounded-[8px]">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>
                );
              }) : (
                <p className="text-[#71717A] text-sm">No recent jobs found.</p>
              )}
            </div>
          </div>
        </div>

      </motion.div>
      <ProfileCompletionModal />
    </motion.div>
  );
}
