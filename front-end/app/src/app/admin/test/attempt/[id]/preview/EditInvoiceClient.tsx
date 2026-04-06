"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Chip,
  Divider,
} from "@mui/material";

type Option = {
  id: number;
  text: string;
  label: string;
};

type Answer = {
  id: number;
  text: string;
  label: string;
};

type Question = {
  attempt_question_id: number;
  question_text: string;
  question_order: number;
  options: Option[];
  correct_answer: Answer;
  user_answer: Answer | null;
  explanation: string;
};

export default function PreviewPage() {
  const params = useParams();
  const attemptId = params.id;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Preview Data
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch(
          `/api/mcqview?attempt_id=${attemptId}`
        );
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) fetchPreview();
  }, [attemptId]);

  // ✅ Loader
  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading preview...</Typography>
      </Box>
    );
  }

  if (!questions.length) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  // ✅ Calculate Score
  const score = questions.filter(
    (q) => q.user_answer?.id === q.correct_answer?.id
  ).length;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" mb={2}>
        MCQ Review
      </Typography>

      {/* ✅ Score */}
      <Typography variant="h6" mb={3}>
        Score: {score} / {questions.length}
      </Typography>

      {questions.map((q, index) => {
        const isCorrect =
          q.user_answer?.id === q.correct_answer?.id;

        return (
          <Paper key={q.attempt_question_id} sx={{ p: 3, mb: 3 }}>
            {/* Question */}
            <Typography variant="h6">
              Q{index + 1}. {q.question_text}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Options */}
            {q.options.map((opt) => {
              const isUser = q.user_answer?.id === opt.id;
              const isRight = q.correct_answer?.id === opt.id;

              return (
                <Box
                  key={opt.id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: isRight
                      ? "green"
                      : isUser
                      ? "red"
                      : "grey.300",
                    backgroundColor: isRight
                      ? "#e8f5e9"
                      : isUser
                      ? "#ffebee"
                      : "#fff",
                  }}
                >
                  <Typography>
                    {opt.label}. {opt.text}
                  </Typography>

                  {/* Tags */}
                  {isRight && (
                    <Chip
                      label="Correct Answer"
                      color="success"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}

                  {isUser && !isRight && (
                    <Chip
                      label="Your Answer"
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              );
            })}

            {/* Result */}
            <Box mt={2}>
              <Chip
                label={isCorrect ? "Correct ✅" : "Wrong ❌"}
                color={isCorrect ? "success" : "error"}
              />
            </Box>

            {/* Explanation */}
            {q.explanation && (
              <Box mt={2}>
                <Typography variant="subtitle2">
                  Explanation:
                </Typography>
                <Typography variant="body2">
                  {q.explanation}
                </Typography>
              </Box>
            )}
          </Paper>
        );
      })}
    </Container>
  );
}