import { FormGroup } from '@angular/forms';

/**
 * Recebe o formulário e o valor (string) que veio do botão do HTML.
 * Gerencia os campos de Valor de Venda e Valor de Aluguel.
 */
export function aplicarRegraObjetivoInteresse(form: FormGroup, valor: string): void {
  // 1. Pega os controles
  const interesseGroup = form.get('interesse');
  if (!interesseGroup) return;

  const vrVenda = interesseGroup.get('vr_imovel');
  const vrAluguel = interesseGroup.get('vr_aluguel');

  // 2. Reset inicial: Habilita tudo para começar limpo
  vrVenda?.enable();
  vrAluguel?.enable();

  // 3. Aplica a lógica baseada na string exata que está no seu HTML
  switch (valor) {
    case 'Comprar':
      // Se quero comprar, não faz sentido preencher valor de aluguel
      vrAluguel?.disable();
      vrAluguel?.setValue(null);
      break;

    case 'Vender':
      // Se quero vender, bloqueio aluguel e garanto venda
      vrAluguel?.disable();
      vrAluguel?.setValue(null);
      vrVenda?.enable();
      break;

    case 'Alugar':
      // Se quero alugar, bloqueio valor de venda
      vrVenda?.disable();
      vrVenda?.setValue(null);
      vrAluguel?.enable();
      break;

    // Caso o valor seja limpo ou inválido, o reset inicial (passo 2) já garante que tudo fica habilitado
  }
}
