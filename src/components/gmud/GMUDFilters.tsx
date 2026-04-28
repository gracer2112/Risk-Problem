// src/components/gmud/GMUDFilters.tsx

import { 
  ChecklistItemGMUD, 
  HistoricoItemGMUD, 
  StatusGMUD, 
  PrioridadeGMUD, 
  ImpactoGMUD, 
  AmbienteGMUD,
  OrigemGMUD,
  TipoExecucaoGMUD
} from "@/types/gmud";

export type GMUDFiltersProps = {
  status?: StatusGMUD;
  prioridade?: PrioridadeGMUD;
  impacto?: ImpactoGMUD;
  ambiente?: AmbienteGMUD;
  busca?: string;
  loading?: boolean;
  disabled?: boolean;
  onStatusChange?: (value: StatusGMUD | '') => void;
  onPrioridadeChange?: (value: PrioridadeGMUD|'') => void;
  onImpactoChange?: (value: ImpactoGMUD|'') => void;
  onAmbienteChange?: (value: AmbienteGMUD|'') => void;
  onBuscaChange?: (value: string) => void;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
};

type Option<T extends string = string> = {
  value: T;
  label: string;
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
            value={status ?? ''}
            onChange={(e) => onStatusChange?.(e.target.value as StatusGMUD | '')}
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
            value={prioridade ?? ''}
            onChange={(e) => onPrioridadeChange?.(e.target.value as PrioridadeGMUD | '')}
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
            onChange={(e) => onImpactoChange?.(e.target.value as ImpactoGMUD | '')}
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
            onChange={(e) => onAmbienteChange?.(e.target.value as AmbienteGMUD | '')}
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
