"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Checkbox,
  IconButton,
  Paper,
  TableSortLabel,
  Button,
  Chip,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Papa = require("papaparse");

type Status = "Paid" | "Overdue" | "Pending" | "Draft";

interface Invoice {
  id: number;
  myname: string;
  to: string;
  cost: number;
  status: Status;
  created: string;
  due: string;
}

// ✅ Tailwind-safe mapping
const bgColorsMap: any = {
  All: "bg-lightprimary",
  Paid: "bg-lightsuccess",
  Overdue: "bg-lighterror",
  Pending: "bg-lightwarning",
  Draft: "bg-default",
};

const textColorsMap: any = {
  All: "text-primary",
  Paid: "text-success",
  Overdue: "text-error",
  Pending: "text-warning",
  Draft: "text-default",
};

const statusColor = {
  Paid: "success",
  Overdue: "error",
  Pending: "warning",
  Draft: "default",
} as const;

export default function InvoicePage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState<Status | "All">("All");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState<keyof Invoice>("id");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // ✅ FETCH DATA (FIXED)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await fetch("/matdash-nextjs/api/users/allusers");

        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        const result = await res.json(); // ✅ ONLY ONCE
        console.log("API:", result);

        const users = result.results || result;

        const formatted: Invoice[] = users.map((user: any, index: number) => ({
          id: user.id || index + 1,
          myname: user.name || user.username || "N/A",
          to: user.email || "N/A",
          cost: Number(user.cost) || 0,
          status: ["Paid", "Overdue", "Pending", "Draft"].includes(user.status)
            ? user.status
            : "Draft",
          created: user.created_at || "01 Jan 2025",
          due: user.due_date || "05 Jan 2025",
        }));

        setData(formatted);
      } catch (err) {
        console.error(err);
        setError("Failed to load users");
      } finally {
        setLoading(false); // ✅ IMPORTANT
      }
    };

    fetchUsers();
  }, []);

  // Reset page when tab changes
  useEffect(() => {
    setPage(0);
    setSelected([]);
  }, [tab]);

  // Sorting
  const handleSort = (column: keyof Invoice) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const parseDate = (str: string) => {
    const [day, month, year] = str.split(" ");
    const monthIndex = new Date(`${month} 1, 2000`).getMonth();
    return new Date(Number(year), monthIndex, Number(day)).getTime();
  };

  // Filter + Sort
  const filtered = useMemo(() => {
    return data
      .filter((row) => (tab === "All" ? true : row.status === tab))
      .sort((a, b) => {
        let valueA: any = a[orderBy];
        let valueB: any = b[orderBy];

        if (orderBy === "created" || orderBy === "due") {
          valueA = parseDate(valueA);
          valueB = parseDate(valueB);
        }

        if (valueA === valueB) return 0;

        return order === "asc"
          ? valueA > valueB ? 1 : -1
          : valueA < valueB ? 1 : -1;
      });
  }, [data, tab, order, orderBy]);

  const paginated = useMemo(() => {
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://127.0.0.1:8000/users/${id}/`, {
      method: "DELETE",
    });

    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleBulkUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results: any) => {
        const parsed = results.data.map((row: any, i: number) => ({
          id: Number(row.id) || Date.now() + i,
          myname: row.myname,
          to: row.to,
          cost: Number(row.cost) || 0,
          status: row.status || "Draft",
          created: row.created,
          due: row.due,
        }));
        setData((prev) => [...prev, ...parsed]);
      },
    });
  };

  const getTabCount = (status: Status | "All") =>
    status === "All"
      ? data.length
      : data.filter((r) => r.status === status).length;

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {/* Tabs */}
        <Box className="grid grid-cols-12 gap-6 mb-4">
          {["All", "Paid", "Overdue", "Pending", "Draft"].map((t) => (
            <Box
              key={t}
              className="lg:col-span-2 md:col-span-4 col-span-6 cursor-pointer"
              onClick={() => setTab(t as any)}
            >
              <Box
                className={`p-6 rounded-md text-center border 
                ${bgColorsMap[t]} 
                ${tab === t ? "border-primary" : "border-gray-200"}`}
              >
                <h3 className={`text-2xl font-semibold ${textColorsMap[t]}`}>
                  {getTabCount(t as any)}
                </h3>
                <h6 className={`text-base font-medium ${textColorsMap[t]}`}>
                  {t}
                </h6>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Actions */}
        <Box display="flex" gap={2} mb={2}>
          <Button onClick={() => setData([])}>Clear Data</Button>

          <Button component="label" variant="contained">
            Bulk Upload
            <input hidden type="file" onChange={handleBulkUpload} />
          </Button>
        </Box>

        {/* Loading / Error */}
        {loading && <Box textAlign="center">Loading...</Box>}
        {error && <Box color="error.main">{error}</Box>}

        {/* Table */}
        {!loading && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                {["id","myname","to","cost","status","created","due"].map((col) => (
                  <TableCell key={col}>
                    <TableSortLabel
                      active={orderBy === col}
                      direction={order}
                      onClick={() => handleSort(col as any)}
                    >
                      {col.toUpperCase()}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                    />
                  </TableCell>

                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.myname}</TableCell>
                  <TableCell>{row.to}</TableCell>
                  <TableCell>{row.cost}</TableCell>

                  <TableCell>
                    <Chip
                      label={row.status}
                      color={statusColor[row.status]}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>{row.created}</TableCell>
                  <TableCell>{row.due}</TableCell>

                  <TableCell>
                    <IconButton><EditIcon /></IconButton>
                    <IconButton><VisibilityIcon /></IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(row.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) =>
            setRowsPerPage(parseInt(e.target.value))
          }
        />
      </Paper>
    </Box>
  );
}