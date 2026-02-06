import React from 'react'
import { Card } from '../../ui/Card'
import { CreditCard, TrendingUp } from 'lucide-react'

export const PaymentSummary = () => {
  const paymentStats = [
    { label: 'Accepté', value: 120 },
    { label: 'Attente', value: 15 },
    { label: 'Refusé', value: 10 },
    { label: 'Annulé', value: 5 },
  ]

  return (
    <Card
      variant="green"
      noPadding={true}
    >
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <TrendingUp size={100} />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-6">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <TrendingUp className="w-5 h-5 text-white/80" />
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-1">2.5M FCFA</h2>
          <p className="text-green-100 text-sm">{paymentStats.label}</p>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {paymentStats.map((items, index) => (
            <Card
              variant="glass2"
              noPadding={true}
              key={index} className="flex flex-col items-center">
              <span className="text-xs font-bold block">{items.value}</span>
              <span className="text-[10px] opacity-80">{items.label}</span>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  )
}