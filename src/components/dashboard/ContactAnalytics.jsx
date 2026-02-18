import React from 'react';
import { Mail } from 'lucide-react';
import { Card } from '../../ui/Card';
import { useStats } from '../../hooks/useStats';

export const ContactAnalytics = () => {
  const { data: statsResponse } = useStats();

  // Extraction sécurisée des données avec valeurs par défaut
  const contacts = statsResponse?.data?.contacts;

  // Calcul dynamique du pourcentage (évite la division par zéro)
  const pendingPercentage = contacts?.total > 0
    ? Math.round((contacts?.pending / contacts?.total) * 100)
    : 0;

  return (
    <Card className="h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-orange-100 rounded-lg">
          <Mail className="w-6 h-6 text-orange-500" />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${contacts?.pending > 0 ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-50'
          }`}>
          {contacts?.pending || 0} Non lus
        </span>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">
          {contacts?.total?.toLocaleString()}
        </h3>
        <p className="text-sm text-gray-500 mb-4">Demandes de contact</p>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className="bg-orange-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${pendingPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400">{pendingPercentage}% en attente de réponse</p>
      </div>
    </Card>
  );
};