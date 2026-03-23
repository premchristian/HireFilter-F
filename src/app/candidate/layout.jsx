// [MODIFY] layout.jsx (file:///d:/HireFilter-candidate-wants/HireFilter-main/src/app/candidate/layout.jsx)

"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNotificationContext } from "@/context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
    LayoutDashboard,
    Search,
    Briefcase,
    Calendar,
    User,
    LogOut,
    Bell,
    Menu,
    X,
    MessageSquare,
    Info,
    CheckCircle2,
    FileText
} from "lucide-react";
import { logout, getUserDetails } from "@/utils/auth";

const navItems = [
    { name: "Overview", href: "/candidate/dashboard", icon: LayoutDashboard },
    { name: "Messages", href: "/candidate/messages", icon: MessageSquare },
    { name: "Find Jobs", href: "/candidate/jobs", icon: Search },
    { name: "My Applications", href: "/candidate/applications", icon: Briefcase },
    { name: "My Resume", href: "/candidate/resume", icon: FileText },
    // { name: "Interviews", href: "/candidate/interviews", icon: Calendar },
    { name: "My Profile", href: "/candidate/profile", icon: User },
];

export default function CandidateLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const [userName, setUserName] = useState("");
    const [userImage, setUserImage] = useState(null);

    useEffect(() => {
        const user = getUserDetails();
        setUserName(user?.name || "Candidate");

        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const [profileRes, uploadsRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/getProfile`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/my-uploads`, { headers: { Authorization: `Bearer ${token}` } }).catch(e => {
                        console.error("Failed to fetch my-uploads", e);
                        return { data: { success: false } };
                    })
                ]);

                if (profileRes.data?.success) {
                    const data = profileRes.data.data;
                    const getUrl = (img) => {
                        if (!img) return null;
                        if (typeof img === "string") return img;
                        return img.url || img.imageUrl || img.secure_url || null;
                    };

                    let extractedAvatar = getUrl(data?.profileImage) || getUrl(data?.profile?.image) || getUrl(data?.avatar) || null;

                    if (uploadsRes.data && uploadsRes.data.success) {
                        const uploadsData = uploadsRes.data.data || uploadsRes.data;
                        const uploadAvatar = getUrl(uploadsData.profileImage || uploadsData.avatar || uploadsData.image);
                        if (uploadAvatar) {
                            extractedAvatar = uploadAvatar;
                        }
                    }

                    setUserImage(extractedAvatar);
                    if (data?.name) {
                        setUserName(data?.name);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch profile image for sidebar", e);
                console.log("Error details:", e.response?.data);
                if (e.response?.status === 401) {
                    logout();
                }
            }
        };
        fetchProfile();

        const handleImageUpdate = (e) => {
            setUserImage(e.detail);
        };
        window.addEventListener("profileImageUpdated", handleImageUpdate);
        return () => window.removeEventListener("profileImageUpdated", handleImageUpdate);
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
            <div className="p-6 flex items-center justify-between lg:justify-start lg:gap-3 text-[#080808]">
                <Logo />
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden p-2 rounded-[12px] bg-[#F4F7FE] border border-[#F1F1F1] text-[#71717A] hover:text-[#080808]"
                >
                    <X className="w-5 h-5" suppressHydrationWarning />
                </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link href={item.href} key={item.href}>
                            <div
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 group overflow-hidden ${isActive
                                    ? "text-[#7C5CFC] bg-[#EBE8FF] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-[#7C5CFC]/20"
                                    : "text-[#71717A] hover:bg-[#F4F7FE] hover:text-[#080808]"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavCandidate"
                                        className="absolute left-0 w-1 h-6 bg-[#7C5CFC] rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                                <item.icon
                                    className={`w-5 h-5 transition-colors ${isActive ? "text-[#7C5CFC]" : "text-[#71717A] group-hover:text-[#080808]"
                                        }`}
                                    suppressHydrationWarning
                                />
                                <span className={`font-medium ${isActive ? "text-[#7C5CFC]" : "text-[#71717A] group-hover:text-[#080808]"}`}>
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[#F1F1F1] pb-6">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-[#71717A] hover:text-[#FF5C5C] hover:bg-[#FFEDE1] transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:text-[#FF5C5C] transition-colors" suppressHydrationWarning />
                    <span className="font-medium">Sign Out</span>
                </button>

                <Link href="/candidate/profile">
                    <div className="mt-4 flex items-center gap-3 px-4 bg-[#F4F7FE] p-3 rounded-[12px] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:border-[#7C5CFC]/20 hover:bg-[#EBE8FF]/50 transition-all cursor-pointer group/profile">
                        {userImage ? (
                            <img src={userImage} alt={userName} className="w-8 h-8 rounded-full object-cover shadow-[0px_4px_10px_rgba(0,0,0,0.1)] shrink-0" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-[#7C5CFC] flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-[0px_4px_10px_rgba(124,92,252,0.3)]">
                                {userName ? userName.charAt(0).toUpperCase() : "C"}
                            </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-[#080808] truncate group-hover/profile:text-[#7C5CFC] transition-colors">{userName}</span>
                            <span className="text-xs text-[#71717A] font-medium truncate">Candidate</span>
                        </div>
                    </div>
                </Link>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-[#F4F7FE] flex font-sans text-[#080808] overflow-hidden transition-colors duration-300">
            {/* Mobile Menu Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
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
                        className="fixed inset-y-0 left-0 w-72 bg-[#FFFFFF] border-r border-[#F1F1F1] z-50 flex flex-col lg:hidden shadow-[0px_4px_30px_rgba(0,0,0,0.1)]"
                    >
                        <SidebarContent />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-[#FFFFFF] border-r border-[#F1F1F1] z-20 flex-col relative h-screen shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 lg:overflow-y-auto h-screen scrollbar-hide flex flex-col">
                <header className="sticky top-0 z-30 px-4 lg:px-8 py-4 flex justify-between lg:justify-end items-center bg-[#F4F7FE]/80 backdrop-blur-md lg:bg-[#F4F7FE] lg:backdrop-blur-none border-b lg:border-none border-[#F1F1F1]">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 rounded-[12px] bg-[#FFFFFF] border border-[#F1F1F1] text-[#71717A] hover:text-[#080808] transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                    >
                        <Menu className="w-5 h-5" suppressHydrationWarning />
                    </button>

                    <div className="flex items-center gap-4 lg:gap-4 pointer-events-auto">
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 rounded-[12px] bg-[#FFFFFF] border border-[#F1F1F1] text-[#71717A] hover:text-[#080808] transition-all relative group shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                            >
                                <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" suppressHydrationWarning />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF5C5C] rounded-full border border-[#FFFFFF]"></span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="absolute right-0 mt-4 w-[calc(100vw-2rem)] md:w-80 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] shadow-[0px_8px_30px_rgba(0,0,0,0.1)] p-4 z-50"
                                >
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h3 className="text-sm font-bold text-[#080808] uppercase tracking-wider">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] font-bold text-[#7C5CFC] bg-[#EBE8FF] px-2 py-0.5 rounded-full">{unreadCount} NEW</span>
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
                                                    className={`p-3 rounded-[12px] hover:bg-[#F4F7FE] transition-colors border border-transparent hover:border-[#F1F1F1] cursor-pointer group relative ${!n.read ? 'bg-[#F4F7FE]/50' : ''}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 ${!n.read ? 'text-[#7C5CFC]' : 'text-[#71717A]'}`}>
                                                            <Bell className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-bold transition-colors ${!n.read ? 'text-[#080808]' : 'text-[#71717A]'}`}>{n.title}</p>
                                                            <p className="text-[10px] text-[#71717A] mt-0.5 truncate">{n.message}</p>
                                                            <p className="text-[9px] text-[#71717A] opacity-70 mt-1 uppercase font-bold">
                                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        {!n.read && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC] mt-2" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-[#71717A] text-xs font-medium">
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={markAllAsRead}
                                        className="w-full mt-4 py-2 text-[10px] font-bold text-[#71717A] hover:text-[#080808] uppercase tracking-widest border-t border-[#F1F1F1] pt-4 transition-colors"
                                    >
                                        Mark all as read
                                    </button>
                                    <Link href="/candidate/notifications">
                                        <button className="w-full mt-1 py-2 text-[10px] font-bold text-[#7C5CFC] hover:text-[#6A4FE0] uppercase tracking-widest transition-colors">
                                            View All Notifications
                                        </button>
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-8 lg:pt-0">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

