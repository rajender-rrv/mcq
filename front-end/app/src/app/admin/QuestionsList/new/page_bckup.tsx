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
  questionname: string;
  options: string[];
  correctAnswer: number | null;
};

const DEFAULT_OPTIONS = ["", "", "", ""];

export default function MultiQuestionPage() {
  const router = useRouter();

  // ✅ FIXED FORM STATE
  const [form, setForm] = useState({
    class_id: "",
    subject_id: "",
    category_id: ""
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const [questions, setQuestions] = useState<Question[]>([
    { questionname: "", options: [...DEFAULT_OPTIONS], correctAnswer: null }
  ]);

  const handleQuestionChange = (qIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, questionname: value } : q
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
        questionname: "",
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

  const handleSubmit = () => {
    if (!form.class_id || !form.subject_id || !form.category_id) {
      alert("Please select class, subject and category");
      return;
    }

    const isValid = questions.every(
      (q) =>
        q.questionname.trim() &&
        q.options.length >= 2 &&
        q.options.every((o) => o.trim()) &&
        q.correctAnswer !== null
    );

    if (!isValid) {
      alert("Fill all fields and select correct answers");
      return;
    }

    const finalPayload = {
      ...form,
      questions
    };

    console.log("Final Data:", finalPayload);

    alert("Questions Saved ✅");
    router.push("/QuestionsList");
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Create Multiple Questions
        </Typography>

        {/* Class */}
        <TextField
          select
          label="Class"
          fullWidth
          margin="normal"
          value={form.class_id}
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
          margin="normal"
          value={form.subject_id}
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
          margin="normal"
          value={form.category_id}
          onChange={(e) => handleChange("category_id", e.target.value)}
        >
          <MenuItem value="1">Easy</MenuItem>
          <MenuItem value="2">Medium</MenuItem>
        </TextField>

        {/* Questions UI stays same */}
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

            <TextField
              fullWidth
              multiline
              rows={2}
              margin="normal"
              label="Question"
              value={q.questionname}
              onChange={(e) =>
                handleQuestionChange(qIndex, e.target.value)
              }
            />

            {q.options.map((opt, oIndex) => (
              <Box key={oIndex} display="flex" gap={1} mt={1}>
                <TextField
                  fullWidth
                  label={`Option ${oIndex + 1}`}
                  value={opt}
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

            <TextField
              select
              fullWidth
              margin="normal"
              label="Correct Answer"
              value={q.correctAnswer ?? ""}
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
          <Button variant="contained" onClick={handleSubmit}>
            Save All
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}