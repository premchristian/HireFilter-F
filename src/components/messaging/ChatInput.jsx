"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Image, Smile, X, File } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useMessaging } from "@/context/MessagingContext";

export default function ChatInput({ conversationId }) {
  const { sendMessage, startTyping, stopTyping, MESSAGE_TYPES } = useMessaging();
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
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
    if (!message.trim() && attachments.length === 0) return;

    const messageContent = message.trim();
    const messageAttachments = [...attachments];

    // Clear input immediately for better UX
    setMessage("");
    setAttachments([]);
    setIsTyping(false);
    stopTyping(conversationId);

    // Determine message type
    let messageType = MESSAGE_TYPES.TEXT;
    if (messageAttachments.length > 0) {
      const firstAttachment = messageAttachments[0];
      if (firstAttachment.type.startsWith('image/')) {
        messageType = MESSAGE_TYPES.IMAGE;
      } else {
        messageType = MESSAGE_TYPES.FILE;
      }
    }

    try {
      await sendMessage(conversationId, messageContent, messageType, messageAttachments);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show error toast here
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const updated = prev.filter(att => att.id !== id);
      // Clean up object URLs
      const removed = prev.find(att => att.id === id);
      if (removed?.url) {
        URL.revokeObjectURL(removed.url);
      }
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const commonEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  return (
    <div className="p-4 border-t border-white/5 bg-white/[0.02] relative">
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#6366F1]/20 border-2 border-dashed border-[#6366F1] rounded-xl flex items-center justify-center z-10"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Paperclip className="w-12 h-12 text-[#6366F1] mx-auto mb-2" />
              <p className="text-[#6366F1] font-medium">Drop files here to attach</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2"
          >
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
              >
                {attachment.type.startsWith('image/') ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                    <File className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-400">{attachment.size}</p>
                </div>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Attachment button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />
        </div>

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
          disabled={!message.trim() && attachments.length === 0}
          className={`p-3 rounded-xl transition-all ${
            message.trim() || attachments.length > 0
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