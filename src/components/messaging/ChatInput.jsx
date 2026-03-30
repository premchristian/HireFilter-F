"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useMessaging } from "@/context/MessagingContext";

export default function ChatInput({ conversationId }) {
  const { sendMessage, startTyping, stopTyping, MESSAGE_TYPES } = useMessaging();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Handle typing indicators
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      startTyping(conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(conversationId);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, conversationId, isTyping, startTyping, stopTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const messageContent = message.trim();

    setMessage("");
    setIsTyping(false);
    stopTyping(conversationId);

    try {
      await sendMessage(conversationId, messageContent, MESSAGE_TYPES.TEXT, []);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };



  const commonEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  return (
    <div className="p-4 border-t border-white/5 bg-white/[0.02] relative">


      {/* Emoji picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-4 mb-2 p-3 bg-[#1a1d23] border border-white/10 rounded-xl shadow-xl z-20"
          >
            <div className="grid grid-cols-5 gap-2">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div 
        className="flex items-end gap-3"
      >

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 placeholder-gray-500 min-h-[48px] max-h-[120px]"
            rows={1}
          />
          
          {/* Emoji button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!message.trim()}
          className={`p-3 rounded-xl transition-all ${
            message.trim()
              ? "bg-[#6366F1] hover:bg-[#5855eb] text-white shadow-lg shadow-[#6366F1]/25"
              : "bg-white/5 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}