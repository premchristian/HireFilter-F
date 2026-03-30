"use client";

import { motion } from "framer-motion";
import { 
    Users, 
    Briefcase, 
    ArrowUpRight, 
    ArrowDownRight,
    Globe,
    CheckCircle2,
    XCircle,
    UserPlus,
    Clock,
    Download
} from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function AdminDashboard() {
    const [userName, setUserName] = useState("Admin");

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setUserName(storedName);
        }
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const [stats, setStats] = useState([
        { label: "Total Users", value: "0", icon: Users, color: "text-amber-400" },
        { label: "Active Jobs", value: "0", icon: Briefcase, color: "text-blue-400" },
        { label: "Total Hired", value: "0", icon: CheckCircle2, color: "text-emerald-400" },
        { label: "Shortlisted", value: "0", icon: UserPlus, color: "text-indigo-400" },
        { label: "Rejected", value: "0", icon: XCircle, color: "text-rose-400" },
    ]);

    const [trafficData, setTrafficData] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateReport = () => {
        setIsGenerating(true);
        try {
            const now = new Date();
            const generatedAt = now.toLocaleString('en-IN', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
            });

            const wb = XLSX.utils.book_new();

            // --- Sheet 1: Platform Summary ---
            const summaryData = [
                ['HireFilter Admin – Platform Summary Report'],
                ['Generated on:', generatedAt],
                [],
                ['Metric', 'Value', 'Monthly Trend'],
                ...stats.map(s => [s.label, s.value.replace(/,/g, ''), s.trend || 'N/A'])
            ];
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, summarySheet, 'Platform Summary');

            // --- Sheet 2: Monthly Traffic ---
            if (trafficData.length > 0) {
                const trafficRows = [
                    ['Monthly Platform Traffic'],
                    ['Generated on:', generatedAt],
                    [],
                    ['Month', 'New Users', 'New Jobs', 'Total Activity'],
                    ...trafficData.map(m => [m.label, m.users, m.jobs, m.total])
                ];
                const trafficSheet = XLSX.utils.aoa_to_sheet(trafficRows);
                trafficSheet['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
                XLSX.utils.book_append_sheet(wb, trafficSheet, 'Monthly Traffic');
            }

            const dateTag = now.toISOString().split('T')[0];
            XLSX.writeFile(wb, `HireFilter_Report_${dateTag}.xlsx`);
        } catch (err) {
            console.error('Report generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };



    useEffect(() => {
        const fetchDashboardData = async () => {
             const token = localStorage.getItem("token");
             if (!token) return;
             
             const headers = { 'Authorization': `Bearer ${token}` };

             try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/admin-stats`, { headers });
                
                if (res.ok) {
                    const result = await res.json();
                    const data = result.data;

                    if (data) {
                        const { totals, applications } = data;

                        setStats([
                            { 
                                label: "Total Users", 
                                value: (totals.users || 0).toLocaleString(), 
                                icon: Users, 
                                color: "text-amber-400" 
                            },
                            { 
                                label: "Active Jobs", 
                                value: (totals.jobs || 0).toLocaleString(), 
                                icon: Briefcase, 
                                color: "text-blue-400" 
                            },
                            { 
                                label: "Total Hired", 
                                value: (applications.hired || 0).toLocaleString(), 
                                icon: CheckCircle2, 
                                color: "text-emerald-400" 
                            },
                            { 
                                label: "Shortlisted", 
                                value: (applications.shortlisted || 0).toLocaleString(), 
                                icon: UserPlus, 
                                color: "text-indigo-400" 
                            },
                            { 
                                label: "Rejected", 
                                value: (applications.rejected || 0).toLocaleString(), 
                                icon: XCircle, 
                                color: "text-rose-400" 
                            },
                        ]);
                    }
                }

                // Fallback or additional fetching for graph data if needed
                // For now, let's assume we still need to fetch users and jobs for the graph 
                // as the new endpoint only provides aggregated counts.
                const usersRes = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/api/users/admin/all-users', { headers });
                const jobsRes = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/api/jobs', { headers });

                let usersList = [];
                if (usersRes.ok) {
                    const data = await usersRes.json();
                    const rawData = data.users || data.data || data;
                    usersList = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.users) ? rawData.users : []);
                }

                let jobsList = [];
                if (jobsRes.ok) {
                    const data = await jobsRes.json();
                    const rawData = data.jobs || data.data || data;
                    jobsList = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.jobs) ? rawData.jobs : []);
                }

                // --- Process Graph Data (Monthly) ---
                const processMonthlyStats = () => {
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const currentMonth = new Date().getMonth();
                    
                    const graphMonths = [];
                    for (let i = 5; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(1); // Crucial: set date to 1st to avoid month rolling over Feb on 30th/31st
                        d.setMonth(currentMonth - i);
                        graphMonths.push({
                            name: months[d.getMonth()],
                            year: d.getFullYear(),
                            monthIndex: d.getMonth(),
                            users: 0,
                            jobs: 0,
                        });
                    }

                    usersList.forEach(user => {
                        if (!user.createdAt) return;
                        const date = new Date(user.createdAt);
                        const monthItem = graphMonths.find(m => m.monthIndex === date.getMonth() && m.year === date.getFullYear());
                        if (monthItem) monthItem.users++;
                    });

                    jobsList.forEach(job => {
                        const dateStr = job.createdAt || job.postedAt || job.date;
                        if (!dateStr) return;
                        const date = new Date(dateStr);
                        const monthItem = graphMonths.find(m => m.monthIndex === date.getMonth() && m.year === date.getFullYear());
                        if (monthItem) monthItem.jobs++;
                    });

                    const maxVal = Math.max(...graphMonths.map(m => m.users + m.jobs), 10);

                    return graphMonths.map(m => ({
                        label: m.name,
                        users: m.users,
                        jobs: m.jobs,
                        total: m.users + m.jobs,
                        height: Math.min(((m.users + m.jobs) / maxVal) * 100, 100)
                    }));
                };

                setTrafficData(processMonthlyStats());

             } catch (error) {
                 console.error("Dashboard Data Fetch Error:", error);
             }
        };

        fetchDashboardData();
    }, []);

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Platform <span className="text-amber-500">Control</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Welcome back, <span className="text-white">{userName}</span>. System overview ready.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={generateReport}
                        disabled={isGenerating}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className={`w-4 h-4 ${isGenerating ? 'animate-bounce text-amber-500' : ''}`} />
                        {isGenerating ? 'Generating…' : 'Generate Report'}
                    </button>

                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map((stat, index) => (
                    <motion.div key={index} variants={item} className="p-8 rounded-3xl bg-[#111418] border border-white/5 hover:border-amber-500/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/5 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-white mb-2">{stat.value}</h3>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Traffic Monitor Placeholder */}
            <motion.div variants={item} className="p-8 rounded-3xl bg-[#111418] border border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white">Platform Traffic</h3>
                        <p className="text-xs text-gray-500 mt-1">Daily active users vs job applications</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            LIVE
                        </div>
                    </div>
                </div>
                <div className="h-64 flex items-end justify-between gap-6 px-4">
                    {trafficData.length > 0 ? trafficData.map((data, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                            <div className="w-full relative flex flex-col items-center justify-end h-full">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(data.height, 5)}%` }} // Min 5% height for visibility
                                    transition={{ delay: i * 0.05, duration: 0.8 }}
                                    className="w-full bg-linear-to-t from-amber-500/20 to-amber-500 rounded-t-lg relative group-hover:from-amber-500/30 transition-all shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                                />
                                <div className="absolute bottom-full mb-3 px-3 py-1.5 bg-white text-black text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-10 pointer-events-none shadow-xl border border-black/5 whitespace-nowrap">
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-500 text-[8px] uppercase">{data.label} {new Date().getFullYear()}</span>
                                        <span>{data.users} Users, {data.jobs} Jobs</span>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                                </div>
                            </div>
                            <span className="mt-6 text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:text-amber-500 transition-colors">
                                {data.label}
                            </span>
                        </div>
                    )) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Loading traffic data...</div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
