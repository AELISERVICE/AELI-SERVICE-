import React from 'react';
import { Mail } from 'lucide-react';
import { Card } from '../../ui/Card';


const contactStats = {
  unread: 45,
  total: 500,
  pendingPercentage: 15,
}

export const ContactAnalytics = () => {
  return (
    <Card className="h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-orange-100 rounded-lg">
          <Mail className="w-6 h-6 text-orange-500" />
        </div>
        <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">
          {contactStats.unread} Non lus
        </span>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{contactStats.total}</h3>
        <p className="text-sm text-gray-500 mb-4">Demandes de contact</p>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className="bg-orange-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${contactStats.pendingPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400">5% en attente de réponse</p>
      </div>
    </Card>
  )
}