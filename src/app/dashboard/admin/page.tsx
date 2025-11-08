"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUserRole } from "@/src/utils/auth";
import styles from "../dashboard.module.css";
import { LoadingBar } from "@/src/components";

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const role = await getCurrentUserRole();

      if (!role) {
        router.push("/login");
        return;
      }

      if (role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setIsLoading(false);
    };

    checkRole();
  }, [router]);

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <LoadingBar />
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dasbor Admin</h1>
        <p className={styles.subtitle}>Kelola semua aspek ZMath LMS.</p>
      </header>
      <main className={styles.main}>
        <section className={styles.section}>
          <h2>Aksi Admin</h2>
          <div className={styles.quickLinks}>
            <Link href="/dashboard/admin/users" className={styles.card}>
              <span>👥</span>
              <div>Pengaturan Pengguna</div>
            </Link>
            <Link
              href="/dashboard/admin/teacher-approvals"
              className={styles.card}
            >
              <span>✅</span>
              <div>Persetujuan Pendaftaran Guru</div>
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Manajemen Konten</h2>
          <div className={styles.quickLinks}>
            <Link href="/dashboard/teacher/courses" className={styles.card}>
              <span>🎓</span>
              <div>Buat & Kelola Kursus</div>
            </Link>
            <Link href="/dashboard/teacher/lessons" className={styles.card}>
              <span>📖</span>
              <div>Buat & Kelola Pelajaran</div>
            </Link>
            <Link href="/dashboard/teacher/materials" className={styles.card}>
              <span>📚</span>
              <div>Unggah & Kelola Materi</div>
            </Link>
            <Link href="/dashboard/teacher/quizzes" className={styles.card}>
              <span>📝</span>
              <div>Buat & Kelola Kuis</div>
            </Link>
            <Link href="/dashboard/teacher/submissions" className={styles.card}>
              <span>✍️</span>
              <div>Tinjau Pengumpulan</div>
            </Link>
            <Link href="/dashboard/teacher/enrollments" className={styles.card}>
              <span>👥</span>
              <div>Pendaftaran Siswa</div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
