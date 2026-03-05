import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Clock, CheckCircle2, Users, AlertCircle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Pagination } from '../global/Pagination';
import { Loader } from '../global/Loader';
import { NotFound } from '../global/NotFound';
import { useGetProviderList } from '../../hooks/useProvider';

export const ProviderListItem = ({ setSelectedProvider }) => {
    // 1. Récupération des filtres depuis le contexte du dashboard
    const { filters } = useOutletContext();

    // 2. États pour la pagination et la sélection
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);

    // 3. Appel API avec filtres et pagination
    const { data: apiResponse, isLoading, isError } = useGetProviderList({
        search: filters?.search,
        page: currentPage,
        limit: 5 // ou la limite souhaitée
    });

    const providers = apiResponse?.data?.providers || [];
    const pagination = apiResponse?.data?.pagination;

    // 4. Gestion de la sélection du prestataire
    useEffect(() => {
        if (providers.length > 0) {
            // Si rien n'est sélectionné, on prend le premier par défaut
            const initialSelection = selectedId
                ? providers.find(p => p.id === selectedId)
                : providers[0];

            if (initialSelection) {
                setSelectedId(initialSelection.id);
                setSelectedProvider(initialSelection);
            }
        }
    }, [providers, selectedId]);

    // Reset de la page si la recherche change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters?.search]);

    if (isLoading) return <Loader variant="centered" message="Chargement..." />;

    return (
        <div className="flex flex-col gap-4">
            {isError ? (
                <NotFound
                    Icon={AlertCircle}
                    title="Erreur de chargement"
                    message="Impossible de récupérer la répartition des événements."
                />
            ) : providers.length > 0 ? (
                providers.map((item) => (
                    <Card
                        key={item.id}
                        variant={selectedId === item.id ? 'active' : 'default'}
                        onClick={() => {
                            setSelectedId(item.id);
                            setSelectedProvider(item);
                        }}
                        className="cursor-pointer group transition-all hover:translate-x-1"
                    >
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <img
                                    src={item.profilePhoto || `https://ui-avatars.com/api/?name=${item.businessName}&background=random`}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-100"
                                    alt={item.businessName}
                                />
                                {item.isVerified && (
                                    <CheckCircle2 className="absolute -bottom-1 -right-1 w-4 h-4 text-[#E8524D] bg-white rounded-full" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className={`font-semibold truncate ${selectedId === item.id ? 'text-[#E8524D]' : 'text-slate-800'}`}>
                                        {item.businessName}
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                                    {item.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={12} /> {item.location.split(',')[0]}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <NotFound
                    Icon={Users}
                    title="Aucun prestataire trouvé"
                    message="Aucun profil de prestataire ne correspond à vos critères."
                />
            )}

            {/* 5. Pagination Dynamique */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}
        </div>
    );
};
