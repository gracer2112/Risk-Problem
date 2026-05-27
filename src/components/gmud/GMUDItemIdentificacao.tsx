// src/components/gmud/GMUDItemIdentificacao.tsx

import React from "react";
import DrawerSection from "@/components/DrawerSection";

type Props = {
  projectId: string;
  openprojectProjectId: string | null;
  titulo: string;
  descricao: string;
  solicitante: string;
  responsavelExecucao: string;
  createdAt?: string | null;
  updatedAt?: string | null;

  mode: "create" | "edit" | "view";

  onChangeTitulo?: (value: string) => void;
  onChangeDescricao?: (value: string) => void;
  onChangeSolicitante?: (value: string) => void;
  onChangeResponsavelExecucao?: (value: string) => void;
};

const GMUDItemIdentificacao: React.FC<Props> = ({
  projectId,
  openprojectProjectId,
  titulo,
  descricao,
  solicitante,
  responsavelExecucao,
  createdAt,
  updatedAt,
  mode,
  onChangeTitulo,
  onChangeDescricao,
  onChangeSolicitante,
  onChangeResponsavelExecucao,
}) => {
  const editable = mode === "create" || mode === "edit";

  return (
    <DrawerSection title="Identificação">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
        
        {projectId && (
          <div>
            <span className="font-medium text-muted-foreground">Project ID:</span>
            <p className="mt-1 font-mono text-foreground bg-muted/50 px-2 py-1 rounded text-xs">
              {projectId}
            </p>
          </div>
        )}

        <div>
          <span className="font-medium text-muted-foreground">OpenProject ID:</span>
          <p className="mt-1 font-mono text-foreground bg-muted/50 px-2 py-1 rounded text-xs">
            {openprojectProjectId || "N/A"}
          </p>
        </div>

        <div className="lg:col-span-2">
          <span className="font-medium text-muted-foreground">Título:</span>
          {editable ? (
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
              value={titulo}
              onChange={(e) => onChangeTitulo?.(e.target.value)}
              placeholder="Digite o título da GMUD"
            />
          ) : (
            <p className="mt-1 text-foreground font-medium">{titulo}</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <span className="font-medium text-muted-foreground">Descrição:</span>
          {editable ? (
            <textarea
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground min-h-[120px]"
              value={descricao}
              onChange={(e) => onChangeDescricao?.(e.target.value)}
              placeholder="Descreva a mudança"
            />
          ) : (
            <p className="mt-1 text-foreground whitespace-pre-line">{descricao}</p>
          )}
        </div>

        <div>
          <span className="font-medium text-muted-foreground">Solicitante:</span>
          {editable ? (
            <input
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
              value={solicitante}
              onChange={(e) => onChangeSolicitante?.(e.target.value)}
              placeholder="Digite o solicitante"
            />
          ) : (
            <p className="mt-1 text-foreground">{solicitante}</p>
          )}
        </div>

        <div>
          <span className="font-medium text-muted-foreground">Responsável Execução:</span>
          {editable ? (
            <input
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
              value={responsavelExecucao}
              onChange={(e) => onChangeResponsavelExecucao?.(e.target.value)}
              placeholder="Digite o responsável pela execução"
            />
          ) : (
            <p className="mt-1 text-foreground">{responsavelExecucao}</p>
          )}
        </div>

        {createdAt && (
          <div>
            <span className="font-medium text-muted-foreground">Criado em:</span>
            <p className="mt-1 text-foreground text-xs">{createdAt}</p>
          </div>
        )}

        {updatedAt && (
          <div>
            <span className="font-medium text-muted-foreground">Atualizado em:</span>
            <p className="mt-1 text-foreground text-xs">{updatedAt}</p>
          </div>
        )}
      </div>
    </DrawerSection>
  );
};

export default GMUDItemIdentificacao;