import { Metadata } from "next";
import AnalyticsDemo from "@/components/sections/analytics-demo";

export const metadata: Metadata = {
  title: "Analytics — SolveFlow Demo",
  description: "Class performance analytics: score distribution, topic accuracy, subject comparison, leaderboard, teacher time saved, and NEET syllabus coverage.",
};

export default async function AnalyticsDemoPage() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  let dppData = null;
  try {
    const res = await fetch(`${baseUrl}/demo/dpp.json`, { cache: "no-store" });
    if (res.ok) dppData = await res.json();
  } catch {
    // client fetches as fallback
  }

  return <AnalyticsDemo initialData={dppData} />;
}
