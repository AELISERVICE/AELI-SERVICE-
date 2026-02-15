import React from 'react';
import { ToastContainer } from 'react-toastify';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginScreen() {
  return (
    <>
      <LoginForm />
      <ToastContainer position="bottom-center" />
    </>
  )
}