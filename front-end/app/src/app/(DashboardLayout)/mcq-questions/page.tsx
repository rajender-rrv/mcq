import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import MCQClient from "./MCQClient";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookieStore = await cookies(); // ✅ IMPORTANT
  const token = cookieStore.get("token")?.value;
  const user = token ? getSession(token) : null;
  return <MCQClient user={user} />;
}