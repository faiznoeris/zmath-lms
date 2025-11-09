"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Divider,
  Button,
  Skeleton,
  LinearProgress,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  EmojiEvents,
  ArrowBack,
  Info,
  Close as CloseIcon,
} from "@mui/icons-material";
import { fetchResultById } from "@/src/services/quiz.service";
import { MathQuestionDisplay } from "@/src/components";
// import "katex/dist/katex.min.css";

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch quiz result by ID with React Query
  const {
    data: resultData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quizResult", resultId],
    queryFn: async () => {
      const result = await fetchResultById(resultId);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    enabled: !!resultId,
  });

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  // Error state
  if (error || !resultData) {
    return (
      <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
        <Alert severity="error">
          Terjadi kesalahan saat memuat hasil kuis. Silakan coba lagi.
        </Alert>
      </Box>
    );
  }

  const { quiz, questions, totalScore, percentage, pendingGrading } = resultData;

  // Check if there's pending manual grading
  const hasPendingGrading = pendingGrading > 0;

  // Calculate pass/fail status
  const passingScore = quiz?.passing_score ?? 60;
  const passed = totalScore >= passingScore;

  // Determine status: show "Pending" if manual grading is needed
  const getStatus = () => {
    if (hasPendingGrading) {
      return { label: "Pending", color: "warning" as const };
    }
    return passed 
      ? { label: "Lulus", color: "success" as const }
      : { label: "Tidak Lulus", color: "error" as const };
  };

  const status = getStatus();

  // Calculate maxPoints based on quiz passing score minus total points from all questions
  const totalQuestionPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const maxPoints = Math.max(passingScore - totalQuestionPoints, 0);

  const getGradeText = (percent: number) => {
    if (percent >= 80) return "Sangat Baik!";
    if (percent >= 60) return "Baik";
    if (percent >= 40) return "Cukup";
    return "Perlu Ditingkatkan";
  };

  const getOptionLabel = (index: number) => {
    return ["A", "B", "C", "D"][index];
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push(`/dashboard/student/quizzes/detail/${quiz.id}`)}
        sx={{ mb: 2 }}
      >
        Kembali ke Daftar Kuis
      </Button>

      {/* Score Card */}
      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <EmojiEvents sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" fontWeight="bold">
              Hasil Kuis
            </Typography>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            {quiz.title}
          </Typography>

          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                Skor Anda
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {totalScore} / 100
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                Persentase
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {percentage.toFixed(1)}%
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                Status
              </Typography>
              <Chip
                label={status.label}
                color={status.color}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                Penilaian
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {hasPendingGrading ? "Menunggu Penilaian" : getGradeText(percentage)}
              </Typography>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "rgba(255,255,255,0.3)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "white",
              },
            }}
          />

          {pendingGrading > 0 && (
            <Alert
              severity="info"
              icon={<HourglassEmpty />}
              sx={{ mt: 3, backgroundColor: "rgba(255,255,255,0.9)" }}
            >
              <Typography variant="body2" color="text.primary">
                <strong>{pendingGrading} soal esai</strong> sedang menunggu penilaian manual dari guru.
                Skor akhir mungkin berubah setelah penilaian selesai.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Questions Review */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Pembahasan Soal
      </Typography>

      {questions.map((question, index) => {
        const isEssay = question.question_type === "essay";
        const isCorrect = question.is_correct;
        const isPending = question.requires_grading;

        return (
          <Card key={question.id} sx={{ mb: 3 }}>
            <CardContent>
              {/* Question Header */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Soal {index + 1}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {!isEssay && (
                    <Chip
                      icon={isCorrect ? <CheckCircle /> : <Cancel />}
                      label={isCorrect ? "Benar" : "Salah"}
                      color={isCorrect ? "success" : "error"}
                      size="small"
                    />
                  )}
                  {isEssay && isPending && (
                    <Chip
                      icon={<HourglassEmpty />}
                      label="Menunggu Penilaian"
                      color="warning"
                      size="small"
                    />
                  )}
                  {isEssay && !isPending && question.manual_score !== undefined && (
                    <Chip
                      label={`Skor: ${question.manual_score}/${maxPoints}`}
                      color="primary"
                      size="small"
                    />
                  )}
                </Box>
              </Box>

              {/* Question Text */}
              <Box sx={{ mb: 3 }}>
                <MathQuestionDisplay
                  question={question.question_text}
                  questionNumber={index + 1}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Multiple Choice Options */}
              {!isEssay && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    Pilihan Jawaban:
                  </Typography>
                  {[question.option_a, question.option_b, question.option_c, question.option_d]
                    .filter(Boolean)
                    .map((option, idx) => {
                      const optionLabel = getOptionLabel(idx);
                      const isSelected = question.selected_answer === optionLabel;
                      const isCorrectAnswer = question.correct_answer === optionLabel;

                      return (
                        <Paper
                          key={idx}
                          sx={{
                            p: 2,
                            mb: 1.5,
                            border: 2,
                            borderColor: isCorrectAnswer
                              ? "success.main"
                              : isSelected
                              ? "error.main"
                              : "grey.300",
                            backgroundColor: isCorrectAnswer
                              ? "success.50"
                              : isSelected
                              ? "error.50"
                              : "transparent",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {isCorrectAnswer && <CheckCircle color="success" />}
                            {isSelected && !isCorrectAnswer && <Cancel color="error" />}
                            <Typography
                              fontWeight={isSelected || isCorrectAnswer ? "bold" : "normal"}
                            >
                              <strong>{optionLabel}.</strong> {option}
                            </Typography>
                          </Box>
                          {isSelected && !isCorrectAnswer && (
                            <Typography variant="caption" color="error" sx={{ ml: 4 }}>
                              Jawaban Anda
                            </Typography>
                          )}
                          {isCorrectAnswer && (
                            <Typography variant="caption" color="success.main" sx={{ ml: 4 }}>
                              Jawaban yang Benar
                            </Typography>
                          )}
                        </Paper>
                      );
                    })}
                </Box>
              )}

              {/* Essay Answer */}
              {isEssay && (
                <Box sx={{ mb: 3 }}>
                  {isPending ? (
                    <Alert severity="info" icon={<Info />}>
                      <Typography variant="body2">
                        <strong>Soal Esai - Menunggu Penilaian Manual</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Jawaban Anda untuk soal ini sedang menunggu ditinjau dan dinilai oleh guru.
                        Anda akan menerima skor dan feedback setelah penilaian selesai.
                      </Typography>
                    </Alert>
                  ) : (
                    <>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        Jawaban Anda:
                      </Typography>
                      {question.answer_file_url ? (
                        <Paper 
                          sx={{ 
                            p: 2, 
                            backgroundColor: "grey.50",
                            cursor: "pointer",
                            transition: "transform 0.2s",
                            "&:hover": {
                              transform: "scale(1.02)",
                            },
                          }}
                          onClick={() => setPreviewImage(question.answer_file_url!)}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            File yang diunggah:
                          </Typography>
                          <Box
                            component="img"
                            src={question.answer_file_url}
                            alt="Jawaban Siswa"
                            sx={{
                              maxWidth: "100%",
                              maxHeight: 400,
                              objectFit: "contain",
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                            Klik gambar untuk memperbesar
                          </Typography>
                        </Paper>
                      ) : (
                        <Paper sx={{ p: 2, backgroundColor: "grey.50" }}>
                          <Typography variant="body2" color="text.secondary">
                            Tidak ada jawaban yang diunggah
                          </Typography>
                        </Paper>
                      )}

                      {question.teacher_feedback && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                            Feedback dari Guru:
                          </Typography>
                          <Paper sx={{ p: 2, backgroundColor: "info.50", borderLeft: 4, borderColor: "info.main" }}>
                            <Typography variant="body2">{question.teacher_feedback}</Typography>
                          </Paper>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              )}

              {/* Explanation */}
              {question.explanation && !isPending && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="info" icon={<Info />}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Pembahasan:
                    </Typography>
                    <Typography variant="body2">{question.explanation}</Typography>
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Bottom Action */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push(`/dashboard/student/quizzes/detail/${quiz.id}`)}
        >
          Kembali ke Daftar Kuis
        </Button>
      </Box>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ position: "relative", p: 0, backgroundColor: "black" }}>
          <IconButton
            onClick={() => setPreviewImage(null)}
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
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="Preview Jawaban"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
