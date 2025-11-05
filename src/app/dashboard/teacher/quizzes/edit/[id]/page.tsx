"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "../../../../../../utils/supabase/client";
import { fetchCourses } from "@/src/services/course.service";
import { fetchQuizWithQuestions } from "@/src/services/quiz.service";
import { MathPreview } from "@/src/components";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Skeleton,
  FormHelperText,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import QuizIcon from "@mui/icons-material/Quiz";

interface QuestionInput {
  id?: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "essay";
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
  points?: number;
  explanation?: string;
}

interface QuizFormInputs {
  title: string;
  description?: string;
  time_limit_minutes?: number;
  course_id?: string;
  questions: QuestionInput[];
}

// Update quiz (keep old implementation for complex logic)
async function updateQuizApi(id: string, data: QuizFormInputs) {
  const supabase = createClient();
  
  // Update quiz basic info
  const { error: quizError } = await supabase
    .from("quizzes")
    .update({
      title: data.title,
      description: data.description,
      time_limit_minutes: data.time_limit_minutes,
      course_id: data.course_id || null,
    })
    .eq("id", id);

  if (quizError) {
    throw new Error(quizError.message);
  }

  // Delete existing questions
  const { error: deleteError } = await supabase
    .from("questions")
    .delete()
    .eq("quiz_id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  // Insert updated questions
  if (data.questions && data.questions.length > 0) {
    const questionsToInsert = data.questions.map((q) => ({
      quiz_id: id,
      question_text: q.question_text,
      question_type: q.question_type,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      points: q.points || 1,
      explanation: q.explanation,
    }));

    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionsToInsert);

    if (questionsError) {
      throw new Error(questionsError.message);
    }
  }

  return { success: true };
}

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuizFormInputs>({
    defaultValues: {
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const result = await fetchCourses();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  // Fetch quiz data
  const { data: quiz, isLoading, error, isError } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const result = await fetchQuizWithQuestions(quizId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!quizId,
  });

  // Update form when quiz data is loaded
  useEffect(() => {
    if (quiz) {
      setValue("title", quiz.title);
      setValue("description", quiz.description || "");
      setValue("time_limit_minutes", quiz.time_limit_minutes);
      setValue("course_id", quiz.course_id);
      setValue("questions", quiz.questions || []);
    }
  }, [quiz, setValue]);

  const mutation = useMutation({
    mutationFn: (data: QuizFormInputs) => updateQuizApi(quizId, data),
    onSuccess: () => {
      router.push("/dashboard/teacher/quizzes");
    },
  });

  const onSubmit = (data: QuizFormInputs) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Alert severity="error">
          Error loading quiz: {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push("/dashboard/teacher/quizzes")}
          sx={{ mt: 2 }}
        >
          Back to Quizzes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 3 } }}>
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
          href="/dashboard/teacher/quizzes"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          Quizzes
        </Link>
        <Typography color="text.primary">Edit</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <QuizIcon sx={{ fontSize: 40, color: "primary.main" }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Edit Quiz
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update quiz details and questions
          </Typography>
        </Box>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information Card */}
        <Card elevation={0} sx={{ mb: 3, border: 1, borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
              Basic Information
            </Typography>

            <Stack spacing={3}>
              <TextField
                label="Quiz Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title", { required: "Title is required" })}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                placeholder="Describe what this quiz covers..."
                {...register("description")}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Controller
                  name="course_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Course</InputLabel>
                      <Select
                        label="Course"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : val);
                        }}
                      >
                        <MenuItem value="">
                          <em>No Course</em>
                        </MenuItem>
                        {courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.title}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Optional</FormHelperText>
                    </FormControl>
                  )}
                />

                <TextField
                  label="Time Limit (minutes)"
                  fullWidth
                  type="number"
                  placeholder="e.g., 30"
                  {...register("time_limit_minutes", { valueAsNumber: true })}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Questions Card */}
        <Card elevation={0} sx={{ mb: 3, border: 1, borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Questions ({fields.length})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                  append({
                    question_text: "",
                    question_type: "multiple_choice",
                    option_a: "",
                    option_b: "",
                    option_c: "",
                    option_d: "",
                    correct_answer: "",
                    points: 1,
                    explanation: "",
                  })
                }
              >
                Add Question
              </Button>
            </Stack>

            <Stack spacing={2}>
              {fields.map((field, index) => (
                <Card 
                  key={field.id} 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: "grey.50",
                    borderColor: "divider"
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="primary">
                        Question {index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Stack spacing={2}>
                      <Box>
                        <TextField
                          label="Question"
                          fullWidth
                          multiline
                          rows={3}
                          size="small"
                          {...register(`questions.${index}.question_text`, {
                            required: "Question is required",
                          })}
                          error={!!errors.questions?.[index]?.question_text}
                          helperText={
                            errors.questions?.[index]?.question_text?.message ||
                            "Use $...$ for inline math (e.g., $x^2$) and $$...$$ for block equations"
                          }
                        />
                        
                        {/* Math Preview */}
                        {watch(`questions.${index}.question_text`) && (
                          <Box sx={{ mt: 1 }}>
                            <MathPreview 
                              content={watch(`questions.${index}.question_text`) || ""} 
                              title="Question Preview"
                            />
                          </Box>
                        )}
                      </Box>

                      <Controller
                        name={`questions.${index}.question_type`}
                        control={control}
                        defaultValue="multiple_choice"
                        render={({ field }) => (
                          <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select {...field} label="Type">
                              <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                              <MenuItem value="true_false">True/False</MenuItem>
                              <MenuItem value="essay">Essay</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />

                      {/* Points Field */}
                      <TextField
                        label="Points"
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="e.g., 1"
                        {...register(`questions.${index}.points`, { 
                          valueAsNumber: true,
                          min: 1
                        })}
                        helperText="Point value for this question (default: 1)"
                      />

                      {/* Conditional rendering based on question type */}
                      {watch(`questions.${index}.question_type`) === "multiple_choice" && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                            Options
                          </Typography>
                          <Stack spacing={1}>
                            {/* Option A */}
                            <Box>
                              <TextField
                                placeholder="Option A"
                                fullWidth
                                size="small"
                                multiline
                                {...register(`questions.${index}.option_a`)}
                                helperText="Use $...$ for math formulas"
                              />
                              {watch(`questions.${index}.option_a`) && (
                                <Box sx={{ mt: 0.5, ml: 1 }}>
                                  <MathPreview 
                                    content={watch(`questions.${index}.option_a`) || ""} 
                                    title="Option A Preview"
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Option B */}
                            <Box>
                              <TextField
                                placeholder="Option B"
                                fullWidth
                                size="small"
                                multiline
                                {...register(`questions.${index}.option_b`)}
                                helperText="Use $...$ for math formulas"
                              />
                              {watch(`questions.${index}.option_b`) && (
                                <Box sx={{ mt: 0.5, ml: 1 }}>
                                  <MathPreview 
                                    content={watch(`questions.${index}.option_b`) || ""} 
                                    title="Option B Preview"
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Option C */}
                            <Box>
                              <TextField
                                placeholder="Option C"
                                fullWidth
                                size="small"
                                multiline
                                {...register(`questions.${index}.option_c`)}
                                helperText="Use $...$ for math formulas"
                              />
                              {watch(`questions.${index}.option_c`) && (
                                <Box sx={{ mt: 0.5, ml: 1 }}>
                                  <MathPreview 
                                    content={watch(`questions.${index}.option_c`) || ""} 
                                    title="Option C Preview"
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Option D */}
                            <Box>
                              <TextField
                                placeholder="Option D"
                                fullWidth
                                size="small"
                                multiline
                                {...register(`questions.${index}.option_d`)}
                                helperText="Use $...$ for math formulas"
                              />
                              {watch(`questions.${index}.option_d`) && (
                                <Box sx={{ mt: 0.5, ml: 1 }}>
                                  <MathPreview 
                                    content={watch(`questions.${index}.option_d`) || ""} 
                                    title="Option D Preview"
                                  />
                                </Box>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      )}

                      {watch(`questions.${index}.question_type`) === "true_false" && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                            Options (Auto-generated)
                          </Typography>
                          <Stack spacing={1}>
                            <TextField
                              value="True"
                              fullWidth
                              size="small"
                              disabled
                              helperText="Default option 1"
                            />
                            <TextField
                              value="False"
                              fullWidth
                              size="small"
                              disabled
                              helperText="Default option 2"
                            />
                          </Stack>
                        </Box>
                      )}

                      {watch(`questions.${index}.question_type`) === "essay" && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Essay questions require students to upload a scanned file of their answer. 
                          Points will be assigned manually during grading.
                        </Alert>
                      )}

                      {/* Correct Answer - Hidden for Essay type */}
                      {watch(`questions.${index}.question_type`) !== "essay" && (
                        <Box>
                          <TextField
                            label="Correct Answer"
                            fullWidth
                            size="small"
                            placeholder={
                              watch(`questions.${index}.question_type`) === "true_false"
                                ? "Enter 'True' or 'False'"
                                : "Enter the correct answer"
                            }
                            {...register(`questions.${index}.correct_answer`)}
                            helperText={
                              watch(`questions.${index}.question_type`) === "true_false"
                                ? "Type exactly 'True' or 'False'"
                                : "Enter the correct answer text. Use $...$ for math formulas"
                            }
                          />
                          {watch(`questions.${index}.correct_answer`) && (
                            <Box sx={{ mt: 1 }}>
                              <MathPreview 
                                content={watch(`questions.${index}.correct_answer`) || ""} 
                                title="Correct Answer Preview"
                              />
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Explanation Field */}
                      <Box>
                        <TextField
                          label="Explanation (Optional)"
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          placeholder="Explain why this is the correct answer..."
                          {...register(`questions.${index}.explanation`)}
                          helperText="This explanation will be shown to students after they submit their answer. Use $...$ for math formulas"
                        />
                        {watch(`questions.${index}.explanation`) && (
                          <Box sx={{ mt: 1 }}>
                            <MathPreview 
                              content={watch(`questions.${index}.explanation`) || ""} 
                              title="Explanation Preview"
                            />
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Error Message */}
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {mutation.error instanceof Error ? mutation.error.message : "Update failed"}
          </Alert>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={mutation.isPending}
            startIcon={mutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
            fullWidth
          >
            {mutation.isPending ? "Updating..." : "Update Quiz"}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push("/dashboard/teacher/quizzes")}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
