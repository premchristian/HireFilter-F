"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, Filter } from "lucide-react";
import { useNotificationContext } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { getUserDetails } from "@/utils/auth";
import { NotificationsSkeleton } from "@/components/Skeleton";

export default function AdminNotificationsPage() {
    const router = useRouter();
    const { notifications, markAsRead, markAllAsRead, loading } = useNotificationContext();
    const [filterUnread, setFilterUnread] = useState(false);

    const filteredNotifications = filterUnread 
        ? notifications.filter(n => !n.read) 
        : notifications;

    const handleNotificationClick = (notif) => {
        if (!notif.read) markAsRead(notif._id);
        
        const user = getUserDetails();
        const role = user?.role?.toLowerCase() || "admin";
        const basePath = role.includes("admin") ? "admin" : (role.includes("hr") ? "hr" : "candidate");

        if (notif.conversationId) {
            router.push(`/${basePath}/messages?conversationId=${notif.conversationId}`);
        } else if (notif.title?.toLowerCase().includes('message') || notif.title?.toLowerCase().includes('chat')) {
            const senderMatch = notif.title.match(/message from (.*)/i);
            const chatName = senderMatch ? senderMatch[1].trim() : "";
            const queryStr = chatName ? `?chatName=${encodeURIComponent(chatName)}` : `?autoOpen=true`;
            
            router.push(`/${basePath}/messages${queryStr}`);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-4xl mx-auto pb-12 p-6 lg:p-0"
        >
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                        System <span className="text-amber-500">Notifications</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Platform-wide alerts and administrative updates</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setFilterUnread(!filterUnread)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            filterUnread 
                            ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' 
                            : 'bg-white/5 text-gray-400 border-white/10 hover:border-amber-500/30'
                        }`}
                    >
                        <Filter className={`w-4 h-4 ${filterUnread ? 'text-black' : 'text-amber-500'}`} />
                        {filterUnread ? 'Unread Only' : 'All Alerts'}
                    </button>
                    <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors"
                    >
                        Mark all as read
                    </button>
                </div>
            </motion.div>

            <div className="space-y-4">
                {loading && filteredNotifications.length === 0 ? (
                    <NotificationsSkeleton />
                ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notif) => (
                        <motion.div 
                            key={notif._id}
                            variants={itemVariants}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-6 bg-[#1A1D24] border border-white/10 rounded-[24px] hover:border-amber-500/30 transition-all flex gap-5 relative group shadow-2xl cursor-pointer ${!notif.read ? 'bg-white/5' : ''}`}
                        >
                             <div className={`p-4 rounded-[16px] bg-white/5 ${notif.read ? 'text-gray-400' : 'text-amber-500'} h-fit border border-white/5`}>
                                 <Bell className="w-6 h-6" />
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-bold text-lg ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h4>
                                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-black uppercase">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                 </div>
                                 <p className="text-gray-400 text-sm font-medium leading-relaxed">{notif.message}</p>
                             </div>
                             {!notif.read && (
                                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-amber-500" />
                             )}
                        </motion.div>
                    ))
                ) : (
                    <motion.div variants={itemVariants} className="text-center py-20 bg-[#1A1D24] rounded-[24px] border border-white/10 shadow-2xl">
                        <Bell className="w-12 h-12 text-amber-500/20 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">No alerts found</h3>
                        <p className="text-gray-500 mt-2 font-medium italic">Your administrative log is currently clear</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
