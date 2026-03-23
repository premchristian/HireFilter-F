"use client";

import { motion } from "framer-motion";

export default function TypingIndicator({ users = [] }) {
  if (users.length === 0) return null;

  const getUserText = () => {
    if (users.length === 1) {
      return "is typing";
    } else if (users.length === 2) {
      return "are typing";
    } else {
      return `and ${users.length - 1} others are typing`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 mb-4"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-2 h-2 bg-white rounded-full"
        />
      </div>
      
      <div className="max-w-[70%]">
        <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
          <span className="text-sm text-gray-300">
            {users.length === 1 
              ? `${users[0]} is typing` 
              : `${users[0]} ${getUserText()}`
            }
          </span>
          
          {/* Animated dots */}
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
        </div>
      </div>
    </motion.div>
  );
}