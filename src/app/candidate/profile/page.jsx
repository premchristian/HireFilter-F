"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin, Save, Camera, Trash2, Plus, X, Eye, EyeOff, Lock, Key, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import axios from "axios";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileSkeleton } from "@/components/Skeleton";

export default function ProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        role: "",
        email: "",
        phone: "",
        bio: "",
        skills: [],
        experience: 0,
        education: "",
        portfolio: "",
        currentAddress: {
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            pincode: "",
            country: "India"
        },
        resumeName: "",
        resumeLink: ""
    });

    // Password Update State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const getUrl = (img) => {
                    if (!img) return null;
                    if (typeof img === "string") return img;
                    return img.url || img.imageUrl || img.secure_url || null;
                };

                const [profileRes, uploadsRes] = await Promise.all([
                    axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/getProfile", { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/my-uploads", { headers: { Authorization: `Bearer ${token}` } }).catch(e => {
                        console.error("Failed to fetch my-uploads", e);
                        return { data: { success: false } };
                    })
                ]);

                if (profileRes.data && profileRes.data.success) {
                    let data = profileRes.data.data;

                    let extractedAvatar = getUrl(data.profileImage) || getUrl(data.profile?.image) || getUrl(data.avatar) || null;

                    if (uploadsRes.data && uploadsRes.data.success) {
                        const uploadsData = uploadsRes.data.data || uploadsRes.data;
                        console.log("Candidate Uploads Raw:", uploadsData);
                        const uploadAvatar = getUrl(uploadsData.profileImage || uploadsData.avatar || uploadsData.image);
                        if (uploadAvatar) {
                            extractedAvatar = uploadAvatar;
                        }
                    }

                    setProfile({
                        name: data.name || "",
                        role: data.role || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        bio: data.profile?.bio || "",
                        skills: data.profile?.skills || [],
                        experience: data.profile?.experience || 0,
                        education: data.profile?.education || "",
                        portfolio: data.profile?.portfolio || "",
                        currentAddress: {
                            addressLine1: data.currentAddress?.addressLine1 || "",
                            addressLine2: data.currentAddress?.addressLine2 || "",
                            city: data.currentAddress?.city || "",
                            state: data.currentAddress?.state || "",
                            pincode: data.currentAddress?.pincode || "",
                            country: data.currentAddress?.country || "India"
                        },
                        avatar: extractedAvatar,
                        resumeName: (uploadsRes.data && (uploadsRes.data.data?.resumeName || uploadsRes.data.resumeName)) || (uploadsRes.data && uploadsRes.data.data?.resume?.originalName) || "",
                        resumeLink: (uploadsRes.data && (uploadsRes.data.data?.resumeLink || uploadsRes.data.resumeLink)) || (uploadsRes.data && uploadsRes.data.data?.resume?.url) || ""
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile:", error);
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const [newSkill, setNewSkill] = useState("");
    const [uploadingResume, setUploadingResume] = useState(false);

    const uploadResume = async (file) => {
        if (!file) return;
        setUploadingResume(true);
        try {
            const token = localStorage.getItem("token");
            const email = profile.email || localStorage.getItem("userEmail");

            // 1. Upload file
            const formData = new FormData();
            formData.append("resume", file);

            const res = await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/upload-resume",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.success) {
                // Determine structure: res.data.data.resumeUrl or similar
                const uploadedUrl = res.data.data?.resumeUrl || res.data.data?.resume || res.data.resumeUrl || res.data.resume;

                localStorage.setItem(`resume_name_${email}`, file.name);
                if (uploadedUrl) {
                    localStorage.setItem(`resume_url_${email}`, uploadedUrl);
                }
                setProfile(prev => ({ ...prev, resumeName: file.name, resumeLink: uploadedUrl }));
            } else {
                alert("Failed to upload resume");
            }
        } catch (error) {
            console.error("Resume upload failed", error);
            alert("An error occurred uploading your resume.");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleRequestOTP = async () => {
        const email = profile.email || localStorage.getItem("userEmail");
        if (!email) {
            setPasswordError("User email not found. Please log in again.");
            return;
        }

        setIsSendingOTP(true);
        setPasswordError("");
        setOtpSent(false);

        try {
            console.log("Requesting OTP for candidate profile email:", email.trim());
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password`, {
                email: email.trim()
            });
            console.log("OTP Request Response:", res.data);
            setOtpSent(true);
        } catch (err) {
            console.error("OTP Request Failed. Status:", err.response?.status);
            console.error("Error Data:", err.response?.data);
            setPasswordError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOTP(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        const email = profile.email || localStorage.getItem("userEmail");

        if (!passwordForm.otp) {
            setPasswordError("Please enter the OTP");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setIsUpdatingPassword(true);
        setPasswordError("");

        try {
            console.log("Attempting candidate password reset for:", email.trim(), "with OTP:", passwordForm.otp.trim());
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`,
                {
                    email: email.trim(),
                    otp: passwordForm.otp.trim(),
                    newPassword: passwordForm.newPassword
                }
            );
            console.log("Password Reset Response:", res.data);

            setPasswordSuccess(true);
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess(false);
                setOtpSent(false);
                setPasswordForm({ otp: "", newPassword: "", confirmPassword: "" });
            }, 2000);
        } catch (err) {
            console.error("Password Update Failed. Status:", err.response?.status);
            console.error("Error Data:", err.response?.data);
            setPasswordError(err.response?.data?.message || "Failed to update password. Please check your OTP.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const payload = {
                name: profile.name,
                phone: profile.phone,
                currentAddress: profile.currentAddress,
                profile: {
                    skills: profile.skills,
                    experience: Number(profile.experience) || 0,
                    bio: profile.bio,
                    education: profile.education,
                    portfolio: profile.portfolio
                }
            };

            await axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/updateProfile", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    const removeSkill = (index) => {
        const updatedSkills = profile.skills.filter((_, i) => i !== index);
        setProfile({ ...profile, skills: updatedSkills });
    };

    const addSkill = () => {
        if (newSkill && !profile.skills.includes(newSkill)) {
            setProfile({ ...profile, skills: [...profile.skills, newSkill] });
            setNewSkill("");
        }
    };

    const handleAddressChange = (field, value) => {
        setProfile({
            ...profile,
            currentAddress: { ...profile.currentAddress, [field]: value }
        });
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const handleDeleteAccount = async () => {
        setDeleteError("");
        try {
            const email = localStorage.getItem("userEmail");
            const currentToken = localStorage.getItem("token");

            if (!email || !currentToken) {
                router.push("/login");
                return;
            }

            let newToken = currentToken;
            try {
                const loginRes = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/auth/login", {
                    email,
                    password: deletePassword
                });
                const loginData = loginRes.data.data || loginRes.data;
                if (loginData?.token) {
                    newToken = loginData.token;
                }
            } catch (err) {
                setDeleteError("Incorrect password");
                return;
            }

            await axios.delete(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/deleteProfile", {
                headers: { Authorization: `Bearer ${newToken}` }
            });

            localStorage.clear();
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new Event("auth-change"));
            router.push("/login");

        } catch (error) {
            console.error("Error deleting account:", error);
            setDeleteError("Failed to delete account. Please try again.");
        }
    };

    if (loading) return <ProfileSkeleton />;

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
            className="space-y-8 max-w-4xl mx-auto pb-12 px-2"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center bg-[#FFFFFF] p-6 rounded-[24px] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                <div>
                    <h1 className="text-3xl font-bold text-[#080808]">
                        My <span className="text-[#7C5CFC]">Profile</span>
                    </h1>
                    <p className="text-[#71717A] mt-1 font-medium text-sm">Manage your personal information and online presence</p>
                </div>
                <div className="flex gap-3">
                    {!isEditing && (
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2.5 rounded-[12px] font-bold transition-all flex items-center gap-2 active:scale-95 bg-white border border-[#F1F1F1] text-[#7C5CFC] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:bg-[#F4F7FE]"
                        >
                            <Lock className="w-4 h-4" />
                            <span>Update Password</span>
                        </button>
                    )}
                    <button
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        className={`px-6 py-2.5 rounded-[12px] font-bold transition-all flex items-center gap-2 active:scale-95 ${isEditing
                                ? "bg-[#27C052] hover:bg-[#20A044] text-white shadow-[0px_4px_20px_rgba(39,192,82,0.3)]"
                                : "bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white shadow-[0px_4px_20px_rgba(124,92,252,0.3)]"
                            }`}
                    >
                        {isEditing ? <Save className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Avatar & Bio */}
                <div className="md:col-span-1 space-y-8">
                    <motion.div
                        variants={itemVariants}
                        className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[24px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col items-center text-center relative overflow-hidden"
                    >
                        <div className="relative group cursor-pointer mb-6 z-10">
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    try {
                                        setUploadingAvatar(true);
                                        const token = localStorage.getItem("token");
                                        const formData = new FormData();
                                        formData.append("profileImage", file);

                                        const res = await axios.post(
                                            process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/upload-profile-image",
                                            formData,
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                    "Content-Type": "multipart/form-data"
                                                }
                                            }
                                        );

                                        if (res.data.success || res.data.data) {
                                            const resData = res.data.data;
                                            const getUrl = (img) => {
                                                if (!img) return null;
                                                if (typeof img === "string") return img;
                                                return img.url || img.imageUrl || img.secure_url || null;
                                            };
                                            const imageUrl = getUrl(resData) || getUrl(res.data);

                                            if (imageUrl) {
                                                setProfile(prev => ({ ...prev, avatar: imageUrl }));

                                                // Dispatch event so layout.jsx can instantly update the user's avatar in the sidebar
                                                const event = new CustomEvent("profileImageUpdated", { detail: imageUrl });
                                                window.dispatchEvent(event);
                                            }
                                        }
                                    } catch (error) {
                                        console.error("Error uploading avatar:", error);
                                        alert("Failed to upload avatar. Please try again.");
                                    } finally {
                                        setUploadingAvatar(false);
                                        e.target.value = "";
                                    }
                                }}
                                disabled={!isEditing || uploadingAvatar}
                            />
                            <label htmlFor="avatar-upload" className={`cursor-pointer block relative ${!isEditing ? 'pointer-events-none' : ''}`}>
                                {profile.avatar || localStorage.getItem(`avatar_${profile.email}`) ? (
                                    <img
                                        src={profile.avatar || localStorage.getItem(`avatar_${profile.email}`)}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-[#F4F7FE] shadow-[0px_4px_20px_rgba(0,0,0,0.1)]"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-[#EBE8FF] flex items-center justify-center text-4xl font-bold text-[#7C5CFC] shadow-inner border-4 border-[#F4F7FE]">
                                        {(profile.name || "U").charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center z-10 backdrop-blur-[2px]">
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-[#7C5CFC]/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </label>
                        </div>
                        {isEditing && (profile.avatar || localStorage.getItem(`avatar_${profile.email}`)) && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    localStorage.removeItem(`avatar_${profile.email}`);
                                    setProfile({ ...profile, avatar: null });
                                    window.dispatchEvent(new Event("storage"));
                                }}
                                className="text-xs text-[#FF5C5C] hover:text-[#E04B4B] font-bold mb-6 flex items-center gap-1.5 transition-colors z-10"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove Photo
                            </button>
                        )}
                        <div className="z-10 w-full">
                            {isEditing ? (
                                <input
                                    className="bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-2 text-center text-[#080808] font-bold w-full mb-2 focus:ring-2 focus:ring-[#7C5CFC]/20 outline-none"
                                    value={profile.name}
                                    placeholder="Your Name"
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            ) : (
                                <h2 className="text-xl font-bold text-[#080808] mb-1">{profile.name}</h2>
                            )}
                            <p className="text-[#7C5CFC] font-bold text-sm uppercase tracking-wider">{profile.role || "Candidate"}</p>
                        </div>

                        <div className="mt-6 w-full z-10">
                            {isEditing ? (
                                <input
                                    className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-2.5 text-xs text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20"
                                    placeholder="Portfolio or Github URL"
                                    value={profile.portfolio}
                                    onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                                />
                            ) : (
                                profile.portfolio && (
                                    <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 text-xs font-bold text-[#71717A] hover:text-[#7C5CFC] transition-all mt-4 py-2 bg-[#F4F7FE] rounded-[10px] border border-[#F1F1F1]">
                                        <Globe className="w-4 h-4" />
                                        VIEW PORTFOLIO
                                    </a>
                                )
                            )}
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7C5CFC]/5 rounded-full blur-2xl"></div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[24px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                    >
                        <h3 className="font-bold text-[#080808] mb-5 flex items-center gap-2.5">
                            <div className="p-2 bg-[#EBE8FF] rounded-[10px]">
                                <User className="w-4 h-4 text-[#7C5CFC]" />
                            </div>
                            <span className="uppercase tracking-wider text-xs">Professional Bio</span>
                        </h3>
                        <textarea
                            rows="6"
                            readOnly={!isEditing}
                            className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] p-4 text-sm text-[#080808] font-medium focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all resize-none ${!isEditing ? 'opacity-80' : ''}`}
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                        />
                    </motion.div>
                </div>

                {/* Right Column - Details Form */}
                <div className="md:col-span-2 space-y-8">
                    <motion.div
                        variants={itemVariants}
                        className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[24px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                    >
                        <h3 className="text-xl font-bold text-[#080808] mb-8">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                                    <input
                                        type="email"
                                        readOnly={true}
                                        value={profile.email}
                                        className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] pl-12 pr-4 py-3.5 text-[#080808] font-medium opacity-60 cursor-not-allowed outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                                    <input
                                        type="tel"
                                        readOnly={!isEditing}
                                        value={profile.phone}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (val && !val.startsWith('+')) val = '+' + val;
                                            setProfile({ ...profile, phone: val });
                                        }}
                                        className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] pl-12 pr-4 py-3.5 text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 ${!isEditing ? 'cursor-default' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5 md:col-span-2">
                                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider ml-1">Highest Qualification / Education</label>
                                <input
                                    type="text"
                                    readOnly={!isEditing}
                                    value={profile.education}
                                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                                    placeholder="e.g. B.Tech in Computer Science"
                                    className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 ${!isEditing ? 'cursor-default' : ''}`}
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="mt-10 pt-8 border-t border-[#F1F1F1]">
                            <h3 className="text-lg font-bold text-[#080808] mb-6 flex items-center gap-2.5 font-sans">
                                <div className="p-2 bg-[#EFFFED] rounded-[10px]">
                                    <MapPin className="w-4 h-4 text-[#27C052]" />
                                </div>
                                <span className="uppercase tracking-wider text-xs">Residential Address</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    placeholder="Address Line 1"
                                    readOnly={!isEditing}
                                    value={profile.currentAddress.addressLine1}
                                    onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                                    className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 ${!isEditing ? 'cursor-default' : ''}`}
                                />
                                <input
                                    placeholder="Address Line 2"
                                    readOnly={!isEditing}
                                    value={profile.currentAddress.addressLine2}
                                    onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                                    className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 ${!isEditing ? 'cursor-default' : ''}`}
                                />
                                <input
                                    placeholder="City"
                                    readOnly={!isEditing}
                                    value={profile.currentAddress.city}
                                    onChange={(e) => handleAddressChange('city', e.target.value)}
                                    className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 ${!isEditing ? 'cursor-default' : ''}`}
                                />
                                <input
                                    placeholder="State"
                                    readOnly={!isEditing}
                                    value={profile.currentAddress.state}
                                    onChange={(e) => handleAddressChange('state', e.target.value)}
                                    className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 ${!isEditing ? 'cursor-default' : ''}`}
                                />
                                <input
                                    placeholder="Pincode"
                                    readOnly={!isEditing}
                                    value={profile.currentAddress.pincode}
                                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                                    className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-3.5 text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 ${!isEditing ? 'cursor-default' : ''}`}
                                />
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-[#F1F1F1]">
                            <h3 className="text-xl font-bold text-[#080808] mb-8">Skills & Expertise</h3>
                            <div className="flex flex-wrap gap-3">
                                <AnimatePresence mode="popLayout">
                                    {profile.skills.map((skill, index) => (
                                        <motion.div
                                            key={skill}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="px-4 py-2 bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] text-xs font-bold text-[#71717A] flex items-center gap-2.5 transition-all cursor-default border-transparent hover:border-[#7C5CFC]/20"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]"></div>
                                            {skill}
                                            {isEditing && (
                                                <button
                                                    onClick={() => removeSkill(index)}
                                                    className="text-[#FF5C5C] hover:text-[#E04B4B] transition-colors ml-1 p-0.5 hover:bg-[#FFEDE1] rounded"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {isEditing && (
                                    <div className="flex gap-2">
                                        <input
                                            className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[12px] px-4 py-2 text-sm text-[#080808] font-medium outline-none focus:ring-2 focus:ring-[#7C5CFC]/20"
                                            placeholder="Add new skill..."
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                        />
                                        <button
                                            onClick={addSkill}
                                            className="p-2.5 bg-[#7C5CFC] hover:bg-[#6A4FE0] rounded-[12px] text-white transition-all shadow-md active:scale-95"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resume Section */}
                        <div className="mt-10 pt-10 border-t border-[#F1F1F1]">
                            <h3 className="text-xl font-bold text-[#080808] mb-8">Resume Management</h3>
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    id="resume-upload"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (file.size > 5 * 1024 * 1024) {
                                                alert("File size too large. Max 5MB.");
                                                return;
                                            }
                                            uploadResume(file);
                                        }
                                    }}
                                    disabled={!isEditing || uploadingResume}
                                />
                                <div className="flex-1 p-5 bg-[#F4F7FE] border border-[#F1F1F1] rounded-[20px] flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[12px] bg-[#FFEDE1] flex items-center justify-center text-[#FF5C5C] border border-[#FFEDE1]">
                                            <Save className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[#080808] font-bold text-sm">
                                                {uploadingResume ? "Uploading..." : (profile.resumeName || localStorage.getItem(`resume_name_${profile.email}`) || "No resume uploaded")}
                                            </p>
                                            <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider mt-0.5">PDF, DOCX (Max 5MB)</p>
                                        </div>
                                    </div>
                                    {((profile.resumeName || localStorage.getItem(`resume_name_${profile.email}`)) || (profile.resumeLink || localStorage.getItem(`resume_url_${profile.email}`))) && (
                                        <div className="flex items-center gap-3">
                                            {(profile.resumeLink || localStorage.getItem(`resume_url_${profile.email}`)) && (
                                                <a
                                                    href={profile.resumeLink || localStorage.getItem(`resume_url_${profile.email}`)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2.5 bg-[#FFFFFF] hover:bg-[#EBE8FF] text-[#71717A] hover:text-[#7C5CFC] rounded-[10px] transition-all border border-[#F1F1F1]"
                                                    title="View Resume"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                            )}
                                            {isEditing && (profile.resumeName || localStorage.getItem(`resume_name_${profile.email}`)) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        localStorage.removeItem(`resume_name_${profile.email}`);
                                                        localStorage.removeItem(`resume_url_${profile.email}`);
                                                        setProfile(prev => ({ ...prev, resumeName: null, resumeLink: null }));
                                                    }}
                                                    className="p-2.5 bg-[#FFFFFF] hover:bg-[#FFEDE1] text-[#71717A] hover:text-[#FF5C5C] rounded-[10px] transition-all border border-[#F1F1F1]"
                                                    title="Remove Resume"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isEditing && (
                                                <>
                                                    <Link href="/candidate/resume/builder">
                                                        <button className="px-6 py-2.5 bg-white border border-[#F1F1F1] text-[#7C5CFC] text-xs font-bold rounded-[10px] hover:bg-[#F4F7FE] transition-all shadow-sm uppercase tracking-wider active:scale-95">
                                                            Build New
                                                        </button>
                                                    </Link>
                                                    <label
                                                        htmlFor="resume-upload"
                                                        className="px-6 py-2.5 bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white text-xs font-bold rounded-[10px] cursor-pointer transition-all shadow-md uppercase tracking-wider active:scale-95"
                                                    >
                                                        Upload
                                                    </label>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {!isEditing && !(profile.resumeName || localStorage.getItem(`resume_name_${profile.email}`)) && !(profile.resumeLink || localStorage.getItem(`resume_url_${profile.email}`)) && (
                                        <p className="text-xs text-[#71717A] font-bold italic uppercase tracking-wider">No resume provided</p>
                                    )}
                                    {isEditing && !(profile.resumeName || localStorage.getItem(`resume_name_${profile.email}`)) && (
                                        <div className="flex items-center gap-3">
                                            <Link href="/candidate/resume/builder">
                                                <button className="px-6 py-2.5 bg-white border border-[#F1F1F1] text-[#7C5CFC] text-xs font-bold rounded-[10px] hover:bg-[#F4F7FE] transition-all shadow-sm uppercase tracking-wider active:scale-95">
                                                    Build New
                                                </button>
                                            </Link>
                                            <label
                                                htmlFor="resume-upload"
                                                className="px-6 py-2.5 bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white text-xs font-bold rounded-[10px] cursor-pointer transition-all shadow-md uppercase tracking-wider active:scale-95"
                                            >
                                                Upload
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* DELETE ACCOUNT - Danger Zone */}
                        <div className="mt-12 pt-10 border-t border-[#F1F1F1]">
                            <div className="bg-[#FFEDE1]/50 border border-[#FF5C5C]/20 p-6 rounded-[20px] flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-[#FF5C5C] mb-1">Danger Zone</h3>
                                    <p className="text-[#71717A] text-sm font-medium">Permanently remove your account and all associated data.</p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-6 py-3 bg-[#FF5C5C] text-white rounded-[12px] hover:bg-[#E04B4B] transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 shadow-[0px_4px_20px_rgba(255,92,92,0.3)] active:scale-95"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Account
                                </button>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-10 flex justify-end gap-4">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 text-[#71717A] font-bold hover:text-[#080808] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-10 py-3.5 bg-[#7C5CFC] hover:bg-[#6A4FE0] text-white rounded-[16px] font-bold transition-all shadow-[0px_8px_30px_rgba(124,92,252,0.3)] uppercase tracking-wider text-sm active:scale-95"
                                >
                                    Save All Changes
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[24px] p-10 max-w-md w-full shadow-[0px_8px_50px_rgba(0,0,0,0.2)] relative"
                        >
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="absolute top-8 right-8 text-[#71717A] hover:text-[#080808] transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="w-20 h-20 rounded-full bg-[#FFEDE1] flex items-center justify-center mb-6 text-[#FF5C5C] border border-[#FFEDE1]">
                                    <Trash2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#080808] mb-3">Delete Account?</h2>
                                <p className="text-[#71717A] text-sm font-medium leading-relaxed">
                                    This action is permanent and cannot be undone. All your applications, documents, and profile data will be erased forever.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2 block ml-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[16px] px-5 py-4 text-[#080808] font-medium focus:ring-2 focus:ring-[#FF5C5C]/20 outline-none"
                                        placeholder="Enter password to confirm"
                                    />
                                    {deleteError && (
                                        <p className="text-[#FF5C5C] text-xs font-bold mt-2.5 ml-1">{deleteError}</p>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-4 py-4 rounded-[16px] border border-[#F1F1F1] text-[#71717A] hover:bg-[#F4F7FE] font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={!deletePassword}
                                        className="flex-1 px-4 py-4 rounded-[16px] bg-[#FF5C5C] hover:bg-[#E04B4B] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_4px_20px_rgba(255,92,92,0.3)]"
                                    >
                                        Delete Forever
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Change Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute inset-0 bg-[#F4F7FE]/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#FFFFFF] border border-[#F1F1F1] rounded-[32px] p-8 relative z-10 shadow-[0px_20px_40px_rgba(0,0,0,0.1)]"
                        >
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F4F7FE] text-[#71717A] hover:text-[#080808] transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-[#7C5CFC]/10 flex items-center justify-center mb-6 shadow-[0px_4px_20px_rgba(124,92,252,0.15)] border border-[#7C5CFC]/20">
                                    <Key className="w-8 h-8 text-[#7C5CFC]" />
                                </div>
                                <h2 className="text-2xl font-black text-[#080808] mb-2">Change Password</h2>
                                <p className="text-[#71717A] mb-8 font-medium">Verify your email to refresh your account security.</p>
                                <form onSubmit={handleUpdatePassword} className="w-full space-y-4">
                                    {/* OTP Field */}
                                    <div className="text-left space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">OTP (Sent to Email)</label>
                                            <button
                                                type="button"
                                                onClick={handleRequestOTP}
                                                disabled={isSendingOTP}
                                                className="text-[10px] font-bold text-[#7C5CFC] hover:text-[#5B3FD7] mb-1 transition-colors disabled:opacity-50"
                                            >
                                                {isSendingOTP ? "Sending..." : otpSent ? "Resend OTP" : "Request OTP"}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                value={passwordForm.otp}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, otp: e.target.value }))}
                                                className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent outline-none transition-all pr-12 font-medium"
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A]">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* New Password */}
                                    <div className="text-left space-y-2">
                                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                required
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent outline-none transition-all pr-12 font-medium"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#7C5CFC] transition-colors"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    {/* Confirm Password */}
                                    <div className="text-left space-y-2">
                                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                required
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent outline-none transition-all pr-12 font-medium"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#7C5CFC] transition-colors"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {passwordError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-2 p-3 rounded-[12px] bg-[#FF5C5C]/10 border border-[#FF5C5C]/20 text-[#FF5C5C] text-xs font-bold w-full"
                                            >
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                {passwordError}
                                            </motion.div>
                                        )}
                                        {passwordSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-2 p-3 rounded-[12px] bg-[#27C052]/10 border border-[#27C052]/20 text-[#27C052] text-xs font-bold w-full"
                                            >
                                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                                Password updated successfully!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword || passwordSuccess}
                                        className="w-full py-4 bg-[#7C5CFC] hover:bg-[#5B3FD7] text-white rounded-[12px] font-bold transition-all shadow-lg shadow-[#7C5CFC]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                                    >
                                        {isUpdatingPassword ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Updating...
                                            </>
                                        ) : passwordSuccess ? (
                                            "Done"
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
