"use client";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from "@mui/material";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SimpleFormPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    duration: "",
    total_questions: "",
    class_id: "",
    subject_id: "",
    category_id: "",
    shuffle_questions: "false",
    shuffle_options: "false",
    negative_marking: "false"
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // ================= HANDLE CHANGE =================
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // ================= VALIDATION =================
  const validate = () => {
    let newErrors: any = {};
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // ✅ Duration validation
    if (!form.duration) {
      newErrors.duration = "Duration is required";
      isValid = false;
    } else if (Number(form.duration) <= 0) {
      newErrors.duration = "Must be greater than 0 (no negative/zero)";
      isValid = false;
    }

    // ✅ Total Questions validation
    if (!form.total_questions) {
      newErrors.total_questions = "Total questions required";
      isValid = false;
    } else if (Number(form.total_questions) <= 0) {
      newErrors.total_questions = "Must be greater than 0 (no negative/zero)";
      isValid = false;
    }

    if (!form.class_id) {
      newErrors.class_id = "Class is required";
      isValid = false;
    }

    if (!form.subject_id) {
      newErrors.subject_id = "Subject is required";
      isValid = false;
    }

    if (!form.category_id) {
      newErrors.category_id = "Category is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      name: form.name,
      duration: Number(form.duration),
      total_questions: Number(form.total_questions),
      class_id: Number(form.class_id),
      subject_id: Number(form.subject_id),
      category_id: Number(form.category_id),
      shuffle_questions: form.shuffle_questions === "true",
      shuffle_options: form.shuffle_options === "true",
      negative_marking: form.negative_marking === "true"
    };

    try {
      setLoading(true);

      const res = await fetch("/matdash-nextjs/api/template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Saved Successfully ✅");
      router.push("/template");
    } catch (error: any) {
      alert(error.message || "Error ❌");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Add Subject
        </Typography>

        {/* Name */}
        <TextField
          label="Name"
          fullWidth
          required
          margin="normal"
          value={form.name}
          error={!!errors.name}
          helperText={errors.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        {/* Duration */}
        <TextField
          label="Duration (minutes)"
          type="number"
          fullWidth
          margin="normal"
          inputProps={{ min: 1 }}
          value={form.duration}
          error={!!errors.duration}
          helperText={errors.duration}
          onChange={(e) => {
            const value = e.target.value;
            if (Number(value) < 0) return; // ❌ block negative
            handleChange("duration", value);
          }}
        />

        {/* Total Questions */}
        <TextField
          label="Total Questions"
          type="number"
          fullWidth
          margin="normal"
          inputProps={{ min: 1 }}
          value={form.total_questions}
          error={!!errors.total_questions}
          helperText={errors.total_questions}
          onChange={(e) => {
            const value = e.target.value;
            if (Number(value) < 0) return; // ❌ block negative
            handleChange("total_questions", value);
          }}
        />

        {/* Class */}
        <TextField
          select
          label="Class"
          fullWidth
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
          margin="normal"
          value={form.category_id}
          error={!!errors.category_id}
          helperText={errors.category_id}
          onChange={(e) => handleChange("category_id", e.target.value)}
        >
          <MenuItem value="1">Easy</MenuItem>
          <MenuItem value="2">Medium</MenuItem>
        </TextField>

        {/* Shuffle Questions */}
        <Box mt={2}>
          <FormLabel>Shuffle Questions</FormLabel>
          <RadioGroup
            row
            value={form.shuffle_questions}
            onChange={(e) =>
              handleChange("shuffle_questions", e.target.value)
            }
          >
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>
        </Box>

        {/* Shuffle Options */}
        <Box mt={2}>
          <FormLabel>Shuffle Options</FormLabel>
          <RadioGroup
            row
            value={form.shuffle_options}
            onChange={(e) =>
              handleChange("shuffle_options", e.target.value)
            }
          >
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>
        </Box>

        {/* Negative Marking */}
        <Box mt={2}>
          <FormLabel>Negative Marking</FormLabel>
          <RadioGroup
            row
            value={form.negative_marking}
            onChange={(e) =>
              handleChange("negative_marking", e.target.value)
            }
          >
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>
        </Box>

        <Box mt={3}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}