// src/services/api.gmud.ts

import {
  GMUDResponseDTO as GMUDEntity,
  GMUDListItemResponseDTO as GMUDItemListagem,
  CriarGMUDRequestDTO as PayloadCriarGMUD,
  AtualizarGMUDRequestDTO as PayloadAtualizarGMUD,
  GMUDKPIs,
  PayloadTransicaoStatusGMUD,
  PayloadRegistrarRollbackGMUD,
  PayloadChecklistItemGMUD,
} from '@/types/gmud';
import type { GMUDListResponse, GMUDHistoryResponse } from '@/services/gmud.mapper';
import { mapApiGMUDToEntity, mapApiGMUDListResponse, mapApiGMUDKPIs, mapPayloadCriarGMUDToApi, mapPayloadAtualizarGMUDToApi, mapPayloadTransicaoStatusGMUDToApi, mapPayloadRegistrarRollbackGMUDToApi } from '@/services/gmud.mapper';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface GMUDListResult {
  items: GMUDItemListagem[];
  total: number;
}

export interface GMUDHistoryResult {
  items: unknown[];
  total: number;
}

export type GMUDListFilters = {
  status?: string;
  prioridade?: string;
  impacto?: string;
  ambiente?: string;
  busca?: string;
};

function ensureProjectId(projectId: string): string {
  const value = projectId.trim();

  if (!value) {
    throw new Error('ID do projeto é obrigatório.');
  }

  return value;
}

function ensureItemId(itemId: string): string {
  const value = itemId.trim();

  if (!value) {
    throw new Error('ID do item é obrigatório.');
  }

  return value;
}

function buildQueryString(filters?: GMUDListFilters): string {
  if (!filters) {
    return '';
  }

  const params = new URLSearchParams();

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.prioridade) {
    params.set('prioridade', filters.prioridade);
  }

  if (filters.impacto) {
    params.set('impacto', filters.impacto);
  }

  if (filters.ambiente) {
    params.set('ambiente', filters.ambiente);
  }

  if (filters.busca) {
    params.set('busca', filters.busca);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

function buildUrl(projectId: string, suffix?: string): string {
  const normalizedProjectId = ensureProjectId(projectId);
  let normalizedBase = API_BASE_URL;
  let normalizedSuffix = suffix ?? '';

  while (normalizedBase.endsWith('/')) {
    normalizedBase = normalizedBase.slice(0, -1);
  }

  while (normalizedSuffix.startsWith('/')) {
    normalizedSuffix = normalizedSuffix.slice(1);
  }

  const path = normalizedSuffix
    ? `/projects/${normalizedProjectId}/gmud/${normalizedSuffix}`
    : `/projects/${normalizedProjectId}/gmud`;

  if (!normalizedBase) {
    return path;
  }

  return `${normalizedBase}${path}`;
}

type ParseResult<T = unknown> = 
  | { success: true; data: T }
  | { success: false };

async function parseJsonSafely<T = unknown>(response: Response): Promise<ParseResult<T>> {
  try {
    const data = await response.json() as T;
    return { success: true, data };
  } catch {
    return { success: false };
  }
}

async function requestJson<T>(
  url: string,
  options?: RequestInit,
  fallbackMessage = 'Não foi possível concluir a operação de GMUD.',
): Promise<T> {
  const response = await fetch(url, options);

  // ── Caso 1: HTTP erro ──
  if (!response.ok) {
    const result = await parseJsonSafely<Record<string, unknown>>(response);
    let message = fallbackMessage;

    if (result.success) {
      const record = result.data;

      if (typeof record.message === 'string' && record.message.trim()) {
        message = record.message;
      } else if (typeof record.detail === 'string' && record.detail.trim()) {
        message = record.detail;
      } else if (typeof record.error === 'string' && record.error.trim()) {
        message = record.error;
      }
    }

    throw new Error(message);
  }

  // ── Caso 2: HTTP 200 — faz o parse ──
  const result = await parseJsonSafely<T>(response);

  if (!result.success) {
    throw new Error(fallbackMessage);
  }

  return result.data;
}

export const gmudService = {
  async list(projectId: string, filters?: GMUDListFilters): Promise<GMUDListResult> {
    const url = `${buildUrl(projectId)}${buildQueryString(filters)}`;
    const response = await requestJson<GMUDListResponse>(
      url,
      undefined,
      'Não foi possível carregar a lista de GMUD.',
    );

    // 🔍 LOG DIAGNÓSTICO OFICIAL
    console.groupCollapsed(`[GMUD][LIST] Resposta do backend → ${url}`);
    console.log('JSON cru:', response);
    console.log('Tipo:', Array.isArray(response) ? 'ARRAY' : typeof response);
    console.log('Keys de nível 1:', response ? Object.keys(response) : 'N/A');
    console.groupEnd();
    return mapApiGMUDListResponse(response);
  },

  async getById(projectId: string, itemId: string): Promise<GMUDEntity> {
    const normalizedItemId = ensureItemId(itemId);
    const url = buildUrl(projectId, normalizedItemId);
    const response = await requestJson<unknown>(
      url,
      undefined,
      'Não foi possível carregar a GMUD selecionada.',
    );

    return mapApiGMUDToEntity(response as Record<string, unknown>);
  },

  async getKPIs(projectId: string): Promise<GMUDKPIs> {
    const url = buildUrl(projectId, 'kpis');
    const response = await requestJson<unknown>(
      url,
      undefined,
      'Não foi possível carregar os KPIs da GMUD.',
    );

    return mapApiGMUDKPIs(response);
  },

  async getHistory(projectId: string, itemId: string): Promise<GMUDHistoryResult> {
    const normalizedItemId = ensureItemId(itemId);
    const url = buildUrl(projectId, `${normalizedItemId}/history`);
    const response = await requestJson<GMUDHistoryResponse>(
      url,
      undefined,
      'Não foi possível carregar o histórico da GMUD.',
    );

    const items = response.items ?? response.data ?? [];

    return {
      items,
      total: Number(response.total ?? items.length),
    };
  },

  async create(projectId: string, payload: PayloadCriarGMUD): Promise<GMUDEntity> {
    const url = buildUrl(projectId);
    const response = await requestJson<unknown>(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapPayloadCriarGMUDToApi(payload)),
      },
      'Não foi possível criar a GMUD.',
    );

    return mapApiGMUDToEntity(response as Record<string, unknown>);
  },

  async update(projectId: string, itemId: string, payload: PayloadAtualizarGMUD): Promise<GMUDEntity> {
    const normalizedItemId = ensureItemId(itemId);
    const url = buildUrl(projectId, normalizedItemId);
    const response = await requestJson<unknown>(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapPayloadAtualizarGMUDToApi(payload)),
      },
      'Não foi possível atualizar a GMUD.',
    );

    return mapApiGMUDToEntity(response as Record<string, unknown>);
  },

  async transitionStatus(
    projectId: string,
    itemId: string,
    payload: PayloadTransicaoStatusGMUD,
  ): Promise<GMUDEntity> {
    const normalizedItemId = ensureItemId(itemId);
    const url = buildUrl(projectId, `${normalizedItemId}/status`);
    const response = await requestJson<unknown>(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapPayloadTransicaoStatusGMUDToApi(payload)),
      },
      'Não foi possível alterar o status da GMUD.',
    );

    return mapApiGMUDToEntity(response as Record<string, unknown>);
  },

  async registerRollback(
    projectId: string,
    itemId: string,
    payload: PayloadRegistrarRollbackGMUD,
  ): Promise<GMUDEntity> {
    const normalizedItemId = ensureItemId(itemId);
    const url = buildUrl(projectId, `${normalizedItemId}/rollback`);
    const response = await requestJson<unknown>(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapPayloadRegistrarRollbackGMUDToApi(payload)),
      },
      'Não foi possível registrar o rollback da GMUD.',
    );

    return mapApiGMUDToEntity(response as Record<string, unknown>);
  },

  async delete(projectId: string, itemId: string): Promise<void> {
    const normalizedItemId = ensureItemId(itemId);
    const url = buildUrl(projectId, normalizedItemId);
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await parseJsonSafely(response);
      let message = 'Não foi possível excluir a GMUD.';

      if (data && typeof data === 'object') {
        const record = data as Record<string, unknown>;

        if (typeof record.message === 'string' && record.message.trim()) {
          message = record.message;
        } else if (typeof record.detail === 'string' && record.detail.trim()) {
          message = record.detail;
        } else if (typeof record.error === 'string' && record.error.trim()) {
          message = record.error;
        }
      }

      throw new Error(message);
    }
  },

