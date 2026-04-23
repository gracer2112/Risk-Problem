// src/components/gmud/GMUDHeader.tsx

import React from 'react';

type GMUDHeaderProps = {
  title?: string;
  description?: string;
  projectName?: string;
  openProjectProjectId?: string | null;
  hasSelectedProject?: boolean;
  loading?: boolean;
  createButtonLabel?: string;
  onCreate?: () => void;
};

const GMUDHeader = ({
  title = 'Controle de Mudanças (GMUD)',
  description = 'Gerencie suas GMUDs com eficiência e controle total.',
  projectName,
  openProjectProjectId,
  hasSelectedProject = false,
  loading = false,
  createButtonLabel = 'Nova GMUD',
  onCreate,
}: GMUDHeaderProps) => {
  const isButtonDisabled = !hasSelectedProject || loading;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          <p className="text-gray-600 mt-2 text-lg md:text-xl leading-relaxed">
            {description}
          </p>

          {projectName && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-900 text-lg">Projeto: {projectName}</p>
              {openProjectProjectId && (
                <p className="text-sm text-blue-700 mt-1 font-medium">
                  OpenProject: #{openProjectProjectId}
                </p>
              )}
            </div>
          )}

          {!hasSelectedProject && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                Selecione um projeto para criar GMUDs.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 lg:pt-0">
          <button
            onClick={onCreate}
            disabled={isButtonDisabled}
            className={`px-8 py-3 rounded-xl font-semibold text-white text-lg transition-all duration-200 flex items-center gap-2 min-w-[200px] justify-center ${
              isButtonDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-md'
            }`}
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {createButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export type { GMUDHeaderProps };
export default GMUDHeader;
