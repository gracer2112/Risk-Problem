// src/components/RiskProblemHistoryTimeline.tsx

import type {
  HistoricoEvento,
  RiskProblemHistoryResponse,
} from '@/types/risk-problem';

interface RiskProblemHistoryTimelineProps {
  history?: RiskProblemHistoryResponse | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function RiskProblemHistoryTimeline({
  history,
  loading = false,
  error = null,
  onRetry,
}: RiskProblemHistoryTimelineProps) {
  // Helper para formatar data/hora em pt-BR
    const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    };

  // Helper para converter tipo_evento em label amigável em português
  const getEventLabel = (tipo: string): string => {
    const labels: Record<string, string> = {
      item_criado: 'Item criado',
      status_alterado: 'Status alterado',
      data_alvo_alterada: 'Data alvo alterada',
      responsavel_alterado: 'Responsável alterado',
      convertido_em_problema: 'Convertido em problema',
      item_encerrado: 'Item encerrado',
      campo_atualizado: 'Campo atualizado',
    };
    return labels[tipo] || tipo;
  };

  // Helper para detectar se é objeto simples (chaves string, sem aninhamento)
  const isSimpleObject = (val: unknown): val is Record<string, unknown> => {
    return typeof val === 'object' && val !== null && !Array.isArray(val) && Object.values(val).every(v => typeof v !== 'object' || v === null);
  };

  // Helper para detectar array
  const isArray = (val: unknown): val is unknown[] => {
    return Array.isArray(val);
  };

  // Helper para formatar valores simples
  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (isArray(val)) return `[${val.map(formatValue).join(', ')}]`;
    if (isSimpleObject(val)) return `{${Object.entries(val).map(([k, v]) => `${k}: ${formatValue(v)}`).join(', ')}}`;
    return 'Valor complexo';
  };

  // Helper para resumir mudanças
  const summarizeChanges = (prev: unknown, next: unknown) => {
    if (prev === next) return null; // Sem mudança
    if (isSimpleObject(prev) && isSimpleObject(next)) {
        const keys = Array.from(
            new Set([...Object.keys(prev), ...Object.keys(next)])
        );

        const changes = keys
            .filter((key) => prev[key] !== next[key])
            .map((key) => (
            <div key={key} className="text-sm text-gray-600">
                {key}: de {formatValue(prev[key])} para {formatValue(next[key])}
            </div>
            ));

        return changes.length > 0 ? <div className="space-y-1">{changes}</div> : null;
    }

    // Valores simples ou outros
    return (
      <div className="text-sm text-gray-600">
        Mudança: de {formatValue(prev)} para {formatValue(next)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando histórico...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">Erro ao carregar histórico: {error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  const events = history?.historico_eventos || [];
  if (events.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhum evento de histórico registrado até o momento.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((evento: HistoricoEvento) => (
        <div key={evento.id} className="border-l-4 border-blue-500 pl-4 pb-4">
            <div className="mb-2 flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                {getEventLabel(evento.tipo_evento)}
                </h3>
                <span className="text-sm text-gray-500">
                {formatDateTime(evento.data_evento)}
                </span>
            </div>

            {evento.autor && (
                <p className="mb-2 text-sm text-gray-600">
                Autor: {evento.autor}
                </p>
            )}

            {evento.campo && (
                <p className="mb-2 text-sm text-gray-600">
                Campo: {evento.campo}
                </p>
            )}

            {evento.observacao && (
                <p className="mb-2 text-sm text-gray-700">
                Observação: {evento.observacao}
                </p>
            )}

            {summarizeChanges(evento.valor_anterior, evento.valor_novo)}
        </div>
      ))}
    </div>
  );
}
