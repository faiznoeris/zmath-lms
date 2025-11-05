"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert,
  Chip,
  Paper,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DescriptionIcon from "@mui/icons-material/Description";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { fetchMaterialById } from "@/src/services/material.service";
import { getYouTubeVideoId } from "@/src/utils/youtube";

export default function MaterialDetailPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = params.materialId as string;
  const lessonId = params.lessonId as string;
  const courseId = params.id as string;

  // Fetch material
  const { data: material, isLoading, error } = useQuery({
    queryKey: ["material", materialId],
    queryFn: async () => {
      const result = await fetchMaterialById(materialId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!materialId,
  });

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Alert severity="error">
          Error loading material: {error.message}
        </Alert>
      </Box>
    );
  }

  // Render content based on material type
  const renderContent = () => {
    if (!material || !material.content_url) {
      return (
        <Alert severity="warning">
          No content available for this material.
        </Alert>
      );
    }

    switch (material.type) {
      case "video":
        // Check if it's a YouTube URL
        const videoId = getYouTubeVideoId(material.content_url);
        if (videoId) {
          return (
            <Box
              sx={{
                position: "relative",
                paddingBottom: "56.25%", // 16:9 aspect ratio
                height: 0,
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={material.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </Box>
          );
        }
        // For other video URLs
        return (
          <video
            controls
            style={{
              width: "100%",
              maxHeight: "600px",
              borderRadius: "8px",
            }}
          >
            <source src={material.content_url} />
            Your browser does not support the video tag.
          </video>
        );

      case "document":
        // Check if it's a PDF
        if (material.content_url.toLowerCase().endsWith(".pdf")) {
          return (
            <Box
              sx={{
                width: "100%",
                height: "800px",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <iframe
                src={material.content_url}
                title={material.title}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </Box>
          );
        }
        // For other documents, provide download link
        return (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <DescriptionIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Document Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click the button below to view or download the document.
            </Typography>
            <Link
              href={material.content_url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-block",
                px: 3,
                py: 1.5,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: 1,
                textDecoration: "none",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              Open Document
            </Link>
          </Paper>
        );

      default:
        return (
          <Alert severity="info">
            <Typography variant="body1">
              Material URL:{" "}
              <Link href={material.content_url} target="_blank" rel="noopener noreferrer">
                {material.content_url}
              </Link>
            </Typography>
          </Alert>
        );
    }
  };

  const getIcon = () => {
    switch (material?.type) {
      case "video":
        return <VideoLibraryIcon sx={{ fontSize: 40, color: "error.main" }} />;
      case "document":
        return <DescriptionIcon sx={{ fontSize: 40, color: "primary.main" }} />;
      default:
        return <DescriptionIcon sx={{ fontSize: 40, color: "text.secondary" }} />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={() => router.push("/dashboard/student")}
          sx={{ cursor: "pointer" }}
        >
          My Courses
        </Link>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => router.push(`/dashboard/student/courses/${courseId}`)}
          sx={{ cursor: "pointer" }}
        >
          Course Details
        </Link>
        <Link
          underline="hover"
          color="inherit"
          onClick={() =>
            router.push(`/dashboard/student/courses/${courseId}/lessons/${lessonId}`)
          }
          sx={{ cursor: "pointer" }}
        >
          Lesson
        </Link>
        <Typography color="text.primary">
          {material?.title || "Material"}
        </Typography>
      </Breadcrumbs>

      {/* Material Header */}
      {isLoading ? (
        <Skeleton variant="rectangular" height={120} sx={{ mb: 4 }} />
      ) : (
        <Card elevation={2} sx={{ mb: 4, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            {getIcon()}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" component="h1" fontWeight={600}>
                {material?.title}
              </Typography>
              <Chip
                label={material?.type.toUpperCase()}
                size="small"
                color="primary"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
          {material?.description && (
            <Typography variant="body1" color="text.secondary">
              {material.description}
            </Typography>
          )}
        </Card>
      )}

      {/* Material Content */}
      {isLoading ? (
        <Skeleton variant="rectangular" height={500} />
      ) : (
        <Card elevation={2} sx={{ p: 3 }}>
          {renderContent()}
        </Card>
      )}
    </Box>
  );
}
