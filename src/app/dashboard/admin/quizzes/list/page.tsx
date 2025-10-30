"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../../../../../utils/supabase/client";
import styles from "../../../dashboard.module.css";

interface Question {
  id: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "essay";
  options?: string[];
  correct_answer?: string;
  order_index: number;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  time_limit_minutes?: number;
  course_id?: number;
  created_at: string;
  questions?: Question[];
}

// Supabase API calls
async function fetchQuizzesApi(): Promise<Quiz[]> {
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
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function deleteQuizApi(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

async function updateQuizApi(quiz: Partial<Quiz>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .update({
      title: quiz.title,
      description: quiz.description,
      time_limit_minutes: quiz.time_limit_minutes,
    })
    .eq("id", quiz.id!)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export default function QuizzesListPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Quiz>>({});

  const { data: quizzes, isLoading, error, isError } = useQuery({
    queryKey: ["quizzes"],
    queryFn: fetchQuizzesApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuizApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      alert("Quiz deleted successfully!");
    },
    onError: (error: Error) => {
      alert(`Error deleting quiz: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateQuizApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setEditingId(null);
      setEditForm({});
      alert("Quiz updated successfully!");
    },
    onError: (error: Error) => {
      alert(`Error updating quiz: ${error.message}`);
    },
  });

  const handleEdit = (quiz: Quiz) => {
    setEditingId(quiz.id);
    setEditForm(quiz);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editingId && editForm) {
      updateMutation.mutate(editForm as Quiz);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this quiz? All questions will also be deleted.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Loading quizzes...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.dashboardContainer}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ color: "#d32f2f", marginBottom: "1rem" }}>
            Error loading quizzes: {error instanceof Error ? error.message : "Unknown error"}
          </div>
          <button
            className={styles.formButton}
            onClick={() => queryClient.invalidateQueries({ queryKey: ["quizzes"] })}
            style={{ maxWidth: "200px", margin: "0 auto" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Quizzes List</h1>
        <p className={styles.subtitle}>View, edit, and manage all quizzes.</p>
        <button
          className={styles.formButton}
          onClick={() => window.location.href = "/dashboard/admin/quizzes"}
          style={{ maxWidth: "200px", margin: "1rem auto" }}
        >
          + Add New Quiz
        </button>
      </header>
      <main className={styles.main}>
        <section className={styles.section}>
          {!quizzes || quizzes.length === 0 ? (
            <div style={{ textAlign: "center", color: "#888" }}>
              No quizzes found. Create your first quiz!
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Time Limit (min)</th>
                    <th>Questions</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id}>
                      {editingId === quiz.id ? (
                        <>
                          <td>{quiz.id}</td>
                          <td>
                            <input
                              className={styles.formField}
                              value={editForm.title || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, title: e.target.value })
                              }
                              style={{ margin: 0, minWidth: "200px" }}
                            />
                          </td>
                          <td>
                            <input
                              className={styles.formField}
                              value={editForm.description || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, description: e.target.value })
                              }
                              style={{ margin: 0, minWidth: "250px" }}
                            />
                          </td>
                          <td>
                            <input
                              className={styles.formField}
                              type="number"
                              value={editForm.time_limit_minutes || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  time_limit_minutes: parseInt(e.target.value) || undefined,
                                })
                              }
                              style={{ margin: 0, width: "80px" }}
                            />
                          </td>
                          <td>{quiz.questions?.length || 0}</td>
                          <td>{new Date(quiz.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <button
                                className={styles.formButton}
                                onClick={handleSaveEdit}
                                disabled={updateMutation.isPending}
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.9rem",
                                  margin: 0,
                                }}
                              >
                                Save
                              </button>
                              <button
                                className={styles.formButton}
                                onClick={handleCancelEdit}
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.9rem",
                                  margin: 0,
                                  background: "#757575",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{quiz.id}</td>
                          <td><strong>{quiz.title}</strong></td>
                          <td>{quiz.description || "-"}</td>
                          <td>
                            {quiz.time_limit_minutes ? (
                              <span className={styles.badge} style={{ background: "#e3f2fd", color: "#1976d2" }}>
                                {quiz.time_limit_minutes} min
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <span className={styles.badge} style={{ background: "#e8f5e9", color: "#388e3c" }}>
                              {quiz.questions?.length || 0} questions
                            </span>
                          </td>
                          <td>{new Date(quiz.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <button
                                className={styles.formButton}
                                onClick={() => handleEdit(quiz)}
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.9rem",
                                  margin: 0,
                                  background: "#3949ab",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className={styles.formButton}
                                onClick={() => window.location.href = `/dashboard/admin/quizzes/${quiz.id}/questions`}
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.9rem",
                                  margin: 0,
                                  background: "#00897b",
                                }}
                              >
                                Questions
                              </button>
                              <button
                                className={styles.formButton}
                                onClick={() => handleDelete(quiz.id)}
                                disabled={deleteMutation.isPending}
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.9rem",
                                  margin: 0,
                                  background: "#d32f2f",
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
