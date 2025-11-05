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
import SchoolIcon from "@mui/icons-material/School";
import { Course } from "../../../../models/Course";

// Fetch all courses
const fetchCoursesApi = async (): Promise<Course[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

// Delete course
const deleteCourseApi = async (id: number): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export default function CoursesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);

  // Fetch courses
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCoursesApi,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCourseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
  });

  const handleDeleteClick = (id: number) => {
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
      width: 80,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      minWidth: 300,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          {params.value || <Typography variant="body2" color="text.secondary">No description</Typography>}
        </Box>
      ),
    },
    {
      field: "teacher_id",
      headerName: "Teacher",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          {params.value ? (
            <Chip label="Assigned" color="success" size="small" />
          ) : (
            <Chip label="Unassigned" color="default" size="small" />
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
          onClick={() => router.push(`/dashboard/teacher/courses/edit/${params.id}`)}
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
          Courses
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
            <SchoolIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: 36 }} />
            Courses Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all courses in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/teacher/courses/add")}
          size="large"
        >
          Add Course
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading courses: {error instanceof Error ? error.message : "Unknown error"}
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this course? This action cannot be undone.
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
