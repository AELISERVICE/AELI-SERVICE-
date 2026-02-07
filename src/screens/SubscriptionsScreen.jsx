import React from 'react';
import { Pagination } from '../components/global/Pagination';
import { TabButton } from '../components/global/TabButton';
import { SubscriptionList } from '../components/Subscription/SubscriptionList';


export function SubscriptionsScreen() {
    const TABS = ['Paiement', 'Attente', 'Revoque', 'Gratuit'];

    return (
        <div >
            <div className="mb-6 flex flex-wrap gap-2">
                <TabButton TABS={TABS} />
            </div>
            <SubscriptionList />
            <div className="mt-6">
                <Pagination />
            </div>
        </div>
    );
};
