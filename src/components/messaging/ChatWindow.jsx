"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, Video, MoreVertical, ArrowLeft, MessageSquare, ArrowDown } from "lucide-react";
import { useMessaging } from "@/context/MessagingContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { useState, useEffect, useRef } from "react";

export default function ChatWindow({ onBack, className = "" }) {
    const {
        conversations,
        activeConversationId,
        typingUsers,
        onlineUsers,
        currentUser,
        markAsRead
    } = useMessaging();

    const [showScrollButton, setShowScrollButton] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const activeConversation = conversations.find(conv => conv.id === activeConversationId);
    const messages = activeConversation?.messages || [];
    const isOnline = activeConversation ? onlineUsers.has(activeConversation.participantId) : false;

    // Get typing users for this conversation (excluding current user)
    const conversationTypingUsers = activeConversationId && typingUsers[activeConversationId]
        ? typingUsers[activeConversationId]
            .map(userId => {
                if (userId === activeConversation.participantId) return activeConversation.participantName;
                const user = (useMessaging().users || []).find(u => u.id === userId);
                return user?.name || "Someone";
            })
        : [];

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? 'smooth' : 'instant'
        });
    };

    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
    };

    // Mark as read when messages are viewed
    useEffect(() => {
        if (activeConversationId && markAsRead) {
            markAsRead(activeConversationId);
        }
    }, [activeConversationId, messages.length, markAsRead]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom(false);
    }, [activeConversationId]);

    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.senderId === currentUser?.id) {
                scrollToBottom();
            }
        }
    }, [messages.length, currentUser?.id]);

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.timestamp).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    if (!activeConversation) {
        return (
            <div className={`flex-1 bg-white/5 border border-white/10 rounded-2xl flex flex-col backdrop-blur-xl overflow-hidden ${className}`}>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <MessageSquare className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
                        <p className="text-gray-500 text-sm">Choose a conversation from the sidebar to start messaging</p>
                    </div>
                </div>
            </div>
         );
    }

    return (
        <div className={`flex-1 bg-white/5 border border-white/10 rounded-2xl flex flex-col backdrop-blur-xl overflow-hidden ${className}`}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-b border-white/5 flex justify-between items-center bg-white/2"
            >
                <div className="flex items-center gap-3">
                    {/* Back button for mobile */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Avatar */}
                    <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border border-white/10 ${activeConversation.participantAvatar
                                ? "bg-cover bg-center"
                                : "bg-linear-to-br from-gray-700 to-gray-900"
                            }`}
                            style={activeConversation.participantAvatar ? { backgroundImage: `url(${activeConversation.participantAvatar})` } : {}}
                        >
                            {!activeConversation.participantAvatar && getInitials(activeConversation.participantName)}
                        </div>
                        {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0F1117]" />
                        )}
                    </div>

                    {/* User info */}
                    <div>
                        <h3 className="font-bold text-white leading-tight">
                            {activeConversation.participantName}
                        </h3>
                        <div className="flex items-center gap-2">
                            {isOnline ? (
                                <p className="text-xs text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Online
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">Offline</p>
                            )}
                            {activeConversation.jobTitle ? (
                                <>
                                    <span className="text-xs text-gray-600">•</span>
                                    <p className="text-xs text-[#6366F1] font-medium">Applied for: {activeConversation.jobTitle}</p>
                                </>
                            ) : activeConversation.participantRole && (
                                <>
                                    <span className="text-xs text-gray-600">•</span>
                                    <p className="text-xs text-gray-400">{activeConversation.participantRole}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <Phone className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <Video className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </motion.button>
                </div>
            </motion.div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide relative"
            >
                <AnimatePresence>
                    {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                        <div key={date}>
                            {/* Date separator */}
                            <div className="flex justify-center mb-6">
                                <span className="text-xs text-gray-500 px-3 py-1 bg-white/5 rounded-full">
                                    {formatDate(dateMessages[0].timestamp)}
                                </span>
                            </div>

                            {/* Messages for this date */}
                            {dateMessages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <MessageBubble
                                        message={message}
                                        isOwn={message.senderId === currentUser?.id}
                                        showAvatar={index === 0 || dateMessages[index - 1]?.senderId !== message.senderId}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {conversationTypingUsers.length > 0 && (
                    <TypingIndicator users={conversationTypingUsers} />
                )}

                <div ref={messagesEndRef} />

                {/* Scroll to bottom button */}
                <AnimatePresence>
                    {showScrollButton && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => scrollToBottom()}
                            className="fixed bottom-24 right-8 p-3 bg-[#6366F1] hover:bg-[#5855eb] rounded-full shadow-lg text-white transition-colors z-10"
                        >
                            <ArrowDown className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <ChatInput conversationId={activeConversationId} />
        </div>
    );
}