// /app/api/login/route.ts

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET_KEY;

export async function POST(req: Request) {
  try {
    console.log("register API HIT before✅");
	
    const { username,email, password } = await req.json();

    // ✅ Call your backend API
     const backendUrl = process.env.API_BASE_URL;
    const backendRes = await fetch(`${backendUrl}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username,email, password }),
    });

    const data = await backendRes.json();
	console.log("register API HIT before✅");

    const res = NextResponse.json({
      message: "Register success",
      user: data,
    });
	
    return res;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Server error....!!!!" },
      { status: 500 }
    );
  }
}