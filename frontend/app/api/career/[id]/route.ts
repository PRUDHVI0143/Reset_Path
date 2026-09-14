import { NextRequest, NextResponse } from "next/server";
import { getAnalysis } from "@/lib/career-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
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

  return NextResponse.json(analysis);
}
