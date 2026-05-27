// src/components/gmud/GMUDTable.tsx
'use client';

import React from 'react';
import type { StatusGMUD, PrioridadeGMUD, ImpactoGMUD, AmbienteGMUD } from '@/types/gmud';
import { GMUDBadge } from '@/components/gmud/GMUDBadge';

type GMUDTableItem = {
  id: string | number;
  titulo: string;
  status: StatusGMUD;
  prioridade: PrioridadeGMUD;
  impacto: ImpactoGMUD;
  ambiente: AmbienteGMUD;
};

interface GMUDTableProps {
  data: GMUDTableItem[];
  loading?: boolean;
  emptyMessage?: string;
  onView: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}

const GMUDTable: React.FC<GMUDTableProps> = ({
  data,
  loading = false,
  emptyMessage = 'Nenhum item encontrado.',
  onView,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="w-full rounded-md border">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ambiente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-6 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <p className="text-sm text-gray-500 mx-auto max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-md border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ambiente</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate">
                  {item.titulo}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <GMUDBadge type="status" value={item.status} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <GMUDBadge type="prioridade" value={item.prioridade} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <GMUDBadge type="impacto" value={item.impacto} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <GMUDBadge type="ambiente" value={item.ambiente} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    type="button"
                    onClick={() => onView(item.id)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    Ver
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(item.id)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Excluir
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export type { GMUDTableItem, GMUDTableProps };
export default GMUDTable;