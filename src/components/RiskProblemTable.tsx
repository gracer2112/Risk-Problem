// src/components/RiskProblemTable.tsx

'use client';

import { NaturezaAtualEnum } from '@/types/risk-problem';
import type { RiskProblemListItem } from '@/types/risk-problem';
import { isClosedItem } from '@/utils/risk-problem-domain';

interface RiskProblemTableProps {
  items: RiskProblemListItem[];
  onEdit: (item: RiskProblemListItem) => void;
  onDelete: (itemId: string) => void;
  loading?: boolean;
}

function formatLabel(value?: string | null): string {
  if (!value) {
    return '-';
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(dateString?: string | null): string {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('pt-BR');
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function calculateDelay(targetDate?: string | null): number {
  if (!targetDate) {
    return 0;
  }

  const target = new Date(targetDate);

  if (Number.isNaN(target.getTime())) {
    return 0;
  }

  const todayStart = startOfDay(new Date());
  const targetStart = startOfDay(target);

  const diffTime = todayStart.getTime() - targetStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

function getNaturezaBadgeClass(natureza_atual: NaturezaAtualEnum): string {
  if (natureza_atual === NaturezaAtualEnum.RISCO) {
    return 'border-amber-200 bg-amber-100 text-amber-800';
  }

  return 'border-rose-200 bg-rose-100 text-rose-800';
}

function getStatusBadgeClass(status_operacional?: string | null): string {
  switch (status_operacional) {
    case 'identificado':
    case 'aberto':
      return 'border-slate-200 bg-slate-100 text-slate-800';

    case 'em_analise':
    case 'em_tratamento':
    case 'aguardando_terceiro':
    case 'aguardando_validacao':
      return 'border-blue-200 bg-blue-100 text-blue-800';

    case 'plano_acao_definido':
    case 'em_monitoramento':
      return 'border-violet-200 bg-violet-100 text-violet-800';

    case 'mitigado':
    case 'resolvido':
      return 'border-emerald-200 bg-emerald-100 text-emerald-800';

    case 'encerrado':
      return 'border-gray-200 bg-gray-100 text-gray-700';

    default:
      return 'border-gray-200 bg-gray-100 text-gray-700';
  }
}

function getTextOrDash(value?: string | null): string {
  if (!value || !value.trim()) {
    return '-';
  }

  return value;
}

function renderClassification(item: RiskProblemListItem): string | number {
  if (
    item.classificacao_atual === null ||
    item.classificacao_atual === undefined ||
    item.classificacao_atual === ''
  ) {
    return '-';
  }

  return item.classificacao_atual;
}

function getClassificationLabel(item: RiskProblemListItem): string {
  return item.natureza_atual === NaturezaAtualEnum.RISCO
    ? 'Risco residual'
    : 'Prioridade';
}

export function RiskProblemTable({
  items,
  onEdit,
  onDelete,
  loading = false,
}: RiskProblemTableProps) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        aria-live="polite"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <span className="ml-4 text-sm text-gray-600">Carregando itens...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
        <p className="text-lg font-medium text-gray-700">
          Nenhum risco ou problema registrado
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Clique em <strong>Novo item</strong> para iniciar o cadastro.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Natureza
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Descrição
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Classificação atual
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Agente de solução
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Data alvo
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {items.map((item) => {
              const delayDays = calculateDelay(item.data_alvo_solucao);
              const isDelayed = delayDays > 0;
              const isClosed = isClosedItem(item);

              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-4 align-top">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getNaturezaBadgeClass(
                        item.natureza_atual
                      )}`}
                    >
                      {formatLabel(item.natureza_atual)}
                    </span>
                  </td>

                  <td className="max-w-md px-4 py-4 align-top">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getTextOrDash(item.descricao)}
                      </p>
                      <p className="text-xs text-gray-500">ID: {item.id}</p>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1">
                      <span className="block text-xs text-gray-500">
                        {getClassificationLabel(item)}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {renderClassification(item)}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <span className="text-sm text-gray-700">
                      {getTextOrDash(item.agente_solucao)}
                    </span>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1">
                      <span className="block text-sm text-gray-700">
                        {formatDate(item.data_alvo_solucao)}
                      </span>

                      {isDelayed && !isClosed && (
                        <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                          {delayDays} dia{delayDays > 1 ? 's' : ''} de atraso
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(
                        item.status_operacional
                      )}`}
                    >
                      {formatLabel(item.status_operacional)}
                    </span>
                    {isClosed && item.data_encerramento && (
                      <p className="mt-1 text-xs text-gray-500">
                        Encerrado em {formatDate(item.data_encerramento)}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Editar item ${item.id}`}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        aria-label={`Excluir item ${item.id}`}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RiskProblemTable;