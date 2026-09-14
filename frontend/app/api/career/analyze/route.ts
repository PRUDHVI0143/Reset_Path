import { NextRequest, NextResponse } from "next/server";
import {
  fetchGitHubData,
  getCompanyIntelligence,
  generateCareerAnalysisResult,
  saveAnalysis
} from "@/lib/career-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { github_username, company_name, job_role, job_description } = body;

    if (!github_username || !company_name) {
      return NextResponse.json(
        { detail: "github_username and company_name are required" },
        { status: 400 }
      );
    }

    // 1. Fetch real GitHub Profile and Repos
    const githubData = await fetchGitHubData(github_username);

    // 2. Extract Company Intelligence & Requirements
    const companyData = getCompanyIntelligence(company_name, job_role || "Full Stack Engineer");

    // 3. Generate Analysis & Match Evaluation
    const result = generateCareerAnalysisResult(githubData, companyData, job_description);

    const recordId = `career_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const record = {
      id: recordId,
      github_username: githubData.username,
      company_name: company_name.trim(),
      job_role: job_role || "Full Stack Engineer",
      job_description: job_description || "",
      match_score: result.match_score,
      result: result,
      created_at: new Date().toISOString()
    };

    saveAnalysis(recordId, record);

    return NextResponse.json(record);
  } catch (error: any) {
    console.error("Error in /api/career/analyze:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to analyze career profile" },
      { status: 500 }
    );
  }
}
