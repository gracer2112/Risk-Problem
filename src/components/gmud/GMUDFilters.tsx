// src/components/gmud/GMUDFilters.tsx
// 

'use client';

import { useState } from 'react';
import {
  StatusGMUD,
  PrioridadeGMUD,
  ImpactoGMUD,
  AmbienteGMUD,
} from '@/types/gmud';

import type { GMUDListFilters } from '@/services/api.gmud';

type Option<T extends string> = {
  value: T;
  label: string;
};

type FiltersDraft = {
  status: StatusGMUD | '';
  prioridade: PrioridadeGMUD | '';
  impacto: ImpactoGMUD | '';
  ambiente: AmbienteGMUD | '';
  busca: string;
};

export type GMUDFiltersProps = {
  loading?: boolean;
  disabled?: boolean;
  onApplyFilters?: (filters: GMUDListFilters) => void;
  onClearFilters?: () => void;
};

const statusOptions: Option<StatusGMUD | ''>[] = [
  { value: '', label: 'Todos' },
  { value: StatusGMUD.RASCUNHO, label: 'Rascunho' },
  { value: StatusGMUD.EM_REVISAO, label: 'Em Revisão' },
  { value: StatusGMUD.APROVADO, label: 'Aprovado' },
  { value: StatusGMUD.REJEITADO, label: 'Rejeitado' },
  { value: StatusGMUD.AGENDADO, label: 'Agendado' },
  { value: StatusGMUD.EM_EXECUCAO, label: 'Em Execução' },
  { value: StatusGMUD.CONCLUIDO, label: 'Concluído' },
  { value: StatusGMUD.CANCELADO, label: 'Cancelado' },
  { value: StatusGMUD.ROLLBACK, label: 'Rollback' },
];

const prioridadeOptions: Option<PrioridadeGMUD | ''>[] = [
  { value: '', label: 'Todos' },
  { value: PrioridadeGMUD.BAIXA, label: 'Baixa' },
  { value: PrioridadeGMUD.MEDIA, label: 'Média' },
  { value: PrioridadeGMUD.ALTA, label: 'Alta' },
  { value: PrioridadeGMUD.CRITICA, label: 'Crítica' },
];

const impactoOptions: Option<ImpactoGMUD | ''>[] = [
  { value: '', label: 'Todos' },
  { value: ImpactoGMUD.BAIXO, label: 'Baixo' },
  { value: ImpactoGMUD.MEDIO, label: 'Médio' },
  { value: ImpactoGMUD.ALTO, label: 'Alto' },
  { value: ImpactoGMUD.CRITICO, label: 'Crítico' },
];

const ambienteOptions: Option<AmbienteGMUD | ''>[] = [
  { value: '', label: 'Todos' },
  { value: AmbienteGMUD.DESENVOLVIMENTO, label: 'Desenvolvimento' },
  { value: AmbienteGMUD.HOMOLOGACAO, label: 'Homologação' },
  { value: AmbienteGMUD.PRODUCAO, label: 'Produção' },
];

export default function GMUDFilters({
  loading = false,
  disabled = false,
  onApplyFilters,
  onClearFilters,
}: GMUDFiltersProps) {
  const [draft, setDraft] = useState<FiltersDraft>({
    status: '',
    prioridade: '',
    impacto: '',
    ambiente: '',
    busca: '',
  });

  const isDisabled = disabled || loading;

  const handleApply = () => {
    onApplyFilters?.({
      status: draft.status === '' ? undefined : draft.status,
      prioridade: draft.prioridade === '' ? undefined : draft.prioridade,
      impacto: draft.impacto === '' ? undefined : draft.impacto,
      ambiente: draft.ambiente === '' ? undefined : draft.ambiente,
      busca: draft.busca.trim() || undefined,
    });
  };

  const handleClear = () => {
    setDraft({
      status: '',
      prioridade: '',
      impacto: '',
      ambiente: '',
      busca: '',
    });
    onClearFilters?.();
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                status: e.target.value as FiltersDraft['status'],
              }))
            }
            disabled={isDisabled}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {statusOptions.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioridade
          </label>
          <select
            value={draft.prioridade}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                prioridade: e.target.value as FiltersDraft['prioridade'],
              }))
            }
            disabled={isDisabled}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {prioridadeOptions.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Impacto
          </label>
          <select
            value={draft.impacto}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                impacto: e.target.value as FiltersDraft['impacto'],
              }))
            }
            disabled={isDisabled}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {impactoOptions.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ambiente
          </label>
          <select
            value={draft.ambiente}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                ambiente: e.target.value as FiltersDraft['ambiente'],
              }))
            }
            disabled={isDisabled}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {ambienteOptions.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Busca
          </label>
          <input
            type="text"
            value={draft.busca}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                busca: e.target.value,
              }))
            }
            placeholder="Digite o termo de busca..."
            disabled={isDisabled}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          type="button"
          onClick={handleClear}
          disabled={isDisabled}
          className="rounded-md bg-gray-200 px-6 py-2.5 font-medium text-gray-800 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpar Filtros
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={isDisabled}
          className="rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Aplicando...' : 'Aplicar filtros'}
        </button>
      </div>
    </div>
  );
}