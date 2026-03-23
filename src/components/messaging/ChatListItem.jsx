"use client";

import { motion } from "framer-motion";
import { useMessaging } from "@/context/MessagingContext";
import { formatDistanceToNow } from "date-fns";

export default function ChatListItem({ conversation, isActive, onClick }) {
  const { onlineUsers } = useMessaging();
  
  const isOnline = onlineUsers.has(conversation.participantId);
  const hasUnread = conversation.unreadCount > 0;

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      return "";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return "No messages yet";
    return message.length > maxLength ? message.slice(0, maxLength) + "..." : message;
  };

  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 rounded-xl cursor-pointer transition-all relative group ${
        isActive 
          ? "bg-[#6366F1]/20 border border-[#6366F1]/30" 
          : "hover:bg-white/2 border border-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border border-white/10 ${
            conversation.participantAvatar 
              ? "bg-cover bg-center" 
              : "bg-linear-to-br from-gray-700 to-gray-900"
          }`}
          style={conversation.participantAvatar ? { backgroundImage: `url(${conversation.participantAvatar})` } : {}}
          >
            {!conversation.participantAvatar && getInitials(conversation.participantName)}
          </div>
          
          {/* Online indicator */}
          {isOnline && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0F1117]"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className={`text-sm font-bold truncate ${
              isActive ? "text-[#6366F1]" : "text-white"
            }`}>
              {conversation.participantName || "Unknown User"}
            </h3>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {conversation.lastMessageTime && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTime(conversation.lastMessageTime)}
                </span>
              )}
            </div>
          </div>

          {/* Role/Company info */}
          {(conversation.jobTitle || conversation.participantRole || conversation.participantCompany) && (
            <p className="text-xs text-gray-400 truncate mb-1">
              {conversation.jobTitle 
                ? `Applied for: ${conversation.jobTitle}`
                : [conversation.participantCompany, conversation.participantRole]
                    .filter(Boolean)
                    .join(" • ")
              }
            </p>
          )}

          {/* Last message */}
          <div className="flex items-center justify-between">
            <p className={`text-xs truncate flex-1 ${
              hasUnread ? "text-white font-medium" : "text-gray-500"
            }`}>
              {truncateMessage(conversation.lastMessage)}
            </p>
            
            {/* Unread badge */}
            {hasUnread && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 min-w-[18px] h-[18px] bg-[#6366F1] rounded-full flex items-center justify-center"
              >
                <span className="text-xs font-bold text-white">
                  {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Hover effect */}
      <motion.div 
        className="absolute inset-0 rounded-xl bg-linear-to-r from-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        initial={false}
      />
    </motion.div>
  );
}