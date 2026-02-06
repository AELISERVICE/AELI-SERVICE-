import React from 'react';
import { Pagination } from '../components/global/Pagination';
import { TabButton } from '../components/global/TabButton';
import { SubscriptionManager } from '../components/SubscriptionManager/SubscriptionManager';


export function SubscriptionsScreen() {
    const TABS = ['Subscription', 'pending', 'Revoque', 'Free'];

    return (
        <div >
            <div className="mb-6 flex flex-wrap gap-2">
                <TabButton TABS={TABS} />
            </div>
            <SubscriptionManager />
            <div className="mt-6">
                <Pagination />
            </div>
        </div>
    );
};
