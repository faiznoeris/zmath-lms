"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthStore } from "@/src/stores";
import { Breadcrumbs, MathPreview } from "@/src/components";
import {
  GroupedSubmissions,
  PendingSubmission,
} from "@/src/services/submission.service";
import { ResultWithDetails } from "@/src/services/result.service";
import { fetchGroupedPendingSubmissionsAction, fetchResultsHistoryAction } from "./actions";
import { formatDate } from "@/src/utils/dateFormat";

export default function SubmissionsPage() {
  const router = useRouter();
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { user, isLoggedIn } = useAuthStore();

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

  // Fetch grouped pending submissions using React Query
  const {
    data: groupedSubmissions = [],
    isLoading,
    error,
  } = useQuery<GroupedSubmissions[]>({
    queryKey: ["grouped-pending-submissions"],
    queryFn: async () => {
      const result = await fetchGroupedPendingSubmissionsAction();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch submissions");
      }
      return result.data || [];
    },
  });

  // Fetch results history using React Query
  const {
    data: resultsHistory = [],
    isLoading: isLoadingResults,
    error: resultsError,
  } = useQuery<ResultWithDetails[]>({
    queryKey: ["results-history"],
    queryFn: async () => {
      const result = await fetchResultsHistoryAction();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch results");
      }
      return result.data || [];
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAccordionChange =
    (quizId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedQuiz(isExpanded ? quizId : null);
    };

  const handleGradeClick = (submissionId: string) => {
    router.push(`/dashboard/teacher/submissions/${submissionId}`);
  };

  if (isLoading || isLoadingResults) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          {
            label: "Tinjau Submisi",
            icon: <AssignmentIcon fontSize="small" />,
          },
        ]}
      />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AssignmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Tinjau Submisi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tinjau dan beri nilai submisi kuis yang memerlukan penilaian manual
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label={`Submisi Tertunda (${groupedSubmissions.length})`}
          />
          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label={`Riwayat Hasil (${resultsHistory.length})`}
          />
        </Tabs>
      </Box>

      {/* Tab 0: Pending Submissions */}
      {currentTab === 0 && (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error.message}
            </Alert>
          )}

          {groupedSubmissions.length === 0 ? (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <AssignmentIcon sx={{ fontSize: 64, color: "action.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Tidak Ada Submisi Tertunda
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Semua submisi telah dinilai!
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box>
              {groupedSubmissions.map((group) => (
                <Accordion
                  key={group.quiz_id}
                  expanded={expandedQuiz === group.quiz_id}
                  onChange={handleAccordionChange(group.quiz_id)}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${group.quiz_id}-content`}
                    id={`${group.quiz_id}-header`}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                      pr={2}
                    >
                      <Box>
                        <Typography variant="h6">{group.quiz_title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {group.course_title}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${group.pending_count} tertunda`}
                        color="warning"
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Siswa</TableCell>
                            <TableCell>Pertanyaan</TableCell>
                            <TableCell>Tipe</TableCell>
                            <TableCell align="center">Poin</TableCell>
                            <TableCell align="center">File Jawaban</TableCell>
                            <TableCell>Dikirim Pada</TableCell>
                            <TableCell align="right">Aksi</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {group.submissions.map((submission: PendingSubmission) => (
                            <TableRow
                              key={submission.id}
                              hover
                              sx={{ cursor: "pointer" }}
                              onClick={() => handleGradeClick(submission.id)}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {submission.student_name || submission.student_email}
                                </Typography>
                                {submission.student_name && (
                                  <Typography variant="caption" color="text.secondary">
                                    {submission.student_email}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ maxWidth: 300 }}>
                                  <MathPreview content={submission.question_text} />
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={submission.question_type}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">{submission.points}</TableCell>
                              <TableCell align="center">
                                {submission.answer_file_url ? (
                                  <Box
                                    component="img"
                                    src={submission.answer_file_url}
                                    alt="Preview jawaban"
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      objectFit: "cover",
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "divider",
                                      cursor: "pointer",
                                      transition: "transform 0.2s",
                                      "&:hover": {
                                        transform: "scale(1.1)",
                                      },
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewImage(submission.answer_file_url!);
                                    }}
                                  />
                                ) : (
                                  <Typography variant="caption" color="text.secondary">
                                    Tidak ada
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {formatDate(submission.submitted_at)}
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGradeClick(submission.id);
                                  }}
                                >
                                  Nilai
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Tab 1: Results History */}
      {currentTab === 1 && (
        <>
          {resultsError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {resultsError.message}
            </Alert>
          )}

          {resultsHistory.length === 0 ? (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <HistoryIcon sx={{ fontSize: 64, color: "action.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Tidak Ada Riwayat Hasil
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Belum ada hasil kuis yang tersedia
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Siswa</TableCell>
                    <TableCell>Kuis</TableCell>
                    <TableCell>Kursus</TableCell>
                    <TableCell align="center">Skor</TableCell>
                    <TableCell align="center">Total Poin</TableCell>
                    <TableCell align="center">Persentase</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell>Selesai Pada</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultsHistory.map((result) => {
                    const passed = result.quiz?.passing_score
                      ? result.percentage >= result.quiz.passing_score
                      : result.percentage >= 60;

                    return (
                      <TableRow key={result.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {result.student?.full_name || result.student?.email || "Unknown"}
                          </Typography>
                          {result.student?.full_name && result.student?.email && (
                            <Typography variant="caption" color="text.secondary">
                              {result.student.email}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{result.quiz?.title || "-"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {result.quiz?.course?.title || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="medium">
                            {result.score}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{result.total_points}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color={passed ? "success.main" : "error.main"}
                          >
                            {result.percentage.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={passed ? "Lulus" : "Tidak Lulus"}
                            color={passed ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(result.completed_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

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
    </Container>
  );
}
