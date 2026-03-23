"use client";

import { MaintenanceProvider } from "@/context/MaintenanceContext";
import { JobProvider } from "@/context/JobContext";
import { NotificationProvider } from "@/context/NotificationContext";

export function Providers({ children }) {
    return (
        <MaintenanceProvider>
            <NotificationProvider>
                <JobProvider>
                    {children}
                </JobProvider>
            </NotificationProvider>
        </MaintenanceProvider>
    );
}
