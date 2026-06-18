# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gmud-crud.spec.ts >> GMUD - Fluxo Crítico >> deve criar, editar, adicionar checklist e excluir uma GMUD
- Location: tests/e2e/gmud-crud.spec.ts:10:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="titulo"]')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e4]:
      - generic [ref=e5]: Sistema de Riscos e GMUD
      - generic [ref=e6]:
        - link "Riscos e Problemas" [ref=e7] [cursor=pointer]:
          - /url: /risks-problems
        - link "GMUD" [ref=e8] [cursor=pointer]:
          - /url: /gmud
  - main [ref=e9]:
    - region "Notifications alt+T"
    - generic [ref=e10]:
      - generic [ref=e12]:
        - generic [ref=e13]:
          - heading "GMUD" [level=1] [ref=e14]
          - paragraph [ref=e15]: Gerenciamento de Mudanças do Projeto
          - generic [ref=e16]:
            - generic [ref=e17]: Projeto 3
            - link "Abrir projeto" [ref=e18] [cursor=pointer]:
              - /url: /projects/3
        - button "Nova Mudança" [active] [ref=e19]
      - generic [ref=e20]:
        - generic [ref=e21]: Projeto
        - combobox "Projeto" [ref=e22]:
          - option "Selecione um projeto"
          - option "Projeto Godel - Completo" [selected]
          - option "Projeto Godel Backend"
          - option "Projeto Godel Discovery"
          - option "Projeto Godel Front End"
          - option "Projeto Godel Lean Inception"
          - option "Validacao"
        - paragraph [ref=e23]: Selecione um projeto para carregar a lista e habilitar as ações.
    - generic [ref=e27]:
      - generic [ref=e28]:
        - heading "Novo GMUD" [level=2] [ref=e29]
        - button "Fechar" [ref=e30]: ×
      - generic [ref=e31]:
        - generic [ref=e32]:
          - heading "Identificação" [level=3] [ref=e33]
          - generic [ref=e35]:
            - generic [ref=e36]:
              - text: "OpenProject ID:"
              - paragraph [ref=e37]: "3"
            - generic [ref=e38]:
              - text: "Título:"
              - textbox "Digite o título da GMUD" [ref=e39]
            - generic [ref=e40]:
              - text: "Descrição:"
              - textbox "Descreva a mudança" [ref=e41]
            - generic [ref=e42]:
              - text: "Solicitante:"
              - textbox "Digite o solicitante" [ref=e43]
            - generic [ref=e44]:
              - text: "Responsável Execução:"
              - textbox "Digite o responsável pela execução" [ref=e45]
        - generic [ref=e46]:
          - heading "Classificação" [level=3] [ref=e47]
          - generic [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e51]: Status
              - combobox [ref=e52]:
                - option "Rascunho" [selected]
                - option "Em revisão"
                - option "Aprovado"
                - option "Rejeitado"
                - option "Agendado"
                - option "Em execução"
                - option "Concluído"
                - option "Cancelado"
                - option "Rollback"
                - option "Planejado"
            - generic [ref=e53]:
              - generic [ref=e54]: Prioridade
              - combobox [ref=e55]:
                - option "Baixa" [selected]
                - option "Média"
                - option "Alta"
                - option "Crítica"
            - generic [ref=e56]:
              - generic [ref=e57]: Impacto
              - combobox [ref=e58]:
                - option "Baixo" [selected]
                - option "Médio"
                - option "Alto"
                - option "Crítico"
            - generic [ref=e59]:
              - generic [ref=e60]: Ambiente
              - combobox [ref=e61]:
                - option "Desenvolvimento" [selected]
                - option "Homologação"
                - option "Produção"
            - generic [ref=e62]:
              - generic [ref=e63]: Tipo Execução
              - combobox [ref=e64]:
                - option "Manual" [selected]
                - option "Automática"
            - generic [ref=e65]:
              - generic [ref=e66]: Origem
              - combobox [ref=e67]:
                - option "Interna" [selected]
                - option "Cliente"
                - option "Fornecedor"
        - generic [ref=e68]:
          - heading "Agenda / Execução" [level=3] [ref=e69]
          - generic [ref=e71]:
            - generic [ref=e72]:
              - text: "Janela Início:"
              - textbox [ref=e73]
            - generic [ref=e74]:
              - text: "Janela Fim:"
              - textbox [ref=e75]
            - generic [ref=e76]:
              - text: "Plano Rollback:"
              - textbox "Descreva o plano de rollback" [ref=e77]
        - generic [ref=e78]:
          - heading "Checklist" [level=3] [ref=e79]
          - generic [ref=e82]:
            - textbox "Nova descrição" [ref=e83]
            - button "Adicionar" [ref=e84]
        - generic [ref=e85]:
          - generic [ref=e86]: "Total: 0"
          - generic [ref=e87]: "Concluídos: 0"
          - generic [ref=e88]: "Pendentes: 0"
          - generic [ref=e89]: "Dispensados: 0"
          - generic [ref=e90]: "Percentual de conclusão: 0%"
          - generic [ref=e91]: "Pronto: Sim"
        - heading "Histórico" [level=3] [ref=e93]
      - generic [ref=e94]:
        - button "Fechar" [ref=e95]
        - button "Salvar" [ref=e96]
  - button "Open Next.js Dev Tools" [ref=e102] [cursor=pointer]:
    - img [ref=e103]
  - alert [ref=e106]
