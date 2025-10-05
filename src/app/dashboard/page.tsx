"use client";
import React from "react";
import styles from "./dashboard.module.css";

export default function DashboardHome() {
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
