import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import MCQClient from "./MCQClient";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookieStore = await cookies(); // ✅ IMPORTANT
	//console.log("ALL COOKIES:", cookieStore.getAll()); // 👈 add this


  const token = cookieStore.get("token")?.value;
  
  /*
  if (!token) {
    redirect("/auth/login");
  }
  */
  console.log("TOKEN:", token); // 👈 add this
  
  const user = token ? getSession(token) : null;
  
  console.log("user:", user); // 👈 add this

  return <MCQClient user={user} />;
}