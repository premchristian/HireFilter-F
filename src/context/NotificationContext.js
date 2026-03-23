import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, MessageSquare, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserDetails } from '@/utils/auth';

const NotificationContext = createContext();

const getBasePath = (role) => {
    if (!role) return "/candidate";
    const r = role.toLowerCase();
    if (r.includes("admin")) return "/admin";
    if (r.includes("hr")) return "/hr";
    return "/candidate";
};

export const NotificationProvider = ({ children }) => {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const lastNotifiedId = React.useRef(null);
    const [activeToast, setActiveToast] = useState(null);
    const [pushNotificationsMuted, setPushNotificationsMuted] = useState(false);

    // Load muted state from localStorage on mount
    useEffect(() => {
        const savedMuted = localStorage.getItem("pushNotificationsMuted");
        if (savedMuted !== null) {
            setPushNotificationsMuted(savedMuted === "true");
        }
    }, []);

    // Persist muted state to localStorage
    const updateMutedState = (isMuted) => {
        setPushNotificationsMuted(isMuted);
        localStorage.setItem("pushNotificationsMuted", isMuted);
    };

    const fetchNotifications = useCallback(async (isInitial = false) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (isInitial) setLoading(true);

        try {
            const response = await axios.get(`${baseUrl}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const allFetched = response.data.data.notifications || [];
                const fetchedNotifications = allFetched.filter(n => !n.read);

                // Real-time detection: Only toast for TRULY new, unread notifications
                if (!isInitial && fetchedNotifications.length > 0) {
                    const latestNotif = fetchedNotifications[0];
                    
                    // Only show toast if it's unread, we haven't notified for THIS specific ID yet, AND NOT MUTED
                    if (!latestNotif.read && latestNotif._id !== lastNotifiedId.current && !pushNotificationsMuted) {
                        setActiveToast(latestNotif);
                        lastNotifiedId.current = latestNotif._id;
                        
                        // Auto-hide toast after 5 seconds
                        setTimeout(() => setActiveToast(null), 5000);
                    }
                }

                setNotifications(fetchedNotifications);
                setUnreadCount(fetchedNotifications.length);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                console.warn("[NotificationContext] Unauthorized: Token may be expired or invalid.");
            } else if (error.message === "Network Error") {
                console.warn("[NotificationContext] Network Error: Backend may be unreachable or returned a CORS-blocked 401 (e.g., invalid token).");
            } else if (error.message === "Request aborted" || error.name === "CanceledError") {
                // Suppress harmless aborted/canceled request warnings
            } else {
                console.error("[NotificationContext] Error fetching notifications:", error.message);
            }
        } finally {
            if (isInitial) setLoading(false);
        }
    }, []); // Removed [notifications] to break the infinite loop

    const markAsRead = async (notificationId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        try {
            await axios.patch(`${baseUrl}/api/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove it completely from the list since we only show unread
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            setUnreadCount(prev => Math.max(0, prev - 1));
            if (activeToast?._id === notificationId) setActiveToast(null);
        } catch (error) {
            console.error("[NotificationContext] Error marking notification as read:", error);
        }
        };

    const markAllAsRead = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        try {
            await axios.patch(`${baseUrl}/api/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(e => {
                alert("Backend mark-all-read failed: " + (e.response ? JSON.stringify(e.response.data) : e.message));
                throw e;
            });

            // Fallback: Manually hit the specific message/notification read endpoint for each item
            // since the backend's mark-all-read might not be applying to chat messages correctly
            if (notifications && notifications.length > 0) {
                await Promise.allSettled(notifications.map(n => 
                    axios.patch(`${baseUrl}/api/notifications/${n._id}/read`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ));
            }

            // Clear all from the list ONLY if API succeeds
            setNotifications([]);
            setUnreadCount(0);
            setActiveToast(null);
        } catch (error) {
            console.error("[NotificationContext] Error marking all as read:", error);
        }
    };

    useEffect(() => {
        fetchNotifications(true);
        // Poll every 30 seconds for faster real-time feel
        const interval = setInterval(() => fetchNotifications(false), 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            fetchNotifications,
            markAsRead,
            markAllAsRead,
            pushNotificationsMuted,
            setPushNotificationsMuted: updateMutedState
        }}>
            {children}

            {/* Real-time Popup (Toast) */}
            <AnimatePresence>
                {activeToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed top-6 right-6 z-[9999] w-full max-w-sm pointer-events-auto"
                    >
                        <div
                            onClick={() => {
                                if (!activeToast.read) markAsRead(activeToast._id);
                                const user = getUserDetails();
                                const basePath = getBasePath(user?.role);
                                if (activeToast.conversationId) {
                                    router.push(`${basePath}/messages?conversationId=${activeToast.conversationId}`);
                                } else if (activeToast.title?.toLowerCase().includes('message') || activeToast.title?.toLowerCase().includes('chat')) {
                                    const senderMatch = activeToast.title.match(/message from (.*)/i);
                                    const chatName = senderMatch ? senderMatch[1].trim() : "";
                                    const queryStr = chatName ? `?chatName=${encodeURIComponent(chatName)}` : `?autoOpen=true`;
                                    router.push(`${basePath}/messages${queryStr}`);
                                }
                                setActiveToast(null);
                            }}
                            className="bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl shadow-primary/20 cursor-pointer group hover:border-primary/40 transition-all overflow-hidden relative"
                        >
                            {/* Animated Background Progress */}
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="absolute bottom-0 left-0 h-1 bg-primary/30"
                            />

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    {activeToast.title?.toLowerCase().includes('message') ? (
                                        <MessageSquare className="text-primary w-6 h-6" />
                                    ) : (
                                        <Bell className="text-primary w-6 h-6" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-sm font-bold text-gray-900 truncate">{activeToast.title}</h4>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveToast(null);
                                            }}
                                            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{activeToast.message}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                                            <Zap className="w-3 h-3 fill-primary" />
                                            Just Now
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotificationContext must be used within a NotificationProvider");
    }
    return context;
};
