"use client";

import { motion } from "framer-motion";
import { MESSAGE_TYPES } from "@/context/ChatbotContext";
import { Bot, User } from "lucide-react";

export default function ChatbotMessage({ message }) {
    const isBot = message.type === MESSAGE_TYPES.BOT;
    const isUser = message.type === MESSAGE_TYPES.USER;

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatContent = (content) => {
        // Convert line breaks to JSX
        return content.split('\n').map((line, index) => (
            <span key={index}>
                {line}
                {index < content.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    if (message.type === MESSAGE_TYPES.SYSTEM) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center my-4"
            >
                <div className="px-3 py-1 bg-white/10 rounded-full">
                    <p className="text-xs text-gray-400 text-center">{message.content}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {/* Avatar */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isBot
                    ? 'bg-gradient-to-r from-primary to-primary-dark'
                    : 'bg-gradient-to-r from-success to-primary-dark'
                }`}>
                {isBot ? (
                    <span className="text-white text-xs">🤖</span>
                ) : (
                    <User className="w-3 h-3 text-white" />
                )}
            </div>

            {/* Message Content */}
            <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-2xl px-4 py-3 text-sm relative group shadow-sm ${isBot
                            ? 'bg-white/40 backdrop-blur-md text-slate-800 border border-white/40 rounded-bl-none'
                            : 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-none'
                        }`}
                >
                    <div className="leading-relaxed whitespace-pre-wrap">
                        {formatContent(message.content)}
                    </div>

                    {/* Timestamp on hover */}
                    <div className={`absolute -bottom-6 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'right-0' : 'left-0'
                        }`}>
                        {formatTime(message.timestamp)}
                    </div>
                </motion.div>

                {/* Bot typing animation for the first message */}
                {isBot && message.id === 'welcome' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-1 text-xs text-gray-500 flex items-center gap-1"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <span className="text-amber-500">⚡</span>
                        </motion.div>
                        <span className="font-semibold">AI-powered assistant</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}