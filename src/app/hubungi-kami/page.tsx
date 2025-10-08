"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  Email as EmailIcon,
  AlternateEmail as AlternateEmailIcon,
  AccountCircle as AccountCircleIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";

const HubungiKamiPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (formData.name && formData.email && formData.message) {
      alert("Terima kasih! Pesan Anda telah terkirim.");
      setFormData({ name: "", email: "", message: "" });
    } else {
      alert("Mohon lengkapi semua field.");
    }
  };

  const contactOptions = [
    {
      icon: <LocationOnIcon />,
      title: "Lihat Lokasi",
      subtitle: "Kunjungi kami",
      href: "#map",
    },
    {
      icon: <EmailIcon />,
      title: "Kirim Pesan",
      subtitle: "Hubungi via formulir",
      href: "#pesan",
    },
    {
      icon: <AlternateEmailIcon />,
      title: "Kirim Surel",
      subtitle: "contact@zmath.id",
      href: "mailto:contact@zmath.id",
    },
    {
      icon: <AccountCircleIcon />,
      title: "Lihat Akun",
      subtitle: "Profil media sosial",
      href: "#",
    },
  ];

  const socialIcons = [
    { icon: <FacebookIcon />, href: "#" },
    { icon: <TwitterIcon />, href: "#" },
    { icon: <InstagramIcon />, href: "#" },
    { icon: <YouTubeIcon />, href: "#" },
    { icon: <LinkedInIcon />, href: "#" },
  ];

  return (
    <>
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
            Hubungi Kami
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 3,
            mb: 4,
          }}
        >
          {/* Profile Card */}
          <Card sx={{ flex: 1, borderRadius: 3, overflow: "hidden" }}>
            <CardHeader
              title="Profil Pengembangan"
              sx={{
                background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                color: "white",
                "& .MuiCardHeader-title": {
                  fontWeight: 600,
                },
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                  alignItems: { xs: "center", md: "flex-start" },
                }}
              >
                <Box
                  sx={{
                    width: 150,
                    height: 180,
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: 3,
                  }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                    alt="Foto Idhata Nurbaiti"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}
                  >
                    Idhata Nurbaiti
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • Lahir: Banyumas, 1 Juni 1993
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • Pendidikan:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      1. TK{" "}
                      <Chip label="Diponogoro 49 Purwokerto" size="small" />
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      2. SD Negeri 1 <Chip label="Karang Klesem" size="small" />
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      3. SMP Negeri 5 <Chip label="Purwokerto" size="small" />
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      4. SMA Negeri 1 Patikraja
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      5. Universitas Muh.{" "}
                      <Chip label="Purwoekrto" size="small" />
                    </Typography>
                  </Box>
                  <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Dosen Pembimbing:
                    </Typography>
                    <Chip
                      label="Dr. Akhamd Jazuli M.Si"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card sx={{ flex: 1, borderRadius: 3, overflow: "hidden" }}>
            <CardHeader
              title="Hubungi Kami"
              sx={{
                background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
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
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                  mb: 3,
                }}
              >
                {contactOptions.map((option, index) => (
                  <Button
                    key={index}
                    component={Link}
                    href={option.href}
                    variant="outlined"
                    sx={{
                      p: 2,
                      flexDirection: "column",
                      gap: 1,
                      height: "auto",
                      textTransform: "none",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: 3,
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Box sx={{ color: "primary.main", fontSize: "2rem" }}>
                      {option.icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.subtitle}
                    </Typography>
                  </Button>
                ))}
              </Box>

              <Box component="form" onSubmit={handleSubmit} id="pesan">
                <TextField
                  fullWidth
                  label="Nama"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="Masukkan nama Anda"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="Masukkan email Anda"
                />
                <TextField
                  fullWidth
                  label="Pesan"
                  name="message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="Tuliskan pesan Anda di sini..."
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={<SendIcon />}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  Kirim Pesan
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Map Section */}
        <Box
          id="map"
          sx={{
            height: 300,
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
            boxShadow: 2,
          }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.2738344603237!2d109.23596731477673!3d-7.431419594634039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e655ea49d9f9885%3A0x62be0b6159700ec9!2sUniversitas%20Muhammadiyah%20Purwokerto!5e0!3m2!1sen!2sid!4v1633586919038!5m2!1sen!2sid"
            allowFullScreen
            loading="lazy"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </Box>

        {/* Social Media Icons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          {socialIcons.map((social, index) => (
            <IconButton
              key={index}
              component={Link}
              href={social.href}
              sx={{
                width: 56,
                height: 56,
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "translateY(-5px) rotate(10deg)",
                  boxShadow: 4,
                },
                transition: "all 0.3s ease",
              }}
            >
              {social.icon}
            </IconButton>
          ))}
        </Box>
      </Container>
    </>
  );
};

export default HubungiKamiPage;
