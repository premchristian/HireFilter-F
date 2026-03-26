"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const JobContext = createContext();

export function JobProvider({ children }) {
    const [jobs, setJobs] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState([]);
    const [loading, setLoading] = useState(true);
    // kept mock exams for now as user only mentioned jobs API

    const fetchJobs = async () => {
        setLoading(true);
        //  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.NEXT_PUBLIC_API_BASE_URL.includes("localhost")) 
        //     ? process.env.NEXT_PUBLIC_API_BASE_URL 
        //     : "https://hire-filter-backend.onrender.com";
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        console.log(`[JobContext] Fetching jobs from: ${baseUrl}/api/jobs`);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("[JobContext] No token found in localStorage");
            }

            // 1. Fetch EVERYTHING (All jobs and User's saved jobs)
            const [response, savedResponse] = await Promise.all([
                axios.get(`${baseUrl}/api/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${baseUrl}/api/jobs/saved`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } }))
            ]);

            const jobsData = response.data.data;
            const jobsArray = Array.isArray(jobsData) ? jobsData : (jobsData?.jobs || []);

            // 2. Build a Set of saved Job IDs for instant lookup
            const savedRaw = savedResponse?.data?.data?.savedJobs || savedResponse?.data?.savedJobs || (Array.isArray(savedResponse?.data?.data) ? savedResponse.data.data : []);
            const savedIds = new Set();
            if (Array.isArray(savedRaw)) {
                savedRaw.forEach(item => {
                    const id = item._id || item.id || (item.job?._id || item.job?.id);
                    if (id) savedIds.add(id.toString());
                });
            }

            if (Array.isArray(jobsArray)) {
                const mappedJobs = jobsArray.map(job => ({
                    id: job._id,
                    title: job.jobTitle,
                    department: job.department || "Engineering",
                    type: job.jobType,
                    location: job.location,
                    applicants: job.applicants ? job.applicants.length : 0,
                    status: job.status || "Active",
                    posted: new Date(job.createdAt).toLocaleDateString(),
                    createdAt: job.createdAt,
                    salary: job.salary ? `₹${job.salary.min} - ₹${job.salary.max}` : "Not specified",
                    description: job.jobDescription,
                    experience: job.experience ? `${job.experience.min}-${job.experience.max} years` : "Not specified",
                    skills: job.requiredSkills || [],
                    createdBy: job.createdBy || job.user || null,
                    savedCount: job.savedCount || (job.savedBy ? job.savedBy.length : 0),
                    isSaved: savedIds.has(job._id?.toString()) || job.isSaved || false
                }));
                setJobs(mappedJobs);
                setLoading(false);
            } else {
                console.error("[JobContext] Unexpected response format. Could not find jobs array:", {
                    type: typeof jobsData,
                    keys: jobsData ? Object.keys(jobsData) : "null",
                    fullData: response.data
                });
            }
        } catch (error) {
            console.error("[JobContext] Error fetching jobs:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const getJobById = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            // 1. Fetch Job and Saved list (for sync)
            const [response, savedResponse] = await Promise.all([
                axios.get(`${baseUrl}/api/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${baseUrl}/api/jobs/saved`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } }))
            ]);

            if (response.data) {
                const jobData = response.data.data || response.data.job || response.data;
                const savedRaw = savedResponse?.data?.data?.savedJobs || savedResponse?.data?.savedJobs || (Array.isArray(savedResponse?.data?.data) ? savedResponse.data.data : []);
                const isActuallySaved = Array.isArray(savedRaw) && savedRaw.some(item => {
                    const sId = item._id || item.id || (item.job?._id || item.job?.id);
                    return sId?.toString() === id.toString();
                });
                
                // Final check to ensure we have an object that looks like a job
                if (jobData && (jobData._id || jobData.id || jobData.jobTitle)) {
                    const job = jobData;
                    return {
                        id: job._id || job.id,
                        title: job.jobTitle || job.title,
                        department: job.department || "Engineering",
                        type: job.jobType || job.type,
                        location: job.location,
                        applicants: job.applicants || [],
                        status: job.status || "Active",
                        posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "New",
                        createdAt: job.createdAt,
                        salary: job.salary ? (typeof job.salary === 'object' ? `₹${job.salary.min} - ₹${job.salary.max}` : job.salary.toString().replace(/\$/g, '₹')) : "Not specified",
                        description: job.jobDescription || job.description,
                        experience: job.experience ? (typeof job.experience === 'object' ? `${job.experience.min}-${job.experience.max} years` : job.experience) : "Not specified",
                        skills: job.requiredSkills || job.skills || [],
                        education: job.education || "Not specified",
                        lastDate: job.lastDate ? new Date(job.lastDate).toLocaleDateString() : "Open",
                        isSaved: isActuallySaved || job.isSaved || false,
                        savedCount: job.savedCount || (job.savedBy ? job.savedBy.length : 0)
                    };
                }
            }
            console.log("[JobContext] Raw job response from backend:", response.data);
            return null;
        } catch (error) {
            console.error("Error fetching job details:", error);
            return null;
        }
    };





    const addJob = (job) => {
        const newJob = {
            ...job,
            id: jobs.length + 1,
            applicants: 0,
            status: "Active",
            posted: "Just now",
            createdAt: new Date().toISOString(),
        };
        setJobs([newJob, ...jobs]);
    };



    const toggleSaveJob = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const response = await axios.post(`${baseUrl}/api/jobs/toggle-save/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Update local savedIds
            await fetchSavedJobIds();
            return response.data;
        } catch (error) {
            console.error("Error toggling save job:", error);
            if (error.response?.data) {
                console.error("Backend response:", error.response.data);
                alert(`Backend Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert(`Error: ${error.message} - Please check if the backend route exists.`);
            }
            throw error;
        }
    };

    const fetchSavedJobIds = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return [];
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hire-filter-backend.onrender.com";
            const response = await axios.get(`${baseUrl}/api/jobs/saved`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            let raw = response.data;
            let finalArray = [];
            if (Array.isArray(raw)) finalArray = raw;
            else if (Array.isArray(raw?.data)) finalArray = raw.data;
            else if (Array.isArray(raw?.savedJobs)) finalArray = raw.savedJobs;
            else if (raw?.data && Array.isArray(raw.data.savedJobs)) finalArray = raw.data.savedJobs;
            else if (raw?.data && Array.isArray(raw.data.jobs)) finalArray = raw.data.jobs;
            else if (raw?.jobs) finalArray = raw.jobs;
            
            const ids = finalArray.map(item => {
                if (typeof item === 'string') return item;
                const job = item.jobTitle ? item : (item.job || item);
                if (typeof job === 'string') return job;
                return job._id || job.id;
            }).filter(id => id);
            
            console.log("[JobContext] Fetched Saved Job IDs (count):", ids.length);
            console.log("[JobContext] Sample ID from saved list:", ids[0]);
            setSavedJobIds(ids);
            return ids;
        } catch (error) {
            console.error("Error fetching saved job IDs:", error);
            return [];
        }
    };

    useEffect(() => {
        fetchSavedJobIds();

        // Listen for authentication changes to refresh saved jobs
        const handleAuthChange = () => {
            console.log("[JobContext] Auth change detected, refreshing saved jobs...");
            fetchSavedJobIds();
        };

        window.addEventListener("auth-change", handleAuthChange);
        window.addEventListener("storage", (e) => {
            if (e.key === "token") handleAuthChange();
        });

        return () => {
            window.removeEventListener("auth-change", handleAuthChange);
            window.removeEventListener("storage", handleAuthChange);
        };
    }, []);

    return (
        <JobContext.Provider value={{ jobs, savedJobIds, loading, addJob, getJobById, fetchJobs, toggleSaveJob, fetchSavedJobIds }}>
            {children}
        </JobContext.Provider>
    );
}

export function useJobContext() {
    return useContext(JobContext);
}
