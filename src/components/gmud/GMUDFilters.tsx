// src/components/gmud/GMUDFilters.tsx

export type GMUDFiltersProps = {
  status?: string;
  prioridade?: string;
  impacto?: string;
  ambiente?: string;
  busca?: string;
  loading?: boolean;
  disabled?: boolean;
  onStatusChange?: (value: string) => void;
  onPrioridadeChange?: (value: string) => void;
  onImpactoChange?: (value: string) => void;
  onAmbienteChange?: (value: string) => void;
  onBuscaChange?: (value: string) => void;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
};

type Option = {
  value: string;
  label: string;
};

const statusOptions: Option[] = [
  { value: '', label: 'Todos' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_revisao', label: 'Em Revisão' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'agendado', label: 'Agendado' },
  { value: 'em_execucao', label: 'Em Execução' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'rollback', label: 'Rollback' },
];

const prioridadeOptions: Option[] = [
  { value: '', label: 'Todos' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const impactoOptions: Option[] = [
  { value: '', label: 'Todos' },
  { value: 'baixo', label: 'Baixo' },
  { value: 'medio', label: 'Médio' },
  { value: 'alto', label: 'Alto' },
  { value: 'critico', label: 'Crítico' },
];

const ambienteOptions: Option[] = [
  { value: '', label: 'Todos' },
  { value: 'desenvolvimento', label: 'Desenvolvimento' },
  { value: 'homologacao', label: 'Homologação' },
  { value: 'producao', label: 'Produção' },
];

export default function GMUDFilters(props: GMUDFiltersProps) {
  const {
    status,
    prioridade,
    impacto,
    ambiente,
    busca,
    loading = false,
    disabled = false,
    onStatusChange,
    onPrioridadeChange,
    onImpactoChange,
    onAmbienteChange,
    onBuscaChange,
    onApplyFilters,
    onClearFilters,
  } = props;

  const isDisabled = loading || disabled;

  const commonInputClass =
    'block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 focus:border-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

  const labelClass = 'block text-sm font-medium text-gray-700 mb-2';

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {/* Status */}
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={status || ''}
            onChange={(e) => onStatusChange?.(e.target.value)}
            disabled={isDisabled}
            className={commonInputClass}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prioridade */}
        <div>
          <label className={labelClass}>Prioridade</label>
          <select
            value={prioridade || ''}
            onChange={(e) => onPrioridadeChange?.(e.target.value)}
            disabled={isDisabled}
            className={commonInputClass}
          >
            {prioridadeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Impacto */}
        <div>
          <label className={labelClass}>Impacto</label>
          <select
            value={impacto || ''}
            onChange={(e) => onImpactoChange?.(e.target.value)}
            disabled={isDisabled}
            className={commonInputClass}
          >
            {impactoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ambiente */}
        <div>
          <label className={labelClass}>Ambiente</label>
          <select
            value={ambiente || ''}
            onChange={(e) => onAmbienteChange?.(e.target.value)}
            disabled={isDisabled}
            className={commonInputClass}
          >
            {ambienteOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Busca */}
        <div>
          <label className={labelClass}>Busca</label>
          <input
            type="text"
            value={busca || ''}
            onChange={(e) => onBuscaChange?.(e.target.value)}
            placeholder="Digite sua busca"
            disabled={isDisabled}
            className={commonInputClass}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 justify-end">
        <button
          type="button"
          onClick={onClearFilters}
          disabled={isDisabled}
          className="flex-1 sm:w-auto sm:flex-none px-6 py-2.5 bg-gray-100 text-gray-900 text-sm font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Limpar
        </button>
        <button
          type="button"
          onClick={onApplyFilters}
          disabled={isDisabled}
          className="flex-1 sm:w-auto sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}
