// app/api/mcqview/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const attempt_id = searchParams.get("attempt_id");

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    const backendUrl = process.env.API_BASE_URL;

    const backendRes = await fetch(
      `${backendUrl}/attempts/${attempt_id}/questions/review`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        cache: "no-store",
      }
    );

    const data = await backendRes.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Error fetching preview data" },
      { status: 500 }
    );
  }
}

