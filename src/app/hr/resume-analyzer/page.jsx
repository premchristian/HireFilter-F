"use client";

import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ResumeAnalyzerPage() {
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState([]);
    const [scannedCount, setScannedCount] = useState(0);

    const simulateAnalysis = () => {
        setAnalyzing(true);
        setProgress(0);
        setResults([]);
        setScannedCount(0);

        const totalResumes = 1000;
        let current = 0;

        const interval = setInterval(() => {
            current += 15; // Scan speed
            if (current > totalResumes) current = totalResumes;
            
            setScannedCount(current);
            setProgress((current / totalResumes) * 100);

            if (current >= totalResumes) {
                clearInterval(interval);
                setTimeout(() => {
                    setAnalyzing(false);
                    generateMockResults();
                }, 800);
            }
        }, 50);
    };

    const generateMockResults = () => {
        const mockCandidates = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            name: `Candidate ${i + 1}`,
            score: Math.floor(Math.random() * (98 - 60) + 60),
            match: ["React", "Node.js", "TypeScript"],
            experience: `${Math.floor(Math.random() * 8 + 2)} years`,
            status: "New"
        })).sort((a, b) => b.score - a.score); // Sort by highest score
        setResults(mockCandidates);
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-text-primary">
                    Bulk Resume Analyzer
                </h1>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                    AI-powered scanning engine. Upload thousands of resumes to instantly find your top candidates.
                </p>
            </div>

            {/* Control Panel */}
            <div className="bg-surface border border-border-subtle shadow-sm rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <label className="text-sm font-bold text-text-primary">Select Job to Match Against</label>
                             <select className="w-full bg-surface-light border border-border-subtle rounded-xl px-4 py-3 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all appearance-none">
                                <option>Senior Product Designer</option>
                                <option>Frontend Developer</option>
                                <option>Backend Engineer</option>
                                <option>Marketing Manager</option>
                             </select>
                        </div>
                        
                         <div className="border-2 border-dashed border-border-subtle rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface-light hover:border-accent/40 transition-colors cursor-pointer group bg-surface-light">
                            <Upload className="w-8 h-8 text-text-secondary group-hover:text-accent transition-colors mb-3" />
                            <p className="text-sm font-bold text-text-primary">Upload Resume Batch (ZIP/PDFs)</p>
                            <p className="text-xs text-text-secondary mt-1 font-medium">Up to 1000 files supported</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-6 h-full border-l border-border-subtle pl-8">
                         {!analyzing && results.length === 0 ? (
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto border border-border-subtle">
                                    <FileText className="w-10 h-10 text-text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-lg">Ready to Scan</h3>
                                    <p className="text-text-secondary text-sm font-medium">Upload resumes to start ranking</p>
                                </div>
                                <button 
                                    onClick={simulateAnalysis}
                                    className="px-8 py-3 bg-accent hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-lg shadow-accent/20 active:scale-95 flex items-center gap-2 mx-auto"
                                >
                                    <Loader2 className="w-5 h-5 animate-spin hidden" />
                                    Start Analysis
                                </button>
                            </div>
                         ) : analyzing ? (
                             <div className="w-full text-center space-y-6">
                                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-surface-light" />
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-accent" strokeDasharray={440} strokeDashoffset={440 - (440 * progress) / 100} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-text-primary">{Math.round(progress)}%</span>
                                        <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Scanning</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-text-primary animate-pulse">Analyzing Candidates...</h3>
                                    <p className="text-emerald-500 font-mono mt-2 font-medium">{scannedCount} of 1000 Resumes Processed</p>
                                </div>
                             </div>
                         ) : (
                             <div className="text-center space-y-2">
                                 <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-text-primary">Analysis Complete</h3>
                                <p className="text-text-secondary font-medium">Found {results.length} Top Matches</p>
                                <button 
                                    onClick={simulateAnalysis}
                                    className="text-sm text-accent hover:text-text-primary transition-colors font-bold underline decoration-dotted"
                                >
                                    Start New Scan
                                </button>
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {/* Results Table */}
            {results.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-border-subtle shadow-sm rounded-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-border-subtle flex justify-between items-center">
                        <h2 className="text-xl font-bold text-text-primary">Top Ranked Candidates</h2>
                        <button className="px-4 py-2 bg-surface-light border border-border-subtle hover:bg-surface-light/80 text-accent rounded-lg text-sm font-bold transition-colors">
                            Export Report
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-light text-text-secondary text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Rank</th>
                                    <th className="px-6 py-4">Candidate</th>
                                    <th className="px-6 py-4">Match Score</th>
                                    <th className="px-6 py-4">Key Skills</th>
                                    <th className="px-6 py-4">Experience</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {results.map((candidate, index) => (
                                    <tr key={candidate.id} className="hover:bg-surface-light transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                index === 0 ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                                                index === 1 ? "bg-surface-light text-text-secondary border border-border-subtle" :
                                                index === 2 ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                                                "bg-surface text-text-secondary border border-border-subtle"
                                            }`}>
                                                #{index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-text-primary">{candidate.name}</div>
                                            <div className="text-xs text-text-secondary">ID: RES-{1000 + candidate.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-full bg-surface-light rounded-full h-2 max-w-[100px] border border-border-subtle overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${
                                                            candidate.score > 90 ? "bg-emerald-500" : 
                                                            candidate.score > 80 ? "bg-accent" : "bg-amber-500"
                                                        }`} 
                                                        style={{ width: `${candidate.score}%` }} 
                                                    />
                                                 </div>
                                                 <span className="font-bold text-text-primary">{candidate.score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {candidate.match.map((skill, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-surface-light text-text-primary font-bold border border-border-subtle">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary font-medium text-sm">{candidate.experience}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-accent hover:text-text-primary text-sm font-bold transition-colors">
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function CloudUploadIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    );
}


