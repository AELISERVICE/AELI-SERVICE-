import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { BannerList } from '../components/banner/BannerList';
import { BannerForm } from '../components/banner/BannerForm';

export function BannerScreen() {
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const handleAddBanner = () => {
        setEditingBanner(null);
        setShowForm(true);
    };

    const handleEditBanner = (banner) => {
        setEditingBanner(banner);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingBanner(null);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingBanner(null);
    };

    return (
        <>
            <div>
                <BannerList
                    onAddBanner={handleAddBanner}
                    onEditBanner={handleEditBanner}
                />
            </div>

            {showForm && (
                <BannerForm
                    banner={editingBanner}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}

            <ToastContainer position="bottom-center" />
        </>
    );
}

