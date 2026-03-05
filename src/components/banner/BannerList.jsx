import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from "react-toastify";
import { MoreVertical, Image as ImageIcon, Plus, AlertCircle } from 'lucide-react';
import { ActionMenu } from '../global/ActionMenu';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { NotFound } from '../global/NotFound';
import { Loader } from '../global/Loader';
import { useGetBanners, useDeleteBanner, useUpdateBanner } from '../../hooks/useBanner';

export const BannerList = ({ onAddBanner, onEditBanner }) => {
    const headers = ["Image", "Titre", "Type", "URL", "Dates", "Ordre", "Status", "Actions"];

    const { onActiveModal } = useOutletContext();
    const [openMenuId, setOpenMenuId] = useState(null);
    const triggerRef = useRef(null);

    const { data: apiResponse, isLoading, isError, refetch } = useGetBanners();
    const banners = apiResponse?.data?.banners || apiResponse?.data || [];

    const { mutate: mutateDelete, isSuccess: isSuccessDelete, data: dataDelete, isError: isErrorDelete, error: errorDelete, reset: resetDelete } = useDeleteBanner();
    const { mutate: mutateUpdate, isSuccess: isSuccessUpdate, data: dataUpdate, isError: isErrorUpdate, error: errorUpdate, reset: resetUpdate } = useUpdateBanner();

    const handleStatusChange = (banner) => {
        mutateUpdate({
            id: banner.id,
            formData: { isActive: !banner.isActive }
        });
    };

    const handleDeleteClick = (banner) => {
        onActiveModal(1, {
            title: "Supprimer la bannière ?",
            description: `Voulez-vous vraiment supprimer la bannière "${banner.title}" ? Cette action est irréversible.`,
            onConfirm: () => {
                mutateDelete({ id: banner.id });
            }
        });
    };

    useEffect(() => {
        if (isSuccessDelete && dataDelete?.success) {
            toast.success(dataDelete.message || "Bannière supprimée avec succès");
            refetch();
        }

        if (isSuccessUpdate && dataUpdate?.success) {
            toast.success(dataUpdate.message || "Bannière mise à jour avec succès");
            refetch();
        }

        if (isErrorDelete || isErrorUpdate) {
            const mainMessage = errorDelete?.message || errorUpdate?.message;
            toast.error(mainMessage);

            const backendErrors = errorDelete?.response?.errors || errorUpdate?.response?.errors;
            if (Array.isArray(backendErrors)) {
                backendErrors.forEach((err) => {
                    toast.info(err.message);
                });
            }
        }

        resetDelete();
        resetUpdate();
    }, [isSuccessDelete, isErrorDelete, dataDelete, errorDelete, isSuccessUpdate, isErrorUpdate, dataUpdate, errorUpdate, refetch]);

    const getTypeLabel = (type) => {
        const types = {
            main_home: "Accueil principal",
            sidebar: "Barre latérale",
            featured: "Mise en avant",
            popup: "Popup"
        };
        return types[type] || type;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Non défini";
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (isLoading) return <Loader variant="centered" message="Chargement..." />;

    return (
        <Card>
            <div className="flex justify-between mb-1">
                <div>
                    <h1 className="text-xl text-gray-700 font-bold lg:pacifico-regular">Bannières</h1>
                </div>
                <Button
                    variant="primary"
                    onClick={onAddBanner}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    Ajouter une bannière
                </Button>
            </div>
            {banners.length > 0 ? (
                <Table headers={headers}>
                    {banners.map((banner) => (
                        <tr key={banner.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    {banner.imageUrl ? (
                                        <img
                                            src={banner.imageUrl}
                                            className="h-16 w-32 md:w-40 rounded-lg object-cover border border-slate-200 shadow-sm"
                                            alt={banner.title}
                                        />
                                    ) : (
                                        <div className="h-16 w-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                            <ImageIcon size={20} className="text-slate-400" />
                                        </div>
                                    )}
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 leading-none truncate max-w-[200px]">{banner.title}</span>
                                    {banner.description && (
                                        <span className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{banner.description}</span>
                                    )}
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 text-purple-700 truncate">
                                    {getTypeLabel(banner.type)}
                                </span>
                            </td>

                            <td className="px-6 py-4">
                                {banner.linkUrl ? (
                                    <a
                                        href={banner.linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline truncate max-w-[150px] block"
                                    >
                                        {banner.linkUrl}
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400">Aucune URL</span>
                                )}
                            </td>

                            <td className="px-6 py-4 text-xs text-slate-600">
                                <div className="flex flex-col gap-1">
                                    <div>
                                        <span className="text-slate-400">Début: </span>
                                        <span className="truncate">{formatDate(banner.startDate)}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600">
                                <div className="flex flex-col gap-1">
                                    <div>
                                        <span className="text-slate-400">Fin: </span>
                                        <span className="truncate">{formatDate(banner.endDate)}</span>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4 text-center">
                                <span className="text-sm font-semibold text-slate-700">{banner.order || 0}</span>
                            </td>

                            <td className="px-6 py-4">
                                <Badge
                                    status={banner.isActive ? 'Actif' : 'Inactif'}
                                    variant={banner.isActive ? 'green' : 'gray'}
                                />
                            </td>

                            <td className="relative px-6 py-4 text-right">
                                <div className="flex justify-end">
                                    <Button
                                        ref={openMenuId === banner.id ? triggerRef : null}
                                        onClick={() => setOpenMenuId(openMenuId === banner.id ? null : banner.id)}
                                        className="text-slate-400 hover:text-slate-600 border-none bg-transparent"
                                    >
                                        <MoreVertical size={18} />
                                    </Button>
                                </div>
                                <ActionMenu
                                    isOpen={openMenuId === banner.id}
                                    onClose={() => setOpenMenuId(null)}
                                    triggerRef={triggerRef}
                                    initialStatus={!banner.isActive}
                                    onStatusChange={() => handleStatusChange(banner)}
                                    onEdit={() => {
                                        onEditBanner(banner);
                                        setOpenMenuId(null);
                                    }}
                                    onDelete={() => handleDeleteClick(banner)}
                                />
                            </td>
                        </tr>
                    ))}
                </Table>
            ) : isError ? (
                <NotFound
                    Icon={AlertCircle}
                    title="Erreur de chargement"
                    message="Impossible de récupérer la répartition des événements."
                />
            ) : (
                <NotFound
                    Icon={ImageIcon}
                    title="Aucune bannière"
                    message="Il semble qu'aucune bannière n'ait été créée"
                />
            )}
        </Card>
    );
};
