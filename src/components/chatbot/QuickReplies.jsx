"use client";

import { motion } from "framer-motion";
import { useChatbot } from "@/context/ChatbotContext";

export default function QuickReplies({ replies }) {
  const { sendQuickReply } = useChatbot();

  if (!replies || replies.length === 0) return null;

  // Arrange buttons in a better layout based on count
  const getLayoutClass = (count) => {
    if (count <= 2) return "flex gap-2";
    if (count === 3) return "grid grid-cols-2 gap-2"; // 2 on top, 1 below
    return "grid grid-cols-2 gap-2"; // 2x2 grid for 4+
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={getLayoutClass(replies.length)}
    >
      {replies.map((reply, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => sendQuickReply(reply)}
          className={`px-4 py-2.5 bg-white/40 hover:bg-white/60 border border-white/40 hover:border-white/60 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 transition-all backdrop-blur-md shadow-sm hover:shadow-md ${
            replies.length === 3 && index === 2 ? 'col-span-2' : ''
          }`}
        >
          {reply.text}
        </motion.button>
      ))}
    </motion.div>
  );
}