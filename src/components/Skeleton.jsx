"use client";

import { motion } from "framer-motion";

export const Skeleton = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-gray-200 rounded-md ${className}`}
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 p-6 bg-[#F4F7FE] min-h-[calc(100vh-80px)]">
      {/* Welcome Section Skeleton */}
      <div className="px-2 space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white border border-[#F1F1F1] rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="w-12 h-12 rounded-[12px]" />
              <Skeleton className="w-20 h-4" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton (Full width) */}
      <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] mx-2 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-8 w-32 rounded-[12px]" />
        </div>
        <Skeleton className="h-64 w-full rounded-[12px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        {/* Main Section Skeleton */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#F1F1F1] rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4">
                <Skeleton className="w-12 h-12 rounded-[12px]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-white border border-[#F1F1F1] rounded-[24px] p-6 shadow-sm space-y-6">
            <Skeleton className="h-7 w-32" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const JobsSkeleton = () => {
    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            <div className="px-2 space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="px-2">
                <div className="p-2 bg-white border border-[#F1F1F1] rounded-[24px] shadow-sm flex flex-col md:flex-row gap-2">
                    <Skeleton className="h-14 flex-1 rounded-[16px]" />
                    <Skeleton className="h-14 flex-1 rounded-[16px]" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-6 bg-white border border-[#F1F1F1] rounded-[24px] space-y-5">
                        <div className="flex justify-between">
                            <Skeleton className="w-14 h-14 rounded-[16px]" />
                            <Skeleton className="w-20 h-6 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-3/4" />
                            <Skeleton className="h-5 w-1/2" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <div className="pt-5 border-t border-[#F1F1F1] flex justify-between items-center">
                            <div className="flex gap-4">
                                <Skeleton className="h-8 w-24 rounded-[10px]" />
                                <Skeleton className="h-8 w-24 rounded-[10px]" />
                            </div>
                            <Skeleton className="w-9 h-9 rounded-[12px]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ApplicationsSkeleton = () => {
    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            <div className="px-2 space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="flex flex-col md:flex-row gap-4 px-2">
                <Skeleton className="h-14 flex-1 rounded-[16px]" />
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-10 w-24 rounded-[12px]" />
                    ))}
                </div>
            </div>

            <div className="space-y-4 px-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-[#F1F1F1] rounded-[20px] p-6 space-y-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex gap-4 min-w-[300px]">
                                <Skeleton className="w-16 h-16 rounded-[16px]" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-5 w-1/2" />
                                    <div className="flex gap-3">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center items-center">
                                <Skeleton className="h-5 w-48" />
                            </div>
                            <div className="flex flex-row lg:flex-col justify-between items-end gap-4 min-w-[140px]">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <div className="flex gap-2">
                                    <Skeleton className="w-9 h-9 rounded-[12px]" />
                                    <Skeleton className="w-9 h-9 rounded-[12px]" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MessagesSkeleton = () => {
    return (
        <div className="flex flex-col h-full gap-6 px-2 lg:px-0">
            <div className="space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex-1 bg-white border border-[#F1F1F1] rounded-[24px] overflow-hidden flex shadow-sm">
                {/* Sidebar Skeleton */}
                <div className="w-80 border-r border-[#F1F1F1] hidden md:flex flex-col">
                    <div className="p-4 border-b border-[#F1F1F1]">
                        <Skeleton className="h-10 w-full rounded-[12px]" />
                    </div>
                    <div className="flex-1 p-4 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-3 items-center">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Chat Area Skeleton */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-[#F1F1F1] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </div>
                    <div className="flex-1 p-6 space-y-6 overflow-hidden">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                <Skeleton className={`h-12 w-64 rounded-[16px] ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-[#F1F1F1]">
                        <Skeleton className="h-12 w-full rounded-[12px]" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProfileSkeleton = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12 px-2">
            <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-[#F1F1F1] shadow-sm">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-5 w-80" />
                </div>
                <Skeleton className="h-12 w-40 rounded-[12px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white border border-[#F1F1F1] rounded-[24px] p-8 flex flex-col items-center">
                        <Skeleton className="w-32 h-32 rounded-full mb-6" />
                        <Skeleton className="h-7 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full mt-6 rounded-[10px]" />
                    </div>
                    <div className="bg-white border border-[#F1F1F1] rounded-[24px] p-8 space-y-5">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-32 w-full rounded-[16px]" />
                    </div>
                </div>
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white border border-[#F1F1F1] rounded-[24px] p-8 space-y-8">
                        <Skeleton className="h-7 w-48 mb-8" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-12 w-full rounded-[16px]" />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 pt-8 border-t border-[#F1F1F1]">
                            <Skeleton className="h-6 w-40" />
                            <div className="flex flex-wrap gap-3">
                                {[1, 2, 3, 5, 6].map(i => (
                                    <Skeleton key={i} className="h-8 w-20 rounded-[12px]" />
                                ))}
                            </div>
                        </div>

                        {/* Resume & Certificates Skeleton */}
                        <div className="space-y-6 pt-8 border-t border-[#F1F1F1]">
                            <Skeleton className="h-7 w-48 mb-4" />
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full rounded-[20px]" />
                                <Skeleton className="h-20 w-full rounded-[20px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NotificationsSkeleton = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12 px-2">
            <div className="space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="bg-white border border-[#F1F1F1] rounded-[24px] overflow-hidden shadow-sm">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-6 border-b border-[#F1F1F1] last:border-0 flex gap-4">
                        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
