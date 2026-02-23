import { Metadata } from "next";
import StudentDpp from "@/components/sections/student-dpp";

export const metadata: Metadata = {
  title: "Student DPP — SolveFlow Demo",
  description: "Interactive NEET DPP demo for Class 12 students. Attempt questions and reveal AI-generated solutions.",
};

export default async function StudentDemoPage() {
  // Fetch the DPP JSON at request time from public directory
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  let dppData = null;
  try {
    const res = await fetch(`${baseUrl}/demo/dpp.json`, { cache: "no-store" });
    if (res.ok) {
      dppData = await res.json();
    }
  } catch {
    // fallback: client will fetch directly
  }

  return <StudentDpp initialData={dppData} />;
}
