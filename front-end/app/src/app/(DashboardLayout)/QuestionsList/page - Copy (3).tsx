"use client";

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
  Typography,
  Menu,
  MenuItem,
  ListItemText,
  Checkbox as MUICheckbox,
  TextField,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";

type Status = "Paid" | "Overdue" | "Pending" | "Draft";

interface Invoice {
  id: number;
  question_text: string;
  to: string;
  cost: number;
  status: Status;
  created: string;
  due: string;
}

const statusColor = {
  Paid: "success",
  Overdue: "error",
  Pending: "warning",
  Draft: "default",
} as const;

export default function InvoicePage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Status | "All">("All");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState<keyof Invoice>("id");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // ✅ Checkbox filters
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
    id: [],
    question_text: [],
    to: [],
    cost: [],
    status: [],
    created: [],
    due: [],
  });

  // ✅ Filter popup
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeColumn, setActiveColumn] = useState<keyof Invoice | null>(null);
  const [filterSearch, setFilterSearch] = useState("");

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/matdash-nextjs/api/questions");
      const result = await res.json();
      const users = result.results || result;

      const formatted: Invoice[] = users.map((u: any, i: number) => ({
        id: u.id || i + 1,
        question_text: u.question_text || "N/A",
        to: u.email || "N/A",
        cost: Number(u.cost) || 0,
        status: ["Paid","Overdue","Pending","Draft"].includes(u.status)
          ? u.status
          : "Draft",
        created: u.created_at || "01 Jan 2025",
        due: u.due_date || "05 Jan 2025",
      }));

      setData(formatted);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSort = (col: keyof Invoice) => {
    const isAsc = orderBy === col && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(col);
  };

  const handleFilterClick = (
    e: React.MouseEvent<HTMLElement>,
    col: keyof Invoice
  ) => {
    setAnchorEl(e.currentTarget);
    setActiveColumn(col);
    setFilterSearch(""); // reset search
  };

  const handleCheckboxChange = (col: string, value: string) => {
    setColumnFilters((prev) => {
      const current = prev[col] || [];
      return {
        ...prev,
        [col]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const getFilteredValues = (col: keyof Invoice) => {
    const values = [...new Set(data.map((r) => String(r[col])))];
    return values.filter((val) =>
      val.toLowerCase().includes(filterSearch.toLowerCase())
    );
  };

  const parseDate = (str: string) => {
    const [d, m, y] = str.split(" ");
    return new Date(`${m} ${d}, ${y}`).getTime();
  };

  // ✅ FILTER + SORT
  const filtered = useMemo(() => {
    return data
      .filter((row) => (tab === "All" ? true : row.status === tab))

      .filter((row) => {
        return Object.keys(columnFilters).every((col) => {
          const selected = columnFilters[col];
          if (!selected.length) return true;
          return selected.includes(String((row as any)[col]));
        });
      })

      .sort((a, b) => {
        let A: any = a[orderBy];
        let B: any = b[orderBy];

        if (orderBy === "created" || orderBy === "due") {
          A = parseDate(A);
          B = parseDate(B);
        }

        return order === "asc" ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
      });
  }, [data, columnFilters, tab, order, orderBy]);

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box p={3}>
      <Typography variant="h6">Questions List</Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Box display="flex" gap={2} mb={2}>
          <Button onClick={() => setData([])}>Clear</Button>
        </Box>

        {loading ? (
          "Loading..."
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  {["id","question_text","to","cost","status","created","due"].map((col) => (
                    <TableCell key={col}>
                      <Box display="flex" alignItems="center">
                        <TableSortLabel
                          active={orderBy === col}
                          direction={order}
                          onClick={() => handleSort(col as any)}
                        >
                          {col.toUpperCase()}
                        </TableSortLabel>

                        <IconButton
                          size="small"
                          onClick={(e) =>
                            handleFilterClick(e, col as keyof Invoice)
                          }
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </Box>
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
                        onChange={() =>
                          setSelected((prev) =>
                            prev.includes(row.id)
                              ? prev.filter((x) => x !== row.id)
                              : [...prev, row.id]
                          )
                        }
                      />
                    </TableCell>

                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.question_text}</TableCell>
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
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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

            {/* ✅ FILTER MENU WITH SEARCH */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { maxHeight: 350, width: 260 } }}
            >
              {/* 🔍 Search box */}
              <Box p={1}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  fullWidth
                />
              </Box>

              {/* Checkbox list */}
              {activeColumn &&
                getFilteredValues(activeColumn).map((val) => (
                  <MenuItem
                    key={val}
                    onClick={() =>
                      handleCheckboxChange(activeColumn, val)
                    }
                  >
                    <MUICheckbox
                      checked={
                        columnFilters[activeColumn]?.includes(val) || false
                      }
                    />
                    <ListItemText primary={val} />
                  </MenuItem>
                ))}

              {/* Empty state */}
              {activeColumn &&
                getFilteredValues(activeColumn).length === 0 && (
                  <MenuItem disabled>No results</MenuItem>
                )}
            </Menu>
          </>
        )}
      </Paper>
    </Box>
  );
}