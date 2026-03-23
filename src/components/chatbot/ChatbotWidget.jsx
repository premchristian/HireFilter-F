"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2, Maximize2, RotateCcw, Search } from "lucide-react";
import { useChatbot } from "@/context/ChatbotContext";
import ChatbotMessage from "./ChatbotMessage";
import QuickReplies from "./QuickReplies";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [jobSearchValue, setJobSearchValue] = useState("");
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);

  const { messages, isTyping, quickReplies, sendMessage, clearChat } = useChatbot();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Handle redirects when bot sends redirect message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'bot' && lastMessage.redirect) {
        const redirectUrl = lastMessage.redirectUrl || '/candidate/dashboard';

        if (lastMessage.immediateRedirect) {
          // Immediate redirect
          window.location.href = redirectUrl;
        } else {
          // Delayed redirect (3 seconds)
          const timer = setTimeout(() => {
            window.location.href = redirectUrl;
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Show notification for new messages when widget is closed
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasNewMessage(true);
      // Auto-hide notification after 5 seconds
      const timer = setTimeout(() => setHasNewMessage(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setHasNewMessage(false);
    }
  }, [messages.length, isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Job search suggestions
  const jobSuggestions = [
    "React Developer Bangalore",
    "Java Developer Remote",
    "Python Developer Hyderabad",
    "Data Analyst Mumbai",
    "Full Stack Developer Pune",
    "Node.js Developer Chennai",
    "Angular Developer Delhi",
    "DevOps Engineer Bangalore",
    "UI/UX Designer Remote",
    "Machine Learning Engineer",
    "Software Engineer TCS",
    "Backend Developer Infosys",
    "Frontend Developer Wipro",
    "Data Scientist Google",
    "Product Manager Microsoft"
  ];

  const getFilteredSuggestions = (value) => {
    if (!value.trim()) return [];
    return jobSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);
  };

  const handleJobSearchChange = (e) => {
    const value = e.target.value;
    setJobSearchValue(value);
    setShowJobSuggestions(value.length > 0);
  };

  const handleJobSuggestionClick = (suggestion) => {
    setJobSearchValue(suggestion);
    setShowJobSuggestions(false);
    sendMessage(`Search for: ${suggestion}`);
  };

  const handleJobSearchSubmit = () => {
    if (jobSearchValue.trim()) {
      sendMessage(`Search for: ${jobSearchValue}`);
      setJobSearchValue("");
      setShowJobSuggestions(false);
    }
  };

  // Check if current message should show job search
  const shouldShowJobSearch = () => {
    if (messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    return lastMessage.type === 'bot' && lastMessage.showJobSearch;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`mb-4 bg-white/60 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden ${isMinimized ? 'w-80 h-16' : 'w-80 h-[500px]'
              } transition-all duration-300`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🤖</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">HireBot</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-white/80 text-xs">Online</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={clearChat}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
                  title="Clear chat"
                >
                  <RotateCcw className="w-4 h-4" suppressHydrationWarning />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMinimize}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" suppressHydrationWarning /> : <Minimize2 className="w-4 h-4" suppressHydrationWarning />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleWidget}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" suppressHydrationWarning />
                </motion.button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-transparent to-black/5 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                  {messages.map((message) => (
                    <ChatbotMessage key={message.id} message={message} />
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-xs">🤖</span>
                      </div>
                      <div className="bg-white/10 rounded-2xl rounded-bl-none px-3 py-2 flex items-center gap-1">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-gray-400 text-xs ml-2">typing...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {quickReplies && quickReplies.length > 0 && !isTyping && (
                  <div className="px-4 pb-2">
                    <QuickReplies replies={quickReplies} />
                  </div>
                )}

                {/* Job Search Input */}
                {shouldShowJobSearch() && !isTyping && (
                  <div className="px-4 pb-2">
                    <div className="relative">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={jobSearchValue}
                          onChange={handleJobSearchChange}
                          placeholder="Type job title, skills, or company..."
                          className="flex-1 bg-white/30 border border-primary/30 rounded-xl px-3 py-2 text-slate-900 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-medium"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleJobSearchSubmit}
                          disabled={!jobSearchValue.trim()}
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${jobSearchValue.trim()
                            ? "bg-primary hover:bg-primary-dark text-white"
                            : "bg-white/10 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                          Search
                        </motion.button>
                      </div>

                      {/* Job Suggestions Dropdown */}
                      {showJobSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl z-10 max-h-40 overflow-y-auto"
                        >
                          {getFilteredSuggestions(jobSearchValue).map((suggestion, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ backgroundColor: "rgba(124, 92, 252, 0.1)" }}
                              onClick={() => handleJobSuggestionClick(suggestion)}
                              className="w-full text-left px-3 py-2 text-slate-800 text-sm hover:bg-primary/10 transition-colors first:rounded-t-xl last:rounded-b-xl font-medium"
                            >
                              <span className="text-primary">🔍</span> {suggestion}
                            </motion.button>
                          ))}
                          {getFilteredSuggestions(jobSearchValue).length === 0 && (
                            <div className="px-3 py-2 text-gray-400 text-sm">
                              No suggestions found. Try "React Developer" or "Java Remote"
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/30 border border-white/50 rounded-xl px-3 py-2 text-slate-900 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent font-medium"
                      disabled={isTyping}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isTyping}
                      className={`p-2 rounded-xl transition-all ${inputValue.trim() && !isTyping
                        ? "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25"
                        : "bg-white/10 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      <Send className="w-4 h-4" suppressHydrationWarning />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleWidget}
        className="relative w-14 h-14 bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-primary/25 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" suppressHydrationWarning />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" suppressHydrationWarning />
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Message Notification */}
        <AnimatePresence>
          {hasNewMessage && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-white rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Effect */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark rounded-full"
        />
      </motion.button>
    </div>
  );
}