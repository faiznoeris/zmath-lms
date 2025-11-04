"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserRole } from "@/src/utils/auth";
import styles from "./dashboard.module.css";

export default function DashboardHome() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const role = await getCurrentUserRole();
      
      if (!role) {
        router.push('/login');
        return;
      }
      
      // Redirect based on role
      if (role === 'teacher' || role === 'admin') {
        router.push('/dashboard/teacher');
        return;
      }
      
      if (role === 'student') {
        router.push('/dashboard/student');
        return;
      }
      
      setIsLoading(false);
    };
    
    checkRole();
  }, [router]);

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome to ZMath Dashboard</h1>
        <p className={styles.subtitle}>Your personalized math learning journey starts here.</p>
      </header>
      <main className={styles.main}>
        <section className={styles.section}>
          <h2>Quick Access</h2>
          <div className={styles.quickLinks}>
            <a href="/materi" className={styles.card}>
              <span>📚</span>
              <div>Materials</div>
            </a>
            <a href="/latihan-soal" className={styles.card}>
              <span>📝</span>
              <div>Practice</div>
            </a>
            <a href="/evaluasi" className={styles.card}>
              <span>🎯</span>
              <div>Evaluation</div>
            </a>
            <a href="/referensi" className={styles.card}>
              <span>🔗</span>
              <div>References</div>
            </a>
          </div>
        </section>
        <section className={styles.section}>
          <h2>Progress Overview</h2>
          <div className={styles.progressBox}>
            {/* TODO: Replace with real progress data */}
            <div className={styles.progressLabel}>Lessons Completed</div>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBar} style={{ width: "60%" }} />
            </div>
            <div className={styles.progressPercent}>60%</div>
          </div>
        </section>
      </main>
    </div>
  );
}
