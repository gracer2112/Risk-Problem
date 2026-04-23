// src/services/api.gmud.ts

import {
  GMUDResponseDTO as GMUDEntity,
  GMUDListItemResponseDTO as GMUDItemListagem,
  CriarGMUDRequestDTO as PayloadCriarGMUD,
  AtualizarGMUDRequestDTO as PayloadAtualizarGMUD,
  GMUDKPIs,
  FiltrosGMUD,
  PayloadTransicaoStatusGMUD,
  PayloadRegistrarRollbackGMUD,
  StatusGMUD
} from '@/types/gmud';
import type { GMUDListResponse, GMUDHistoryResponse } from '@/services/gmud.mapper';
import { mapApiGMUDToEntity, mapApiGMUDListResponse, mapApiGMUDKPIs, mapPayloadCriarGMUDToApi, mapPayloadAtualizarGMUDToApi, mapPayloadTransicaoStatusGMUDToApi, mapPayloadRegistrarRollbackGMUDToApi } from '@/services/gmud.mapper';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').trim();

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
    ? `/api/projects/${normalizedProjectId}/gmud/${normalizedSuffix}`
    : `/api/projects/${normalizedProjectId}/gmud`;

  if (!normalizedBase) {
    return path;
  }

  return `${normalizedBase}${path}`;
}

async function parseJsonSafely(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson<T>(
  url: string,
  options?: RequestInit,
  fallbackMessage = 'Não foi possível concluir a operação de GMUD.',
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const data = await parseJsonSafely(response);
    let message = fallbackMessage;

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

  const data = await parseJsonSafely(response);

  if (data === null) {
    throw new Error(fallbackMessage);
  }

  return data as T;
}

export const gmudService = {
  async list(projectId: string, filters?: GMUDListFilters): Promise<GMUDListResult> {
    const url = `${buildUrl(projectId)}${buildQueryString(filters)}`;
    const response = await requestJson<GMUDListResponse>(
      url,
      undefined,
      'Não foi possível carregar a lista de GMUD.',
    );

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
};