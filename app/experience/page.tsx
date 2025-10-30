import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { FiMapPin, FiAward, FiBriefcase, FiBook } from "react-icons/fi";

export default function ExperiencePage() {
  const data = [
    {
      title: "Dec 2022 - Present",
      content: (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-shrink-0 pt-1">
            <FiBook className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div className="space-y-2 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">
              Bachelor of Engineering
            </h3>
            <div className="flex items-center gap-2 text-neutral-400 text-xs sm:text-sm">
              <FiMapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Bangalore Institute of Technology, Bengaluru, IN</span>
            </div>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              Pursuing BE in Information Science and Engineering with CGPA: 8.6. 
              Focused on building strong foundations in software development, 
              data structures, algorithms, and full-stack development through 
              comprehensive coursework and hands-on projects.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Aug 2024 - Nov 2024",
      content: (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-shrink-0 pt-1">
            <FiBriefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div className="space-y-2 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">
              Full-Stack Developer Intern
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-neutral-400 text-xs sm:text-sm">
              <span className="font-medium">ByteDocker</span>
              <span className="hidden sm:inline">•</span>
              <span>Bengaluru, India</span>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
              <p className="leading-relaxed">
                Led full-stack development projects, building scalable backend systems 
                and modern web applications with a focus on performance optimization.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1 flex-shrink-0">▹</span>
                  <span className="leading-relaxed">
                    Delivered Tapio Banking&apos;s backend as Project Lead, developing 15+ REST APIs 
                    using Spring Boot and reducing API latency by 20% through query optimization
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1 flex-shrink-0">▹</span>
                  <span className="leading-relaxed">
                    Launched MakeMyAdventures using Next.js, achieving 500+ weekly active users 
                    and a 95+ SEO score in its first month
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1 flex-shrink-0">▹</span>
                  <span className="leading-relaxed">
                    Containerized services with Docker and contributed to deployment workflows, 
                    improving deployment speed by 25%
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "May 2024 - Jul 2024",
      content: (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-shrink-0 pt-1">
            <FiBriefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div className="space-y-2 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">
              Full-Stack Developer Intern
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-neutral-400 text-xs sm:text-sm">
              <span className="font-medium">Wrenberg Pvt Ltd</span>
              <span className="hidden sm:inline">•</span>
              <span>Bengaluru, India</span>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
              <p className="leading-relaxed">
                Developed high-performance backend systems and automated deployment 
                pipelines for an AR-based e-commerce platform.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1 flex-shrink-0">▹</span>
                  <span className="leading-relaxed">
                    Engineered backend APIs for AR-based apparel e-commerce platform (MERN), 
                    improving response times by 30%
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1 flex-shrink-0">▹</span>
                  <span className="leading-relaxed">
                    Automated CI/CD pipelines with GitHub Actions, reducing deployment time 
                    from 30 minutes to 5 minutes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1 flex-shrink-0">▹</span>
                  <span className="leading-relaxed">
                    Optimized MongoDB queries and caching with Redis, increasing API 
                    throughput by 18%
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Awards and Honors",
      content: (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-shrink-0 pt-1">
            <FiAward className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div className="space-y-4 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">
              Achievements & Certifications
            </h3>

            {/* Web Development Hackathon */}
            <div className="space-y-2">
              <div className="flex items-start sm:items-center gap-3">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2 sm:mt-0" />
                <h4 className="text-white font-medium text-sm sm:text-base leading-tight">
                  Web Development Hackathon Winner
                </h4>
              </div>
              <div className="pl-3 sm:pl-5">
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                  <span className="text-blue-400 font-medium">Winner</span> at 
                  IT Secure Systems hackathon. Created a student-focused learning 
                  platform used by 200+ peers, demonstrating strong full-stack 
                  development skills and user-centric design.
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full whitespace-nowrap">
                    Winner
                  </span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full whitespace-nowrap">
                    200+ Users
                  </span>
                </div>
              </div>
            </div>

            {/* LeetCode Achievement */}
            <div className="space-y-2">
              <div className="flex items-start sm:items-center gap-3">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2 sm:mt-0" />
                <h4 className="text-white font-medium text-sm sm:text-base leading-tight">
                  Competitive Programming Excellence
                </h4>
              </div>
              <div className="pl-3 sm:pl-5">
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                  Solved{" "}
                  <span className="text-blue-400 font-medium">
                    800+ algorithmic problems on LeetCode
                  </span>
                  , demonstrating expertise in data structures, algorithms, and 
                  problem-solving skills.
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full whitespace-nowrap">
                    800+ Problems
                  </span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full whitespace-nowrap">
                    DSA Expert
                  </span>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              <div className="flex items-start sm:items-center gap-3">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2 sm:mt-0" />
                <h4 className="text-white font-medium text-sm sm:text-base leading-tight">
                  Professional Certifications
                </h4>
              </div>
              <div className="pl-3 sm:pl-5 space-y-2">
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                  • Certified in{" "}
                  <span className="text-blue-400">
                    Java Spring Framework 6 and Spring Boot 3
                  </span>
                </p>
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                  • Oracle Certified{" "}
                  <span className="text-blue-400">
                    Cloud Infrastructure (OCI) DevOps Professional
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full whitespace-nowrap">
                    Spring Boot
                  </span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full whitespace-nowrap">
                    OCI Certified
                  </span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full whitespace-nowrap">
                    DevOps
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Timeline data={data} />
    </div>
  );
}