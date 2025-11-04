"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import QuizIcon from "@mui/icons-material/Quiz";

interface Question {
  id: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "essay";
  options?: string[];
  correct_answer?: string;
  order_index: number;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  time_limit_minutes?: number;
  course_id?: number;
  created_at: string;
  questions?: Question[];
}

// Supabase API calls
async function fetchQuizzesApi(): Promise<Quiz[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      *,
      questions (
        id,
        question_text,
        question_type,
        options,
        correct_answer,
        order_index
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function deleteQuizApi(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export default function QuizzesListPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: quizzes, isLoading, error, isError } = useQuery({
    queryKey: ["quizzes"],
    queryFn: fetchQuizzesApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuizApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setDeleteConfirmOpen(false);
      setSelectedId(null);
    },
  });

  const handleEdit = (quiz: Quiz) => {
    router.push(`/dashboard/teacher/quizzes/edit/${quiz.id}`);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedId) {
      deleteMutation.mutate(selectedId);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
      sortable: true,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
      sortable: true,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 250,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {params.value || "-"}
        </Box>
      ),
    },
    {
      field: "questions",
      headerName: "Questions",
      width: 120,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value?.length || 0}
          color="primary"
          size="small"
          icon={<QuizIcon />}
        />
      ),
    },
    {
      field: "time_limit_minutes",
      headerName: "Time Limit",
      width: 130,
      sortable: true,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? `${params.value} min` : "-"}
        </Typography>
      ),
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 120,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
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
            onClick={() => handleEdit(params.row)}
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row.id)}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["quizzes"] })}
            >
              Retry
            </Button>
          }
        >
          Error loading quizzes: {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
      </Box>
    );
  }

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
          Quizzes
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            Quizzes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your quizzes and questions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/teacher/quizzes/add")}
        >
          Add Quiz
        </Button>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: "100%", bgcolor: "background.paper", borderRadius: 1 }}>
        <DataGrid
          rows={quizzes || []}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#fafafa",
              borderBottom: "2px solid #e0e0e0",
              fontWeight: 600,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this quiz? This will also delete all associated questions. This action cannot be undone.
          </Typography>
          {deleteMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteMutation.error instanceof Error ? deleteMutation.error.message : "Delete failed"}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
