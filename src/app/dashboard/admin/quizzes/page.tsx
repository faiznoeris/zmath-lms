"use client";
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import styles from "../../dashboard.module.css";

interface QuestionInput {
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "essay";
  options?: string[];
  correct_answer?: string;
}

interface QuizFormInputs {
  title: string;
  description?: string;
  time_limit_minutes?: number;
  questions: QuestionInput[];
}

// Simulate API call
async function createQuizApi(data: QuizFormInputs) {
  await new Promise((res) => setTimeout(res, 1000));
  return { success: true };
}

export default function AdminQuizzesPage() {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<QuizFormInputs>({
    defaultValues: {
      questions: [{ question_text: "", question_type: "multiple_choice", options: ["", "", "", ""], correct_answer: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });
  const mutation = useMutation({
    mutationFn: createQuizApi,
    onSuccess: () => {
      reset();
      // TODO: Show success message or redirect
    },
  });

  const onSubmit = (data: QuizFormInputs) => {
    mutation.mutate(data);
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Create & Manage Quizzes</h1>
        <p className={styles.subtitle}>Add a new quiz and insert multiple questions.</p>
      </header>
      <main className={styles.main}>
        <section className={styles.section}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className={styles.label}>Quiz Title</label>
            <input className={styles.formField} {...register("title", { required: "Title is required" })} />
            {errors.title && <div className={styles.error}>{errors.title.message}</div>}

            <label className={styles.label}>Description</label>
            <textarea className={styles.formField} {...register("description")} />

            <label className={styles.label}>Time Limit (minutes)</label>
            <input className={styles.formField} type="number" min={1} {...register("time_limit_minutes", { valueAsNumber: true })} />

            <h3 style={{marginTop: '2rem'}}>Questions</h3>
            {fields.map((field, idx) => (
              <div key={field.id} style={{border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, marginBottom: 16}}>
                <label className={styles.label}>Question Text</label>
                <input className={styles.formField} {...register(`questions.${idx}.question_text`, { required: "Question text is required" })} />
                {errors.questions?.[idx]?.question_text && <div className={styles.error}>{errors.questions[idx]?.question_text?.message}</div>}

                <label className={styles.label}>Type</label>
                <select className={styles.formField} {...register(`questions.${idx}.question_type`)}>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="essay">Essay</option>
                </select>

                {/* Multiple Choice Options */}
                {control._formValues.questions?.[idx]?.question_type === "multiple_choice" && (
                  <>
                    <label className={styles.label}>Options</label>
                    {[0,1,2,3].map(optIdx => (
                      <input
                        key={optIdx}
                        className={styles.formField}
                        placeholder={`Option ${optIdx+1}`}
                        {...register(`questions.${idx}.options.${optIdx}` as const, { required: "Option required" })}
                      />
                    ))}
                    <label className={styles.label}>Correct Answer</label>
                    <input className={styles.formField} {...register(`questions.${idx}.correct_answer`, { required: "Correct answer required" })} />
                  </>
                )}
                {/* True/False Options */}
                {control._formValues.questions?.[idx]?.question_type === "true_false" && (
                  <>
                    <label className={styles.label}>Correct Answer</label>
                    <select className={styles.formField} {...register(`questions.${idx}.correct_answer`)}>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </>
                )}
                {/* Essay: no options, just answer */}
                {control._formValues.questions?.[idx]?.question_type === "essay" && (
                  <>
                    <label className={styles.label}>Sample Answer (optional)</label>
                    <input className={styles.formField} {...register(`questions.${idx}.correct_answer`)} />
                  </>
                )}
                <button type="button" className={styles.formButton} onClick={() => remove(idx)} style={{marginTop:8, width:'auto', background:'#fff', color:'#d32f2f', border:'1.5px solid #d32f2f'}}>Remove Question</button>
              </div>
            ))}
            <button type="button" className={styles.formButton} onClick={() => append({ question_text: "", question_type: "multiple_choice", options: ["", "", "", ""], correct_answer: "" })}>
              + Add Question
            </button>
            {mutation.isError && mutation.error instanceof Error && (
              <div className={styles.error}>{mutation.error.message}</div>
            )}
            <button className={styles.formButton} type="submit" disabled={mutation.isPending} style={{marginTop:16}}>
              {mutation.isPending ? "Saving..." : "Save Quiz"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
