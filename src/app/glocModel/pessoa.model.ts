export interface PessoaModel{
    id?: number;
    id_tipo_pessoa_fk?: number,
    id_cargo_func_fk: number,
    id_situacao_fk: number,
    nome?: string;
    id_cpf_cnpj: number,
    orgao: string,
    dt_expedicao:  string

}
