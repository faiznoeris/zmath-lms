"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Alert,
  Skeleton,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Lesson } from "../../../../models/Lesson";
import { Course } from "../../../../models/Course";

interface LessonWithCourse extends Lesson {
  courses?: Course;
}

// Fetch all lessons with course info
const fetchLessonsApi = async (): Promise<LessonWithCourse[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(`
      *,
      courses (
        id,
        title
      )
    `)
    .order("order_number", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

// Delete lesson
const deleteLessonApi = async (id: number): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export default function LessonsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

  // Fetch lessons
  const { data: lessons = [], isLoading, error } = useQuery({
    queryKey: ["lessons"],
    queryFn: fetchLessonsApi,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteLessonApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      setDeleteDialogOpen(false);
      setLessonToDelete(null);
    },
  });

  const handleDeleteClick = (id: number) => {
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
      field: "order_number",
      headerName: "Order",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          <Chip label={`#${params.value}`} color="primary" size="small" variant="outlined" />
        </Box>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 250,
    },
    {
      field: "courses",
      headerName: "Course",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          {params.value ? (
            <Chip label={params.value.title} color="success" size="small" />
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
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => router.push(`/dashboard/teacher/lessons/edit/${params.id}`)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(params.id as number)}
          showInMenu={false}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
        aria-label="breadcrumb"
      >
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard/teacher"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: "flex", alignItems: "center" }}>
          Lessons
        </Typography>
      </Breadcrumbs>

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
