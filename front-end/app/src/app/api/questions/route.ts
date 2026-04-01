import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SECRET = process.env.SECRET_KEY;

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
      const backendUrl = process.env.API_BASE_URL;
      const backendRes = await fetch(
        `${backendUrl}/questions/`,
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


/*
export async function GET() {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    console.log("access_token:", access_token);
    const backendUrl = process.env.API_BASE_URL;

    const backendRes = await fetch(`${backendUrl}/users/`, {
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
*/


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
