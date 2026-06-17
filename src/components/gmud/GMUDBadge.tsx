// src/components/gmud/GMUDBadge.tsx
import { StatusGMUD, StatusChecklistGMUD } from '@/types/gmud';
import {
  getPrioridadeGMUDLabel,
  getImpactoGMUDLabel,
  getAmbienteGMUDLabel,
  getOrigemGMUDLabel,
} from '@/utils/gmud-domain';

interface GMUDBadgeProps {
  type: 'status' | 'prioridade' | 'impacto' | 'ambiente' | 'origem';
  value: string | null;
  className?: string;
}

const statusStyles: Record<StatusGMUD | StatusChecklistGMUD, string> = {
  'RASCUNHO': 'bg-gray-100 text-gray-800 border-gray-300',
  'PLANEJADO': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'EM REVISAO': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'APROVADO': 'bg-green-100 text-green-800 border-green-300',
  'REJEITADO': 'bg-red-100 text-red-800 border-red-300',
  'AGENDADO': 'bg-blue-100 text-blue-800 border-blue-300',
  'EM EXECUCAO': 'bg-purple-100 text-purple-800 border-purple-300',
  'CONCLUIDO': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'CANCELADO': 'bg-slate-100 text-slate-800 border-slate-300',
  'ROLLBACK': 'bg-orange-100 text-orange-800 border-orange-300',
  'pendente': 'bg-gray-100 text-gray-700 border-gray-300',
  'concluido': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'dispensado': 'bg-slate-100 text-slate-700 border-slate-300',
};

function getStatusStyles(value: string | null): string {
  if (!value) return 'bg-gray-200 text-gray-500 border-gray-400';
  return statusStyles[value as StatusGMUD] ?? 'bg-gray-200 text-gray-500 border-gray-400';
}

const prioridadeStyles: Record<string, string> = {
  'baixa': 'bg-green-100 text-green-800 border-green-300',
  'media': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'alta': 'bg-orange-100 text-orange-800 border-orange-300',
  'critica': 'bg-red-100 text-red-800 border-red-300',
};

const impactoStyles: Record<string, string> = {
  'baixo': 'bg-green-100 text-green-800 border-green-300',
  'medio': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'alto': 'bg-orange-100 text-orange-800 border-orange-300',
  'critico': 'bg-red-100 text-red-800 border-red-300',
};

const ambienteStyles: Record<string, string> = {
  'desenvolvimento': 'bg-gray-100 text-gray-700 border-gray-300',
  'homologacao': 'bg-blue-100 text-blue-800 border-blue-300',
  'producao': 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const origemStyles: Record<string, string> = {
  'interna': 'bg-purple-100 text-purple-800 border-purple-300',
  'cliente': 'bg-blue-100 text-blue-800 border-blue-300',
  'fornecedor': 'bg-orange-100 text-orange-800 border-orange-300',
};

function getLabel(type: GMUDBadgeProps['type'], value: string | null): string {
  if (!value) return '-';
  switch (type) {
    case 'prioridade': return getPrioridadeGMUDLabel(value as any);
    case 'impacto': return getImpactoGMUDLabel(value as any);
    case 'ambiente': return getAmbienteGMUDLabel(value as any);
    case 'origem': return getOrigemGMUDLabel(value as any);
    default: return value;
  }
}

function getStyles(type: GMUDBadgeProps['type'], value: string | null): string {
  if (!value) return 'bg-gray-200 text-gray-500 border-gray-400';
  switch (type) {
    case 'status': return getStatusStyles(value);
    case 'prioridade': return prioridadeStyles[value] ?? 'bg-gray-200 text-gray-500 border-gray-400';
    case 'impacto': return impactoStyles[value] ?? 'bg-gray-200 text-gray-500 border-gray-400';
    case 'ambiente': return ambienteStyles[value] ?? 'bg-gray-200 text-gray-500 border-gray-400';
    case 'origem': return origemStyles[value] ?? 'bg-gray-200 text-gray-500 border-gray-400';
    default: return 'bg-gray-200 text-gray-500 border-gray-400';
  }
}

export function GMUDBadge({ type, value, className }: GMUDBadgeProps) {
  return (
    <div
      className={`
        inline-flex
        px-3 py-1
        rounded-full
        text-sm
        font-medium
        border
        ${getStyles(type, value)}
        ${className ?? ''}
      `}
    >
      {getLabel(type, value)}
    </div>
  );
}
