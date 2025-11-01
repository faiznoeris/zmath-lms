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
import { Logout } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/src/stores";
import { stringAvatar } from "@/src/utils/stringAvatar";

import { logoutUser } from "./actions";

const UserMenu = () => {
  const user = useAuthStore(state => state.user);
  const router = useRouter();

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

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

  return (
    <Box>
      <Tooltip title="Open Menu">
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
        <MenuItem onClick={handleLogoutBtn}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;
