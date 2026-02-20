import React, { useState } from 'react';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { usePayments } from '../../hooks/useSubscription';

const DATA = [
    {
        id: 1,
        name: 'Jean marie',
        type: 'Premium',
        startDate: '18 jan 2026',
        endDate: '18 fev 2026',
        daysLeft: 16,
        status: 'Actif',
        price: '25000 Fcfa/Mois',
        avatar:
            'https://cdn.magicpatterns.com/uploads/v2ZYFoJhQfgQkWoEKjUixy/image.png',
    },
    {
        id: 2,
        name: 'Jean marie',
        type: 'Premium',
        startDate: '18 jan 2026',
        endDate: '18 fev 2026',
        daysLeft: 16,
        status: 'Actif',
        price: '25000 Fcfa/Mois',
        avatar:
            'https://cdn.magicpatterns.com/uploads/v2ZYFoJhQfgQkWoEKjUixy/image.png',
    },
    {
        id: 3,
        name: 'Jean marie',
        type: 'Premium',
        startDate: '18 jan 2026',
        endDate: '18 fev 2026',
        daysLeft: 16,
        status: 'Actif',
        price: '25000 Fcfa/Mois',
        avatar:
            'https://cdn.magicpatterns.com/uploads/v2ZYFoJhQfgQkWoEKjUixy/image.png',
    },
    {
        id: 4,
        name: 'Jean marie',
        type: 'Premium',
        startDate: '18 jan 2026',
        endDate: '3 fev 2026',
        daysLeft: 0,
        status: 'expirer',
        price: '25000 Fcfa/Mois',
        avatar:
            'https://cdn.magicpatterns.com/uploads/v2ZYFoJhQfgQkWoEKjUixy/image.png',
    },
]

export const SubscriptionList = () => {
    const { data: paymentsResponse, isLoading } = usePayments();
    const payments = paymentsResponse?.data?.payments || [];

    return (
        <div className="w-full">
            <div className="space-y-4 max-w-6xl">
                {DATA.map((item) => (
                    <Card
                        className="backdrop-blur-sm p-4 sm:p-5 "
                    >
                        {/* Version Mobile */}
                        <div className="flex flex-col sm:hidden gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={item.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                        <p className="text-sm text-purple-500">{item.type}</p>
                                    </div>
                                </div>
                                <Badge
                                    status={item.status}
                                    variant={item.status === 'Actif' ? 'green' : item.status === 'expirer' ? 'red' : 'gray'}
                                />
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                <div className="text-gray-600 font-medium">{item.startDate} - {item.endDate}</div>
                                <div className="text-gray-500">- {item.daysLeft} jours</div>
                                <div className="font-semibold text-gray-800">{item.price}</div>
                            </div>
                        </div>

                        {/* Version Desktop */}
                        <div className="hidden sm:flex items-center gap-4 lg:gap-6">
                            <div className="flex items-center gap-3 min-w-[160px] lg:min-w-[200px]">
                                <img src={item.avatar} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover" alt="" />
                                <div>
                                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                    <p className="text-sm text-purple-500">{item.type}</p>
                                </div>
                            </div>
                            <div className="flex-1 text-gray-600 text-sm lg:text-base">
                                <span className="font-medium">{item.startDate}</span>
                                <span className="mx-2">-</span>
                                <span>{item.endDate}</span>
                            </div>
                            <div className="text-gray-500 text-sm lg:text-base min-w-[80px] text-center">- {item.daysLeft} jours</div>
                            <div className="min-w-[80px] flex justify-center">
                                <Badge
                                    status={item.status}
                                    variant={item.status === 'Actif' ? 'green' : item.status === 'expirer' ? 'red' : 'gray'}
                                />
                            </div>
                            <div className="font-semibold text-gray-800 text-sm lg:text-base min-w-[120px] text-right">{item.price}</div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};