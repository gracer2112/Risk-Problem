'use client';

import React from 'react';
import type { GMUDKPIs } from '@/types/gmud';

interface GMUDKpisProps {
  kpis: GMUDKPIs | null;
  loading?: boolean;
  error?: string | null;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-4 h-32">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

function DistribuicaoPrioridade({ porPrioridade }: { porPrioridade: Record<string, number> }) {
  const priorityColors: Record<string, string> = {
    baixa: 'bg-green-500',
    media: 'bg-blue-500',
    alta: 'bg-amber-500',
    critica: 'bg-red-500',
  };

  const entries = Object.entries(porPrioridade);
  if (entries.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhuma prioridade registrada</p>;
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col items-center">
          <div className={`w-4 h-4 rounded-full ${priorityColors[key] ?? 'bg-gray-400'}`} />
          <span className="text-xs text-gray-600 mt-1 capitalize">{key}</span>
          <span className="text-sm font-semibold">{value}</span>
        </div>
      ))}
    </div>
  );
}

function TopSistemas({ sistemas }: { sistemas: { sistema: string; total: number }[] }) {
  if (sistemas.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum sistema identificado</p>;
  }

  return (
    <ol className="list-decimal list-inside text-sm space-y-1">
      {sistemas.map((s, i) => (
        <li key={i}>
          <span className="font-medium">{s.sistema}</span>: {s.total}
        </li>
      ))}
    </ol>
  );
}

export default function GMUDKpis({ kpis, loading = false, error = null }: GMUDKpisProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6" role="alert">
        <span className="font-semibold">Erro ao carregar KPIs:</span> {error}
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-500 px-4 py-8 rounded-md mb-6 text-center">
        <p className="text-lg font-medium">Nenhum dado disponível</p>
        <p className="text-sm mt-1">Os KPIs aparecerão assim que houver registros.</p>
      </div>
    );
  }

  const { total, por_status, por_prioridade, concluidas, rollbacks, top_sistemas, tempo_medio_execucao } = kpis;

  const abertas =
    (por_status['rascunho'] ?? 0) +
    (por_status['em_revisao'] ?? 0) +
    (por_status['aprovado'] ?? 0) +
    (por_status['em_execucao'] ?? 0);
  const percentAbertas = total > 0 ? ((abertas / total) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Total */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-700">Total de GMUDs</p>
        <p className="text-3xl font-bold text-blue-700 mt-1">{total}</p>
      </div>

      {/* Card 2: Abertas */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm font-medium text-amber-700">Abertas</p>
        <p className="text-3xl font-bold text-amber-700 mt-1">{abertas}</p>
        <p className="text-xs text-amber-600 mt-1">{percentAbertas}% do total</p>
      </div>

      {/* Card 3: Concluídas */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm font-medium text-green-700">Concluídas</p>
        <p className="text-3xl font-bold text-green-700 mt-1">{concluidas}</p>
        {rollbacks > 0 && <p className="text-xs text-red-600 mt-1">{rollbacks} com rollback</p>}
      </div>

      {/* Card 4: Prioridade */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Distribuição por Prioridade</p>
        <DistribuicaoPrioridade porPrioridade={por_prioridade} />
      </div>

      {/* Card 5: Top Sistemas */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Top Sistemas</p>
        <TopSistemas sistemas={top_sistemas} />
      </div>

      {/* Card 6: Tempo Médio */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Tempo Médio de Execução</p>
        {tempo_medio_execucao !== null ? (
          <p className="text-3xl font-bold text-gray-800">{tempo_medio_execucao.toFixed(1)} dias</p>
        ) : (
          <div>
            <p className="text-3xl font-bold text-gray-400">&mdash;</p>
            <p className="text-xs text-gray-500 mt-1">Nenhuma GMUD concluída</p>
          </div>
        )}
      </div>
    </div>
  );
}