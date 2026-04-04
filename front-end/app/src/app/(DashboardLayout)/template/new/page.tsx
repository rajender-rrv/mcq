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
  FormLabel,
} from "@mui/material";

import { useState } from "react";

export default function SimpleFormPage() {
  const [form, setForm] = useState({
    name: "",
    duration: "",
    total_questions: "",
    class_id: "",
    subject_id: "",
    category_id: "",
    shuffle_questions: "false",
    shuffle_options: "false",
    negative_marking: "false",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ================= HANDLE CHANGE =================
  const handleChange = (field: string, value: string) => {
    // ✅ Force duration & total_questions >= 1
    if ((field === "duration" || field === "total_questions") && Number(value) < 1) {
      value = "1";
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
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

    if (!form.duration || Number(form.duration) <= 0) {
      newErrors.duration = "Must be greater than 0";
      isValid = false;
    }

    if (!form.total_questions || Number(form.total_questions) <= 0) {
      newErrors.total_questions = "Must be greater than 0";
      isValid = false;
    }

    if (!form.class_id) newErrors.class_id = "Required";
    if (!form.subject_id) newErrors.subject_id = "Required";
    if (!form.category_id) newErrors.category_id = "Required";

    setErrors(newErrors);
    return isValid;
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!validate()) return;

    setSuccessMsg("");
    setErrorMsg("");

    const payload = {
      name: form.name,
      duration: Number(form.duration),
      total_questions: Number(form.total_questions),
      class_id: Number(form.class_id),
      subject_id: Number(form.subject_id),
      category_id: Number(form.category_id),
      shuffle_questions: form.shuffle_questions === "true",
      shuffle_options: form.shuffle_options === "true",
      negative_marking: form.negative_marking === "true",
    };

    try {
      setLoading(true);

      const res = await fetch("/matdash-nextjs/api/template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // ✅ SUCCESS
      setSuccessMsg("Template added successfully ✅");

      // ✅ RESET FORM
      setForm({
        name: "",
        duration: "",
        total_questions: "",
        class_id: "",
        subject_id: "",
        category_id: "",
        shuffle_questions: "false",
        shuffle_options: "false",
        negative_marking: "false",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error: any) {
      // ❌ ERROR
      setErrorMsg(error.message || "Failed ❌");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Add Template
        </Typography>

        {/* ✅ SUCCESS */}
        {successMsg && (
          <div className="flex flex-col gap-2 p-4 text-sm bg-lightsuccess text-success border border-success rounded-md mb-4">
            <span className="font-medium">Success:{successMsg} </span>
          </div>
        )}

        {/* ❌ ERROR */}
        {errorMsg && (
          <div className="flex flex-col gap-2 p-4 text-sm bg-lighterror text-error border border-error rounded-md mb-4">
            <span className="font-medium">Error:{errorMsg} </span>
          </div>
        )}

        {/* FORM FIELDS */}
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={form.name}
          error={!!errors.name}
          helperText={errors.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        <TextField
          label="Duration"
          type="number"
          fullWidth
          margin="normal"
          value={form.duration}
          error={!!errors.duration}
          helperText={errors.duration}
          onChange={(e) => handleChange("duration", e.target.value)}
          inputProps={{ min: 1 }}
        />

        <TextField
          label="Total Questions"
          type="number"
          fullWidth
          margin="normal"
          value={form.total_questions}
          error={!!errors.total_questions}
          helperText={errors.total_questions}
          onChange={(e) => handleChange("total_questions", e.target.value)}
          inputProps={{ min: 1 }}
        />

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

        {/* ✅ Shuffle Questions */}
        <Box mt={2}>
          <FormLabel>Shuffle Questions</FormLabel>
          <RadioGroup
            row
            value={form.shuffle_questions}
            onChange={(e) => handleChange("shuffle_questions", e.target.value)}
          >
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>
        </Box>

        {/* ✅ Shuffle Options */}
        <Box mt={2}>
          <FormLabel>Shuffle Options</FormLabel>
          <RadioGroup
            row
            value={form.shuffle_options}
            onChange={(e) => handleChange("shuffle_options", e.target.value)}
          >
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>
        </Box>

        {/* ✅ Negative Marking */}
        <Box mt={2}>
          <FormLabel>Negative Marking</FormLabel>
          <RadioGroup
            row
            value={form.negative_marking}
            onChange={(e) => handleChange("negative_marking", e.target.value)}
          >
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>
        </Box>

        <Box mt={3}>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}