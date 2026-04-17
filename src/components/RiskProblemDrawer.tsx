// src/components/RiskProblemDrawer.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  TipoInicialEnum,
  NaturezaAtualEnum,
  StatusRiscoEnum,
  StatusProblemaEnum,
  type CloseRiskProblemFormData,
  type CloseRiskProblemRequest,
  type ConvertRiskToProblemFormData,
  type ConvertRiskToProblemRequest,
  type RiskProblemEntity,
  type RiskProblemFormData,
  type SimNaoValue,
  type RiskProblemHistoryResponse,
  buildInitialFormData,
  calcularNivelRiscoInerente,
  calcularNivelRiscoResidual,
  calcularPrioridadeProblema,
} from '@/types/risk-problem';

import RiskProblemHistoryTimeline from '@/components/RiskProblemHistoryTimeline';

import {
  getVisibilityRules,
  validateCloseRiskProblemForm,
  validateConvertToProblemForm,
  validateRiskProblem,
} from '@/utils/drawer-validation';

import {
  canCloseRiskProblem,
  canConvertRiskToProblem,
  isClosedItem,
} from '@/utils/risk-problem-domain';

import {
  mapEntityToFormData 
} from '@/services/risk-problem.mapper';

import { riskProblemService } from '@/services/api';

import type { SemanticTone } from '@/utils/risk-problem-semantics';
import {
  getFivePointScaleSemantic,
  getControlEffectivenessSemantic,
  getCompositeScoreSemantic,
} from '@/utils/risk-problem-semantics';

interface RiskProblemDrawerProps {
  isOpen: boolean;
  item: RiskProblemEntity | null;
  onClose: () => void;
  onSave: (
    form: RiskProblemFormData,
    original?: RiskProblemEntity
  ) => Promise<void>;
  onConvertToProblem?: (
    item: RiskProblemEntity,
    payload: ConvertRiskToProblemRequest
  ) => Promise<RiskProblemEntity>;
  onCloseRiskProblem?: (
    item: RiskProblemEntity,
    payload: CloseRiskProblemRequest
  ) => Promise<RiskProblemEntity>;
  loading?: boolean;

  history?: RiskProblemHistoryResponse | null;
  historyLoading?: boolean;
  historyError?: string | null;
  onLoadHistory?: (
    itemId: string,
    options?: { force?: boolean }
  ) => Promise<RiskProblemHistoryResponse>;
}

const SCORE_MIN = 1;
const SCORE_MAX = 5;
const SCORE_STEP = 1;

