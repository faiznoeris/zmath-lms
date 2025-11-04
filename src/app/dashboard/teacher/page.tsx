"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserRole } from "@/src/utils/auth";
import styles from "../dashboard.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const role = await getCurrentUserRole();
      
      if (!role) {
        router.push('/login');
        return;
      }
      
      // Only allow teachers and admins
      if (role === 'student') {
        router.push('/dashboard');
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
        <h1 className={styles.title}>Teacher Dashboard</h1>
        <p className={styles.subtitle}>Manage quizzes and materials for ZMath.</p>
      </header>
      <main className={styles.main}>
        <section className={styles.section}>
          <h2>Teacher Actions</h2>
          <div className={styles.quickLinks}>
            <a href="/dashboard/teacher/courses" className={styles.card}>
              <span>🎓</span>
              <div>Create & Manage Courses</div>
            </a>
            <a href="/dashboard/teacher/lessons" className={styles.card}>
              <span>📖</span>
              <div>Create & Manage Lessons</div>
            </a>
            <a href="/dashboard/teacher/quizzes" className={styles.card}>
              <span>📝</span>
              <div>Create & Manage Quizzes</div>
            </a>
            <a href="/dashboard/teacher/materials" className={styles.card}>
              <span>📚</span>
              <div>Upload & Manage Materials</div>
            </a>
            <a href="/dashboard/teacher/enrollments" className={styles.card}>
              <span>👥</span>
              <div>Student Enrollments</div>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
