"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChatbotProvider } from "@/context/ChatbotContext";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import ChatbotAnalytics from "@/components/chatbot/ChatbotAnalytics";
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  Brain, 
  Users, 
  BarChart3, 
  Shield, 
  Clock,
  Sparkles,
  Target,
  Globe,
  Headphones
} from "lucide-react";

export default function ChatbotDemoPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced natural language processing understands context and provides intelligent responses",
      details: [
        "Context-aware conversations",
        "Intent recognition",
        "Smart response generation",
        "Learning from interactions"
      ]
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Lightning-fast responses with realistic typing indicators for natural conversation flow",
      details: [
        "Sub-second response times",
        "Realistic typing simulation",
        "Smooth conversation flow",
        "No waiting time"
      ]
    },
    {
      icon: Users,
      title: "Multi-Role Support",
      description: "Tailored responses for candidates, employers, and different user types",
      details: [
        "Role-based responses",
        "Personalized experience",
        "Context switching",
        "User preference memory"
      ]
    },
    {
      icon: Target,
      title: "Smart Suggestions",
      description: "Quick reply buttons guide users to relevant information and actions",
      details: [
        "Dynamic quick replies",
        "Action-based suggestions",
        "Contextual options",
        "Guided conversations"
      ]
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track conversations, user satisfaction, and bot performance metrics",
      details: [
        "Live conversation tracking",
        "User engagement metrics",
        "Performance analytics",
        "Satisfaction scoring"
      ]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Secure conversations with data protection and privacy compliance",
      details: [
        "End-to-end encryption",
        "GDPR compliance",
        "Data anonymization",
        "Secure storage"
      ]
    }
  ];

  const useCases = [
    {
      title: "Job Seekers",
      description: "Help candidates find jobs, understand the application process, and get career guidance",
      icon: "👤",
      examples: [
        "Find tech jobs in my area",
        "How do I upload my resume?",
        "What's the interview process?",
        "Career advice for designers"
      ]
    },
    {
      title: "Employers",
      description: "Assist HR teams with posting jobs, managing applications, and platform navigation",
      icon: "💼",
      examples: [
        "How to post a job?",
        "View candidate applications",
        "Pricing for premium features",
        "Setup company profile"
      ]
    },
    {
      title: "Support",
      description: "Provide 24/7 customer support for technical issues and account management",
      icon: "🎧",
      examples: [
        "Reset my password",
        "Billing questions",
        "Technical troubleshooting",
        "Account verification"
      ]
    }
  ];

  const stats = [
    { label: "Response Time", value: "< 1s", icon: Clock },
    { label: "Accuracy Rate", value: "94%", icon: Target },
    { label: "User Satisfaction", value: "4.8/5", icon: Sparkles },
    { label: "Languages", value: "12+", icon: Globe }
  ];

  return (
    <ChatbotProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#0F1117] via-[#1a1d23] to-[#0F1117]">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20" />
          <div className="relative max-w-7xl mx-auto px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-8">
                <Bot className="w-5 h-5 text-[#6366F1]" />
                <span className="text-white font-medium">AI-Powered Assistant</span>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
                Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">HireBot</span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                Your intelligent AI assistant that helps job seekers find opportunities and employers discover talent. 
                Available 24/7 with instant, personalized responses.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 min-w-[120px]"
                    >
                      <Icon className="w-6 h-6 text-[#6366F1] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-white mb-4">
              Powerful <span className="text-[#6366F1]">AI Features</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built with cutting-edge AI technology to provide the best user experience
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveFeature(index)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all ${
                      activeFeature === index
                        ? 'bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 border-[#6366F1]/30'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    } border backdrop-blur-xl`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        activeFeature === index ? 'bg-[#6366F1]' : 'bg-white/10'
                      }`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                        <p className="text-gray-400 mb-3">{feature.description}</p>
                        {activeFeature === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                          >
                            {feature.details.map((detail, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full" />
                                {detail}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Feature Demo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Try HireBot Now</h3>
                  <p className="text-gray-400">Click the chat button to start a conversation</p>
                </div>
                
                <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-2xl p-6 border border-[#6366F1]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold">HireBot</div>
                      <div className="text-xs text-emerald-400 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Online & Ready
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="bg-white/10 rounded-2xl rounded-bl-none p-3 text-gray-200">
                      Hi! I'm HireBot, your AI assistant. I can help you with:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Find Jobs", "How It Works", "For Employers", "Get Support"].map((text, i) => (
                        <div key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/20">
                          {text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-white mb-4">
              Built for <span className="text-[#6366F1]">Everyone</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              HireBot adapts to different user types and provides relevant assistance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group"
              >
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{useCase.title}</h3>
                <p className="text-gray-400 mb-6">{useCase.description}</p>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300 mb-3">Example Questions:</div>
                  {useCase.examples.map((example, i) => (
                    <div key={i} className="text-sm text-gray-400 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3 text-[#6366F1] shrink-0" />
                      "{example}"
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12"
          >
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to Experience <span className="text-[#6366F1]">AI-Powered</span> Assistance?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Start chatting with HireBot now and see how AI can transform your job search or hiring process.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl font-bold text-white shadow-2xl shadow-[#6366F1]/25 hover:shadow-[#6366F1]/40 transition-all"
              >
                Start Chatting Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
              >
                View Documentation
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Chatbot Widget */}
        <ChatbotWidget />
        <ChatbotAnalytics />
      </div>
    </ChatbotProvider>
  );
}