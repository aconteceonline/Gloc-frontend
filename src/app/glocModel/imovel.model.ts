export interface FotoModel {
  id?: string;
  nome?: string;
  tipo?: string;
  url?: string; // Data URL para preview
  tamanho?: number;
}

export interface ImovelModel {
  id?: string;
  id_pessoa_fk?: number;
  id_tipo_imovel_fk?: number;
  id_endereco_fk?: number;
  titulo?: string;
  descricao?: string;
  preco?: number;
  dorms?: number;
  banheiro?: number;
  area?: number; // m²
  vlr_venda?: number;
  vlr_aluguel?: number;
  fotos?: FotoModel[];
}
