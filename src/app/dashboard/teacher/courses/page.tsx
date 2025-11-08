"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Skeleton,
  IconButton,
} from "@mui/material";
import { Breadcrumbs } from "@/src/components";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School";
import { fetchCourses, deleteCourse } from "@/src/services/course.service";

export default function CoursesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  // Fetch courses
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const result = await fetchCourses();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch courses");
      }
      return result.data || [];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCourse(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete course");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
  });

  const handleDeleteClick = (id: string) => {
    setCourseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (courseToDelete !== null) {
      deleteMutation.mutate(courseToDelete);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      renderCell: (params) => (
        <Box sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {String(params.value).substring(0, 8)}...
        </Box>
      ),
    },
    {
      field: "title",
      headerName: "Judul",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "description",
      headerName: "Deskripsi",
      flex: 1.5,
      minWidth: 300,
      renderCell: (params) => (
        <>
          {params.value || <Typography variant="body2" color="text.secondary">Tidak ada deskripsi</Typography>}
        </>
      ),
    },
    {
      field: "created_at",
      headerName: "Dibuat Pada",
      width: 180,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Aksi",
      width: 120,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ 
          display: "flex", 
          gap: 0.5, 
          justifyContent: "center", 
          alignItems: "center",
          height: "100%",
          width: "100%"
        }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => router.push(`/dashboard/teacher/courses/edit/${params.id}`)}
            title="Ubah"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.id as string)}
            title="Hapus"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          
          { label: "Kursus" },
        ]}
      />

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            <SchoolIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: 36 }} />
            Manajemen Kursus
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kelola semua kursus dalam sistem
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/teacher/courses/add")}
          size="large"
        >
          Tambah Kursus
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Kesalahan memuat kursus: {error instanceof Error ? error.message : "Kesalahan tidak diketahui"}
        </Alert>
      )}

      {/* DataGrid */}
      {isLoading ? (
        <Box sx={{ height: 400 }}>
          <Skeleton variant="rectangular" height="100%" />
        </Box>
      ) : (
        <DataGrid
          rows={courses}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            "& .MuiDataGrid-cell": {
              py: 1,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "action.hover",
            },
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus kursus ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
            Batal
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
