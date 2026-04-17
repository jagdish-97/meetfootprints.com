import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Therapist } from "@/lib/types";

const therapistsPath = path.join(process.cwd(), "data", "therapists.json");

export const getTherapists = cache(async (): Promise<Therapist[]> => {
  const raw = await readFile(therapistsPath, "utf8");
  return JSON.parse(raw) as Therapist[];
});

export async function getTherapistById(therapistId: string) {
  const therapists = await getTherapists();
  return therapists.find((therapist) => therapist.id === therapistId) ?? null;
}
