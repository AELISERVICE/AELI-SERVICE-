import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { Pagination } from '../components/global/Pagination'
import { ProviderTable } from '../components/provider/ProviderTable';
import { TabButton } from '../components/global/TabButton'
import { useProviderApplications, useProviderPending } from '../hooks/useProvider';


export function Provider() {
    const TABS = ['Tout', 'Actifs', 'Attente', 'Bloquer'];
    const [actifTabs, setActifTabs] = useState('Tout');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;

    const { data: allData, isLoading: loadingAll } = useProviderApplications();
    const { data: pendingData, isLoading: loadingPending } = useProviderPending();

    // Logique de sélection des données selon l'onglet
    const getFilteredData = () => {
        if (actifTabs === 'Attente') {
            return pendingData?.data?.providers || [];
        }

        const allApps = allData?.data?.applications || [];

        switch (actifTabs) {
            case 'Actifs':
                return allApps.filter(app => app.status === 'approved');
            case 'Bloquer':
                return allApps.filter(app => app.status === 'blocked');
            case 'Supprimer':
                return allApps.filter(app => app.status === 'deleted');
            case 'Attente':
                return allApps.filter(app => app.status === 'pending');
            default:
                return allApps;
        }
    };

    const fullFilteredData = getFilteredData();

    // Calcul du découpage (Slicing)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = fullFilteredData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(fullFilteredData.length / itemsPerPage);

    // Reset de la page quand on change d'onglet
    const handleTabChange = (tab) => {
        setActifTabs(tab);
        setCurrentPage(1);
    };

    return (
        <>
            <div className="flex mb-6 flex-wrap gap-2">
                <TabButton TABS={TABS} setActifTabs={handleTabChange} />
            </div>

            <ProviderTable
                applications={currentItems}
                isLoading={actifTabs === 'Attente' ? loadingPending : loadingAll}
                actifTabs={actifTabs}
            />

            <div className="mt-6">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
            <ToastContainer position="bottom-center" />
        </>
    );
}

