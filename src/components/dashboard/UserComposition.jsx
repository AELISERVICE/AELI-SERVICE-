import React from 'react';
import { Card } from '../../ui/Card';
import { PieCharts } from '../../ui/PieChart';

const COMPOSITION_DATA = [
  { name: 'Women', value: 35, color: '#fdba74' },
  { name: 'Men', value: 65, color: '#7c3aed' },
  { name: 'autre', value: 10, color: '#7c3aed' },
];

export const UserComposition = () => {
  return (
    <Card
      noPadding={true}
      className="p-6 relative h-full"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Repartition des utilisateurs</h3>

      <div className="h-[250px] w-full flex items-center justify-center relative">
        <PieCharts data={COMPOSITION_DATA} />
      </div>
    </Card>
  );
};