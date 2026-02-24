// Redirects to /lite — this route is deprecated
import { redirect } from "next/navigation";

export default function ForTeachersRedirect() {
  redirect("/lite");
}