function normalizeDateInputValue(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function mapItemToFormData(item: RiskProblemEntity): RiskProblemFormData {
  const formData = mapEntityToFormData(item);
  return {
    tipo_inicial: item.tipo_inicial,
    natureza_atual: item.natureza_atual,
    status_operacional: item.status_operacional,

    descricao: item.descricao,
    causa_raiz: item.causa_raiz,
    descricao_impacto: item.descricao_impacto,

    acao_corretiva_controle: item.acao_corretiva_controle,
    agente_solucao: item.agente_solucao ?? null,
    coordenador_agente: item.coordenador_agente ?? null,
    data_alvo_solucao: normalizeDateInputValue(item.data_alvo_solucao),

    probabilidade_inerente: item.probabilidade_inerente ?? null,
    impacto_inerente: item.impacto_inerente ?? null,
    eficacia_controle: item.eficacia_controle ?? null,
    probabilidade_residual: item.probabilidade_residual ?? null,
    impacto_residual: item.impacto_residual ?? null,

    impacto_realizado: item.impacto_realizado ?? null,
    urgencia_solucao: item.urgencia_solucao ?? null,
  };
}

function toNullableScore(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  const rounded = Math.round(parsed);

  if (rounded < SCORE_MIN) {
    return SCORE_MIN;
  }

  if (rounded > SCORE_MAX) {
    return SCORE_MAX;
  }

  return rounded;
}

function formatEnumLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getDefaultStatusByTipoInicial(
  tipo_inicial: TipoInicialEnum
): StatusRiscoEnum | StatusProblemaEnum {
  return tipo_inicial === TipoInicialEnum.RISCO
    ? StatusRiscoEnum.IDENTIFICADO
    : StatusProblemaEnum.ABERTO;
}

function getDefaultNaturezaByTipoInicial(
  tipo_inicial: TipoInicialEnum
): NaturezaAtualEnum {
  return tipo_inicial === TipoInicialEnum.RISCO
    ? NaturezaAtualEnum.RISCO
    : NaturezaAtualEnum.PROBLEMA;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function normalizeDateTimeLocalInputValue(value?: string | null): string {
  if (!value) {
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localNow.toISOString().slice(0, 16);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localNow.toISOString().slice(0, 16);
  }

  const localDate = new Date(
    parsed.getTime() - parsed.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 16);
}

function toIsoFromDateTimeLocal(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
}

function buildInitialConvertFormData(
  item?: RiskProblemEntity | null
): ConvertRiskToProblemFormData {
  return {
    transitionedAt: normalizeDateTimeLocalInputValue(
      item?.convertido_em_problema_em ??
        item?.data_transicao_problema ??
        null
    ),
    transitionReason: item?.motivo_transicao ?? '',
    controlApplied: item?.controle_aplicado ?? 'nao',
    controlEffective: item?.controle_efetivo ?? 'nao',
  };
}

function buildInitialCloseFormData(
  item?: RiskProblemEntity | null
): CloseRiskProblemFormData {
  return {
    data_encerramento: normalizeDateTimeLocalInputValue(
      item?.data_encerramento ?? null
    ),
    observacao_encerramento: item?.observacao_encerramento ?? '',
  };
}

function formatDateTimeDisplay(value?: string | null): string {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('pt-BR');
}

function getSemanticToneTextClass(tone: SemanticTone): string {
  switch (tone) {
    case 'neutral':
      return 'text-gray-600';
    case 'info':
      return 'text-sky-700';
    case 'success':
      return 'text-emerald-700';
    case 'warning':
      return 'text-amber-700';
    case 'danger':
      return 'text-red-700';
    default:
      return 'text-gray-600';
  }
}

function getScoreSemanticLabel(
  field:
    | 'probabilidade'
    | 'impacto'
    | 'urgencia'
    | 'efetividade_controle'
    | 'classificacao'
    | 'prioridade',
  value: number | null | undefined
) {
  if (field === 'efetividade_controle') {
    return getControlEffectivenessSemantic(value);
  }

  if (field === 'classificacao' || field === 'prioridade') {
    return getCompositeScoreSemantic(value);
  }

  return getFivePointScaleSemantic(value);
}

export default function RiskProblemDrawer({
  isOpen,
  item,
  onClose,
  onSave,
  onConvertToProblem,
  onCloseRiskProblem,
  loading = false,
  history = null,
  historyLoading = false,
  historyError = null,
  onLoadHistory,
}: RiskProblemDrawerProps) {

  const [formData, setFormData] = useState<RiskProblemFormData>(
    buildInitialFormData(TipoInicialEnum.RISCO)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConvertMode, setIsConvertMode] = useState(false);
  const [convertForm, setConvertForm] =
    useState<ConvertRiskToProblemFormData>(
      buildInitialConvertFormData(item)
    );
  const [convertErrors, setConvertErrors] = useState<Record<string, string>>(
    {}
  );
  const [isCloseMode, setIsCloseMode] = useState(false);
  const [closeForm, setCloseForm] =
    useState<CloseRiskProblemFormData>(
      buildInitialCloseFormData(item)
    );
  const [closeErrors, setCloseErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(item);
  const isBusy = isSubmitting || loading;
  const isSpecialMode = isConvertMode || isCloseMode;
  const canShowConvertAction = Boolean(
    item && onConvertToProblem && canConvertRiskToProblem(item)
  );

  const isClosed = Boolean(item && isClosedItem(item));

  const canShowCloseAction = Boolean(
    item && onCloseRiskProblem && canCloseRiskProblem(item)
  );

  const showClosureSummary = Boolean(
    item && (item.data_encerramento || item.observacao_encerramento)
  );

  const showHistorySection = Boolean(item);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (item) {
      setFormData(mapItemToFormData(item));
    } else {
      setFormData(buildInitialFormData(TipoInicialEnum.RISCO));
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
    setIsConvertMode(false);
    setConvertForm(buildInitialConvertFormData(item));
    setConvertErrors({});
    setIsCloseMode(false);
    setCloseForm(buildInitialCloseFormData(item));
    setCloseErrors({});

  }, [isOpen, item]);

  useEffect(() => {
    if (!isOpen || !item || !onLoadHistory) {
      return;
    }

    onLoadHistory(item.id).catch(() => undefined);
  }, [isOpen, item, onLoadHistory]); 

  const visibility = useMemo(
    () => getVisibilityRules(formData.natureza_atual),
    [formData.natureza_atual]
  );

  const statusOptions = useMemo(() => {
    if (formData.natureza_atual === NaturezaAtualEnum.RISCO) {
      return Object.values(StatusRiscoEnum);
    }

    return Object.values(StatusProblemaEnum);
  }, [formData.natureza_atual]);

  const nivel_risco_inerente = useMemo(
    () =>
      calcularNivelRiscoInerente(
        formData.probabilidade_inerente,
        formData.impacto_inerente
      ),
    [formData.probabilidade_inerente, formData.impacto_inerente]
  );

  const nivel_risco_residual = useMemo(
    () =>
      calcularNivelRiscoResidual(
        formData.probabilidade_residual,
        formData.impacto_residual
      ),
    [formData.probabilidade_residual, formData.impacto_residual]
  );

  const prioridade_problema = useMemo(
    () =>
      calcularPrioridadeProblema(
        formData.impacto_realizado,
        formData.urgencia_solucao
      ),
    [formData.impacto_realizado, formData.urgencia_solucao]
  );

  const probabilidadeInerenteSemantic = useMemo(() => getScoreSemanticLabel('probabilidade', formData.probabilidade_inerente), [formData.probabilidade_inerente]);
  const impactoInerenteSemantic = useMemo(() => getScoreSemanticLabel('impacto', formData.impacto_inerente), [formData.impacto_inerente]);
  const nivelRiscoInerenteSemantic = useMemo(() => getScoreSemanticLabel('classificacao', nivel_risco_inerente), [nivel_risco_inerente]);
  const eficaciaControleSemantic = useMemo(() => getScoreSemanticLabel('efetividade_controle', formData.eficacia_controle), [formData.eficacia_controle]);
  const probabilidadeResidualSemantic = useMemo(() => getScoreSemanticLabel('probabilidade', formData.probabilidade_residual), [formData.probabilidade_residual]);
  const impactoResidualSemantic = useMemo(() => getScoreSemanticLabel('impacto', formData.impacto_residual), [formData.impacto_residual]);
  const nivelRiscoResidualSemantic = useMemo(() => getScoreSemanticLabel('classificacao', nivel_risco_residual), [nivel_risco_residual]);
  const impactoRealizadoSemantic = useMemo(() => getScoreSemanticLabel('impacto', formData.impacto_realizado), [formData.impacto_realizado]);
  const urgenciaSolucaoSemantic = useMemo(() => getScoreSemanticLabel('urgencia', formData.urgencia_solucao), [formData.urgencia_solucao]);
  const prioridadeProblemaSemantic = useMemo(() => getScoreSemanticLabel('prioridade', prioridade_problema), [prioridade_problema]);

  const updateConvertField = <K extends keyof ConvertRiskToProblemFormData>(
    field: K,
    value: ConvertRiskToProblemFormData[K]
  ) => {
    setConvertForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setConvertErrors((prev) => {
      if (!prev[field as string]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field as string];
      return next;
    });

    if (submitError) {
      setSubmitError(null);
    }
  };

  const updateCloseField = <K extends keyof CloseRiskProblemFormData>(
    field: K,
    value: CloseRiskProblemFormData[K]
  ) => {
    setCloseForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setCloseErrors((prev) => {
      if (!prev[field as string]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field as string];
      return next;
    });

    if (submitError) {
      setSubmitError(null);
    }
  };

  const updateField = <K extends keyof RiskProblemFormData>(
    field: K,
    value: RiskProblemFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => {
      if (!prev[field as string]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field as string];
      return next;
    });

    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleTipoInicialChange = (tipo_inicial: TipoInicialEnum) => {
    if (isEditing) {
      return;
    }

    const base = buildInitialFormData(tipo_inicial);

    setFormData((prev) => ({
      ...base,
      descricao: prev.descricao,
      causa_raiz: prev.causa_raiz,
      descricao_impacto: prev.descricao_impacto,
      acao_corretiva_controle: prev.acao_corretiva_controle,
      agente_solucao: prev.agente_solucao,
      coordenador_agente: prev.coordenador_agente,
      data_alvo_solucao: prev.data_alvo_solucao,
    }));

    setErrors({});
    setSubmitError(null);
  };

  const handleOverlayClick = () => {
    if (!isBusy) {
      onClose();
    }
  };

  const handleConvertSubmit = async () => {
    if (!item || !onConvertToProblem) {
      return;
    }

    setSubmitError(null);

    const validation = validateConvertToProblemForm(convertForm);

    if (!validation.isValid) {
      setConvertErrors(validation.errors);
      return;
    }

    setConvertErrors({});
    setIsSubmitting(true);

    try {
      await onConvertToProblem(item, {
        ...convertForm,
        transitionedAt: toIsoFromDateTimeLocal(convertForm.transitionedAt),
      });

      setIsConvertMode(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Não foi possível converter o risco em problema.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSubmit = async () => {
    if (!item || !onCloseRiskProblem) {
      return;
    }

    setSubmitError(null);

    const validation = validateCloseRiskProblemForm(closeForm);

    if (!validation.isValid) {
      setCloseErrors(validation.errors);
      return;
    }

    setCloseErrors({});
    setIsSubmitting(true);

    try {
      const closedEntity = await onCloseRiskProblem(item, {
        ...closeForm,
        data_encerramento: toIsoFromDateTimeLocal(closeForm.data_encerramento),
      });

      setIsCloseMode(false);
      setCloseForm(buildInitialCloseFormData(closedEntity));
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Não foi possível encerrar o item.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitError(null);

    const validation = validateRiskProblem(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await onSave(formData, item ?? undefined);
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Não foi possível salvar o item.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="risk-problem-drawer-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2
              id="risk-problem-drawer-title"
              className="text-xl font-semibold text-gray-900"
            >
              {item ? 'Editar item' : 'Novo item'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Consolidação de domínio e contrato de dados
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar drawer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
            {canShowConvertAction && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
                    Conversão de risco em problema
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Use esta ação quando o risco tiver se materializado e passar
                    a demandar tratamento operacional.
                  </p>
                </div>

                {!isConvertMode ? (
                  <button
                    type="button"
                    onClick={() => {
                        setIsCloseMode(false);
                        setCloseErrors({});
                        setCloseForm(buildInitialCloseFormData(item));
                        setSubmitError(null);
                        setIsConvertMode(true);
                    }}
                    disabled={isBusy}
                    className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Converter em problema
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsConvertMode(false);
                      setConvertErrors({});
                      setSubmitError(null);
                      setConvertForm(buildInitialConvertFormData(item));
                    }}
                    disabled={isBusy}
                    className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar conversão
                  </button>
                )}
              </div>

              {isConvertMode && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="transitionedAt"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Data da transição
                    </label>
                    <input
                      id="transitionedAt"
                      type="datetime-local"
                      value={convertForm.transitionedAt}
                      onChange={(event) =>
                        updateConvertField(
                          'transitionedAt',
                          event.target.value
                        )
                      }
                      disabled={isBusy}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 md:w-80"
                    />
                    <FieldError message={convertErrors.transitionedAt} />
                  </div>

                  <div>
                    <label
                      htmlFor="transitionReason"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Motivo da transição
                    </label>
                    <textarea
                      id="transitionReason"
                      rows={3}
                      value={convertForm.transitionReason}
                      onChange={(event) =>
                        updateConvertField(
                          'transitionReason',
                          event.target.value
                        )
                      }
                      disabled={isBusy}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    />
                    <FieldError message={convertErrors.transitionReason} />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="controlApplied"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Havia controle aplicado?
                      </label>
                      <select
                        id="controlApplied"
                        value={convertForm.controlApplied}
                        onChange={(event) =>
                          updateConvertField(
                            'controlApplied',
                            event.target.value as SimNaoValue
                          )
                        }
                        disabled={isBusy}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                      </select>
                      <FieldError message={convertErrors.controlApplied} />
                    </div>

                    <div>
                      <label
                        htmlFor="controlEffective"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        O controle era efetivo?
                      </label>
                      <select
                        id="controlEffective"
                        value={convertForm.controlEffective}
                        onChange={(event) =>
                          updateConvertField(
                            'controlEffective',
                            event.target.value as SimNaoValue
                          )
                        }
                        disabled={isBusy}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                      </select>
                      <FieldError message={convertErrors.controlEffective} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleConvertSubmit}
                      disabled={isBusy}
                      className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBusy ? 'Convertendo...' : 'Confirmar conversão'}
                    </button>
                  </div>
                </div>
              )}
            </section>
            )}

            {(canShowCloseAction || showClosureSummary) && (
            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
                    Encerramento do item
                  </h3>
                  <p className="mt-1 text-sm text-emerald-700">
                    Registre a conclusão com data e observação final para manter
                    a rastreabilidade do item.
                  </p>
                </div>

                {canShowCloseAction &&
                  (!isCloseMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsConvertMode(false);
                        setConvertErrors({});
                        setConvertForm(buildInitialConvertFormData(item));
                        setSubmitError(null);
                        setIsCloseMode(true);
                      }}
                      disabled={isBusy}
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Encerrar item
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCloseMode(false);
                        setCloseErrors({});
                        setSubmitError(null);
                        setCloseForm(buildInitialCloseFormData(item));
                      }}
                      disabled={isBusy}
                      className="rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar encerramento
                    </button>
                  ))}
              </div>

              {showClosureSummary && (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      Data de encerramento
                    </p>
                    <p className="mt-1 text-sm text-emerald-900">
                      {formatDateTimeDisplay(item?.data_encerramento)}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      Observação final
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-900">
                      {item?.observacao_encerramento ?? '—'}
                    </p>
                  </div>
                </div>
              )}

              {isCloseMode && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="data_encerramento"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Data de encerramento
                    </label>
                    <input
                      id="data_encerramento"
                      type="datetime-local"
                      value={closeForm.data_encerramento}
                      onChange={(event) =>
                        updateCloseField(
                          'data_encerramento',
                          event.target.value
                        )
                      }
                      disabled={isBusy}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 md:w-80"
                    />
                    <FieldError message={closeErrors.data_encerramento} />
                  </div>

                  <div>
                    <label
                      htmlFor="observacao_encerramento"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Observação final
                    </label>
                    <textarea
                      id="observacao_encerramento"
                      rows={3}
                      value={closeForm.observacao_encerramento}
                      onChange={(event) =>
                        updateCloseField(
                          'observacao_encerramento',
                          event.target.value
                        )
                      }
                      disabled={isBusy}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    />
                    <FieldError message={closeErrors.observacao_encerramento} />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseSubmit}
                      disabled={isBusy}
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBusy ? 'Encerrando...' : 'Confirmar encerramento'}
                    </button>
                  </div>
                </div>
              )}
            </section>
            )}
            
            {showHistorySection && item && (
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                      Histórico do item
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Linha do tempo para rastreabilidade e leitura gerencial.
                    </p>
                  </div>
                </div>

                <RiskProblemHistoryTimeline
                  history={history}
                  loading={historyLoading}
                  error={historyError}
                  onRetry={
                    onLoadHistory
                      ? () => onLoadHistory(item.id, { force: true })
                      : undefined
                  }
                />
              </section>
            )}

          <section className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Classificação
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="tipo_inicial"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Tipo inicial
                </label>
                <select
                  id="tipo_inicial"
                  value={formData.tipo_inicial}
                  onChange={(event) =>
                    handleTipoInicialChange(
                      event.target.value as TipoInicialEnum
                    )
                  }
                  disabled={isEditing || isBusy}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100"
                >
                  {Object.values(TipoInicialEnum).map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {formatEnumLabel(tipo)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="natureza_atual"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Natureza atual
                </label>
                <input
                  id="natureza_atual"
                  type="text"
                  value={formatEnumLabel(formData.natureza_atual)}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="status_operacional"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Status operacional
                </label>
                <select
                  id="status_operacional"
                  value={formData.status_operacional}
                  onChange={(event) =>
                    updateField(
                      'status_operacional',
                      event.target.value as RiskProblemFormData['status_operacional']
                    )
                  }
                  disabled={isBusy || isClosed}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatEnumLabel(status)}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.status_operacional} />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Informações principais
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="descricao"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(event) =>
                    updateField('descricao', event.target.value)
                  }
                  disabled={isBusy}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />
                <FieldError message={errors.descricao} />
              </div>

              <div>
                <label
                  htmlFor="causa_raiz"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Causa raiz
                </label>
                <textarea
                  id="causa_raiz"
                  value={formData.causa_raiz}
                  onChange={(event) =>
                    updateField('causa_raiz', event.target.value)
                  }
                  disabled={isBusy}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />
                <FieldError message={errors.causa_raiz} />
              </div>

              <div>
                <label
                  htmlFor="descricao_impacto"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Descrição do impacto
                </label>
                <textarea
                  id="descricao_impacto"
                  value={formData.descricao_impacto}
                  onChange={(event) =>
                    updateField('descricao_impacto', event.target.value)
                  }
                  disabled={isBusy}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />
                <FieldError message={errors.descricao_impacto} />
              </div>

              <div>
                <label
                  htmlFor="acao_corretiva_controle"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Ação corretiva / controle
                </label>
                <textarea
                  id="acao_corretiva_controle"
                  value={formData.acao_corretiva_controle}
                  onChange={(event) =>
                    updateField('acao_corretiva_controle', event.target.value)
                  }
                  disabled={isBusy}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />
                <FieldError message={errors.acao_corretiva_controle} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="agente_solucao"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Agente de solução
                  </label>
                  <input
                    id="agente_solucao"
                    type="text"
                    value={formData.agente_solucao ?? ''}
                    onChange={(event) =>
                      updateField('agente_solucao', event.target.value || null)
                    }
                    disabled={isBusy}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  <FieldError message={errors.agente_solucao} />
                </div>

                <div>
                  <label
                    htmlFor="coordenador_agente"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Coordenador do agente
                  </label>
                  <input
                    id="coordenador_agente"
                    type="text"
                    value={formData.coordenador_agente ?? ''}
                    onChange={(event) =>
                      updateField(
                        'coordenador_agente',
                        event.target.value || null
                      )
                    }
                    disabled={isBusy}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  <FieldError message={errors.coordenador_agente} />
                </div>
              </div>

              <div>
                <label
                  htmlFor="data_alvo_solucao"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Data alvo da solução
                </label>
                <input
                  id="data_alvo_solucao"
                  type="date"
                  value={formData.data_alvo_solucao ?? ''}
                  onChange={(event) =>
                    updateField(
                      'data_alvo_solucao',
                      event.target.value || null
                    )
                  }
                  disabled={isBusy}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 md:w-64"
                />
                <FieldError message={errors.data_alvo_solucao} />
              </div>
            </div>
          </section>

          {visibility.showRiscoFields && (
            <section className="rounded-lg border border-gray-200 p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Avaliação de risco
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Escala controlada de {SCORE_MIN} a {SCORE_MAX}.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="probabilidade_inerente"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Probabilidade inerente
                  </label>
                  <input
                    id="probabilidade_inerente"
                    type="number"
                    min={SCORE_MIN}
                    max={SCORE_MAX}
                    step={SCORE_STEP}
                    inputMode="numeric"
                    value={formData.probabilidade_inerente ?? ''}
                    onChange={(event) =>
                      updateField(
                        'probabilidade_inerente',
                        toNullableScore(event.target.value)
                      )
                    }
                    disabled={isBusy}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  {!probabilidadeInerenteSemantic.isEmpty && (<p className={`mt-1 text-xs font-medium ${getSemanticToneTextClass(probabilidadeInerenteSemantic.tone)}`}>Leitura operacional: {probabilidadeInerenteSemantic.label}</p>)}
                  <FieldError message={errors.probabilidade_inerente} />
                </div>

                <div>
                  <label
                    htmlFor="impacto_inerente"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Impacto inerente
                  </label>
                  <input
                    id="impacto_inerente"
                    type="number"
                    min={SCORE_MIN}
                    max={SCORE_MAX}
                    step={SCORE_STEP}
                    inputMode="numeric"
                    value={formData.impacto_inerente ?? ''}
                    onChange={(event) =>
                      updateField(
                        'impacto_inerente',
                        toNullableScore(event.target.value)
                      )
                    }
                    disabled={isBusy}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  {!impactoInerenteSemantic.isEmpty && (<p className={`mt-1 text-xs font-medium ${getSemanticToneTextClass(impactoInerenteSemantic.tone)}`}>Leitura operacional: {impactoInerenteSemantic.label}</p>)}
                  <FieldError message={errors.impacto_inerente} />
                </div>

                <div>
                  <label
                    htmlFor="nivel_risco_inerente"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Nível de risco inerente
                  </label>
                  <input
                    id="nivel_risco_inerente"
                    type="text"
                    value={nivel_risco_inerente ?? ''}
                    readOnly
                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                  />
                  {!nivelRiscoInerenteSemantic.isEmpty && (<p className={`mt-1 text-xs font-medium ${getSemanticToneTextClass(nivelRiscoInerenteSemantic.tone)}`}>Leitura operacional: {nivelRiscoInerenteSemantic.label}</p>)}
                </div>

                <div>
                  <label
                    htmlFor="eficacia_controle"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Eficácia do controle
                  </label>
                  <input
                    id="eficacia_controle"
                    type="number"
                    min={SCORE_MIN}
                    max={SCORE_MAX}
                    step={SCORE_STEP}
                    inputMode="numeric"
                    value={formData.eficacia_controle ?? ''}
                    onChange={(event) =>
                      updateField(
                        'eficacia_controle',
                        toNullableScore(event.target.value)
                      )
                    }
                    disabled={isBusy}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  {!eficaciaControleSemantic.isEmpty && (<p className={`mt-1 text-xs font-medium ${getSemanticToneTextClass(eficaciaControleSemantic.tone)}`}>Leitura operacional: {eficaciaControleSemantic.label}</p>)}
                  <FieldError message={errors.eficacia_controle} />
                </div>

                <div>
                  <label
                    htmlFor="probabilidade_residual"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Probabilidade residual
                  </label>
                  <input
                    id="probabilidade_residual"
                    type="number"
                    min={SCORE_MIN}
                    max={SCORE_MAX}
                    step={SCORE_STEP}
                    inputMode="numeric"
                    value={formData.probabilidade_residual ?? ''}
                    onChange={(event) =>
                      updateField(
                        'probabilidade_residual',
                        toNullableScore(event.target.value)
                      )
                    }
                    disabled={isBusy}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  {!probabilidadeResidualSemantic.isEmpty && (<p className={`mt-1 text-xs font-medium ${getSemanticToneTextClass(probabilidadeResidualSemantic.tone)}`}>Leitura operacional: {probabilidadeResidualSemantic.label}</p>)}
                  <FieldError message={errors.probabilidade_residual} />
                </div>

                <div>
                  <label
                    htmlFor="impacto_residual"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Impacto residual
                  </label>
                  <input
                    id="impacto_residual"
                    type="number"
                    min={SCORE_MIN}
                    max={SCORE_MAX}
                    step={SCORE_STEP}
                    inputMode="numeric"
                    value={formData.impacto_residual ?? ''}
                    onChange={(event) =>
                      updateField(
                        'impacto_residual',
                        toNullableScore(event.target.value)
                      )
                    }
                    disabled={isBusy}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  {!impactoResidualSemantic.isEmpty && (<p className={`mt-1 text-xs font-medium ${getSemanticToneTextClass(impactoResidualSemantic.tone)}`}>Leitura operacional: {impactoResidualSemantic.label}</p>)}
                  <FieldError message={errors.impacto_residual} />
                </div>

                <div>
                  <label
                    htmlFor="nivel_risco_residual"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Nível de risco residual
                  </label>
                  <input
                    id="nivel_risco_residual"
                    type="text"
                    value={nivel_risco_residual ?? ''}
                    readOnly
                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                  />
                  {!nivelRiscoResidualSemantic.isEmpty && (<p className={`mt-1 text-xs font-medium ${getSemanticToneTextClass(nivelRiscoResidualSemantic.tone)}`}>Leitura operacional: {nivelRiscoResidualSemantic.label}</p>)}
                </div>
              </div>
            </section>
          )}

          {visibility.showProblemaFields && (
            <section className="rounded-lg border border-gray-200 p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Avaliação de problema
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Escala controlada de {SCORE_MIN} a {SCORE_MAX}.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="impacto_realizado"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Impacto realizado
                  </label>
                  <input
                    id="impacto_realizado"
                    type="number"
                    min={SCORE_MIN}
                    max={SCORE_MAX}
                    step={SCORE_STEP}
                    inputMode="numeric"
                    value={formData.impacto_realizado ?? ''}
                    onChange={(event) =>
                      updateField(
                        'impacto_realizado',
                        toNullableScore(event.target.value)
                      )
                    }
                    disabled={isBusy}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  {!impactoRealizadoSemantic.isEmpty && (<p className={`mt-1 text-xs font-medium ${getSemanticToneTextClass(impactoRealizadoSemantic.tone)}`}>Leitura operacional: {impactoRealizadoSemantic.label}</p>)}
                  <FieldError message={errors.impacto_realizado} />
                </div>

                <div>
                  <label
                    htmlFor="urgencia_solucao"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Urgência da solução
                  </label>
                  <input
                    id="urgencia_solucao"
                    type="number"
                    min={SCORE_MIN}
                    max={SCORE_MAX}
                    step={SCORE_STEP}
                    inputMode="numeric"
                    value={formData.urgencia_solucao ?? ''}
                    onChange={(event) =>
                      updateField(
                        'urgencia_solucao',
                        toNullableScore(event.target.value)
                      )
                    }
                    disabled={isBusy}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  {!urgenciaSolucaoSemantic.isEmpty && (<p className={`mt-1 text-xs font-medium ${getSemanticToneTextClass(urgenciaSolucaoSemantic.tone)}`}>Leitura operacional: {urgenciaSolucaoSemantic.label}</p>)}
                  <FieldError message={errors.urgencia_solucao} />
                </div>

                <div>
                  <label
                    htmlFor="prioridade_problema"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Prioridade do problema
                  </label>
                  <input
                    id="prioridade_problema"
                    type="text"
                    value={prioridade_problema ?? ''}
                    readOnly
                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                  />
                  {!prioridadeProblemaSemantic.isEmpty && (<p className={`mt-1 text-xs font-medium ${getSemanticToneTextClass(prioridadeProblemaSemantic.tone)}`}>Leitura operacional: {prioridadeProblemaSemantic.label}</p>)}
                </div>
              </div>
            </section>
          )}

          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            {!isSpecialMode && (
            <button
              type="submit"
              disabled={isBusy}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? 'Salvando...' : 'Salvar'}
            </button>
            )}
          </div>
        </form>
      </aside>
    </div>
  );
}