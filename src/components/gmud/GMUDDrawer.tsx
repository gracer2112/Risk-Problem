// src/components/gmud/GMUDDrawer.tsx

export type GMUDDrawerMode = 'create' | 'edit' | 'view';

export type GMUDDrawerChecklistItem = {
  id: string;
  descricao: string;
  status?: string;
  observacao?: string | null;
};

export type GMUDDrawerHistoryItem = {
  id: string;
  timestamp?: string | null;
  tipoEvento?: string | null;
  usuarioNome?: string | null;
  observacao?: string | null;
};

export type GMUDDrawerProps = {
  open?: boolean;
  mode?: GMUDDrawerMode;
  loading?: boolean;
  saving?: boolean;
  deleting?: boolean;
  title?: string;
  description?: string;
  projectName?: string;
  openProjectProjectId?: string | null;
  status?: string;
  prioridade?: string;
  impacto?: string;
  ambiente?: string;
  tipoExecucao?: string;
  origem?: string;
  dataAgendada?: string | null;
  janelaExecucaoInicio?: string | null;
  janelaExecucaoFim?: string | null;
  solicitante?: string | null;
  responsavelExecucao?: string | null;
  planoRollback?: string | null;
  checklistItems?: GMUDDrawerChecklistItem[];
  historyItems?: GMUDDrawerHistoryItem[];
  error?: string | null;
  submitLabel?: string;
  deleteLabel?: string;
  closeLabel?: string;
  onClose?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onPrioridadeChange?: (value: string) => void;
  onImpactoChange?: (value: string) => void;
  onAmbienteChange?: (value: string) => void;
  onTipoExecucaoChange?: (value: string) => void;
  onOrigemChange?: (value: string) => void;
  onDataAgendadaChange?: (value: string) => void;
  onJanelaExecucaoInicioChange?: (value: string) => void;
  onJanelaExecucaoFimChange?: (value: string) => void;
  onSolicitanteChange?: (value: string) => void;
  onResponsavelExecucaoChange?: (value: string) => void;
  onPlanoRollbackChange?: (value: string) => void;
};

type Option = {
  value: string;
  label: string;
};

const STATUS_OPTIONS: Option[] = [
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

const PRIORIDADE_OPTIONS: Option[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const IMPACTO_OPTIONS: Option[] = [
  { value: 'baixo', label: 'Baixo' },
  { value: 'medio', label: 'Médio' },
  { value: 'alto', label: 'Alto' },
  { value: 'critico', label: 'Crítico' },
];

const AMBIENTE_OPTIONS: Option[] = [
  { value: 'desenvolvimento', label: 'Desenvolvimento' },
  { value: 'homologacao', label: 'Homologação' },
  { value: 'producao', label: 'Produção' },
];

const TIPO_EXECUCAO_OPTIONS: Option[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatica', label: 'Automática' },
];

const ORIGEM_OPTIONS: Option[] = [
  { value: 'interna', label: 'Interna' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'fornecedor', label: 'Fornecedor' },
];

const LABEL_MAP = {
  status: Object.fromEntries(STATUS_OPTIONS.map((item) => [item.value, item.label])),
  prioridade: Object.fromEntries(PRIORIDADE_OPTIONS.map((item) => [item.value, item.label])),
  impacto: Object.fromEntries(IMPACTO_OPTIONS.map((item) => [item.value, item.label])),
  ambiente: Object.fromEntries(AMBIENTE_OPTIONS.map((item) => [item.value, item.label])),
  tipoExecucao: Object.fromEntries(TIPO_EXECUCAO_OPTIONS.map((item) => [item.value, item.label])),
  origem: Object.fromEntries(ORIGEM_OPTIONS.map((item) => [item.value, item.label])),
} as const;

type LabelField = keyof typeof LABEL_MAP;

const formatValue = (value?: string | null, field?: LabelField): string => {
  if (!value) {
    return '-';
  }

  if (field && LABEL_MAP[field][value as keyof (typeof LABEL_MAP)[typeof field]]) {
    return LABEL_MAP[field][value as keyof (typeof LABEL_MAP)[typeof field]];
  }

  return value;
};

const formatTimestamp = (timestamp?: string | null): string => {
  if (!timestamp) {
    return '-';
  }

  const parsed = new Date(timestamp);

  if (Number.isNaN(parsed.getTime())) {
    return timestamp;
  }

  return parsed.toLocaleString('pt-BR');
};

const renderSectionTitle = (title: string) => (
  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
    {title}
  </h3>
);

function SkeletonField() {
  return (
    <div className="space-y-1.5">
      <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
      <div className="h-11 rounded-lg bg-gray-200 animate-pulse" />
    </div>
  );
}

function SkeletonSection({ fieldCount }: { fieldCount: number }) {
  return (
    <div className="space-y-4 pb-8">
      <div className="h-6 w-44 rounded bg-gray-200 animate-pulse mb-4" />
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: fieldCount }, (_, index) => (
          <SkeletonField key={`sk-field-${fieldCount}-${index}`} />
        ))}
      </div>
    </div>
  );
}

