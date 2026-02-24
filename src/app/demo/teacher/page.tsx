import { Metadata } from "next";
import TeacherReview from "@/components/sections/teacher-review";

export const metadata: Metadata = {
  title: "Teacher Review — SolveFlow Demo",
  description: "Demo of the teacher dashboard: upload DPP, review AI-generated answers, approve or correct per question, then publish.",
};

export default function TeacherPage() {
  return <TeacherReview />;
}
