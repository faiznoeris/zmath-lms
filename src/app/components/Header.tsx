"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import Link from "next/link";

const Header = () => {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [materiMenuAnchor, setMateriMenuAnchor] = useState<null | HTMLElement>(null);
  const [latihanMenuAnchor, setLatihanMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleMateriMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMateriMenuAnchor(event.currentTarget);
  };

  const handleMateriMenuClose = () => {
    setMateriMenuAnchor(null);
  };

  const handleLatihanMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLatihanMenuAnchor(event.currentTarget);
  };

  const handleLatihanMenuClose = () => {
    setLatihanMenuAnchor(null);
  };

  const handleSearchToggle = () => {
    setSearchMode(!searchMode);
    if (searchMode) {
      setSearchTerm("");
    }
  };

  const materiSubMenus = [
    { label: "Aljabar", href: "/materi" },
    { label: "Geometri", href: "/materi/geometri" },
    { label: "Kalkulus", href: "/materi/kalkulus" },
    { label: "Statistika", href: "/materi/statistika" },
    { label: "Trigonometri", href: "/materi/trigonometri" },
  ];

  const latihanSubMenus = [
    { label: "Soal Mudah", href: "/latihan-soal" },
    { label: "Soal Sedang", href: "/latihan-soal/sedang" },
    { label: "Soal Sulit", href: "/latihan-soal/sulit" },
    { label: "Soal Campuran", href: "/latihan-soal/campuran" },
  ];

  const simpleMenuItems = [
    { label: "Beranda", href: "/" },
    { label: "Petunjuk", href: "/petunjuk" },
    { label: "Evaluasi", href: "/evaluasi" },
    { label: "Referensi", href: "/referensi" },
    { label: "Hubungi Kami", href: "/hubungi-kami" },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h5"
            component={Link}
            href="/"
            sx={{
              fontWeight: 800,
              color: "white",
              textDecoration: "none",
              "&::before": {
                content: "'•'",
                color: "#fbbf24",
                fontSize: "1.5rem",
                mr: 0.5,
              },
            }}
          >
            ZMATH
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 1,
            alignItems: "center",
          }}
        >
          {simpleMenuItems.map((item) => (
            <Button
              key={item.label}
              component={Link}
              href={item.href}
              sx={{
                color: "white",
                textTransform: "none",
                px: 2,
                py: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
          
          {/* Materi Dropdown */}
          <Button
            onClick={handleMateriMenuOpen}
            endIcon={<ExpandMoreIcon />}
            sx={{
              color: "white",
              textTransform: "none",
              px: 2,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Materi
          </Button>
          <Menu
            anchorEl={materiMenuAnchor}
            open={Boolean(materiMenuAnchor)}
            onClose={handleMateriMenuClose}
            sx={{
              "& .MuiPaper-root": {
                mt: 1,
                borderRadius: 2,
                minWidth: 180,
              },
            }}
          >
            {materiSubMenus.map((item) => (
              <MenuItem
                key={item.label}
                component={Link}
                href={item.href}
                onClick={handleMateriMenuClose}
                sx={{
                  py: 1.5,
                  px: 3,
                  "&:hover": {
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                  },
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>

          {/* Latihan Soal Dropdown */}
          <Button
            onClick={handleLatihanMenuOpen}
            endIcon={<ExpandMoreIcon />}
            sx={{
              color: "white",
              textTransform: "none",
              px: 2,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Latihan Soal
          </Button>
          <Menu
            anchorEl={latihanMenuAnchor}
            open={Boolean(latihanMenuAnchor)}
            onClose={handleLatihanMenuClose}
            sx={{
              "& .MuiPaper-root": {
                mt: 1,
                borderRadius: 2,
                minWidth: 180,
              },
            }}
          >
            {latihanSubMenus.map((item) => (
              <MenuItem
                key={item.label}
                component={Link}
                href={item.href}
                onClick={handleLatihanMenuClose}
                sx={{
                  py: 1.5,
                  px: 3,
                  "&:hover": {
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                  },
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Search and Mobile Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Search */}
          {searchMode ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                placeholder="Cari..."
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                  },
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputBase-input::placeholder": { color: "rgba(255, 255, 255, 0.7)" },
                }}
              />
              <IconButton onClick={handleSearchToggle} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <IconButton onClick={handleSearchToggle} sx={{ color: "white" }}>
              <SearchIcon />
            </IconButton>
          )}

          {/* Mobile Menu Button */}
          <IconButton
            sx={{ display: { xs: "flex", md: "none" }, color: "white" }}
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiPaper-root": {
              mt: 1,
              borderRadius: 2,
              minWidth: 200,
            },
          }}
        >
          {simpleMenuItems.map((item) => (
            <MenuItem
              key={item.label}
              component={Link}
              href={item.href}
              onClick={handleMobileMenuClose}
              sx={{
                py: 1.5,
                px: 3,
                "&:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.1)",
                },
              }}
            >
              {item.label}
            </MenuItem>
          ))}
          <MenuItem
            component={Link}
            href="/materi"
            onClick={handleMobileMenuClose}
            sx={{
              py: 1.5,
              px: 3,
              "&:hover": {
                backgroundColor: "rgba(37, 99, 235, 0.1)",
              },
            }}
          >
            Materi
          </MenuItem>
          <MenuItem
            component={Link}
            href="/latihan-soal"
            onClick={handleMobileMenuClose}
            sx={{
              py: 1.5,
              px: 3,
              "&:hover": {
                backgroundColor: "rgba(37, 99, 235, 0.1)",
              },
            }}
          >
            Latihan Soal
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
