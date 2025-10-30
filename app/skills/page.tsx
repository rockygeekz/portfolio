"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  SiReact,
  SiSpringboot,
  SiPython,
  SiCplusplus,
  SiTailwindcss,
  SiPostgresql,
  SiMongodb,
  SiGit,
  SiDocker,
  SiKubernetes,
  SiTerraform,
  SiJenkins,
  SiFirebase,
  SiNextdotjs,
  SiApachekafka,
  SiNodedotjs,
  SiPrisma,
  SiJavascript,
  SiRedis,
  SiSupabase,
  SiGithubactions,
  SiLinux,

} from "react-icons/si";
import { LiaNetworkWiredSolid } from "react-icons/lia";

import { RiJavaLine } from "react-icons/ri";
import { TbBinaryTree } from "react-icons/tb";

import { FiCode, FiDatabase, FiCloud, FiCpu, FiWifi, FiLayers } from "react-icons/fi";
import { FaAws } from "react-icons/fa6";
import { TbBrain, TbDatabaseCog, TbVectorBezier, TbRobot, TbMessageChatbot } from "react-icons/tb";
import { SiHuggingface, SiFastapi, SiOpenai } from "react-icons/si";


const skills = {
  "Languages": [
    { name: "Java", icon: <RiJavaLine className="text-[#007396]" /> },
    { name: "C++", icon: <SiCplusplus className="text-[#00599C]" /> },
    { name: "Python", icon: <SiPython className="text-[#3776AB]" /> },
    { name: "JavaScript", icon: <SiJavascript className="text-[#F7DF1E]" /> },
  ],

  "Frontend Development": [
    { name: "React.js", icon: <SiReact className="text-[#61DAFB]" /> },
    { name: "Next.js", icon: <SiNextdotjs className="text-white" /> },
    { name: "Tailwind CSS", icon: <SiTailwindcss className="text-[#06B6D4]" /> },
    { name: "Prisma", icon: <SiPrisma className="text-[#2D3748]" /> },
  ],

  "Backend Development": [
    { name: "Spring Boot", icon: <SiSpringboot className="text-[#6DB33F]" /> },
    { name: "Node.js", icon: <SiNodedotjs className="text-[#339933]" /> },
    { name: "Apache Kafka", icon: <SiApachekafka className="text-[#231F20]" /> },
    { name: "Microservices", icon: <LiaNetworkWiredSolid className="text-[#9CA3AF]" /> },
    { name: "RESTful APIs", icon: <FiCloud className="text-[#60A5FA]" /> },
  ],

   "Core CS Fundamentals": [
    { name: "Data Structures & Algorithms", icon: <TbBinaryTree className="text-[#60A5FA]" /> },
    { name: "Operating Systems", icon: <FiCpu className="text-[#F59E0B]" /> },
    { name: "Computer Networks", icon: <FiWifi className="text-[#10B981]" /> },
    { name: "DBMS", icon: <FiDatabase className="text-[#8B5CF6]" /> },
    { name: "OOP", icon: <FiLayers className="text-[#EC4899]" /> },
  ],
  "Cloud & DevOps": [
    { name: "Docker", icon: <SiDocker className="text-[#2496ED]" /> },
    { name: "Kubernetes", icon: <SiKubernetes className="text-[#326CE5]" /> },
    { name: "AWS", icon: <FaAws className="text-[#FF9900]" /> },
    { name: "Terraform", icon: <SiTerraform className="text-[#7B42BC]" /> },
    { name: "Jenkins", icon: <SiJenkins className="text-[#D24939]" /> },
    { name: "Firebase", icon: <SiFirebase className="text-[#FFCA28]" /> },
    { name: "GitHub Actions", icon: <SiGithubactions className="text-[#2088FF]" /> },
    { name: "Git", icon: <SiGit className="text-[#F05032]" /> },
    { name: "Linux", icon: <SiLinux className="text-[#FCC624]" /> },
  ],

  "AI & Automation": [
  { name: "LangChain", icon: <TbBrain className="text-[#00A3A3]" /> },
  { name: "LangGraph", icon: <TbBrain className="text-[#FF6B6B]" /> },
  { name: "RAG Pipelines", icon: <TbDatabaseCog className="text-[#38BDF8]" /> },
  { name: "Vector Databases", icon: <TbVectorBezier className="text-[#9333EA]" /> },
  { name: "Hugging Face", icon: <SiHuggingface className="text-[#FFB000]" /> },
  { name: "Ollama", icon: <TbRobot className="text-[#60A5FA]" /> },
  { name: "FastAPI", icon: <SiFastapi className="text-[#009688]" /> },
  { name: "OpenAI API", icon: <SiOpenai className="text-[#10A37F]" /> },
  { name: "Prompt Engineering", icon: <TbMessageChatbot className="text-[#F97316]" /> },
],
  "Databases": [
    { name: "PostgreSQL", icon: <SiPostgresql className="text-[#336791]" /> },
    { name: "MongoDB", icon: <SiMongodb className="text-[#47A248]" /> },
    { name: "Supabase", icon: <SiSupabase className="text-[#3ECF8E]" /> },
    { name: "Redis", icon: <SiRedis className="text-[#DC382D]" /> },
  ],


};


