import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { Pagination } from '../components/global/Pagination';
import { UserTable } from '../components/user/UserTable';
import { TabButton } from '../components/global/TabButton';
import { useGetUsers } from '../hooks/useUser';

export function Users() {
    const TABS = ['Tout', 'Actifs', 'Bloquer'];
    const [actifTabs, setActifTabs] = useState('Tout');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const { data: apiResponse, isLoading, refetch } = useGetUsers();
    const allUsers = apiResponse?.data?.users || [];

    // --- LOGIQUE DE FILTRAGE ---
    const getFilteredData = () => {
        switch (actifTabs) {
            case 'Actifs':
                return allUsers.filter(user => user.isActive === true);
            case 'Bloquer':
                return allUsers.filter(user => user.isActive === false);
            default:
                return allUsers;
        }
    };

    const fullFilteredData = getFilteredData();

    // --- LOGIQUE DE PAGINATION ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = fullFilteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(fullFilteredData.length / itemsPerPage);

    const handleTabChange = (tab) => {
        setActifTabs(tab);
        setCurrentPage(1); // Reset la page au changement d'onglet
    };

    return (
        <>
            <div className="mb-6 flex flex-wrap gap-2">
                <TabButton TABS={TABS} setActifTabs={handleTabChange} />
            </div>
            <UserTable
                users={currentItems}
                isLoading={isLoading}
                refetch={refetch}
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