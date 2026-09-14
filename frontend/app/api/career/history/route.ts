import { NextResponse } from "next/server";
import { getRecentAnalyses } from "@/lib/career-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const history = getRecentAnalyses();
  return NextResponse.json(history);
}
