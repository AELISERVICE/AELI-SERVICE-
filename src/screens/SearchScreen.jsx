import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ServiceSearch } from '../components/search/ServiceSearch';
import { MapSearch } from '../components/search/MapSearch';
import { Button } from '../ui/Button';
import { useGetProviderList } from '../hooks/useProvider';
import { Loader2 } from 'lucide-react';

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
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Recherche</h2>

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
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-red-500 w-10 h-10" />
                    </div>
                ) : isError ? (
                    <div className="text-center py-10 text-red-500">
                        Une erreur est survenue lors de la récupération des prestataires.
                    </div>
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