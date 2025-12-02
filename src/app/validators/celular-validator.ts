import { FormControl } from "@angular/forms";

// Validador de celular
export function validarCelular(control: FormControl): { [key: string]: boolean } | null {
   const value = control.value;

  if (!value) return null;
    const cleaned = value.replace(/\D/g, '');

    console.log('Celular digitado:', value);
  console.log('Apenas números:', cleaned);
  console.log('Tamanho:', cleaned.length);

  // ✅ ERRO se tiver QUALQUER valor mas não for 11 dígitos
  if (cleaned.length > 0 && cleaned.length !== 11) {
    console.log('celularInvalido ',  cleaned.length)
    return { 'celularInvalido': true };
  }

  // Se chegou a 11 dígitos, valida formato
  if (cleaned.length === 11) {
    // Verifica DDD válido (11-99)
    const ddd = parseInt(cleaned.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      return { 'celularInvalido': true };
    }

    // Verifica se o 3º dígito é 9 (celular)
    if (cleaned.charAt(2) !== '9') {
      return { 'celularInvalido': true };
    }
  }

  return null;
}
