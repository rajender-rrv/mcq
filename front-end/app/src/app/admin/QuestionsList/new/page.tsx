"use client";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { useState, useEffect } from "react";
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
    category_id: "",
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [dropdownLoading, setDropdownLoading] = useState(true);

  const [questions, setQuestions] = useState<Question[]>([
    { question_text: "", options: [...DEFAULT_OPTIONS], correctAnswer: null },
  ]);

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
    show: false,
  });

  // ================= FETCH DROPDOWNS =================
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [classRes, subjectRes, categoryRes] = await Promise.all([
          fetch("/api/class"),
          fetch("/api/subjects"),
          fetch("/api/category"),
        ]);

        const classData = await classRes.json();
        const subjectData = await subjectRes.json();
        const categoryData = await categoryRes.json();

        // ✅ FIX: direct array + filter deleted
        setClasses((classData || []).filter((c: any) => !c.is_deleted));
        setSubjects((subjectData || []).filter((s: any) => !s.is_deleted));
        setCategories((categoryData || []).filter((c: any) => !c.is_deleted));
      } catch (error) {
        console.error("Dropdown fetch error:", error);
      } finally {
        setDropdownLoading(false);
      }
    };

    fetchDropdowns();
  }, []);

  // ✅ AUTO SCROLL
  useEffect(() => {
    if (alert.show) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [alert.show]);

  // ================= HANDLERS =================
  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // OPTIONAL: reset subject when class changes
    if (field === "class_id") {
      setForm((prev) => ({ ...prev, subject_id: "" }));
    }
  };

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
        correctAnswer: null,
      },
    ]);
  };

  const deleteQuestion = (qIndex: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex || q.options.length >= 6) return q;
        return { ...q, options: [...q.options, ""] };
      })
    );
  };

  const deleteOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex || q.options.length <= 2) return q;

        const newOptions = q.options.filter((_, j) => j !== oIndex);

        return {
          ...q,
          options: newOptions,
          correctAnswer:
            q.correctAnswer === oIndex ? null : q.correctAnswer,
        };
      })
    );
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    const payload = {
      class_id: Number(form.class_id),
      subject_id: Number(form.subject_id),
      category_id: Number(form.category_id),
      questions: questions.map((q) => ({
        question_text: q.question_text,
        options: q.options.map((opt, i) => ({
          option_text: opt,
          is_correct: q.correctAnswer === i,
        })),
      })),
    };

    try {
      setLoading(true);

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      const failed = data?.data?.filter((x: any) => x.error);

      if (failed?.length) {
        setAlert({
          type: "error",
          message: `Failed at question(s): ${failed
            .map((f: any) => f.index + 1)
            .join(", ")}`,
          show: true,
        });
        return;
      }

      setAlert({
        type: "success",
        message: data.message || "Added successfully",
        show: true,
      });

      // reset
      setForm({ class_id: "", subject_id: "", category_id: "" });
      setQuestions([
        {
          question_text: "",
          options: [...DEFAULT_OPTIONS],
          correctAnswer: null,
        },
      ]);
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Error occurred",
        show: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Add Questions</Typography>

        {/* ALERT */}
        {alert.show && (
          <div
            className={`p-4 mb-4 rounded-md text-sm ${
              alert.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            <b>{alert.type === "success" ? "Success: " : "Error: "}</b>
            {alert.message}
          </div>
        )}

        {/* CLASS */}
        <TextField
          select
          label="Class"
          fullWidth
          margin="normal"
          value={form.class_id}
          onChange={(e) => handleChange("class_id", e.target.value)}
          disabled={dropdownLoading}
        >
          {dropdownLoading ? (
            <MenuItem value="">
              <CircularProgress size={20} />
            </MenuItem>
          ) : (
            classes.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.name}
              </MenuItem>
            ))
          )}
        </TextField>

        {/* SUBJECT */}
        <TextField
          select
          label="Subject"
          fullWidth
          margin="normal"
          value={form.subject_id}
          onChange={(e) => handleChange("subject_id", e.target.value)}
          disabled={dropdownLoading}
        >
          {subjects.map((sub) => (
            <MenuItem key={sub.id} value={sub.id}>
              {sub.name}
            </MenuItem>
          ))}
        </TextField>

        {/* CATEGORY */}
        <TextField
          select
          label="Category"
          fullWidth
          margin="normal"
          value={form.category_id}
          onChange={(e) => handleChange("category_id", e.target.value)}
          disabled={dropdownLoading}
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>

        {/* QUESTIONS */}
        {questions.map((q, qIndex) => (
          <Box key={qIndex} border="1px solid #ddd" p={2} mt={2}>
            <Box display="flex" justifyContent="space-between">
              <Typography>Q{qIndex + 1}</Typography>
              <IconButton onClick={() => deleteQuestion(qIndex)}>
                <DeleteIcon />
              </IconButton>
            </Box>

            <TextField
              fullWidth
              label="Question"
              value={q.question_text}
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
                <IconButton onClick={() => deleteOption(qIndex, oIndex)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button onClick={() => addOption(qIndex)}>
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}