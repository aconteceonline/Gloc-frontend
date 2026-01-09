import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CPF_CONTROL_NAME } from './editar-pessoa-pf.constants'
import { rgValidator } from '../../../validators/rg-validator';
import { emailValidator } from '../../../validators/email-validator';



export function editarFormularioPessoaPF(fb: FormBuilder) {
  return fb.group({
    tipo: ['PF', Validators.required],
    [CPF_CONTROL_NAME]: [''], // Usando a constante
    rg: ['', [rgValidator()]],
    nome: ['', Validators.required],
    nome_social: ['', Validators.required],
    email: ['', [emailValidator()]],
    celular: ['', Validators.required],
    zap: [false],
    tipoCargo: ['', Validators.required],

    // Grupo Endereço
    endereco: fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      logradouro: [''],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      uf: [''],
    }),

    // Grupo Interesse
    interesse: fb.group({
      id_tp_imovel_fk: [null],
      id_sit_imovel_fk: [null],
      vr_imovel: [],
      vr_aluguel: [],
      qt_dorms: [],
      qt_wc: [],
      qt_swet: [],
      qt_lavabo: [],
      qt_vagas_garagem: [],
      qt_area_total: [, [Validators.max(10000000), Validators.pattern(/^[0-9]*$/)]],
      qt_area_construida: [],
      piscina_adulto: [false],
      piscina_infantil: [false],
      churasqueira: [false],
      salao_festa: [false],
      playground: [false],
      area_pet: [false],
      academia: [false],
      condominio: [false],
      imovel_mobiliado: [false],
      varanda: [false],
      quintal_privativo: [false],
      objetivo_interesse: [''],
      obs_interesse: [''],
      estado: [''],
      municipio: ['']
    }),

    // Grupo Econômico
    economico: fb.group({
      id_origem_renda_fk: [null],
      renda_comprovada: [],
      saldo_fgts: [],
      recursos_proprios: [],
      renda_declarada: [],
      selectedYear: ['']
    }),
  });
}
