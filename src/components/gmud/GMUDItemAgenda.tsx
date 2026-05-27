// src/components/gmud/GMUDItemAgenda.tsx

import React from "react";
import DrawerSection from "@/components/DrawerSection";

type Props = {
  dataAgendada?: string | null;
  janelaInicio?: string | null;
  janelaFim?: string | null;
  planoRollback: string;

  mode: "create" | "edit" | "view";

  onChangeDataAgendada?: (v: string) => void;
  onChangeJanelaInicio?: (v: string) => void;
  onChangeJanelaFim?: (v: string) => void;
  onChangePlanoRollback?: (v: string) => void;
};

const GMUDItemAgenda: React.FC<Props> = ({
  dataAgendada,
  janelaInicio,
  janelaFim,
  planoRollback,
  mode,
  onChangeDataAgendada,
  onChangeJanelaInicio,
  onChangeJanelaFim,
  onChangePlanoRollback,
}) => {
  const editable = mode === "create" || mode === "edit";

  // Normalização usada no Drawer original
  const normalizeDate = (d?: string | null) => {
    if (!d) return "";
    return d.split("T")[0];
  };

  const normalizeDateTime = (d?: string | null) => {
    if (!d) return "";
    const [date, time] = d.split("T");
    if (!time) return date;
    const [h, m] = time.split(":");
    return `${date}T${h}:${m}`;
  };

  return (
    <DrawerSection title="Agenda / Execução">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">

        {/* DATA AGENDADA */}
        <div>
          <span className="font-medium text-muted-foreground">Data Agendada:</span>
          {editable ? (
            <input
              type="date"
              value={normalizeDate(dataAgendada)}
              onChange={(e) => onChangeDataAgendada?.(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
            />
          ) : (
            <p className="mt-1 text-foreground">
              {dataAgendada ? normalizeDate(dataAgendada) : "-"}
            </p>
          )}
        </div>

        {/* JANELA INÍCIO */}
        <div>
          <span className="font-medium text-muted-foreground">Janela Início:</span>
          {editable ? (
            <input
              type="datetime-local"
              value={normalizeDateTime(janelaInicio)}
              onChange={(e) => onChangeJanelaInicio?.(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
            />
          ) : (
            <p className="mt-1 text-foreground">
              {janelaInicio ? normalizeDateTime(janelaInicio) : "-"}
            </p>
          )}
        </div>

        {/* JANELA FIM */}
        <div>
          <span className="font-medium text-muted-foreground">Janela Fim:</span>
          {editable ? (
            <input
              type="datetime-local"
              value={normalizeDateTime(janelaFim)}
              onChange={(e) => onChangeJanelaFim?.(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
            />
          ) : (
            <p className="mt-1 text-foreground">
              {janelaFim ? normalizeDateTime(janelaFim) : "-"}
            </p>
          )}
        </div>

        {/* PLANO DE ROLLBACK */}
        <div className="lg:col-span-2">
          <span className="font-medium text-muted-foreground">Plano de Rollback:</span>
          {editable ? (
            <textarea
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground min-h-[120px]"
              value={planoRollback}
              onChange={(e) => onChangePlanoRollback?.(e.target.value)}
            />
          ) : (
            <p className="mt-1 text-foreground whitespace-pre-line">
              {planoRollback || "-"}
            </p>
          )}
        </div>
      </div>
    </DrawerSection>
  );
};

export default GMUDItemAgenda;