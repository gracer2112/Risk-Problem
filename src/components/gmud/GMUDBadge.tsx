// src/components/gmud/GMUDBadge.tsx
import { StatusGMUD, StatusChecklistGMUD } from '@/types/gmud';

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
    // — NOVOS — STATUS DO CHECKLIST GMUD —
  'pendente': 'bg-gray-100 text-gray-700 border-gray-300',
  'concluido': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'dispensado': 'bg-slate-100 text-slate-700 border-slate-300'
};

function getStatusStyles(value: string | null): string {
  if (!value) {
    return 'bg-gray-200 text-gray-500 border-gray-400';
  }
  const styles = statusStyles[value as StatusGMUD];
  return styles ?? 'bg-gray-200 text-gray-500 border-gray-400';
}

function getPriorityStyles(value: string | null): string {
  // TODO: Implementar mapeamento de cores para prioridade
  return 'bg-gray-200 text-gray-500 border-gray-400';
}

function getImpactStyles(value: string | null): string {
  // TODO: Implementar mapeamento de cores para impacto
  return 'bg-gray-200 text-gray-500 border-gray-400';
}

function getAmbienteStyles(value: string | null): string {
  // TODO: Implementar mapeamento de cores para ambiente
  return 'bg-gray-200 text-gray-500 border-gray-400';
}

function getOrigemStyles(value: string | null): string {
  // TODO: Implementar mapeamento de cores para origem
  return 'bg-gray-200 text-gray-500 border-gray-400';
}

function getStyles(type: GMUDBadgeProps['type'], value: string | null): string {
  switch (type) {
    case 'status':
      return getStatusStyles(value);
    case 'prioridade':
      return getPriorityStyles(value);
    case 'impacto':
      return getImpactStyles(value);
    case 'ambiente':
      return getAmbienteStyles(value);
    case 'origem':
      return getOrigemStyles(value);
    default:
      return 'bg-gray-200 text-gray-500 border-gray-400';
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
      {value}
    </div>
  );
}