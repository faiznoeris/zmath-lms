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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AddIcon from "@mui/icons-material/Add";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

interface Material {
  id: number;
  title: string;
  type: "video" | "document" | "interactive" | "image";
  content_url: string;
  description?: string;
  lesson_id?: number;
  order_index: number;
  created_at: string;
}

// Supabase API calls
async function fetchMaterialsApi(): Promise<Material[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function deleteMaterialApi(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

async function updateMaterialApi(material: Material) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("materials")
    .update({
      title: material.title,
      type: material.type,
      content_url: material.content_url,
      description: material.description,
      order_index: material.order_index,
    })
    .eq("id", material.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export default function MaterialsListPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: materials, isLoading, error, isError } = useQuery({
    queryKey: ["materials"],
    queryFn: fetchMaterialsApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaterialApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setDeleteConfirmOpen(false);
      setSelectedId(null);
    },
  });

  const handleEdit = (material: Material) => {
    router.push(`/dashboard/teacher/materials/edit/${material.id}`);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "primary";
      case "document":
        return "secondary";
      case "interactive":
        return "success";
      case "image":
        return "info";
      default:
        return "default";
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
      field: "type",
      headerName: "Type",
      width: 130,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getTypeColor(params.value) as any}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
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
      field: "order_index",
      headerName: "Order",
      width: 90,
      sortable: true,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "content_url",
      headerName: "File",
      width: 80,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          color="primary"
          onClick={() => window.open(params.value, "_blank")}
          title="Open file"
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
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
              onClick={() => queryClient.invalidateQueries({ queryKey: ["materials"] })}
            >
              Retry
            </Button>
          }
        >
          Error loading materials: {error instanceof Error ? error.message : "Unknown error"}
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
          Materials
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            Materials
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your learning materials
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => window.location.href = "/dashboard/teacher/materials/add"}
        >
          Add Material
        </Button>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: "100%", bgcolor: "background.paper", borderRadius: 1 }}>
        <DataGrid
          rows={materials || []}
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
        <DialogTitle>Delete Material</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this material? This action cannot be undone.
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
