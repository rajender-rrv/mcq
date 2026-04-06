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
  CircularProgress,
} from "@mui/material";

import { useState, useEffect } from "react";

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

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(true);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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

        // ✅ Your API returns array directly
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

  // ================= HANDLE CHANGE =================
  const handleChange = (field: string, value: string) => {
    if (
      (field === "duration" || field === "total_questions") &&
      Number(value) < 1
    ) {
      value = "1";
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // optional: reset subject when class changes
    if (field === "class_id") {
      setForm((prev) => ({
        ...prev,
        subject_id: "",
      }));
    }
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

      const res = await fetch("/api/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccessMsg("Template added successfully ✅");

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

        {/* SUCCESS */}
        {successMsg && (
          <div className="p-4 mb-4 bg-green-100 text-green-800 border rounded">
            {successMsg}
          </div>
        )}

        {/* ERROR */}
        {errorMsg && (
          <div className="p-4 mb-4 bg-red-100 text-red-800 border rounded">
            {errorMsg}
          </div>
        )}

        {/* NAME */}
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={form.name}
          error={!!errors.name}
          helperText={errors.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        {/* DURATION */}
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

        {/* TOTAL QUESTIONS */}
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

        {/* CLASS */}
        <TextField
          select
          label="Class"
          fullWidth
          margin="normal"
          value={form.class_id}
          onChange={(e) => handleChange("class_id", e.target.value)}
          disabled={dropdownLoading}
          error={!!errors.class_id}
          helperText={errors.class_id}
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
          error={!!errors.subject_id}
          helperText={errors.subject_id}
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
          error={!!errors.category_id}
          helperText={errors.category_id}
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>

        {/* RADIO OPTIONS */}
        {["shuffle_questions", "shuffle_options", "negative_marking"].map(
          (field) => (
            <Box mt={2} key={field}>
              <FormLabel>
                {field.replace("_", " ").toUpperCase()}
              </FormLabel>
              <RadioGroup
                row
                value={(form as any)[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="Yes"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="No"
                />
              </RadioGroup>
            </Box>
          )
        )}

        <Box mt={3}>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}