"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const router = useRouter();

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 3 }}
    >
      {/* Always include Home as first item */}
      <Link
        underline="hover"
        sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        color="inherit"
        onClick={() => router.push("/dashboard")}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
        Dashboard
      </Link>

      {/* Render dynamic breadcrumb items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast) {
          // Last item is not clickable
          return (
            <Typography
              key={index}
              sx={{ display: "flex", alignItems: "center" }}
              color="text.primary"
            >
              {item.icon && (
                <span style={{ display: "flex", marginRight: "4px" }}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </Typography>
          );
        }

        // Middle items are clickable
        return (
          <Link
            key={index}
            underline="hover"
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            color="inherit"
            onClick={() => item.href && router.push(item.href)}
          >
            {item.icon && (
              <span style={{ display: "flex", marginRight: "4px" }}>
                {item.icon}
              </span>
            )}
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
