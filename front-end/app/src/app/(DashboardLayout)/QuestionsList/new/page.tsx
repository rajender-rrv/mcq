"use client";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  MenuItem
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question_text: string;
  options: string[];
  correctAnswer: number | null;
};

const DEFAULT_OPTIONS = ["", "", "", ""];

export default function MultiQuestionPage() {
  const router = useRouter();

  // ================= STATE =================
  const [form, setForm] = useState({
    class_id: "",
    subject_id: "",
    category_id: ""
  });

  const [questions, setQuestions] = useState<Question[]>([
    { question_text: "", options: [...DEFAULT_OPTIONS], correctAnswer: null }
  ]);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // ================= FORM CHANGE =================
  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // ================= VALIDATION =================
  const validate = () => {
    let newErrors: any = {};

    if (!form.class_id) newErrors.class_id = "Class is required";
    if (!form.subject_id) newErrors.subject_id = "Subject is required";
    if (!form.category_id) newErrors.category_id = "Category is required";

    newErrors.questions = [];

    questions.forEach((q, qIndex) => {
      let qErrors: any = {};

      if (!q.question_text.trim()) {
        qErrors.question_text = "Question is required";
      }

      qErrors.options = q.options.map((opt: string) =>
        !opt.trim() ? "Option is required" : ""
      );

      if (q.correctAnswer === null) {
        qErrors.correctAnswer = "Select correct answer";
      }

      newErrors.questions[qIndex] = qErrors;
    });

    setErrors(newErrors);

    return (
      !newErrors.class_id &&
      !newErrors.subject_id &&
      !newErrors.category_id &&
      newErrors.questions.every(
        (q: any) =>
          !q.question_text &&
          !q.correctAnswer &&
          q.options.every((o: string) => !o)
      )
    );
  };

  // ================= QUESTION HANDLERS =================
  const handleQuestionChange = (qIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, question_text: value } : q
      )
    );
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === oIndex ? value : opt
              ),
              correctAnswer:
                q.correctAnswer === oIndex ? null : q.correctAnswer
            }
          : q
      )
    );
  };

  const handleCorrectAnswer = (qIndex: number, value: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, correctAnswer: value } : q
      )
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: "",
        options: [...DEFAULT_OPTIONS],
        correctAnswer: null
      }
    ]);
  };

  const deleteQuestion = (qIndex: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length >= 6) return q;
        return { ...q, options: [...q.options, ""] };
      })
    );
  };

  const deleteOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length <= 2) return q;

        const newOptions = q.options.filter((_, j) => j !== oIndex);

        return {
          ...q,
          options: newOptions,
          correctAnswer:
            q.correctAnswer === oIndex
              ? null
              : q.correctAnswer !== null && q.correctAnswer > oIndex
              ? q.correctAnswer - 1
              : q.correctAnswer
        };
      })
    );
  };

  // ================= SUBMIT (API CALL) =================
  const handleSubmit = async () => {
    if (!validate()) return;

    const finalPayload = {
      ...form,
      questions
    };

    try {
      setLoading(true);

      const res = await fetch("/matdash-nextjs/api/questions", {
        method: "POST",
        headers: {
         // "Content-Type": "application/json"
           "Content-Type": "text/plain"
		  // Authorization: `Bearer ${token}` // optional
        },
        body: JSON.stringify(finalPayload)
      });
	 console.log(res); 

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      alert("Questions Saved Successfully ✅");

      router.push("/QuestionsList");

	  
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to save ❌");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Add Single/Multiple Questions
        </Typography>

        {/* Class */}
        <TextField
          select
          label="Class"
          fullWidth
          required
          margin="normal"
          value={form.class_id}
          error={!!errors.class_id}
          helperText={errors.class_id}
          onChange={(e) => handleChange("class_id", e.target.value)}
        >
          <MenuItem value="1">Grade 6</MenuItem>
          <MenuItem value="2">Grade 7</MenuItem>
        </TextField>

        {/* Subject */}
        <TextField
          select
          label="Subject"
          fullWidth
          required
          margin="normal"
          value={form.subject_id}
          error={!!errors.subject_id}
          helperText={errors.subject_id}
          onChange={(e) => handleChange("subject_id", e.target.value)}
        >
          <MenuItem value="1">Maths</MenuItem>
          <MenuItem value="2">Science</MenuItem>
        </TextField>

        {/* Category */}
        <TextField
          select
          label="Category"
          fullWidth
          required
          margin="normal"
          value={form.category_id}
          error={!!errors.category_id}
          helperText={errors.category_id}
          onChange={(e) => handleChange("category_id", e.target.value)}
        >
          <MenuItem value="1">Easy</MenuItem>
          <MenuItem value="2">Medium</MenuItem>
        </TextField>

        {/* Questions */}
        {questions.map((q, qIndex) => (
          <Box key={qIndex} mb={4} p={2} border="1px solid #ddd">
            <Box display="flex" justifyContent="space-between">
              <Typography>Question {qIndex + 1}</Typography>
              <IconButton
                disabled={questions.length <= 1}
                onClick={() => deleteQuestion(qIndex)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            {/* Question */}
            <TextField
              fullWidth
              multiline
              rows={2}
              required
              margin="normal"
              label="Question"
              value={q.question_text}
              error={!!errors.questions?.[qIndex]?.question_text}
              helperText={errors.questions?.[qIndex]?.question_text}
              onChange={(e) =>
                handleQuestionChange(qIndex, e.target.value)
              }
            />

            {/* Options */}
            {q.options.map((opt, oIndex) => (
              <Box key={oIndex} display="flex" gap={1} mt={1}>
                <TextField
                  fullWidth
                  required
                  label={`Option ${oIndex + 1}`}
                  value={opt}
                  error={
                    !!errors.questions?.[qIndex]?.options?.[oIndex]
                  }
                  helperText={
                    errors.questions?.[qIndex]?.options?.[oIndex]
                  }
                  onChange={(e) =>
                    handleOptionChange(qIndex, oIndex, e.target.value)
                  }
                />

                <IconButton
                  disabled={q.options.length <= 2}
                  onClick={() => deleteOption(qIndex, oIndex)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={() => addOption(qIndex)}
              sx={{ mt: 1 }}
            >
              Add Option
            </Button>

            {/* Correct Answer */}
            <TextField
              select
              fullWidth
              required
              margin="normal"
              label="Correct Answer"
              value={q.correctAnswer ?? ""}
              error={!!errors.questions?.[qIndex]?.correctAnswer}
              helperText={
                errors.questions?.[qIndex]?.correctAnswer
              }
              onChange={(e) =>
                handleCorrectAnswer(qIndex, Number(e.target.value))
              }
            >
              {q.options.map((_, i) => (
                <MenuItem key={i} value={i}>
                  Option {i + 1}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        ))}

        <Button startIcon={<AddIcon />} onClick={addQuestion}>
          Add Question
        </Button>

        <Box mt={2}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save All"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}