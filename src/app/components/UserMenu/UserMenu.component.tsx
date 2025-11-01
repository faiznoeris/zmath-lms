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

  function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name: string) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(" ")[0][0].toUpperCase()}${name.split(" ")[1][0].toUpperCase()}`,
    };
  }

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
