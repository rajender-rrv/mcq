import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    const { class_id, subject_id, category_id, questions } =
      await req.json();

    let data: any[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      // ✅ FIX: USE FRONTEND is_correct (DO NOT OVERRIDE)
      let options = q.options.map((opt: any) => ({
        option_text:
          typeof opt === "string" ? opt : opt.option_text,
        is_correct:
          typeof opt === "object" ? opt.is_correct : false,
      }));

      const payload = {
        question_text: q.question_text,
        explanation: q.question_text,
        class_id,
        subject_id,
        category_id,
        options,
      };

      // 🔍 DEBUG
      console.log("✅ FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

      try {
        const backendUrl = process.env.API_BASE_URL;

        const backendRes = await fetch(`${backendUrl}/questions/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await backendRes.json();

        if (!backendRes.ok) {
          data.push({
            error: result.message || "Failed",
            index: i,
          });
        } else {
          data.push({
            success: true,
            index: i,
          });
        }

      } catch (error) {
        console.error("❌ API ERROR:", error);
        data.push({
          error: "Request failed",
          index: i,
        });
      }
    }

    // ✅ SUMMARY
    const failed = data.filter((d) => d.error);
    const success = data.filter((d) => d.success);

    return NextResponse.json({
      message:
        failed.length > 0
          ? "Some questions failed ❌"
          : "All questions added successfully ✅",
      data,
      successCount: success.length,
      failedCount: failed.length,
    });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);

    return NextResponse.json(
      { message: "Internal Server Error ❌" },
      { status: 500 }
    );
  }
}

export async function GET() {
	 try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    console.log("access_token:", access_token);
    const backendUrl = process.env.API_BASE_URL;
    const backendRes = await fetch(`${backendUrl}/questions/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
console.log(backendRes);


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
