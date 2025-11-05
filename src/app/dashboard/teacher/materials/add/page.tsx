/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createClient } from "../../../../../utils/supabase/client";
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
  FormHelperText,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Lesson } from "../../../../../models/Lesson";

interface MaterialFormInputs {
  title: string;
  type: "video" | "document" | "interactive" | "image";
  description?: string;
  order_index?: number;
  lesson_id?: string;
}
interface Material {
  title: string;
  type: string;
  content_url: string;
  description?: string;
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

async function uploadMaterialApi(data: MaterialFormInputs & { file: File }) {
  const supabase = createClient();
  
  // Upload file to Supabase Storage
  const fileExt = data.file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `materials/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("lms")
    .upload(filePath, data.file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("lms")
    .getPublicUrl(filePath);

  // Insert material record into database
  const { data: material, error } = await supabase
    .from("materials")
    .insert([
      {
        title: data.title,
        type: data.type,
        content_url: urlData.publicUrl,
        description: data.description,
        order_index: data.order_index || 0,
        lesson_id: data.lesson_id || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return material;
}

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaterialFormInputs>({
    defaultValues: { type: "video", order_index: 0 },
  });

  // Fetch lessons
  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons"],
    queryFn: fetchLessonsApi,
  });

  const mutation = useMutation({
    mutationFn: uploadMaterialApi,
    onSuccess: (data) => {
      setMaterials((prev) => [...prev, data]);
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      // Redirect to materials list after successful upload
      window.location.href = "/dashboard/teacher/materials";
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
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }
    mutation.mutate({ ...data, file: selectedFile });
  };

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
          Add
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Upload Material
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload learning materials to Supabase Storage
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => window.location.href = "/dashboard/teacher/materials"}
          sx={{ mt: 2 }}
        >
          View All Materials
        </Button>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* File Upload */}
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ height: 56, justifyContent: "flex-start", textAlign: "left" }}
                >
                  {selectedFile ? selectedFile.name : "Choose File"}
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
              {mutation.isError && mutation.error instanceof Error && (
                <Alert severity="error">{mutation.error.message}</Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={mutation.isPending || !selectedFile}
                startIcon={mutation.isPending ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {mutation.isPending ? "Uploading..." : "Upload Material"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Recently Uploaded */}
      {materials.length > 0 && (
        <Card elevation={1} sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recently Uploaded
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {materials.map((mat, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {mat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {mat.type}
                  </Typography>
                  {mat.description && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {mat.description}
                    </Typography>
                  )}
                  <Button
                    size="small"
                    href={mat.content_url}
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    View File
                  </Button>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
