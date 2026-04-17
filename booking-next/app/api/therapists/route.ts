import { NextResponse } from "next/server";
import { getTherapists } from "@/lib/therapists";

export async function GET() {
  const therapists = await getTherapists();
  return NextResponse.json({ therapists });
}
