// src/components/gmud/GMUDKpis.tsx
'use client';

import React from 'react';

const kpiLabels = [
  'Total',
  'Em revisão',
  'Agendadas',
  'Em execução',
  'Concluídas',
  'Rollbacks'
] as const;

type KpiLabel = typeof kpiLabels[number];

interface GMUDKpisProps {
  total?: number;
  emRevisao?: number;
  agendadas?: number;
  emExecucao?: number;
  concluidas?: number;
  rollbacks?: number;
  loading?: boolean;
}

const GMUDKpis: React.FC<GMUDKpisProps> = ({
  total,
  emRevisao,
  agendadas,
  emExecucao,
  concluidas,
  rollbacks,
  loading,
}) => {
  const getValue = (label: KpiLabel): number => {
    switch (label) {
      case 'Total':
        return total ?? 0;
      case 'Em revisão':
        return emRevisao ?? 0;
      case 'Agendadas':
        return agendadas ?? 0;
      case 'Em execução':
        return emExecucao ?? 0;
      case 'Concluídas':
        return concluidas ?? 0;
      case 'Rollbacks':
        return rollbacks ?? 0;
      default:
        return 0;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
      {kpiLabels.map((label) => {
        if (loading) {
          return (
            <div
              key={label}
              className="bg-white rounded-xl shadow-md p-6 animate-pulse flex flex-col items-center border border-gray-100"
            >
              <div className="h-12 w-20 bg-gray-300 rounded-lg mb-3"></div>
              <div className="h-4 w-24 bg-gray-300 rounded"></div>
            </div>
          );
        }

        const value = getValue(label);

        return (
          <div
            key={label}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center group cursor-pointer"
          >
            <div className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {value.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GMUDKpis;
