import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ServiceInfoForm } from "../components/AddService/ServiceInfoForm";


export function AddServiceScreen() {
    return (
        <>
            <ServiceInfoForm />
            <ToastContainer position="bottom-center" />
        </>
    )
}