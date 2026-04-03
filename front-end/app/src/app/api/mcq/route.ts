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
      `${backendUrl}/attempts/${attempt_id}/questions`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        cache: "no-store",
      }
    );

    const data = await backendRes.json();

    console.log("🔥 RAW BACKEND DATA:", data); // ✅ DEBUG

    const formatted = data.map((q: any) => {
      // ✅ SAFE mapping (handles all possible backend formats)
      const attempt_question_id =
        q.attempt_question_id ||
        q.attemptQuestionId ||
        q.attempt_question?.id ||
        null;

      return {
        id: q.id,
        attempt_question_id, // ✅ FIXED
        question: q.question_text || q.question,
        options:
          q.options?.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
          })) || [],
      };
    });

    console.log("✅ FORMATTED DATA:", formatted); // ✅ DEBUG

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Error fetching questions" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    const backendUrl = process.env.API_BASE_URL;

    const backendRes = await fetch(
      `${backendUrl}/attempts/${body.attempt_id}/submit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: body.answers,
        }),
      }
    );

    const data = await backendRes.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Submit failed" },
      { status: 500 }
    );
  }
}