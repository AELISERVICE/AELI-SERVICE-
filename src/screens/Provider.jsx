import React, { useState } from 'react';
import { Pagination } from '../components/global/Pagination'
import { ProviderTable } from '../components/provider/ProviderTable';
import { TabButton } from '../components/global/TabButton'

export function Provider() {
    const TABS = ['Actifs', 'En attente', 'Bloquer', 'Supprimer']
    const [actifTabs, setActifTabs] = useState(null);

    return (
        <>
            <div className=" flex mb-6 flex-wrap gap-2">
                <TabButton TABS={TABS} setActifTabs={setActifTabs} />
            </div>
            <ProviderTable actifTabs={actifTabs} />
            <div className="mt-6">
                <Pagination />
            </div>
        </>
    );
};

