import React from 'react';
import { ToastContainer } from 'react-toastify';
import { RegisterForm } from '../components/auth/RegisterForm';


export function RegisterScreen() {
  return (
    <>
      <RegisterForm />
      <ToastContainer position="bottom-center" />
    </>
  )
}