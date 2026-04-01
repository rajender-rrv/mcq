import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SECRET = process.env.SECRET_KEY;

export async function POST(req: Request) {
  try {
    const cookieStore =  await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    const {
      name,
      duration,
      total_questions,
      class_id,
      subject_id,
      category_id,
      shuffle_questions,
      shuffle_options,
      negative_marking
    } = await req.json();

    // ✅ VALIDATION
    if (
      !name ||
      !duration ||
      !total_questions ||
      !class_id ||
      !subject_id ||
      !category_id
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (duration <= 0 || total_questions <= 0) {
      return NextResponse.json(
        { message: "Values must be greater than 0" },
        { status: 400 }
      );
    }

    console.log("Template API HIT before ✅");

    // ✅ Correct payload (NO ARRAY, NO i)
    const api_json_data = {
      name: name,
      subject_id: subject_id,
      category_id: category_id,
      total_questions: total_questions,
      duration: duration,
      rules: {
        shuffle_questions: shuffle_questions ?? true,
        shuffle_options: shuffle_options ?? true,
        negative_marking: negative_marking ?? false
      }
    };

    console.log("Payload:", api_json_data);

    // ✅ Backend API Call
     const backendUrl = process.env.API_BASE_URL;
    const backendRes = await fetch(`${backendUrl}/templates/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify(api_json_data)
    });

    const data = await backendRes.json();

    console.log("Template API HIT after ✅");

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.message || "Backend error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Saved successfully",
      data
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    // ✅ Check token
    if (!access_token) {
      return NextResponse.json(
        { message: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    const backendRes = await fetch("http://127.0.0.1:8000/templates/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const data = await backendRes.json();

    // ✅ Handle backend error
    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.message || "Backend error" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("GET API ERROR:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

