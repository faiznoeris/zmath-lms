"use client";

import React from "react";
import {
  Box,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  ListItemIcon,
} from "@mui/material";
import { Home, Logout } from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/src/stores";
import { stringAvatar } from "@/src/utils/stringAvatar";

import { logoutUser } from "./actions";

const UserMenu = () => {
  const pathname = usePathname();
  const user = useAuthStore(state => state.user);
  const router = useRouter();

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const isDashboard = pathname?.startsWith("/dashboard");

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogoutBtn = async () => {
    await logoutUser();
    router.push("/login");
  };

  const handleRedirectToDashboard = () => {
    router.push("/dashboard"); // will redirect based on role
  };

  return (
    <Box>
      <Tooltip title="Buka Menu">
        <IconButton onClick={handleOpenUserMenu}>
          <Avatar {...stringAvatar(user?.user_metadata?.display_name)} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorElUser}
        keepMounted
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {!isDashboard && (
          <MenuItem onClick={handleRedirectToDashboard}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <Typography>Dasbor</Typography>
          </MenuItem>
        )}
        <MenuItem onClick={handleLogoutBtn}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <Typography>Keluar</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;
