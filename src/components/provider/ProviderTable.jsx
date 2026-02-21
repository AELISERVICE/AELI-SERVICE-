import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from "react-toastify";
import {
    MapPin, Upload, FileText, MoreVertical, RotateCcw,
    Loader2, Users, Phone, MessageSquare
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { NotFound } from '../global/NotFound';
import { ActionMenu } from '../global/ActionMenu';
import { useExportProviders } from '../../hooks/useExport';
import { useDeactivateAccountProvider } from '../../hooks/useProvider';

export const ProviderTable = ({ applications, isLoading, actifTabs, refetch, refetchPending }) => {
    const { onActiveModal } = useOutletContext();
    const [openMenuId, setOpenMenuId] = useState(null);
    const triggerRef = useRef(null);

    const { mutate: mutateStatus, isSuccess: isSuccessStatus, data: dataStatus, isError: isErrorStatus, error: errorStatus, reset: resetStatus } = useDeactivateAccountProvider();
    const { mutate: mutateExport, isLoading: isLoadingExport, isSuccess: isSuccessExport, data: dataExport, isError: isErrorExport, error: errorExport, reset: resetExport } = useExportProviders();

    const handleStatusChange = (app) => {
        mutateStatus({ id: app.id, formData: { isActive: !app.isActive } });
    };

    const handleExport = () => mutateExport();

    useEffect(() => {
        if (isSuccessStatus) {
            toast.success(dataStatus?.message);
            refetch();
            refetchPending();
        }

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

        if (isErrorExport || isErrorStatus) {
            const mainMessage = errorExport?.message || errorStatus?.message;
            toast.error(mainMessage);

            const backendErrors = errorExport?.response?.data?.errors || errorStatus?.response?.data?.errors;
            if (Array.isArray(backendErrors)) {
                backendErrors.forEach((err) => {
                    toast.info(err.message);
                });
            }
        }

        resetStatus();
        resetExport();
    }, [isSuccessExport, isErrorExport, dataExport, errorExport, resetExport, isSuccessStatus, isErrorStatus, dataStatus, errorStatus, resetStatus]);

    return (
        <Card>
            <div className="flex justify-between mb-6 items-center">
                <div>
                    <h1 className="text-xl text-gray-700 font-bold lg:pacifico-regular">Utilisateurs</h1>
                </div>
                <Button
                    variant="primary"
                    size={"icon"}
                    disabled={isLoadingExport}
                    onClick={handleExport}
                    className="p-2.5 md:px-3"
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
                /* Conteneur Flexbox avec wrap pour éviter l'étirement des Grid */
                <div className="flex flex-wrap gap-4 justify-start">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            /* Taille fixe de 330px, ne rétrécit pas avec flex-shrink-0 */
                            className="group relative w-full sm:w-[330px] flex-shrink-0 bg-white rounded-xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden"
                        >

                            {/* Menu d'actions style "Floating Island" (Glassmorphism) */}
                            <div className="absolute top-4 right-4 z-20">
                                <div className="relative">
                                    <button
                                        ref={openMenuId === app.id ? triggerRef : null}
                                        onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                                        className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white hover:text-slate-900 shadow-xl transition-all duration-300"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    <ActionMenu
                                        isOpen={openMenuId === app.id}
                                        onClose={() => setOpenMenuId(null)}
                                        triggerRef={triggerRef}
                                        initialStatus={!app.isActive}
                                        onStatusChange={() => handleStatusChange(app)}
                                        onEdit={() => onActiveModal(3, app)}
                                        onVerifyDoc={() => onActiveModal(4, app)}
                                        onDelete={() => onActiveModal(1, app.id)}
                                    />
                                </div>
                            </div>

                            {/* 1. Header: Image de couverture avec overlay sombre */}
                            <div className="relative h-48 bg-slate-100">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.businessName)}&background=random&size=512`}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    alt="business-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20" />

                                {/* Status Badge positionné en haut à gauche */}
                                <div className="absolute top-4 left-4">
                                    <Badge
                                        status={app.status || app.verificationStatus}
                                        variant={app.status === 'approved' ? 'green' : app.status === 'pending' ? 'yellow' : 'red'}
                                    // className="backdrop-blur-md border-none px-4 py-1.5 shadow-lg"
                                    />
                                </div>

                                {/* Avatar circulaire flottant "à cheval" sur l'image */}
                                <div className="absolute -bottom-6 left-8 p-1.5 bg-white rounded-[1.5rem] shadow-xl transform transition-transform group-hover:-translate-y-1">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50">
                                        <img
                                            src={app.user?.profilePhoto || `https://ui-avatars.com/api/?name=${app.firstName || app.user?.firstName}+${app.lastName || app.user?.lastName}&background=frandom`}
                                            className="w-full h-full object-cover"
                                            alt="avatar"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Content Section : Informations du prestataire */}
                            <div className="pt-10 p-8 space-y-5">
                                <div className="space-y-1">
                                    <h3 className="font-black text-slate-800 truncate text-xl tracking-tight group-hover:text-[#E8524D] transition-colors">
                                        {app.businessName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                                        <Users size={14} className="text-[#E8524D]" />
                                        <span className="text-xs uppercase tracking-widest">{app.firstName || app.user?.firstName} {app.lastName || app.user?.lastName}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed min-h-[40px]">
                                    {app.description || "Un partenaire d'exception au service de votre quotidien."}
                                </p>

                                {/* Grid d'informations rapides (Localisation & Contact) */}
                                <div className="grid grid-cols-1 gap-3 pt-2">
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <MapPin size={14} className="text-red-500" />
                                        </div>
                                        <span className="text-xs font-semibold truncate">{app.location}</span>
                                    </div>

                                    <div className="flex gap-3">
                                        {/* Téléphone */}
                                        <div className="flex-1 flex items-center gap-2 bg-blue-50/30 text-slate-600  p-3 rounded-2xl border border-blue-100/50">
                                            <Phone size={14} />
                                            <span className="text-[11px] text-slate-600 font-black">{app.phone}</span>
                                        </div>
                                        {/* WhatsApp Bouton d'action direct */}
                                        <a
                                            href={`https://wa.me/${app.whatsapp?.replace(/\s/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-90"
                                        >
                                            <MessageSquare size={18} />
                                        </a>
                                    </div>
                                </div>

                                {/* Footer : Tags d'activités et Liens Documents */}
                                <div className="flex justify-between items-center pt-5 border-t border-slate-100">
                                    <div className="flex gap-1.5 overflow-hidden">
                                        {app.activities?.slice(0, 2).map((act, idx) => (
                                            <span key={idx} className="bg-[#E8524D]/10 text-[#E8524D] text-[9px] font-bold uppercase px-3 py-1.5 rounded-full shadow-sm">
                                                {act}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex -space-x-2">
                                        {app.documents?.map((doc, idx) => (
                                            <a
                                                key={idx}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-10 h-10 bg-white border-2 border-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-[#E8524D] hover:z-10 shadow-sm transition-all"
                                                title={`Document ${doc.type}`}
                                            >
                                                <FileText size={16} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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