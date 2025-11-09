"use client";

import React, { useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";

interface MathPreviewProps {
  content: string;
  title?: string;
  onlyPreview?: boolean;
}

export default function MathPreview({
  content,
  title = "Preview",
  onlyPreview = false,
}: MathPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== "undefined") {
      // Import mathpix-markdown-it dynamically
      import("mathpix-markdown-it")
        .then(module => {
          const { MathpixMarkdownModel } = module;

          if (!MathpixMarkdownModel) {
            console.error("MathpixMarkdownModel not found");
            return;
          }

          try {
            const options = {
              htmlTags: true,
              width: 800,
            };

            // Use the markdownToHTML method
            const html = MathpixMarkdownModel.markdownToHTML(
              content || "",
              options
            );

            if (containerRef.current) {
              containerRef.current.innerHTML = html;
            }
          } catch (error) {
            console.error("Error rendering markdown:", error);
            if (containerRef.current) {
              containerRef.current.innerHTML = `<p style="color: red;">Error rendering preview</p>`;
            }
          }
        })
        .catch(error => {
          console.error("Error loading mathpix-markdown-it:", error);
        });
    }
  }, [content]);

  return onlyPreview ? (
    <Box
      ref={containerRef}
      sx={{
        "& p": { mb: 1 },
        "& p:last-child": { mb: 0 },
        "& .math-inline": { display: "inline" },
        "& .math-display": {
          display: "block",
          my: 2,
          textAlign: "center",
          fontSize: "1.1rem",
        },
        fontSize: "1rem",
        lineHeight: 1.7,
        color: "text.primary",
      }}
    />
  ) : (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: "grey.50",
        minHeight: 100,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1, display: "block", fontWeight: 600 }}
      >
        {title}
      </Typography>
      <Box
        ref={containerRef}
        sx={{
          "& p": { mb: 1 },
          "& p:last-child": { mb: 0 },
          "& .math-inline": { display: "inline" },
          "& .math-display": { display: "block", my: 1, textAlign: "center" },
          fontSize: "0.95rem",
          lineHeight: 1.6,
        }}
      >
        {!content && (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            Type something to see preview...
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
