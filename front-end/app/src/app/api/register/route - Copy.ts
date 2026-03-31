// /app/api/login/route.ts
console.log("my test....!!!!");
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = "my-secret-key";

export async function POST(req: Request) {
  const { email, password } = await req.json();

console.log("EMAIL:", email);
console.log("PASSWORD:", password);

  // Replace with DB check
  if (email === "admin@test.com" && password === "1234") {
    const token = jwt.sign(
      { email, role: "admin" },
      SECRET,
      { expiresIn: "1h" }
    );

    const res = NextResponse.json({ message: "Login success" });

    res.cookies.set("token", token, {
      httpOnly: true,
	  secure: false, // ✅ change this
      sameSite: "strict",
      path: "/",
    });

    return res;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}



