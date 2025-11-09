"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { createClient } from "@/src/utils/supabase/client";
import { useQuizStore } from "@/src/stores";

interface QuizAnswerFileUploadProps {
  quizId: string;
  userId: string;
  questionId: string;
  attemptId: string; // Kept for consistency with QuizAnswerOptions, not currently used
  onUploadComplete?: (url: string) => void;
  existingFileUrl?: string;
}

export default function QuizAnswerFileUpload({
  quizId,
  userId,
  questionId,
  attemptId, // eslint-disable-line @typescript-eslint/no-unused-vars
  onUploadComplete,
  existingFileUrl,
}: QuizAnswerFileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingFileUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingFileUrl || null);
  const [loading, setLoading] = useState(true);
  const { setUserAnswer } = useQuizStore();

  // Fetch existing submission on mount
  useEffect(() => {
    const fetchExistingSubmission = async () => {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("submissions")
          .select("answer_file_url, selected_answer")
          .eq("question_id", questionId)
          .eq("quiz_id", quizId)
          .eq("user_id", userId)
          .is("result_id", null) // Only get current attempt
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching submission:", fetchError);
        } else if (data?.answer_file_url) {
          setPreviewUrl(data.answer_file_url);
          setUploadedUrl(data.answer_file_url);
          // Update local state with existing answer
          if (data.selected_answer) {
            setUserAnswer(questionId, data.selected_answer);
          }
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (questionId && quizId && userId) {
      fetchExistingSubmission();
    } else {
      setLoading(false);
    }
  }, [questionId, quizId, userId, setUserAnswer]);

  useEffect(() => {
    if (existingFileUrl) {
      setPreviewUrl(existingFileUrl);
      setUploadedUrl(existingFileUrl);
    }
  }, [existingFileUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar (JPG, PNG) yang diperbolehkan");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Auto-upload the file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const fileExt = file.name.split(".").pop();
      const fileName = `${quizId}-${userId}-${timestamp}-${Date.now()}.${fileExt}`;
      const filePath = `quiz_attempts/answers/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("lms")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("lms")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      setUploadedUrl(publicUrl);

      // Update local state for immediate UI feedback
      setUserAnswer(questionId, `[File uploaded: ${file.name}]`);

      // Update submission with answer_file_url and selected_answer
      // Find the current attempt's submission (result_id IS NULL)
      const { error: updateError } = await supabase
        .from("submissions")
        .update({
          answer_file_url: publicUrl,
          selected_answer: `[File uploaded: ${file.name}]`,
        })
        .eq("user_id", userId)
        .eq("question_id", questionId)
        .eq("quiz_id", quizId)
        .is("result_id", null); // Only update current attempt

      if (updateError) {
        throw updateError;
      }

      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Gagal mengupload file");
      setPreviewUrl(null);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!uploadedUrl) return;

    try {
      const supabase = createClient();

      // Extract file path from URL
      const url = new URL(uploadedUrl);
      const pathParts = url.pathname.split("/");
      const filePath = pathParts.slice(pathParts.indexOf("quiz_attempts")).join("/");

      // Delete file from storage
      const { error: deleteError } = await supabase.storage
        .from("lms")
        .remove([filePath]);

      if (deleteError) {
        console.error("Delete error:", deleteError);
      }

      // Update local state for immediate UI feedback
      setUserAnswer(questionId, "");

      // Update submission to remove answer_file_url and selected_answer
      // Find the current attempt's submission (result_id IS NULL)
      const { error: updateError } = await supabase
        .from("submissions")
        .update({
          answer_file_url: null,
          selected_answer: null,
        })
        .eq("user_id", userId)
        .eq("question_id", questionId)
        .eq("quiz_id", quizId)
        .is("result_id", null); // Only update current attempt

      if (updateError) {
        throw updateError;
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadedUrl(null);
      setError(null);
    } catch (err) {
      console.error("Remove error:", err);
      setError(err instanceof Error ? err.message : "Gagal menghapus file");
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Upload Jawaban (Opsional)
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Upload gambar jawaban Anda (JPG, PNG, max 5MB)
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

      {!previewUrl ? (
        <Button
          component="label"
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={uploading}
          sx={{ mb: 2 }}
        >
          {uploading ? "Mengupload..." : "Pilih File"}
          <input
            type="file"
            hidden
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </Button>
      ) : (
        <Box>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              position: "relative",
              backgroundColor: "grey.50",
            }}
          >
            {uploading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  zIndex: 1,
                }}
              >
                <CircularProgress />
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <Box
                component="img"
                src={previewUrl}
                alt="Preview jawaban"
                sx={{
                  maxWidth: "100%",
                  maxHeight: 400,
                  objectFit: "contain",
                  borderRadius: 1,
                }}
              />
            </Box>
          </Paper>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
            >
              Ganti File
              <input
                type="file"
                hidden
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleRemove}
              disabled={uploading}
            >
              Hapus
            </Button>
          </Box>
        </Box>
      )}

      {selectedFile && !uploading && uploadedUrl && (
        <Alert severity="success" sx={{ mt: 2 }}>
          File berhasil diupload: {selectedFile.name}
        </Alert>
      )}
        </>
      )}
    </Box>
  );
}