```

# Test source

```ts
  1   | // tests/e2e/gmud-crud.spec.ts
  2   | // tests/e2e/gmud-crud.spec.ts
  3   | import { test, expect } from '@playwright/test';
  4   | 
  5   | test.describe('GMUD - Fluxo Crítico', () => {
  6   |   test.beforeEach(async ({ page }) => {
  7   |     await page.goto('/gmud');
  8   |   });
  9   | 
  10  |   test('deve criar, editar, adicionar checklist e excluir uma GMUD', async ({ page }) => {
  11  |     // 
  12  |     // PASSO 1 — Selecionar um projeto
  13  |     // 
  14  |     const projectSelect = page.getByLabel('Projeto');
  15  |     await projectSelect.waitFor({ state: 'visible', timeout: 10000 });
  16  |     await projectSelect.selectOption({ index: 1 });
  17  | 
  18  |     // Aguarda a listagem carregar
  19  |     await page.waitForTimeout(2000);
  20  | 
  21  |     // 
  22  |     // PASSO 2 — Clicar em "Nova Mudança"
  23  |     // 
  24  |     const novaBtn = page.getByRole('button', { name: /nova mudança|nova gmud|criar gmud/i });
  25  |     await novaBtn.click();
  26  | 
  27  |     // 
  28  |     // PASSO 3 — Aguardar o drawer abrir (qualquer título)
  29  |     // 
  30  |     await page.waitForTimeout(1000);
  31  |     
  32  |     // 
  33  |     // PASSO 4 — Preencher o formulário
  34  |     // 
  35  |     const titulo = `GMUD E2E - ${Date.now()}`; // ← CRASES aqui!
  36  | 
> 37  |     await page.fill('input[name="titulo"]', titulo);
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  38  |     await page.fill('textarea[name="descricao"]', 'GMUD criada pelo teste E2E do Playwright');
  39  |     await page.selectOption('select[name="prioridade"]', 'alta');
  40  |     await page.selectOption('select[name="impacto"]', 'alto');
  41  |     await page.selectOption('select[name="ambiente"]', 'desenvolvimento');
  42  | 
  43  |     // 
  44  |     // PASSO 5 — Salvar
  45  |     // 
  46  |     const salvarBtn = page.getByRole('button', { name: /salvar|criar/i });
  47  |     await salvarBtn.click();
  48  | 
  49  |     // 
  50  |     // PASSO 6 — Verificar toast de sucesso
  51  |     // 
  52  |     const toast = page.locator('[id^="toast"], [role="status"], .Toastify__toast');
  53  |     await expect(toast.first()).toBeVisible({ timeout: 8000 });
  54  | 
  55  |     // 
  56  |     // PASSO 7 — Verificar item na tabela
  57  |     // 
  58  |     const itemNaTabela = page.locator(`text=${titulo}`); // ← CRASES aqui!
  59  |     await expect(itemNaTabela.first()).toBeVisible({ timeout: 5000 });
  60  | 
  61  |     // 
  62  |     // PASSO 8 — Clicar no item pra editar
  63  |     // 
  64  |     await itemNaTabela.first().click();
  65  | 
  66  |     // 
  67  |     // PASSO 9 — Editar a prioridade
  68  |     // 
  69  |     const editDrawer = page.locator('[class*="drawer"], [class*="modal"]').first();
  70  |     await editDrawer.waitFor({ state: 'visible', timeout: 5000 });
  71  | 
  72  |     await page.selectOption('select[name="prioridade"]', 'critica');
  73  | 
  74  |     const atualizarBtn = page.getByRole('button', { name: /salvar|atualizar/i });
  75  |     await atualizarBtn.click();
  76  | 
  77  |     await expect(toast.first()).toBeVisible({ timeout: 5000 });
  78  | 
  79  |     // 
  80  |     // PASSO 10 — Adicionar item ao checklist
  81  |     // 
  82  |     await page.locator(`text=${titulo}`).first().click();
  83  |     await editDrawer.waitFor({ state: 'visible', timeout: 5000 });
  84  | 
  85  |     const checkInput = page.locator('input[name="checklist"], input[placeholder*="checklist"], input[placeholder*="item"]');
  86  |     if (await checkInput.isVisible()) {
  87  |       await checkInput.fill('Verificar impacto no banco de dados');
  88  |       const addCheckBtn = page.getByRole('button', { name: /adicionar|add/i });
  89  |       await addCheckBtn.click();
  90  |       await expect(toast.first()).toBeVisible({ timeout: 5000 });
  91  |     }
  92  | 
  93  |     // 
  94  |     // PASSO 11 — Excluir a GMUD
  95  |     // 
  96  |     await page.locator(`text=${titulo}`).first().click();
  97  |     await editDrawer.waitFor({ state: 'visible', timeout: 5000 });
  98  | 
  99  |     const excluirBtn = page.getByRole('button', { name: /excluir|deletar|remover/i });
  100 |     await excluirBtn.click();
  101 | 
  102 |     const confirmarBtn = page.getByRole('button', { name: /confirmar|sim|excluir/i });
  103 |     if (await confirmarBtn.isVisible()) {
  104 |       await confirmarBtn.click();
  105 |     }
  106 | 
  107 |     await expect(toast.first()).toBeVisible({ timeout: 5000 });
  108 | 
  109 |     const itemSumiu = page.locator(`text=${titulo}`);
  110 |     await expect(itemSumiu.first()).not.toBeVisible({ timeout: 5000 });
  111 |   });
  112 | });
```