"use client";

import { JobProvider } from "@/context/JobContext";
import { NotificationProvider } from "@/context/NotificationContext";

export function Providers({ children }) {
    return (
        <NotificationProvider>
            <JobProvider>
                {children}
            </JobProvider>
        </NotificationProvider>
    );
}
