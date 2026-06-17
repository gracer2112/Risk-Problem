// src/components/gmud/GmudDashboard.tsx

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { GMUDKPIs } from '@/types/gmud';

interface GmudDashboardProps {
  kpis: GMUDKPIs | null;
  loading?: boolean;
  error?: string | null;
}

const statusLabels: Record<string, string> = {
  rascunho: 'Rascunho',
  em_revisao: 'Em Revisão',
  aprovado: 'Aprovado',
  em_execucao: 'Em Execução',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  rollback: 'Rollback',
};

const statusColors: Record<string, string> = {
  rascunho: '#94A3B8',
  em_revisao: '#F59E0B',
  aprovado: '#3B82F6',
  em_execucao: '#8B5CF6',
  concluido: '#22C55E',
  cancelado: '#EF4444',
  rollback: '#DC2626',
};

const priorityLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

const priorityColors: Record<string, string> = {
  baixa: '#22C55E',
  media: '#3B82F6',
  alta: '#F59E0B',
  critica: '#EF4444',
};

export default function GmudDashboard({
  kpis,
  loading = false,
  error = null,
}: GmudDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm border h-64 animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-full bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-semibold">Erro ao carregar dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
        <p className="font-medium">Nenhum dado disponível</p>
        <p className="text-sm mt-1">
          Selecione os filtros desejados para visualizar os gráficos.
        </p>
      </div>
    );
  }

  const statusData = Object.entries(kpis.por_status ?? {})
    .map(([key, value]) => ({
      name: statusLabels[key] ?? key,
      value,
      color: statusColors[key] ?? '#3B82F6',
    }))
    .sort((a, b) => b.value - a.value);

  const priorityData = Object.entries(kpis.por_prioridade ?? {}).map(
    ([key, value]) => ({
      name: priorityLabels[key] ?? key,
      value,
      color: priorityColors[key] ?? '#3B82F6',
    })
  );

  const monthlyData = kpis.mensal ?? [];

  const topSistemasData = kpis.top_sistemas ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border h-64">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          GMUDs por Status
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={statusData}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 16, left: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border h-64">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          GMUDs por Prioridade
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={priorityData}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              outerRadius={75}
              paddingAngle={2}
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-priority-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border h-64">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          GMUDs por Mês
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{ top: 8, right: 16, bottom: 16, left: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3B82F6' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border h-64">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Top Sistemas
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topSistemasData}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 16, left: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis
              dataKey="sistema"
              type="category"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="total" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}