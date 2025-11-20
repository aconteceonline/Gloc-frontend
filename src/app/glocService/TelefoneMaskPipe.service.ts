import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'telefoneMask' })
export class TelefoneMaskPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');

    if (digits.length === 11) {
      // Celular com 9 dígitos
      return digits.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    } else if (digits.length === 10) {
      // Telefone fixo
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return value;
  }
}
