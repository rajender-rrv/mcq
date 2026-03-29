"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  Box,
  IconButton,
  Divider,
  Pagination,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function UserProfilesMatdash() {
  const [users, setUsers] = useState([]);
  const [profilesMaster, setProfilesMaster] = useState([]); // ✅ all available profiles
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const usersPerPage = 5;

  // ✅ Fetch users + profiles
  useEffect(() => {
    fetchUsers();
    fetchProfiles();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/matdash-nextjs/api/users");
    const data = await res.json();
    setUsers(data);
  };

  const fetchProfiles = async () => {
    const res = await fetch("/matdash-nextjs/api/profiles");
    const data = await res.json();
    setProfilesMaster(data);
  };

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId]
  );

  // 🔍 Filter users
  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  // 📄 Pagination
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, page]);

  useEffect(() => setPage(1), [search]);

  // 🎯 Available profiles (exclude already assigned)
  const availableProfiles = useMemo(() => {
    if (!selectedUser) return [];

    return profilesMaster.filter(
      (p) => !selectedUser.profiles.some((sp) => sp.id === p.id)
    );
  }, [profilesMaster, selectedUser]);

  // ➕ Assign existing profile
  const addProfile = async () => {
    if (!selectedProfileId || !selectedUserId) return;

    const res = await fetch("/matdash-nextjs/api/user-profile", {
      method: "POST",
      body: JSON.stringify({
        userId: selectedUserId,
        profileId: selectedProfileId,
      }),
    });

    const profile = await res.json();

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUserId
          ? {
              ...user,
              profiles: [...user.profiles, profile],
            }
          : user
      )
    );

    setSelectedProfileId("");
  };

  // ❌ Remove mapping
  const deleteProfile = async (profileId) => {
    await fetch(`/matdash-nextjs/api/user-profile`, {
      method: "DELETE",
      body: JSON.stringify({
        userId: selectedUserId,
        profileId,
      }),
    });

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUserId
          ? {
              ...user,
              profiles: user.profiles.filter((p) => p.id !== profileId),
            }
          : user
      )
    );
  };

  return (
    <Grid container spacing={3}>
      {/* USERS */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Users</Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ my: 2 }}
            />

            <List>
              {paginatedUsers.map((user) => (
                <ListItemButton
                  key={user.id}
                  selected={selectedUserId === user.id}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <ListItemText
                    primary={user.name}
                    secondary={`${user.profiles.length} profiles`}
                  />
                </ListItemButton>
              ))}
            </List>

            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={Math.ceil(filteredUsers.length / usersPerPage)}
                page={page}
                onChange={(e, val) => setPage(val)}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* PROFILES */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              {selectedUser
                ? `${selectedUser.name}'s Profiles`
                : "Profiles"}
            </Typography>

            {!selectedUser ? (
              <Typography>Select a user</Typography>
            ) : (
              <>
                {selectedUser.profiles.map((profile) => (
                  <Box
                    key={profile.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                    p={1}
                    border="1px solid #eee"
                    borderRadius={2}
                  >
                    <Typography>{profile.title}</Typography>
                    <IconButton
                      color="error"
                      onClick={() => deleteProfile(profile.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* ✅ Select Existing Profile */}
                <Box display="flex" gap={2}>
                  <Select
                    fullWidth
                    size="small"
                    value={selectedProfileId}
                    displayEmpty
                    onChange={(e) =>
                      setSelectedProfileId(e.target.value)
                    }
                  >
                    <MenuItem value="">Select Profile</MenuItem>
                    {availableProfiles.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.title}
                      </MenuItem>
                    ))}
                  </Select>

                  <Button variant="contained" onClick={addProfile}>
                    Assign
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}