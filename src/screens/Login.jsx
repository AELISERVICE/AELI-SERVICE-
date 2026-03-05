import React from 'react';
import { ToastContainer } from 'react-toastify';
import { LoginForm } from '../components/auth/LoginForm';
import { Footer } from '../components/global/Footer';

export function LoginScreen() {
    // Return the rendered UI for this component.
    return (
        <>
            <LoginForm />
            <ToastContainer position="bottom-center" />
        </>
    )
}
