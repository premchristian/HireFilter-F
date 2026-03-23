"use client";

import { useState, useEffect, Suspense } from "react";
import { getUserDetails } from "@/utils/auth";
import StandaloneChat from "@/components/messaging/StandaloneChat";
import { motion } from "framer-motion";
import { MessagesSkeleton } from "@/components/Skeleton";

export default function CandidateMessagingPage() {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const user = getUserDetails();
        setUserName(user?.name || "Candidate");
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col h-full gap-6 px-2 lg:px-0"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#080808]">
                        Your <span className="text-[#7C5CFC]">Messages</span>
                    </h1>
                    <p className="text-[#71717A] mt-1 font-medium">Stay in touch with recruiters and hiring managers</p>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex-1 min-h-0">
                <Suspense fallback={<MessagesSkeleton />}>
                    <StandaloneChat userRole="candidate" userName={userName} />
                </Suspense>
            </motion.div>
        </motion.div>
    );
}
