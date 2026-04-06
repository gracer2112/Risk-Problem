// src/app/risks-problems/page.tsx

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRiskProblems } from '@/hooks/useRiskProblems';
import RiskProblemDrawer from '@/components/RiskProblemDrawer';
import { RiskProblemTable } from '@/components/RiskProblemTable';
import { NaturezaAtualEnum } from '@/types/risk-problem';
import type {
  RiskProblemEntity,
  RiskProblemFormData,
  RiskProblemListItem,
} from '@/types/risk-problem';

const PROJECT_ID = '1';

function getFriendlyErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export default function RisksProblemsPage() {
  const {
    items,
    loading,
    error,
    loadItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    clearError,
  } = useRiskProblems(PROJECT_ID);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RiskProblemEntity | null>(
    null
  );
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void loadItems().catch(() => {
      // O hook já controla o estado de erro.
    });
  }, [loadItems]);

  const handleCloseDrawer = useCallback(() => {
    clearError();
    setIsDrawerOpen(false);
    setSelectedItem(null);
  }, [clearError]);

  const handleOpenCreate = useCallback(() => {
    clearError();
    setSelectedItem(null);
    setIsDrawerOpen(true);
  }, [clearError]);

  const handleEdit = useCallback(
    async (item: RiskProblemListItem | { id: string }) => {
      clearError();
      setDrawerLoading(true);

      try {
        const detail = await getItemById(item.id);
        setSelectedItem(detail);
        setIsDrawerOpen(true);
      } catch (err) {
        console.error('Erro ao carregar item para edição:', err);
        window.alert(
          getFriendlyErrorMessage(
            err,
            'Não foi possível carregar o item para edição.'
          )
        );
      } finally {
        setDrawerLoading(false);
      }
    },
    [clearError, getItemById]
  );

  const handleDelete = useCallback(
    async (itemId: string) => {
      const confirmed = window.confirm(
        'Tem certeza que deseja excluir este item?'
      );

      if (!confirmed) {
        return;
      }

      setDeletingId(itemId);

      try {
        await deleteItem(itemId);
      } catch (err) {
        console.error('Erro ao excluir item:', err);
        window.alert(
          getFriendlyErrorMessage(
            err,
            'Não foi possível excluir o item.'
          )
        );
      } finally {
        setDeletingId(null);
      }
    },
    [deleteItem]
  );

  const handleSave = useCallback(
    async (
      form: RiskProblemFormData,
      original?: RiskProblemEntity
    ) => {
      setDrawerLoading(true);

      try {
        if (original?.id) {
          await updateItem(original.id, form, original);
          return;
        }

        await createItem(form);
      } finally {
        setDrawerLoading(false);
      }
    },
    [createItem, updateItem]
  );

  const totalItems = items.length;

  const totalRisks = useMemo(
    () =>
      items.filter(
        (item) => item.natureza_atual === NaturezaAtualEnum.RISCO
      ).length,
    [items]
  );

  const totalProblems = useMemo(
    () =>
      items.filter(
        (item) => item.natureza_atual === NaturezaAtualEnum.PROBLEMA
      ).length,
    [items]
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Riscos e Problemas
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Consolidação de domínio e contrato de dados do módulo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Novo item
          </button>
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total de itens
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {totalItems}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Riscos</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {totalRisks}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Problemas
            </p>
            <p className="mt-2 text-3xl font-semibold text-rose-600">
              {totalProblems}
            </p>
          </div>
        </section>

        {deletingId && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Excluindo item selecionado...
          </div>
        )}

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <RiskProblemTable
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </section>
      </div>

      <RiskProblemDrawer
        isOpen={isDrawerOpen}
        item={selectedItem}
        onClose={handleCloseDrawer}
        onSave={handleSave}
        loading={drawerLoading}
      />
    </main>
  );
}