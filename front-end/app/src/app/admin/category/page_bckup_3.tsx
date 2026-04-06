"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Tabs,
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
  Menu,
  MenuItem,
  ListItemText,
  Button,
  Tooltip,
  TextField,
  Chip,
} from "@mui/material";

import FilterListIcon from "@mui/icons-material/FilterList";
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

const initialData: Invoice[] = [
  { id: 101, myname: "PineappleInc111.", to: "Redq Inc.", cost: 90, status: "Paid", created: "01 April 2025", due: "05 April 2025" },
  { id: 102, myname: "Pineapple.", to: "ME Inc.", cost: 120, status: "Overdue", created: "02 April 2025", due: "07 April 2025" },
  { id: 103, myname: "Incorporation.", to: "Redirwed.", cost: 60, status: "Pending", created: "03 April 2025", due: "08 April 2025" },
  { id: 104, myname: "PineappleTimes.", to: "RFc.", cost: 200, status: "Paid", created: "04 April 2025", due: "09 April 2025" },
  { id: 105, myname: "FortuneCreation", to: "Soft solution.", cost: 150, status: "Overdue", created: "05 April 2025", due: "10 April 2025" },
];

const statusColor = {
  Paid: "success",
  Overdue: "error",
  Pending: "warning",
  Draft: "default",
} as const;

