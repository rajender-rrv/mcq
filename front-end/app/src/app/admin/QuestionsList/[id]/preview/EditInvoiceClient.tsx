"use client";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper
} from "@mui/material";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ✅ SAME DATA AS TABLE
const initialData = [
  { id: 101, from: "PineappleInc111.", to: "Redq Inc.", cost: 90 },
  { id: 102, from: "Pineapple.", to: "ME Inc.", cost: 90 },
  { id: 103, from: "Incorporation.", to: "Redirwed.", cost: 90 },
  { id: 104, from: "PineappleTimes.", to: "RFc.", cost: 90 },
  { id: 105, from: "FortuneCreation", to: "Soft solution.", cost: 90 }
];

export default function EditInvoiceClient({ id }: { id: string }) {
  const router = useRouter();

  const [form, setForm] = useState({
    from: "",
    to: "",
    cost: ""
  });

  // ✅ DEBUG
  console.log("ID:", id);

  // ✅ LOAD DATA
  useEffect(() => {
    if (!id) return;

    const invoice = initialData.find(
      (item) => item.id.toString() === id
    );

    if (invoice) {
      setForm({
        from: invoice.from,
        to: invoice.to,
        cost: invoice.cost.toString()
      });
    }
  }, [id]);

  // ✅ UPDATE
  const handleUpdate = () => {
    const updatedData = initialData.map((item) =>
      item.id.toString() === id
        ? { ...item, ...form, cost: Number(form.cost) }
        : item
    );

   // console.log("Updated Data:", updatedData);

    //alert("Updated successfully ✅");

    router.push("/QuestionsList");
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Edit Invoice #{id}
        </Typography>

        <TextField
          label="From disabled"
          fullWidth
          margin="normal"
          value={form.from}
          disabled
          onChange={(e) =>
            setForm({ ...form, from: e.target.value })
          }
        />

        <TextField
          label="To Readonly"
          fullWidth
          margin="normal"
          value={form.to}
          disabled
          onChange={(e) =>
            setForm({ ...form, to: e.target.value })
          }
        />

        <TextField
          label="Cost"
          fullWidth
          margin="normal"
          value={form.cost}
          disabled
          onChange={(e) =>
            setForm({ ...form, cost: e.target.value })
          }
        />

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleUpdate}
        >
          Back to List
        </Button>
      </Paper>
    </Box>
  );
}