// src/components/gmud/GMUDHeader.tsx
'use client';

import React from 'react';

type GMUDHeaderProps = {
  title: string;
  description: string;
  projectName?: string;
  openProjectProjectId?: string;
  hasSelectedProject: boolean;
  loading: boolean;
  createButtonLabel: string;
  onCreate: () => void;
};

const GMUDHeader = ({
  title,
  description,
  projectName,
  openProjectProjectId,
  hasSelectedProject,
  loading,
  createButtonLabel,
  onCreate,
}: GMUDHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            {description}
          </p>


          {hasSelectedProject && projectName && (
            <section className="flex items-center gap-3 pt-1">
              <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                {projectName}
              </span>

              {openProjectProjectId && (
                <a
                  href={`/projects/${openProjectProjectId}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Abrir projeto
                </a>
              )}
            </section>
          )}
        </div>

        <button
          type="button"
          onClick={onCreate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg shadow-sm flex items-center gap-2 whitespace-nowrap transition-colors min-w-[140px] justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Criando...
            </>
          ) : (
            createButtonLabel
          )}
        </button>
      </div>
    </header>
  );
};

export default GMUDHeader;
