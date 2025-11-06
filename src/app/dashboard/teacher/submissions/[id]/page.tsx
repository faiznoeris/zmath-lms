"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { getCurrentUserRole } from "@/src/utils/auth";
import { Breadcrumbs } from "@/src/components";
import {
  fetchSubmissionById,
  gradeSubmission,
  GradeSubmissionData,
} from "@/src/services/submission.service";
import { SubmissionWithDetails } from "@/src/models/Submission";
import { formatDate } from "@/src/utils/dateFormat";
import { MathQuestionDisplay } from "@/src/components";

export default function GradeSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submission, setSubmission] = useState<SubmissionWithDetails | null>(
    null
  );
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchSubmissionById(submissionId);

    if (result.success && result.data) {
      setSubmission(result.data);
      // Pre-fill with existing values if already graded
      if (result.data.manual_score !== undefined) {
        setScore(result.data.manual_score);
      }
      if (result.data.teacher_feedback) {
        setFeedback(result.data.teacher_feedback);
      }
    } else {
      setError(result.error || "Failed to fetch submission");
    }

    setIsLoading(false);
  }, [submissionId]);

  useEffect(() => {
    const checkRoleAndFetchData = async () => {
      const role = await getCurrentUserRole();

      if (!role) {
        router.push("/login");
        return;
      }

      // Only allow teachers and admins
      if (role === "student") {
        router.push("/dashboard");
        return;
      }

      await fetchData();
    };

    checkRoleAndFetchData();
  }, [router, fetchData]);

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
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const gradeData: GradeSubmissionData = {
      manual_score: score,
      teacher_feedback: feedback,
    };

    const result = await gradeSubmission(submissionId, gradeData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/teacher/submissions");
      }, 1500);
    } else {
      setError(result.error || "Failed to save grade");
    }

    setIsSaving(false);
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
        <Alert severity="error">Submission not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Submissions
        </Button>
      </Container>
    );
  }

  const maxPoints = submission.question?.points || 10;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          {
            label: "Review Submissions",
            href: "/dashboard/teacher/submissions",
            icon: <AssignmentIcon fontSize="small" />,
          },
          {
            label: "Grade Submission",
            icon: <RateReviewIcon fontSize="small" />,
          },
        ]}
      />

      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Back to Submissions
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Grade Submission
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Grade saved successfully! Redirecting...
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
        {/* Submission Details */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quiz Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Quiz
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {submission.quiz?.title}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Course
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {submission.course?.title}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Student
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
                  Submitted At
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
                <Typography variant="h6">Question</Typography>
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
                        <strong>Correct Answer:</strong> {submission.question.correct_answer}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Student&apos;s Answer
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
                  question={submission.selected_answer || "No answer provided"} 
                />
              </Paper>
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
                Grading
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Points Possible: {maxPoints}
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
                  step={0.5}
                  valueLabelDisplay="auto"
                  disabled={isSaving}
                />
              </Box>

              <TextField
                label="Feedback (Optional)"
                multiline
                rows={6}
                fullWidth
                value={feedback}
                onChange={handleFeedbackChange}
                disabled={isSaving}
                placeholder="Provide feedback to the student..."
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<SaveIcon />}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Grade"}
              </Button>

              {submission.graded_at && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: "info.lighter", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Previously graded on {formatDate(submission.graded_at)}
                    {submission.grader && ` by ${submission.grader.email}`}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
