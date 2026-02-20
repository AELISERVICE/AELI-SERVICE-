import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { toast } from "react-toastify";
import { MapPin, Upload, FileText, MoreVertical, RotateCcw, Loader2, MessageCircle, Users } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { NotFound } from '../global/NotFound';
import { ActionMenu } from '../global/ActionMenu';
import { useProviderApplications, useProviderPending } from '../../hooks/useProvider';
import { useExportProviders } from '../../hooks/useExport';

export const ProviderTable = ({ applications, isLoading, actifTabs }) => {
    const { onActiveModal } = useOutletContext();
    const [openMenuId, setOpenMenuId] = useState(null);
    const triggerRef = useRef(null);

    const { mutate: mutateExport, isLoading: isLoadingExport, isSuccess: isSuccessExport, data: dataExport, isError: isErrorExport, error: errorExport } = useExportProviders();

    const headers = [
        "Business",
        "Propriétaire",
        "Localisation",
        "Contact",
        "Activités",
        "Documents/CNI",
        "Status",
        "Actions"
    ];

    const handleExport = () => {
        mutateExport();
    };


    useEffect(() => {
        if (isSuccessExport && dataExport) {
            const csvContent = dataExport.message;

            // Créer le Blob (avec le BOM "\ufeff" pour la compatibilité Excel/Accents)
            const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });

            // Créer le lien de téléchargement
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            // Nom du fichier (ex: export-prestataires-19-02-2026.csv)
            const now = new Date();
            const date = now.toLocaleDateString('fr-FR').replace(/\//g, '-');
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');

            const time = `${hours}h${minutes}m${seconds}s`;

            // Configurer le nom du fichier
            link.href = url;
            link.setAttribute('download', `export-prestataires-${date}-${time}.csv`);

            // Déclenchement automatique du téléchargement
            document.body.appendChild(link);
            link.click();

            // Nettoyage de la mémoire et du DOM
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Exportation réussie !");
        }

        if (isErrorExport) {
            const mainMessage = errorExport?.message || "Erreur lors de l'exportation";
            toast.error(mainMessage);

            const backendErrors = errorExport?.response?.data?.errors;
            if (Array.isArray(backendErrors)) {
                backendErrors.forEach((err) => {
                    toast.info(err.message);
                });
            }
        }
    }, [isSuccessExport, isErrorExport, dataExport, errorExport]);

    return (
        <Card>
            <div className="flex justify-between mb-1">
                <div>
                    <h1 className="text-xl text-gray-700 font-bold lg:pacifico-regular">Prestataires</h1>
                </div>
                <Button
                    variant="primary"
                    size={"icon"}
                    disabled={isLoadingExport}
                    onClick={handleExport}
                    className="p-2.5  md:px-3"
                >
                    {isLoadingExport ? (
                        <span key="loading-state" className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="hidden md:inline">Exportation...</span>
                        </span>
                    ) : (
                        <span key="idle-state" className="flex items-center gap-2">
                            <Upload size={18} />
                            <span className="hidden md:inline">Exporter</span>
                        </span>
                    )}
                </Button>
            </div>
            {applications.length > 0 ? (
                <Table headers={headers}>
                    {applications.map((app) => (
                        <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">

                            {/* 1. Business & Photo */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={app.user?.profilePhoto || `https://ui-avatars.com/api/?name=${app.businessName}&background=random`}
                                        className="h-10 w-10 rounded-lg object-cover bg-slate-100 border border-slate-200 text-bold"
                                        alt="business"
                                    />
                                    <div className="max-w-[180px]">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 truncate">{app.businessName}</span>
                                            <span className="text-[11px] text-slate-500 line-clamp-1 italic">{app.description}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* 2. Propriétaire */}
                            <td className="px-6 py-4 text-slate-600">
                                <div className="text-sm">
                                    <p className="font-medium text-slate-900">{app.firstName} {app.lastName}</p>
                                    <p className="text-xs text-slate-400">{app.email}</p>
                                </div>
                            </td>

                            {/* 3. Localisation (Location + Address) */}
                            <td className="px-6 py-4 text-slate-600">
                                <div className="flex flex-col gap-1 max-w-[150px]">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <MapPin size={12} className="text-red-500 shrink-0" />
                                        <span className="truncate">{app.location}</span>
                                    </div>
                                    {app.address && (
                                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 truncate">
                                            Ref: {app.address}
                                        </span>
                                    )}
                                </div>
                            </td>

                            {/* 4. Contact (Phone + WhatsApp) */}
                            <td className="px-6 py-4 text-slate-600">
                                <div className="flex flex-col gap-1">
                                    <span className="flex gap-1 text-[11px] bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded whitespace-nowrap">
                                        {/* <Phone size={12} className="text-slate-600" /> */}
                                        <span>{app.phone}</span>
                                    </span>
                                    <span className="flex gap-1 text-[11px] bg-green-100  text-green-600 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded whitespace-nowrap">
                                        {/* <MessageCircle size={12} /> */}
                                        <span>{app.whatsapp}</span>
                                    </span>
                                </div>
                            </td>

                            {/* 5. Activités */}
                            <td className="px-6 py-4">
                                <div className="grid grid-rows-2 grid-flow-col gap-2 max-w-[200px] overflow-x-auto pb-1">
                                    {app.activities.map((act, index) => (
                                        <span
                                            key={index}
                                            className="bg-[#E8524D]/10 text-[#E8524D] text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded whitespace-nowrap "
                                        >
                                            {act}
                                        </span>
                                    ))}
                                </div>
                            </td>

                            {/* 6. Documents & CNI Number */}
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        {app.documents.map((doc, index) => (
                                            <a
                                                key={index}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 bg-slate-100 rounded text-slate-600 hover:bg-[#E8524D] hover:text-white transition-colors"
                                                title={`Voir ${doc.type}`}
                                            >
                                                <FileText size={16} />
                                            </a>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 truncate">N° {app.cniNumber}</span>
                                </div>
                            </td>

                            {/* 7. Status */}
                            <td className="px-6 py-4">
                                <Badge
                                    status={app.status}
                                    variant={
                                        app.status === 'approved' ? 'green' :
                                            app.status === 'pending' ? 'yellow' : 'red'
                                    }
                                />
                            </td>

                            {/* 8. Actions */}
                            <td className={`relative px-6 py-4 text-right ${openMenuId === app.id ? 'z-50' : 'z-auto'}`}>
                                {actifTabs === "Supprimer" ? (
                                    <Button
                                        size={false}
                                        variant={"recovery"}
                                        onClick={() => onActiveModal(2)}
                                    >
                                        <RotateCcw className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                                    </Button>
                                ) : (
                                    <div className="flex justify-end">
                                        <Button
                                            ref={openMenuId === app.id ? triggerRef : null}
                                            onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                                            className="text-slate-400 hover:text-slate-600 border-none bg-transparent">
                                            <MoreVertical size={18} />
                                        </Button>
                                    </div>
                                )}
                                <ActionMenu
                                    isOpen={openMenuId === app.id}
                                    onClose={() => setOpenMenuId(null)}
                                    triggerRef={triggerRef}
                                    onEdit={() => onActiveModal(3, app)}
                                    onDelete={() => onActiveModal(1, app.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </Table>
            ) : (
                <NotFound
                    Icon={Users}
                    title="Aucun prestataire trouvé"
                    message="Aucun nouveau profil de prestataire n'a été créé ou n'est en attente de validation pour le moment."
                />
            )}
        </Card>
    );
};