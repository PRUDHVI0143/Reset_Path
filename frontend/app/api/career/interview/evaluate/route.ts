import { NextRequest, NextResponse } from "next/server";
import { evaluateInterviewAnswer, InterviewQuestion } from "@/lib/interview-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, answer, timeSpentSeconds } = body;

    if (!question || typeof answer !== "string") {
      return NextResponse.json(
        { detail: "Both 'question' object and 'answer' string are required." },
        { status: 400 }
      );
    }

    const evaluation = evaluateInterviewAnswer(
      question as InterviewQuestion,
      answer,
      timeSpentSeconds || 0
    );

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error("Error in /api/career/interview/evaluate:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to evaluate interview answer" },
      { status: 500 }
    );
  }
}
