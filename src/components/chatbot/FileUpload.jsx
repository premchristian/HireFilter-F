"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, Check, AlertCircle, Paperclip } from "lucide-react";

export default function FileUpload({ onFileSelect, onClose }) {
    const [dragActive, setDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            setUploadStatus("error");
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setUploadStatus("error");
            return;
        }

        setSelectedFile(file);
        setUploadStatus("uploading");

        // Simulate upload process
        setTimeout(() => {
            setUploadStatus("success");
            if (onFileSelect) {
                onFileSelect(file);
            }

            // Auto close after success
            setTimeout(() => {
                onClose();
            }, 2000);
        }, 2000);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (file) => {
        if (file.type === 'application/pdf') return '📄';
        if (file.type.includes('word')) return '📝';
        if (file.type === 'text/plain') return '📃';
        return '📄';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a1d23] border border-white/20 rounded-2xl p-6 w-full max-w-md"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#6366F1]/20 rounded-xl flex items-center justify-center">
                            <Upload className="w-5 h-5 text-[#6366F1]" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">Upload Resume</h3>
                            <p className="text-gray-400 text-sm">PDF, DOC, DOCX, TXT (Max 5MB)</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Upload Area */}
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                            ? "border-[#6366F1] bg-[#6366F1]/10"
                            : uploadStatus === "error"
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-white/20 hover:border-white/30"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleChange}
                    />

                    <AnimatePresence mode="wait">
                        {uploadStatus === "idle" && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Paperclip className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-white font-medium mb-2">
                                    Drag & drop your resume here
                                </p>
                                <p className="text-gray-400 text-sm mb-4">
                                    or click to browse files
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-3 bg-[#6366F1] hover:bg-[#5855eb] rounded-xl font-medium text-white transition-colors"
                                >
                                    Choose File
                                </motion.button>
                            </motion.div>
                        )}

                        {uploadStatus === "uploading" && (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="w-16 h-16 bg-[#6366F1]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Upload className="w-8 h-8 text-[#6366F1]" />
                                    </motion.div>
                                </div>
                                <p className="text-white font-medium mb-2">Uploading...</p>
                                <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                                    <motion.div
                                        className="bg-[#6366F1] h-2 rounded-full"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2 }}
                                    />
                                </div>
                                {selectedFile && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                                        <span>{getFileIcon(selectedFile)}</span>
                                        <span>{selectedFile.name}</span>
                                        <span>({formatFileSize(selectedFile.size)})</span>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {uploadStatus === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-emerald-400" />
                                </div>
                                <p className="text-white font-medium mb-2">Upload Successful!</p>
                                <p className="text-gray-400 text-sm mb-4">
                                    Your resume has been processed and saved
                                </p>
                                {selectedFile && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                                        <span>{getFileIcon(selectedFile)}</span>
                                        <span>{selectedFile.name}</span>
                                        <span>({formatFileSize(selectedFile.size)})</span>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {uploadStatus === "error" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-400" />
                                </div>
                                <p className="text-white font-medium mb-2">Upload Failed</p>
                                <p className="text-gray-400 text-sm mb-4">
                                    Please check file type and size (PDF, DOC, DOCX, TXT under 5MB)
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setUploadStatus("idle");
                                        setSelectedFile(null);
                                    }}
                                    className="px-6 py-3 bg-[#6366F1] hover:bg-[#5855eb] rounded-xl font-medium text-white transition-colors"
                                >
                                    Try Again
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {uploadStatus === "idle" && (
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Your resume will be securely stored and only shared when you apply to jobs
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}