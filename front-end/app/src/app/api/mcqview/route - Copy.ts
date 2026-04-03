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

console.log(varArray[0].correctAnswer);
  for (let i = 0; i < varArray.length; i++) {
    let test_options: any[] = []; // ✅ array per question

    for (let j = 0; j < varArray[i].options.length; j++) {
		var is_correct_value = false;
		if(varArray[i].correctAnswer == j){
			is_correct_value = true;
		}
      test_options.push({
        option_text: varArray[i].options[j], // ✅ correct index
        is_correct: is_correct_value, // change based on your logic
      });
} 	
	  /****************************************************/
	  
	   console.log("register API HIT before✅");
	
	 api_json_data.push({
      question_text: varArray[i].question_text,
      explanation: varArray[i].question_text,
      class_id: class_id,
      subject_id: subject_id,
      category_id: category_id,
      options: test_options, // ✅ attach options
    });
	
    // ✅ Call your backend API
     const backendUrl = process.env.API_BASE_URL;
    const backendRes = await fetch(`${backendUrl}/questions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
		Authorization: `Bearer ${access_token}`,

      },
      body: JSON.stringify(api_json_data[i]),
    });

    var data[i] = await backendRes.json();
	console.log("register API HIT after✅");
	  
	  /******************************************************/
   
  }


  return NextResponse.json({
    message: "Success ✅",
    data: data,
	inputdata: api_json_data
  });
}