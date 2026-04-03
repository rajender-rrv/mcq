// /app/api/test/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import jwt from "jsonwebtoken";
const SECRET = process.env.SECRET_KEY;

export async function POST(req: Request) {
  try {
    console.log("TEST API HIT before ✅");

    // ✅ Read body only once
    const body = await req.json();
    const { email, password, template_id } = body;


    // ✅ cookies() is NOT async
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    const user_id = cookieStore.get("id")?.value;


    const backendUrl = process.env.API_BASE_URL;

    const backendRes = await fetch(`${backendUrl}/attempts/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ template_id, user_id }),
    });

    console.log("TEST API after... ✅");

    const data = await backendRes.json();
    console.log("attempt_id:::"+data.attempt_id);

    return NextResponse.json({
      message: "TEST started success",
      user: data,
	  body: body,
	  user_id: user_id
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      { error: "Server error....!!!!" },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    if (!access_token) {
      return NextResponse.json(
        { message: "Unauthorized ❌" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.API_BASE_URL;

    const backendRes = await fetch(`${backendUrl}/templates/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-store", // ✅ always fresh data
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: "Backend fetch failed ❌" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error("GET ERROR ❌", error);

    return NextResponse.json(
      { message: "Internal Server Error ❌" },
      { status: 500 }
    );
  }
}


