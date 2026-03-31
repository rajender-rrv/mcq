import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SECRET = "my-secret-key";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const access_token = cookieStore.get("access_token")?.value;

  const { class_id, subject_id, category_id, questions } =
    await req.json();

  const varArray = questions;

  let api_json_data: any[] = [];
  let data: any[] = []; // ✅ FIXED

  for (let i = 0; i < varArray.length; i++) {
    let test_options: any[] = [];

    for (let j = 0; j < varArray[i].options.length; j++) {
      let is_correct_value = false;

      if (varArray[i].correctAnswer == j) {
        is_correct_value = true;
      }

      test_options.push({
        option_text: varArray[i].options[j],
        is_correct: is_correct_value,
      });
    }

    const payload = {
      question_text: varArray[i].question_text,
      explanation: varArray[i].question_text,
      class_id,
      subject_id,
      category_id,
      options: test_options,
    };

    api_json_data.push(payload);

    try {
      console.log("API HIT before ✅");

      const backendRes = await fetch(
        "http://127.0.0.1:8000/questions/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await backendRes.json();
      data.push(result); // ✅ FIXED

      console.log("API HIT after ✅");
    } catch (error) {
      console.error("API ERROR ❌", error);
      data.push({ error: "Failed", index: i });
    }
  }

  return NextResponse.json({
    message: "Success ✅",
    data: data,
    inputdata: api_json_data,
  });
}