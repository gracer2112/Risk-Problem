// src/components/gmud/GMUDRollback.tsx

import React, { useState, useEffect } from "react";
import DrawerSection from "@/components/DrawerSection";

// temporarily using any until backend contract is available
type GMUDRollbackItem = any;

const formatDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleString('pt-BR') : 'N/A';

type Props = {
  rollbacks: GMUDRollbackItem[];
  mode: "create" | "edit" | "view";
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, data: { descricao: string; observacao: string }) => void;
  onAdd: (descricao: string) => void;
  onDelete: (id: string) => void;
};

export default function GMUDRollback({
  rollbacks,
  mode,
  editingId,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onAdd,
  onDelete,
}: Props) {
  const [newDescricao, setNewDescricao] = useState("");

  const [editDescricao, setEditDescricao] = useState("");
  const [editObservacao, setEditObservacao] = useState("");

  // Carrega valores ao entrar em edição
  useEffect(() => {
    if (editingId) {
      const item = rollbacks.find((i) => i.id === editingId);
      if (item) {
        setEditDescricao(item.descricao);
        setEditObservacao(item.observacao || "");
      }
    }
  }, [editingId, rollbacks]);

  const handleAdd = () => {
    if (newDescricao.trim()) {
      onAdd(newDescricao.trim());
      setNewDescricao("");
    }
  };

  const handleSave = () => {
    if (editingId) {
      onUpdate(editingId, {
        descricao: editDescricao.trim(),
        observacao: editObservacao.trim(),
      });
      onCancelEdit();
    }
  };

  return (
    <DrawerSection title="Rollbacks">
      <div className="space-y-4">
        
        {(mode === "create" || mode === "edit") && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Descrição do rollback"
              value={newDescricao}
              onChange={(e) => setNewDescricao(e.target.value)}
              className="flex-1 border rounded px-2 py-1 text-foreground bg-transparent"
            />
            <button
              onClick={handleAdd}
              className="border rounded px-2 py-1 text-foreground hover:bg-muted"
            >
              Adicionar
            </button>
          </div>
        )}

        {rollbacks.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <div key={item.id} className="border rounded px-2 py-2 space-y-2">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editDescricao}
                    onChange={(e) => setEditDescricao(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white text-foreground"
                  />

                  <textarea
                    value={editObservacao}
                    onChange={(e) => setEditObservacao(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white text-foreground"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="border rounded px-2 py-1 text-foreground hover:bg-muted"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="border rounded px-2 py-1 text-muted-foreground hover:bg-muted"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground">{item.descricao}</p>

                  {item.observacao && (
                    <p className="text-muted-foreground text-sm">
                      {item.observacao}
                    </p>
                  )}

                  <div className="text-muted-foreground text-xs space-y-0.5">
                    <div>Criado em: {formatDate(item.created_at)}</div>
                    <div>Atualizado em: {formatDate(item.updated_at)}</div>
                  </div>

                  {(mode === "create" || mode === "edit") && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onStartEdit(item.id)}
                        className="text-blue-600 text-sm underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 text-sm underline"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </DrawerSection>
  );
}