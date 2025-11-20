export interface BucaEnderecoModel {
  cep: string;
  logradouro: string;

  bairro: string;
  localidade: string; // Cidade
  uf: string;         // Estado
  ibge: string;
  erro?: boolean;
}
