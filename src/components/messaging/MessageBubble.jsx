"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, Clock, AlertCircle, Download, Eye, Pencil, Trash2, X, Check as CheckIcon } from "lucide-react";
import { useState } from "react";
import { MESSAGE_TYPES, useMessaging } from "@/context/MessagingContext";

export default function MessageBubble({ message, isOwn, showAvatar = true }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const { updateMessage, deleteMessage } = useMessaging();

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleUpdate = async () => {
        if (editContent.trim() === "") return;
        if (editContent === message.content) {
            setIsEditing(false);
            return;
        }
        await updateMessage(message.id, editContent);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this message?")) {
            await deleteMessage(message.id);
        }
    };

    const getStatusIcon = () => {
        switch (message.status) {
            case 'sending':
                return <Clock className="w-3 h-3 text-gray-500" />;
            case 'sent':
                return <Check className="w-3 h-3 text-gray-400" />;
            case 'delivered':
                return <CheckCheck className="w-3 h-3 text-gray-400" />;
            case 'read':
                return <CheckCheck className="w-3 h-3 text-blue-400" />;
            case 'failed':
                return <AlertCircle className="w-3 h-3 text-red-400" />;
            default:
                return null;
        }
    };

    const renderMessageContent = () => {
        if (isEditing) {
            return (
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <textarea
                        className="w-full bg-white/10 text-white rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 resize-none min-h-[60px]"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditContent(message.content);
                            }}
                            className="p-1 hover:bg-white/10 rounded-md text-gray-300 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleUpdate}
                            className="p-1 hover:bg-white/10 rounded-md text-white transition-colors"
                        >
                            <CheckIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            );
        }

        switch (message.type) {
            case MESSAGE_TYPES.TEXT:
                return (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                );

            case MESSAGE_TYPES.IMAGE:
                return (
                    <div className="space-y-2">
                        {message.content && (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                            </p>
                        )}
                        <div className="relative rounded-lg overflow-hidden bg-black/20 max-w-sm">
                            {!imageLoaded && !imageError && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                                </div>
                            )}
                            {imageError ? (
                                <div className="p-4 text-center text-gray-400">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-xs">Failed to load image</p>
                                </div>
                            ) : (
                                <img
                                    src={message.attachments?.[0]?.url}
                                    alt="Shared image"
                                    className={`w-full h-auto transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageError(true)}
                                />
                            )}
                        </div>
                    </div>
                );

            case MESSAGE_TYPES.FILE:
                return (
                    <div className="space-y-2">
                        {message.content && (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                            </p>
                        )}
                        {message.attachments?.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Download className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                    <p className="text-xs text-gray-400">{file.size}</p>
                                </div>
                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                );

            case MESSAGE_TYPES.SYSTEM:
                return (
                    <div className="flex items-center justify-center">
                        <div className="px-3 py-1 bg-white/5 rounded-full">
                            <p className="text-xs text-gray-400 text-center">{message.content}</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                );
        }
    };

    if (message.type === MESSAGE_TYPES.SYSTEM) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center my-4"
            >
                {renderMessageContent()}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {/* Avatar */}
            {showAvatar && !isOwn && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {getInitials(message.senderName)}
                </div>
            )}

            {/* Spacer when no avatar */}
            {!showAvatar && !isOwn && <div className="w-8" />}

            {/* Message content */}
            <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col relative group`}>
                {/* Sender name (for group chats) */}
                {!isOwn && showAvatar && (
                    <p className="text-xs text-gray-400 mb-1 ml-1">{message.senderName}</p>
                )}

                {/* Message bubble */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-2xl p-3 relative group ${isOwn
                            ? `bg-[#6366F1] text-white ${showAvatar ? 'rounded-tr-none' : ''}`
                            : `bg-white/10 text-gray-200 ${showAvatar ? 'rounded-tl-none' : ''}`
                        } ${message.status === 'failed' ? 'border border-red-400/50' : ''}`}
                >
                    {renderMessageContent()}

                    {/* Message status and time */}
                    <div className={`flex items-center gap-1 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] opacity-70">
                            {formatTime(message.timestamp)}
                        </span>
                        {isOwn && (
                            <div className="flex items-center">
                                {getStatusIcon()}
                            </div>
                        )}
                    </div>

                    {/* Hover Actions */}
                    {isOwn && !isEditing && (
                        <div className={`absolute top-0 ${isOwn ? '-left-12' : '-right-12'} h-full flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition-all transform hover:scale-110"
                                title="Edit message"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-1.5 bg-white/10 hover:bg-red-500/20 rounded-lg text-gray-300 hover:text-red-400 transition-all transform hover:scale-110"
                                title="Delete message"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Retry button for failed messages */}
                    {message.status === 'failed' && isOwn && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -bottom-8 right-0 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                            Tap to retry
                        </motion.button>
                    )}
                </motion.div>

                {/* Read receipts */}
                {isOwn && message.readBy && message.readBy.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 mr-1">
                        <Eye className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-400">
                            Read by {message.readBy.length} {message.readBy.length === 1 ? 'person' : 'people'}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}