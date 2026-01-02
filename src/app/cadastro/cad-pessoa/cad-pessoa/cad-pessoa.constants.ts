import { InteresseModel } from '../../../glocModel/interesse.model';
import { EconomicoModel } from '../../../glocModel/economico.model';
import { EnderecoModel } from '../../../glocModel/endereco.model';
import { ContatoModel } from '../../../glocModel/contato.model';
import { EmpresaModel } from '../../../glocModel/empresa.model';
import { PessoaModel } from '../../../glocModel/pessoa.model';

export const CPF_CONTROL_NAME = 'nr_cpf';
export const CNPJ_CONTROL_NAME = 'nr_cnpj';

// --- LISTA CENTRAL DE CAMPOS OPCIONAIS ---
// Se um campo estiver nesta lista e estiver vazio, o sistema
// AINDA considerará o cadastro como COMPLETO (Status 1 - Ativo).
export const EXCECOES_GERAIS = [
  // Dados Pessoais / Contato
  'email',
  'rg',
  'orgao',
  'dt_expedicao',
  'complemento',

  // Checkboxes (Booleanos nunca são "vazios", mas é bom listar para documentar)
  'piscina_adulto', 'piscina_infantil', 'churasqueira', 'salao_festa',
  'playground', 'area_pet', 'academia', 'condominio', 'imovel_mobiliado',
  'varanda', 'quintal_privativo',

  // Campos Numéricos de Interesse (Adicionados para corrigir o Status 3)
  'qt_area_total',
  'qt_area_construida',
  'qt_dorms',
  'qt_wc',
  'qt_swet',          // <--- Fundamental para seu erro anterior
  'qt_lavabo',
  'qt_vagas_garagem',
  'vr_imovel',        // Opcional pois depende do objetivo
  'vr_aluguel',       // Opcional pois depende do objetivo

  // Campos de Texto / Selects opcionais
  'objetivo_interesse',
  'obs_interesse',
  'municipio',
  'estado'
];

export const CAMPOS_PF_OBRIGATORIOS = [CPF_CONTROL_NAME, 'nome', 'nome_social'];
export const CAMPOS_PJ_OBRIGATORIOS = [CNPJ_CONTROL_NAME, 'nmFantasia', 'rzSocial'];

// --- Funções Factory (Garante objetos limpos e novos) ---

export function getInicialPessoa(): PessoaModel {
  return {
      id_tipo_pessoa_fk: undefined, // ou null, dependendo da sua interface
      id_cargo_func_fk: 0,
      id_situacao_fk: 0,
      id_cpf_cnpj: 0,
      nome: '',
      nome_social: '',
      rg: '',
      orgao: '',
      dt_expedicao: '', // O componente converterá para null antes de salvar
  };
}

export function getInicialEndereco(): EnderecoModel {
  return { id_pessoa_fk: 0, cep: '', numero: '', complemento: '' };
}

export function getInicialEmpresa(): EmpresaModel {
    return { id_pessoa_fk: 0, rz_social: '', nm_fantasia: '' };
}

export function getInicialContato(): ContatoModel {
    return { id_pessoa_fk: 0, nr_contato: '', whatsapp: false, email: '' };
}

export function getInicialInteresse(): InteresseModel {
    return {
      id_pessoa_fk: 0, id_sit_imovel_fk: 0, id_tp_imovel_fk: 0,
      vr_imovel: 0, vr_aluguel: 0,
      qt_dorms: 0, qt_wc: 0, qt_swet: 0, qt_lavabo: 0, qt_vagas_garagem: 0,
      qt_area_construida: 0, qt_area_total: 0,
      piscina_adulto: false, piscina_infantil: false, churasqueira: false,
      salao_festa: false, area_pet: false, academia: false, condominio: false,
      imovel_mobiliado: false, varanda: false, quintal_privativo: false, playground: false,
      objetivo_interesse: '', obs_interesse: '', estado: '', municipio: '',
    };
}

export function getInicialEconomico(): EconomicoModel {
    return {
        id_pessoa_fk: 0, id_origem_renda_fk: 0, renda_comprovada: 0,
        saldo_fgts: 0, recursos_proprios: 0, renda_declarada: 0,
    };
}

// --- Funções Utilitárias ---
export function gerarUltimosAnos(quantidade: number = 10): number[] {
    return Array.from({ length: quantidade }, (_, i) => new Date().getFullYear() - i);
}
