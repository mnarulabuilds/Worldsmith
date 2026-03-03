import { NextRequest, NextResponse } from "next/server";
import { parsePrompt } from "@/lib/promptParser";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "A world description is required" },
        { status: 400 }
      );
    }

    const world = parsePrompt(prompt.trim());
    return NextResponse.json({ world });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate world" },
      { status: 500 }
    );
  }
}