export default function InvoicePage() {
  const [data, setData] = useState<Invoice[]>(initialData);
  const [tab, setTab] = useState<Status | "All">("All");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState<keyof Invoice>("id");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFilters] = useState<Record<keyof Invoice, any[]>>({
    id: [],
    myname: [],
    to: [],
    cost: [],
    status: [],
    created: [],
    due: [],
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeColumn, setActiveColumn] = useState<keyof Invoice | null>(null);
  const [filterSearch, setFilterSearch] = useState("");

  useEffect(() => {
    setPage(0);
    setSelected([]);
  }, [filters, tab]);

  const openMenu = (event: React.MouseEvent<HTMLElement>, column: keyof Invoice) => {
    setAnchorEl(event.currentTarget);
    setActiveColumn(column);
    setFilterSearch("");
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setActiveColumn(null);
  };

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

  const getFilteredValues = (column: keyof Invoice) => {
    const uniqueValues = Array.from(new Set(data.map((row) => row[column])));
    return uniqueValues
      .filter((val) => val !== null && val !== undefined)
      .filter((val) => String(val).toLowerCase().includes(filterSearch.toLowerCase()));
  };

  const handleFilterChange = (column: keyof Invoice, value: any) => {
    setFilters((prev) => {
      const current = prev[column] as any[];
      const exists = current.includes(value);
      return {
        ...prev,
        [column]: exists ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  const filtered = useMemo(() => {
    return data
      .filter((row) => {
        return (
          (tab === "All" || row.status === tab) &&
          (filters.id.length ? filters.id.includes(row.id) : true) &&
          (filters.myname.length ? filters.myname.includes(row.myname) : true) &&
          (filters.to.length ? filters.to.includes(row.to) : true) &&
          (filters.cost.length ? filters.cost.includes(row.cost) : true) &&
          (filters.status.length ? filters.status.includes(row.status) : true) &&
          (filters.created.length ? filters.created.includes(row.created) : true) &&
          (filters.due.length ? filters.due.includes(row.due) : true)
        );
      })
      .sort((a, b) => {
        let valueA: any = a[orderBy];
        let valueB: any = b[orderBy];

        if (orderBy === "created" || orderBy === "due") {
          valueA = parseDate(valueA);
          valueB = parseDate(valueB);
        }

        if (typeof valueA === "string") {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        return order === "asc" ? (valueA > valueB ? 1 : -1) : valueA < valueB ? 1 : -1;
      });
  }, [data, tab, filters, order, orderBy]);

  const paginated = useMemo(() => {
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const parsedData = results.data.map((row: any) => {
          const status: Status = ["Paid", "Overdue", "Pending", "Draft"].includes(row.status)
            ? (row.status as Status)
            : "Draft";

          return {
            id: Number(row.id),
            myname: row.myname,
            to: row.to,
            cost: Number(row.cost),
            status,
            created: row.created,
            due: row.due,
          } as Invoice;
        });
        setData((prev) => [...prev, ...parsedData]);
        e.target.value = "";
      },
      error: (err) => console.error("CSV Parse Error:", err),
    });
  };

  const getTabCount = (status: Status | "All") =>
    status === "All" ? data.length : data.filter((r) => r.status === status).length;

  const bgColors = ["lightprimary", "lightwarning", "lightsuccess", "lighterror", "default"];
  const tabColors = ["primary", "warning","success", "error", "default"];

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {/* Tabs */}
        <Box className="grid grid-cols-12 gap-6 mb-4">
          {["All", "Paid", "Overdue", "Pending", "Draft"].map((t, index) => (
            <Box key={t} className="lg:col-span-2 md:col-span-4 col-span-6 cursor-pointer" onClick={() => setTab(t as Status | "All")}>
              <Box className={`p-6 rounded-md bg-${bgColors[index]} text-center border ${tab === t ? "border-primary" : "border-gray-200"}`}>
                <h3 className={`text-2xl font-semibold text-${tabColors[index]}`}>{getTabCount(t as Status | "All")}</h3>
                <h6 className={`text-base font-medium text-${tabColors[index]}`}>{t}</h6>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Top Actions */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button
            variant="outlined"
            onClick={() =>
              setFilters({ id: [], myname: [], to: [], cost: [], status: [], created: [], due: [] })
            }
          >
            Clear Filters
          </Button>

          <Button variant="contained" component="label">
            Bulk Upload
            <input type="file" hidden accept=".csv" onChange={handleBulkUpload} />
          </Button>

           <Link href={`/QuestionsList/new`} passHref>
                  <IconButton color="primary">
                   New Question
                  </IconButton>
            </Link>

        </Box>

        {/* Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === paginated.length && paginated.length > 0}
                  indeterminate={selected.length > 0 && selected.length < paginated.length}
                  onChange={(e) =>
                    e.target.checked ? setSelected(paginated.map((row) => row.id)) : setSelected([])
                  }
                />
              </TableCell>

              {["id", "myname", "to", "cost", "status", "created", "due"].map((col) => (
                <TableCell key={col}>
                  <Box display="flex" alignItems="center">
                    <TableSortLabel
                      active={orderBy === col}
                      direction={order}
                      onClick={() => handleSort(col as keyof Invoice)}
                    >
                      {col.toUpperCase()}
                    </TableSortLabel>

                    <Tooltip title="Filter">
                      <IconButton
                        size="small"
                        onClick={(e) => openMenu(e, col as keyof Invoice)}
                        color={filters[col as keyof Invoice].length > 0 ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              ))}

              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No data found
                </TableCell>
              </TableRow>
            )}

            {paginated.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Checkbox checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)} />
                </TableCell>

                <TableCell>{row.id}</TableCell>
                <TableCell>{row.myname}</TableCell>
                <TableCell>{row.to}</TableCell>
                <TableCell>{row.cost}</TableCell>

                <TableCell>
                  <Chip label={row.status} color={statusColor[row.status]} size="small" />
                </TableCell>

                <TableCell>{row.created}</TableCell>
                <TableCell>{row.due}</TableCell>

                <TableCell>
                  <Link href={`/QuestionsList/${row.id}/edit`} passHref>
                    <IconButton color="primary">
                      <EditIcon />
                    </IconButton>
                  </Link>

                  <Link href={`/QuestionsList/${row.id}/preview`} passHref>
                    <IconButton color="info">
                      <VisibilityIcon />
                    </IconButton>
                  </Link>

                  <IconButton color="error" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Filter Menu */}
        <Menu
          key={activeColumn}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
          disableAutoFocusItem
          disableEnforceFocus
          PaperProps={{ sx: { width: 260, maxHeight: 320 } }}
        >
          <Box p={1} onKeyDown={(e) => e.stopPropagation()}>
            <TextField
              size="small"
              placeholder="Search..."
              fullWidth
              autoFocus
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </Box>

          {activeColumn &&
            getFilteredValues(activeColumn).map((value) => (
              <MenuItem key={value} onClick={() => handleFilterChange(activeColumn, value)}>
                <Checkbox checked={(filters[activeColumn] as any[]).includes(value)} />
                <ListItemText primary={String(value)} />
              </MenuItem>
            ))}

          {activeColumn && getFilteredValues(activeColumn).length === 0 && <MenuItem disabled>No results</MenuItem>}
        </Menu>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Paper>
    </Box>
  );
}