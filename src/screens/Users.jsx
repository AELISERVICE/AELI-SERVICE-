import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { Pagination } from '../components/global/Pagination';
import { UserTable } from '../components/user/UserTable';
import { TabButton } from '../components/global/TabButton';


export function Users() {
    const TABS = ['Actifs', 'Bloquer', 'Supprimer']
    const [actifTabs, setActifTabs] = useState();

    return (
        <>
            <div className="mb-6 flex flex-wrap gap-2">
                <TabButton TABS={TABS} setActifTabs={setActifTabs} />
            </div>
            <UserTable actifTabs={actifTabs} />
            <div className="mt-6">
                <Pagination />
            </div>
            <ToastContainer position="bottom-center" />
        </>
    );
};

