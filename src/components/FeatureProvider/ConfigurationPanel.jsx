import React from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { Card } from '../../ui/Card'; // Tes composants UI
import {Button} from '../../ui/Button'

export const ConfigurationPanel = ({ selectedProvider }) => {
  return (
    <Card variant="glass" className="flex flex-col border-dashed">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Configuration</h2>
      <div className="space-y-5 flex-1">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Durée</label>
          <div className="relative">
            <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700 focus:ring-2 focus:ring-violet-100 outline-none transition-all">
              <option>1 Semaine</option>
              <option>2 Semaines</option>
              <option>1 Mois</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Cible:</span>
            <span className="text-slate-900 font-semibold">{selectedProvider?.name || 'Aucun'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Prix estimé:</span>
            <span className="text-violet-600 font-bold">49.00 €</span>
          </div>
        </div>
      </div>
      <Button 
        variant="primary" 
        className="w-full mt-6 py-3 shadow-lg shadow-violet-200"
        disabled={!selectedProvider}
      >
        <Star size={18} className="mr-2 fill-current" />
        Confirmer la mise en avant
      </Button>
    </Card>
  );
};