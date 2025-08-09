"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Alert,
} from "@mui/material";
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  MenuBook as MenuBookIcon,
  Quiz as QuizIcon,
  Assessment as AssessmentIcon,
  LibraryBooks as LibraryBooksIcon,
  ContactMail as ContactMailIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import Header from "../components/Header";

const PetunjukPage = () => {
  const navigationItems = [
    {
      icon: <SchoolIcon />,
      title: "Beranda",
      description: "Halaman utama ZMATH dengan pengantar platform pembelajaran",
      color: "#2563eb",
    },
    {
      icon: <AssignmentIcon />,
      title: "Petunjuk",
      description: "Panduan lengkap penggunaan platform ZMATH",
      color: "#059669",
    },
    {
      icon: <MenuBookIcon />,
      title: "Materi",
      description: "Akses materi pembelajaran matematika dalam format PDF",
      color: "#dc2626",
    },
    {
      icon: <QuizIcon />,
      title: "Latihan Soal",
      description: "Kumpulan soal latihan untuk mengasah kemampuan",
      color: "#7c3aed",
    },
    {
      icon: <AssessmentIcon />,
      title: "Evaluasi",
      description: "System evaluasi pembelajaran dengan feedback",
      color: "#ea580c",
    },
    {
      icon: <LibraryBooksIcon />,
      title: "Referensi",
      description: "Koleksi buku dan sumber referensi matematika",
      color: "#0891b2",
    },
    {
      icon: <ContactMailIcon />,
      title: "Hubungi Kami",
      description: "Informasi kontak dan formulir komunikasi",
      color: "#be123c",
    },
  ];

  const usageSteps = [
    {
      step: 1,
      title: "Mulai dari Beranda",
      description: "Akses halaman utama untuk melihat overview platform",
    },
    {
      step: 2,
      title: "Baca Petunjuk",
      description: "Pahami cara penggunaan platform melalui halaman ini",
    },
    {
      step: 3,
      title: "Akses Materi",
      description: "Pelajari materi pembelajaran melalui file PDF yang tersedia",
    },
    {
      step: 4,
      title: "Kerjakan Latihan",
      description: "Uji pemahaman dengan mengerjakan soal-soal latihan",
    },
    {
      step: 5,
      title: "Ikuti Evaluasi",
      description: "Lakukan evaluasi untuk mengukur tingkat pemahaman",
    },
  ];

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
              "&::before": {
                content: "'•'",
                color: "primary.main",
                fontSize: "2rem",
                mr: 1,
              },
            }}
          >
            Petunjuk Penggunaan
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Panduan lengkap untuk menggunakan platform pembelajaran matematika ZMATH
          </Typography>
        </Box>

        <Alert 
          severity="info" 
          sx={{ mb: 4, borderRadius: 2 }}
          icon={<LightbulbIcon />}
        >
          Platform ZMATH dirancang untuk memberikan pengalaman pembelajaran matematika yang 
          interaktif dan mudah dipahami. Ikuti petunjuk berikut untuk memaksimalkan penggunaan platform.
        </Alert>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 3,
            mb: 4,
          }}
        >
          {/* Navigation Guide */}
          <Card sx={{ flex: 2, borderRadius: 3, overflow: "hidden" }}>
            <CardHeader
              title="Menu Navigasi"
              sx={{
                background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                color: "white",
                "& .MuiCardHeader-title": {
                  fontWeight: 600,
                },
              }}
            />
            <CardContent sx={{ p: 0 }}>
              <List sx={{ py: 0 }}>
                {navigationItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      sx={{
                        py: 2,
                        px: 3,
                        "&:hover": {
                          backgroundColor: "rgba(37, 99, 235, 0.05)",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: item.color,
                          minWidth: 56,
                          "& .MuiSvgIcon-root": {
                            fontSize: "2rem",
                          },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={item.description}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        }}
                        secondaryTypographyProps={{
                          color: "text.secondary",
                          sx: { mt: 0.5 },
                        }}
                      />
                    </ListItem>
                    {index < navigationItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Usage Steps */}
          <Card sx={{ flex: 1, borderRadius: 3, overflow: "hidden" }}>
            <CardHeader
              title="Langkah Penggunaan"
              sx={{
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                color: "white",
                "& .MuiCardHeader-title": {
                  fontWeight: 600,
                },
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {usageSteps.map((step, index) => (
                  <Paper
                    key={index}
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {step.step}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Additional Tips */}
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <CardHeader
            title="Tips Pembelajaran"
            sx={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              color: "white",
              "& .MuiCardHeader-title": {
                fontWeight: 600,
              },
            }}
          />
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleIcon color="success" />
                  Hal yang Perlu Diperhatikan
                </Typography>
                <List sx={{ pl: 2 }}>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <PlayArrowIcon sx={{ fontSize: "1rem" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Pastikan koneksi internet stabil untuk akses materi PDF"
                      primaryTypographyProps={{ fontSize: "0.9rem" }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <PlayArrowIcon sx={{ fontSize: "1rem" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Gunakan browser modern untuk pengalaman optimal"
                      primaryTypographyProps={{ fontSize: "0.9rem" }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <PlayArrowIcon sx={{ fontSize: "1rem" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Kerjakan latihan soal secara bertahap"
                      primaryTypographyProps={{ fontSize: "0.9rem" }}
                    />
                  </ListItem>
                </List>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <LightbulbIcon color="warning" />
                  Rekomendasi Belajar
                </Typography>
                <List sx={{ pl: 2 }}>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <PlayArrowIcon sx={{ fontSize: "1rem" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Pelajari materi terlebih dahulu sebelum mengerjakan soal"
                      primaryTypographyProps={{ fontSize: "0.9rem" }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <PlayArrowIcon sx={{ fontSize: "1rem" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Manfaatkan referensi untuk memperdalam pemahaman"
                      primaryTypographyProps={{ fontSize: "0.9rem" }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <PlayArrowIcon sx={{ fontSize: "1rem" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Hubungi kami jika mengalami kesulitan"
                      primaryTypographyProps={{ fontSize: "0.9rem" }}
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default PetunjukPage;
