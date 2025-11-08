/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserRole } from "@/src/utils/auth";
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import {
  fetchPendingTeachersAction,
  approveTeacherAction,
  rejectTeacherAction,
  PendingTeacher,
} from "./actions";

export default function TeacherApprovalsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<PendingTeacher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchTeachers = async () => {
    try {
      const result = await fetchPendingTeachersAction();
      if (result.success && result.data) {
        setTeachers(result.data);
      } else {
        setError(result.error || "Gagal memuat guru yang menunggu persetujuan");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat guru yang menunggu persetujuan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkRoleAndFetch = async () => {
      const role = await getCurrentUserRole();

      if (!role) {
        router.push("/login");
        return;
      }

      if (role !== "admin") {
        router.push("/dashboard");
        return;
      }

      await fetchTeachers();
    };

    checkRoleAndFetch();
  }, [router]);

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    setError(null);
    setSuccess(null);

    try {
      const result = await approveTeacherAction(userId);
      if (result.success) {
        setSuccess("Guru berhasil disetujui!");
        setTeachers((prev) => prev.filter((t) => t.id !== userId));
      } else {
        setError(result.error || "Gagal menyetujui guru");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyetujui guru");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessingId(userId);
    setError(null);
    setSuccess(null);

    try {
      const result = await rejectTeacherAction(userId);
      if (result.success) {
        setSuccess("Pendaftaran guru ditolak");
        setTeachers((prev) => prev.filter((t) => t.id !== userId));
      } else {
        setError(result.error || "Gagal menolak guru");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menolak guru");
    } finally {
      setProcessingId(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "full_name",
      headerName: "Nama Lengkap",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "created_at",
      headerName: "Terdaftar",
      width: 180,
      valueFormatter: (value) => {
        return new Date(value).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Aksi",
      width: 150,
      getActions: (params) => {
        const isProcessing = processingId === params.id;
        return [
          <GridActionsCellItem
            key="approve"
            icon={<CheckIcon />}
            label="Setujui"
            disabled={isProcessing}
            onClick={() => handleApprove(params.id as string)}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="reject"
            icon={<CloseIcon />}
            label="Tolak"
            disabled={isProcessing}
            onClick={() => handleReject(params.id as string)}
            showInMenu={false}
          />,
        ];
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
          Dasbor
        </Link>
        <Typography color="text.primary">Persetujuan Guru</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Persetujuan Pendaftaran Guru
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Tinjau dan setujui pendaftaran guru yang menunggu persetujuan.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Card sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
        {teachers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              Tidak ada pendaftaran guru yang menunggu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Semua pendaftaran guru telah diproses.
            </Typography>
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Chip
                label={`${teachers.length} Menunggu Persetujuan`}
                color="warning"
              />
            </Stack>

            <Box sx={{ height: 600, width: "100%", backgroundColor: "white" }}>
              <DataGrid
                rows={teachers}
                columns={columns}
                loading={isLoading}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 25 },
                  },
                }}
                disableRowSelectionOnClick
              />
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
}
