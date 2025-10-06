import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';

import styles from './RegisterForm.module.css';

interface RegisterFormInputs {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Simulate register API call
async function registerApi(data: RegisterFormInputs) {
  await new Promise(res => setTimeout(res, 1000));
  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match');
  }
  // Simulate username taken
  if (data.username === 'admin') {
    throw new Error('Username already taken');
  }
  return { success: true };
}

const RegisterForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword(show => !show);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();
  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: data => {
      // TODO: handle successful registration (e.g., redirect to login)
      // window.location.href = "/login";
    },
  });

  const onSubmit = (data: RegisterFormInputs) => {
    mutation.reset();
    mutation.mutate(data);
  };

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.title}>Register</h2>
      <TextField
        error={!!errors.username}
        label="Username"
        helperText={errors.username?.message}
        {...register('username', { required: 'Username is required' })}
      />
      <TextField
        error={!!errors.email}
        label="Email"
        helperText={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />
      <TextField
        error={!!errors.password}
        label="Password"
        helperText={errors.password?.message}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? 'hide the password' : 'display the password'
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
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        })}
      />
      <TextField
        error={!!errors.confirmPassword}
        label="Confirm Password"
        helperText={errors.confirmPassword?.message}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? 'hide the password' : 'display the password'
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
        {...register('confirmPassword', {
          required: 'Please confirm your password',
        })}
      />
      {mutation.isError && mutation.error instanceof Error && (
        <Alert severity="error">{mutation.error.message}</Alert>
      )}
      <div className={styles.actionButtons}>
        <Button
          loading={mutation.isPending}
          disabled={mutation.isPending}
          variant="contained"
          type="submit"
        >
          Register
        </Button>
        <Button onClick={() => (window.location.href = '/login')}>
          Back to Login
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;
