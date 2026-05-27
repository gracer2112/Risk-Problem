// src/components/gmud/GMUDChecklist.tsx

import React, { useState, useEffect } from 'react';
//import DrawerSection from '@/components/DrawerSection';
import { GMUDBadge } from './GMUDBadge';
import { ChecklistItemGMUD, StatusChecklistGMUD } from '@/types/gmud';
import { getStatusChecklistGMUDLabel } from '@/utils/gmud-domain';

type Props = {
  itens: ChecklistItemGMUD[];
  mode: 'create' | 'edit' | 'view';
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, data: { descricao: string; observacao: string; status: StatusChecklistGMUD }) => void;
  onAdd: (descricao: string) => void;
  onDelete: (id: string) => void;
  onAfterChange?: () => void;
};

const GMUDChecklist: React.FC<Props> = ({ itens, mode, editingId, onStartEdit, onCancelEdit, onUpdate, onAdd, onDelete, onAfterChange }) => {
    const [newDescricao, setNewDescricao] = useState('');
    const [editDescricao, setEditDescricao] = useState('');
    const [editObservacao, setEditObservacao] = useState('');
    const [editStatus, setEditStatus] = useState<StatusChecklistGMUD>(
        StatusChecklistGMUD.PENDENTE
    );

    useEffect(() => {
        if (editingId) {
        const item = itens.find((i) => i.id === editingId);
        if (item) {
            setEditDescricao(item.descricao);
            setEditObservacao(item.observacao || '');
            setEditStatus(item.status);
        }
        }
    }, 
    [editingId, itens]);

    const handleAdd = async () => {
        console.log("[CHECKLIST] handleAdd: clicou adicionar", { newDescricao });
        console.log("[CHECKLIST] antes do trim: ", newDescricao, typeof newDescricao);
        console.log("[CHECKLIST] newDescricao.trim(): ", newDescricao?.trim());
        if (!newDescricao.trim()) {
            console.log("[CHECKLIST] handleAdd: descrição vazia, abortando");
            return;
        }
        console.log("[CHECKLIST] handleAdd: chamando onAdd");
        const result = await onAdd(newDescricao.trim());
        console.log("[CHECKLIST] handleAdd: retorno do onAdd:", result);

        setNewDescricao('');
        console.log("[CHECKLIST] handleAdd: chamando onAfterChange");

        onAfterChange?.();  
        //onCancelEdit?.(); 
    };

    const handleSaveEdit =  async () => {
        console.log("[CHECKLIST] handleSaveEdit: clicou salvar", {
            editingId,
            editDescricao,
            editObservacao,
            editStatus,
        });

        console.log("[CHECKLIST] antes do trim: ", editDescricao, typeof editDescricao);
        console.log("[CHECKLIST] editDescricao.trim(): ", editDescricao?.trim());

        if (!editingId || !editDescricao.trim()) {
            console.log("[CHECKLIST] handleSaveEdit: abortando — sem editingId ou descrição vazia");
            return;
        }

        console.log("[CHECKLIST] handleSaveEdit: chamando onUpdate");

       const result = await onUpdate(editingId, {
            descricao: editDescricao.trim(),
            observacao: editObservacao.trim(),
            status: editStatus,
        });
        console.log("[CHECKLIST] handleSaveEdit: retorno do onUpdate:", result);

        onCancelEdit();
        console.log("[CHECKLIST] handleSaveEdit: chamando onAfterChange");

        onAfterChange?.(); // <-- CHAMA O REFRESH APÓS EDITAR
    };

return (
    <div className="space-y-3 max-h-48 overflow-y-auto">
    {(mode === 'create' || mode === 'edit') && (
        <div className="flex space-x-2 items-center">
        <input
            type="text"
            value={newDescricao}
            onChange={(e) => setNewDescricao(e.target.value)}
            placeholder="Nova descrição"
            className="px-3 py-2 border rounded-md bg-white text-foreground"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button onClick={handleAdd} className="border rounded px-2 py-1 text-foreground hover:bg-muted">Adicionar</button>
        </div>
    )}
    <div className="space-y-3 max-h-48 overflow-y-auto">
        {itens.map((item) => {
        const isEditing = editingId === item.id;
        return (
            <div key={item.id} className="p-3 border rounded-lg bg-muted/10 space-y-2">
            {isEditing ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                <input
                    type="text"
                    value={editDescricao}
                    onChange={(e) => setEditDescricao(e.target.value)}
                    placeholder="Descrição"
                    className="w-full px-3 py-2 border rounded-md bg-white text-foreground"
                />
                <input
                    type="text"
                    value={editObservacao}
                    onChange={(e) => setEditObservacao(e.target.value)}
                    placeholder="Observação"
                    className="w-full px-3 py-2 border rounded-md bg-white text-foreground"
                />
                <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as StatusChecklistGMUD)}
                    className="border rounded px-2 py-1 text-foreground bg-transparent"
                >
                    {Object.values(StatusChecklistGMUD).map((status) => (
                    <option key={status} value={status}>{getStatusChecklistGMUDLabel(status)}</option>
                    ))}
                </select>
                <div className="flex space-x-2">
                    <button onClick={handleSaveEdit} className="border rounded px-2 py-1 text-foreground hover:bg-muted">Salvar</button>
                    <button onClick={onCancelEdit} className="border rounded px-2 py-1 text-muted-foreground hover:bg-muted">Cancelar</button>
                </div>
                </div>
            ) : (
                <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                    <p className="font-medium text-foreground">{item.descricao}</p>
                    {item.observacao && <p className="text-xs text-muted-foreground mt-1">{item.observacao}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <GMUDBadge type="status" value={item.status} />
                    {mode !== 'view' && !isEditing && (
                    <>
                        <button onClick={() => onStartEdit(item.id)} 
                        className="px-2 py-1 h-8 border rounded-md text-foreground bg-muted hover:bg-muted/80 transition-colors">
                            Editar
                        </button>
                        <button 
                        onClick={async () => {
                                    await onDelete(item.id);
                                    onAfterChange?.();
                                    }
                                }
                        className="px-2 py-1 h-8 border rounded-md text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors">
                            Excluir
                        </button>
                    </>
                    )}
                </div>
                </div>
            )}
            </div>
        );
        })}
    </div>
    </div>
);
};

export default GMUDChecklist;