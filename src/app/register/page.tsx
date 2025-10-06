'use client';
import React from 'react';

import RegisterForm from '../components/RegisterForm/RegisterForm';
import styles from './register.module.css';

export default function RegisterPage() {
  return (
    <div className={styles.registerContainer}>
      <RegisterForm />
    </div>
  );
}
