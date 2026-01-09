import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class InteresseFormService {

  /**
   * Chamado no ngOnInit.
   * Trava todos os campos (piscina, quartos, valores) até que o usuário escolha um objetivo.
   */
  bloquearTudo(interesseGroup: FormGroup): void {
    if (!interesseGroup) return;

    // Desabilita o grupo inteiro (todos os campos da lista que você passou)
    interesseGroup.disable();
  }

  /**
   * Lógica central dos botões "Comprar", "Vender", "Alugar".
   */
  definirObjetivo(interesseGroup: FormGroup, objetivo: 'Comprar' | 'Vender' | 'Alugar'): void {
    if (!interesseGroup) return;

    // 1. Primeiro, habilita TODOS os campos (quartos, áreas, checkboxes, selects, etc.)
    interesseGroup.enable();

    // 2. Define o valor do campo de controle
    interesseGroup.get('objetivo_interesse')?.setValue(objetivo);

    // 3. Pega as referências dos campos de valor
    const vrImovelControl = interesseGroup.get('vr_imovel');
    const vrAluguelControl = interesseGroup.get('vr_aluguel');

    // 4. Aplica a Regra de Negócio Específica
    if (objetivo === 'Alugar') {
      // --- CENÁRIO: ALUGUEL ---
      vrImovelControl?.setValue(null); // Limpa valor antigo
      vrImovelControl?.disable();      // Trava o campo visualmente
    } else {
      // --- CENÁRIO: COMPRAR ou VENDER ---
      vrAluguelControl?.setValue(null); // Limpa valor antigo
      vrAluguelControl?.disable();      // Trava o campo visualmente
    }
  }
}
