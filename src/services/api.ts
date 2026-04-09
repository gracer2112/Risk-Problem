// src/services/api.ts

import type {
  ConvertRiskToProblemRequest,
  ConvertRiskToProblemResponse,
  LegacyRiskProblemApiShape,
  RiskProblemEntity,
  RiskProblemFormData,
  RiskProblemListResponse,
} from '@/types/risk-problem';

import {
  mapApiListToListItems,
  mapFormToCreateRequest,
  mapFormToUpdateRequest,
  mapLegacyApiToEntity,
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

  return JSON.parse(text) as T;
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
      total?: number;
      page?: number;
      pageSize?: number;
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

function buildConvertToProblemUrl(
  projectId: string,
  itemId: string
): string {
  return `${API_BASE_URL}/projects/${projectId}/risks-problems/${itemId}/convert-to-problem`;
}

export const riskProblemService = {
  async list(
    projectId: string,
    filters?: ListFilters
  ): Promise<RiskProblemListResponse> {
    const response = await fetch(buildListUrl(projectId, filters), {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    const payload = await handleJsonResponse<RawListResponse>(response);

    if (Array.isArray(payload)) {
      const items = mapApiListToListItems(payload);

      return {
        items,
        total: items.length,
        page: 1,
        pageSize: items.length,
      };
    }

    const rawItems = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    const items = mapApiListToListItems(rawItems);

    return {
      items,
      total:
        typeof payload?.total === 'number' ? payload.total : items.length,
      page: typeof payload?.page === 'number' ? payload.page : 1,
      pageSize:
        typeof payload?.pageSize === 'number'
          ? payload.pageSize
          : items.length,
    };
  },

  async getById(
    projectId: string,
    itemId: string
  ): Promise<RiskProblemEntity> {
    const response = await fetch(buildItemUrl(projectId, itemId), {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    const payload =
      await handleJsonResponse<LegacyRiskProblemApiShape>(response);

    return mapLegacyApiToEntity(payload);
  },

  async create(
    projectId: string,
    form: RiskProblemFormData
  ): Promise<RiskProblemEntity> {
    const body = mapFormToCreateRequest(form);

    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/risks-problems`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );

    const payload =
      await handleJsonResponse<LegacyRiskProblemApiShape>(response);

    return mapLegacyApiToEntity(payload);
  },

  async update(
    projectId: string,
    itemId: string,
    form: RiskProblemFormData,
    original?: RiskProblemEntity
  ): Promise<RiskProblemEntity> {
    const body = mapFormToUpdateRequest(form, original);

    const response = await fetch(buildItemUrl(projectId, itemId), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const payload =
      await handleJsonResponse<LegacyRiskProblemApiShape>(response);

    return mapLegacyApiToEntity(payload);
  },

  async convertRiskToProblem(
    projectId: string,
    itemId: string,
    payload: ConvertRiskToProblemRequest
  ): Promise<ConvertRiskToProblemResponse> {
    const response = await fetch(buildConvertToProblemUrl(projectId, itemId), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const raw =
      await handleJsonResponse<LegacyRiskProblemApiShape>(response);

    return mapLegacyApiToEntity(raw);
  },

  async delete(projectId: string, itemId: string): Promise<void> {
    const response = await fetch(buildItemUrl(projectId, itemId), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if ([200, 202, 204].includes(response.status)) {
      return;
    }

    await handleJsonResponse<void>(response);
  },
};