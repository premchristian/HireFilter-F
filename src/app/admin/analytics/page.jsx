"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart3,
    TrendingUp,
    Users,
    Briefcase,
    IndianRupee,
    Target,
    Zap,
    Download,
    Activity,
    LineChart,
    PieChart as PieIcon,
    ArrowUpRight,
    Globe,
    Shield,
    BarChart,
    Loader2,
    CheckCircle2
} from "lucide-react";
import * as XLSX from "xlsx";

export default function GlobalAnalyticsPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState("idle");
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    const [lineGraphData, setLineGraphData] = useState([]);
    const [viewGranularity, setViewGranularity] = useState("daily"); // daily or monthly
    const [activeSeries, setActiveSeries] = useState("all"); // all, jobs, candidates
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/admin-stats`, { headers });
                const [usersRes, jobsRes] = await Promise.all([
                    fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/api/users/admin/all-users', { headers }),
                    fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/api/jobs', { headers })
                ]);

                if (statsRes.ok) {
                    const result = await statsRes.json();
                    setData(result.data);
                }

                let usersList = [];
                if (usersRes.ok) {
                    const d = await usersRes.json();
                    const rawData = d.users || d.data || d;
                    usersList = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.users) ? rawData.users : []);
                }

                let jobsList = [];
                if (jobsRes.ok) {
                    const d = await jobsRes.json();
                    const rawData = d.jobs || d.data || d;
                    jobsList = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.jobs) ? rawData.jobs : []);
                }

                // Process Line Graph Data (Last 14 days)
                const days = 14;
                const activityMap = [];
                const now = new Date();
                
                for (let i = days - 1; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(now.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    activityMap.push({
                        date: date,
                        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        candidates: 0,
                        jobs: 0,
                        hrs: 0
                    });
                }

                const processIntoSeries = (list, key) => {
                    if (!Array.isArray(list)) return;
                    list.forEach(item => {
                        const dateStr = item.createdAt || item.postedAt || item.date || item.appliedAt || item.updatedAt;
                        if (!dateStr) return;
                        const created = new Date(dateStr);
                        if (isNaN(created.getTime())) return;
                        
                        const match = activityMap.find(d => 
                            d.date.getDate() === created.getDate() && 
                            d.date.getMonth() === created.getMonth() &&
                            d.date.getFullYear() === created.getFullYear()
                        );
                        if (match) match[key]++;
                    });
                };

                processIntoSeries(usersList.filter(u => {
                    const role = (u.role || u.type || '').toLowerCase();
                    return role !== 'hr' && !u.isHR;
                }), 'candidates');
                processIntoSeries(jobsList, 'jobs');
                processIntoSeries(usersList.filter(u => {
                    const role = (u.role || u.type || '').toLowerCase();
                    return role === 'hr' || u.isHR;
                }), 'hrs');

                console.log("Analytics Timeline Data:", activityMap);
                setLineGraphData(activityMap);

            } catch (error) {
                console.error("Analytics Data Fetch Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);
 
    const playClickSound = () => {
        const audio = new Audio("/fahhhhh.mp3");
        audio.currentTime = 0;
        audio.play().catch(err => console.log("Sound play error:", err));
    };
 
    const handleExport = () => {
        playClickSound();
        setIsExporting(true);
        setExportStatus("exporting");
        
        try {
            const now = new Date();
            const generatedAt = now.toLocaleString('en-IN', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
            });

            const wb = XLSX.utils.book_new();

            // --- Sheet 1: Platform Overview ---
            const candidatesCount = (data?.totals?.users || 0) - (data?.totals?.hrs || 0);
            const totalApps = (data?.applications?.hired || 0) + (data?.applications?.shortlisted || 0) + (data?.applications?.rejected || 0);
            const placementRate = totalApps > 0 ? `${((data.applications.hired / totalApps) * 100).toFixed(1)}%` : '0%';

            const overviewData = [
                ['HireFilter – Global Analytics Report'],
                ['Generated on:', generatedAt],
                [],
                ['PLATFORM OVERVIEW'],
                ['Metric', 'Value'],
                ['Total Users', data?.totals?.users || 0],
                ['Total HRs', data?.totals?.hrs || 0],
                ['Total Candidates', candidatesCount],
                ['Active Jobs', data?.totals?.jobs || 0],
                ['New Users This Month', data?.growth?.usersAddedThisMonth || 0],
                ['New Users Last Month', data?.growth?.usersAddedLastMonth || 0],
                ['New Jobs This Month', data?.growth?.jobsAddedThisMonth || 0],
                ['New Jobs Last Month', data?.growth?.jobsAddedLastMonth || 0],
            ];
            const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
            overviewSheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, overviewSheet, 'Platform Overview');

            // --- Sheet 2: Application Funnel ---
            const funnelData = [
                ['Application Funnel'],
                ['Generated on:', generatedAt],
                [],
                ['Stage', 'Count', 'Percentage'],
                ['Hired', data?.applications?.hired || 0, placementRate],
                ['Shortlisted', data?.applications?.shortlisted || 0, totalApps > 0 ? `${((data.applications.shortlisted / totalApps) * 100).toFixed(1)}%` : '0%'],
                ['Rejected', data?.applications?.rejected || 0, totalApps > 0 ? `${((data.applications.rejected / totalApps) * 100).toFixed(1)}%` : '0%'],
                ['Total Applications', totalApps, '100%'],
                [],
                ['Overall Placement Rate:', placementRate],
            ];
            const funnelSheet = XLSX.utils.aoa_to_sheet(funnelData);
            funnelSheet['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, funnelSheet, 'Application Funnel');

            // --- Sheet 3: 14-Day Activity Timeline ---
            if (lineGraphData.length > 0) {
                const timelineRows = [
                    ['14-Day Activity Timeline'],
                    ['Generated on:', generatedAt],
                    [],
                    ['Date', 'New Candidates', 'New Jobs', 'New HRs'],
                    ...lineGraphData.map(d => [d.label, d.candidates, d.jobs, d.hrs])
                ];
                const timelineSheet = XLSX.utils.aoa_to_sheet(timelineRows);
                timelineSheet['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 10 }];
                XLSX.utils.book_append_sheet(wb, timelineSheet, '14-Day Timeline');
            }

            const dateTag = now.toISOString().split('T')[0];
            XLSX.writeFile(wb, `HireFilter_Analytics_${dateTag}.xlsx`);

            setExportStatus("success");
            setTimeout(() => {
                setExportStatus("idle");
                setIsExporting(false);
            }, 3000);
        } catch (err) {
            console.error('Export failed:', err);
            setExportStatus("idle");
            setIsExporting(false);
        }
    };

    if (isLoading || !data) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
            </div>
        );
    }

    const { totals, growth, applications } = data;

    const calculatePlacementRate = () => {
        const totalApps = (applications.hired || 0) + (applications.shortlisted || 0) + (applications.rejected || 0);
        if (totalApps === 0) return "0%";
        return `${((applications.hired / totalApps) * 100).toFixed(1)}%`;
    };

    // Animated Counter Component
    const StepCounter = ({ value }) => {
        return (
            <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="tabular-nums"
            >
                {value}
            </motion.span>
        );
    };

    const metrics = [
        { 
            label: "Total Users", 
            value: totals.users.toLocaleString(), 
            change: `${growth.usersAddedThisMonth >= growth.usersAddedLastMonth ? "+" : ""}${growth.usersAddedThisMonth - growth.usersAddedLastMonth}`, 
            icon: Users, 
            color: "text-blue-500", 
            glow: "shadow-blue-500/20" 
        },
        { 
            label: "Total HRs", 
            value: totals.hrs.toLocaleString(), 
            change: `${growth.hrsAddedThisMonth >= growth.hrsAddedLastMonth ? "+" : ""}${growth.hrsAddedThisMonth - growth.hrsAddedLastMonth}`, 
            icon: Shield, 
            color: "text-purple-500", 
            glow: "shadow-purple-500/20" 
        },
        { 
            label: "Candidates", 
            value: (totals.users - totals.hrs).toLocaleString(), 
            change: `${(growth.usersAddedThisMonth - growth.hrsAddedThisMonth) >= (growth.usersAddedLastMonth - growth.hrsAddedLastMonth) ? "+" : ""}${(growth.usersAddedThisMonth - growth.hrsAddedThisMonth) - (growth.usersAddedLastMonth - growth.hrsAddedLastMonth)}`, 
            icon: Target, 
            color: "text-emerald-500", 
            glow: "shadow-emerald-500/20" 
        },
        { 
            label: "Active Jobs", 
            value: totals.jobs.toLocaleString(), 
            change: `${growth.jobsAddedThisMonth >= growth.jobsAddedLastMonth ? "+" : ""}${growth.jobsAddedThisMonth - growth.jobsAddedLastMonth}`, 
            icon: Briefcase, 
            color: "text-amber-500", 
            glow: "shadow-amber-500/20" 
        },
        { 
            label: "Total Applications", 
            value: (applications.hired + applications.shortlisted + applications.rejected).toLocaleString(), 
            change: "Live", 
            icon: BarChart3, 
            color: "text-rose-500", 
            glow: "shadow-rose-500/20" 
        },
        { 
            label: "Placement Rate", 
            value: calculatePlacementRate(), 
            change: "Platform", 
            icon: ArrowUpRight, 
            color: "text-blue-400", 
            glow: "shadow-blue-400/20" 
        },
    ];

    // Radar Data Points: Candidates, HRs, Jobs, Hired, Rejected (Normalized)
    const candidatesCount = totals.users - totals.hrs;
    const maxVal = Math.max(candidatesCount, totals.hrs, totals.jobs, 1);
    const radarValues = [
        candidatesCount / maxVal,
        totals.hrs / maxVal,
        totals.jobs / maxVal,
        applications.hired / (applications.hired + applications.rejected || 1),
        applications.rejected / (applications.hired + applications.rejected || 1)
    ];

    const radarLabels = ["CANDIDATES", "HRs", "JOBS", "HIRED", "REJECTED"];

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">Global <span className="text-amber-500">Analytics</span></h1>
                    <p className="text-gray-500 text-sm mt-1">Deep-dive into platform performance and recruitment metrics</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all relative overflow-hidden ${exportStatus === "success"
                            ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                            : "bg-white/5 hover:bg-white/10 border border-white/5 text-white"
                        }`}
                >
                    <AnimatePresence mode="wait">
                        {exportStatus === "idle" && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                <span>Export Full Report</span>
                            </motion.div>
                        )}
                        {exportStatus === "exporting" && (
                            <motion.div
                                key="exporting"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2"
                            >
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating Report...</span>
                            </motion.div>
                        )}
                        {exportStatus === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Report Downloaded</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Metric Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className={`p-8 rounded-[32px] bg-[#111418] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all ${metric.glow} hover:shadow-2xl`}
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Icon className="w-24 h-24" />
                            </div>
                            <div className={`p-4 rounded-2xl bg-white/5 ${metric.color} w-fit mb-6 group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-4xl font-black text-white mb-2 tabular-nums">
                                <StepCounter value={metric.value} />
                            </h3>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{metric.label}</p>
                            <div className="mt-6 flex items-center gap-2">
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${metric.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : (metric.change === 'Live' || metric.change === 'Platform') ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    <ArrowUpRight className="w-3 h-3" />
                                    {metric.change}
                                </div>
                                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Delta</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Demographics Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-8 rounded-[40px] bg-[#111418] border border-white/5 flex flex-col shadow-2xl group"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                                <Users className="w-5 h-5 text-blue-500" />
                                Platform Distribution
                            </h3>
                            <p className="text-[10px] text-gray-600 mt-1 uppercase font-black tracking-widest">Normalized Radar Analysis</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative py-4">
                        <div className="relative w-56 h-56 group-hover:scale-105 transition-transform duration-500">
                            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                                {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
                                    <polygon
                                        key={i}
                                        points={Array.from({ length: 5 }).map((_, j) => {
                                            const angle = (j * 2 * Math.PI) / 5 - Math.PI / 2;
                                            return `${100 + 80 * r * Math.cos(angle)},${100 + 80 * r * Math.sin(angle)}`;
                                        }).join(' ')}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="0.5"
                                        className="opacity-10"
                                    />
                                ))}

                                {Array.from({ length: 5 }).map((_, j) => {
                                    const angle = (j * 2 * Math.PI) / 5 - Math.PI / 2;
                                    return (
                                        <line
                                            key={j}
                                            x1="100" y1="100"
                                            x2={100 + 80 * Math.cos(angle)}
                                            y2={100 + 80 * Math.sin(angle)}
                                            stroke="white"
                                            strokeWidth="0.5"
                                            className="opacity-10"
                                        />
                                    );
                                })}

                                <motion.polygon
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    points={radarValues.map((val, j) => {
                                        const angle = (j * 2 * Math.PI) / 5 - Math.PI / 2;
                                        return `${100 + 80 * Math.max(val, 0.1) * Math.cos(angle)},${100 + 80 * Math.max(val, 0.1) * Math.sin(angle)}`;
                                    }).join(' ')}
                                    fill="url(#radarGradient)"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                />

                                {radarLabels.map((label, j) => {
                                    const angle = (j * 2 * Math.PI) / 5 - Math.PI / 2;
                                    const x = 100 + 105 * Math.cos(angle);
                                    const y = 100 + 105 * Math.sin(angle);
                                    return (
                                        <text
                                            key={j}
                                            x={x} y={y}
                                            textAnchor="middle"
                                            className="text-[8px] font-black fill-gray-600 tracking-tighter"
                                        >
                                            {label}
                                        </text>
                                    );
                                })}

                                <defs>
                                    <radialGradient id="radarGradient">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-12 w-full px-4 text-[10px] font-bold">
                            <div className="flex items-center gap-2 text-blue-500 bg-white/5 p-2 rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                                <span>HRs: {totals.hrs}</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-500 bg-white/5 p-2 rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                                <span>Cands: {totals.users - totals.hrs}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Growth Comparison Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-8 rounded-[40px] bg-[#111418] border border-white/5 flex flex-col shadow-2xl group"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                Monthly Growth
                            </h3>
                            <p className="text-[10px] text-gray-600 mt-1 uppercase font-black tracking-widest">Current vs Last Month</p>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-6 px-4 h-[200px]">
                        {[
                            { label: 'HRs', this: growth.hrsAddedThisMonth, last: growth.hrsAddedLastMonth },
                            { label: 'Users', this: growth.usersAddedThisMonth, last: growth.usersAddedLastMonth },
                            { label: 'Jobs', this: growth.jobsAddedThisMonth, last: growth.jobsAddedLastMonth }
                        ].map((m, i) => {
                            const max = Math.max(m.this, m.last, 1);
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                                    <div className="w-full flex items-end gap-2 h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(m.last / max) * 100}%` }}
                                            className="flex-1 bg-white/10 rounded-t-md hover:bg-white/20 transition-all"
                                        />
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(m.this / max) * 100}%` }}
                                            className="flex-1 bg-emerald-500 rounded-t-lg shadow-lg shadow-emerald-500/10"
                                        />
                                    </div>
                                    <span className="text-[9px] font-black text-gray-600 uppercase mt-2">{m.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-6 flex justify-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-white/20" /> PREVIOUS
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> CURRENT
                        </div>
                    </div>
                </motion.div>

                {/* Application breakdown Donut Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-8 rounded-[40px] bg-[#111418] border border-white/5 flex flex-col shadow-2xl group"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-purple-500" />
                                Hiring Status
                            </h3>
                            <p className="text-[10px] text-gray-600 mt-1 uppercase font-black tracking-widest">Application lifecycle</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative py-4">
                        <div className="relative w-48 h-48 group-hover:scale-105 transition-transform duration-500">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="96" cy="96" r="96" fill="#1e2229" />
                                {(() => {
                                    const h = applications.hired || 0;
                                    const s = applications.shortlisted || 0;
                                    const r = applications.rejected || 0;
                                    const total = h + s + r || 1;
                                    
                                    const hRatio = h / total;
                                    const sRatio = s / total;
                                    const rRatio = r / total;

                                    return (
                                        <>
                                            <circle cx="96" cy="96" r="48" fill="transparent" stroke="#10b981" strokeWidth="96" strokeDasharray="301" strokeDashoffset={301 * (1 - hRatio)} />
                                            <circle cx="96" cy="96" r="48" fill="transparent" stroke="#3b82f6" strokeWidth="96" strokeDasharray="301" strokeDashoffset={301 * (1 - sRatio)} style={{ transform: `rotate(${360 * hRatio}deg)`, transformOrigin: 'center' }} />
                                            <circle cx="96" cy="96" r="48" fill="transparent" stroke="#f43f5e" strokeWidth="96" strokeDasharray="301" strokeDashoffset={301 * (1 - rRatio)} style={{ transform: `rotate(${360 * (hRatio + sRatio)}deg)`, transformOrigin: 'center' }} />
                                        </>
                                    );
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-[#111418] px-3 py-1 rounded-full border border-white/10 shadow-2xl">
                                    <span className="text-lg font-black text-white">{(applications.hired + applications.shortlisted + applications.rejected).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 mt-8 w-full px-4">
                            {[
                                { label: "Hired", val: applications.hired, color: "bg-emerald-500" },
                                { label: "Shortlisted", val: applications.shortlisted, color: "bg-blue-500" },
                                { label: "Rejected", val: applications.rejected, color: "bg-rose-500" }
                            ].map((d, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${d.color}`} />
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{d.label}</span>
                                    </div>
                                    <span className="text-xs font-black text-white">{d.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Platform Activity Line Graph */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-8 px-8 pb-4 rounded-[32px] bg-[#111418] border border-white/5 shadow-2xl overflow-hidden relative group"
            >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 relative z-10 gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            <Activity className="w-6 h-6 text-emerald-500" />
                            Activity <span className="text-emerald-500">Timeline</span>
                        </h3>
                        <p className="text-xs text-gray-600 mt-1 uppercase font-black tracking-widest">{viewGranularity === "daily" ? "14-Day platform engagement" : "Monthly Growth Comparison"}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Granularity Toggle */}
                        <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/5">
                            {["daily", "monthly"].map((g) => (
                                <button
                                    key={g}
                                    onClick={() => { setViewGranularity(g); playClickSound(); }}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewGranularity === g ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-gray-500 hover:text-white"}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>

                        {/* Series Filter */}
                        <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/5">
                            {["all", "jobs", "candidates"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setActiveSeries(s); playClickSound(); }}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSeries === s ? "bg-blue-500 text-black shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-white"}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="hidden xl:flex gap-6 ml-4">
                            {[
                                { label: 'CANDS', color: 'text-cyan-400', glow: '#22d3ee', total: totals.users - totals.hrs },
                                { label: 'JOBS', color: 'text-amber-400', glow: '#fbbf24', total: totals.jobs },
                                { label: 'HRs', color: 'text-emerald-400', glow: '#10b981', total: totals.hrs }
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-white/40 tracking-widest uppercase">
                                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: s.glow, boxShadow: `0 0 10px ${s.glow}` }} />
                                        {s.label}
                                    </div>
                                    <span className={`text-xl font-black ${s.color} transition-all duration-300 ${hoveredIndex !== null && s.label.toLowerCase().includes(activeSeries.substring(0,3)) ? "scale-110" : ""}`}>{s.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-[180px] w-full relative z-10">
                    <AnimatePresence mode="wait">
                        {viewGranularity === "daily" ? (
                            <div key="daily-wrapper" className="w-full h-full relative cursor-crosshair">
                                <motion.svg
                                    key="daily-view"
                                    viewBox="0 0 100 100"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full overflow-visible"
                                    preserveAspectRatio="none"
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <defs>
                                        <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                        <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" /><stop offset="100%" stopColor="#22d3ee" stopOpacity="0" /></linearGradient>
                                        <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" /><stop offset="100%" stopColor="#fbbf24" stopOpacity="0" /></linearGradient>
                                        <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.2" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient>
                                    </defs>

                                    {/* Grid Lines */}
                                    {[0, 25, 50, 75, 100].map((p, i) => (
                                        <line key={i} x1="0" y1={p} x2="100" y2={p} stroke="white" strokeOpacity={p === 100 ? "0.1" : "0.03"} strokeWidth="0.5" />
                                    ))}

                                    {(() => {
                                        const max = Math.max(...lineGraphData.map(d => Math.max(d.candidates || 0, d.jobs || 0, d.hrs || 0)), 1);
                                        const series = [
                                            { id: 'candidates', key: 'candidates', color: '#22d3ee', grad: 'url(#gradCyan)' },
                                            { id: 'jobs', key: 'jobs', color: '#fbbf24', grad: 'url(#gradAmber)' },
                                            { id: 'hrs', key: 'hrs', color: '#10b981', grad: 'url(#gradEmerald)' }
                                        ].filter(s => activeSeries === "all" || s.id === activeSeries || (activeSeries === "candidates" && s.id === "candidates"));

                                        return (
                                            <>
                                                {/* Data Lines */}
                                                {series.map((s, si) => {
                                                    const pts = lineGraphData.map((d, i) => ({
                                                        x: lineGraphData.length > 1 ? (i / (lineGraphData.length - 1)) * 100 : 50,
                                                        y: 100 - ((d[s.key] || 0) / max) * 100
                                                    }));

                                                    // Build smooth cubic-bezier path
                                                    const smoothPath = pts.reduce((acc, pt, i) => {
                                                        if (i === 0) return `M${pt.x},${pt.y}`;
                                                        const prev = pts[i - 1];
                                                        const cpX = (prev.x + pt.x) / 2;
                                                        return `${acc} C${cpX},${prev.y} ${cpX},${pt.y} ${pt.x},${pt.y}`;
                                                    }, '');

                                                    const areaPath = `${smoothPath} L${pts[pts.length - 1].x},100 L${pts[0].x},100 Z`;

                                                    return (
                                                        <g 
                                                            key={s.key} 
                                                            className="transition-opacity duration-300"
                                                            style={{ opacity: hoveredIndex !== null ? (activeSeries === s.id ? 1 : 0.3) : 1 }}
                                                        >
                                                            {/* Filled area */}
                                                            <path d={areaPath} fill={s.grad} className="transition-all duration-1000" />
                                                            {/* Smooth glowing line */}
                                                            <motion.path
                                                                initial={{ pathLength: 0, opacity: 0 }}
                                                                animate={{ 
                                                                    pathLength: 1, 
                                                                    opacity: 1,
                                                                    strokeWidth: [0.3, 0.5, 0.3]
                                                                }}
                                                                transition={{ 
                                                                    pathLength: { duration: 1.5, delay: si * 0.2 },
                                                                    strokeWidth: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                                                                }}
                                                                d={smoothPath}
                                                                fill="none"
                                                                stroke={s.color}
                                                                strokeWidth="0.3"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                style={{ filter: 'url(#neonBlur)' }}
                                                            />
                                                        </g>
                                                    );
                                                })}

                                                {/* Hover Effects */}
                                                {hoveredIndex !== null && (
                                                    <g>
                                                        <line 
                                                            x1={`${(hoveredIndex / (lineGraphData.length - 1)) * 100}`} 
                                                            y1="0" 
                                                            x2={`${(hoveredIndex / (lineGraphData.length - 1)) * 100}`} 
                                                            y2="100" 
                                                            stroke="white" 
                                                            strokeOpacity="0.1" 
                                                            strokeWidth="0.5" 
                                                            strokeDasharray="1 1"
                                                        />
                                                        {series.map((s) => {
                                                            const d = lineGraphData[hoveredIndex];
                                                            if (!d) return null;
                                                            const x = lineGraphData.length > 1 ? (hoveredIndex / (lineGraphData.length - 1)) * 100 : 50;
                                                            const y = 100 - ((d[s.key] || 0) / max) * 100;
                                                            return <circle key={s.key} cx={x} cy={y} r="1.5" fill={s.color} style={{ filter: 'url(#neonBlur)' }} />;
                                                        })}
                                                    </g>
                                                )}

                                                {/* Hover Zones */}
                                                {lineGraphData.map((_, i) => {
                                                    const xPos = lineGraphData.length > 1 ? (i / (lineGraphData.length - 1)) * 100 : 50;
                                                    const width = lineGraphData.length > 1 ? 100 / (lineGraphData.length - 1) : 100;
                                                    return (
                                                        <rect
                                                            key={i}
                                                            x={xPos - (width / 2)}
                                                            y="0"
                                                            width={width}
                                                            height="100"
                                                            fill="transparent"
                                                            onMouseMove={() => setHoveredIndex(i)}
                                                        />
                                                    );
                                                })}
                                            </>
                                        );
                                    })()}
                                </motion.svg>

                                {/* Tooltip Overlay */}
                                <AnimatePresence>
                                    {hoveredIndex !== null && lineGraphData[hoveredIndex] && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            style={{
                                                left: `${(hoveredIndex / (lineGraphData.length - 1)) * 100}%`,
                                                transform: `translateX(${hoveredIndex > lineGraphData.length / 2 ? '-110%' : '10%'})`
                                            }}
                                            className="absolute top-0 pointer-events-none z-50 p-4 rounded-2xl bg-[#1a1d21]/95 border border-white/10 shadow-2xl backdrop-blur-md min-w-[150px]"
                                        >
                                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                                                {new Date(lineGraphData[hoveredIndex].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { label: 'Cands', val: lineGraphData[hoveredIndex].candidates, color: 'text-cyan-400', glow: '#22d3ee' },
                                                    { label: 'Jobs', val: lineGraphData[hoveredIndex].jobs, color: 'text-amber-400', glow: '#fbbf24' },
                                                    { label: 'HRs', val: lineGraphData[hoveredIndex].hrs, color: 'text-emerald-400', glow: '#10b981' }
                                                ].map((s, i) => (
                                                    <div key={i} className="flex items-center justify-between gap-6 group/item transition-opacity" style={{ opacity: hoveredIndex !== null ? (activeSeries === "all" || s.label.toLowerCase().includes(activeSeries.substring(0,3)) ? 1 : 0.4) : 1 }}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.glow, boxShadow: `0 0 8px ${s.glow}` }} />
                                                            <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter">{s.label}</span>
                                                        </div>
                                                        <span className={`text-sm font-black ${s.color}`}>{s.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div
                                key="monthly-view"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full h-full flex flex-col justify-between pt-4"
                            >
                                {(() => {
                                    const monthlySeries = [
                                        { id: 'candidates', label: 'Candidates', this: growth.usersAddedThisMonth - growth.hrsAddedThisMonth, last: growth.usersAddedLastMonth - growth.hrsAddedLastMonth, color: 'bg-cyan-400', glow: 'shadow-cyan-400/20' },
                                        { id: 'jobs', label: 'Jobs', this: growth.jobsAddedThisMonth, last: growth.jobsAddedLastMonth, color: 'bg-amber-400', glow: 'shadow-amber-400/20' },
                                        { id: 'hrs', label: 'HRs', this: growth.hrsAddedThisMonth, last: growth.hrsAddedLastMonth, color: 'bg-emerald-400', glow: 'shadow-emerald-400/20' }
                                    ].filter(s => activeSeries === "all" || s.id === activeSeries);

                                    const maxVal = Math.max(...monthlySeries.flatMap(s => [s.this, s.last]), 1);

                                    return monthlySeries.map((s, i) => (
                                        <div key={i} className="flex-1 flex items-center gap-6 group/bar">
                                            <div className="w-24 text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">{s.label}</div>
                                            <div className="flex-1 flex flex-col gap-2">
                                                <div className="flex items-center gap-3">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(s.this / maxVal) * 100}%` }}
                                                        className={`h-2 rounded-full ${s.color} shadow-lg relative`}
                                                    >
                                                        <div className="absolute inset-0 bg-white opacity-20 group-hover/bar:opacity-40 transition-opacity" />
                                                    </motion.div>
                                                    <span className="text-[10px] font-black text-white">{s.this}</span>
                                                    <span className="text-[8px] font-bold text-gray-700 uppercase tracking-tighter">This Month</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(s.last / maxVal) * 100}%` }}
                                                        className="h-2 rounded-full bg-white/5 relative border border-white/5"
                                                    >
                                                        <div className="absolute inset-0 bg-white opacity-5" />
                                                    </motion.div>
                                                    <span className="text-[10px] font-black text-white/40">{s.last}</span>
                                                    <span className="text-[8px] font-bold text-gray-800 uppercase tracking-tighter">Last Month</span>
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-4 flex justify-between px-2">
                    {lineGraphData.filter((_, i) => i % 2 === 0).map((d, i) => (
                        <span key={i} className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                            {d.label}
                        </span>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
