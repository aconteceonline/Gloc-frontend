export interface InteresseModel{
    id?: number;
    id_pessoa_fk?: number | null;
    id_sit_imovel_fk?: number | null;
    id_tp_imovel_fk?: number | null;
    vr_venda?: number | null;
    vr_aluguel?: number | null;
    qt_dorms?: number | null;
    qt_wc?: number | null;
    qt_swet?: number | null;
    qt_lavabo?: number | null;
    qt_vagas_garagem?: number | null;
    qt_area_construida?: number | null;
    qt_area_total?: number | null;
    piscina_adulto?: boolean,
    piscina_infantil?: boolean,
    churasqueira?: boolean,
    salao_festa?: boolean,
    playground?: boolean,
    area_pet?: boolean,
    academia?: boolean,
    condominio?: boolean,
    varanda?: boolean,
    imovel_mobiliado: boolean,
    quintal_privativo?: boolean,
    obs_imovel: string,

}
