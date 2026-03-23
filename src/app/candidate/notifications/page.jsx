"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, Filter } from "lucide-react";
import { useNotificationContext } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { NotificationsSkeleton } from "@/components/Skeleton";

export default function NotificationsPage() {
    const router = useRouter();
    const { notifications, markAsRead, markAllAsRead, loading } = useNotificationContext();
    const [filterUnread, setFilterUnread] = useState(false);

    const filteredNotifications = filterUnread 
        ? notifications.filter(n => !n.read) 
        : notifications;

    const handleNotificationClick = (notif) => {
        if (!notif.read) markAsRead(notif._id);
        
        if (notif.conversationId) {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const role = user.role?.toLowerCase() || "candidate";
            router.push(`/${role}/messages?conversationId=${notif.conversationId}`);
        } else if (notif.title?.toLowerCase().includes('message') || notif.title?.toLowerCase().includes('chat')) {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const role = user.role?.toLowerCase() || "candidate";
            
            const senderMatch = notif.title.match(/message from (.*)/i);
            const chatName = senderMatch ? senderMatch[1].trim() : "";
            const queryStr = chatName ? `?chatName=${encodeURIComponent(chatName)}` : `?autoOpen=true`;
            
            router.push(`/${role}/messages${queryStr}`);
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
            className="space-y-8 max-w-4xl mx-auto pb-12"
        >
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#080808]">
                        Your <span className="text-[#7C5CFC]">Notifications</span>
                    </h1>
                    <p className="text-[#71717A] mt-1 font-medium">Stay updated with your job search activity</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setFilterUnread(!filterUnread)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            filterUnread 
                            ? 'bg-[#7C5CFC] text-white border-[#7C5CFC] shadow-lg shadow-primary/20' 
                            : 'bg-white text-[#71717A] border-[#F1F1F1] hover:border-[#7C5CFC]/30'
                        }`}
                    >
                        <Filter className={`w-4 h-4 ${filterUnread ? 'text-white' : 'text-[#7C5CFC]'}`} />
                        {filterUnread ? 'Showing Unread' : 'All Notifications'}
                    </button>
                    <button 
                        onClick={markAllAsRead}
                        className="text-sm font-bold text-[#7C5CFC] hover:text-[#6b4ce6] transition-colors"
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
                            className={`p-6 bg-white border border-[#F1F1F1] rounded-[24px] hover:border-[#7C5CFC]/30 transition-all flex gap-5 relative group shadow-[0px_4px_20px_rgba(0,0,0,0.02)] cursor-pointer ${!notif.read ? 'bg-[#F4F7FE]/30' : ''}`}
                        >
                             <div className={`p-4 rounded-[16px] bg-[#F4F7FE] ${notif.read ? 'text-[#71717A]' : 'text-[#7C5CFC]'} h-fit shadow-sm`}>
                                 <Bell className="w-6 h-6" />
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-bold text-lg ${notif.read ? 'text-[#71717A]' : 'text-[#080808]'}`}>{notif.title}</h4>
                                    <div className="flex items-center gap-1.5 text-[#71717A] text-xs font-medium">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                 </div>
                                 <p className="text-[#71717A] font-medium leading-relaxed">{notif.message}</p>
                             </div>
                             {!notif.read && (
                                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-[#7C5CFC]" />
                             )}
                        </motion.div>
                    ))
                ) : (
                    <motion.div variants={itemVariants} className="text-center py-20 bg-white rounded-[24px] border border-[#F1F1F1]">
                        <Bell className="w-12 h-12 text-[#7C5CFC]/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-[#080808]">No notifications yet</h3>
                        <p className="text-[#71717A] mt-2 font-medium">We'll let you know when something happens</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
