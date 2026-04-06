"use client";

import { Box } from "@mui/material";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ width: 250, bgcolor: "#1e293b", color: "#fff", p: 2 }}>
        <h3>Admin Panel</h3>
        <ul>
          <li><a href="/admin">Dashboard</a></li>
          <li><a href="/admin/users">Users</a></li>
          <li><a href="/admin/tests">Tests</a></li>
        </ul>
      </Box>

      <Box sx={{ flex: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
