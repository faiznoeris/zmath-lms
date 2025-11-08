/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserRole } from "@/src/utils/auth";
import {
  Box,
  Card,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { fetchAllUsersAction, FormattedUser } from "./actions";

type UserData = FormattedUser;

export default function UsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    const checkRoleAndFetchUsers = async () => {
      const role = await getCurrentUserRole();

      if (!role) {
        router.push("/login");
        return;
      }

      if (role !== "admin") {
        router.push("/dashboard");
        return;
      }

      try {
        const result = await fetchAllUsersAction();
        if (result.success && result.data) {
          setUsers(result.data);
          setFilteredUsers(result.data);
        } else {
          setError(result.error || "Failed to fetch users");
        }
      } catch (err) {
        setError("An error occurred while fetching users");
      } finally {
        setIsLoading(false);
      }
    };

    checkRoleAndFetchUsers();
  }, [router]);

  useEffect(() => {
    if (roleFilter === "all") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.role === roleFilter));
    }
  }, [roleFilter, users]);

  const columns: GridColDef[] = [
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "full_name",
      headerName: "Full Name",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (params) => {
        const roleColors: { [key: string]: "primary" | "success" | "warning" } =
          {
            admin: "warning",
            teacher: "primary",
            student: "success",
          };
        return (
          <Chip
            label={params.value}
            color={roleColors[params.value] || "default"}
            size="small"
          />
        );
      },
    },
    {
      field: "is_approved",
      headerName: "Approval Status",
      width: 150,
      renderCell: (params) => {
        if (params.row.role !== "teacher") {
          return <Typography variant="body2">N/A</Typography>;
        }
        if (params.value === true) {
          return <Chip label="Approved" color="success" size="small" />;
        }
        if (params.value === false || params.value === null) {
          return <Chip label="Pending" color="warning" size="small" />;
        }
        return <Typography variant="body2">-</Typography>;
      },
    },
    {
      field: "created_at",
      headerName: "Registered",
      width: 180,
      valueFormatter: (value) => {
        return new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, margin: "0 auto", padding: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          color="inherit"
          onClick={() => router.push("/dashboard")}
        >
          <AdminPanelSettingsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary">Users</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        User Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View and manage all users in the system.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            select
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200, backgroundColor: "white" }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="student">Students</MenuItem>
            <MenuItem value="teacher">Teachers</MenuItem>
            <MenuItem value="admin">Admins</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ height: 600, width: "100%", backgroundColor: "white" }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            disableRowSelectionOnClick
          />
        </Box>
      </Card>
    </Box>
  );
}
