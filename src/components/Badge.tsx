// src/components/Badge.tsx

import { SeveridadeEnum, NaturezaEnum } from "@/types/risk-problem";

interface BadgeProps {
  type: "natureza" | "status" | "severidade";
  value: string | null;
  className?: string;
}

export function Badge({ type, value, className = "" }: BadgeProps) {
  const getBadgeStyles = (type: string, value: string | null): string => {
    // Validação: se value for null ou undefined, retorna estilo padrão
    if (!value) {
      return "bg-gray-100 text-gray-800 border-gray-300";
    }

    if (type === "severidade") {
      switch (value.toLowerCase()) {
        case "baixa":
          return "bg-green-100 text-green-800 border-green-300";
        case "media":
          return "bg-yellow-100 text-yellow-800 border-yellow-300";
        case "alta":
          return "bg-orange-100 text-orange-800 border-orange-300";
        case "critica":
          return "bg-red-100 text-red-800 border-red-300";
        default:
          return "bg-gray-100 text-gray-800 border-gray-300";
      }
    }

    if (type === "natureza") {
      switch (value.toLowerCase()) {
        case "risco":
          return "bg-orange-100 text-orange-800 border-orange-300";
        case "problema":
          return "bg-red-100 text-red-800 border-red-300";
        default:
          return "bg-gray-100 text-gray-800 border-gray-300";
      }
    }

    if (type === "status") {
      switch (value.toLowerCase()) {
        case "identificado":
          return "bg-blue-100 text-blue-800 border-blue-300";
        case "em_tratamento":
          return "bg-yellow-100 text-yellow-800 border-yellow-300";
        case "resolvido":
          return "bg-green-100 text-green-800 border-green-300";
        case "encerrado":
          return "bg-gray-100 text-gray-800 border-gray-300";
        default:
          return "bg-gray-100 text-gray-800 border-gray-300";
      }
    }

    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getBadgeStyles(type, value)} ${className}`}
    >
      {value || "—"}
    </span>
  );
}