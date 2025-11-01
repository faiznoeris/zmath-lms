"use client";
import React from "react";
import styles from "../dashboard.module.css";

export default function AdminDashboard() {
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Manage quizzes and materials for ZMath.</p>
      </header>
      <main className={styles.main}>
        <section className={styles.section}>
          <h2>Admin Actions</h2>
          <div className={styles.quickLinks}>
            <a href="/dashboard/teacher/quizzes/list" className={styles.card}>
              <span>📝</span>
              <div>Create & Manage Quizzes</div>
            </a>
            <a href="/dashboard/teacher/materials/list" className={styles.card}>
              <span>📚</span>
              <div>Upload & Manage Materials</div>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
