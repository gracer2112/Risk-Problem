// src/utils/mock-data.ts

import {
  OrigemItemEnum,
  TipoInicialEnum,
  NaturezaAtualEnum,
  StatusRiscoEnum,
  StatusProblemaEnum,
  type RiskProblemEntity,
} from "@/types/risk-problem";

/**
 * DADOS MOCK - Para testes e desenvolvimento
 * Alinhados ao domínio atual do módulo de riscos e problemas.
 *
 * Quando a API real estiver 100% consolidada em todos os fluxos,
 * este arquivo pode ser removido.
 */

export const MOCK_RISK_PROBLEM_ITEMS: RiskProblemEntity[] = [
  {
    id: "item-001",
    tipo_inicial: TipoInicialEnum.RISCO,
    natureza_atual: NaturezaAtualEnum.RISCO,
    status_operacional: StatusRiscoEnum.PLANO_ACAO_DEFINIDO,
    origem: OrigemItemEnum.CRIADO_COMO_RISCO,
    data_entrada: "2026-03-15T09:00:00Z",

    descricao:
      "O projeto está atrasado em 2 semanas devido a problemas de infraestrutura. Necessária realocação de recursos.",
    causa_raiz:
      "Capacidade insuficiente de infraestrutura para absorver o volume atual do projeto.",
    descricao_impacto:
      "Pode comprometer o cronograma, elevar custo e pressionar entregas críticas.",
    acao_corretiva_controle:
      "Aumentar equipe de desenvolvimento em 3 pessoas e reforçar infraestrutura.",
    agente_solucao: "Shirlene",
    coordenador_agente: "Andreia",
    data_alvo_solucao: "2026-04-15",

    probabilidade_inerente: 4,
    impacto_inerente: 5,
    nivel_risco_inerente: 20,
    eficacia_controle: 2,
    probabilidade_residual: 2,
    impacto_residual: 5,
    nivel_risco_residual: 10,

    impacto_realizado: null,
    urgencia_solucao: null,
    prioridade_problema: null,

    convertido_em_problema_em: null,
    data_transicao_problema: null,
    motivo_transicao: null,
    controle_aplicado: null,
    controle_efetivo: null,

    data_encerramento: null,
    observacao_encerramento: null,
    historico_eventos: [],
  },

  {
    id: "item-002",
    tipo_inicial: TipoInicialEnum.RISCO,
    natureza_atual: NaturezaAtualEnum.PROBLEMA,
    status_operacional: StatusProblemaEnum.EM_TRATAMENTO,
    origem: OrigemItemEnum.RISCO_CONVERTIDO,
    data_entrada: "2026-03-18T08:00:00Z",

    descricao:
      "A API de pagamento está retornando erros 500 em 15% das transações. Impacto direto na conversão.",
    causa_raiz:
      "Instabilidade na integração com provedor externo de pagamentos.",
    descricao_impacto:
      "Perda de transações, queda de conversão e aumento de chamados operacionais.",
    acao_corretiva_controle:
      "Contato com suporte da API e implementação de retry com monitoramento.",
    agente_solucao: "João Silva",
    coordenador_agente: "Carlos",
    data_alvo_solucao: "2026-03-22",

    probabilidade_inerente: null,
    impacto_inerente: null,
    nivel_risco_inerente: null,
    eficacia_controle: null,
    probabilidade_residual: null,
    impacto_residual: null,
    nivel_risco_residual: null,

    impacto_realizado: 4,
    urgencia_solucao: 5,
    prioridade_problema: 20,

    convertido_em_problema_em: "2026-03-19T14:00:00Z",
    data_transicao_problema: "2026-03-19T14:00:00Z",
    motivo_transicao: "Risco materializado em falha real na operação.",
    controle_aplicado: "sim",
    controle_efetivo: "nao",

    data_encerramento: null,
    observacao_encerramento: null,
    historico_eventos: [],
  },

  {
    id: "item-003",
    tipo_inicial: TipoInicialEnum.RISCO,
    natureza_atual: NaturezaAtualEnum.RISCO,
    status_operacional: StatusRiscoEnum.IDENTIFICADO,
    origem: OrigemItemEnum.CRIADO_COMO_RISCO,
    data_entrada: "2026-03-10T10:00:00Z",

    descricao:
      "Documentação do projeto está incompleta e dificulta o onboarding de novos desenvolvedores.",
    causa_raiz:
      "Ausência de rotina de documentação e definição clara de responsável.",
    descricao_impacto:
      "Aumenta curva de aprendizado, retrabalho e dependência de conhecimento tácito.",
    acao_corretiva_controle:
      "Criar documentação técnica completa de README, APIs e arquitetura.",
    agente_solucao: "Maria",
    coordenador_agente: "Pedro",
    data_alvo_solucao: "2026-05-01",

    probabilidade_inerente: 3,
    impacto_inerente: 3,
    nivel_risco_inerente: 9,
    eficacia_controle: 4,
    probabilidade_residual: 1,
    impacto_residual: 2,
    nivel_risco_residual: 2,

    impacto_realizado: null,
    urgencia_solucao: null,
    prioridade_problema: null,

    convertido_em_problema_em: null,
    data_transicao_problema: null,
    motivo_transicao: null,
    controle_aplicado: null,
    controle_efetivo: null,

    data_encerramento: null,
    observacao_encerramento: null,
    historico_eventos: [],
  },

  {
    id: "item-004",
    tipo_inicial: TipoInicialEnum.PROBLEMA,
    natureza_atual: NaturezaAtualEnum.PROBLEMA,
    status_operacional: StatusProblemaEnum.EM_TRATAMENTO,
    origem: OrigemItemEnum.CRIADO_COMO_PROBLEMA,
    data_entrada: "2026-03-08T11:00:00Z",

    descricao:
      "Aplicação está lenta em dispositivos mobile com LCP acima de 3 segundos.",
    causa_raiz:
      "Imagens pesadas, ausência de lazy loading e bundle inicial acima do ideal.",
    descricao_impacto:
      "Impacta experiência do usuário e reduz performance percebida em mobile.",
    acao_corretiva_controle:
      "Otimizar imagens, implementar lazy loading e code splitting.",
    agente_solucao: "Dev Front-end",
    coordenador_agente: "Tech Lead",
    data_alvo_solucao: "2026-04-10",

    probabilidade_inerente: null,
    impacto_inerente: null,
    nivel_risco_inerente: null,
    eficacia_controle: null,
    probabilidade_residual: null,
    impacto_residual: null,
    nivel_risco_residual: null,

    impacto_realizado: 4,
    urgencia_solucao: 4,
    prioridade_problema: 16,

    convertido_em_problema_em: null,
    data_transicao_problema: null,
    motivo_transicao: null,
    controle_aplicado: null,
    controle_efetivo: null,

    data_encerramento: null,
    observacao_encerramento: null,
    historico_eventos: [],
  },

  {
    id: "item-005",
    tipo_inicial: TipoInicialEnum.RISCO,
    natureza_atual: NaturezaAtualEnum.RISCO,
    status_operacional: StatusRiscoEnum.EM_ANALISE,
    origem: OrigemItemEnum.CRIADO_COMO_RISCO,
    data_entrada: "2026-03-05T09:00:00Z",

    descricao:
      "Alguns campos de formulário não validam adequadamente a entrada do usuário.",
    causa_raiz:
      "Validação inconsistente entre front-end e backend em partes do fluxo.",
    descricao_impacto:
      "Risco de vulnerabilidades como XSS e entrada indevida de dados.",
    acao_corretiva_controle:
      "Implementar validação robusta com schema centralizado em todos os formulários.",
    agente_solucao: "Security Team",
    coordenador_agente: "CISO",
    data_alvo_solucao: "2026-03-31",

    probabilidade_inerente: 2,
    impacto_inerente: 5,
    nivel_risco_inerente: 10,
    eficacia_controle: 1,
    probabilidade_residual: 2,
    impacto_residual: 5,
    nivel_risco_residual: 10,

    impacto_realizado: null,
    urgencia_solucao: null,
    prioridade_problema: null,

    convertido_em_problema_em: null,
    data_transicao_problema: null,
    motivo_transicao: null,
    controle_aplicado: null,
    controle_efetivo: null,

    data_encerramento: null,
    observacao_encerramento: null,
    historico_eventos: [],
  },
];