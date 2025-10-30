"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import styles from "./latihan-soal.module.css";

interface Quiz {
  id: number;
  title: string;
  description?: string;
  time_limit: number;
  passing_score: number;
  is_active: boolean;
  created_at: string;
  questions?: any[];
}

interface Result {
  id: number;
  user_id: string;
  quiz_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  submitted_at: string;
  quiz?: Quiz;
}

async function fetchQuizzesApi(quizId?: string): Promise<Quiz[]> {
  const supabase = createClient();
  let query = supabase
    .from("quizzes")
    .select("*, questions(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  
  // If quizId is provided, filter by it
  if (quizId) {
    query = query.eq("id", quizId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function fetchUserResultsApi(): Promise<Result[]> {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("results")
    .select("*, quiz:quizzes(title)")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export default function LatihanSoalPage() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get("id");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const { data: quizzes, isLoading: quizzesLoading, error: quizzesError } = useQuery({
    queryKey: ["quizzes-public", quizId],
    queryFn: () => fetchQuizzesApi(quizId || undefined),
  });

  const { data: results, isLoading: resultsLoading, error: resultsError } = useQuery({
    queryKey: ["user-results"],
    queryFn: fetchUserResultsApi,
  });

  // Auto-select quiz if coming from header menu
  useEffect(() => {
    if (quizId && quizzes && quizzes.length === 1) {
      setSelectedQuiz(quizzes[0]);
      setShowPreview(true);
    }
  }, [quizId, quizzes]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleStartClick = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowPreview(true);
  };

  const handleBackClick = () => {
    setShowPreview(false);
  };

  const handleStartTest = () => {
    alert("Ujian akan dimulai!");
    // Add logic to start the actual test
  };

  return (
    <>
      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>LATIHAN SOAL</h1>
        </div>

        <div className={styles.instructionContainer}>
          <div className={styles.instruction}>
            <p>Berdoalah sebelum memulai Latihan soal</p>
          </div>
          <div className={styles.instruction}>
            <p>Siapkan kertas alat tulis lainnya untuk melakukan perhitungan</p>
          </div>
          <div className={styles.instruction}>
            <p>Fokus dan konsentrasi selama mengerjakan soal</p>
          </div>
          <div className={styles.instruction}>
            <p>Kerjakan soal - soal berikut sesuai dengan kemampuan Anda</p>
          </div>
          <div className={styles.instruction}>
            <p>Latihan Soal berbentuk pilihan ganda</p>
          </div>
        </div>

        {!showPreview && (
          <>
            {/* Available Quizzes */}
            <div style={{ marginTop: "2rem" }}>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>Soal Tersedia</h2>
              
              {quizzesLoading && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  Memuat soal...
                </div>
              )}

              {quizzesError && (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div style={{ color: "#d32f2f", marginBottom: "1rem" }}>
                    Error: {quizzesError instanceof Error ? quizzesError.message : "Gagal memuat soal"}
                  </div>
                </div>
              )}

              {quizzes && quizzes.length === 0 && !quizzesLoading && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  Belum ada soal tersedia.
                </div>
              )}

              {quizzes && quizzes.length > 0 && (
                <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
                  {quizzes.map((quiz) => (
                    <div 
                      key={quiz.id}
                      style={{
                        background: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                        <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#1a1a1a" }}>{quiz.title}</h3>
                        <span style={{
                          background: "#e3f2fd",
                          color: "#1976d2",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontSize: "0.875rem",
                          fontWeight: "500"
                        }}>
                          {quiz.questions?.length || 0} soal
                        </span>
                      </div>
                      
                      {quiz.description && (
                        <p style={{ margin: "0.5rem 0", color: "#666", fontSize: "0.95rem" }}>
                          {quiz.description}
                        </p>
                      )}
                      
                      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", fontSize: "0.9rem", color: "#888" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span>⏱️</span>
                          <span>{formatDuration(quiz.time_limit)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span>📊</span>
                          <span>Nilai minimum: {quiz.passing_score}</span>
                        </div>
                      </div>
                      
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleStartClick(quiz)}
                        style={{ marginTop: "1rem", width: "auto" }}
                      >
                        Mulai Mengerjakan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Previous Attempts */}
            <div style={{ marginTop: "3rem" }}>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>Riwayat Pengerjaan</h2>
              
              {resultsLoading && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  Memuat riwayat...
                </div>
              )}

              {resultsError && (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div style={{ color: "#d32f2f", marginBottom: "1rem" }}>
                    Error: {resultsError instanceof Error ? resultsError.message : "Gagal memuat riwayat"}
                  </div>
                </div>
              )}

              {results && results.length === 0 && !resultsLoading && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  Belum ada riwayat pengerjaan. Silakan login dan mulai mengerjakan soal.
                </div>
              )}

              {results && results.length > 0 && (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Jenis Soal</th>
                      <th>Nilai</th>
                      <th>Benar/Total</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={result.id}>
                        <td>{formatDate(result.submitted_at)}</td>
                        <td>{result.quiz?.title || "Unknown Quiz"}</td>
                        <td>
                          <span style={{
                            color: result.score >= 70 ? "#4caf50" : "#f44336",
                            fontWeight: "bold"
                          }}>
                            {result.score}
                          </span>
                        </td>
                        <td>{result.correct_answers}/{result.total_questions}</td>
                        <td>{Math.floor(result.time_taken / 60)} menit</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {showPreview && selectedQuiz && (
          <div className={styles.previewContainer}>
            <div className={styles.previewHeading}>
              <h2>{selectedQuiz.title}</h2>
              <p>Waktu: {formatDuration(selectedQuiz.time_limit)}</p>
              <p>Jumlah Soal: {selectedQuiz.questions?.length || 0}</p>
              <p>Nilai Minimum: {selectedQuiz.passing_score}</p>
            </div>

            {selectedQuiz.description && (
              <div style={{ 
                padding: "1rem", 
                background: "#f5f5f5", 
                borderRadius: "8px", 
                marginBottom: "1.5rem" 
              }}>
                <p style={{ margin: 0 }}>{selectedQuiz.description}</p>
              </div>
            )}

            <div style={{ 
              padding: "1.5rem", 
              background: "#fff3e0", 
              borderRadius: "8px",
              border: "1px solid #ffb74d",
              marginBottom: "1.5rem"
            }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "#e65100" }}>⚠️ Instruksi Penting</h3>
              <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                <li>Pastikan koneksi internet Anda stabil</li>
                <li>Jangan refresh atau keluar dari halaman saat mengerjakan</li>
                <li>Waktu akan mulai berjalan setelah Anda klik "Mulai Ujian"</li>
                <li>Jawaban akan otomatis tersimpan</li>
              </ul>
            </div>

            <div className={styles.controls}>
              <button
                className={styles.secondaryButton}
                onClick={handleBackClick}
              >
                Kembali
              </button>
              <button className={styles.actionButton} onClick={handleStartTest}>
                Mulai Ujian
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
