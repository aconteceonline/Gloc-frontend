import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function rgValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // Se estiver vazio, não valida (use Validators.required se precisar)

    // Regex para RG: Aceita pontos/traços opcionais e o dígito X no final
    const rgRegex = /^(\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx]|\d{7,9}[0-9Xx])$/;

    const valid = rgRegex.test(value);
    return valid ? null : { rgInvalido: true };
  };
}
