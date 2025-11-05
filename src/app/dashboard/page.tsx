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
        router.push("/login");
        return;
      }

      // Redirect based on role
      if (role === "teacher" || role === "admin") {
        router.push("/dashboard/teacher");
        return;
      }

      if (role === "student") {
        router.push("/dashboard/student");
        return;
      }

      setIsLoading(false);
    };

    checkRole();
  }, [router]);

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <div style={{ textAlign: "center", padding: "3rem" }}>Loading...</div>
      </div>
    );
  }

  return <div />;
}
