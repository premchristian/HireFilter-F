"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Building2, Globe, Mail, MapPin, Camera, Loader2, AlertCircle, CheckCircle2, Lock, Eye, EyeOff, X, Key } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function CompanyProfilePage() {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [uploadingImage, setUploadingImage] = useState(null); // 'logo' | 'banner' | null

    // Form State
    const [formData, setFormData] = useState({
        companyName: "",
        website: "",
        description: "",
        location: "",
        phone: "",
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
    const [otpMethod, setOtpMethod] = useState("email"); // email or phone

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                // Helper to safely extract URL from either a string or an object {url: '...'}
                const getUrl = (img) => {
                    if (!img) return null;
                    if (typeof img === "string") return img;
                    return img.url || img.imageUrl || img.secure_url || null;
                };

                const [profileRes, uploadsRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/getProfile`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/my-uploads`, { headers: { Authorization: `Bearer ${token}` } }).catch(e => {
                        console.error("Failed to fetch my-uploads", e);
                        return { data: { success: false } };
                    })
                ]);

                if (profileRes.data.success) {
                    let data = profileRes.data.data;
                    
                    // Root profile fields usually contain the image objects
                    const profileLogo = getUrl(data.profile?.image) || getUrl(data.image);
                    const profileBanner = getUrl(data.profile?.coverImage) || getUrl(data.coverImage);
                    
                    if (profileLogo) data.profileImage = profileLogo;
                    if (!data.company) data.company = {};
                    if (profileBanner) data.company.banner = profileBanner;
                    if (profileLogo) data.company.logo = profileLogo;

                    // Merge uploads data if available
                    if (uploadsRes.data && uploadsRes.data.success) {
                        const uploadsData = uploadsRes.data.data || uploadsRes.data;
                        console.log("My Uploads Raw:", uploadsData);
                        
                        const uploadLogo = getUrl(uploadsData.profileImage || uploadsData.avatar || uploadsData.image);
                        const uploadBanner = getUrl(uploadsData.coverImage || uploadsData.banner);

                        if (uploadLogo) {
                            data.profileImage = uploadLogo;
                            if (data.company) data.company.logo = uploadLogo;
                        }
                        if (uploadBanner) {
                            if (data.company) data.company.banner = uploadBanner;
                        }
                    }

                    setUserData(data);
                    setFormData({
                        companyName: data.company?.name || "",
                        website: data.company?.website || data.profile?.website || "",
                        description:  data.company?.description || data.profile?.description || "",
                        location: data.company?.location || data.profile?.location || "",
                        phone: data.phone || "",
                    });
                } else {
                    setError(profileRes.data.message || "Failed to fetch profile");
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
                setError(err.response?.data?.message || err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Upload image to API
    const handleImageUpload = async (file, type) => {
        if (!file || !isEditing) return;
        setUploadingImage(type);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const formDataUpload = new FormData();
            
            let apiUrl = "";
            if (type === "banner") {
                formDataUpload.append("coverImage", file);
                apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/upload-cover-image";
            } else {
                formDataUpload.append("profileImage", file);
                apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/upload-profile-image";
            }

            const res = await axios.post(
                apiUrl,
                formDataUpload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Upload response:", res.data);

            if (res.data.success || res.data.data || res.data.url || res.data.imageUrl) {
                const resData = res.data.data;
                const getUrl = (img) => {
                    if (!img) return null;
                    if (typeof img === "string") return img;
                    return img.url || img.imageUrl || img.secure_url || null;
                };

                const imageUrl = getUrl(resData) || getUrl(res.data);
                
                console.log("Image URL extracted from upload:", imageUrl);

                if (imageUrl) {
                    if (type === "banner") {
                        setUserData(prev => ({ ...prev, company: { ...prev?.company, banner: imageUrl } }));
                    } else {
                        setUserData(prev => ({ ...prev, company: { ...prev?.company, logo: imageUrl }, profileImage: imageUrl }));
                        
                        // Dispatch event so layout.jsx can instantly update the user's avatar in the sidebar
                        const event = new CustomEvent("profileImageUpdated", { detail: imageUrl });
                        window.dispatchEvent(event);
                    }
                    setSuccess(`${type === "banner" ? "Cover" : "Profile"} image uploaded successfully!`);
                    setTimeout(() => setSuccess(""), 3000);
                } else {
                    console.warn("Could not extract image URL from response:", res.data);
                    setError("Image uploaded but URL not found in response. Check console.");
                }
            } else {
                setError(res.data.message || "Failed to upload image");
            }
        } catch (err) {
            console.error("Image upload error:", err);
            setError(err.response?.data?.message || err.message || "Failed to upload image");
        } finally {
            setUploadingImage(null);
        }
    };

    const handleRequestOTP = async (method = "email") => {
        const email = userData?.email || localStorage.getItem("userEmail");
        const identifier = method === "phone" ? userData?.phone : email;

        if (!identifier) {
            setPasswordError(method === "phone" ? "Phone number not found in profile." : "User email not found. Please log in again.");
            return;
        }

        setIsSendingOTP(true);
        setPasswordError("");
        setOtpSent(false);
        setOtpMethod(method);

        try {
            console.log(`Requesting OTP for HR ${method}:`, identifier.trim());
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password`, {
                [method === "phone" ? "identifier" : "email"]: identifier.trim()
            });
            console.log("OTP Request Response:", res.data);
            setOtpSent(true);
        } catch (err) {
            console.error("OTP Request Failed:", err.response?.data);
            setPasswordError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOTP(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        const email = userData?.email || localStorage.getItem("userEmail");

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
            const identifier = otpMethod === "phone" ? userData?.phone : email;
            console.log(`Attempting HR password reset for ${otpMethod}:`, identifier.trim());
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`,
                {
                    [otpMethod === "phone" ? "identifier" : "email"]: identifier.trim(),
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

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("token");
            const payload = {
                company: {
                    name: formData.companyName,
                    website: formData.website,
                    description: formData.description,
                    location: formData.location,
                },
                phone: formData.phone
            };

            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/updateProfile`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.success) {
                setSuccess("Profile updated successfully!");
                // Update local userData so cancel reverts to the new values
                 setUserData({
                    ...userData,
                    company: { 
                        ...userData.company, 
                        name: formData.companyName,
                        website: formData.website,
                        description: formData.description,
                        location: formData.location
                    },
                    phone: formData.phone
                });
                setIsEditing(false); 
            } else {
                setError(res.data.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("Update error:", err);
            setError(err.response?.data?.message || err.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        // Revert to original data
        setFormData({
            companyName: userData.company?.name || "",
            website: userData.company?.website || userData.profile?.website || "",
            description: userData.company?.description || userData.profile?.description || "",
            location: userData.company?.location || userData.profile?.location || "",
            phone: userData.phone || "",
        });
        setIsEditing(false);
        setError("");
        setSuccess("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (error && !userData) { // Only show full-page error if no data loaded
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-2">
                <AlertCircle className="w-8 h-8" />
                <p>{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-surface-light rounded-lg text-accent font-bold hover:bg-surface-light/80 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-[#080808] flex justify-between items-center">
                <span>Company Profile</span>
                <div className="flex gap-3">
                    {!isEditing && (
                        <>
                            <button 
                                onClick={() => setShowPasswordModal(true)}
                                className="text-sm bg-white hover:bg-[#F4F7FE] text-[#7C5CFC] font-bold px-4 py-2 rounded-[8px] transition-colors border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-2"
                            >
                                <Lock className="w-4 h-4" />
                                Change Password
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="text-sm bg-[#FFFFFF] hover:bg-[#F4F7FE] text-[#7C5CFC] font-bold px-4 py-2 rounded-[8px] transition-colors border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-2"
                            >
                                <Camera className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </>
                    )}
                </div>
            </h1>

            <div className="bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-[16px] p-8 space-y-8">
                {/* Banner & Logo */}
                <div className="relative h-48 rounded-[12px] bg-[#F4F7FE] overflow-visible mb-16 border border-[#F1F1F1]">
                    {/* Render Banner if exists */}
                    {userData?.company?.banner && (
                        <img 
                            src={userData.company.banner}
                            alt="Banner"
                            className="absolute inset-0 w-full h-full object-cover rounded-xl"
                        />
                    )}

                    {/* Banner uploading overlay */}
                    {uploadingImage === "banner" && (
                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center z-10">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}

                    <input 
                        type="file" 
                        id="banner-upload" 
                        className="hidden" 
                        accept="image/*"
                        disabled={!isEditing || uploadingImage}
                        onChange={(e) => {
                             const file = e.target.files[0];
                             if (file) handleImageUpload(file, "banner");
                             e.target.value = "";
                        }}
                    />
                    {isEditing && (
                        <label 
                            htmlFor="banner-upload"
                            className="absolute bottom-4 right-4 bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] text-[#080808] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] px-4 py-2 rounded-[8px] text-sm font-bold backdrop-blur-md transition-colors flex items-center gap-2 cursor-pointer border border-[#F1F1F1] z-20"
                        >
                            <Camera className="w-4 h-4" />
                            {uploadingImage === "banner" ? "Uploading..." : "Edit Cover"}
                        </label>
                    )}

                    <div className="absolute -bottom-12 left-8">
                        <div className="relative group w-32 h-32">
                             <input 
                                type="file" 
                                id="logo-upload" 
                                className="hidden" 
                                accept="image/*"
                                disabled={!isEditing || uploadingImage}
                                onChange={(e) => {
                                     const file = e.target.files[0];
                                     if (file) handleImageUpload(file, "logo");
                                     e.target.value = "";
                                }}
                            />
                            <label htmlFor={isEditing ? "logo-upload" : undefined} className={`w-full h-full block rounded-[16px] bg-[#F4F7FE] border-4 border-[#FFFFFF] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                                {userData?.company?.logo || userData?.profileImage ? (
                                    <img 
                                        src={userData?.company?.logo || userData?.profileImage}
                                        alt="Logo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#7C5CFC] text-white flex items-center justify-center text-4xl font-bold uppercase">
                                        {formData.companyName?.charAt(0) || userData?.name?.charAt(0) || "C"}
                                    </div>
                                )}
                                {/* Upload loading overlay */}
                                {uploadingImage === "logo" && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    </div>
                                )}
                                {isEditing && !uploadingImage && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <form className="space-y-6 pt-4" onSubmit={handleUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#080808]">Company Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                                <input 
                                    type="text" 
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                    disabled={!isEditing}
                                    placeholder="Enter company name"
                                    className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] pl-10 pr-4 py-3 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#080808]">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                                <input 
                                    type="text" 
                                    value={formData.website}
                                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                                    disabled={!isEditing}
                                    placeholder="https://"
                                    className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] pl-10 pr-4 py-3 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#080808]">Description</label>
                        <textarea 
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            disabled={!isEditing}
                            placeholder="Tell us about your company..."
                            className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-4 py-3 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all resize-none ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#080808]">Contact Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                                <input 
                                    type="email" 
                                    defaultValue={userData?.email || ""} 
                                    readOnly
                                    className="w-full bg-[#FFFFFF] border border-[#F1F1F1] rounded-[12px] pl-10 pr-4 py-3 text-[#71717A] cursor-not-allowed focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#080808]">Headquarters</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                                <input 
                                    type="text" 
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    disabled={!isEditing}
                                    placeholder="City, Country"
                                    className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] pl-10 pr-4 py-3 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#080808]">Phone Number</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A] flex items-center justify-center font-bold">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                </span>
                                <input 
                                    type="text" 
                                    value={formData.phone}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (val && !val.startsWith('+')) val = '+' + val;
                                        setFormData({...formData, phone: val});
                                    }}
                                    disabled={!isEditing}
                                    placeholder="+91..."
                                    className={`w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] pl-10 pr-4 py-3 text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>
                    </div>

                     {/* Status Messages for Update */}
                     {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            {success}
                        </div>
                    )}

                    {isEditing && (
                        <div className="flex justify-end pt-4 gap-4">
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                disabled={updating}
                                className="px-6 py-2.5 rounded-[12px] bg-[#FFFFFF] hover:bg-[#F4F7FE] text-[#080808] font-bold transition-colors border border-[#F1F1F1]"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={updating}
                                className="px-6 py-2.5 rounded-[12px] bg-[#7C5CFC] hover:bg-[#6A4FE0] disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors font-bold shadow-[0px_4px_20px_rgba(124,92,252,0.3)] flex items-center gap-2 border border-[#7C5CFC]"
                            >
                                {updating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
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
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Request OTP via:</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRequestOTP("email")}
                                                    disabled={isSendingOTP}
                                                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${otpMethod === "email" && otpSent ? 'bg-[#7C5CFC] text-white' : 'bg-[#F4F7FE] text-[#71717A] hover:border-[#7C5CFC]/20'}`}
                                                >
                                                    {isSendingOTP && otpMethod === "email" ? "Sending..." : "OTP on Email"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRequestOTP("phone")}
                                                    disabled={isSendingOTP || !userData?.phone}
                                                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${otpMethod === "phone" && otpSent ? 'bg-[#7C5CFC] text-white' : 'bg-[#F4F7FE] text-[#71717A] hover:border-[#7C5CFC]/20'} ${!userData?.phone ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={!userData?.phone ? "Phone number not available" : ""}
                                                >
                                                    {isSendingOTP && otpMethod === "phone" ? "Sending..." : "OTP on Number"}
                                                </button>
                                            </div>
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
        </div>
    );
}
