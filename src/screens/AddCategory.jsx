import React from 'react';
import { ToastContainer } from 'react-toastify';
import { CategoryInfoForm } from "../components/AddCategory/CategoryInfoForm";

export function AddCategorycreen() {
    return (
        <>
            <CategoryInfoForm />
            <ToastContainer position="bottom-center" />
        </>
    )
}