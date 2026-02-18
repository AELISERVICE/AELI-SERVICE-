import React, { useMemo } from 'react';
import { Card } from '../../ui/Card';
import { AreaCharts } from '../../ui/AreaChart';
import { useGetUsers } from '../../hooks/useUser';

export const UsersAnalytics = () => {
    const { data: usersResponse, isLoading } = useGetUsers();

    const chartData = useMemo(() => {
        const users = usersResponse?.data?.users || [];

        // 1. Initialiser les derniers 7 jours
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                name: days[d.getDay()],
                dateString: d.toISOString().split('T')[0],
                users: 0
            };
        });

        // 2. Compter les inscriptions par jour
        users.forEach(user => {
            const userDate = user.createdAt.split('T')[0];
            const dayMatch = last7Days.find(d => d.dateString === userDate);
            if (dayMatch) {
                dayMatch.users += 1;
            }
        });

        return last7Days;
    }, [usersResponse]);

    // On évite le return isLoading pour ne pas casser le layout du dashboard
    return (
        <Card className="h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Inscriptions récentes
                    </h3>
                    <p className="text-sm text-gray-500">7 derniers jours</p>
                </div>
                {!isLoading && (
                    <div className="text-right">
                        <span className="text-2xl font-bold text-purple-600">
                            {usersResponse?.data?.pagination?.totalItems || 0}
                        </span>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                    </div>
                )}
            </div>

            <div className="h-[250px] w-full">
                <AreaCharts
                    data={chartData}
                    dataKey="users"
                    color="#8b5cf6"
                />
            </div>
        </Card>
    );
};