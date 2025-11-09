import React from "react";
import { Modal, Box, Typography, IconButton, Fade, Backdrop } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number | string;
  actions?: React.ReactNode; // Optional footer actions
}

const ModalComponent = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 500,
  actions,
}: ModalComponentProps) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        },
      }}
    >
      <Fade in={isOpen}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: maxWidth,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            p: 0,
            outline: "none",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 3,
              pb: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              id="modal-title"
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                fontSize: "1.25rem",
                color: "text.primary",
              }}
            >
              {title}
            </Typography>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box
            id="modal-description"
            sx={{
              p: 3,
              pt: 2.5,
              pb: actions ? 2 : 3, // Less bottom padding if there are actions
            }}
          >
            {children}
          </Box>

          {/* Footer Actions */}
          {actions && (
            <Box
              sx={{
                p: 3,
                pt: 0,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                "& > button": {
                  minWidth: 100,
                },
                paddingTop: 2
              }}
            >
              {actions}
            </Box>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalComponent;