function SkeletonList({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="space-y-4 pb-8">
      <div className={`h-6 rounded bg-gray-200 animate-pulse mb-4 ${titleWidth}`} />
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={`sk-list-${titleWidth}-${index}`} className="h-20 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ViewField({
  label,
  value,
  field,
  multiline = false,
}: {
  label: string;
  value?: string | null;
  field?: LabelField;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 leading-4">{label}</label>
      <div
        className={[
          'p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm min-h-[44px]',
          multiline ? 'whitespace-pre-wrap' : 'flex items-center',
        ].join(' ')}
      >
        {formatValue(value, field)}
      </div>
    </div>
  );
}


function EditField({
  label,
  value,
  onChange,
  disabled,
  options,
  textarea = false,
  inputType = 'text',
}: {
  label: string;
  value?: string | null;
  onChange?: (value: string) => void;
  disabled: boolean;
  options?: Option[];
  textarea?: boolean;
  inputType?: 'text' | 'date' | 'time';
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 leading-4">{label}</label>
      {options ? (
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
        >
          <option value="">Selecione uma opção</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[96px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          rows={4}
        />
      ) : (
        <input
          type={inputType}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export default function GMUDDrawer(props: GMUDDrawerProps) {
  const {
    open = false,
    mode = 'view',
    loading = false,
    saving = false,
    deleting = false,
    title,
    description,
    projectName,
    openProjectProjectId,
    status,
    prioridade,
    impacto,
    ambiente,
    tipoExecucao,
    origem,
    dataAgendada,
    janelaExecucaoInicio,
    janelaExecucaoFim,
    solicitante,
    responsavelExecucao,
    planoRollback,
    checklistItems = [],
    historyItems = [],
    error,
    submitLabel,
    deleteLabel,
    closeLabel,
    onClose,
    onSubmit,
    onDelete,
    onTitleChange,
    onDescriptionChange,
    onStatusChange,
    onPrioridadeChange,
    onImpactoChange,
    onAmbienteChange,
    onTipoExecucaoChange,
    onOrigemChange,
    onDataAgendadaChange,
    onJanelaExecucaoInicioChange,
    onJanelaExecucaoFimChange,
    onSolicitanteChange,
    onResponsavelExecucaoChange,
    onPlanoRollbackChange,
  } = props;

  if (!open) {
    return null;
  }

  const isView = mode === 'view';
  const isActionDisabled = saving || deleting;
  const isFieldDisabled = isView || saving || deleting;

  const drawerHeading =
    mode === 'create'
      ? 'Nova GMUD'
      : mode === 'edit'
      ? 'Editar GMUD'
      : 'Detalhes da GMUD';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden />
      <div className="fixed right-0 top-0 h-screen w-full max-w-[640px] bg-white shadow-2xl z-[60] flex flex-col max-h-screen">
        <div className="p-6 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 flex-1 pr-4">{drawerHeading}</h2>
            <button
              type="button"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={isActionDisabled}
            >
              {closeLabel ?? 'Fechar'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <>
              <SkeletonSection fieldCount={6} />
              <SkeletonSection fieldCount={6} />
              <SkeletonSection fieldCount={2} />
              <SkeletonSection fieldCount={1} />
              <SkeletonList titleWidth="w-28" />
              <SkeletonList titleWidth="w-32" />
            </>
          ) : (
            <>
              <section>
                {renderSectionTitle('Dados principais')}
                <div className="grid grid-cols-1 gap-4">
                  {isView ? (
                    <>
                      <ViewField label="Título" value={title} />
                      <ViewField label="Descrição" value={description} multiline />
                    </>
                  ) : (
                    <>
                      <EditField label="Título" value={title} onChange={onTitleChange} disabled={isFieldDisabled} />
                      <EditField label="Descrição" value={description} onChange={onDescriptionChange} disabled={isFieldDisabled} textarea />
                    </>
                  )}

                  {projectName && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 leading-4">Projeto</label>
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-950">
                        {projectName}
                      </div>
                    </div>
                  )}

                  {openProjectProjectId && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 leading-4">OpenProject</label>
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-950">
                        {openProjectProjectId}
                      </div>
                    </div>
                  )}

                  {isView ? (
                    <>
                      <ViewField label="Status" value={status} field="status" />
                      <ViewField label="Prioridade" value={prioridade} field="prioridade" />
                      <ViewField label="Impacto" value={impacto} field="impacto" />
                    </>
                  ) : (
                    <>
                      <EditField label="Status" value={status} onChange={onStatusChange} disabled={isFieldDisabled} options={STATUS_OPTIONS} />
                      <EditField label="Prioridade" value={prioridade} onChange={onPrioridadeChange} disabled={isFieldDisabled} options={PRIORIDADE_OPTIONS} />
                      <EditField label="Impacto" value={impacto} onChange={onImpactoChange} disabled={isFieldDisabled} options={IMPACTO_OPTIONS} />
                    </>
                  )}
                </div>
              </section>

              <section>
                {renderSectionTitle('Planejamento')}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {isView ? (
                    <>
                      <ViewField label="Ambiente" value={ambiente} field="ambiente" />
                      <ViewField label="Tipo de Execução" value={tipoExecucao} field="tipoExecucao" />
                      <ViewField label="Origem" value={origem} field="origem" />
                      <ViewField label="Data Agendada" value={dataAgendada} />
                      <ViewField label="Janela de Execução Início" value={janelaExecucaoInicio} />
                      <ViewField label="Janela de Execução Fim" value={janelaExecucaoFim} />
                    </>
                  ) : (
                    <>
                      <EditField label="Ambiente" value={ambiente} onChange={onAmbienteChange} disabled={isFieldDisabled} options={AMBIENTE_OPTIONS} />
                      <EditField label="Tipo de Execução" value={tipoExecucao} onChange={onTipoExecucaoChange} disabled={isFieldDisabled} options={TIPO_EXECUCAO_OPTIONS} />
                      <EditField label="Origem" value={origem} onChange={onOrigemChange} disabled={isFieldDisabled} options={ORIGEM_OPTIONS} />
                      <EditField label="Data Agendada" value={dataAgendada} onChange={onDataAgendadaChange} disabled={isFieldDisabled} inputType="date" />
                      <EditField label="Janela de Execução Início" value={janelaExecucaoInicio} onChange={onJanelaExecucaoInicioChange} disabled={isFieldDisabled} inputType="time" />
                      <EditField label="Janela de Execução Fim" value={janelaExecucaoFim} onChange={onJanelaExecucaoFimChange} disabled={isFieldDisabled} inputType="time" />
                    </>
                  )}
                </div>
              </section>

              <section>
                {renderSectionTitle('Responsáveis')}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {isView ? (
                    <>
                      <ViewField label="Solicitante" value={solicitante} />
                      <ViewField label="Responsável de Execução" value={responsavelExecucao} />
                    </>
                  ) : (
                    <>
                      <EditField label="Solicitante" value={solicitante} onChange={onSolicitanteChange} disabled={isFieldDisabled} />
                      <EditField label="Responsável de Execução" value={responsavelExecucao} onChange={onResponsavelExecucaoChange} disabled={isFieldDisabled} />
                    </>
                  )}
                </div>
              </section>

              <section>
                {renderSectionTitle('Rollback')}
                <div className="grid grid-cols-1 gap-4">
                  {isView ? (
                    <ViewField label="Plano de Rollback" value={planoRollback} multiline />
                  ) : (
                    <EditField label="Plano de Rollback" value={planoRollback} onChange={onPlanoRollbackChange} disabled={isFieldDisabled} textarea />
                  )}
                </div>
              </section>

              <section>
                {renderSectionTitle('Checklist')}
                {checklistItems.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="font-medium text-gray-900 mb-2">{item.descricao}</div>
                        {item.status && (
                          <div className="text-sm mb-2 text-gray-700">
                            Status: <span className="font-semibold">{item.status}</span>
                          </div>
                        )}
                        {item.observacao && (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.observacao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500 font-medium">Nenhum item no checklist</p>
                  </div>
                )}
              </section>

              <section>
                {renderSectionTitle('Histórico')}
                {historyItems.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {historyItems.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">{formatTimestamp(item.timestamp)}</div>
                        <div className="font-medium text-gray-900 mb-1">{formatValue(item.tipoEvento)}</div>
                        {item.usuarioNome && <div className="text-sm text-gray-900 mb-2">{item.usuarioNome}</div>}
                        {item.observacao && <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.observacao}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500 font-medium">Nenhum histórico disponível</p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-white shrink-0">
            <div className="flex items-center justify-end gap-3">
                <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={onClose}
                disabled={isActionDisabled}
                >
                {closeLabel ?? 'Fechar'}
                </button>
                {mode === 'edit' && onDelete && (
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={onDelete}
                    disabled={isActionDisabled}
                >
                    {deleting ? 'Excluindo...' : deleteLabel ?? 'Excluir'}
                </button>
                )}
                {(mode === 'create' || mode === 'edit') && onSubmit && (
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={onSubmit}
                    disabled={isActionDisabled}
                >
                    {saving ? 'Salvando...' : submitLabel ?? 'Salvar'}
                </button>
                )}
            </div>
        </div>
      </div>
    </>
  );
}