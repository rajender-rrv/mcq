"use client";

import { useEffect, useState } from "react";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";

export default function MCQPage() {


  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  const user = token ? getSession(token) : null;
  
  
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);

  const itemsPerPage = 10;

  useEffect(() => {
    fetch(
      "https://gist.githubusercontent.com/cmota/f7919cd962a061126effb2d7118bec72/raw/96ae8cbebd92c97dfbe53ad8927a45a28f8d2358/questions.json"
    )
      .then((res) => res.json())
      .then((result) => setData(result));
  }, []);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentData = data.slice(firstIndex, lastIndex);

  const totalPages = 2; // Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  let sno = startIndex;

  // Save Answer
  const handleAnswerChange = (questionIndex: number, option: string) => {
    setAnswers({
      ...answers,
      [questionIndex]: option,
    });
  };

  // Submit Exam
  const handleSubmit = () => {
    let correct = 0;

    data.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correct++;
      }
    });

    const wrongAnswers = data.length - correct;

    setScore(correct);
    setWrong(wrongAnswers);
    setShowResult(true);
  };

  // RESULT PAGE
  if (showResult) {
    return (
      <div style={{ padding: "30px" }}>

        <h1 style={{ textAlign: "center" }}>Exam Result</h1>

        <h2 style={{ textAlign: "center" }}>
          Score: {score} / {data.length}
        </h2>

        <h3 style={{ color: "green", textAlign: "center" }}>
          Correct: {score}
        </h3>

        <h3 style={{ color: "red", textAlign: "center" }}>
          Wrong: {wrong}
        </h3>

        <p style={{ textAlign: "center" }}>
          Percentage: {((score / data.length) * 100).toFixed(2)}%
        </p>

        <hr style={{ margin: "30px 0" }} />

        <h2>Answer Review</h2>

        {data.map((q, index) => {

          const userAnswer = answers[index];
          const correctAnswer = q.answer;
          const isCorrect = userAnswer === correctAnswer;

          return (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "10px",
              }}
            >
              <h4>
                {index + 1}. {q.question}
              </h4>

              <p>
                <b>Your Answer:</b>{" "}
                {userAnswer
                  ? `${userAnswer} : ${q[userAnswer]}`
                  : "Not Answered"}
              </p>

              <p>
                <b>Correct Answer:</b>{" "}
                {correctAnswer} : {q[correctAnswer]}
              </p>

              <p
                style={{
                  color: isCorrect ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {isCorrect ? "✔ Correct" : "✘ Wrong"}
              </p>
            </div>
          );
        })}

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "blue",
              color: "white",
            }}
          >
            Restart Exam
          </button>
        </div>
      </div>
    );
  }

  // QUESTION PAGE
  return (
    <div style={{ padding: "20px" }}>



      {user ? (
        <>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>
        </>
      ) : (
        <p>No session found</p>
      )}
	  
	  
      <h3>
        MCQ Questions {startIndex} -{" "}
        {Math.min(startIndex + itemsPerPage - 1, data.length)}
      </h3>

      {currentData.map((post, index) => {

        const questionIndex = firstIndex + index;

        return (
          <div
            key={questionIndex}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "15px",
              borderRadius: "10px",
            }}
          >
            <h4>
              {sno++}. {post.question}
            </h4>

            <div>

              <div>
                <input
                  type="radio"
                  name={`q-${questionIndex}`}
                  checked={answers[questionIndex] === "A"}
                  onChange={() =>
                    handleAnswerChange(questionIndex, "A")
                  }
                />
                &nbsp;&nbsp;{post.A}
              </div>

              <div>
                <input
                  type="radio"
                  name={`q-${questionIndex}`}
                  checked={answers[questionIndex] === "B"}
                  onChange={() =>
                    handleAnswerChange(questionIndex, "B")
                  }
                />
                &nbsp;&nbsp;{post.B}
              </div>

              <div>
                <input
                  type="radio"
                  name={`q-${questionIndex}`}
                  checked={answers[questionIndex] === "C"}
                  onChange={() =>
                    handleAnswerChange(questionIndex, "C")
                  }
                />
                &nbsp;&nbsp;{post.C}
              </div>

              <div>
                <input
                  type="radio"
                  name={`q-${questionIndex}`}
                  checked={answers[questionIndex] === "D"}
                  onChange={() =>
                    handleAnswerChange(questionIndex, "D")
                  }
                />
                &nbsp;&nbsp;{post.D}
              </div>

            </div>
          </div>
        );
      })}

      {/* Pagination */}

      <div style={{ marginTop: "20px" }}>

        {currentPage > 1 && (
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            style={{ marginRight: "10px" }}
          >
            Prev
          </button>
        )}

        {currentPage < totalPages && (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        )}

        {currentPage === totalPages && (
          <button
            onClick={handleSubmit}
            style={{
              background: "green",
              color: "white",
              padding: "8px 20px",
              marginLeft: "10px",
            }}
          >
            Submit Exam
          </button>
        )}
      </div>

      <p style={{ marginTop: "10px" }}>
        Page {currentPage} of {totalPages}
      </p>

    </div>
  );
}