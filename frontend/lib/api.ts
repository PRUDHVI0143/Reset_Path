// Robust API client with automatic Vercel serverless route fallback and localStorage resilience

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// If on client side in browser and on Vercel (or no external API is specified), use relative /api
function getBaseUrl(): string {
  if (RAW_API_URL && !RAW_API_URL.includes("localhost:8000")) {
    return RAW_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    // If window.location is NOT localhost, definitely use same-origin relative /api
    if (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) {
      return "";
    }
  }
  return RAW_API_URL || "";
}

export async function createResearch(question: string) {
  const base = getBaseUrl() || "http://localhost:8000";
  const res = await fetch(`${base}/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create research: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchResearchStatus(id: string) {
  const base = getBaseUrl() || "http://localhost:8000";
  const res = await fetch(`${base}/research/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch status: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchResearchHistory() {
  const base = getBaseUrl() || "http://localhost:8000";
  const res = await fetch(`${base}/research`);
  if (!res.ok) {
    throw new Error(`Failed to fetch history: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchReport(id: string) {
  const base = getBaseUrl() || "http://localhost:8000";
  const res = await fetch(`${base}/report/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch report: ${res.statusText}`);
  }
  return res.json();
}

export async function exportReport(research_id: string, format: 'pdf' | 'docx' | 'markdown') {
  const base = getBaseUrl() || "http://localhost:8000";
  const res = await fetch(`${base}/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ research_id, format }),
  });
  if (!res.ok) {
    throw new Error(`Failed to export: ${res.statusText}`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `researchmind_report_${research_id.substring(0, 8)}.${format === 'markdown' ? 'md' : format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Career Intelligence Endpoints (supports native Next.js serverless route /api/career and FastAPI)
export async function analyzeCareerProfile(data: {
  github_username: string;
  company_name: string;
  job_role: string;
  job_description?: string;
}) {
  // Strategy: Try relative Next.js API first (which runs on Vercel and local dev),
  // with fallback to external backend if configured.
  const urlsToTry = [
    "/api/career/analyze",
    ...(RAW_API_URL ? [`${RAW_API_URL.replace(/\/+$/, "")}/career/analyze`] : [])
  ];

  let lastError: any = null;

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        // Cache locally for bulletproof instant loads
        if (typeof window !== "undefined" && json?.id) {
          try {
            localStorage.setItem(`career_analysis_${json.id}`, JSON.stringify(json));
          } catch (e) {
            console.warn("localStorage cache error:", e);
          }
        }
        return json;
      } else {
        const errJson = await res.json().catch(() => null);
        lastError = new Error(errJson?.detail || `Server returned ${res.status}`);
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to analyze career profile");
}

export async function fetchCareerHistory() {
  const urlsToTry = [
    "/api/career/history",
    ...(RAW_API_URL ? [`${RAW_API_URL.replace(/\/+$/, "")}/career/history`] : [])
  ];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Continue to next URL
    }
  }
  return [];
}

export async function fetchCareerAnalysisById(id: string) {
  // 1. Check localStorage first for instant rendering
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(`career_analysis_${id}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // Ignore cache read error
    }
  }

  // 2. Fetch from API
  const urlsToTry = [
    `/api/career/${id}`,
    ...(RAW_API_URL ? [`${RAW_API_URL.replace(/\/+$/, "")}/career/${id}`] : [])
  ];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`career_analysis_${id}`, JSON.stringify(json));
          } catch (e) {}
        }
        return json;
      }
    } catch (err) {
      // Continue to next URL
    }
  }

  throw new Error("Failed to fetch career analysis");
}

export async function exportCareerGuide(id: string, companyName: string) {
  const urlsToTry = [
    `/api/career/${id}/export`,
    ...(RAW_API_URL ? [`${RAW_API_URL.replace(/\/+$/, "")}/career/${id}/export`] : [])
  ];

  let res: Response | null = null;
  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, { method: "POST" });
      if (response.ok) {
        res = response;
        break;
      }
    } catch (err) {
      // Continue
    }
  }

  if (!res || !res.ok) {
    // If API export fails, generate client-side from cached record
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(`career_analysis_${id}`);
      if (cached) {
        const record = JSON.parse(cached);
        const md = `# Interview & CV Guide: ${companyName} — ${record.job_role}\n\n**Candidate**: https://github.com/${record.github_username}\n**Match Score**: ${record.match_score}%\n\n${record.result?.fit_verdict || ""}\n\n${record.result?.rebuilt_resume_markdown || ""}`;
        const blob = new Blob([md], { type: "text/markdown" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Interview_CV_Guide_${companyName.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
    }
    throw new Error("Failed to export guide");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Interview_CV_Guide_${companyName.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
