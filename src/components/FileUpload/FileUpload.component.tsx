"use client";

import React, { useState } from "react";
import { Button, styled, Typography } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

interface FileUploaderProps {
  items: string;
  acceptedFile: string;
  inputError?: string | undefined;
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const FileUploader = ({
  items,
  acceptedFile,
  inputError,
}: FileUploaderProps) => {
  const [filename, setFilename] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFilename(files[0].name);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        component="label"
        role={undefined}
        variant="outlined"
        tabIndex={-1}
        startIcon={<CloudUpload />}
        className="flex-none"
      >
        {items}
        <VisuallyHiddenInput
          type="file"
          accept={acceptedFile}
          onChange={event => handleChange(event)}
        />
      </Button>
      {inputError ? (
        <Typography className="text-error">{inputError}</Typography>
      ) : (
        <Typography className="line-clamp-1">{filename}</Typography>
      )}
    </div>
  );
};

export default FileUploader;
