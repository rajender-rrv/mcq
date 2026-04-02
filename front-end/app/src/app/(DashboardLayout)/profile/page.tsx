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
  name: string;
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

const defaultFilters: Record<keyof Invoice, string[]> = {
  id: [],
  name: [],
  to: [],
  cost: [],
  status: [],
  created: [],
  due: [],
};

// ✅ Tailwind-safe classes
const bgClassMap = [
  "bg-blue-100",
  "bg-yellow-100",
  "bg-green-100",
  "bg-red-100",
  "bg-gray-100",
];

const textClassMap = [
  "text-blue-600",
  "text-yellow-600",
  "text-green-600",
  "text-red-600",
  "text-gray-600",
];

export default function InvoicePage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Status | "All">("All");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState<keyof Invoice>("id");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [columnFilters, setColumnFilters] =
    useState<Record<keyof Invoice, string[]>>(defaultFilters);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeColumn, setActiveColumn] = useState<keyof Invoice | null>(null);
  const [filterSearch, setFilterSearch] = useState("");

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
		const res = await fetch("/matdash-nextjs/api/users/allusers");
        const result = await res.json();

        const users = Array.isArray(result?.results)
          ? result.results
          : Array.isArray(result)
          ? result
          : [];

        const formatted: Invoice[] = users.map((u: any, i: number) => ({
          id: u.id || i + 1,
          name: u.username || "N/A",
          to: u.email || "N/A",
          cost: Number(u.cost) || 0,
          status: ["Paid", "Overdue", "Pending", "Draft"].includes(u.status)
            ? u.status
            : "Draft",
          created: u.created_at || "2025-01-01",
          due: u.due_date || "2025-01-05",
        }));

        setData(formatted);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setSelected([]);
  }, [tab, columnFilters]);

  const getTabCount = (t: Status | "All") => {
    if (t === "All") return data.length;
    return data.filter((d) => d.status === t).length;
  };

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
    setFilterSearch("");
  };

  const handleCheckboxChange = (col: keyof Invoice, value: string) => {
    setColumnFilters((prev) => {
      const current = prev[col];
      return {
        ...prev,
        [col]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
    setPage(0);
  };

  const getFilteredValues = (col: keyof Invoice) => {
    const values = [...new Set(data.map((r) => String(r[col])))];
    return values.filter((val) =>
      val.toLowerCase().includes(filterSearch.toLowerCase())
    );
  };

  const parseDate = (str: string) => {
    const date = new Date(str);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const filtered = useMemo(() => {
    return data
      .filter((row) => (tab === "All" ? true : row.status === tab))
      .filter((row) =>
        Object.keys(columnFilters).every((col) => {
          const selectedVals = columnFilters[col as keyof Invoice];
          if (!selectedVals.length) return true;
          return selectedVals.includes(String((row as any)[col]));
        })
      )
      .sort((a, b) => {
        let A: any = a[orderBy];
        let B: any = b[orderBy];

        if (orderBy === "created" || orderBy === "due") {
          A = parseDate(A);
          B = parseDate(B);
        }

        return order === "asc"
          ? A > B
            ? 1
            : A < B
            ? -1
            : 0
          : A < B
          ? 1
          : A > B
          ? -1
          : 0;
      });
  }, [data, columnFilters, tab, order, orderBy]);

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const isAllSelected =
    paginated.length > 0 &&
    paginated.every((row) => selected.includes(row.id));

  const isIndeterminate =
    paginated.some((row) => selected.includes(row.id)) && !isAllSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = paginated.map((r) => r.id);
      setSelected((prev) => [...new Set([...prev, ...ids])]);
    } else {
      const ids = paginated.map((r) => r.id);
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    }
  };

  const handleClearFilters = () => {
    setColumnFilters(defaultFilters);
    setTab("All");
    setFilterSearch("");
    setPage(0);
    setSelected([]);
    setAnchorEl(null);
    setActiveColumn(null);
  };

  return (
    <>


      <Box p={3}>
	   <Paper sx={{ p: 3 }}>
	   <Typography variant="h6" mb={2}>
			Profile List
        </Typography>

	{/* Tabs */}
      <Box className="grid grid-cols-12 gap-6 mb-4">
        {["All", "Paid", "Overdue", "Pending", "Draft"].map((t, index) => (
          <Box
            key={t}
            className="lg:col-span-2 md:col-span-4 col-span-6 cursor-pointer"
            onClick={() => setTab(t as Status | "All")}
          >
            <Box
              className={`p-6 rounded-md text-center border ${
                bgClassMap[index]
              } ${tab === t ? "border-blue-500" : "border-gray-200"}`}
            >
              <h3 className={`text-2xl font-semibold ${textClassMap[index]}`}>
                {getTabCount(t as Status | "All")}
              </h3>
              <h6 className={`text-base font-medium ${textClassMap[index]}`}>
                {t}
              </h6>
            </Box>
          </Box>
        ))}
      </Box>
          {/* Buttons */}
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Button onClick={handleClearFilters} variant="outlined">
              Clear Filters
            </Button>

            <Link href="/profile/new">
              <Button variant="contained">Add Profile</Button>
            </Link>
          </Box>

          {loading ? (
            "Loading..."
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={(e) =>
                          handleSelectAll(e.target.checked)
                        }
                      />
                    </TableCell>

                    {Object.keys(defaultFilters).map((col) => (
                      <TableCell key={col}>
                        <Box display="flex" alignItems="center">
                          <TableSortLabel
                            active={orderBy === col}
                            direction={order}
                            onClick={() => handleSort(col as keyof Invoice)}
                          >
                            {col.toUpperCase()}
                          </TableSortLabel>

                          <IconButton
                            size="small"
                            onClick={(e) =>
                              handleFilterClick(
                                e,
                                col as keyof Invoice
                              )
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
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell padding="checkbox">
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
                        <TableCell>{row.name}</TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setPage(0);
                }}
              />

              {/* Filter Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <Box p={1}>
                  <TextField
                    size="small"
                    placeholder="Search..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    fullWidth
                  />
                </Box>

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
                          columnFilters[activeColumn].includes(val)
                        }
                      />
                      <ListItemText primary={val} />
                    </MenuItem>
                  ))}

                {activeColumn &&
                  getFilteredValues(activeColumn).length === 0 && (
                    <MenuItem disabled>No results</MenuItem>
                  )}
              </Menu>
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}