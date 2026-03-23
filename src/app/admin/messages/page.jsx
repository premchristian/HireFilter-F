"use client";

import { useState, useEffect, Suspense } from "react";
import { getUserDetails } from "@/utils/auth";
import StandaloneChat from "@/components/messaging/StandaloneChat";
import { motion } from "framer-motion";

export default function AdminMessagingPage() {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const user = getUserDetails();
        setUserName(user?.name || "Admin");
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full gap-4 lg:gap-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-orange-500">
                        Admin Communications
                    </h1>
                    <p className="text-gray-400 mt-1">Manage system-wide messages and alerts</p>
                </div>
            </div>

            <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading chat...</div>}>
                <StandaloneChat userRole="admin" userName={userName} />
            </Suspense>
        </motion.div>
    );
}
