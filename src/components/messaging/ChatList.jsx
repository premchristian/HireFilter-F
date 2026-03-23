"use client";

import { motion } from "framer-motion";
import { Search, MoreVertical, RotateCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useMessaging } from "@/context/MessagingContext";
import ChatListItem from "./ChatListItem";

export default function ChatList({ className = "", onChatSelect }) {
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'contacts'
    const { conversations, activeConversationId, setActiveConversation, users, createConversation, fetchUsers } = useMessaging();
    const [searchQuery, setSearchQuery] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (fetchUsers) {
            setIsRefreshing(true);
            await fetchUsers();
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChatClick = (conversationId) => {
        setActiveConversation(conversationId);
        if (onChatSelect) {
            onChatSelect(conversationId);
        }
    };

    const handleUserClick = async (userId) => {
        const conversationId = await createConversation(userId);
        if (onChatSelect) {
            onChatSelect(conversationId);
        }
        setActiveTab('messages'); // Switch back to messages after starting chat
        setSearchQuery("");
    };

    return (
        <div className={`w-80 bg-white/5 border border-white/10 rounded-2xl flex flex-col backdrop-blur-xl ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Messaging</h2>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-black/20 rounded-xl">
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'messages'
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'contacts'
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Contacts
                        {activeTab === 'contacts' && (
                            <RotateCw
                                className={`w-3 h-3 cursor-pointer hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRefresh();
                                }}
                            />
                        )}
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder={activeTab === 'messages' ? "Search conversations..." : "Search people..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                {activeTab === 'messages' ? (
                    // Messages List
                    filteredConversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                <Search className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-500 text-sm">
                                {searchQuery ? "No conversations found" : "No messages yet"}
                            </p>
                            {searchQuery && activeTab === 'messages' && (
                                <button
                                    onClick={() => setActiveTab('contacts')}
                                    className="mt-2 text-xs text-[#6366F1] hover:underline"
                                >
                                    Search in all contacts instead
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredConversations.map((conversation, index) => (
                            <motion.div
                                key={conversation.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ChatListItem
                                    conversation={conversation}
                                    isActive={activeConversationId === conversation.id}
                                    onClick={() => handleChatClick(conversation.id)}
                                />
                            </motion.div>
                        ))
                    )
                ) : (
                    // Contacts List
                    filteredUsers.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                <Search className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-500 text-sm mb-4">No contacts found</p>
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 bg-[#6366F1]/10 hover:bg-[#6366F1]/20 border border-[#6366F1]/20 rounded-xl text-[#6366F1] text-xs font-bold transition-all flex items-center gap-2 mx-auto"
                            >
                                <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh List
                            </button>
                        </div>
                    ) : (
                        filteredUsers.map((user, index) => (
                            <motion.button
                                key={user.id}
                                onClick={() => handleUserClick(user.id)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                            >
                                <div className="relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${user.role === 'admin'
                                            ? 'bg-linear-to-br from-amber-500 to-orange-600'
                                            : 'bg-linear-to-br from-blue-500 to-indigo-600'
                                        }`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    {user.online && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0F1117] rounded-full"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors truncate">
                                            {user.name}
                                        </h4>
                                        {user.role === 'admin' && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                ADMIN
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                            </motion.button>
                        ))
                    )
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                        {activeTab === 'messages'
                            ? `${conversations.length} conversations`
                            : `${users.length} contacts`
                        }
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
}