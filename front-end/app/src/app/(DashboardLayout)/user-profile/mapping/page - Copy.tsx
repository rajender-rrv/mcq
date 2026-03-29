"use client";

// Matdash-based User → Profiles (One-to-Many UI)
// Assumes you already installed Matdash template + MUI setup

import { useState } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function UserProfilesMatdash() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      profiles: [
        { id: 1, title: "Admin" },
        { id: 2, title: "Editor" },
      ],
    },
    {
      id: 2,
      name: "Jane Smith",
      profiles: [{ id: 3, title: "Viewer" }],
    },
	 {
      id: 3,
      name: "Mark",
      profiles: [{ id: 4, title: "Hello" }],
    },
	 {
      id: 4,
      name: "Jane Smith",
      profiles: [{ id: 5, title: "Viewer" },{ id: 15, title: "Viewer 2222" }],
    },
	 {
      id: 5,
      name: "Mark",
      profiles: [{ id: 6, title: "Hello" }],
    },
	 {
      id: 6,
      name: "Jane Smith",
      profiles: [{ id: 7, title: "Viewer" }],
    },
	 {
      id: 7,
      name: "Mark",
      profiles: [{ id: 8, title: "Hello" }],
    }, {
      id: 8,
      name: "Jane Smith",
      profiles: [{ id: 9, title: "Viewer" }],
    },
	 {
      id: 9,
      name: "Mark",
      profiles: [{ id: 10, title: "Hello" }],
    }, {
      id: 10,
      name: "Jane Smith",
      profiles: [{ id: 11, title: "Viewer" }],
    },
	 {
      id: 11,
      name: "Mark",
      profiles: [{ id: 12, title: "Hello" }],
    },
  ]);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newProfile, setNewProfile] = useState("");

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const addProfile = () => {
    if (!newProfile || !selectedUserId) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUserId
          ? {
              ...user,
              profiles: [
                ...user.profiles,
                { id: Date.now(), title: newProfile },
              ],
            }
          : user
      )
    );

    setNewProfile("");
  };

  const deleteProfile = (profileId) => {
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
      {/* Users */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Users
            </Typography>

            <List>
              {users.map((user) => (
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
          </CardContent>
        </Card>
      </Grid>

      {/* Profiles */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Profiles
            </Typography>

            {!selectedUser ? (
              <Typography color="text.secondary">
                Select a user to view profiles
              </Typography>
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

                {/* Add Profile */}
                <Box display="flex" gap={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="New Profile"
                    value={newProfile}
                    onChange={(e) => setNewProfile(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={addProfile}
                  >
                    Add
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
