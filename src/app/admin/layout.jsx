"use client";

import { useState, useEffect, useRef } from "react";

import { useNotificationContext } from "@/context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    BarChart3,
    History,
    Settings,
    ShieldCheck,
    LogOut,
    Bell,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Info,
    Menu,
    X,
    MessageSquare
} from "lucide-react";
import { logout, getUserDetails } from "@/utils/auth";

const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Job Moderation", href: "/admin/jobs", icon: Briefcase },
    { name: "Global Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const notificationRef = useRef(null);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const user = getUserDetails();
        setUserName(user?.name || "Admin");
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Close notifications when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();

    const SidebarContent = () => (
        <>
            <div className="p-8 flex items-center justify-between lg:justify-start lg:gap-3">
                <Logo />
                <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" suppressHydrationWarning />
                </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link href={item.href} key={item.href}>
                            <div
                                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                                    isActive
                                        ? "text-white bg-[#6366F1]/10 ring-1 ring-[#6366F1]/20 shadow-md"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavAdmin"
                                        className="absolute left-0 w-1 h-6 bg-amber-500 rounded-r-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    />
                                )}
                                <item.icon
                                    className={`w-5 h-5 transition-transform duration-300 ${
                                        isActive ? "text-amber-500 rotate-0" : "group-hover:text-amber-400 group-hover:scale-110"
                                    }`}
                                    suppressHydrationWarning
                                />
                                <span className="font-semibold text-sm">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 bg-white/5 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/20 border border-white/5 mb-2">
                     <div className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-black text-black">
                        {userName ? userName.charAt(0).toUpperCase() : "A"}
                     </div>
                     <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{userName}</span>
                        <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            Active Now
                        </span>
                     </div>
                </div>

                <button 
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
                >
                    <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" suppressHydrationWarning />
                    <span className="font-bold text-xs uppercase tracking-widest">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-[#0F1117] flex font-sans text-white overflow-hidden transition-colors duration-300">
                {/* Global Glow */}
                <div className="fixed inset-0 pointer-events-none z-0">
                     <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
                     <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
                </div>

                {/* Mobile Menu Backdrop */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                        />
                    )}
                </AnimatePresence>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.aside 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-[#0F1117] border-r border-white/10 z-50 flex flex-col lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10 z-20 flex-col relative h-screen">
                    <SidebarContent />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 relative z-10 lg:overflow-y-auto h-screen scrollbar-hide flex flex-col">
                    <header className="sticky top-0 z-30 px-4 lg:px-8 py-4 flex justify-between lg:justify-end items-center bg-[#0F1117]/80 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none border-b lg:border-none border-white/10">
                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all shadow-sm"
                        >
                            <Menu className="w-5 h-5" suppressHydrationWarning />
                        </button>

                        <div className="flex items-center gap-4 lg:gap-6">
                            <div className="relative" ref={notificationRef}>
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all relative group pointer-events-auto"
                                >
                                    <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" suppressHydrationWarning />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-500 rounded-full border border-[#0F1117]"></span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="absolute right-0 mt-4 w-[calc(100vw-2rem)] md:w-80 bg-[#1A1D24] border border-white/10 rounded-2xl shadow-2xl p-4 z-50"
                                    >
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">{unreadCount} NEW</span>
                                            )}
                                        </div>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                                            {notifications.length > 0 ? (
                                                notifications.slice(0, 5).map((n) => (
                                                    <div 
                                                        key={n._id} 
                                                        onClick={() => {
                                                            if (!n.read) markAsRead(n._id);
                                                            const user = getUserDetails();
                                                            const rawRole = user?.role?.toLowerCase() || "";
                                                            const basePath = rawRole.includes("admin") ? "admin" : (rawRole.includes("hr") ? "hr" : "candidate");
                                                            if (n.conversationId) {
                                                                router.push(`/${basePath}/messages?conversationId=${n.conversationId}`);
                                                                setShowNotifications(false);
                                                            } else if (n.title?.toLowerCase().includes('message') || n.title?.toLowerCase().includes('chat')) {
                                                                const senderMatch = n.title.match(/message from (.*)/i);
                                                                const chatName = senderMatch ? senderMatch[1].trim() : "";
                                                                const queryStr = chatName ? `?chatName=${encodeURIComponent(chatName)}` : `?autoOpen=true`;
                                                                router.push(`/${basePath}/messages${queryStr}`);
                                                                setShowNotifications(false);
                                                            }
                                                        }}
                                                        className={`p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 cursor-pointer group relative ${!n.read ? 'bg-white/5' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 ${!n.read ? 'text-amber-500' : 'text-gray-400'}`}>
                                                                <Bell className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs font-bold transition-colors ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                                                                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{n.message}</p>
                                                                <p className="text-[9px] text-gray-400 mt-1 uppercase font-black">
                                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                            {!n.read && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center text-gray-400 text-xs font-medium">
                                                    No new notifications
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={markAllAsRead}
                                            className="w-full mt-4 py-2 text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest border-t border-white/10 pt-4 transition-colors"
                                        >
                                            Mark all as read
                                        </button>
                                        <Link href="/admin/notifications">
                                            <button className="w-full mt-1 py-2 text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors">
                                                View All Notifications
                                            </button>
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </header>
                    
                    {/* Main Scrollable Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-10 lg:pt-0">
                        <div className="max-w-[1600px] mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
    );
}
