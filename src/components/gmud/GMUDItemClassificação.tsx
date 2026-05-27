// src/components/gmud/GMUDItemClassificacao.tsx

import React from "react";
import DrawerSection from "@/components/DrawerSection";

import {
  StatusGMUD,
  PrioridadeGMUD,
  ImpactoGMUD,
  AmbienteGMUD,
  TipoExecucaoGMUD,
  OrigemGMUD,
} from "@/types/gmud";

import {
  getStatusGMUDLabel,
  getPrioridadeGMUDLabel,
  getImpactoGMUDLabel,
  getAmbienteGMUDLabel,
  getTipoExecucaoGMUDLabel,
  getOrigemGMUDLabel,
} from "@/utils/gmud-domain";

type Props = {
  status: StatusGMUD;
  prioridade: PrioridadeGMUD;
  impacto: ImpactoGMUD;
  ambiente: AmbienteGMUD;
  tipoExecucao: TipoExecucaoGMUD;
  origem: OrigemGMUD;

  mode: "create" | "edit" | "view";

  onChangeStatus?: (v: StatusGMUD) => void;
  onChangePrioridade?: (v: PrioridadeGMUD) => void;
  onChangeImpacto?: (v: ImpactoGMUD) => void;
  onChangeAmbiente?: (v: AmbienteGMUD) => void;
  onChangeTipoExecucao?: (v: TipoExecucaoGMUD) => void;
  onChangeOrigem?: (v: OrigemGMUD) => void;
};

const GMUDItemClassificacao: React.FC<Props> = ({
  status,
  prioridade,
  impacto,
  ambiente,
  tipoExecucao,
  origem,
  mode,

  onChangeStatus,
  onChangePrioridade,
  onChangeImpacto,
  onChangeAmbiente,
  onChangeTipoExecucao,
  onChangeOrigem,
}) => {
  const editable = mode === "create" || mode === "edit";

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">

        {/* STATUS */}
        <div>
          <span className="font-medium text-muted-foreground">Status:</span>
          {editable ? (
            <select
              value={status}
              onChange={(e) => onChangeStatus?.(e.target.value as StatusGMUD)}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
            >
              {Object.values(StatusGMUD).map((s) => (
                <option key={s} value={s}>
                  {getStatusGMUDLabel(s)}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 font-medium">{getStatusGMUDLabel(status)}</p>
          )}
        </div>

        {/* PRIORIDADE */}
        <div>
          <span className="font-medium text-muted-foreground">Prioridade:</span>
          {editable ? (
            <select
              value={prioridade}
              onChange={(e) =>
                onChangePrioridade?.(e.target.value as PrioridadeGMUD)
              }
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
            >
              {Object.values(PrioridadeGMUD).map((p) => (
                <option key={p} value={p}>
                  {getPrioridadeGMUDLabel(p)}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 font-medium">{getPrioridadeGMUDLabel(prioridade)}</p>
          )}
        </div>

        {/* IMPACTO */}
        <div>
          <span className="font-medium text-muted-foreground">Impacto:</span>
          {editable ? (
            <select
              value={impacto}
              onChange={(e) => onChangeImpacto?.(e.target.value as ImpactoGMUD)}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
            >
              {Object.values(ImpactoGMUD).map((i) => (
                <option key={i} value={i}>
                  {getImpactoGMUDLabel(i)}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 font-medium">{getImpactoGMUDLabel(impacto)}</p>
          )}
        </div>

        {/* AMBIENTE */}
        <div>
          <span className="font-medium text-muted-foreground">Ambiente:</span>
          {editable ? (
            <select
              value={ambiente}
              onChange={(e) =>
                onChangeAmbiente?.(e.target.value as AmbienteGMUD)
              }
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
            >
              {Object.values(AmbienteGMUD).map((a) => (
                <option key={a} value={a}>
                  {getAmbienteGMUDLabel(a)}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 font-medium">{getAmbienteGMUDLabel(ambiente)}</p>
          )}
        </div>

        {/* TIPO EXECUÇÃO */}
        <div>
          <span className="font-medium text-muted-foreground">Tipo de Execução:</span>
          {editable ? (
            <select
              value={tipoExecucao}
              onChange={(e) =>
                onChangeTipoExecucao?.(e.target.value as TipoExecucaoGMUD)
              }
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
            >
              {Object.values(TipoExecucaoGMUD).map((t) => (
                <option key={t} value={t}>
                  {getTipoExecucaoGMUDLabel(t)}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 font-medium">
              {getTipoExecucaoGMUDLabel(tipoExecucao)}
            </p>
          )}
        </div>

        {/* ORIGEM */}
        <div>
          <span className="font-medium text-muted-foreground">Origem:</span>
          {editable ? (
            <select
              value={origem}
              onChange={(e) => onChangeOrigem?.(e.target.value as OrigemGMUD)}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
            >
              {Object.values(OrigemGMUD).map((o) => (
                <option key={o} value={o}>
                  {getOrigemGMUDLabel(o)}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 font-medium">{getOrigemGMUDLabel(origem)}</p>
          )}
        </div>
      </div>
  );
};

export default GMUDItemClassificacao;