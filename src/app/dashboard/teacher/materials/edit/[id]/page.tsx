"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "../../../../../../utils/supabase/client";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Breadcrumbs,
  Link,
  Skeleton,
  FormHelperText,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Lesson } from "../../../../../../models/Lesson";

interface Material {
  id: number;
  title: string;
  type: "video" | "document" | "interactive" | "image";
  content_url: string;
  description?: string;
  order_index: number;
  lesson_id?: string;
}

interface MaterialFormInputs {
  title: string;
  type: "video" | "document" | "interactive" | "image";
  description?: string;
  order_index: number;
  lesson_id?: string;
}

// Fetch all lessons
const fetchLessonsApi = async (): Promise<Lesson[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .order("order_number", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

// Fetch single material
async function fetchMaterialApi(id: string): Promise<Material> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Update material
async function updateMaterialApi(id: string, material: MaterialFormInputs & { file?: File }) {
  const supabase = createClient();
  
  let content_url = material.file ? "" : undefined;

  // If there's a new file, upload it
  if (material.file) {
    const fileExt = material.file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `materials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("lms")
      .upload(filePath, material.file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("lms")
      .getPublicUrl(filePath);

    content_url = urlData.publicUrl;
  }

  // Update material record
  const updateData: any = {
    title: material.title,
    type: material.type,
    description: material.description,
    order_index: material.order_index,
    lesson_id: material.lesson_id || null,
  };

  if (content_url) {
    updateData.content_url = content_url;
  }

  const { data, error } = await supabase
    .from("materials")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export default function EditMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const materialId = params.id as string;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<MaterialFormInputs>({
    defaultValues: { type: "video", order_index: 0 },
  });

  // Fetch lessons
  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons"],
    queryFn: fetchLessonsApi,
  });

  // Fetch material data
  const { data: material, isLoading, error, isError } = useQuery({
    queryKey: ["material", materialId],
    queryFn: () => fetchMaterialApi(materialId),
    enabled: !!materialId,
  });

  // Update form when material data is loaded
  useEffect(() => {
    if (material) {
      setValue("title", material.title);
      setValue("type", material.type);
      setValue("description", material.description || "");
      setValue("order_index", material.order_index);
      setValue("lesson_id", material.lesson_id || "");
    }
  }, [material, setValue]);

  const mutation = useMutation({
    mutationFn: (data: MaterialFormInputs & { file?: File }) => updateMaterialApi(materialId, data),
    onSuccess: () => {
      router.push("/dashboard/teacher/materials");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const onSubmit = (data: MaterialFormInputs) => {
    mutation.mutate({ ...data, file: selectedFile || undefined });
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Alert severity="error">
          Error loading material: {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push("/dashboard/teacher/materials")}
          sx={{ mt: 2 }}
        >
          Back to Materials
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
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
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard/teacher/materials"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          Materials
        </Link>
        <Typography color="text.primary" sx={{ display: "flex", alignItems: "center" }}>
          Edit
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Edit Material
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update material information and optionally replace the file
        </Typography>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Current File Info */}
              <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current File
                </Typography>
                <Link
                  href={material?.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ wordBreak: "break-all" }}
                >
                  {material?.content_url}
                </Link>
              </Box>

              {/* File Upload (Optional) */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Replace File (Optional)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ height: 56, justifyContent: "flex-start", textAlign: "left" }}
                >
                  {selectedFile ? selectedFile.name : "Choose New File"}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                  />
                </Button>
                {previewUrl && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }}
                    />
                  </Box>
                )}
              </Box>

              {/* Title */}
              <TextField
                label="Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title", { required: "Title is required" })}
              />

              {/* Type */}
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  defaultValue="video"
                  {...register("type")}
                >
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="interactive">Interactive</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                </Select>
              </FormControl>

              {/* Lesson Selection */}
              <FormControl fullWidth>
                <InputLabel>Lesson (Optional)</InputLabel>
                <Select
                  label="Lesson (Optional)"
                  defaultValue=""
                  {...register("lesson_id")}
                >
                  <MenuItem value="">
                    <em>None - No Lesson Assigned</em>
                  </MenuItem>
                  {lessons.map((lesson) => (
                    <MenuItem key={lesson.id} value={lesson.id}>
                      {lesson.title} (Order #{lesson.order_number})
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Assign this material to a specific lesson</FormHelperText>
              </FormControl>

              {/* Description */}
              <TextField
                label="Description (Optional)"
                fullWidth
                multiline
                rows={3}
                {...register("description")}
              />

              {/* Order Index */}
              <TextField
                label="Order Index"
                fullWidth
                type="number"
                defaultValue={0}
                {...register("order_index", { valueAsNumber: true })}
              />

              {/* Error Message */}
              {mutation.isError && (
                <Alert severity="error">
                  {mutation.error instanceof Error ? mutation.error.message : "Update failed"}
                </Alert>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={mutation.isPending}
                  startIcon={mutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                  fullWidth
                >
                  {mutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/dashboard/teacher/materials")}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
