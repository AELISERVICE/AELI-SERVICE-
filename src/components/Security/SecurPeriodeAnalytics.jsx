import React from 'react';
import { AreaCharts } from '../../ui/AreaChart';
import { Card } from '../../ui/Card';

const USERS_DATA = [
    { name: 'Mon', users: 100 }, { name: 'Tue', users: 150 },
    { name: 'Wed', users: 130 }, { name: 'Thu', users: 250 },
    { name: 'Fri', users: 200 }, { name: 'Sat', users: 300 },
    { name: 'Sun', users: 280 },
];

export const SecurPeriodeAnalytics = () => {
    return (
        <Card className="h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Evenement par jours
            </h3>
            <div className="h-[250px] w-full">
                <AreaCharts data={USERS_DATA} dataKey="users" color="#8b5cf6" />
            </div>
        </Card>
    );
};


