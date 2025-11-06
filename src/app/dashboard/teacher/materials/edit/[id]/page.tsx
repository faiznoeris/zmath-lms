/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "../../../../../../utils/supabase/client";
import { fetchLessons } from "@/src/services/lesson.service";
import { fetchMaterialById } from "@/src/services/material.service";
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
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { detectMaterialType } from "@/src/utils/materialHelpers";
import { formatYouTubeUrl } from "@/src/utils/youtube";

interface MaterialFormInputs {
  title: string;
  description?: string;
  lesson_id?: string;
  youtube_url?: string;
}

// Update material
async function updateMaterialApi(id: string, material: MaterialFormInputs & { file?: File; isYouTube?: boolean; currentType?: string }) {
  const supabase = createClient();
  
  let content_url: string | undefined = undefined;
  let type: "video" | "document" | undefined = undefined;

  // Handle YouTube URL update
  if (material.isYouTube && material.youtube_url) {
    const formattedUrl = formatYouTubeUrl(material.youtube_url);
    if (!formattedUrl) {
      throw new Error("Invalid YouTube URL");
    }
    content_url = formattedUrl;
    type = "video";
  }
  // Handle file upload
  else if (material.file) {
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
    type = detectMaterialType(material.file);
  }

  // Update material record
  const updateData: any = {
    title: material.title,
    description: material.description,
    lesson_id: material.lesson_id || null,
  };

  if (content_url) {
    updateData.content_url = content_url;
  }
  
  if (type) {
    updateData.type = type;
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
  const [uploadMode, setUploadMode] = useState<"file" | "youtube" | "keep">("keep");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<MaterialFormInputs>({
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

  // Fetch material data
  const { data: material, isLoading, error, isError } = useQuery({
    queryKey: ["material", materialId],
    queryFn: async () => {
      const result = await fetchMaterialById(materialId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!materialId,
  });

  // Update form when material data is loaded
  useEffect(() => {
    if (material) {
      setValue("title", material.title);
      setValue("description", material.description || "");
      setSelectedLessonId(material.lesson_id || "");
      if (material.type === "video" && material.content_url.includes("youtube")) {
        setValue("youtube_url", material.content_url);
        setUploadMode("youtube");
      }
    }
  }, [material, setValue]);

  const mutation = useMutation({
    mutationFn: (data: MaterialFormInputs & { file?: File; isYouTube?: boolean; currentType?: string }) => 
      updateMaterialApi(materialId, data),
    onSuccess: () => {
      router.push("/dashboard/teacher/materials");
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
      mutation.mutate({ ...submitData, isYouTube: true, currentType: material?.type });
    } else if (uploadMode === "file") {
      if (!selectedFile) {
        alert("Please select a file to upload");
        return;
      }
      mutation.mutate({ ...submitData, file: selectedFile, currentType: material?.type });
    } else {
      // Keep existing file
      mutation.mutate({ ...submitData, currentType: material?.type });
    }
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
          href="/dashboard"
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
          {uploadMode === "keep"
            ? "Update material information"
            : uploadMode === "file"
            ? "Upload a new document to replace the existing material"
            : "Add a YouTube video URL to replace the existing material"}
        </Typography>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Current Material Info */}
              <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Material
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Type: {material?.type === "video" ? "Video" : "Document"}
                </Typography>
                <Link
                  href={material?.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ wordBreak: "break-all", fontSize: "0.875rem" }}
                >
                  {material?.content_url}
                </Link>
              </Box>

              {/* Upload Mode Selector */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                  Content Action
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant={uploadMode === "keep" ? "contained" : "outlined"}
                    onClick={() => {
                      setUploadMode("keep");
                      setSelectedFile(null);
                      setValue("youtube_url", "");
                    }}
                    fullWidth
                  >
                    Keep Current
                  </Button>
                  <Button
                    variant={uploadMode === "file" ? "contained" : "outlined"}
                    onClick={() => {
                      setUploadMode("file");
                      setValue("youtube_url", "");
                    }}
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Upload Document
                  </Button>
                  <Button
                    variant={uploadMode === "youtube" ? "contained" : "outlined"}
                    onClick={() => {
                      setUploadMode("youtube");
                      setSelectedFile(null);
                    }}
                    startIcon={<VideoLibraryIcon />}
                    fullWidth
                  >
                    YouTube Video
                  </Button>
                </Box>
              </Box>

              {/* Conditional Input - File Upload */}
              {uploadMode === "file" && (
                <Box>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ height: 56, justifyContent: "flex-start", textAlign: "left" }}
                  >
                    {selectedFile ? selectedFile.name : "Choose Document File"}
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Accepted formats: PDF, DOC, DOCX, PPT, PPTX
                  </Typography>
                </Box>
              )}

              {/* Conditional Input - YouTube URL */}
              {uploadMode === "youtube" && (
                <TextField
                  label="YouTube Video URL"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  fullWidth
                  error={!!errors.youtube_url}
                  helperText={errors.youtube_url?.message || "Enter a valid YouTube video URL"}
                  {...register("youtube_url", {
                    required: uploadMode === "youtube" ? "YouTube URL is required" : false,
                  })}
                />
              )}

              {/* Keep Current - No Additional Input */}
              {uploadMode === "keep" && (
                <Alert severity="info">
                  Material content will remain unchanged. You can still update the title, lesson assignment, and description below.
                </Alert>
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
                  disabled={
                    mutation.isPending ||
                    (uploadMode === "file" && !selectedFile) ||
                    (uploadMode === "youtube" && !watch("youtube_url"))
                  }
                  startIcon={mutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                  fullWidth
                >
                  {mutation.isPending
                    ? "Saving..."
                    : uploadMode === "keep"
                    ? "Save Changes"
                    : uploadMode === "file"
                    ? "Upload & Save"
                    : "Update Video & Save"}
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
