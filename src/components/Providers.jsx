"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { JobProvider } from "@/context/JobContext";
import { NotificationProvider } from "@/context/NotificationContext";

function AutoRefresh() {
    const router = useRouter();
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 5000);
        return () => clearInterval(interval);
    }, [router]);
    return null;
}

export function Providers({ children }) {
    return (
        <NotificationProvider>
            <JobProvider>
                <AutoRefresh />
                {children}
            </JobProvider>
        </NotificationProvider>
    );
}
