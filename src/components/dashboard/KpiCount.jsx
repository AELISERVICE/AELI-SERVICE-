import React from 'react'
import { StatsCard } from '../../ui/StatsCard'
import { Users, Briefcase, ShoppingBag, Star } from 'lucide-react'

const KpiData = [
    {
        title: "Utilisateurs",
        value: "150",
        subtitle: "120 Clients",
        icon: Users,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-100",
        footerText: "30 Providers",
        trend: "Total",
    },
    {
        title: "Prestataires actifs",
        value: "25",
        subtitle: "5 En attente",
        icon: Briefcase,
        iconColor: "text-purple-500",
        iconBg: "bg-purple-100",
        footerText: "3 Featured",
        trend: "Active",
    },
    {
        title: "Services disponibles",
        value: "85",
        subtitle: "Services actifs uniquement",
        icon: ShoppingBag,
        iconColor: "text-indigo-500",
        iconBg: "bg-indigo-100",
        trend: "Actifs",
    },
    {
        title: "Avis clients",
        value: "200",
        subtitle: "Note moyenne",
        icon: Star,
        iconColor: "text-yellow-500",
        iconBg: "bg-yellow-100",
        rating: 4.35,
        trend: "4.35%",
    },
];

export function KpiCount() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {KpiData.map((kpi, index) => (
                <StatsCard
                    key={index} // Indispensable pour React
                    title={kpi.title}
                    value={kpi.value}
                    subtitle={kpi.subtitle}
                    icon={kpi.icon}
                    iconColor={kpi.iconColor}
                    iconBg={kpi.iconBg}
                    footerText={kpi.footerText}
                    trend={kpi.trend}
                    trendUp={true} // Puisque toutes tes cartes sont à true ici
                    rating={kpi.rating} // Passera 'undefined' s'il n'existe pas, ce qui est géré par le composant
                />
            ))}
        </div>
    )
}