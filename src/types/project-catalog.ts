// src/types/project-catalog.ts

// Este arquivo pertence ao catálogo de projetos da Sprint 8 e deve permanecer separado do domínio de risco/problema.

export type ProjectCatalogId = string;

export type OpenProjectProjectId = string;

export interface ProjectCatalogItem {
  id: ProjectCatalogId;
  name: string;
  openproject_project_id: OpenProjectProjectId | null;
}

export interface ProjectSelectionContext {
  project_id: ProjectCatalogId;
  openproject_project_id: OpenProjectProjectId | null;
}

export type ProjectCatalogListResponse = ProjectCatalogItem[];

export function isValidProjectCatalogItem(value: unknown): value is ProjectCatalogItem {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' && obj.id.trim() !== '' &&
    typeof obj.name === 'string' && obj.name.trim() !== '' &&
    (obj.openproject_project_id === null || typeof obj.openproject_project_id === 'string')
  );
}

export function buildProjectSelectionContext(project: ProjectCatalogItem): ProjectSelectionContext {
  return {
    project_id: project.id,
    openproject_project_id: project.openproject_project_id
  };
}