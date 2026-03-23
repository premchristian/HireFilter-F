"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, MessageSquare, TrendingUp } from "lucide-react";

// Mock analytics data - in production, this would come from your analytics API
const mockAnalytics = {
  totalConversations: 1247,
  activeUsers: 89,
  avgResponseTime: "1.2s",
  satisfactionRate: "94%",
  topQuestions: [
    { question: "How do I find jobs?", count: 156 },
    { question: "What's the pricing?", count: 134 },
    { question: "How to post a job?", count: 98 },
    { question: "Technical support", count: 87 },
    { question: "Account help", count: 76 }
  ],
  conversationsByHour: [
    { hour: "00", count: 12 },
    { hour: "01", count: 8 },
    { hour: "02", count: 5 },
    { hour: "03", count: 3 },
    { hour: "04", count: 7 },
    { hour: "05", count: 15 },
    { hour: "06", count: 28 },
    { hour: "07", count: 45 },
    { hour: "08", count: 67 },
    { hour: "09", count: 89 },
    { hour: "10", count: 95 },
    { hour: "11", count: 87 },
    { hour: "12", count: 76 },
    { hour: "13", count: 82 },
    { hour: "14", count: 91 },
    { hour: "15", count: 88 },
    { hour: "16", count: 79 },
    { hour: "17", count: 65 },
    { hour: "18", count: 52 },
    { hour: "19", count: 38 },
    { hour: "20", count: 29 },
    { hour: "21", count: 22 },
    { hour: "22", count: 18 },
    { hour: "23", count: 15 }
  ]
};

export default function ChatbotAnalytics() {
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        totalConversations: prev.totalConversations + Math.floor(Math.random() * 3),
        activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 5) - 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 left-6 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all z-40"
      >
        <BarChart3 className="w-5 h-5" suppressHydrationWarning />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed bottom-6 left-6 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white z-40"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Chatbot Analytics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          ×
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-blue-400" suppressHydrationWarning />
            <span className="text-xs text-gray-400">Conversations</span>
          </div>
          <p className="text-xl font-bold">{analytics.totalConversations.toLocaleString()}</p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-green-400" suppressHydrationWarning />
            <span className="text-xs text-gray-400">Active Users</span>
          </div>
          <p className="text-xl font-bold">{analytics.activeUsers}</p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" suppressHydrationWarning />
            <span className="text-xs text-gray-400">Avg Response</span>
          </div>
          <p className="text-xl font-bold">{analytics.avgResponseTime}</p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-yellow-400" suppressHydrationWarning />
            <span className="text-xs text-gray-400">Satisfaction</span>
          </div>
          <p className="text-xl font-bold">{analytics.satisfactionRate}</p>
        </div>
      </div>

      {/* Top Questions */}
      <div className="mb-4">
        <h4 className="text-sm font-bold mb-2">Top Questions</h4>
        <div className="space-y-1">
          {analytics.topQuestions.slice(0, 3).map((item, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="text-gray-300 truncate">{item.question}</span>
              <span className="text-gray-500">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Chart */}
      <div>
        <h4 className="text-sm font-bold mb-2">24h Activity</h4>
        <div className="flex items-end gap-1 h-16">
          {analytics.conversationsByHour.map((item, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(item.count / 100) * 100}%` }}
              transition={{ delay: index * 0.02 }}
              className="flex-1 bg-gradient-to-t from-blue-500/50 to-purple-500/50 rounded-sm min-h-[2px]"
              title={`${item.hour}:00 - ${item.count} conversations`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>00:00</span>
          <span>12:00</span>
          <span>23:59</span>
        </div>
      </div>
    </motion.div>
  );
}