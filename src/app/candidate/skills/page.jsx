"use client";

import { motion } from "framer-motion";
import { Award, Zap, BookOpen, Target, ArrowRight, TrendingUp, BarChart3, Plus } from "lucide-react";

export default function SkillsPage() {
    const skills = [
        { name: "React", level: "Expert", progress: 95, category: "Frontend" },
        { name: "Node.js", level: "Advanced", progress: 85, category: "Backend" },
        { name: "UI Design", level: "Advanced", progress: 88, category: "Design" },
        { name: "TypeScript", level: "Intermediate", progress: 70, category: "Frontend" },
        { name: "Python", level: "Intermediate", progress: 65, category: "Backend" },
        { name: "AWS", level: "Beginner", progress: 45, category: "DevOps" },
    ];

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
            className="space-y-8 max-w-6xl mx-auto pb-12"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-[#080808]">
                    Skill <span className="text-[#7C5CFC]">Mapping</span>
                </h1>
                <p className="text-[#71717A] mt-1 font-medium">Visualize your expertise and identify growth opportunities</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Skill Graph Card */}
                <motion.div 
                    variants={itemVariants}
                    className="md:col-span-2 bg-white border border-[#F1F1F1] rounded-[24px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-[#080808]">Expertise Radar</h3>
                        <div className="flex items-center gap-2 text-[#7C5CFC] bg-[#EBE8FF] px-3 py-1 rounded-full text-xs font-bold">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +12% vs last month
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-12 bg-[#F4F7FE]/50 rounded-[20px] border border-[#F1F1F1] border-dashed min-h-[300px]">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                            <BarChart3 className="w-8 h-8 text-[#7C5CFC]" />
                        </div>
                        <p className="text-[#71717A] font-medium text-center max-w-xs">
                            Skill Radar Visualization is being generated based on your verified assessments.
                        </p>
                    </div>
                </motion.div>

                {/* Skill Stats */}
                <div className="md:col-span-1 space-y-6">
                     <motion.div 
                        variants={itemVariants}
                        className="bg-[#7C5CFC] rounded-[24px] p-8 text-white shadow-[0px_4px_20px_rgba(124,92,252,0.2)] relative overflow-hidden group"
                     >
                         <div className="relative z-10">
                            <h3 className="font-bold mb-4 flex items-center gap-2 opacity-90">
                                <Target className="w-5 h-5" />
                                Top Skill
                            </h3>
                            <div className="text-3xl font-bold mb-1">React.js</div>
                            <p className="text-sm font-medium opacity-80">Top 1% of candidates on platform</p>
                         </div>
                         <Award className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
                     </motion.div>

                     <motion.div 
                        variants={itemVariants}
                        className="bg-white border border-[#F1F1F1] rounded-[24px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]"
                     >
                         <h3 className="font-bold text-[#080808] mb-6 flex items-center gap-2">
                             <BookOpen className="w-5 h-5 text-[#7C5CFC]" />
                             Recommended Learning
                         </h3>
                         <div className="space-y-4">
                             {[
                                 { title: "Advanced AWS Pattern", desc: "To improve your DevOps score" },
                                 { title: "GraphQL Mastery", desc: "Highly demanded in your field" }
                             ].map((item, i) => (
                                 <div key={i} className="p-4 bg-[#F4F7FE]/50 rounded-[16px] border border-[#F1F1F1] hover:border-[#7C5CFC]/20 transition-all cursor-pointer group">
                                     <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-[#080808] group-hover:text-[#7C5CFC] transition-colors">{item.title}</span>
                                        <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#7C5CFC] group-hover:translate-x-1 transition-all" />
                                     </div>
                                     <p className="text-xs text-[#71717A] font-medium">{item.desc}</p>
                                 </div>
                             ))}
                         </div>
                     </motion.div>
                </div>
            </div>

            {/* All Skills Grid */}
            <motion.div variants={itemVariants}>
                 <h3 className="text-2xl font-bold text-[#080808] mb-8">Verified Skills</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {skills.map((skill, index) => (
                         <div 
                            key={index}
                            className="p-6 bg-white border border-[#F1F1F1] rounded-[24px] hover:border-[#7C5CFC]/30 hover:shadow-sm transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.02)] group"
                         >
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="font-bold text-[#080808] text-lg">{skill.name}</h4>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F4F7FE] text-[#71717A] mt-2 inline-block">
                                        {skill.category}
                                    </span>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    skill.level === "Expert" ? "bg-green-50 text-green-600" :
                                    skill.level === "Advanced" ? "bg-blue-50 text-blue-600" :
                                    "bg-purple-50 text-purple-600"
                                }`}>
                                    {skill.level}
                                </span>
                             </div>
                             <div className="space-y-2">
                                 <div className="flex justify-between text-xs font-bold text-[#71717A]">
                                     <span>Proficiency</span>
                                     <span>{skill.progress}%</span>
                                 </div>
                                 <div className="h-2.5 w-full bg-[#F4F7FE] rounded-full overflow-hidden border border-[#F1F1F1]">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.progress}%` }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                        className={`h-full rounded-full ${
                                            skill.level === "Expert" ? "bg-green-500" :
                                            skill.level === "Advanced" ? "bg-blue-500" :
                                            "bg-[#7C5CFC]"
                                        }`} 
                                     />
                                 </div>
                             </div>
                         </div>
                     ))}
                     
                     <button className="p-6 border-2 border-dashed border-[#F1F1F1] rounded-[24px] flex flex-col items-center justify-center text-[#71717A] hover:text-[#7C5CFC] hover:bg-[#F4F7FE]/50 hover:border-[#7C5CFC]/30 transition-all gap-3 min-h-[160px] group">
                         <div className="w-12 h-12 rounded-full bg-[#F4F7FE] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                            <Plus className="w-6 h-6" />
                         </div>
                         <span className="font-bold">Assess New Skill</span>
                     </button>
                 </div>
            </motion.div>
        </motion.div>
    );
}
