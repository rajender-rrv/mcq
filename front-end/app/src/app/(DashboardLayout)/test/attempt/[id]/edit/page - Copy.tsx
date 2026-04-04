"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MCQCard from "./MCQCard";
import {
  Container,
  Typography,
  Button,
  Box,
  LinearProgress,
  CircularProgress,
} from "@mui/material";

type Option = {
  id: number;
  text: string;
};

type Question = {
  id: number;
  attempt_question_id: number | null;
  question: string;
  options: Option[];
};

export default function MCQPage() {
  const params = useParams();
  const attemptId = params.id;/*Array.isArray(params.attemptId)
    ? params.attemptId[0]
    : params.attemptId;*/

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ PAGINATION
  const QUESTIONS_PER_PAGE = 2;
  const [page, setPage] = useState(0);

  // ✅ Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
 const res = await fetch(`/matdash-nextjs/api/mcq?attempt_id=${attemptId}`);
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) fetchQuestions();
  }, [attemptId]);

  const answeredCount = Object.keys(answers).length;
  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  // ✅ Pagination logic
  const startIndex = page * QUESTIONS_PER_PAGE;
  const currentQuestions = questions.slice(
    startIndex,
    startIndex + QUESTIONS_PER_PAGE
  );
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAnswer = (key: string, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: optionId,
    }));
  };

  // ✅ Submit API
  const handleSubmit = async () => {
    if (answeredCount !== questions.length) return;

    try {
      setLoading(true);

      const payload = questions.map((q, index) => {
        const key = `${q.id}-${index}`;

        return {
          attempt_question_id: String(q.attempt_question_id),
          selected_option_id: String(answers[key]),
        };
      });

     const res = await fetch("/matdash-nextjs/api/mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attempt_id: attemptId,
          answers: payload,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setScore(data.score || 0);
      setSubmitted(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !questions.length) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading questions...</Typography>
      </Box>
    );
  }

  if (!questions.length) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography>No questions available</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 2 }}>
        MCQ Test
      </Typography>

      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="caption">
          {answeredCount} / {questions.length} answered
        </Typography>
      </Box>

      {!submitted ? (
        <>
          {/* Questions */}
          {currentQuestions.map((q, index) => {
            const realIndex = startIndex + index;
            const key = `${q.id}-${realIndex}`;

            return (
              <MCQCard
                key={key}
                uniqueKey={key}
                data={q}
                index={realIndex}
                onAnswer={handleAnswer}
                selectedAnswer={answers[key]}
              />
            );
          })}

          {/* Pagination Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              onClick={handlePrev}
              disabled={page === 0}
            >
              Previous
            </Button>

            <Typography>
              Page {page + 1} / {totalPages}
            </Typography>

            {page === totalPages - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={
                  answeredCount !== questions.length || loading
                }
              >
                {loading ? "Submitting..." : "Submit Test"}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </>
      ) : (
        <Box textAlign="center" mt={5}>
          <Typography variant="h4">
            🎉 Score: {score} / {questions.length}
          </Typography>

          <Button
            sx={{ mt: 3 }}
            variant="outlined"
            onClick={() => {
              setAnswers({});
              setScore(0);
              setSubmitted(false);
              setPage(0);
            }}
          >
            Retry
          </Button>
        </Box>
      )}
    </Container>
  );
}