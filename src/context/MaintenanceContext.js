"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUserDetails } from "@/utils/auth";

const MaintenanceContext = createContext();

export function MaintenanceProvider({ children }) {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize state from localStorage
    useEffect(() => {
        const storedMode = localStorage.getItem("maintenanceMode");
        if (storedMode === "true") {
            setIsMaintenanceMode(true);
        }
        setIsLoaded(true);
    }, []);

    // Check for redirection
    useEffect(() => {
        if (!isLoaded) return;

        const checkMaintenance = () => {
            // If maintenance mode is OFF, do nothing
            if (!isMaintenanceMode) return;

            // Allow access to maintenance page itself
            if (pathname === "/maintenance") return;

            // Allow access to login/register/public pages if needed, 
            // BUT user asked for "user and hr can show after login only Maintenance page"
            // So we primarily check roles.
            
            // Allow Admin access (case-insensitive check)
            const user = getUserDetails();
            console.log("Maintenance Check - Mode:", isMaintenanceMode, "Role:", user?.role, "Path:", pathname);
            
            if (user && (user.role === "Admin" || user.role === "admin")) return;

            // Allow Login/Register/Landing so admins can actually log in
            const publicPaths = ["/", "/login", "/register", "/forgot-password"];
            if (publicPaths.includes(pathname)) return;

            // Redirect everyone else (Candidates, HR, unauthenticated users trying to access protected routes)
            router.push("/maintenance");
        };

        checkMaintenance();
    }, [isMaintenanceMode, pathname, isLoaded, router]);

    const toggleMaintenanceMode = () => {
        const newMode = !isMaintenanceMode;
        setIsMaintenanceMode(newMode);
        localStorage.setItem("maintenanceMode", String(newMode));
        
        // Immediate check/redirect if turning ON
        if (newMode) {
             const user = getUserDetails();
             if (!user || (user.role !== "Admin" && user.role !== "admin")) {
                 router.push("/maintenance");
             }
        }
    };

    return (
        <MaintenanceContext.Provider value={{ isMaintenanceMode, toggleMaintenanceMode }}>
            {children}
        </MaintenanceContext.Provider>
    );
}

export function useMaintenance() {
    return useContext(MaintenanceContext);
}
