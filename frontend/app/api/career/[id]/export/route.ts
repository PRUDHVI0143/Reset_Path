import { NextRequest, NextResponse } from "next/server";
import { getAnalysis } from "@/lib/career-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const analysis = getAnalysis(id);

  if (!analysis) {
    return NextResponse.json(
      { detail: "Career analysis not found" },
      { status: 404 }
    );
  }

  const result = analysis.result || {};
  const md: string[] = [];

  md.push(`# Career & CV Interview Intelligence Guide: ${analysis.company_name} — ${analysis.job_role}`);
  md.push(`**Candidate GitHub**: [${analysis.github_username}](https://github.com/${analysis.github_username})`);
  md.push(`**Compatibility Score**: ${analysis.match_score}% (${result.verdict_badge || ""})`);
  md.push(`\n## Fit Verdict\n${result.fit_verdict || ""}\n`);

  md.push("## Skill Ranking Matrix");
  for (const s of result.skill_matrix || []) {
    md.push(`- **${s.skill_name}** (${s.category}): ${s.mastery_level} | Status: ${s.status} | Action: ${s.action}`);
  }

  md.push("\n## Company Interview Rounds & Preparation Roadmap");
  for (const r of result.interview_rounds || []) {
    md.push(`### ${r.title} (${r.duration})`);
    md.push(`- **Focus**: ${r.focus}`);
    md.push(`- **Key Topics**: ${(r.key_topics || []).join(", ")}`);
    md.push(`- **Tip**: ${(r.preparation_tips || []).join(" ")}\n`);
  }

  md.push("## Recommended Projects to Add to CV");
  for (const p of result.project_recommendations || []) {
    md.push(`### ${p.project_title}`);
    md.push(`**Tech Stack**: ${(p.tech_stack || []).join(", ")}`);
    md.push(`**Architecture**: ${p.architecture_overview}\n`);
    md.push("**CV Resume STAR Bullet Points:**");
    for (const b of p.cv_star_bullets || []) {
      md.push(`- ${b}`);
    }
    md.push("\n**How to Explain in Technical Interviews:**");
    const sc = p.interview_explanation_script || {};
    md.push(`- *Elevator Pitch*: ${sc.elevator_pitch}`);
    md.push(`- *Key Technical Trade-off*: ${sc.key_technical_tradeoff}`);
    md.push(`- *Quantified Outcome*: ${sc.quantified_result}\n`);
  }

  const content = md.join("\n");

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename=Interview_CV_Guide_${analysis.company_name.replace(/[^a-zA-Z0-9]/g, "_")}.md`
    }
  });
}
