"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Skeleton,
  Alert,
  Chip,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { fetchMyEnrollments } from "@/src/services/enrollment.service";
import { EnrollmentWithDetails } from "@/src/models/Enrollment";

export default function StudentDashboard() {
  const router = useRouter();

  // Fetch student's enrolled courses
  const { data: enrollments = [], isLoading, error } = useQuery<EnrollmentWithDetails[]>({
    queryKey: ["student-enrollments"],
    queryFn: async () => {
      const result = await fetchMyEnrollments();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch enrollments");
      }
      return result.data || [];
    },
  });

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Alert severity="error">
          Kesalahan memuat kursus: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <SchoolIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h3" component="h1" fontWeight={600}>
            Kursus Saya
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Kursus yang Anda ikuti
        </Typography>
      </Box>

      {/* Loading State */}
      {isLoading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} variant="rectangular" height={200} />
          ))}
        </Box>
      ) : enrollments.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
          }}
        >
          <MenuBookIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Belum Ada Kursus
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Anda belum terdaftar di kursus apapun. Hubungi guru Anda untuk memulai.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {enrollments.map((enrollment) => (
            <Card
              key={enrollment.id}
              elevation={2}
              sx={{
                height: "100%",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                onClick={() =>
                  router.push(
                    `/dashboard/student/courses/${enrollment.course_id}`
                  )
                }
                sx={{ height: "100%", p: 2 }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <SchoolIcon
                      sx={{ fontSize: 32, color: "primary.main", mr: 1 }}
                    />
                    <Typography variant="h6" component="h2" fontWeight={600}>
                      {enrollment.course?.title || "Kursus Tanpa Judul"}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {enrollment.course?.description || "Tidak ada deskripsi"}
                  </Typography>
                  <Chip
                    label="Terdaftar"
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
