import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    console.log("access_token:", access_token);

    const backendRes = await fetch("http://127.0.0.1:8000/users/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
console.log(backendRes);

/*
    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch users....!!!!" },
      );
    }
*/

    const users = await backendRes.json();

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}