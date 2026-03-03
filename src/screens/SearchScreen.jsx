import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ServiceSearch } from '../components/search/ServiceSearch';
import { MapSearch } from '../components/search/MapSearch';
import { Button } from '../ui/Button';
import { useGetProviderList } from '../hooks/useProvider';
import { Loading } from '../components/global/Loading';
import { NotFound } from '../components/global/Notfound';
import { Search, Loader2, AlertCircle } from 'lucide-react';

export function SearchScreen() {
    const [activeTab, setActiveTab] = useState('service');

    // On récupère tout ce qu'on a mis dans l'Outlet de Base.jsx
    const { filters, openContact } = useOutletContext();

    // L'appel API est centralisé ici
    const { data: apiResponse, isLoading, isError } = useGetProviderList({
        search: filters?.search,
        maxPrice: filters?.maxPrice,
        minRating: filters?.minRating
    });

    const providers = apiResponse?.data?.providers || [];

    return (
        <div className="w-full">
            <div className="md:px-2 mt-22 md:mt-16">
                <div className="mb-8 flex flex-row justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        <Search className="text-[#E8524D]" size={32} />
                        Recherche
                    </h2>

                    {/* Switch Tabs */}
                    <div className="flex rounded-2xl bg-gray-100 p-1 gap-1">
                        <Button
                            variant={activeTab === 'service' ? 'gradient' : 'ghost'}
                            onClick={() => setActiveTab('service')}
                            className="px-4 md:px-8"
                        >
                            Service
                        </Button>
                        <Button
                            variant={activeTab === 'carte' ? 'gradient' : 'ghost'}
                            onClick={() => setActiveTab('carte')}
                            className="px-4 md:px-8"
                        >
                            Carte
                        </Button>
                    </div>
                </div>

                {/* Gestion des états de chargement / erreur */}
                {isLoading ? (
                    <Loading className="py-20" title="Chargement des prestataires..."/>
                ) : isError ? (
                    <NotFound
                        Icon={AlertCircle}
                        title="Erreur de chargement"
                        message="Une erreur est survenue lors de la récupération des prestataires."
                        className="bg-gray-100 h-[300px] flex-1"
                    />
                ) : providers.length === 0 ? (
                    <NotFound
                        Icon={Search}
                        title="Aucun prestataire trouvé"
                        message="Aucun prestataire ne correspond à vos critères de recherche."
                        className="bg-gray-100 h-[300px] flex-1"
                    />
                ) : (
                    <>
                        {/* Affichage conditionnel selon l'onglet actif */}
                        {activeTab === 'service' ? (
                            <ServiceSearch providers={providers} openContact={openContact} />
                        ) : (
                            <MapSearch providers={providers} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