const categoryIcons = {
  "Languages": <FiCode className="w-6 h-6" />,
  "Backend Development": <FiDatabase className="w-6 h-6" />,
  "Frontend Development": <FiCode className="w-6 h-6" />,
  "Databases": <FiDatabase className="w-6 h-6" />,
  "Cloud & DevOps": <FiCloud className="w-6 h-6" />,
};

export default function Skills() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div id="skills-page" className="min-h-screen w-full text-white">
      <div id="skills-container" className="container mx-auto px-4 py-16">
        <motion.div
          id="skills-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 id="skills-title" className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-500">
              Skills & Technologies
            </span>
          </h1>
          <p
            id="skills-subtitle"
            className="text-neutral-400 text-base max-w-2xl mx-auto"
          >
            My technical toolkit for building scalable applications
          </p>
        </motion.div>

        <div
          id="skills-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {Object.keys(skills).map((category, index) => (
            <motion.div
              key={category}
              id={`skill-category-${category
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-neutral-700/30 backdrop-blur-lg rounded-2xl border border-neutral-800 overflow-hidden"
            >
              <div
                id={`category-header-${category
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className=" p-6 border-b border-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    id={`category-icon-${category
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30"
                  >
                    {categoryIcons[category as keyof typeof categoryIcons]}
                  </div>
                  <h2
                    id={`category-title-${category
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="text-xl font-bold text-white"
                  >
                    {category}
                  </h2>
                </div>
              </div>

              <div
                id={`skills-list-${category
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="p-6"
              >
                <div className="flex flex-wrap gap-3">
                  {skills[category as keyof typeof skills].map(
                    (skill, skillIndex) => (
                      <motion.div
                        key={skill.name}
                        id={`skill-item-${skill.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.2 + skillIndex * 0.05,
                        }}
                        whileHover={{ y: -5 }}
                        className="flex items-center gap-2 px-4 py-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50"
                      >
                        <div
                          id={`skill-icon-${skill.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="text-xl"
                        >
                          {skill.icon}
                        </div>
                        <span
                          id={`skill-name-${skill.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="text-sm font-medium"
                        >
                          {skill.name}
                        </span>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          id="skills-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div
            id="skills-footer-container"
            className="inline-block relative max-w-2xl"
          >
            <div
              id="skills-footer-glow"
              className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl opacity-20 blur-sm"
            />
            <div
              id="skills-footer-content"
              className="relative px-6 py-4 bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-neutral-700/50"
            >
              <p className="text-sm md:text-base text-neutral-300 font-light">
                Continuously learning and adapting to new technologies to build better, faster, and more reliable systems.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}