import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // Se estiver vazio, não valida (use Validators.required se precisar)

    // Regex para RG: Aceita pontos/traços opcionais e o dígito X no final
    const rgRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;

    const valid = rgRegex.test(value);
    return valid ? null : { emailInvalido: true };
  };
}
