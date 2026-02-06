import React from 'react'
import { CheckCircle2, Clock, Crown } from 'lucide-react'
import { Card } from '../../ui/Card'

const PROVIDER_STATUSES = [
  { label: 'Vérifiés', count: 25, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' },
  { label: 'En attente', count: 5, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { label: 'Mis en avant', count: 3, icon: Crown, color: 'text-purple-500', bg: 'bg-purple-100' },
]

export const ProviderStatusList = () => {
  return (
    <Card
      variant='stat'
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-6">
        Statut des prestataires
      </h3>
      <div className="space-y-5">
        {PROVIDER_STATUSES.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {item.label}
              </span>
            </div>
            <span className="font-bold text-gray-900">{item.count}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}