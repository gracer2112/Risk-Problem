// src/utils/risk-problem-semantics.ts

export type SemanticTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface SemanticInfo {
  rawValue: number | string | null | undefined;
  normalizedValue: number | null;
  label: string;
  shortLabel: string;
  tone: SemanticTone;
  rank: number | null;
  isEmpty: boolean;
}

export interface DeadlineSemanticInfo {
  targetDate: string | null | undefined;
  label: string;
  shortLabel: string;
  tone: SemanticTone;
  isLate: boolean;
  isEmpty: boolean;
}

function normalizeToNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function createEmptySemantic(rawValue: number | string | null | undefined): SemanticInfo {
  return {
    rawValue,
    normalizedValue: null,
    label: "Não informado",
    shortLabel: "N/I",
    tone: "neutral",
    rank: null,
    isEmpty: true,
  };
}

function createScaleSemantic(
  rawValue: number | string | null | undefined,
  normalizedValue: number,
  label: string,
  shortLabel: string,
  tone: SemanticTone,
  rank: number,
): SemanticInfo {
  return {
    rawValue,
    normalizedValue,
    label,
    shortLabel,
    tone,
    rank,
    isEmpty: false,
  };
}

/**
 * Escala ordinal genérica 1–5
 * Usar para: probabilidade, impacto, urgência
 */
export function getFivePointScaleSemantic(
  value: number | string | null | undefined,
): SemanticInfo {
  const normalizedValue = normalizeToNumber(value);

  if (normalizedValue === null || normalizedValue < 1 || normalizedValue > 5) {
    return createEmptySemantic(value);
  }

  switch (normalizedValue) {
    case 1:
      return createScaleSemantic(value, normalizedValue, "Muito baixo", "M. baixo", "neutral", 1);
    case 2:
      return createScaleSemantic(value, normalizedValue, "Baixo", "Baixo", "info", 2);
    case 3:
      return createScaleSemantic(value, normalizedValue, "Médio", "Médio", "warning", 3);
    case 4:
      return createScaleSemantic(value, normalizedValue, "Alto", "Alto", "warning", 4);
    case 5:
      return createScaleSemantic(value, normalizedValue, "Muito alto", "M. alto", "danger", 5);
    default:
      return createEmptySemantic(value);
  }
}

/**
 * Escala específica para efetividade do controle
 * Aqui a polaridade é diferente: efetividade alta é algo positivo
 */
export function getControlEffectivenessSemantic(
  value: number | string | null | undefined,
): SemanticInfo {
  const normalizedValue = normalizeToNumber(value);

  if (normalizedValue === null || normalizedValue < 1 || normalizedValue > 5) {
    return createEmptySemantic(value);
  }

  switch (normalizedValue) {
    case 1:
      return createScaleSemantic(
        value,
        normalizedValue,
        "Muito baixa efetividade",
        "M. baixa",
        "danger",
        1,
      );
    case 2:
      return createScaleSemantic(
        value,
        normalizedValue,
        "Baixa efetividade",
        "Baixa",
        "warning",
        2,
      );
    case 3:
      return createScaleSemantic(
        value,
        normalizedValue,
        "Efetividade moderada",
        "Moderada",
        "info",
        3,
      );
    case 4:
      return createScaleSemantic(
        value,
        normalizedValue,
        "Alta efetividade",
        "Alta",
        "success",
        4,
      );
    case 5:
      return createScaleSemantic(
        value,
        normalizedValue,
        "Muito alta efetividade",
        "M. alta",
        "success",
        5,
      );
    default:
      return createEmptySemantic(value);
  }
}

/**
 * Score composto conservador da Sprint 6
 * Manter aderência à lógica já consolidada na tela:
 * &lt; 30 = Baixa
 * 30–59 = Média
 * >= 60 = Crítica
 */
export function getCompositeScoreSemantic(
  value: number | string | null | undefined,
): SemanticInfo {
  const normalizedValue = normalizeToNumber(value);

  if (normalizedValue === null || normalizedValue < 0) {
    return createEmptySemantic(value);
  }

  if (normalizedValue >= 60) {
    return createScaleSemantic(value, normalizedValue, "Crítica", "Crítica", "danger", 3);
  }

  if (normalizedValue >= 30) {
    return createScaleSemantic(value, normalizedValue, "Média", "Média", "warning", 2);
  }

  return createScaleSemantic(value, normalizedValue, "Baixa", "Baixa", "neutral", 1);
}

/**
 * Prazo para leitura operacional
 * - Sem prazo definido
 * - No prazo
 * - Atrasado
 * Item encerrado não deve destacar atraso
 */
export function getDeadlineSemantic(
  targetDate: string | null | undefined,
  isClosed: boolean,
): DeadlineSemanticInfo {
  if (!targetDate) {
    return {
      targetDate,
      label: "Sem prazo definido",
      shortLabel: "Sem prazo",
      tone: "neutral",
      isLate: false,
      isEmpty: true,
    };
  }

  if (isClosed) {
    return {
      targetDate,
      label: "Sem atraso relevante",
      shortLabel: "Encerrado",
      tone: "neutral",
      isLate: false,
      isEmpty: false,
    };
  }

  const parsedDate = new Date(targetDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      targetDate,
      label: "Prazo inválido",
      shortLabel: "Inválido",
      tone: "neutral",
      isLate: false,
      isEmpty: true,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  if (parsedDate < today) {
    return {
      targetDate,
      label: "Atrasado",
      shortLabel: "Atrasado",
      tone: "danger",
      isLate: true,
      isEmpty: false,
    };
  }

  return {
    targetDate,
    label: "No prazo",
    shortLabel: "No prazo",
    tone: "success",
    isLate: false,
    isEmpty: false,
  };
}