"use client";

import { Calendar, Clock, Video, MoreHorizontal, User } from "lucide-react";

export default function InterviewsPage() {
    const interviews = [
        { time: "10:00 AM", candidate: "Sarah Williams", role: "Product Designer", type: "Technical Round", status: "Upcoming" },
        { time: "11:30 AM", candidate: "Michael Chen", role: "Frontend Dev", type: "Culture Fit", status: "Upcoming" },
        { time: "2:00 PM", candidate: "David Wilson", role: "Backend Lead", type: "Final Round", status: "Upcoming" },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-[#080808]">
                Interviews Schedule
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-[#080808] mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#7C5CFC]" />
                        Today, Feb 24
                    </h2>
                    {interviews.map((interview, i) => (
                        <div key={i} className="bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-[16px] p-6 flex items-center gap-6 hover:border-[#EBE8FF] transition-colors group">
                            <div className="w-16 h-16 rounded-[12px] bg-[#F4F7FE] flex flex-col items-center justify-center text-center border border-[#F1F1F1] group-hover:border-[#7C5CFC]/50 transition-colors">
                                <span className="text-xs text-[#71717A] font-bold uppercase">{interview.time.split(' ')[1]}</span>
                                <span className="text-xl font-bold text-[#080808]">{interview.time.split(' ')[0]}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-[#080808]">{interview.candidate}</h3>
                                    <span className="px-3 py-1 bg-[#EBE8FF] text-[#7C5CFC] rounded-[8px] text-xs font-bold border border-[#7C5CFC]/20">
                                        {interview.type}
                                    </span>
                                </div>
                                <p className="text-[#71717A] text-sm mt-1 font-medium">{interview.role}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-[#71717A] font-medium">
                                    <span className="flex items-center gap-1">
                                        <Video className="w-3 h-3 text-[#7C5CFC]" />
                                        Google Meet
                                    </span>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-[#F4F7FE] rounded-[12px] text-[#71717A] hover:text-[#080808] transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                
                <div className="bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-[16px] p-6 h-fit">
                    <h3 className="font-bold text-[#080808] mb-4 text-lg">Quick Schedule</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#71717A] uppercase">Date</label>
                            <input type="date" className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] px-3 py-2 text-[#080808] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#71717A] uppercase">Candidate</label>
                             <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                                <input type="text" placeholder="Search..." className="w-full bg-[#F4F7FE] border border-[#F1F1F1] rounded-[12px] pl-9 pr-3 py-2 text-[#080808] text-sm placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50" />
                            </div>
                        </div>
                        <button className="w-full py-2.5 bg-[#7C5CFC] text-white rounded-[12px] font-bold text-sm hover:bg-[#6A4FE0] transition-colors shadow-[0px_4px_20px_rgba(124,92,252,0.3)]">
                            Schedule Interview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
