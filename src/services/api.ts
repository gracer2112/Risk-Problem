// src/services/api.ts

import type {
  CloseRiskProblemFormData,
  CloseRiskProblemResponse,
  ConvertRiskToProblemRequest,
  ConvertRiskToProblemResponse,
  LegacyRiskProblemApiShape,
  RiskProblemEntity,
  RiskProblemFormData,
  RiskProblemListResponse,
  LegacyRiskProblemHistoryResponseShape,
  RiskProblemHistoryResponse,
} from '@/types/risk-problem';

import {
  mapCloseFormToRequest,
  mapApiListToListItems,
  mapFormToCreateRequest,
  mapFormToUpdateRequest,
  mapLegacyApiToEntity,
  mapApiHistoryToHistoryResponse,
} from '@/services/risk-problem.mapper';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getAuthHeaders(extraHeaders?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isBrowser()) {
    const token = window.localStorage.getItem('token');

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  if (extraHeaders instanceof Headers) {
    extraHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(extraHeaders)) {
    for (const [key, value] of extraHeaders) {
      headers[key] = value;
    }
  } else if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }

  return headers;
}

export function normalizeRequestError(error: unknown): Error {
  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return new Error('Operação cancelada ou expirou o tempo limite');
    }
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new Error('Falha na conexão com o servidor');
    }
  }
  return new Error('Erro inesperado na requisição');
}

export async function performRequest(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, buildRequestInit(init));
  } catch (error) {
    throw normalizeRequestError(error);
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  const fallback =
    response.statusText || `Falha na requisição (${response.status}).`;

  try {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const payload = await response.json();

      const message =
        payload?.message ||
        payload?.error ||
        payload?.detail ||
        payload?.errors?.message;

      if (typeof message === 'string' && message.trim()) {
        return message;
      }

      return fallback;
    }

    const text = await response.text();

    if (text.trim()) {
      return text;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export async function handleJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(`Erro na API de riscos e problemas: ${message}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text.trim()) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Erro na API de riscos e problemas: resposta JSON inválida.');
  }
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');

    if (!normalized) {
      return undefined;
    }

    const parsed = Number(normalized);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function buildRequestInit(init?: RequestInit): RequestInit {
  return {
    ...init,
    headers: getAuthHeaders(init?.headers),
    cache: init?.cache ?? 'no-store',
  };
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await performRequest(url, init);
  return handleJsonResponse<T>(response);
}

export async function requestVoid(url: string, init?: RequestInit): Promise<void> {
  const response = await performRequest(url, init);
  if (!response.ok) {
    await handleJsonResponse<void>(response);
  }
}

type ListFilters = {
  natureza?: string;
  status?: string;
};

type RawListResponse =
  | unknown[]
  | {
      items?: unknown[];
      data?: unknown[];
      total?: unknown;
      page?: unknown;
      pageSize?: unknown;
    };

function buildListUrl(projectId: string, filters?: ListFilters): string {
  const url = new URL(`${API_BASE_URL}/projects/${projectId}/risks-problems`);

  if (filters?.natureza) {
    url.searchParams.set('natureza', filters.natureza);
  }

  if (filters?.status) {
    url.searchParams.set('status', filters.status);
  }

  return url.toString();
}

function buildItemUrl(projectId: string, itemId: string): string {
  return `${API_BASE_URL}/projects/${projectId}/risks-problems/${itemId}`;
}

function buildHistoryUrl(projectId: string, itemId: string): string {
  return `${API_BASE_URL}/projects/${projectId}/risks-problems/${itemId}/history`;
}

function buildConvertToProblemUrl(
  projectId: string,
  itemId: string
): string {
  return `${API_BASE_URL}/projects/${projectId}/risks-problems/${itemId}/convert-to-problem`;
}

function buildCloseItemUrl(projectId: string, itemId: string): string {
  return `${API_BASE_URL}/projects/${projectId}/risks-problems/${itemId}/close`;
}

export const riskProblemService = {
  async list(projectId: string, filters?: ListFilters): Promise<RiskProblemListResponse> {
    const payload = await requestJson<RawListResponse>(buildListUrl(projectId, filters), { method: 'GET' });

    if (Array.isArray(payload)) {
      const items = mapApiListToListItems(payload);
      return {
        items,
        total: items.length,
        page: 1,
        pageSize: items.length,
      };
    }

    const rawItems = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload?.data) ? payload.data : [];
    const items = mapApiListToListItems(rawItems);

    return {
      items,
      total: toOptionalNumber(payload.total) ?? items.length,
      page: toOptionalNumber(payload.page) ?? 1,
      pageSize: toOptionalNumber(payload.pageSize) ?? items.length,
    };
  },

  async getById(
    projectId: string,
    itemId: string
  ): Promise<RiskProblemEntity> {
    const payload = await requestJson<LegacyRiskProblemApiShape>(buildItemUrl(projectId, itemId), { method: 'GET' });
    return mapLegacyApiToEntity(payload);
  },

  async getHistory(
    projectId: string,
    itemId: string
  ): Promise<RiskProblemHistoryResponse> {
    const payload = await requestJson<LegacyRiskProblemHistoryResponseShape>(buildHistoryUrl(projectId, itemId), { method: 'GET' });
    return mapApiHistoryToHistoryResponse(payload);
  },

  async create(
    projectId: string,
    form: RiskProblemFormData
  ): Promise<RiskProblemEntity> {
    const body = mapFormToCreateRequest(form);
    const payload = await requestJson<LegacyRiskProblemApiShape>(buildListUrl(projectId), { method: 'POST', body: JSON.stringify(body) });
    return mapLegacyApiToEntity(payload);
  },

  async update(
    projectId: string,
    itemId: string,
    form: RiskProblemFormData,
    original?: RiskProblemEntity
  ): Promise<RiskProblemEntity> {
    const body = mapFormToUpdateRequest(form, original);
    const payload = await requestJson<LegacyRiskProblemApiShape>(buildItemUrl(projectId, itemId), { method: 'PUT', body: JSON.stringify(body) });
    return mapLegacyApiToEntity(payload);
  },

  async convertRiskToProblem(
    projectId: string,
    itemId: string,
    payload: ConvertRiskToProblemRequest
  ): Promise<ConvertRiskToProblemResponse> {
    const raw = await requestJson<LegacyRiskProblemApiShape>(buildConvertToProblemUrl(projectId, itemId), { method: 'POST', body: JSON.stringify(payload) });
    return mapLegacyApiToEntity(raw);
  },

  async closeItem(
    projectId: string,
    item: Pick<RiskProblemEntity, 'id' | 'natureza_atual'>,
    form: CloseRiskProblemFormData
  ): Promise<CloseRiskProblemResponse> {
    const body = mapCloseFormToRequest(item, form);
    const raw = await requestJson<LegacyRiskProblemApiShape>(buildCloseItemUrl(projectId, item.id), { method: 'POST', body: JSON.stringify(body) });
    return mapLegacyApiToEntity(raw);
  },

  async delete(projectId: string, itemId: string): Promise<void> {
    await requestVoid(buildItemUrl(projectId, itemId), { method: 'DELETE' });
  },
};