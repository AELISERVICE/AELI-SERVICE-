import React from 'react';
import { Card } from '../../ui/Card';
import { PieCharts } from '../../ui/PieChart';
import { useGetUsers } from '../../hooks/useUser';

const COMPOSITION_DATA = [
  { name: 'Women', value: 35, color: '#fdba74' },
  { name: 'Men', value: 65, color: '#7c3aed' },
];


export const UserComposition = () => {
  const { data: statsResponse, isLoading } = useGetUsers();
  const users = statsResponse?.data?.users || [];

  const compositionData = React.useMemo(() => {
    const usersArray = Array.isArray(users) ? users : [];
    const total = usersArray.length;

    if (total === 0) {
      return [
        { name: 'Femmes', value: 0, color: '#fdba74' },
        { name: 'Hommes', value: 0, color: '#7c3aed' },
        { name: 'N/A', value: 0, color: '#e2e8f0' },
      ];
    }

    const counts = usersArray.reduce(
      (acc, user) => {
        const gender = user?.gender?.toLowerCase();
        if (gender === 'female' || gender === 'femme') acc.women += 1;
        else if (gender === 'male' || gender === 'homme') acc.men += 1;
        else acc.unknown += 1;
        return acc;
      },
      { women: 0, men: 0, unknown: 0 }
    );

    // On calcule le pourcentage pour chaque catégorie
    return [
      {
        name: 'Femmes',
        value: Math.round((counts.women / total) * 100),
        color: '#fdba74'
      },
      {
        name: 'Hommes',
        value: Math.round((counts.men / total) * 100),
        color: '#7c3aed'
      },
      {
        name: 'N/A',
        value: Math.round((counts.unknown / total) * 100),
        color: '#e2e8f0'
      },
    ];
  }, [users]);

  return (
    <Card
      noPadding={true}
      className="p-6 relative h-full"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Repartition des utilisateurs</h3>

      <div className="h-[250px] w-full flex items-center justify-center relative">
        <PieCharts data={compositionData} />
      </div>
    </Card>
  );
};