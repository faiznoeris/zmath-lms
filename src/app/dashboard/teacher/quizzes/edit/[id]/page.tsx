"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "../../../../../../utils/supabase/client";
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
import { Course } from "../../../../../../models/Course";

interface QuestionInput {
  id?: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "essay";
  options?: string[];
  correct_answer?: string;
  order_index?: number;
}

interface QuizFormInputs {
  title: string;
  description?: string;
  time_limit_minutes?: number;
  course_id?: number;
  questions: QuestionInput[];
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  time_limit_minutes?: number;
  course_id?: number;
  questions?: QuestionInput[];
}

// Fetch all courses
const fetchCoursesApi = async (): Promise<Course[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("title", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

// Fetch single quiz with questions
async function fetchQuizApi(id: string): Promise<Quiz> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      *,
      questions (
        id,
        question_text,
        question_type,
        options,
        correct_answer,
        order_index
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Update quiz
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
    const questionsToInsert = data.questions.map((q, index) => ({
      quiz_id: parseInt(id),
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      correct_answer: q.correct_answer,
      order_index: index + 1,
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
    reset,
    formState: { errors },
    setValue,
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
    queryFn: fetchCoursesApi,
  });

  // Fetch quiz data
  const { data: quiz, isLoading, error, isError } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => fetchQuizApi(quizId),
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
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      >
                        <MenuItem value="">
                          <em>No Course</em>
                        </MenuItem>
                        {courses.map((course) => (
                          <MenuItem key={course.id} value={course.id.toString()}>
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
                    options: ["", "", "", ""],
                    correct_answer: "",
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
                      <TextField
                        label="Question"
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        {...register(`questions.${index}.question_text`, {
                          required: "Question is required",
                        })}
                        error={!!errors.questions?.[index]?.question_text}
                        helperText={errors.questions?.[index]?.question_text?.message}
                      />

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

                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                          Options
                        </Typography>
                        <Stack spacing={1}>
                          {[0, 1, 2, 3].map((optIndex) => (
                            <TextField
                              key={optIndex}
                              placeholder={`Option ${optIndex + 1}`}
                              fullWidth
                              size="small"
                              {...register(`questions.${index}.options.${optIndex}`)}
                            />
                          ))}
                        </Stack>
                      </Box>

                      <TextField
                        label="Correct Answer"
                        fullWidth
                        size="small"
                        placeholder="Enter the correct answer"
                        {...register(`questions.${index}.correct_answer`)}
                      />
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
