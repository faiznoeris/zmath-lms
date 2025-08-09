import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import Link from "next/link";

export default function Hero() {
  return (
    <Box
      component="section"
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 4, md: 8 },
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 700,
                color: "text.primary",
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              Selamat Datang di{" "}
              <Typography
                component="span"
                sx={{
                  color: "primary.main",
                  fontSize: "inherit",
                  fontWeight: "inherit",
                }}
              >
                Zona Matematika
              </Typography>
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "1rem", md: "1.25rem" },
                color: "text.secondary",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Pelajari Barisan dan Deret Aritmatika dan Geometri dengan mudah dan
              menyenangkan
            </Typography>
            
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" }, justifyContent: { xs: "center", md: "flex-start" } }}>
              <Button
                component={Link}
                href="/materi"
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  boxShadow: 3,
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Mulai Belajar
              </Button>
              
              <Button
                component={Link}
                href="/petunjuk"
                variant="outlined"
                size="large"
                startIcon={<MenuBookIcon />}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Lihat Materi
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Paper
              elevation={8}
              sx={{
                width: { xs: 250, md: 350 },
                height: { xs: 250, md: 350 },
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  textAlign: "center",
                }}
              >
                📚 Matematika
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
