// src/utils/risk-problem-validation.ts

import {
  NaturezaAtualEnum,
  StatusOperacional,
  StatusProblemaEnum,
  StatusRiscoEnum,
  RiskProblemFormData,
} from '@/types/risk-problem';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

const RISK_STATUS_VALUES: StatusRiscoEnum[] = [
  StatusRiscoEnum.IDENTIFICADO,
  StatusRiscoEnum.EM_ANALISE,
  StatusRiscoEnum.PLANO_ACAO_DEFINIDO,
  StatusRiscoEnum.EM_MONITORAMENTO,
  StatusRiscoEnum.MITIGADO,
  StatusRiscoEnum.ENCERRADO,
];

const PROBLEM_STATUS_VALUES: StatusProblemaEnum[] = [
  StatusProblemaEnum.ABERTO,
  StatusProblemaEnum.EM_TRATAMENTO,
  StatusProblemaEnum.AGUARDANDO_TERCEIRO,
  StatusProblemaEnum.AGUARDANDO_VALIDACAO,
  StatusProblemaEnum.RESOLVIDO,
  StatusProblemaEnum.ENCERRADO,
];

// Escala controlada para avaliação.
// Se o handoff final trouxer outra faixa oficial, ajuste apenas estas constantes.
const SCORE_MIN = 1;
const SCORE_MAX = 10;

function hasText(value?: string | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasNumber(value?: number | null): boolean {
  return value !== null && value !== undefined && !Number.isNaN(value);
}

function isValidDateString(value: string): boolean {
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

function isWithinScoreRange(value?: number | null): boolean {
  return (
    hasNumber(value) &&
    Number(value) >= SCORE_MIN &&
    Number(value) <= SCORE_MAX
  );
}

function validateScoreField(
  errors: Record<string, string>,
  field: string,
  value: number | null | undefined,
  label: string
): void {
  if (!hasNumber(value)) {
    errors[field] = `Informe ${label.toLowerCase()}.`;
    return;
  }

  if (!isWithinScoreRange(value)) {
    errors[field] = `${label} deve estar entre ${SCORE_MIN} e ${SCORE_MAX}.`;
  }
}

export function getVisibilityRules(
  natureza_atual: NaturezaAtualEnum
): { showRiscoFields: boolean; showProblemaFields: boolean } {
  return {
    showRiscoFields: natureza_atual === NaturezaAtualEnum.RISCO,
    showProblemaFields: natureza_atual === NaturezaAtualEnum.PROBLEMA,
  };
}

export function validateStatusByNatureza(
  natureza_atual: NaturezaAtualEnum,
  status_operacional: StatusOperacional
): boolean {
  if (natureza_atual === NaturezaAtualEnum.RISCO) {
    return RISK_STATUS_VALUES.includes(status_operacional as StatusRiscoEnum);
  }

  if (natureza_atual === NaturezaAtualEnum.PROBLEMA) {
    return PROBLEM_STATUS_VALUES.includes(
      status_operacional as StatusProblemaEnum
    );
  }

  return false;
}

export function validateRiskProblem(
  data: RiskProblemFormData
): ValidationResult {
  const errors: Record<string, string> = {};
  const { showRiscoFields, showProblemaFields } = getVisibilityRules(
    data.natureza_atual
  );

  // Campos obrigatórios sempre
  if (!hasText(data.descricao)) {
    errors.descricao = 'Informe a descrição.';
  }

  if (!hasText(data.causa_raiz)) {
    errors.causa_raiz = 'Informe a causa raiz.';
  }

  if (!hasText(data.descricao_impacto)) {
    errors.descricao_impacto = 'Informe a descrição do impacto.';
  }

  if (!hasText(data.acao_corretiva_controle)) {
    errors.acao_corretiva_controle = 'Informe a ação corretiva/controle.';
  }

  // Regras por natureza
  if (showRiscoFields) {
    validateScoreField(
      errors,
      'probabilidade_inerente',
      data.probabilidade_inerente,
      'A probabilidade inerente'
    );

    validateScoreField(
      errors,
      'impacto_inerente',
      data.impacto_inerente,
      'O impacto inerente'
    );

    validateScoreField(
      errors,
      'eficacia_controle',
      data.eficacia_controle,
      'A eficácia do controle'
    );

    validateScoreField(
      errors,
      'probabilidade_residual',
      data.probabilidade_residual,
      'A probabilidade residual'
    );

    validateScoreField(
      errors,
      'impacto_residual',
      data.impacto_residual,
      'O impacto residual'
    );
  }

  if (showProblemaFields) {
    validateScoreField(
      errors,
      'impacto_realizado',
      data.impacto_realizado,
      'O impacto realizado'
    );

    validateScoreField(
      errors,
      'urgencia_solucao',
      data.urgencia_solucao,
      'A urgência da solução'
    );
  }

  // Data opcional, mas válida se preenchida
  if (
    hasText(data.data_alvo_solucao) &&
    !isValidDateString(data.data_alvo_solucao!)
  ) {
    errors.data_alvo_solucao = 'Informe uma data alvo válida.';
  }

  // Status compatível com a natureza
  if (
    !validateStatusByNatureza(
      data.natureza_atual,
      data.status_operacional
    )
  ) {
    errors.status_operacional = 'Status incompatível com a natureza atual.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}