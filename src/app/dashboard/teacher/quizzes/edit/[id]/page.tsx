"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "../../../../../../utils/supabase/client";
import { fetchCourses } from "@/src/services/course.service";
import { fetchQuizWithQuestions } from "@/src/services/quiz.service";
import { MathPreview } from "@/src/components";
import { createPasteHandler } from "@/src/utils/imageUpload";
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
  Skeleton,
  FormHelperText,
  Stack,
  Snackbar,
} from "@mui/material";
import { Breadcrumbs } from "@/src/components";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import QuizIcon from "@mui/icons-material/Quiz";

interface QuestionInput {
  id?: string;
  question_text: string;
  question_type: "multiple_choice" | "essay";
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
  passing_score?: number;
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
      passing_score: data.passing_score || 60,
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadError, setShowUploadError] = useState(false);

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
      setValue("passing_score", quiz.passing_score);
      setValue("course_id", quiz.course_id);
      
      // Filter out true_false questions as they're no longer supported
      const validQuestions = (quiz.questions || []).filter(
        (q) => q.question_type !== "true_false"
      ) as QuestionInput[];
      setValue("questions", validQuestions);
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
          Kesalahan memuat kuis: {error instanceof Error ? error.message : "Kesalahan tidak diketahui"}
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push("/dashboard/teacher/quizzes")}
          sx={{ mt: 2 }}
        >
          Kembali ke Kuis
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          
          { label: "Kuis", href: "/dashboard/teacher/quizzes" },
          { label: "Ubah" },
        ]}
      />

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <QuizIcon sx={{ fontSize: 40, color: "primary.main" }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Ubah Kuis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Perbarui detail kuis dan pertanyaan
          </Typography>
        </Box>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information Card */}
        <Card elevation={0} sx={{ mb: 3, border: 1, borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
              Informasi Dasar
            </Typography>

            <Stack spacing={3}>
              <TextField
                label="Judul Kuis"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title", { required: "Judul wajib diisi" })}
              />

              <TextField
                label="Deskripsi"
                fullWidth
                multiline
                rows={3}
                placeholder="Jelaskan apa yang dicakup dalam kuis ini..."
                {...register("description")}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Controller
                  name="course_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Kursus</InputLabel>
                      <Select
                        label="Kursus"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : val);
                        }}
                      >
                        <MenuItem value="">
                          <em>Tanpa Kursus</em>
                        </MenuItem>
                        {courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.title}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Opsional</FormHelperText>
                    </FormControl>
                  )}
                />

                <TextField
                  label="Batas Waktu (menit)"
                  fullWidth
                  type="number"
                  placeholder="contoh: 30"
                  {...register("time_limit_minutes", { valueAsNumber: true })}
                  helperText="Opsional"
                  onWheel={(e) => (e.target as HTMLElement).blur()}
                />

                <TextField
                  label="Nilai Lulus"
                  fullWidth
                  type="number"
                  placeholder="contoh: 60"
                  {...register("passing_score", { 
                    valueAsNumber: true,
                    min: { value: 0, message: "Nilai minimal 0" },
                    max: { value: 100, message: "Nilai maksimal 100" }
                  })}
                  error={!!errors.passing_score}
                  helperText={errors.passing_score?.message || "Default: 60"}
                  inputProps={{ min: 0, max: 100 }}
                  onWheel={(e) => (e.target as HTMLElement).blur()}
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
                Pertanyaan ({fields.length})
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
                Tambah Pertanyaan
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
                        Pertanyaan {index + 1}
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
                        <Controller
                          name={`questions.${index}.question_text`}
                          control={control}
                          rules={{ required: "Pertanyaan wajib diisi" }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Pertanyaan"
                              fullWidth
                              multiline
                              rows={3}
                              size="small"
                              error={!!errors.questions?.[index]?.question_text}
                              helperText={
                                errors.questions?.[index]?.question_text?.message ||
                                "Tempel gambar untuk mengunggah."
                              }
                              onPaste={createPasteHandler(
                                "questions/question",
                                field.value || "",
                                field.onChange,
                                (error) => {
                                  setUploadError(error);
                                  setShowUploadError(true);
                                }
                              )}
                            />
                          )}
                        />
                        
                        {/* Math Preview */}
                        {watch(`questions.${index}.question_text`) && (
                          <Box sx={{ mt: 1 }}>
                            <MathPreview 
                              content={watch(`questions.${index}.question_text`) || ""} 
                              title="Pratinjau Pertanyaan"
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
                            <InputLabel>Tipe</InputLabel>
                            <Select {...field} label="Tipe">
                              <MenuItem value="multiple_choice">Pilihan Ganda</MenuItem>
                              <MenuItem value="essay">Esai</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />

                      {/* Points Field */}
                      <TextField
                        label="Poin"
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="contoh: 1"
                        disabled={watch(`questions.${index}.question_type`) === "essay"}
                        {...register(`questions.${index}.points`, { 
                          valueAsNumber: true,
                          min: 1
                        })}
                        helperText={
                          watch(`questions.${index}.question_type`) === "essay"
                            ? "Poin untuk esai akan diberikan saat penilaian manual"
                            : "Nilai poin untuk pertanyaan ini (default: 1)"
                        }
                        onWheel={(e) => (e.target as HTMLElement).blur()}
                      />

                      {/* Conditional rendering based on question type */}
                      {watch(`questions.${index}.question_type`) === "multiple_choice" && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                            Pilihan
                          </Typography>
                          <Stack spacing={1}>
                            {/* Option A */}
                            <Box>
                              <Controller
                                name={`questions.${index}.option_a`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    placeholder="Pilihan A"
                                    fullWidth
                                    size="small"
                                    multiline
                                    helperText=""
                                    onPaste={createPasteHandler(
                                      "questions/option",
                                      field.value || "",
                                      field.onChange,
                                      (error) => {
                                        setUploadError(error);
                                        setShowUploadError(true);
                                      }
                                    )}
                                  />
                                )}
                              />
                              {watch(`questions.${index}.option_a`) && (
                                <Box sx={{ mt: 0.5, ml: 1 }}>
                                  <MathPreview 
                                    content={watch(`questions.${index}.option_a`) || ""} 
                                    title="Pratinjau Pilihan A"
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Option B */}
                            <Box>
                              <Controller
                                name={`questions.${index}.option_b`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    placeholder="Pilihan B"
                                    fullWidth
                                    size="small"
                                    multiline
                                    helperText=""
                                    onPaste={createPasteHandler(
                                      "questions/option",
                                      field.value || "",
                                      field.onChange,
                                      (error) => {
                                        setUploadError(error);
                                        setShowUploadError(true);
                                      }
                                    )}
                                  />
                                )}
                              />
                              {watch(`questions.${index}.option_b`) && (
                                <Box sx={{ mt: 0.5, ml: 1 }}>
                                  <MathPreview 
                                    content={watch(`questions.${index}.option_b`) || ""} 
                                    title="Pratinjau Pilihan B"
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Option C */}
                            <Box>
                              <Controller
                                name={`questions.${index}.option_c`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    placeholder="Pilihan C"
                                    fullWidth
                                    size="small"
                                    multiline
                                    helperText=""
                                    onPaste={createPasteHandler(
                                      "questions/option",
                                      field.value || "",
                                      field.onChange,
                                      (error) => {
                                        setUploadError(error);
                                        setShowUploadError(true);
                                      }
                                    )}
                                  />
                                )}
                              />
                              {watch(`questions.${index}.option_c`) && (
                                <Box sx={{ mt: 0.5, ml: 1 }}>
                                  <MathPreview 
                                    content={watch(`questions.${index}.option_c`) || ""} 
                                    title="Pratinjau Pilihan C"
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Option D */}
                            <Box>
                              <Controller
                                name={`questions.${index}.option_d`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    placeholder="Pilihan D"
                                    fullWidth
                                    size="small"
                                    multiline
                                    helperText=""
                                    onPaste={createPasteHandler(
                                      "questions/option",
                                      field.value || "",
                                      field.onChange,
                                      (error) => {
                                        setUploadError(error);
                                        setShowUploadError(true);
                                      }
                                    )}
                                  />
                                )}
                              />
                              {watch(`questions.${index}.option_d`) && (
                                <Box sx={{ mt: 0.5, ml: 1 }}>
                                  <MathPreview 
                                    content={watch(`questions.${index}.option_d`) || ""} 
                                    title="Pratinjau Pilihan D"
                                  />
                                </Box>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      )}

                      {watch(`questions.${index}.question_type`) === "essay" && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Pertanyaan esai mengharuskan siswa untuk mengunggah berkas scan dari jawaban mereka. 
                          Poin akan diberikan secara manual saat penilaian.
                        </Alert>
                      )}

                      {/* Correct Answer - Hidden for Essay type */}
                      {watch(`questions.${index}.question_type`) !== "essay" && (
                        <Box>
                          <Controller
                            name={`questions.${index}.correct_answer`}
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth size="small">
                                <InputLabel>Jawaban Benar</InputLabel>
                                <Select {...field} label="Jawaban Benar">
                                  <MenuItem value="A">A</MenuItem>
                                  <MenuItem value="B">B</MenuItem>
                                  <MenuItem value="C">C</MenuItem>
                                  <MenuItem value="D">D</MenuItem>
                                </Select>
                                <FormHelperText>
                                  Pilih opsi yang merupakan jawaban benar
                                </FormHelperText>
                              </FormControl>
                            )}
                          />
                        </Box>
                      )}

                      {/* Explanation Field - Hidden for Essay type */}
                      {watch(`questions.${index}.question_type`) !== "essay" && (
                        <Box>
                          <TextField
                            label="Penjelasan (Opsional)"
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                            placeholder="Jelaskan mengapa ini adalah jawaban yang benar..."
                            {...register(`questions.${index}.explanation`)}
                            helperText="Penjelasan ini akan ditampilkan kepada siswa setelah mereka mengirimkan jawaban. "
                          />
                          {watch(`questions.${index}.explanation`) && (
                            <Box sx={{ mt: 1 }}>
                              <MathPreview 
                                content={watch(`questions.${index}.explanation`) || ""} 
                                title="Pratinjau Penjelasan"
                              />
                            </Box>
                          )}
                        </Box>
                      )}
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
            {mutation.error instanceof Error ? mutation.error.message : "Gagal mengubah"}
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
            {mutation.isPending ? "Mengubah..." : "Ubah Kuis"}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push("/dashboard/teacher/quizzes")}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
        </Stack>
      </form>

      {/* Upload Error Snackbar */}
      <Snackbar
        open={showUploadError}
        autoHideDuration={6000}
        onClose={() => setShowUploadError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setShowUploadError(false)} 
          severity="error" 
          sx={{ width: "100%" }}
        >
          {uploadError || "Gagal mengunggah gambar"}
        </Alert>
      </Snackbar>
    </Box>
  );
}
