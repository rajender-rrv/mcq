"use client";

import { useState, useEffect, useMemo } from "react"; // ✅ FIX

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
  Paper
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

export default function UserProfilesMatdash() {
  const [users, setUsers] = useState<any[]>([]);
  const [profilesMaster, setProfilesMaster] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | "">("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const usersPerPage = 5;

  // ✅ Fetch data
  useEffect(() => {
    fetchUsers();
    fetchProfiles();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/matdash-nextjs/api/users");
    const data = await res.json();

    // 🛡️ ensure profiles exists
    const safeData = data.map((u: any) => ({
      ...u,
      profiles: u.profiles || [],
    }));

    setUsers(safeData);
  };

  const fetchProfiles = async () => {
    const res = await fetch("/matdash-nextjs/api/profiles");
    const data = await res.json();
    setProfilesMaster(data || []);
  };

  // ✅ Selected user
  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId]
  );

  // 🔍 Search
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // 📄 Pagination
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, page]);

  useEffect(() => setPage(1), [search]);

  // 🔥 GLOBAL assigned profiles
  const assignedProfileIds = useMemo(() => {
    return users.flatMap((u) =>
      (u.profiles || []).map((p: any) => p.id)
    );
  }, [users]);

  // ✅ Available profiles
  const availableProfiles = useMemo(() => {
    return profilesMaster.filter(
      (p) => !assignedProfileIds.includes(p.id)
    );
  }, [profilesMaster, assignedProfileIds]);

  // ➕ Assign profile
  const addProfile = async () => {
    if (!selectedProfileId || !selectedUserId) return;

    const res = await fetch("/matdash-nextjs/api/user-profile", {
      method: "POST",
      body: JSON.stringify({
        userId: selectedUserId,
        profileId: Number(selectedProfileId), // ✅ FIX
      }),
    });

    const profile = await res.json();

    if (profile.error) {
      alert(profile.error);
      return;
    }

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUserId
          ? {
              ...user,
              profiles: [...(user.profiles || []), profile],
            }
          : user
      )
    );

    setSelectedProfileId("");
  };

  // ❌ Remove profile
  const deleteProfile = async (profileId: number) => {
    await fetch("/matdash-nextjs/api/user-profile", {
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
              profiles: (user.profiles || []).filter(
                (p: any) => p.id !== profileId
              ),
            }
          : user
      )
    );
  };

  return (
    <Box p={3}>
	 <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        User to Profile Mapping
      </Typography>

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
                      secondary={`${(user.profiles || []).length} profiles`}
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
                  {(selectedUser.profiles || []).map((profile: any) => (
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

                  <Box display="flex" gap={2}>
                    <Select
                      fullWidth
                      size="small"
                      value={selectedProfileId}
                      displayEmpty
                      onChange={(e) =>
                        setSelectedProfileId(Number(e.target.value))
                      }
                    >
                      <MenuItem value="">Select Profile</MenuItem>

                      {availableProfiles.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.title}
                        </MenuItem>
                      ))}
                    </Select>

                    <Button
                      variant="contained"
                      onClick={addProfile}
                      disabled={
                        !selectedProfileId ||
                        availableProfiles.length === 0
                      }
                    >
                      Assign
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
	  </Paper>
    </Box>
  );
}