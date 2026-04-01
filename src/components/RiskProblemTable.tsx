// src/components/RiskProblemTable.tsx

"use client";

import { RiskProblemItem } from "@/types/risk-problem";
import { Badge } from "./Badge";

/**
 * PROPS - Interface para tipagem
 */

interface RiskProblemTableProps {
  items: RiskProblemItem[];
  onEdit: (item: RiskProblemItem) => void;
  onDelete: (itemId: string) => void;
  loading?: boolean;
}

/**
 * COMPONENTE: RiskProblemTable
 * 
 * Exibe uma tabela com todos os itens de Risco/Problema
 * Padrão: Componente "burro" (dumb component) — só recebe props e renderiza
 * 
 * Exemplo de uso:
 * <RiskProblemTable 
 *   items={items} 
 *   onEdit={handleEdit} 
 *   onDelete={handleDelete}
 *   loading={loading}
 * />
 */

export function RiskProblemTable({
  items,
  onEdit,
  onDelete,
  loading = false,
}: RiskProblemTableProps) {
  // ===== ESTADO DE CARREGAMENTO =====
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Carregando...</span>
      </div>
    );
  }

  // ===== ESTADO VAZIO =====
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-lg">
          Nenhum risco ou problema registrado
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Clique em "Adicionar" para criar o primeiro item
        </p>
      </div>
    );
  }

  // ===== FUNÇÃO AUXILIAR: Formatar Data =====
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    } catch {
      return dateString;
    }
  };

  // ===== FUNÇÃO AUXILIAR: Calcular Atraso =====
  const calculateDelay = (targetDate: string): number => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = today.getTime() - target.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // ===== RENDERIZAÇÃO =====
  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="w-full border-collapse bg-white">
        {/* CABEÇALHO */}
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Natureza
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Título
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Severidade
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Agente
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Data Alvo
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Status
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold">
              Atraso
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold">
              Ações
            </th>
          </tr>
        </thead>

        {/* CORPO */}
        <tbody>
          {items.map((item, index) => {
            const delay = calculateDelay(item.data_alvo_solucao || "");
            const isDelayed = delay > 0;

            return (
              <tr
                key={item.id}
                className={`border-b transition-colors hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* Natureza */}
                <td className="px-6 py-4">
                  <Badge type="natureza" value={item.natureza_atual} />
                </td>

                {/* Título */}
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900 truncate max-w-xs">
                    {item.titulo}
                  </p>
                </td>

                {/* Severidade */}
                <td className="px-6 py-4">
                  <Badge type="severidade" value={item.severidade ??null} />
                </td>

                {/* Agente */}
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.agente_solucao}
                </td>

                {/* Data Alvo */}
                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatDate(item.data_alvo_solucao || "")}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <Badge type="status" value={item.status_operacional ?? null} />
                </td>

                {/* Atraso */}
                <td className="px-6 py-4 text-center">
                  {isDelayed ? (
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                      {delay}d
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>

                {/* Ações */}
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar item"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Tem certeza que deseja deletar este item?"
                          )
                        ) {
                          onDelete(item.id);
                        }
                      }}
                      className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Deletar item"
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}