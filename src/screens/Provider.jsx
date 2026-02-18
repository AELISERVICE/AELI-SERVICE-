import React, { useState } from 'react';
import { Pagination } from '../components/global/Pagination'
import { ProviderTable } from '../components/provider/ProviderTable';
import { TabButton } from '../components/global/TabButton'
import { useProviderApplications, useProviderPending } from '../hooks/useProvider';


export function Provider() {
    const TABS = ['Tout', 'Actifs', 'Attente', 'Bloquer', 'Supprimer'];
    // On initialise avec 'Tout' pour correspondre au premier onglet
    const [actifTabs, setActifTabs] = useState('Tout');

    // On récupère les deux sources de données
    const { data: allData, isLoading: loadingAll } = useProviderApplications();
    const { data: pendingData, isLoading: loadingPending } = useProviderPending();

    // Logique de sélection des données selon l'onglet
    const getFilteredData = () => {
        if (actifTabs === 'Attente') {
            // Pour Pending, on cherche "providers" et non "applications"
            return pendingData?.data?.providers || [];
        }

        // Pour les autres onglets
        const allApps = allData?.data?.applications || [];

        switch (actifTabs) {
            case 'Actifs':
                return allApps.filter(app => app.status === 'approved');
            case 'Bloquer':
                return allApps.filter(app => app.status === 'blocked');
            case 'Supprimer':
                return allApps.filter(app => app.status === 'deleted');
            default:
                return allApps;
        }
    };

    const displayData = getFilteredData();
    const pagination = actifTabs === 'Attente' ? pendingData?.data?.pagination : allData?.data?.pagination;

    return (
        <>
            <div className="flex mb-6 flex-wrap gap-2">
                <TabButton TABS={TABS} setActifTabs={setActifTabs} />
            </div>

            <ProviderTable
                applications={displayData}
                isLoading={actifTabs === 'Attente' ? loadingPending : loadingAll}
                actifTabs={actifTabs}
            />

            <div className="mt-6">
                <Pagination
                    currentPage={pagination?.currentPage}
                    totalPages={pagination?.totalPages}
                />
            </div>
        </>
    );
}

