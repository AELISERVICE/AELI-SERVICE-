import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ProviderInfoForm } from "../components/RegistrationProvider/ProviderInfoForm";

export function RegistrationProviderScreen() {
  return (
    <>
      <ProviderInfoForm />
      <ToastContainer position="bottom-center" />
    </>

  )
}