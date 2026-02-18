import React, { useMemo } from 'react';
import { AreaCharts } from '../../ui/AreaChart';
import { Card } from '../../ui/Card';
import { useSecurityLogs } from "../../hooks/useStats";

export const SecurPeriodeAnalytics = () => {
    const { data: logsResponse, isLoading } = useSecurityLogs();

    const chartData = useMemo(() => {
        const logs = logsResponse?.data?.logs || [];

        // 1. Initialiser les 7 derniers jours avec des valeurs à 0
        // On utilise les noms de jours en français pour correspondre au contexte
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));

            return {
                name: days[d.getDay()],
                // On garde la date brute (YYYY-MM-DD) pour la comparaison
                dateString: d.toISOString().split('T')[0],
                events: 0
            };
        });

        // 2. Compter les logs pour chaque jour correspondant
        logs.forEach(log => {
            if (log.createdAt) {
                const logDate = log.createdAt.split('T')[0];
                const dayMatch = last7Days.find(d => d.dateString === logDate);
                if (dayMatch) {
                    dayMatch.events += 1;
                }
            }
        });

        return last7Days;
    }, [logsResponse]);

    return (
        <Card className="h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Événements de sécurité
                    </h3>
                    <p className="text-sm text-gray-500">7 derniers jours</p>
                </div>
                {!isLoading && (
                    <div className="text-right">
                        <span className="text-2xl font-bold text-purple-600">
                            {logsResponse?.data?.pagination?.totalItems || 0}
                        </span>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                    </div>
                )}
            </div>

            <div className="h-[250px] w-full">
                <AreaCharts
                    data={chartData}
                    dataKey="events"
                    color="#8b5cf6"
                />
            </div>
        </Card>
    );
};