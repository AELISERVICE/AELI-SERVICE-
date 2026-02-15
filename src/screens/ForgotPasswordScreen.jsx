import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ForgotPasswordForm } from '../components/auth/FogotPasswordForm';

export function ForgotPasswordScreen() {
    return (
        <>
            <ForgotPasswordForm />
            <ToastContainer position="bottom-center" />
        </>
    )
}