// -------------------------------------------------------------------------------
// Funções do checklist — versão com debug inteligente
// -------------------------------------------------------------------------------
  async addChecklistItem(
    projectId: string,
    gmudId: string,
    payload: PayloadChecklistItemGMUD
  ): Promise<void> {

    const url = buildUrl(projectId, `${ensureItemId(gmudId)}/checklist`);

    // DEBUG de ida
    console.debug("[API][CHECKLIST][ADD][REQUEST]", {
      url,
      method: "POST",
      payload,
      projectId,
      gmudId
    });

    try {
      const result = await requestJson<void>(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        "Não foi possível adicionar o item do checklist."
      );

      // DEBUG de volta
      console.debug("[API][CHECKLIST][ADD][RESPONSE]", result);
    } catch (err) {
      console.error("[API][CHECKLIST][ADD][ERROR]", err);
      throw err;
    }
  },

  async updateChecklistItem(
    projectId: string,
    gmudId: string,
    itemId: string,
    payload: PayloadChecklistItemGMUD
  ): Promise<void> {
    
    const url = buildUrl(
      projectId,
      `${ensureItemId(gmudId)}/checklist/${ensureItemId(itemId)}`
    );

    // DEBUG de ida
    console.debug("[API][CHECKLIST][UPDATE][REQUEST]", {
      url,
      method: "PUT",
      payload,
      projectId,
      gmudId,
      itemId
    });

    try {
      const result = await requestJson<void>(
        url,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        "Não foi possível atualizar o item do checklist."
      );

      // DEBUG de volta
      console.debug("[API][CHECKLIST][UPDATE][RESPONSE]", result);
    } catch (err) {
      console.error("[API][CHECKLIST][UPDATE][ERROR]", err);
      throw err;
    }
  },

  async deleteChecklistItem(
    projectId: string,
    gmudId: string,
    itemId: string
  ): Promise<void> {

    const url = buildUrl(
      projectId,
      `${ensureItemId(gmudId)}/checklist/${ensureItemId(itemId)}`
    );

    // DEBUG de ida
    console.debug("[API][CHECKLIST][DELETE][REQUEST]", {
      url,
      method: "DELETE",
      projectId,
      gmudId,
      itemId
    });

    const response = await fetch(url, { method: "DELETE" });

    if (!response.ok) {

      // DEBUG de volta (erro)
      const raw = await response.text().catch(() => "");
      console.error("[API][CHECKLIST][DELETE][ERROR_RAW]", raw);

      let message = "Não foi possível excluir o item do checklist.";
      try {
        const data = JSON.parse(raw);
        message =
          data?.message || data?.detail || data?.error || message;
      } catch {
        // mantém a mensagem padrão
      }

      throw new Error(message);
    }

    // DEBUG de volta (sucesso)
    console.debug("[API][CHECKLIST][DELETE][RESPONSE]", {
      status: response.status,
    });
  },
};
