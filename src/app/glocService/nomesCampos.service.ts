import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Disponível em toda a aplicação
})
export class NomesCamposService {

  // Dicionário Centralizado
  private readonly MAPA_NOMES: { [key: string]: string } = {
    // --- Dados Pessoais ---
    'nome': 'Nome Completo',
    'nome_social': 'Nome Social',
    'nr_cpf': 'CPF',
    'nr_cnpj': 'CNPJ',
    'rg': 'RG',
    'orgEmis': 'Órgão Emissor',
    'dt_expedicao': 'Data de Expedição',
    'rzSocial': 'Razão Social',
    'nmFantasia': 'Nome Fantasia',
    'email': 'E-mail',
    'celular': 'Celular',
    'zap': 'WhatsApp',
    'tipoCargo': 'Cargo / Função',
    'tipo': 'Tipo de Pessoa',

    // --- Endereço ---
    'endereco.cep': 'CEP',
    'endereco.logradouro': 'Logradouro (Rua/Av)',
    'endereco.numero': 'Número do Endereço',
    'endereco.complemento': 'Complemento',
    'endereco.bairro': 'Bairro',
    'endereco.municipio': 'Cidade',
    'endereco.estado': 'Estado (UF)',

    // --- Interesse ---
    'interesse.vr_imovel': 'Valor Pretendido do Imóvel',
    'interesse.vr_aluguel': 'Valor Máximo de Aluguel',
    'interesse.qt_dorms': 'Qtd. Dormitórios',
    'interesse.qt_vagas_garagem': 'Vagas de Garagem',
    'interesse.id_sit_imovel_fk': 'Situação do Imóvel',
    'interesse.id_tp_imovel_fk': 'Tipo do Imóvel',
    'interesse.objetivo_interesse': 'Objetivo',
    'interesse.estado': 'Estado de Interesse',
    'interesse.municipio': 'Cidade de Interesse',

    // --- Econômico ---
    'economico.id_origem_renda_fk': 'Origem da Renda',
    'economico.renda_comprovada': 'Renda Comprovada',
    'economico.renda_declarada': 'Renda Declarada',
    'economico.saldo_fgts': 'Saldo FGTS',
    'economico.recursos_proprios': 'Recursos Próprios'
  };

  /**
   * Retorna o nome amigável.
   * Se não encontrar, tenta formatar o nome técnico para ficar legível.
   */
  getNome(campoTecnico: string): string {
    if (this.MAPA_NOMES[campoTecnico]) {
      return this.MAPA_NOMES[campoTecnico];
    }
    return this.formatarFallback(campoTecnico);
  }

  // Fallback: transforma 'endereco.nm_rua' em 'Endereco > Nm Rua' caso você esqueça de mapear algo
  private formatarFallback(texto: string): string {
    return texto
      .replace('.', ' > ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitaliza primeira letra
  }
}
