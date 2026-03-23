import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, Paperclip, Phone, Video, Info, Check, CheckCheck, Loader2, X, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useNotificationContext } from "@/context/NotificationContext";
export default function StandaloneChat({ userRole, userName }) {
    const searchParams = useSearchParams();
    const conversationIdParam = searchParams.get("conversationId");
    const chatNameParam = searchParams.get("chatName");
    const autoOpenParam = searchParams.get("autoOpen");
    const { notifications, markAsRead: markNotificationAsRead } = useNotificationContext() || { notifications: [], markAsRead: () => {} };
    
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [recentContacts, setRecentContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [previewMessages, setPreviewMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [hoveredMsgId, setHoveredMsgId] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const autoScrollRef = useRef(true);

    // Helper to get token
    const getToken = () => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("token");
        }
        return null;
    };

    const [myUserId, setMyUserId] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const rawUserId = localStorage.getItem("userId");
            if (rawUserId) {
                setMyUserId(rawUserId);
                return;
            }
            try {
                const userObj = JSON.parse(localStorage.getItem("user") || "{}");
                if (userObj._id || userObj.id) {
                    setMyUserId(userObj._id || userObj.id);
                }
            } catch (e) {
                // Ignore
            }
        }
    }, []);

    // Load recent contacts from local storage on mount
    useEffect(() => {
        if (!myUserId) return;

        try {
            const saved = localStorage.getItem(`recent_contacts_${myUserId}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setRecentContacts(parsed);
                }
            }
        } catch (error) {
            console.error("Failed to load recent contacts", error);
        }
    }, [myUserId]);

    // Save recent contacts to local storage when updated
    useEffect(() => {
        if (!myUserId || recentContacts.length === 0) return;

        try {
            localStorage.setItem(`recent_contacts_${myUserId}`, JSON.stringify(recentContacts));
        } catch (error) {
            console.error("Failed to save recent contacts", error);
        }
    }, [recentContacts, myUserId]);

    // Handle scroll events to determine if we should auto-scroll
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        // Check if user is near the bottom (within 150px)
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        autoScrollRef.current = isNearBottom;
    };

    // Scroll to bottom when messages change, but only if user is already near the bottom
    useEffect(() => {
        if (autoScrollRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Force scroll to bottom when switching to a different contact
    useEffect(() => {
        autoScrollRef.current = true;
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }, 50);
    }, [activeContact]);

    // Handle search query with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const token = getToken();
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/search?query=${encodeURIComponent(searchQuery)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Assuming backend returns an array of users directly or inside 'data'
                const users = res.data?.data || res.data || [];
                setSearchResults(Array.isArray(users) ? users : []);
            } catch (error) {
                console.error("Error searching users:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Fetch conversation when active contact changes
    useEffect(() => {
        if (!activeContact) return;

        const fetchMessages = async () => {
            try {
                const token = getToken();
                const receiverId = activeContact._id || activeContact.id;
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/conversation/${receiverId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const msgs = res.data?.data?.messages || res.data?.messages || res.data?.data || res.data || [];
                
                // Merge new messages with existing optimistic read states
                setMessages(prev => {
                    if (prev.length === 0) return msgs;
                    
                    return msgs.map(newMsg => {
                        const existingMsg = prev.find(p => (p._id || p.id) === (newMsg._id || newMsg.id));
                        // If we optimistically marked it as read, keep it read in UI until refresh
                        if (existingMsg && existingMsg.read && !newMsg.read) {
                            return { ...newMsg, read: true, isRead: true };
                        }
                        return newMsg;
                    });
                });
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        setIsLoadingMessages(true);
        fetchMessages();

        // Optional polling for new messages every 5s
        const pollInterval = setInterval(fetchMessages, 5000);
        return () => clearInterval(pollInterval);
    }, [activeContact]);

    // Mark messages as read when active contact and messages are loaded
    useEffect(() => {
        if (!activeContact || messages.length === 0) return;

        // Find if there are any unread messages from the active contact
        const receiverId = activeContact._id || activeContact.id;
        const unreadMessages = messages.filter(msg => 
            !(msg.read || msg.isRead) && 
            (msg.senderId === receiverId || msg.sender === receiverId || msg.from === receiverId)
        );

        if (unreadMessages.length === 0) return;

        const markAsRead = async () => {
            try {
                const token = getToken();
                // 1. Mark Messages as read using the unified messages read endpoint
                await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/read/${receiverId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(e => console.error("Could not read messages on backend:", e));

                // 2. Mark corresponding Notifications as read to clear the dropdown
                if (notifications && notifications.length > 0 && markNotificationAsRead) {
                    const relevantNotifs = notifications.filter(n => 
                        !n.read && (
                            n.conversationId === (activeContact._id || activeContact.id) ||
                            (n.title && activeContact.name && n.title.toLowerCase().includes(activeContact.name.toLowerCase()))
                        )
                    );
                    relevantNotifs.forEach(n => {
                        markNotificationAsRead(n._id);
                    });
                }
                
                // Optimistically update local messages to read
                setMessages(prev => prev.map(msg => {
                    if (unreadMessages.some(u => (u._id || u.id) === (msg._id || msg.id))) {
                        return { ...msg, read: true, isRead: true, status: "read" };
                    }
                    return msg;
                }));
            } catch (error) {
                console.error("Error marking messages as read:", error);
            }
        };

        // Adding a slight delay to allow reading
        const timeoutId = setTimeout(markAsRead, 1000);
        return () => clearTimeout(timeoutId);
    }, [messages, activeContact]);

    useEffect(() => {
        const previewMessage = async () => {
            try {
                const token = getToken();
                const res = await axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/api/messages/previous-conversations', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const msgs = res.data?.data || res.data || [];
                // Sort by time just in case

                console.log("data", msgs);
                const items = Array.isArray(msgs) ? msgs : (msgs?.items || []);
                setPreviewMessages({ items, total: items.length });
            } catch (error) {
                console.error("Error fetching messages:", error);
                // Don't clear messages on brief network error, just log
            } finally {
                setIsLoadingMessages(false);
            }
        };
        previewMessage();
    }, []);

    // Auto-select conversation based on query parameter
    useEffect(() => {
        if (!previewMessages?.items || previewMessages.items.length === 0) return;

        if (conversationIdParam) {
            const targetConv = previewMessages.items.find(
                item => 
                    item._id === conversationIdParam || 
                    item.conversationId === conversationIdParam ||
                    (item.otherUser && (item.otherUser._id === conversationIdParam || item.otherUser.id === conversationIdParam))
            );
            if (targetConv?.otherUser) {
                handleContactSelect(targetConv.otherUser);
                return;
            }
        }

        if (chatNameParam) {
            const targetConv = previewMessages.items.find(
                item => item.otherUser?.name?.toLowerCase() === chatNameParam.toLowerCase()
            );
            if (targetConv?.otherUser) {
                handleContactSelect(targetConv.otherUser);
                return;
            }
        }

        if (autoOpenParam === "true" && !activeContact) {
            handleContactSelect(previewMessages.items[0].otherUser);
        }
    }, [conversationIdParam, chatNameParam, autoOpenParam, previewMessages]);

    const handleSendOrEdit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeContact || isSending) return;

        // Force auto-scroll to the bottom when the user sends a new message
        autoScrollRef.current = true;

        // If we are in edit mode, update the message instead of sending
        if (editingMessageId) {
            await handleEditMessage(editingMessageId);
            return;
        }

        const content = newMessage.trim();
        const receiverId = activeContact._id || activeContact.id;

        setIsSending(true);
        // Optimistic UI updates
        const tempId = Date.now().toString();
        const optimisticMsg = {
            _id: tempId,
            senderId: myUserId || "me", // fallback if myUserId is missing
            receiverId: receiverId,
            content: content,
            createdAt: new Date().toISOString(),
            status: "sending"  // custom flag
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage("");

        try {
            const token = getToken();
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/send`, {
                receiverId,
                content
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // If API returns the saved message object
            const savedMsg = res.data?.data || res.data;
            if (savedMsg && savedMsg._id) {
                setMessages(prev => prev.map(m => m._id === tempId ? savedMsg : m));
            } else {
                // Otherwise re-fetch conversation
                const fetchRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/conversation/${receiverId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const msgs = fetchRes.data?.data || fetchRes.data || [];
                const sortedMsgs = (Array.isArray(msgs) ? msgs : []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                setMessages(sortedMsgs);
            }
            // Add user to recent contacts
            setRecentContacts(prev => {
                const exists = prev.find(u => (u._id || u.id) === receiverId);
                if (exists) return prev;
                return [activeContact, ...prev];
            });

        } catch (error) {
            console.error("Error sending message:", error);
            // Revert optimistic update on failure
            setMessages(prev => prev.filter(m => m._id !== tempId));
        } finally {
            setIsSending(false);
        }
    };

    const handleContactSelect = (user) => {
        setActiveContact(user);
        
        // Only hide list on mobile screens
        if (window.innerWidth < 1024) {
             setIsMobileListVisible(false); 
        }

        setMessages([]); // Clear previous messages while loading

        // Add selected user AND all preview message contacts to recent contacts
        setRecentContacts(prev => {
            const existingIds = new Set(prev.map(u => u._id || u.id));
            const newContacts = [...prev];

            // Add the selected user first if not already present
            if (!existingIds.has(user._id || user.id)) {
                newContacts.unshift(user);
                existingIds.add(user._id || user.id);
            }

            // Also add all preview message contacts so the list stays complete
            if (previewMessages?.items) {
                previewMessages.items.forEach(data => {
                    const otherUser = data?.otherUser;
                    const userId = otherUser?._id;
                    if (userId && !existingIds.has(userId)) {
                        newContacts.push(otherUser);
                        existingIds.add(userId);
                    }
                });
            }

            return newContacts;
        });
    };

    // Styling properties
    const getRoleAccentColor = () => {
        if (userRole === "admin") return "from-amber-400 to-orange-500";
        if (userRole === "candidate") return "from-[#7C5CFC] to-[#6b4ce6]";
        return "from-[#3B82F6] to-cyan-500";
    };

    const getRoleRingColor = () => {
        if (userRole === "admin") return "ring-amber-500/50";
        if (userRole === "candidate") return "ring-[#7C5CFC]/50";
        return "ring-[#3B82F6]/50";
    };

    const getRoleBgColor = () => {
        if (userRole === "admin") return "bg-amber-500";
        if (userRole === "candidate") return "bg-[#7C5CFC]";
        return "bg-[#3B82F6]";
    };

    const getAvatarChar = (name) => {
        return name ? name.charAt(0).toUpperCase() : "U";
    };

    const getAvatarUrl = (user) => {
        if (!user) return null;
        let img = user.profileImage || user.profilePic || user.profilePicture || user.avatar || user?.profile?.image;
        if (!img) return null;
        if (typeof img === "string") return img;
        return img.url || img.imageUrl || img.secure_url || null;
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleDeleteMessage = async (msgId) => {
    try {
        const token = getToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/${msgId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (err) {
        console.error("Delete failed", err);
    }
};

const handleEditMessage = async (msgId) => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
        const token = getToken();
        const res = await axios.put(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/${msgId}`,
            { content: newMessage.trim() },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const updated = res.data?.data || res.data;

        setMessages(prev =>
            prev.map(m => (m._id === msgId ? { ...m, content: updated.content || newMessage.trim() } : m))
        );

        cancelEditing();
    } catch (err) {
        console.error("Edit failed", err);
    } finally {
        setIsSending(false);
    }
};

const startEditing = (msgId, content) => {
    setEditingMessageId(msgId);
    setNewMessage(content);
};

const cancelEditing = () => {
    setEditingMessageId(null);
    setNewMessage("");
};
    return (
        <div className="flex h-[calc(100vh-8rem)] bg-[#FFFFFF] border border-[#F1F1F1] rounded-[24px] overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)] relative">

            {/* Sidebar (Contacts List) */}
            <div className={`w-full lg:w-96 flex-col border-r border-[#F1F1F1] bg-[#F4F7FE]/50 lg:bg-[#F4F7FE]/30 ${!isMobileListVisible && activeContact ? 'hidden lg:flex' : 'flex'}`}>
                {/* Search Header */}
                <div className="p-4 lg:p-6 border-b border-[#F1F1F1] bg-[#FFFFFF]">
                    <h2 className="text-xl font-bold text-[#080808] mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" suppressHydrationWarning />
                        <input
                            type="text"
                            placeholder="Find users to message..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-[#FFFFFF] border border-[#F1F1F1] rounded-[12px] pl-9 pr-4 py-2.5 text-sm text-[#080808] placeholder:text-[#71717A] focus:outline-none focus:border-[#7C5CFC] focus:ring-1 focus:ring-[#7C5CFC]/50 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.02)]`}
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C5CFC] animate-spin" suppressHydrationWarning />
                        )}
                    </div>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#FFFFFF]">
                    {!searchQuery.trim() ? (
                        recentContacts.length > 0 ? (
                            recentContacts.map(user => {
                                const userId = user._id || user.id;
                                const isActive = activeContact && (activeContact._id || activeContact.id) === userId;

                                return (
                                    <button
                                        key={`recent-${userId}`}
                                        onClick={() => handleContactSelect(user)}
                                        className={`w-full flex items-center gap-4 p-4 lg:p-5 border-b border-[#F1F1F1] transition-all text-left ${isActive ? 'bg-[#EBE8FF]' : 'hover:bg-[#EBE8FF]'}`}
                                    >
                                        <div className="relative shrink-0">
                                            {getAvatarUrl(user) ? (
                                                <img
                                                    src={getAvatarUrl(user)}
                                                    alt={user.name}
                                                    className="w-12 h-12 rounded-full object-cover shadow-lg border border-white/10"
                                                />
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full bg-linear-to-tr ${getRoleAccentColor()} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                                    {getAvatarChar(user.name)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`font-bold truncate ${isActive ? 'text-[#7C5CFC]' : 'text-[#080808]'}`}>{user.name}</h3>
                                            </div>
                                            <div className="flex justify-between items-center gap-2">
                                                <p className={`text-sm truncate capitalize ${isActive ? 'text-[#7C5CFC]/80 font-medium' : 'text-[#71717A] font-medium'}`}>{user.role || 'User'}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center">
                                {
                                    previewMessages?.items?.map((data) => {
                                        const userId = data?.otherUser?._id;
                                        const isActive = activeContact && (activeContact._id || activeContact.id) === userId;

                                        return (
                                            <button
                                                key={`recent-${userId}`}
                                                onClick={() => handleContactSelect(data?.otherUser)}
                                                className={`w-full flex items-center gap-4 p-4 lg:p-5 border-b border-[#F1F1F1] transition-all text-left ${isActive ? 'bg-[#EBE8FF]' : 'hover:bg-[#EBE8FF]'}`}
                                            >
                                                <div className="relative shrink-0">
                                                    {getAvatarUrl(data?.otherUser) ? (
                                                        <img
                                                            src={getAvatarUrl(data?.otherUser)}
                                                            alt={data?.otherUser?.name}
                                                            className="w-12 h-12 rounded-full object-cover shadow-lg border border-white/10"
                                                        />
                                                    ) : (
                                                        <div className={`w-12 h-12 rounded-full bg-linear-to-tr ${getRoleAccentColor()} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                                            {getAvatarChar(data?.otherUser?.name)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className={`font-bold truncate ${isActive ? 'text-[#7C5CFC]' : 'text-[#080808]'}`}>{data?.otherUser?.name}</h3>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-2">
                                                        <p className={`text-sm truncate capitalize ${isActive ? 'text-[#7C5CFC]/80 font-medium' : 'text-[#71717A] font-medium'}`}>{data?.otherUser?.role || 'User'}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );

                                    })
                                }
                            </div>
                        )
                    ) : searchResults.length > 0 ? (
                        searchResults.map(user => {
                            const userId = user._id || user.id;
                            const isActive = activeContact && (activeContact._id || activeContact.id) === userId;

                            return (
                                <button
                                    key={`search-${userId}`}
                                    onClick={() => handleContactSelect(user)}
                                    className={`w-full flex items-center gap-4 p-4 lg:p-5 border-b border-[#F1F1F1] transition-all text-left ${isActive ? 'bg-[#EBE8FF]' : 'hover:bg-[#EBE8FF]'}`}
                                >
                                    <div className="relative shrink-0">
                                        {getAvatarUrl(user) ? (
                                            <img
                                                src={getAvatarUrl(user)}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover shadow-lg border border-white/10"
                                            />
                                        ) : (
                                            <div className={`w-12 h-12 rounded-full bg-linear-to-tr ${getRoleAccentColor()} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                                {getAvatarChar(user.name)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`font-bold truncate ${isActive ? 'text-[#7C5CFC]' : 'text-[#080808]'}`}>{user.name}</h3>
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <p className={`text-sm truncate capitalize ${isActive ? 'text-[#7C5CFC]/80 font-medium' : 'text-[#71717A] font-medium'}`}>{user.role || 'User'}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center bg-white">
                            <p className="text-[#71717A] font-medium">No users found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex-col bg-[#F4F7FE] ${isMobileListVisible && !activeContact ? 'hidden lg:flex' : 'flex'} lg:flex`}>
                {activeContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-4 lg:px-8 py-4 border-b border-[#F1F1F1] bg-white flex justify-between items-center relative z-10 shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsMobileListVisible(true)}
                                    className="lg:hidden p-2 -ml-2 text-[#7C5CFC] hover:text-[#080808] rounded-xl hover:bg-[#F4F7FE]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m15 18-6-6 6-6" /></svg>
                                </button>

                                {getAvatarUrl(activeContact) ? (
                                    <img
                                        src={getAvatarUrl(activeContact)}
                                        alt={activeContact.name}
                                        className="w-10 h-10 rounded-full object-cover border border-[#F1F1F1]"
                                    />
                                ) : (
                                    <div className={`w-10 h-10 rounded-full bg-linear-to-tr ${getRoleAccentColor()} flex items-center justify-center text-white font-bold shrink-0`}>
                                        {getAvatarChar(activeContact.name)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-[#080808] leading-tight">{activeContact.name}</h3>
                                    <span className="text-xs text-[#71717A] flex items-center gap-1.5 mt-0.5 capitalize font-medium">
                                        {activeContact.role || 'User'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 lg:gap-2 text-[#71717A]">
                                {/* <button className="p-2 sm:p-2.5 hover:bg-white/5 rounded-full transition-colors hidden sm:block"><Phone className="w-4.5 h-4.5" suppressHydrationWarning /></button> */}
                                {/* <button className="p-2 sm:p-2.5 hover:bg-white/5 rounded-full transition-colors hidden sm:block"><Video className="w-4.5 h-4.5" suppressHydrationWarning /></button> */}
                                <div className="w-px h-6 bg-[#F1F1F1] mx-1 hidden sm:block"></div>
                                <button className="p-2 sm:p-2.5 hover:bg-[#F4F7FE] hover:text-[#080808] rounded-[12px] transition-colors"><Info className="w-4.5 h-4.5" suppressHydrationWarning /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 scrollbar-hide relative bg-[#F4F7FE]"
                        >
                            {isLoadingMessages && messages.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#F4F7FE]/50 z-10">
                                    <Loader2 className={`w-8 h-8 animate-spin text-[#7C5CFC]`} suppressHydrationWarning />
                                </div>
                            ) : null}

                            {messages.length === 0 && !isLoadingMessages ? (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-[#71717A] font-medium">Say hi to start the conversation!</p>
                                </div>
                            ) : null}

                            {messages.map((msg, index) => {
                                // Identify "Me" if senderId equals my logged-in ID, 
                                // if sender is a populated object instead of an ID,
                                // or fallback if it has the sending flag.
                                const activeContactId = String(activeContact._id || activeContact.id);

                                console.log("msg", msg);


                                const getStrId = (val) => typeof val === 'object' && val !== null ? (val._id || val.id) : val;
                                const msgSenderId = String(getStrId(msg.senderId) || getStrId(msg.sender) || getStrId(msg.sender_id) || getStrId(msg.userId) || getStrId(msg.from) || "");

                                let isMe = false;
                                if (msg.status === "sending" || msgSenderId === "me") {
                                    isMe = true;
                                } else if (msg.isOutbound) {
                                    isMe = true;
                                } else if (myUserId && msgSenderId === String(myUserId)) {
                                    isMe = true;
                                } else if (msgSenderId === activeContactId) {
                                    isMe = false;
                                } else {
                                    // In a 1-1 chat, if the sender is NOT the active contact, it must be the logged-in user.
                                    isMe = true;
                                }

                                return (
                                    <motion.div
                                        key={msg._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {/* <div className={`px-5 py-3.5 rounded-[16px] break-all sm:break-normal whitespace-pre-wrap w-full ${isMe
                                                ? `bg-[#7C5CFC] text-white rounded-tr-none shadow-[0px_4px_20px_rgba(124,92,252,0.15)] opacity-${msg.status === 'sending' ? '80' : '100'}`
                                                : 'bg-white text-[#080808] border border-[#F1F1F1] rounded-tl-none shadow-[0px_4px_20px_rgba(0,0,0,0.02)]'
                                                }`}>
                                                <p className="text-[15px] leading-relaxed font-medium">{msg.content || msg.text}</p>
                                            </div> */}

                                            <div
    onMouseEnter={() => setHoveredMsgId(msg._id)}
    onMouseLeave={() => setHoveredMsgId(null)}
    className="relative"
>
    <div
        className={`px-5 py-3.5 rounded-[16px] break-all whitespace-pre-wrap w-full ${
            isMe
                ? `bg-[#7C5CFC] text-white rounded-tr-none ${editingMessageId === msg._id ? 'ring-2 ring-[#7C5CFC]/50 ring-offset-2' : ''}`
                : "bg-white text-[#080808] border border-[#F1F1F1] rounded-tl-none"
        }`}
    >
        <p className="text-[15px] leading-relaxed font-medium">
            {msg.content || msg.text}
        </p>
    </div>

    {isMe && hoveredMsgId === msg._id && !editingMessageId && (msg.content || msg.text) !== "This message was deleted" && (
        <div className="absolute -top-3 right-2 flex gap-1 bg-white border border-[#E4E4E7] rounded-lg shadow px-1 py-0.5 z-10">
            <button
                onClick={() => startEditing(msg._id, msg.content || msg.text)}
                className="p-1.5 hover:bg-[#EBE8FF] rounded-md text-[#71717A] hover:text-[#7C5CFC] transition-colors"
                title="Edit message"
            >
                <Pencil className="w-3.5 h-3.5" suppressHydrationWarning />
            </button>
            <button
                onClick={() => handleDeleteMessage(msg._id)}
                className="p-1.5 hover:bg-red-50 rounded-md text-[#71717A] hover:text-red-500 transition-colors"
                title="Delete message"
            >
                <Trash2 className="w-3.5 h-3.5" suppressHydrationWarning />
            </button>
        </div>
    )}
</div>
                                            <div className={`flex items-center gap-1.5 mt-1.5 text-xs px-1 ${isMe ? 'text-[#7C5CFC]/80' : 'text-[#71717A]'}`}>
                                                <span className="font-medium">{formatTime(msg.createdAt)}</span>
                                                {isMe && (
                                                    <span className={
                                                        msg.status === "sending" 
                                                            ? "text-[#71717A]/50" 
                                                            : (msg.read || msg.isRead || msg.status === "read") 
                                                                ? "text-[#7C5CFC]" 
                                                                : "text-[#71717A]"
                                                    }>
                                                        {msg.status === "sending" 
                                                            ? <Check className="w-3.5 h-3.5" suppressHydrationWarning /> 
                                                            : (msg.read || msg.isRead || msg.status === "read") 
                                                                ? <CheckCheck className="w-3.5 h-3.5" suppressHydrationWarning /> 
                                                                : <Check className="w-3.5 h-3.5" suppressHydrationWarning />
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 lg:p-6 bg-white border-t border-[#F1F1F1]">
                            {/* Edit mode indicator */}
                            {editingMessageId && (
                                <div className="flex items-center gap-3 mb-2 px-3 py-2 bg-[#EBE8FF] border border-[#7C5CFC]/20 rounded-[12px]">
                                    <Pencil className="w-4 h-4 text-[#7C5CFC] shrink-0" suppressHydrationWarning />
                                    <span className="text-sm text-[#7C5CFC] font-medium flex-1 truncate">Editing message</span>
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        className="p-1 hover:bg-[#7C5CFC]/10 rounded-lg text-[#7C5CFC] transition-colors shrink-0"
                                    >
                                        <X className="w-4 h-4" suppressHydrationWarning />
                                    </button>
                                </div>
                            )}
                            <form
                                onSubmit={handleSendOrEdit}
                                className={`flex items-end gap-3 bg-[#F4F7FE] p-2 border rounded-[16px] focus-within:bg-white transition-all shadow-inner relative ${editingMessageId ? 'border-[#7C5CFC]/30' : 'border-[#F1F1F1] focus-within:border-[#7C5CFC]/30'}`}
                            >
                                <button type="button" className="p-2 sm:p-2.5 text-[#71717A] hover:text-[#080808] rounded-[12px] hover:bg-white transition-colors shrink-0">
                                    <Paperclip className="w-5 h-5" suppressHydrationWarning />
                                </button>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape' && editingMessageId) {
                                            cancelEditing();
                                            return;
                                        }
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendOrEdit(e);
                                        }
                                    }}
                                    placeholder={editingMessageId ? 'Edit your message...' : `Message ${activeContact.name.split(' ')[0]}...`}
                                    className="flex-1 max-h-32 min-h-[44px] bg-transparent text-[#080808] placeholder:text-[#71717A] font-medium resize-none outline-none py-2.5 text-[15px]"
                                    rows={1}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className={`p-2 sm:p-2.5 rounded-[12px] transition-all shrink-0 ${newMessage.trim() && !isSending
                                        ? `bg-[#7C5CFC] text-[#FFFFFF] shadow-[0px_4px_20px_rgba(124,92,252,0.15)] hover:bg-[#6b4ce6]`
                                        : 'bg-[#F1F1F1] text-[#71717A] cursor-not-allowed'
                                        }`}
                                >
                                    {isSending ? <Loader2 className="w-5 h-5 ml-0.5 animate-spin" suppressHydrationWarning /> : editingMessageId ? <Check className="w-5 h-5 ml-0.5" suppressHydrationWarning /> : <Send className="w-5 h-5 ml-0.5" suppressHydrationWarning />}
                                </button>
                            </form>
                            {/* <div className="text-center mt-3">
                                <span className="text-[10px] text-[#71717A] font-medium tracking-wide">{editingMessageId ? 'Press Enter to save, Esc to cancel' : 'Press Enter to send, Shift+Enter for new line'}</span>
                            </div> */}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-[#F4F7FE]">
                        <h2 className="text-2xl font-bold text-[#080808] mb-2 tracking-tight">Your Messages</h2>
                        <p className="text-[#71717A] max-w-sm text-center font-medium leading-relaxed">
                            Search and select a user from the sidebar to start a conversation.
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}



