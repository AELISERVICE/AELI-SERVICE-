import React, { useMemo } from "react"
import { PieCharts } from '../../ui/PieChart';
import { Card } from '../../ui/Card';
import { useSecurityLogs } from "../../hooks/useStats";

export function RiskLevelDistribution() {
    const { data: logsResponse, isLoading } = useSecurityLogs();

    const compositionData = useMemo(() => {
        const logs = logsResponse?.data?.logs || [];

        // Compter les occurrences de chaque type d'événement
        const counts = logs.reduce((acc, log) => {
            const type = log.eventType || 'Autre';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const colors = {
            login_success: '#10b981', // Emeraude / Vert
            login_failed: '#ef4444',  // Rouge
            bot_detection: '#8b5cf6', // Violet
            default: '#94a3b8'         // Gris
        };

        const labels = {
            login_success: 'Succès',
            login_failed: 'Échecs',
            bot_detection: 'Bots',
        };

        return Object.keys(counts).map(key => ({
            name: labels[key] || key,
            value: counts[key],
            color: colors[key] || colors.default
        }));
    }, [logsResponse]);

    return (
        <Card
            noPadding={true}
            className="p-6 relative h-full"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Composition des événements</h3>
                {!isLoading && (
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {logsResponse?.data?.logs?.length || 0} logs
                    </span>
                )}
            </div>

            <div className="h-[250px] w-full flex items-center justify-center relative">
                {isLoading ? (
                    <div className="text-gray-400 text-sm animate-pulse">Chargement...</div>
                ) : compositionData.length > 0 ? (
                    <PieCharts data={compositionData} />
                ) : (
                    <div className="text-gray-400 text-sm">Aucune donnée disponible</div>
                )}
            </div>
        </Card>
    );
}