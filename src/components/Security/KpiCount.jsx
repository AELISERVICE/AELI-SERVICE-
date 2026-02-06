import React from 'react'
import { AlertTriangle, Shield, Ban, Bot } from 'lucide-react'
import { StatsCard } from '../../ui/StatsCard'



const stats = [
    {
        id: 1,
        title: 'Failed Attempts (24h)',
        value: '47',
        subtitle: '+12 this hour',
        icon: AlertTriangle,
        valueCol: 'text-red-600',
        iconColor: 'text-red-600',
        iconBg: 'bg-red-50',
    },
    {
        id: 2,
        title: 'High Risk Events',
        value: '3',
        subtitle: 'Last 24 hours',
        icon: Shield,
        valueCol: 'text-orange-500',
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50',
    },
    {
        id: 3,
        title: 'Banned IPs',
        value: '5',
        subtitle: 'Currently active',
        icon: Ban,
        valueCol: 'text-purple-600',
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-50',
    },
    {
        id: 4,
        title: 'Bot Detections',
        value: '23',
        subtitle: 'Honeypot triggered',
        icon: Bot,
        valueCol: 'text-green-600',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-50',
    },
]


export function Kpicount() {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {
                stats.map((kpi, index) => (
                    <StatsCard
                        key={index}
                        icon={kpi.icon}
                        title={kpi.title}
                        value={kpi.value}
                        valueCol={kpi.valueCol}
                        subtitle={kpi.subtitle}
                        iconColor={kpi.iconColor}
                        iconBg={kpi.iconBg}
                    />
                )
                )
            }
        </div>

    )
}
