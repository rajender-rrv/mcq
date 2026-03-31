// /app/api/logout/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
	const cookieStore = await cookies();

    const refresh_token = cookieStore.get("refresh_token")?.value;

    console.log("refresh_token:", refresh_token);

    // ✅ Call backend logout API
    const backendRes = await fetch("http://127.0.0.1:8000/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // ✅ FIXED
      },
      body: JSON.stringify({ refresh_token }),
    });

    const data = await backendRes; // ✅ FIXED

    console.log("Backend logout response:", data.status);


    const res = NextResponse.json({
      message: "Logged out successfully",
	  status: data.status,
    });

    // ✅ DELETE cookies (IMPORTANT)
   // res.cookies.set("token", "", {httpOnly: true,expires: new Date(0), path: "/",});
    //res.cookies.set("refresh_token", "", {httpOnly: true,expires: new Date(0), path: "/",});

    return res;

  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return NextResponse.json(
      { message: "Logout failed" },
      { status: 500 }
    );
  }
}
