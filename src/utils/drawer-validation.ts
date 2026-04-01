// src/utils/drawer-validation.ts

import { RiskProblemItem, NaturezaEnum } from "@/types/risk-problem";

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateRiskProblem(
  data: Partial<RiskProblemItem>
): ValidationResult {
  const errors: Record<string, string> = {};

  // Validação: Título obrigatório
  if (!data.titulo || data.titulo.trim() === "") {
    errors.titulo = "O título é obrigatório.";
  }

  // Validação: Descrição obrigatória
  if (!data.descricao || data.descricao.trim() === "") {
    errors.descricao = "A descrição é obrigatória.";
  }

  // Validação: Natureza obrigatória
  if (!data.natureza_atual) {
    errors.natureza_atual = "A natureza é obrigatória.";
  }

  // Validação: Status operacional obrigatório
  if (!data.status_operacional || data.status_operacional.trim() === "") {
    errors.status_operacional = "O status operacional é obrigatório.";
  }

  // Validação: Severidade obrigatória
  if (!data.severidade) {
    errors.severidade = "A severidade é obrigatória.";
  }

  // Validações condicionais para RISCO
  if (data.natureza_atual === NaturezaEnum.RISCO) {
    if (
      data.probabilidade === undefined ||
      data.probabilidade < 0 ||
      data.probabilidade > 100
    ) {
      errors.probabilidade =
        "A probabilidade deve ser um número entre 0 e 100.";
    }

    if (
      data.impacto === undefined ||
      data.impacto < 0 ||
      data.impacto > 100
    ) {
      errors.impacto = "O impacto deve ser um número entre 0 e 100.";
    }
  }

  // Validações condicionais para PROBLEMA
  if (data.natureza_atual === NaturezaEnum.PROBLEMA) {
    if (
      data.urgencia === undefined ||
      data.urgencia < 0 ||
      data.urgencia > 100
    ) {
      errors.urgencia = "A urgência deve ser um número entre 0 e 100.";
    }
  }

  // Validação: Data de prazo (se preenchida, deve ser futura)
  if (data.data_alvo_solucao) {
    const prazoDate = new Date(data.data_alvo_solucao);
    if (isNaN(prazoDate.getTime())) {
      errors.data_prazo = "Data de prazo inválida.";
    } else if (prazoDate.getTime() < Date.now()) {
      errors.data_prazo = "A data de prazo deve ser no futuro.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function getVisibilityRules(natureza: string): {
  showRiscoFields: boolean;
  showProblemaFields: boolean;
} {
  const showRiscoFields = natureza === NaturezaEnum.RISCO;
  const showProblemaFields = natureza === NaturezaEnum.PROBLEMA;

  return { showRiscoFields, showProblemaFields };
}

export function calculatePriority(
  probabilidade: number = 0,
  impacto: number = 0,
  urgencia: number = 0
): number {
  // Garante que os valores estejam dentro do range esperado
  const p = Math.max(0, Math.min(100, probabilidade));
  const i = Math.max(0, Math.min(100, impacto));
  const u = Math.max(0, Math.min(100, urgencia));

  // Fórmula de prioridade: média ponderada
  const priority = (p * i + u) / 3;
  return Math.round(priority);
}