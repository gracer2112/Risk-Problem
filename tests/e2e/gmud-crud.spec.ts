// tests/e2e/gmud-crud.spec.ts
// tests/e2e/gmud-crud.spec.ts
import { test, expect } from '@playwright/test';

test.describe('GMUD - Fluxo Crítico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gmud');
  });

  test('deve criar, editar, adicionar checklist e excluir uma GMUD', async ({ page }) => {
    // 
    // PASSO 1 — Selecionar um projeto
    // 
    const projectSelect = page.getByLabel('Projeto');
    await projectSelect.waitFor({ state: 'visible', timeout: 10000 });
    await projectSelect.selectOption({ index: 1 });

    // Aguarda a listagem carregar
    await page.waitForTimeout(2000);

    // 
    // PASSO 2 — Clicar em "Nova Mudança"
    // 
    const novaBtn = page.getByRole('button', { name: /nova mudança|nova gmud|criar gmud/i });
    await novaBtn.click();

    // 
    // PASSO 3 — Aguardar o drawer abrir (qualquer título)
    // 
    await page.waitForTimeout(1000);
    
    // 
    // PASSO 4 — Preencher o formulário
    // 
    const titulo = `GMUD E2E - ${Date.now()}`; // ← CRASES aqui!

    await page.fill('input[name="titulo"]', titulo);
    await page.fill('textarea[name="descricao"]', 'GMUD criada pelo teste E2E do Playwright');
    await page.selectOption('select[name="prioridade"]', 'alta');
    await page.selectOption('select[name="impacto"]', 'alto');
    await page.selectOption('select[name="ambiente"]', 'desenvolvimento');

    // 
    // PASSO 5 — Salvar
    // 
    const salvarBtn = page.getByRole('button', { name: /salvar|criar/i });
    await salvarBtn.click();

    // 
    // PASSO 6 — Verificar toast de sucesso
    // 
    const toast = page.locator('[id^="toast"], [role="status"], .Toastify__toast');
    await expect(toast.first()).toBeVisible({ timeout: 8000 });

    // 
    // PASSO 7 — Verificar item na tabela
    // 
    const itemNaTabela = page.locator(`text=${titulo}`); // ← CRASES aqui!
    await expect(itemNaTabela.first()).toBeVisible({ timeout: 5000 });

    // 
    // PASSO 8 — Clicar no item pra editar
    // 
    await itemNaTabela.first().click();

    // 
    // PASSO 9 — Editar a prioridade
    // 
    const editDrawer = page.locator('[class*="drawer"], [class*="modal"]').first();
    await editDrawer.waitFor({ state: 'visible', timeout: 5000 });

    await page.selectOption('select[name="prioridade"]', 'critica');

    const atualizarBtn = page.getByRole('button', { name: /salvar|atualizar/i });
    await atualizarBtn.click();

    await expect(toast.first()).toBeVisible({ timeout: 5000 });

    // 
    // PASSO 10 — Adicionar item ao checklist
    // 
    await page.locator(`text=${titulo}`).first().click();
    await editDrawer.waitFor({ state: 'visible', timeout: 5000 });

    const checkInput = page.locator('input[name="checklist"], input[placeholder*="checklist"], input[placeholder*="item"]');
    if (await checkInput.isVisible()) {
      await checkInput.fill('Verificar impacto no banco de dados');
      const addCheckBtn = page.getByRole('button', { name: /adicionar|add/i });
      await addCheckBtn.click();
      await expect(toast.first()).toBeVisible({ timeout: 5000 });
    }

    // 
    // PASSO 11 — Excluir a GMUD
    // 
    await page.locator(`text=${titulo}`).first().click();
    await editDrawer.waitFor({ state: 'visible', timeout: 5000 });

    const excluirBtn = page.getByRole('button', { name: /excluir|deletar|remover/i });
    await excluirBtn.click();

    const confirmarBtn = page.getByRole('button', { name: /confirmar|sim|excluir/i });
    if (await confirmarBtn.isVisible()) {
      await confirmarBtn.click();
    }

    await expect(toast.first()).toBeVisible({ timeout: 5000 });

    const itemSumiu = page.locator(`text=${titulo}`);
    await expect(itemSumiu.first()).not.toBeVisible({ timeout: 5000 });
  });
});