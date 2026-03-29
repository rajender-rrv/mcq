"use client";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem
} from "@mui/material";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewInvoicePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    from: "",
    to: "",
    cost: "",
    status: "Pending",
    created: "",
    due: ""
  });

  // ✅ HANDLE CHANGE
  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  // ✅ SUBMIT
  const handleSubmit = () => {
    if (!form.from || !form.to || !form.cost) {
      alert("Please fill all required fields");
      return;
    }

    const newInvoice = {
      id: Math.floor(Math.random() * 1000), // temp id
      ...form,
      cost: Number(form.cost)
    };

    console.log("New Invoice:", newInvoice);

    alert("Invoice Created ✅");

    router.push("/QuestionsList");
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="h6" mb={2}>
          Create New Invoice
        </Typography>

        {/* From */}
        <TextField
          label="Bill From"
          fullWidth
          margin="normal"
          value={form.from}
          onChange={(e) => handleChange("from", e.target.value)}
        />

        {/* To */}
        <TextField
          label="Bill To"
          fullWidth
          margin="normal"
          value={form.to}
          onChange={(e) => handleChange("to", e.target.value)}
        />

        {/* Cost */}
        <TextField
          label="Total Cost"
          type="number"
          fullWidth
          margin="normal"
          value={form.cost}
          onChange={(e) => handleChange("cost", e.target.value)}
        />

        {/* Status */}
        <TextField
          select
          label="Status"
          fullWidth
          margin="normal"
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <MenuItem value="Paid">Paid</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Overdue">Overdue</MenuItem>
          <MenuItem value="Draft">Draft</MenuItem>
        </TextField>

        {/* Created Date */}
        <TextField
          type="date"
          label="Created Date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={form.created}
          onChange={(e) => handleChange("created", e.target.value)}
        />

        {/* Due Date */}
        <TextField
          type="date"
          label="Due Date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={form.due}
          onChange={(e) => handleChange("due", e.target.value)}
        />

        {/* Actions */}
        <Box mt={2} display="flex" gap={2}>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>

          <Button
            variant="outlined"
            onClick={() => router.push("/QuestionsList")}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}