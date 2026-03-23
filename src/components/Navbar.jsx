'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import Logo from "./Logo"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { logout } from "@/utils/auth"
import { useRouter, usePathname } from "next/navigation"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
             const token = localStorage.getItem("token");
             const role = localStorage.getItem("userRole");
             if (token && role) {
                 setUser({ role });
             } else {
                 setUser(null);
             }
        };

        // Check on mount and pathname change
        checkAuth();

        // Listen for custom auth events and storage changes
        window.addEventListener("auth-change", checkAuth);
        window.addEventListener("storage", checkAuth);

        return () => {
            window.removeEventListener("auth-change", checkAuth);
            window.removeEventListener("storage", checkAuth);
        };
    }, [pathname]);

    const handleLogout = async () => {
        await logout();
        setUser(null);
        setIsOpen(false);
        router.push('/login');
    };

    const getDashboardLink = () => {
        if (!user?.role) return "/";
        const role = user.role === "user" ? "candidate" : user.role;
        return `/${role}/dashboard`;
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white">
                <Logo textClassName="text-xl md:text-2xl text-white" />

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
                    {user ? (
                        <>
                            <button 
                                onClick={handleLogout}
                                className="hover:text-white transition-colors"
                            >
                                Logout
                            </button>
                            <Link href={getDashboardLink()}>
                                <button className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-full text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                                    Dashboard
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
                            <Link href="/Register">
                                <button className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-full text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                                    Get Started
                                </button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6" suppressHydrationWarning /> : <Menu className="w-6 h-6" suppressHydrationWarning />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/10 overflow-hidden"
                    >
                        <div className="px-6 py-8 flex flex-col space-y-6">
                            {user ? (
                                <>
                                    <button 
                                        onClick={handleLogout}
                                        className="text-left text-xl font-medium text-gray-300 hover:text-white transition-colors"
                                    >
                                        Logout
                                    </button>
                                    <Link 
                                        href={getDashboardLink()}
                                        onClick={() => setIsOpen(false)}
                                        className="w-full flex"
                                    >
                                        <button className="w-full bg-blue-600 px-6 py-4 rounded-2xl text-white font-bold text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                            Dashboard
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        href="/login" 
                                        onClick={() => setIsOpen(false)}
                                        className="text-xl font-medium text-gray-300 hover:text-white transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        href="/Register"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full flex"
                                    >
                                        <button className="w-full bg-blue-600 px-6 py-4 rounded-2xl text-white font-bold text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                            Get Started
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
