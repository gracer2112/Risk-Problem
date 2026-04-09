// src/utils/drawer-validation.ts

import {
  ConvertRiskToProblemFormData,
  NaturezaAtualEnum,
  RiskProblemFormData,
  StatusOperacional,
  SimNaoValue,
} from '@/types/risk-problem';
import {
  getAllowedStatusesByNature,
  isStatusCompatibleWithNature,
} from '@/utils/risk-problem-domain';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

function isBlank(value: unknown): boolean {
  return value == null || String(value).trim() === '';
}

function isInvalidScore(value: number | null | undefined): boolean {
  return value == null || Number.isNaN(value) || value < 0 || value > 100;
}

function isValidSimNao(value: unknown): value is SimNaoValue {
  return value === 'sim' || value === 'nao';
}

/**
 * Validação principal de create/edit do drawer.
 * Trabalha com o shape do formulário, não com a entidade completa.
 */
export function validateRiskProblem(
  data: Partial<RiskProblemFormData>
): ValidationResult {
  const errors: Record<string, string> = {};

  if (isBlank(data.descricao)) {
    errors.descricao = 'A descrição é obrigatória.';
  }

  if (isBlank(data.causa_raiz)) {
    errors.causa_raiz = 'A causa raiz é obrigatória.';
  }

  if (isBlank(data.descricao_impacto)) {
    errors.descricao_impacto = 'A descrição do impacto é obrigatória.';
  }

  if (!data.natureza_atual) {
    errors.natureza_atual = 'A natureza é obrigatória.';
  }

  if (!data.status_operacional) {
    errors.status_operacional = 'O status operacional é obrigatório.';
  }

  if (isBlank(data.acao_corretiva_controle)) {
    errors.acao_corretiva_controle =
      'A ação corretiva/controle é obrigatória.';
  }

  if (
    data.natureza_atual &&
    data.status_operacional &&
    !isStatusCompatibleWithNature(
      data.natureza_atual,
      data.status_operacional as StatusOperacional
    )
  ) {
    errors.status_operacional = `Status incompatível com a natureza selecionada. Opções válidas: ${getAllowedStatusesByNature(
      data.natureza_atual
    ).join(', ')}.`;
  }

  if (data.natureza_atual === NaturezaAtualEnum.RISCO) {
    if (isInvalidScore(data.probabilidade_inerente)) {
      errors.probabilidade_inerente =
        'A probabilidade inerente deve ser um número entre 0 e 100.';
    }

    if (isInvalidScore(data.impacto_inerente)) {
      errors.impacto_inerente =
        'O impacto inerente deve ser um número entre 0 e 100.';
    }
  }

  if (data.natureza_atual === NaturezaAtualEnum.PROBLEMA) {
    if (isInvalidScore(data.impacto_realizado)) {
      errors.impacto_realizado =
        'O impacto realizado deve ser um número entre 0 e 100.';
    }

    if (isInvalidScore(data.urgencia_solucao)) {
      errors.urgencia_solucao =
        'A urgência da solução deve ser um número entre 0 e 100.';
    }
  }

  if (data.data_alvo_solucao) {
    const prazoDate = new Date(data.data_alvo_solucao);

    if (Number.isNaN(prazoDate.getTime())) {
      errors.data_alvo_solucao = 'Data alvo inválida.';
    } else if (prazoDate.getTime() < Date.now()) {
      errors.data_alvo_solucao = 'A data alvo deve ser futura.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Alias transitório para evitar quebra em imports antigos.
 */
export const validateRiskProblemForm = validateRiskProblem;

/**
 * Validação específica da conversão risco -> problema.
 */
export function validateConvertToProblemForm(
  data: Partial<ConvertRiskToProblemFormData>
): ValidationResult {
  const errors: Record<string, string> = {};

  if (isBlank(data.transitionedAt)) {
    errors.transitionedAt = 'A data da transição é obrigatória.';
  } else {
    const transitionDate = new Date(String(data.transitionedAt));
    if (Number.isNaN(transitionDate.getTime())) {
      errors.transitionedAt = 'A data da transição é inválida.';
    }
  }

  if (isBlank(data.transitionReason)) {
    errors.transitionReason = 'O motivo da transição é obrigatório.';
  }

  if (!isValidSimNao(data.controlApplied)) {
    errors.controlApplied = 'Informe se havia controle aplicado.';
  }

  if (!isValidSimNao(data.controlEffective)) {
    errors.controlEffective = 'Informe se o controle era efetivo.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function getVisibilityRules(
  natureza: NaturezaAtualEnum | null | undefined
): {
  showRiscoFields: boolean;
  showProblemaFields: boolean;
} {
  const showRiscoFields = natureza === NaturezaAtualEnum.RISCO;
  const showProblemaFields = natureza === NaturezaAtualEnum.PROBLEMA;

  return { showRiscoFields, showProblemaFields };
}

/**
 * Mantido por compatibilidade com usos existentes no front.
 * Se depois quisermos, podemos separar em:
 * - calculateRiskScore
 * - calculateProblemPriority
 */
export function calculatePriority(
  probabilidade: number = 0,
  impacto: number = 0,
  urgencia: number = 0
): number {
  const p = Math.max(0, Math.min(100, probabilidade));
  const i = Math.max(0, Math.min(100, impacto));
  const u = Math.max(0, Math.min(100, urgencia));

  const priority = (p * i + u) / 3;
  return Math.round(priority);
}