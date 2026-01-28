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
  contato_imovel: string;
  nome_contato_imovel: string;
  principal_local_interesse: string;
  id_tipo_imovel_fk?: number;
  id_endereco_fk?: number;
  titulo_imovel?: string;
  vlr_venda?: number;
  vlr_aluguel?: number;
  qtde_dorms?: number;
  qtde_wc?: number;
  area_construida?: number;
  qtde_swet?: number;
  qtde_vaga?: number;
  varanda?: string;
  quintal?: string;
  mobiliado?: string;
  condominio?: string;
  piscina_adulto?: string;
  piscina_infantil?: string;
  churasqueira?: string;
  salao_festas?: string;
  playground?: string;
  area_pet?: string;
  academia?: string;
  fotos?: FotoModel[];
}
