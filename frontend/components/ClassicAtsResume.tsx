"use client";

import React from "react";

interface ClassicResumeProps {
  name: string;
  githubUsername: string;
  targetCompany: string;
  jobRole: string;
  primaryLanguages: string[];
  skills: {
    languages: string;
    frameworks: string;
    tools: string;
    backend: string;
    softSkills: string;
  };
  projects: Array<{
    title: string;
    githubUrl?: string;
    date: string;
    bullets: string[];
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    location: string;
    date: string;
  }>;
  certificates?: Array<{
    title: string;
    date: string;
  }>;
  coCurricular?: Array<{
    text: string;
    date: string;
  }>;
  email?: string;
  mobile?: string;
  linkedin?: string;
}

export default function ClassicAtsResume({
  name,
  githubUsername,
  targetCompany,
  jobRole,
  primaryLanguages,
  skills,
  projects,
  education,
  certificates,
  coCurricular,
  email = "candidate@example.com",
  mobile = "+91 9876543210",
  linkedin = "linkedin.com/in/profile"
}: ClassicResumeProps) {
  const cleanName = (name || githubUsername || "CANDIDATE NAME").toUpperCase();
  const ghUrl = `https://github.com/${githubUsername}`;

  const defaultEducation = education || [
    {
      institution: "Bachelor of Technology — Computer Science and Engineering",
      degree: "Major in Software Engineering & Distributed Systems | CGPA: 8.4",
      location: "India",
      date: "2021 – 2025"
    }
  ];

  const defaultCerts = certificates || [
    { title: `Advanced ${primaryLanguages[0] || "Python"} & System Design Architecture | Coursera`, date: "2024" },
    { title: `Autonomous Multi-Agent AI & Distributed Systems Certification`, date: "2024" },
    { title: `Full Stack & Database Optimization Masterclass | FreeCodeCamp`, date: "2023" }
  ];

  const defaultCoCurricular = coCurricular || [
    { text: `Active open-source contributor with verified repositories on GitHub matching ${targetCompany}'s stack`, date: "2024" },
    { text: "Lead Organizer for Technical Hackathons and Open-Source Developer Workshops", date: "2023" }
  ];

  return (
    <div
      className="bg-white text-black p-8 md:p-12 shadow-2xl rounded-xl max-w-[850px] mx-auto font-sans leading-normal border border-slate-200 print:shadow-none print:border-none print:p-0"
      style={{ fontFamily: "'Arial', 'Calibri', sans-serif" }}
    >
      {/* 1. Header with Name & 2-Column Contact Info */}
      <div className="border-b-2 border-transparent pb-3 mb-4">
        <h1 className="text-2xl md:text-[22pt] font-black text-[#1D4ED8] tracking-tight mb-2 uppercase">
          {cleanName}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 text-xs md:text-[10pt] text-slate-800 gap-y-1">
          {/* Left Column */}
          <div className="space-y-0.5">
            <div>
              <span className="font-semibold text-slate-700">LinkedIn : </span>
              <a
                href={`https://${linkedin.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#1D4ED8] hover:underline"
              >
                {linkedin.replace(/^https?:\/\//, "")}
              </a>
            </div>
            <div>
              <span className="font-semibold text-slate-700">GitHub : </span>
              <a
                href={ghUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#1D4ED8] hover:underline"
              >
                {ghUrl}
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-0.5 md:text-right">
            <div>
              <span className="font-semibold text-slate-700">Email : </span>
              <span className="text-[#1D4ED8]">{email}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Mobile : </span>
              <span className="text-slate-900">{mobile}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SKILLS SUMMARY */}
      <div className="mb-5">
        <div className="border-b border-slate-400 pb-0.5 mb-2">
          <h2 className="text-sm md:text-[11pt] font-black text-[#1D4ED8] tracking-wider uppercase">
            SKILLS SUMMARY
          </h2>
        </div>
        <ul className="text-xs md:text-[9.5pt] space-y-1 list-disc list-inside text-slate-900">
          <li>
            <span className="font-bold text-[#1D4ED8]">Languages: </span>
            <span>{skills.languages || primaryLanguages.join(", ")}</span>
          </li>
          <li>
            <span className="font-bold text-[#1D4ED8]">Frameworks: </span>
            <span>{skills.frameworks || "React.js, Next.js, Node.js, FastAPI, Tailwind CSS"}</span>
          </li>
          <li>
            <span className="font-bold text-[#1D4ED8]">Tools\Platforms: </span>
            <span>{skills.tools || "Git, GitHub Actions, Docker, Linux, SQLite, PostgreSQL, Redis"}</span>
          </li>
          <li>
            <span className="font-bold text-[#1D4ED8]">Backend: </span>
            <span>{skills.backend || "REST APIs, Distributed Systems, Asynchronous Queues, WebSockets"}</span>
          </li>
          <li>
            <span className="font-bold text-[#1D4ED8]">Soft Skills: </span>
            <span>{skills.softSkills || "Technical Leadership, Problem Solving, Clean Architecture, Cross-functional Collaboration"}</span>
          </li>
        </ul>
      </div>

      {/* 3. PROJECTS */}
      <div className="mb-5">
        <div className="border-b border-slate-400 pb-0.5 mb-2.5">
          <h2 className="text-sm md:text-[11pt] font-black text-[#1D4ED8] tracking-wider uppercase">
            PROJECTS
          </h2>
        </div>

        <div className="space-y-4">
          {projects.map((proj, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex flex-wrap items-baseline justify-between text-xs md:text-[10pt]">
                <div className="font-bold text-[#1D4ED8]">
                  <span>{proj.title}</span>
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1 text-[#1D4ED8] font-normal hover:underline"
                    >
                      | GitHub
                    </a>
                  )}
                </div>
                <div className="text-[9pt] font-medium text-slate-700">
                  {proj.date || "Recent"}
                </div>
              </div>

              <ul className="text-xs md:text-[9.5pt] space-y-1 list-disc list-inside text-slate-800 leading-relaxed">
                {proj.bullets.map((b, bIdx) => (
                  <li key={bIdx} className="pl-1">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CERTIFICATES */}
      <div className="mb-5">
        <div className="border-b border-slate-400 pb-0.5 mb-2">
          <h2 className="text-sm md:text-[11pt] font-black text-[#1D4ED8] tracking-wider uppercase">
            CERTIFICATES
          </h2>
        </div>
        <ul className="text-xs md:text-[9.5pt] space-y-1 text-slate-800">
          {defaultCerts.map((cert, cIdx) => (
            <li key={cIdx} className="flex justify-between items-baseline list-disc list-inside">
              <span>• {cert.title}</span>
              <span className="text-[9pt] font-medium text-slate-700 shrink-0 ml-4">{cert.date}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. CO-CURRICULAR ACTIVITIES */}
      <div className="mb-5">
        <div className="border-b border-slate-400 pb-0.5 mb-2">
          <h2 className="text-sm md:text-[11pt] font-black text-[#1D4ED8] tracking-wider uppercase">
            CO-CURRICULAR ACTIVITIES
          </h2>
        </div>
        <ul className="text-xs md:text-[9.5pt] space-y-1 text-slate-800">
          {defaultCoCurricular.map((act, aIdx) => (
            <li key={aIdx} className="flex justify-between items-baseline list-disc list-inside">
              <span>• {act.text}</span>
              <span className="text-[9pt] font-medium text-slate-700 shrink-0 ml-4">{act.date}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 6. EDUCATION */}
      <div>
        <div className="border-b border-slate-400 pb-0.5 mb-2">
          <h2 className="text-sm md:text-[11pt] font-black text-[#1D4ED8] tracking-wider uppercase">
            EDUCATION
          </h2>
        </div>
        <div className="space-y-2 text-xs md:text-[9.5pt] text-slate-800">
          {defaultEducation.map((edu, eIdx) => (
            <div key={eIdx} className="flex justify-between items-start">
              <div>
                <div className="font-bold text-[#1D4ED8]">• {edu.institution}</div>
                <div className="text-slate-700 pl-3">{edu.degree}</div>
              </div>
              <div className="text-[9pt] text-slate-700 text-right shrink-0 ml-4">
                <div>{edu.location}</div>
                <div>{edu.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
