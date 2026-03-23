"use client";

import { useState, useEffect, Suspense } from "react";
import { getUserDetails } from "@/utils/auth";
import StandaloneChat from "@/components/messaging/StandaloneChat";
import { motion } from "framer-motion";

export default function HRMessagingPage() {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const user = getUserDetails();
        setUserName(user?.name || "HR Manager");
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full gap-4 lg:gap-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#080808]">
                        Communication Center
                    </h1>
                    <p className="text-[#71717A] mt-1 font-medium">Chat securely with candidates and team members</p>
                </div>
            </div>

            <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading chat...</div>}>
                <StandaloneChat userRole="hr" userName={userName} />
            </Suspense>
        </motion.div>
    );
}
