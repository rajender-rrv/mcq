// /app/api/login/route.ts

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET_KEY;

export async function POST(req: Request) {
  try {
	  
    console.log("LOGIN API HIT before ✅");

    const { email, password } = await req.json();
	  console.log(email +"==="+password);

    // ✅ Call your backend API
    const backendUrl = process.env.API_BASE_URL;
    const backendRes = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
	
    console.log("LOGIN API after... ✅");

    const data = await backendRes.json();
  console.log(data);

  // ❌ If backend login fails
    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.detail || "Invalid credentials" },
        { status: backendRes.status }
      );
    }

    // ✅ Backend success → create JWT here
    const token = jwt.sign(
      {
        email: data.email,   // or whatever backend returns
        role: data.role || "user",
      },
      SECRET,
      { expiresIn: "1h" }
    );
	
	 console.log("USER DEATILS API HIT before ✅");
	 var access_token = data.access_token;
	 
	 const backendRes2 = await fetch(`http://127.0.0.1:8000/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
		Authorization: `Bearer ${access_token}`, // ✅ correct way

      },
    });
	
	const data2 = await backendRes2.json();
	
	console.log(data2);
	
	
    const res = NextResponse.json({
      message: "Login success",
      user: data,
    });

	// ✅ Set cookie
res.cookies.set("token", token, {httpOnly: true,secure: process.env.NODE_ENV === "production",sameSite: "strict",path: "/",	maxAge: 60 * 60,});
res.cookies.set("access_token", data.access_token);
res.cookies.set("refresh_token", data.refresh_token);

res.cookies.set("id", data2.id);
res.cookies.set("username", data2.username);
res.cookies.set("email", data2.email);
res.cookies.set("role", data2.role);


    return res;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Server error....!!!!" },
      { status: 500 }
    );
  }
}