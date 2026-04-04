import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SECRET = process.env.SECRET_KEY;

export async function POST(req: Request) {
  try {
    // ================= COOKIES =================
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    console.log("🔑 TOKEN:", access_token);

    // ================= BODY =================
    const {
      name,
      duration,
      total_questions,
      class_id,
      subject_id,
      category_id,
      shuffle_questions,
      shuffle_options,
      negative_marking,
    } = await req.json();

    // ================= VALIDATION =================
    if (
      !name ||
      !duration ||
      !total_questions ||
      !class_id ||
      !subject_id ||
      !category_id
    ) {
      return NextResponse.json(
        { message: "All fields are required ❌" },
        { status: 400 }
      );
    }

    if (Number(duration) <= 0 || Number(total_questions) <= 0) {
      return NextResponse.json(
        { message: "Values must be greater than 0 ❌" },
        { status: 400 }
      );
    }

    console.log("✅ Template API HIT BEFORE");

    // ================= PAYLOAD =================
    const api_json_data = {
      name,
      class_id: Number(class_id), // ✅ IMPORTANT FIX
      subject_id: Number(subject_id),
      category_id: Number(category_id),
      total_questions: Number(total_questions),
      duration: Number(duration),
      rules: {
        shuffle_questions: shuffle_questions ?? true,
        shuffle_options: shuffle_options ?? true,
        negative_marking: negative_marking ?? false,
      },
    };

    console.log(
      "📦 FINAL PAYLOAD:",
      JSON.stringify(api_json_data, null, 2)
    );

    // ================= BACKEND CALL =================
    const backendUrl = process.env.API_BASE_URL;
    const url = `${backendUrl}/templates/`;

    console.log("🌐 URL:", url);

    const backendRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(api_json_data),
    });

    console.log("📡 STATUS:", backendRes.status);

    // ================= SAFE RESPONSE PARSE =================
    const text = await backendRes.text();
    console.log("📩 RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    console.log("✅ Template API HIT AFTER");

    // ================= HANDLE ERROR =================
    if (!backendRes.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.detail ||
            "Backend error ❌",
          full_error: data, // 🔥 VERY IMPORTANT FOR DEBUG
        },
        { status: backendRes.status }
      );
    }

    // ================= SUCCESS =================
    return NextResponse.json({
      message: "Saved successfully ✅",
      data,
    });

  } catch (error: any) {
    console.error("❌ SERVER ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Internal Server Error ❌",
      },
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
 const backendUrl = process.env.API_BASE_URL;
    const url = `${backendUrl}/templates/`;
	
    const backendRes = await fetch(url, {
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

