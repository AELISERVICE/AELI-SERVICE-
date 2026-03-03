import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { X, Image as ImageIcon } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ButtonLoader } from '../global/Loader';
import { useCreateBanner, useUpdateBanner } from '../../hooks/useBanner';

export const BannerForm = ({ banner, onClose, onSuccess }) => {
    const isEditMode = !!banner;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        bannerImage: null,
        linkUrl: '',
        type: 'main_home',
        startDate: '',
        endDate: '',
        isActive: true,
        order: 0
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const { mutate: mutateCreate, isPending: isPendingCreate, isSuccess: isSuccessCreate, data: dataCreate, isError: isErrorCreate, error: errorCreate, reset: resetCreate } = useCreateBanner();
    const { mutate: mutateUpdate, isPending: isPendingUpdate, isSuccess: isSuccessUpdate, data: dataUpdate, isError: isErrorUpdate, error: errorUpdate, reset: resetUpdate } = useUpdateBanner();

    const typeOptions = [
        { value: 'main_home', label: 'Accueil principal' },
        { value: 'sidebar', label: 'Barre latérale' },
        { value: 'featured', label: 'Mise en avant' },
        { value: 'popup', label: 'Popup' }
    ];

    useEffect(() => {
        if (isEditMode && banner) {
            setFormData({
                title: banner.title || '',
                description: banner.description || '',
                bannerImage: null,
                linkUrl: banner.linkUrl || '',
                type: banner.type || 'main_home',
                startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
                endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
                isActive: banner.isActive !== undefined ? banner.isActive : true,
                order: banner.order || 0
            });
            if (banner.bannerImage) {
                setImagePreview(banner.bannerImage);
            }
        }
    }, [banner, isEditMode]);

    useEffect(() => {
        if (isSuccessCreate && dataCreate?.success) {
            toast.success(dataCreate.message || "Bannière créée avec succès");
            onSuccess?.();
            onClose();
        }

        if (isSuccessUpdate && dataUpdate?.success) {
            toast.success(dataUpdate.message || "Bannière mise à jour avec succès");
            onSuccess?.();
            onClose();
        }

        if (isErrorCreate || isErrorUpdate) {
            const mainMessage = errorCreate?.message || errorUpdate?.message;
            toast.error(mainMessage);

            const backendErrors = errorCreate?.response?.errors || errorUpdate?.response?.errors;
            if (Array.isArray(backendErrors)) {
                backendErrors.forEach((err) => {
                    toast.info(err.message);
                });
            }
        }

        resetCreate();
        resetUpdate();
    }, [isSuccessCreate, isErrorCreate, dataCreate, errorCreate, isSuccessUpdate, isErrorUpdate, dataUpdate, errorUpdate, onClose, onSuccess]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error("Format d'image non supporté. Utilisez JPG, PNG ou WebP.");
                return;
            }

            // Vérifier la taille (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("L'image est trop volumineuse. Taille maximale : 5MB.");
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Le titre est requis");
            return;
        }

        // Pour la création, l'image est requise
        if (!isEditMode && !imageFile) {
            toast.error("L'image de la bannière est requise");
            return;
        }

        // Préparer FormData
        const submitData = new FormData();
        submitData.append('title', formData.title);
        if (formData.description) submitData.append('description', formData.description);
        if (imageFile) submitData.append('bannerImage', imageFile);
        if (formData.linkUrl) submitData.append('linkUrl', formData.linkUrl);
        submitData.append('type', formData.type);
        if (formData.startDate) submitData.append('startDate', formData.startDate);
        if (formData.endDate) submitData.append('endDate', formData.endDate);
        submitData.append('isActive', formData.isActive);
        submitData.append('order', formData.order.toString());

        if (isEditMode) {
            mutateUpdate({ id: banner.id, formData: submitData });
        } else {
            mutateCreate(submitData);
        }
    };

    const isLoading = isPendingCreate || isPendingUpdate;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[100]">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Modifier la bannière' : 'Créer une bannière'}
                    </h2>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="p-2"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Titre */}
                        <div className="md:col-span-2">
                            <Input
                                label="Titre"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Titre de la bannière"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <Input
                                type="textarea"
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Description optionnelle"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Image */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Image de la bannière {!isEditMode && <span className="text-red-500">*</span>}
                            </label>
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                                    />
                                    <Button
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setImageFile(null);
                                        }}
                                        className="absolute top-2 right-2"
                                        disabled={isLoading}
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            ) : (
                                <Input
                                    type="file"
                                    name="bannerImage"
                                    onChange={handleFileChange}
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    disabled={isLoading}
                                />
                            )}
                        </div>

                        {/* Type */}
                        <div>
                            <Input
                                type="select"
                                label="Type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                options={typeOptions}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Ordre */}
                        <div>
                            <Input
                                type="number"
                                label="Ordre d'affichage"
                                name="order"
                                value={formData.order}
                                onChange={handleChange}
                                placeholder="0"
                                disabled={isLoading}
                            />
                        </div>

                        {/* URL de redirection */}
                        <div className="md:col-span-2">
                            <Input
                                type="url"
                                label="URL de redirection"
                                name="linkUrl"
                                value={formData.linkUrl}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Date de début */}
                        <div>
                            <Input
                                type="date"
                                label="Date de début"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Date de fin */}
                        <div>
                            <Input
                                type="date"
                                label="Date de fin"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Statut actif */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Bannière active</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <ButtonLoader />
                                    {isEditMode ? 'Modification...' : 'Création...'}
                                </>
                            ) : (
                                isEditMode ? 'Modifier' : 'Créer'
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

