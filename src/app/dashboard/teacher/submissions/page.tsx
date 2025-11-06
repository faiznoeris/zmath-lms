"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { getCurrentUserRole } from "@/src/utils/auth";
import { Breadcrumbs } from "@/src/components";
import {
  fetchGroupedPendingSubmissions,
  GroupedSubmissions,
  PendingSubmission,
} from "@/src/services/submission.service";
import { formatDate } from "@/src/utils/dateFormat";

export default function SubmissionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedSubmissions, setGroupedSubmissions] = useState<
    GroupedSubmissions[]
  >([]);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

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
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchGroupedPendingSubmissions();

    if (result.success && result.data) {
      setGroupedSubmissions(result.data);
    } else {
      setError(result.error || "Failed to fetch submissions");
    }

    setIsLoading(false);
  };

  const handleAccordionChange =
    (quizId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedQuiz(isExpanded ? quizId : null);
    };

  const handleGradeClick = (submissionId: string) => {
    router.push(`/dashboard/teacher/submissions/${submissionId}`);
  };

  if (isLoading) {
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
            label: "Review Submissions",
            icon: <AssignmentIcon fontSize="small" />,
          },
        ]}
      />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AssignmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Review Submissions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and grade quiz submissions that require manual grading
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {groupedSubmissions.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <AssignmentIcon sx={{ fontSize: 64, color: "action.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Pending Submissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All submissions have been graded!
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
                    label={`${group.pending_count} pending`}
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
                        <TableCell>Student</TableCell>
                        <TableCell>Question</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="center">Points</TableCell>
                        <TableCell>Submitted At</TableCell>
                        <TableCell align="right">Action</TableCell>
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
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {submission.question_text}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={submission.question_type}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">{submission.points}</TableCell>
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
                              Grade
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
    </Container>
  );
}
