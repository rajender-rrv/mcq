// /app/api/login/route.ts

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

//const SECRET = process.env.JWT_SECRET!;

const SECRET = "my-secret-key";

export async function POST(req: Request) {
  try {
    console.log("register API HIT before✅");
	
    const { username,email, password } = await req.json();

    // ✅ Call your backend API
    const backendRes = await fetch("http://127.0.0.1:8000/users/", {
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