import { NextResponse } from "next/server";
import { getRecentAnalyses } from "@/lib/career-service";

export async function GET() {
  const history = getRecentAnalyses();
  return NextResponse.json(history);
}
