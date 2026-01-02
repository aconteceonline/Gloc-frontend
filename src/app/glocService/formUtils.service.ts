import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormUtilsService {

  /**
   * Verifica recursivamente se todos os campos de um formulário estão preenchidos,
   * ignorando os campos listados nas exceções.
   * * @param control O FormGroup ou FormControl a ser verificado
   * @param excecoes Lista de chaves (nomes dos campos) que podem ficar vazios
   */
  isFormularioCompletamentePreenchido(control: AbstractControl, excecoes: string[] = []): boolean {

    // Se for um FormGroup, varre seus filhos
    if (control instanceof FormGroup) {
      for (const key in control.controls) {
        // Se a chave atual estiver nas exceções, ignora e continua
        if (excecoes.includes(key)) {
          continue;
        }

        const childControl = control.get(key);
        // Chamada recursiva para verificar o filho
        if (childControl && !this.isFormularioCompletamentePreenchido(childControl, excecoes)) {
          return false;
        }
      }
      // Se passou por todos os filhos sem retornar false, o grupo está ok
      return true;
    }

    // Se for um FormControl (campo simples)
    else {
      const valor = control.value;
      return this.valorEhValido(valor);
    }
  }

  /**
   * Helper para definir o que é considerado "preenchido"
   */
  private valorEhValido(valor: any): boolean {
    // Casos que são considerados VAZIOS:
    if (valor === null || valor === undefined) return false;
    if (typeof valor === 'string' && valor.trim() === '') return false;
    if (Array.isArray(valor) && valor.length === 0) return false;

    // Casos considerados PREENCHIDOS:
    // 0 (zero), false (booleano), strings preenchidas, objetos, etc.
    return true;
  }
}
