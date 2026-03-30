"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    Filter, 
    UserPlus, 
    MoreVertical, 
    Shield, 
    User, 
    Mail, 
    Calendar,
    XCircle,
    UserCircle2,
    X,
    Plus,
    Phone,
    Trash2,
    AlertCircle,
    Loader2,
    ChevronDown
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All Roles");
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState(null); // { id, name }
    const itemsPerPage = 7; // Increased items per page for better view

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/api/users/admin/all-users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    // Handle unauthorized access
                    console.error("Unauthorized access");
                    window.location.href = "/login";
                    return;
                }

                const data = await response.json();
                console.log("Admin Users API Response:", data); // Debug log

                // Transform API data to match UI structure
                let usersList = [];
                if (Array.isArray(data)) {
                    usersList = data;
                } else if (data.users && Array.isArray(data.users)) {
                    usersList = data.users;
                } else if (data.data && Array.isArray(data.data)) { // Check for data.data pattern
                    usersList = data.data;
                } else {
                    console.error("Unexpected API response structure:", data);
                    setUsers([]);
                    return;
                }

                const formattedUsers = usersList.map((user, index) => {
                    // Generate a color based on name/index if not provided
                    const colors = [
                        "from-blue-500 to-indigo-500",
                        "from-amber-400 to-orange-500",
                        "from-emerald-500 to-teal-500",
                        "from-purple-500 to-pink-500",
                        "from-red-500 to-orange-500"
                    ];
                    
                    const name = user.name || user.fullName || user.username || 
                                 (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName) || 
                                 (user.profile && typeof user.profile === 'object' ? user.profile.name : null) || 
                                 "Unknown";

                    return {
                        id: user._id || index,
                        name: name,
                        email: user.email || null,
                        mobile: user.mobile || user.phone || null,
                        role: user.role || "Candidate",
                        joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "Recently",
                        color: colors[index % colors.length]
                    };
                });
                setUsers(formattedUsers);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filtering Logic
    const filteredUsers = useMemo(() => {
        const filtered = users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.id.toString().includes(searchTerm);
            
            // Normalize role comparison
            const matchesRole = roleFilter === "All Roles" || 
                                user.role.toLowerCase() === roleFilter.toLowerCase() ||
                                (roleFilter === "HR / Employer" && user.role.toLowerCase() === "hr") ||
                                (roleFilter === "Candidate" && user.role.toLowerCase() === "user");
            
            return matchesSearch && matchesRole;
        });
        return filtered;
    }, [searchTerm, roleFilter, users]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        const id = userToDelete.id;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admin/user/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setUsers(users.filter(u => u.id !== id));
                setUserToDelete(null);
            } else {
                console.error("Failed to delete user");
                alert("Failed to delete user. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("An error occurred while deleting the user.");
        }
    };



    return (
        <div className="space-y-8 max-w-7xl mx-auto relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">User <span className="text-amber-500">Registry</span></h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and audit all platform accounts</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or ID..."
                        className="w-full bg-[#111418] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative group/filter">
                    <button
                        onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                        className="w-full bg-[#111418] border border-white/5 rounded-2xl pl-6 pr-12 py-4 text-white hover:border-white/10 transition-all flex items-center justify-between group-hover/filter:border-amber-500/30"
                    >
                        <div className="flex items-center gap-3">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">{roleFilter}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isRoleDropdownOpen ? "rotate-180 text-amber-500" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {isRoleDropdownOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsRoleDropdownOpen(false)}
                                    className="fixed inset-0 z-40"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-[#111418] border border-white/10 rounded-2xl p-2 z-50 shadow-2xl backdrop-blur-xl"
                                >
                                    {["All Roles", "Candidate", "HR / Employer", "Admin"].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => {
                                                setRoleFilter(role);
                                                setIsRoleDropdownOpen(false);
                                                setCurrentPage(1);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between ${
                                                roleFilter === role 
                                                    ? "bg-amber-500 text-black font-bold" 
                                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                            }`}
                                        >
                                            {role}
                                            {roleFilter === role && <motion.div layoutId="active" className="w-1.5 h-1.5 rounded-full bg-black" />}
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-[#111418] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">User</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Joined</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode='popLayout'>
                                    {paginatedUsers.map((user, index) => (
                                        <motion.tr 
                                            key={user.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${user.color} flex items-center justify-center text-sm font-black text-white shadow-lg`}>
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-amber-500 transition-colors">{user.name}</div>
                                                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-1">
                                                            {user.email ? (
                                                                <>
                                                                    <Mail className="w-3.5 h-3.5 text-blue-400/50" />
                                                                    <span className="font-medium tracking-wide">{user.email}</span>
                                                                </>
                                                            ) : user.mobile ? (
                                                                <>
                                                                    <Phone className="w-3.5 h-3.5 text-amber-400/50" />
                                                                    <span className="font-medium tracking-wide text-amber-500/70">{user.mobile}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <AlertCircle className="w-3.5 h-3.5 text-red-400/50" />
                                                                    <span className="font-medium italic tracking-wide text-red-500/50">No Contact Info</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    {user.role === 'HR / Employer' ? (
                                                        <Shield className="w-4 h-4 text-amber-500" />
                                                    ) : (
                                                        <UserCircle2 className="w-4 h-4 text-blue-500" />
                                                    )}
                                                    <span className="text-sm font-medium text-gray-300">{user.role}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-500 whitespace-nowrap">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Calendar className="w-4 h-4" />
                                                    {user.joined}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => setUserToDelete({ id: user.id, name: user.name })}
                                                        title="Delete User"
                                                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2 group/btn active:scale-95"
                                                    >
                                                        <Trash2 className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-6 group hover:border-amber-500/50 transition-colors">
                            <XCircle className="w-12 h-12 text-amber-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No users found</h3>
                        <p className="text-gray-500 max-w-xs">
                            We couldn't find any results matching "{searchTerm}". Try adjusting your filters or search query.
                        </p>
                        <button 
                            onClick={() => {setSearchTerm(""); setRoleFilter("All Roles");}}
                            className="mt-8 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-bold transition-all"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
                
                {filteredUsers.length > 0 && (
                    <div className="p-6 border-t border-white/5 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-600 tracking-widest uppercase">Showing {paginatedUsers.length} of {filteredUsers.length} users</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {userToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setUserToDelete(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#111418] border border-white/10 rounded-[32px] overflow-hidden relative z-10 shadow-2xl"
                        >
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-red-500/10 rounded-[24px] flex items-center justify-center mx-auto mb-6 border-2 border-red-500/20 shadow-lg shadow-red-500/5">
                                    <Trash2 className="w-10 h-10 text-red-500" />
                                </div>
                                
                                <h2 className="text-2xl font-black text-white mb-3">Delete Account?</h2>
                                <p className="text-gray-400 font-medium leading-relaxed mb-8">
                                    You are about to delete <span className="text-white font-bold">{userToDelete.name}</span>. This action is permanent and cannot be undone.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={handleDeleteUser}
                                        className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black transition-all shadow-lg shadow-red-500/20 active:scale-95"
                                    >
                                        Yes, Delete Account
                                    </button>
                                    <button 
                                        onClick={() => setUserToDelete(null)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl font-black transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <div className="h-1.5 bg-red-500 w-full" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
