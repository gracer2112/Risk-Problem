// src/services/project-catalog.mapper.ts

import type {
  ProjectCatalogItem,
  ProjectCatalogListResponse,
} from '@/types/project-catalog';

// Mapper do catálogo de projetos da Sprint 8.
export type ProjectCatalogApiShape = {
  id?: unknown;
  external_id?: unknown;
  externalId?: unknown;
  name?: unknown;
  nome?: unknown;
  slug?: unknown;
  identificador?: unknown;
  openproject_project_id?: unknown;
  openprojectProjectId?: unknown;
};

export type RawProjectCatalogResponse =
  | ProjectCatalogApiShape[]
  | {
      items?: ProjectCatalogApiShape[];
      data?: ProjectCatalogApiShape[];
    };

export function toOptionalCatalogString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized ? normalized : undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

export function mapProjectCatalogItem(
  raw: ProjectCatalogApiShape
): ProjectCatalogItem | null {
  const id =
    toOptionalCatalogString(raw.id) ??
    toOptionalCatalogString(raw.external_id) ??
    toOptionalCatalogString(raw.externalId);

  const name =
    toOptionalCatalogString(raw.name) ??
    toOptionalCatalogString(raw.nome);

  const openprojectProjectId =
    toOptionalCatalogString(raw.openproject_project_id) ??
    toOptionalCatalogString(raw.openprojectProjectId) ??
    id ??
    null;

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    openproject_project_id: openprojectProjectId,
  };
}

export function extractProjectCatalogItems(
  payload: RawProjectCatalogResponse
): ProjectCatalogApiShape[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

export function mapProjectCatalogResponse(
  payload: RawProjectCatalogResponse
): ProjectCatalogListResponse {
  return extractProjectCatalogItems(payload)
    .map(mapProjectCatalogItem)
    .filter((item): item is ProjectCatalogItem => item !== null);
}
