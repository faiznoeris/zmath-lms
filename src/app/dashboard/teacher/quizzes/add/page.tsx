"use client";

import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../utils/supabase/client";
import { fetchCourses } from "@/src/services/course.service";
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
  IconButton,
  FormHelperText,
  Stack,
} from "@mui/material";
import { Breadcrumbs } from "@/src/components";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import QuizIcon from "@mui/icons-material/Quiz";

interface QuestionInput {
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

// Supabase API call for creating quiz with questions
async function createQuizApi(data: QuizFormInputs) {
  const supabase = createClient();
  
  // First, create the quiz
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert([
      {
        title: data.title,
        description: data.description,
        time_limit_minutes: data.time_limit_minutes,
        course_id: data.course_id || null,
      },
    ])
    .select()
    .single();

  if (quizError) {
    throw new Error(quizError.message);
  }

  // Then, create the questions for this quiz
  if (data.questions && data.questions.length > 0) {
    const questionsToInsert = data.questions.map((q) => ({
      quiz_id: quiz.id,
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

  return { success: true, quiz };
}

export default function AddQuizPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuizFormInputs>({
    defaultValues: {
      questions: [
        {
          question_text: "",
          question_type: "multiple_choice",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_answer: "",
          points: 1,
          explanation: "",
        },
      ],
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

  const mutation = useMutation({
    mutationFn: createQuizApi,
    onSuccess: () => {
      reset();
      router.push("/dashboard/teacher/quizzes");
    },
  });

  const onSubmit = (data: QuizFormInputs) => {
    mutation.mutate(data);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Quizzes", href: "/dashboard/teacher/quizzes" },
          { label: "Add" },
        ]}
      />

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <QuizIcon sx={{ fontSize: 40, color: "primary.main" }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Create New Quiz
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the details below
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
            {mutation.error instanceof Error ? mutation.error.message : "Creation failed"}
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
            {mutation.isPending ? "Creating..." : "Create Quiz"}
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
