import React from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  TextFieldProps,
} from "@mui/material";
import { VisibilityOff, Visibility } from "@mui/icons-material";

type PasswordFieldProps = Omit<TextFieldProps, "type">;

const PasswordField = ({
  error,
  label,
  helperText,
  ...restProps
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword(show => !show);

  return (
    <TextField
      error={error}
      label={label}
      helperText={helperText}
      type={showPassword ? "text" : "password"}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={
                  showPassword ? "hide the password" : "display the password"
                }
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...restProps}
    />
  );
};

export default PasswordField;
