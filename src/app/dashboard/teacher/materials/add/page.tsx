"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createClient } from "../../../../../utils/supabase/client";
import { fetchLessons } from "@/src/services/lesson.service";
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
  FormHelperText,
} from "@mui/material";
import { Breadcrumbs } from "@/src/components";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Material } from "@/src/models/Material";
import { detectMaterialType } from "@/src/utils/materialHelpers";
import { formatYouTubeUrl } from "@/src/utils/youtube";

interface MaterialFormInputs {
  title: string;
  description?: string;
  lesson_id?: string;
  youtube_url?: string;
}

async function uploadMaterialApi(data: MaterialFormInputs & { file?: File; isYouTube?: boolean }) {
  const supabase = createClient();
  
  let content_url = "";
  let type: "video" | "document" = "document";
  
  // Handle YouTube URL
  if (data.isYouTube && data.youtube_url) {
    const formattedUrl = formatYouTubeUrl(data.youtube_url);
    if (!formattedUrl) {
      throw new Error("Invalid YouTube URL");
    }
    content_url = formattedUrl;
    type = "video";
  }
  // Handle file upload
  else if (data.file) {
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

    content_url = urlData.publicUrl;
    type = detectMaterialType(data.file);
  } else {
    throw new Error("Please provide either a file or YouTube URL");
  }

  // Insert material record into database
  const { data: material, error } = await supabase
    .from("materials")
    .insert([
      {
        title: data.title,
        type: type,
        content_url: content_url,
        description: data.description,
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
  const [uploadMode, setUploadMode] = useState<"file" | "youtube">("file");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaterialFormInputs>({
    defaultValues: {},
  });

  // Fetch lessons
  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const result = await fetchLessons();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: uploadMaterialApi,
    onSuccess: (data) => {
      setMaterials((prev) => [...prev, data]);
      reset();
      setSelectedFile(null);
      setUploadMode("file");
      // Redirect to materials list after successful upload
      window.location.href = "/dashboard/teacher/materials";
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const onSubmit = (data: MaterialFormInputs) => {
    const submitData = {
      ...data,
      lesson_id: selectedLessonId || undefined,
    };
    
    if (uploadMode === "youtube") {
      if (!data.youtube_url) {
        alert("Please enter a YouTube URL");
        return;
      }
      mutation.mutate({ ...submitData, isYouTube: true });
    } else {
      if (!selectedFile) {
        alert("Please select a file to upload");
        return;
      }
      mutation.mutate({ ...submitData, file: selectedFile });
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Materials", href: "/dashboard/teacher/materials" },
          { label: "Add" },
        ]}
      />

      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Upload Material
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload documents (PDF, DOC, PPT) or add YouTube video links
        </Typography>
      </Box>

      <Card elevation={2}>
        <CardContent>
          {/* Upload Mode Selector */}
          <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
            <Button
              variant={uploadMode === "file" ? "contained" : "outlined"}
              onClick={() => {
                setUploadMode("file");
                reset();
                setSelectedFile(null);
              }}
              fullWidth
            >
              Upload Document
            </Button>
            <Button
              variant={uploadMode === "youtube" ? "contained" : "outlined"}
              onClick={() => {
                setUploadMode("youtube");
                reset();
                setSelectedFile(null);
              }}
              fullWidth
            >
              Add YouTube Video
            </Button>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* File Upload or YouTube URL */}
              {uploadMode === "file" ? (
                <Box>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ height: 56, justifyContent: "flex-start", textAlign: "left" }}
                  >
                    {selectedFile ? selectedFile.name : "Choose Document (PDF, DOC, PPT)"}
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    />
                  </Button>
                  {selectedFile && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      Type: {selectedFile.type || 'Unknown'} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  )}
                </Box>
              ) : (
                <TextField
                  label="YouTube URL"
                  fullWidth
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  error={!!errors.youtube_url}
                  helperText={errors.youtube_url?.message || "Enter a valid YouTube video URL"}
                  {...register("youtube_url", { 
                    required: uploadMode === "youtube" ? "YouTube URL is required" : false,
                    validate: (value) => {
                      if (uploadMode === "youtube" && value) {
                        const formatted = formatYouTubeUrl(value);
                        return formatted !== null || "Invalid YouTube URL format";
                      }
                      return true;
                    }
                  })}
                />
              )}

              {/* Title */}
              <TextField
                label="Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title", { required: "Title is required" })}
              />

              {/* Lesson Selection */}
              <FormControl fullWidth>
                <InputLabel>Lesson (Optional)</InputLabel>
                <Select
                  label="Lesson (Optional)"
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None - No Lesson Assigned</em>
                  </MenuItem>
                  {lessons.map((lesson) => (
                    <MenuItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
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

              {/* Error Message */}
              {mutation.isError && mutation.error instanceof Error && (
                <Alert severity="error">{mutation.error.message}</Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={mutation.isPending || (uploadMode === "file" && !selectedFile)}
                startIcon={mutation.isPending ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {mutation.isPending ? "Uploading..." : uploadMode === "youtube" ? "Add Video" : "Upload Document"}
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
