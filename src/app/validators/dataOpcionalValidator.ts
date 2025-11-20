import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dataOpcionalValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;

  // Se não tem valor → válido (campo opcional)
  if (!valor) {
    return null;
  }

  // Se tem valor → precisa ser uma data válida no formato aceito pelo input
  const data = new Date(valor);
  const valido = !isNaN(data.getTime());


   if (isNaN(data.getTime())) {
    return { dataInvalida: true };
  }
   const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // zera horas para comparar só a data

  // Se a data for igual ou maior que hoje → inválida
  if (data >= hoje) {
    return { dataFutura: true };
  }

  return valido ? null : { dataInvalida: true };
}
