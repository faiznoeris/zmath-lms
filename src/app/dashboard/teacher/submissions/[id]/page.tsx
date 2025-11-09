"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Divider,
  Chip,
  Paper,
  Container,
  Slider,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { useAuthStore } from "@/src/stores";
import { Breadcrumbs } from "@/src/components";
import {
  fetchSubmissionById,
  gradeSubmission,
  GradeSubmissionData,
} from "@/src/services/submission.service";
import { fetchQuizWithQuestions } from "@/src/services/quiz.service";
import { SubmissionWithDetails } from "@/src/models/Submission";
import { formatDate } from "@/src/utils/dateFormat";
import { MathQuestionDisplay } from "@/src/components";

export default function GradeSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;
  const queryClient = useQueryClient();
  const { user, isLoggedIn } = useAuthStore();

  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [imagePreviewOpen, setImagePreviewOpen] = useState<boolean>(false);

  // Check user role
  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push("/login");
      return;
    }

    const role = user.user_metadata?.role as "student" | "teacher" | "admin" | undefined;

    // Only allow teachers and admins
    if (role === "student") {
      router.push("/dashboard");
      return;
    }
  }, [isLoggedIn, user, router]);

  // Fetch submission details using React Query
  const {
    data: submission,
    isLoading,
    error,
  } = useQuery<SubmissionWithDetails>({
    queryKey: ["submission", submissionId],
    queryFn: async () => {
      const result = await fetchSubmissionById(submissionId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch submission");
      }
      if (!result.data) {
        throw new Error("Submission not found");
      }
      return result.data;
    },
  });

  // Fetch all questions from the quiz to calculate total points
  const { data: quizData } = useQuery({
    queryKey: ["quiz-questions", submission?.question?.quiz_id],
    queryFn: async () => {
      if (!submission?.question?.quiz_id) return null;
      const result = await fetchQuizWithQuestions(submission.question.quiz_id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!submission?.question?.quiz_id,
  });

  // Update score and feedback when submission data is loaded
  useEffect(() => {
    if (submission) {
      if (submission.manual_score !== undefined) {
        setScore(submission.manual_score);
      }
      if (submission.teacher_feedback) {
        setFeedback(submission.teacher_feedback);
      }
    }
  }, [submission]);

  // Grade submission mutation
  const gradeMutation = useMutation({
    mutationFn: async (gradeData: GradeSubmissionData) => {
      const result = await gradeSubmission(submissionId, gradeData);
      if (!result.success) {
        throw new Error(result.error || "Failed to save grade");
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["grouped-pending-submissions"] });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/teacher/submissions");
      }, 1500);
    },
  });

  const handleScoreChange = (event: Event, newValue: number | number[]) => {
    setScore(newValue as number);
  };

  const handleFeedbackChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFeedback(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const gradeData: GradeSubmissionData = {
      manual_score: score,
      teacher_feedback: feedback,
    };

    gradeMutation.mutate(gradeData);
  };

  const handleBack = () => {
    router.push("/dashboard/teacher/submissions");
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!submission) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Submisi tidak ditemukan</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Kembali ke Submisi
        </Button>
      </Container>
    );
  }

  // Calculate maxPoints based on quiz passing score minus total points from all questions
  const passingScore = submission.quiz?.passing_score || 60;
  const totalQuestionPoints = quizData?.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
  const maxPoints = Math.max(passingScore - totalQuestionPoints + 1, submission.question?.points || 10);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          {
            label: "Tinjau Submisi",
            href: "/dashboard/teacher/submissions",
            icon: <AssignmentIcon fontSize="small" />,
          },
          {
            label: "Beri Nilai Submisi",
            icon: <RateReviewIcon fontSize="small" />,
          },
        ]}
      />

      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Kembali ke Submisi
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Beri Nilai Submisi
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}

      {gradeMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Nilai berhasil disimpan! Mengalihkan...
        </Alert>
      )}

      {gradeMutation.isError && gradeMutation.error instanceof Error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {gradeMutation.error.message}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
        {/* Submission Details */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informasi Kuis
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Kuis
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {submission.quiz?.title}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Kursus
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {submission.course?.title}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Siswa
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {submission.student?.full_name || submission.student?.email}
                </Typography>
                {submission.student?.full_name && (
                  <Typography variant="body2" color="text.secondary">
                    {submission.student.email}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Dikirim Pada
                </Typography>
                <Typography variant="body1">
                  {formatDate(submission.submitted_at)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Pertanyaan</Typography>
                <Chip
                  label={`${submission.question?.question_type || "unknown"}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              {submission.question && (
                <Box sx={{ mb: 3 }}>
                  <MathQuestionDisplay question={submission.question.question_text} />
                  
                  {/* Show options for multiple choice */}
                  {submission.question.question_type === "multiple_choice" && (
                    <Box sx={{ mt: 2 }}>
                      {["A", "B", "C", "D"].map((option) => {
                        const optionKey = `option_${option.toLowerCase()}` as keyof typeof submission.question;
                        const optionValue = submission.question?.[optionKey];
                        
                        if (!optionValue) return null;
                        
                        return (
                          <Box key={option} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              <strong>{option}:</strong> {optionValue as string}
                            </Typography>
                          </Box>
                        );
                      })}
                      
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" color="success.main">
                        <strong>Jawaban Benar:</strong> {submission.question.correct_answer}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Jawaban Siswa
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: "grey.50",
                  minHeight: 100,
                }}
              >
                <MathQuestionDisplay 
                  question={submission.selected_answer || "Tidak ada jawaban"} 
                />
              </Paper>

              {/* Answer File Upload */}
              {submission.answer_file_url && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    File Jawaban
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      backgroundColor: "grey.50",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                      cursor: "pointer",
                      "&:hover": {
                        "& .zoom-overlay": {
                          opacity: 1,
                        },
                      },
                    }}
                    onClick={() => setImagePreviewOpen(true)}
                  >
                    <Box
                      component="img"
                      src={submission.answer_file_url}
                      alt="File Jawaban Siswa"
                      sx={{
                        maxWidth: "100%",
                        maxHeight: 600,
                        objectFit: "contain",
                        borderRadius: 1,
                      }}
                    />
                    <Box
                      className="zoom-overlay"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        opacity: 0,
                        transition: "opacity 0.3s",
                        borderRadius: 1,
                      }}
                    >
                      <ZoomInIcon sx={{ fontSize: 48, color: "white" }} />
                    </Box>
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Klik gambar untuk memperbesar
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Grading Panel */}
        <Box sx={{ width: { xs: "100%", md: "400px" } }}>
          <Card
            component="form"
            onSubmit={handleSubmit}
            sx={{ position: { md: "sticky" }, top: 20 }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Penilaian
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Poin Maksimal: {maxPoints}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {score} / {maxPoints}
                </Typography>
                <Slider
                  value={score}
                  onChange={handleScoreChange}
                  min={0}
                  max={maxPoints}
                  marks
                  step={1}
                  valueLabelDisplay="auto"
                  disabled={gradeMutation.isPending}
                />
              </Box>

              <TextField
                label="Umpan Balik (Opsional)"
                multiline
                rows={6}
                fullWidth
                value={feedback}
                onChange={handleFeedbackChange}
                disabled={gradeMutation.isPending}
                placeholder="Berikan umpan balik kepada siswa..."
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<SaveIcon />}
                disabled={gradeMutation.isPending}
              >
                {gradeMutation.isPending ? "Menyimpan..." : "Simpan Nilai"}
              </Button>

              {submission.graded_at && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: "info.lighter", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Telah dinilai sebelumnya pada {formatDate(submission.graded_at)}
                    {submission.grader && ` oleh ${submission.grader.email}`}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Image Preview Dialog */}
      {submission?.answer_file_url && (
        <Dialog
          open={imagePreviewOpen}
          onClose={() => setImagePreviewOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent sx={{ position: "relative", p: 0, backgroundColor: "black" }}>
            <IconButton
              onClick={() => setImagePreviewOpen(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                },
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="img"
              src={submission.answer_file_url}
              alt="File Jawaban Siswa"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
}
