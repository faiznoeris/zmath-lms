"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuthStore } from "@/src/stores";
import UserMenu from "../UserMenu/UserMenu.component";

const simpleMenuItems = [
  { label: "Beranda", href: "/" },
  { label: "Petunjuk", href: "/petunjuk" },
  // { label: "Evaluasi", href: "/evaluasi" },
  { label: "Referensi", href: "/referensi" },
  { label: "Hubungi Kami", href: "/hubungi-kami" },
];

const Header = () => {
  const pathname = usePathname();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  // Check if current path is dashboard
  const isDashboard = pathname?.startsWith("/dashboard");

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

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
            }}
          >
            ZMATH
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        {!isDashboard && (
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            {simpleMenuItems.map(item => (
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
          </Box>
        )}

        {/* Search and Mobile Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              sx={{
                color: "white",
                borderColor: "rgba(255, 255, 255, 0.5)",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Login
            </Button>
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
          {simpleMenuItems.map(item => (
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
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
