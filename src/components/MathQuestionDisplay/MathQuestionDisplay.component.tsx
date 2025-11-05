"use client";

import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";

interface MathQuestionDisplayProps {
  question: string;
  questionNumber?: number;
}

export default function MathQuestionDisplay({ 
  question, 
  questionNumber 
}: MathQuestionDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== "undefined") {
      // Import mathpix-markdown-it dynamically
      import("mathpix-markdown-it").then((module) => {
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
          
          const html = MathpixMarkdownModel.markdownToHTML(question || "", options);
          
          if (containerRef.current) {
            containerRef.current.innerHTML = html;
          }
        } catch (error) {
          console.error("Error rendering question:", error);
          if (containerRef.current) {
            containerRef.current.innerHTML = question || "";
          }
        }
      }).catch((error) => {
        console.error("Error loading mathpix-markdown-it:", error);
        // Fallback to plain text
        if (containerRef.current) {
          containerRef.current.innerHTML = question || "";
        }
      });
    }
  }, [question]);

  return (
    <Box>
      {questionNumber && (
        <Typography 
          variant="subtitle2" 
          color="primary" 
          fontWeight={600} 
          sx={{ mb: 1 }}
        >
          Question {questionNumber}
        </Typography>
      )}
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
    </Box>
  );
}
