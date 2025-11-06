"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchLessons, deleteLesson } from "@/src/services/lesson.service";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Alert,
  Skeleton,
  IconButton,
} from "@mui/material";
import { Breadcrumbs } from "@/src/components";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export default function LessonsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);

  // Fetch lessons
  const { data: lessons = [], isLoading, error } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const result = await fetchLessons();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteLesson(id);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      setDeleteDialogOpen(false);
      setLessonToDelete(null);
    },
  });

  const handleDeleteClick = (id: string) => {
    setLessonToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (lessonToDelete !== null) {
      deleteMutation.mutate(lessonToDelete);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 250,
    },
    {
      field: "course",
      headerName: "Course",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          {params.row.course ? (
            <Chip label={params.row.course.title} color="primary" size="small" />
          ) : (
            <Chip label="No Course" color="default" size="small" />
          )}
        </Box>
      ),
    },
    {
      field: "content",
      headerName: "Content",
      flex: 1.5,
      minWidth: 300,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          {params.value ? (
            <Typography variant="body2" noWrap>
              {params.value.substring(0, 100)}...
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No content
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 180,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
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
            onClick={() => router.push(`/dashboard/teacher/lessons/edit/${params.id}`)}
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.id as string)}
            title="Delete"
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
          { label: "Dashboard", href: "/dashboard" },
          { label: "Lessons" },
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
            <MenuBookIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: 36 }} />
            Lessons Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all lessons in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/teacher/lessons/add")}
          size="large"
        >
          Add Lesson
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading lessons: {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
      )}

      {/* DataGrid */}
      {isLoading ? (
        <Box sx={{ height: 400 }}>
          <Skeleton variant="rectangular" height="100%" />
        </Box>
      ) : (
        <DataGrid
          rows={lessons}
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this lesson? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
