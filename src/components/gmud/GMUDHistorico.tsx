// src/components/gmud/GMUDHistorico.tsx

import React from 'react';
import DrawerSection from '@/components/DrawerSection';
import { GMUDBadge } from './GMUDBadge';
import { HistoricoItemGMUD  } from '@/types/gmud';


type Props = {
  eventos: HistoricoItemGMUD[];
};

const formatDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleString('pt-BR') : 'N/A';

const GMUDHistorico: React.FC<Props> = ({ eventos }) => {
  const sorted = [...eventos].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
      <div className="space-y-4">
        {sorted.map((evento, index) => (
          <div
            key={index}
            className="border rounded px-2 py-1 space-y-2"
          >
            <div className="flex flex-col items-end text-xs shrink-0 space-y-2">
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                {evento.tipo_evento}
              </span>
              <span className="text-muted-foreground text-sm">
                {formatDate(evento.timestamp)}
              </span>
              <span className="text-foreground text-sm">
                {evento.usuario_nome}
              </span>
            </div>
            {(evento.status_anterior || evento.status_novo) && (
              <div className="text-sm text-muted-foreground">
                {evento.status_anterior && (
                  <span>{evento.status_anterior}</span>
                )}
                {evento.status_anterior && evento.status_novo && (
                  <span> → </span>
                )}
                {evento.status_novo && (
                  <span>{evento.status_novo}</span>
                )}
              </div>
            )}
            {evento.observacao && (
              <div className="text-sm text-muted-foreground">
                {evento.observacao}
              </div>
            )}
          </div>
        ))}
      </div>
  );
};

export default GMUDHistorico;