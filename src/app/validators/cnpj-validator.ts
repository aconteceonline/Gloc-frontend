// cnpj.util.ts
export function validarCNPJ(cnpjRaw: string): boolean {
  if (!cnpjRaw) return false;

  // Remove tudo que não é dígito
  const cnpj = cnpjRaw.replace(/\D/g, '');

  // Precisa ter 14 dígitos
  if (cnpj.length !== 14) return false;

  // Rejeita sequências repetidas (ex.: 00... ou 11...)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (base: string, multipliers: number[]): number => {
    const sum = base
      .split('')
      .reduce((acc, digit, i) => acc + Number(digit) * multipliers[i], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  // Primeiro dígito
  const m1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calcDigit(cnpj.slice(0, 12), m1);

  // Segundo dígito
  const m2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d2 = calcDigit(cnpj.slice(0, 12) + String(d1), m2);

  return cnpj.endsWith(`${d1}${d2}`);
}
