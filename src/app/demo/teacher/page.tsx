import { Metadata } from "next";
import TeacherReview from "@/components/sections/teacher-review";

export const metadata: Metadata = {
  title: "Teacher Review — SolveFlow Demo",
  description: "Demo of the teacher dashboard: upload DPP, review AI-generated answers, approve or correct per question, then publish.",
};

export default async function TeacherDemoPage() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  let dppData = null;
  try {
    const res = await fetch(`${baseUrl}/demo/dpp.json`, { cache: "no-store" });
    if (res.ok) dppData = await res.json();
  } catch {
    // client will fetch as fallback
  }

  return <TeacherReview initialData={dppData} />;
}
