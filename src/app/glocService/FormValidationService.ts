import { Injectable, inject } from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { NomesCamposService } from './nomesCampos.service'; // Ajuste o caminho

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  private nomesService = inject(NomesCamposService);

  /**
   * Varre o formulário, encontra o primeiro erro e retorna a mensagem amigável.
   * Retorna null se estiver tudo válido.
   */
  getPrimeiroErro(form: FormGroup): string | null {
    if (form.valid) return null;

    // Varre os controles
    for (const key in form.controls) {
      const control = form.controls[key];

      // Ignora controles desabilitados ou válidos
      if (control.valid) continue;

      // 1. Se for um Sub-Grupo (ex: 'endereco', 'interesse')
      if (control instanceof FormGroup) {
        for (const subKey in control.controls) {
          if (control.get(subKey)?.invalid) {
            // Encontrou erro dentro do grupo
            return this.montarMensagem(`${key}.${subKey}`, control.get(subKey)?.errors);
          }
        }
      }

      // 2. Se for um Campo Simples (ex: 'nome')
      else {
        return this.montarMensagem(key, control.errors);
      }
    }

    return 'Existem erros no formulário. Verifique os campos em vermelho.';
  }

  /**
   * Monta a frase final.
   * Você pode melhorar isso verificando o tipo de erro (required, email, minlength)
   */
  private montarMensagem(campoTecnico: string, errors: ValidationErrors | null | undefined): string {
    const nomeAmigavel = this.nomesService.getNome(campoTecnico);

    // Lógica extra: Personalizar msg baseada no tipo de erro
    if (errors?.['required']) {
      return `O campo "${nomeAmigavel}" é obrigatório.`;
    }
    if (errors?.['email']) {
        return `O campo "${nomeAmigavel}" não é um e-mail válido.`;
    }
    if (errors?.['cpfInvalido']) { // Se você tiver esse validador
        return `O campo "${nomeAmigavel}" é inválido.`;
    }

    // Fallback genérico
    return `O campo "${nomeAmigavel}" está inválido ou vazio.`;
  }

  /**
   * Utilitário para focar a tela no topo e mostrar erros visuais
   */
  validarEScrollar(form: FormGroup) {
    form.markAllAsTouched(); // Faz tudo ficar vermelho
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a tela
  }
}
