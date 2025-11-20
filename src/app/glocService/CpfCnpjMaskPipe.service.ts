import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cpfCnpjMask' })
export class CpfCnpjMaskPipe implements PipeTransform {
 transform(
    value:  string | null | undefined,
    tipoPessoa: number | string | null | undefined
  ): string {
    if (!value) return '';

    const digits = value.replace(/\D/g, '');

    if ((tipoPessoa === 1 || tipoPessoa === '1') && digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    if ((tipoPessoa === 2 || tipoPessoa === '2') && digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return value;
}

}
