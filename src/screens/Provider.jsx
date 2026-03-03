import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';
import { Pagination } from '../components/global/Pagination'
import { ProviderTable } from '../components/provider/ProviderTable';
import { TabButton } from '../components/global/TabButton'
import { useProviderApplications, useProviderPending, useGetProviderList } from '../hooks/useProvider';


export function Provider() {
    // 1. Récupération des filtres (search) depuis le dashboard
    const { filters } = useOutletContext();

    const TABS = ['Tout', 'Attente', 'Doc verification', 'Actifs', 'Bloquer'];
    const [actifTabs, setActifTabs] = useState('Tout');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 2. Appels API (On récupère tout, ou on passe le search si ton API le gère)
    const { data: dataProvider, isLoading: loadingProvider, refetch: refetchProvider } = useGetProviderList();
    const { data: allData, isLoading: loadingAll, refetch } = useProviderApplications({ search: filters?.search });
    const { data: pendingData, isLoading: loadingPending, refetch: refetchPending } = useProviderPending({ search: filters?.search });

    // 3. TA LOGIQUE DE FILTRAGE PAR STATUT (Client-side)
    const getFilteredData = () => {
        // Cas spécial pour les documents en attente
        if (actifTabs === 'Doc verification') {
            return pendingData?.data?.providers || [];
        }

        const allApps = allData?.data?.applications || [];
        const providerList = dataProvider?.data?.providers || dataProvider?.data || [];

        // Filtrage en fonction du libellé de l'onglet
        switch (actifTabs) {
            case 'Actifs':
                return providerList.filter(app => app.isActive === true);
            case 'Bloquer':
                return providerList.filter(app => app.isActive === false);
            case 'Attente':
                return allApps.filter(app => app.status === 'pending');
            default:
                return allApps; // "Tout"
        }
    };

    const fullFilteredData = getFilteredData();

    // 4. LOGIQUE DE PAGINATION (Slicing du tableau filtré)
    const totalItems = fullFilteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = fullFilteredData.slice(indexOfFirstItem, indexOfLastItem);

    // 5. EFFETS DE BORD
    // Reset la page à 1 si l'onglet ou la recherche change
    useEffect(() => {
        setCurrentPage(1);
    }, [actifTabs, filters?.search]);

    const handleTabChange = (tab) => {
        setActifTabs(tab);
    };

    return (
        <>
            <div className="flex mb-6 flex-wrap gap-2">
                <TabButton TABS={TABS} setActifTabs={handleTabChange} />
            </div>

            <ProviderTable
                applications={currentItems} // On passe les éléments découpés (max 5)
                isLoading={
                    actifTabs === 'Doc verification'
                        ? loadingPending
                        : actifTabs === 'Actifs' || actifTabs === 'Bloquer'
                            ? loadingProvider
                            : loadingAll
                }
                actifTabs={actifTabs}
                refetch={actifTabs === 'Actifs' || actifTabs === 'Bloquer' ? refetchProvider : refetch}
                refetchPending={refetchPending}
            />

            {/* Affichage de la pagination uniquement s'il y a plusieurs pages */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}

            <ToastContainer position="bottom-center" />
        </>
    );
}
