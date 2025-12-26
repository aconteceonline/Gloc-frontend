import {  ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';
import { LayoutProps } from '../../../template/layout/layoutprops';
import { CepBuscaService } from '../../../services/CepBuscaService'
import {  catchError, debounceTime, of, take, throwError, } from 'rxjs';
import { BucaEnderecoModel as Endereco } from '../../../glocModel/busca-endereco.model';
import { PessoaModel } from '../../../glocModel/pessoa.model';
import { PessoaService } from '../../../glocService/pessoa.service';
import { EnderecoModel } from '../../../glocModel/endereco.model';
import { ContatoModel } from '../../../glocModel/contato.model';
import { EmpresaModel } from '../../../glocModel/empresa.model';
import { validarCPF } from '../../../validators/cpf-validator';
import { validarCNPJ } from '../../../validators/cnpj-validator';
import { ContatoService } from '../../../glocService/contato.service';
import { EnderecoService } from '../../../glocService/endereco.service';
import { EmpresaService } from '../../../glocService/empresa.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { TipoImovelModel } from '../../../glocModel/tipo-imovel.model';
import { TipoImovelService } from '../../../glocService/tipo-imovel.service';
import { SituacaoImovelService } from '../../../glocService/situacao-imovel.service';
import { SituacaoImovelModel } from '../../../glocModel/situacao-imovel.model';
import { TipoCargoModel } from '../../../glocModel/tipo-cargo.model';
import { TipoCargoService } from '../../../glocService/tipo-cargo.service';
import { InteresseModel } from '../../../glocModel/interesse.model';
import { InteresseService } from '../../../glocService/interesse.serivice';
import { EconomicoModel } from '../../../glocModel/economico.model';
import { EconomicoService } from '../../../glocService/economico.service';
import { OrigemRendaModel } from '../../../glocModel/origem-renda.model';
import { OrigemRendaService } from '../../../glocService/origem-renda.service';
import { rgValidator } from '../../../validators/rg-validator';
import { emailValidator } from '../../../validators/email-validator';



@Component({
  selector: 'app-cad-pessoa',
  standalone: false,
  templateUrl: './cad-pessoa.html',
  styleUrl: './cad-pessoa.scss'
})
export class Cadpessoa implements OnInit {

  id: any;
  public tipoAlerta: 'error' | 'success' | null = null;
  public mensagemDeErro: string | null = null;
  private readonly cpfControlName = 'nr_cpf';
  cpfValido: boolean | null = null;
  res: any | null = null
  private readonly cnpjControlName = 'nr_cnpj';
  cnpjValido: boolean | null = null;

  @Output() cadastrada = new EventEmitter<PessoaModel>()

  Pessoa: PessoaModel = {
      id_tipo_pessoa_fk: undefined,
      id_cargo_func_fk: 0,
      id_situacao_fk: 0,
      id_cpf_cnpj: 0,
      nome: '',
      rg: '',
      orgao: '',
      dt_expedicao: '',
     }

    hoje: Date = new Date();

    Endereco: EnderecoModel = {
       id_pessoa_fk: 0,
       cep: '',
       numero: '',
       complemento: '',
    }


    Empresa: EmpresaModel = {
        id_pessoa_fk: 0,
        rz_social: '',
        nm_fantasia: ''
    }

    Contato: ContatoModel = {
        id_pessoa_fk: 0,
        nr_contato: '',
        whatsapp: false,
        email: '',
    }
    Interesse: InteresseModel = {
      id_pessoa_fk: 0,
      id_sit_imovel_fk: 0,
      id_tp_imovel_fk:  0,
      vr_venda:  0,
      vr_aluguel:  0,
      qt_dorms: 0,
      qt_wc:  0,
      qt_swet:  0,
      qt_lavabo: 0,
      qt_vagas_garagem:  0,
      qt_area_construida:  0,
      qt_area_total:  0,
      piscina_adulto:  false,
      piscina_infantil: false,
      churasqueira: false,
      salao_festa: false,
      area_pet: false,
      academia: false,
      condominio: false,
      imovel_mobiliado: false,
      varanda: false,
      quintal_privativo: false,
      obs_imovel: '',

    }

    Economico: EconomicoModel = {
        id_pessoa_fk: 0,
        id_origem_renda_fk: 0,
        renda_comprovada: 0,
        saldo_fgts: 0,
        recursos_proprios: 0,
        renda_declarada: 0,

    }

  // Injetando o service
  private pessoaService = inject(PessoaService);
  private contatoService = inject(ContatoService);
  private enderecoService = inject(EnderecoService);
  private empresaService = inject(EmpresaService);
  private economicoService = inject(EconomicoService);
  private interesseService = inject(InteresseService);
  private situacaoImovelService = inject(SituacaoImovelService);
  private tipoImovelService  = inject(TipoImovelService);


  get enderecoForm(): FormGroup {
    return this.pessoaForm.get('endereco') as FormGroup;
  }

  activeTab: string = 'pessoal'; // Valor inicial
  selectedYear = signal<string>('');
  isChecked = false;
  loading: boolean = false;
  erroBusca: boolean = false;
  pessoaForm: FormGroup;
  tiposDeImovel: TipoImovelModel[] = [];
  situacaoImovel: SituacaoImovelModel[] = [];
  origemDaRenda: OrigemRendaModel[] = [];
  mostrarMensagem = true;
  props: LayoutProps = {
    titulo: 'Gerencie os seus contratos de locação em uma plataforma imobiliária completa',
    subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade'
  };
// Gera a lista dos últimos 10 anos dinamicamente
  years = signal<number[]>(
    Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
  );
  tiposCargos: TipoCargoModel[] = [];

  constructor(
         private fb: FormBuilder,
         private cepService: CepBuscaService,
         private currencyPipe: CurrencyPipe,
         private tipoCargoService: TipoCargoService,
         private origemRendaSerrvice: OrigemRendaService,

         private cdr: ChangeDetectorRef,


  ) {
    this.pessoaForm = this.fb.group(
      {
      tipo: ['PF', Validators.required],
      [this.cpfControlName]: [''], // A validação 'required' será adicionada no toggleValidation
      [this.cnpjControlName]: [''], // A validação 'required' será adicionada no toggleValidation
      rg: ['', [rgValidator()]],
      nome: ['', Validators.required],
      nmFantasia: ['', Validators.required],
      rzSocial: ['', Validators.required],
      email: ['', [emailValidator()]],

      celular: ['', Validators.required],
      zap: new FormControl(false) ,
      tipoCargo: ['', Validators.required],
     // NOVO: FormGroup para Endereço
      endereco: this.fb.group({
         cep: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\d{5}-?\d{3}$/) // aceita 8 dígitos com ou sem hífen
          ]
        ],
        logradouro: [''],
        numero: ['', Validators.required],
        complemento: [''], // Opcional
        bairro: [''],
        cidade: [''],
        uf: [''],
      }),
     // NOVO: FormGroup para interesse
      interesse: this.fb.group({

        id_tipoImovel: [null],
        id_situacaoImovel: [null],
        vr_venda: [],
        vr_aluguel: [],
        qt_dorms: [],
        qt_wc: [],
        qt_swet: [],
        qt_lavabo: [],
        qt_vagas_garagem: [],
        qt_area_total: [ , [Validators.max(10000000),Validators.pattern(/^[0-9]*$/)]],
        qt_area_construida: [],
        piscina_adulto: new FormControl(false) ,
        piscina_infantil: new FormControl(false) ,
        churasqueira: new FormControl(false) ,
        salao_festa:  new FormControl(false) ,
        playground:  new FormControl(false) ,
        area_pet:  new FormControl(false) ,
        academia:  new FormControl(false) ,
        condominio:  new FormControl(false) ,
        imovel_mobiliado:  new FormControl(false) ,
        varanda:  new FormControl(false) ,
        quintal_privativo:  new FormControl(false) ,
        obs_imovel: [''],

      }),
    // NOVO: FormGroup para economico
      economico: this.fb.group({
        id_origem_renda_fk:  [null],
        renda_comprovada: [],
        saldo_fgts: [],
        recursos_proprios: [],
        renda_declarada: [],
        selectedYear: new FormControl('')


    }),
  }),
          // Inicializa vazio
  this.pessoaForm.get('nr_cpf');
  this.pessoaForm.get('nr_cpf')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });

  }

  ngOnInit(): void {
    // Inicialização da escuta reativa (opcional, mas bom para reatividade em tempo real)
    this.carregarTiposDeImovel();
    this.carregarSituacaoImovel();
    this.setupCpfCnpjListener();
    this.carregarSituacaoImovel();
    this.carregarTiposDeCargos()
    this.carregarOrigemRenda();
    // Escuta mudanças no campo 'type' para alternar validação
    this.pessoaForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.toggleValidation(tipo);
    });
    // 2. Define o valor inicial e dispara a validação
    this.pessoaForm.get('tipo')?.setValue('PF');
    this.toggleValidation('PF');
    // Configura a validação inicial para PF
    this.toggleValidation('PF');
}


carregarTiposDeCargos(): void {
        this.tipoCargoService.getTiposCargos().subscribe({
            next: (data) => {
                // Atribui os dados recebidos da API à lista
                this.tiposCargos = data;
                this.tiposCargos.sort((a, b) => {
                const nomeA = a.ds_cargo.toUpperCase(); // Para comparação sem case-sensitive
                const nomeB = b.ds_cargo.toUpperCase();
                if (nomeA < nomeB) {
                    return -1; // 'a' vem antes de 'b'
                }
                if (nomeA > nomeB) {
                    return 1; // 'b' vem antes de 'a'
                }
                return 0; // Os nomes são iguais
                });


            },
            error: (err) => {
                console.error('Erro ao carregar tipos de cargo:', err);
            }
        });
    }

// Método para trocar de aba
  switchTab(tab: string) {
    this.activeTab = tab;
  }

 carregarTiposDeImovel(): void {
        this.tipoImovelService.getTiposImoveis().subscribe({
    next: (dados) => {
      this.tiposDeImovel = dados;
                // Atribui os dados recebidos da API à lista
                this.tiposDeImovel = dados;
                this.cdr.detectChanges();
                this.tiposDeImovel.sort((a, b) => {
                const nomeA = (a.ds_imovel ?? "").toUpperCase(); // Para comparação sem case-sensitive
                const nomeB = (b.ds_imovel ?? "").toUpperCase();

                if (nomeA < nomeB) {
                    return -1; // 'a' vem antes de 'b'
                }
                if (nomeA > nomeB) {
                    return 1; // 'b' vem antes de 'a'
                }
                return 0; // Os nomes são iguais

                });
              }

        });
    }

    carregarOrigemRenda(): void {
        this.origemRendaSerrvice.getOrigemRenda().subscribe({
            next: (data) => {
                // Atribui os dados recebidos da API à lista
                this.origemDaRenda = data;

                this.origemDaRenda.sort((a, b) => {
                const nomeA = (a.nm_origem_renda || "").toUpperCase(); // Para comparação sem case-sensitive
                const nomeB = (b.nm_origem_renda || "").toUpperCase();

                if (nomeA < nomeB) {
                    return -1; // 'a' vem antes de 'b'
                }
                if (nomeA > nomeB) {
                    return 1; // 'b' vem antes de 'a'
                }
                return 0; // Os nomes são iguais

                });
            },
            error: (err) => {
                console.error('Erro ao carregar tipo de renda:', err);
                // Lógica de tratamento de erro (ex: mostrar mensagem ao usuário)
            }
        });
    }



    carregarSituacaoImovel(): void {
        this.situacaoImovelService.getSituacaoImoveis().subscribe({
            next: (data) => {
                // Atribui os dados recebidos da API à lista
                this.situacaoImovel = data;

                this.situacaoImovel.sort((a, b) => {
                const nomeA = a.nm_situacao.toUpperCase(); // Para comparação sem case-sensitive
                const nomeB = b.nm_situacao.toUpperCase();

                if (nomeA < nomeB) {
                    return -1; // 'a' vem antes de 'b'
                }
                if (nomeA > nomeB) {
                    return 1; // 'b' vem antes de 'a'
                }
                return 0; // Os nomes são iguais

                });
            },
            error: (err) => {
                console.error('Erro ao carregar tipos de imóvel:', err);
                // Lógica de tratamento de erro (ex: mostrar mensagem ao usuário)
            }
        });
    }

    formatarValor(campo: string) {
      const control = this.pessoaForm.get(campo);
    let valor = control?.value;

    if (valor) {
      // Remove pontos de milhar e troca vírgula por ponto para o cálculo
      let valorLimpo = valor.toString().replace(/\./g, '').replace(',', '.');
      let numero = parseFloat(valorLimpo);

      if (!isNaN(numero)) {
        // Se for maior que 10 milhões, força o limite
        if (numero > 100000000) numero = 1000000000;

        // Formata para o padrão brasileiro visual: 10.000.000,00
        const formatado = numero.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });

      control?.setValue(formatado, { emitEvent: false });

    }
  }
}


// Opcional: Configura a escuta reativa com debounce para não sobrecarregar o backend
  setupCpfCnpjListener() {
    this.pessoaForm.get(this.cpfControlName)?.valueChanges
      .pipe(
        debounceTime(500), // Espera 500ms antes de reagir
        // Usaria switchMap se quisesse buscar a cada tecla, mas vamos usar o blur
      )
  }

  // 3. NOVO MÉTODO: Chamado ao SAIR do campo (evento blur)
  onCpfBlur() {
    const value = this.pessoaForm.get('nr_cpf')?.value;
    this.cpfValido = validarCPF(value);
    if(!this.cpfValido){
         this.tipoAlerta = 'error'
         this.pessoaForm.get(this.cpfControlName)?.setErrors({ 'invalido': true });
    }
    this.mensagemDeErro = null; // Limpa o erro anterior
    this.tipoAlerta = null;
    const control = this.pessoaForm.get(this.cpfControlName);

// --- NOVO: Limpeza do Valor ---
    const rawValue = control?.value || '';
    // Remove pontos, traços, espaços e outros caracteres não numéricos
    const cleanedValue = rawValue.replace(/\D/g, '');

    // Se você usa uma máscara de CPF/CNPJ, é crucial atualizar o valor
    // do controle para o valor limpo, para que o validador funcione corretamente.
    if (rawValue !== cleanedValue) {
         control?.setValue(cleanedValue, { emitEvent: false }); // Atualiza o controle sem disparar o valueChanges
    }

   const cpf = control?.value;

   if (cpf) {
      this.verificarCpfExistente(cpf);
   }
  }


  // 4. Lógica de Busca no Backend
verificarCpfExistente(cpf: string) {
  this.pessoaService.readByCPF(cpf).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 404) {
        // CPF não cadastrado — não exibe erro, apenas continua
        return of(null); // continua o fluxo com valor nulo
      }
      // Outros erros — trata como erro real
      this.tipoAlerta = 'error';
      this.mensagemDeErro = 'Erro de servidor ao verificar CPF.';
      return throwError(() => error);
    })
  ).subscribe((response: PessoaModel | null) => {
    if (response) {
      // CPF já cadastrado — exibe alerta e marca erro no campo
      this.tipoAlerta = 'error';
      this.mensagemDeErro = `Já existe cadastro com esse CPF ${cpf}`;
      this.pessoaForm.get(this.cpfControlName)?.setErrors({ 'jaExiste': true });
    } else {
      // CPF não cadastrado — segue o fluxo normalmente, sem alertas
      this.pessoaForm.get(this.cpfControlName)?.valid;
    }
  });
}



  onCnpjBlur() {
    const value = this.pessoaForm.get('nr_cnpj')?.value;
    this.cnpjValido = validarCNPJ(value);
    if(!this.cnpjValido){
         this.tipoAlerta = 'error'
         this.pessoaForm.get(this.cnpjControlName)?.setErrors({ 'invalido': true });
    }
    this.mensagemDeErro = null; // Limpa o erro anterior
    this.tipoAlerta = null;
    const control = this.pessoaForm.get(this.cnpjControlName);

// --- NOVO: Limpeza do Valor ---
    const rawValue = control?.value || '';
    // Remove pontos, traços, espaços e outros caracteres não numéricos
    const cleanedValue = rawValue.replace(/\D/g, '');

    // Se você usa uma máscara de CPF/CNPJ, é crucial atualizar o valor
    // do controle para o valor limpo, para que o validador funcione corretamente.
    if (rawValue !== cleanedValue) {
         control?.setValue(cleanedValue, { emitEvent: false }); // Atualiza o controle sem disparar o valueChanges
    }


   /* if (control?.invalid) {
      // Trata erros de validação local (ex: campo vazio)
      this.tipoAlerta = 'error';
      this.mensagemDeErro = 'CPF inválido ou incompleto.';
      return;
    }*/

    const cnpj = control?.value;

    if (cnpj) {
      this.verificarCnpjExistente(cnpj);
    }
  }


  // 4. Lógica de Busca no Backend
  verificarCnpjExistente(cnpj: string) {
    this.pessoaService.readByCNPJ(cnpj).subscribe({
      next: (response: any) => {
        // Assumindo que um retorno de sucesso significa que o cadastro EXISTE
        this.tipoAlerta = 'error';
        this.mensagemDeErro = `Já existe cadastro com esse CPF ${cnpj}`;

        // (Opcional) Força uma marcação de erro no FormControl
        this.pessoaForm.get(this.cpfControlName)?.setErrors({ 'jaExiste': true });
      },
   /*   error: (error) => {
        // Se o erro for um 404 (Not Found), significa que está DISPONÍVEL
        if (error.status === 404) {
          this.tipoAlerta = 'success';
    //      this.mensagemDeErro = `CPF ${cpf} está disponível para cadastro.`;
      //    this.continuaCadastro();
        } else {
          // Trata outros erros de servidor (500)
          this.tipoAlerta = 'error';
          this.mensagemDeErro = 'Erro de servidor ao verificar CPF.';
        }
      },*/
    });
  }


 // Função disparada ao perder o foco (onBlur)
  buscarCep() {
    this.erroBusca = false;
    const cepControl = this.enderecoForm.get('cep');
    // Valida se o campo CEP está preenchido e é válido
    if (cepControl && cepControl.valid) {
      this.loading = true;
      const cepValue = cepControl.value;
      this.cepService.buscarEndereco(cepValue).pipe(
        take(1) // Pega apenas a primeira emissão e finaliza
      ).subscribe({
        next: (endereco: Endereco) => {
         this.loading = true;
          if (endereco.erro) {
            this.erroBusca = true;
            this.limparCamposEndereco();
          } else {
            // Atualiza os campos do formulário (apenas os do endereço)
            this.enderecoForm.patchValue({
              logradouro: endereco.logradouro,
              bairro: endereco.bairro,
              cidade: endereco.localidade,
              uf: endereco.uf,
            });

            // Opcional: focar no campo número após o preenchimento
            document.getElementById('numero')?.focus();
          }
        },
        error: () => {
          this.loading = false;
          this.erroBusca = true;
          this.limparCamposEndereco();
        }
      });
    } else if (cepControl && cepControl.dirty) {
      this.limparCamposEndereco();
    }
  }

  limparCamposEndereco() {
    this.enderecoForm.patchValue({
      logradouro: '',
      bairro: '',
      localidade: '',
      uf: ''
    });
  }

 // NOVO: Getter para o FormGroup Endereço (facilita o uso no template)
/*  get enderecoGroup(): FormGroup {
    return this.pessoaForm.get('endereco') as FormGroup;
  }

    get interesseGroup(): FormGroup {
    return this.pessoaForm.get('interesse') as FormGroup;
  }

*/


 toggleValidation(tipo: string): void {
    const cpfControl = this.pessoaForm.get('nr_cpf');
    const nomeControl = this.pessoaForm.get('nome');
    const cnpjControl = this.pessoaForm.get('nr_cnpj');
    const razaoSocialControl = this.pessoaForm.get('rzSocial');
    const nomeFantasiaControl = this.pessoaForm.get('nmFantasia');

    if (tipo === 'PF') {
      // Habilita validação PF
      nomeControl?.setValidators([Validators.required]);

      // Desabilita validação PJ
      cnpjControl?.setValidators(null);
      razaoSocialControl?.setValidators(null);
      nomeFantasiaControl?.setValidators(null);

    } else { // PJ
      // Habilita validação PJ
      razaoSocialControl?.setValidators([Validators.required]);
      nomeFantasiaControl?.setValidators([Validators.required]);

      // Desabilita validação PF
      cpfControl?.setValidators(null);
      nomeControl?.setValidators(null);
    }

    // Atualiza o estado dos controles
    cpfControl?.updateValueAndValidity();
    nomeControl?.updateValueAndValidity();
    cnpjControl?.updateValueAndValidity();
    razaoSocialControl?.updateValueAndValidity();
    nomeFantasiaControl?.updateValueAndValidity();
  }


  // Helper para verificar se o campo está inválido e foi tocado/modificado
  isInvalid(controlName: string, groupName: string = '', ): boolean {
     let control;
    if (groupName) {
      control = this.pessoaForm.get(groupName)?.get(controlName);
    } else {
      control = this.pessoaForm.get(controlName);
    }
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Getter para saber o tipo de pessoa selecionado
  get isPessoaFisica(): boolean {
    return this.pessoaForm.get('tipo')?.value === 'PF';
  }

 onSubmit() {
    if (this.pessoaForm.valid) {
/*
*  pessoaModel
*/
      this.Pessoa.id_cargo_func_fk = this.pessoaForm.value.tipoCargo
      this.Pessoa.id_situacao_fk = 1
      this.Pessoa.nome = this.pessoaForm.value.nome;
      if ( this.pessoaForm.value.tipo == 'PF') {
           this.Pessoa.id_tipo_pessoa_fk = 1;
           this.Pessoa.id_cpf_cnpj = this.pessoaForm.value.nr_cpf;
        } else{
            this.Pessoa.id_tipo_pessoa_fk = 2;
            this.Pessoa.id_cpf_cnpj = this.pessoaForm.value.nr_cpf;
      }
      this.Pessoa.rg = this.pessoaForm.value.rg;
      this.Pessoa.orgao = this.pessoaForm.value.orgEmis;
      this.Pessoa.dt_expedicao = null
      console.log(" pessoa  ==== ", this.pessoaForm.value )
      console.log(" pessoa  ==== ", this.Pessoa )
      this.continuaCadastro()
  }
 }

  continuaCadastro() {
       this.cadastraPessoa();
 }

/*----------------------------------------------
*  Cadastro Pessoa
*-----------------------------------------------
*/
 cadastraPessoa(){
   this.pessoaService.cadastrarPessoa(this.Pessoa).subscribe({
          next: (response) => {
               this.id = response.id;
          },

      complete: () => {
        this.cadastaContato()
        this.cadastraEndereco();
        if(this.Pessoa.id_tipo_pessoa_fk == 2 ){
            this.cadastrarEmpresa();
        }
        this.cadastraInteresse();
        this.cadastraEconomico();

     }
    });

 };
/*----------------------------------------------
*  Cadastro Contato
*-----------------------------------------------
*/
 cadastaContato(){

      this.Contato.id_pessoa_fk = this.id
      this.Contato.nr_contato = this.pessoaForm.value.celular;
      this.Contato.whatsapp = this.pessoaForm.value.zap;
      this.contatoService.cadastrarContato(this.Contato).subscribe();

 };
/*----------------------------------------------
*  Cadastro Endereco
*-----------------------------------------------
*/
cadastraEndereco(){
      this.Endereco.id_pessoa_fk = this.id
      this.Endereco.cep = this.pessoaForm.value.endereco.cep;
      this.Endereco.numero =  this.pessoaForm.value.endereco.numero;
      this.Endereco.complemento = this.pessoaForm.value.endereco.complemento;
      this.enderecoService.cadastrarEndereco(this.Endereco).subscribe();
};


/*----------------------------------------------
*  Cadastro Interesse
*-----------------------------------------------
*/
cadastraInteresse(){
   const form = this.pessoaForm.value.interesse;

 //      console.log( "his.pessoaForm.value.interesse    == ", this.pessoaForm.value.interesse )
    // Criando um novo objeto para garantir a limpeza dos dados
    this.Interesse = {
        ...this.Interesse,
        id_pessoa_fk: this.id,

        id_sit_imovel_fk: form.id_situacaoImovel,

        id_tp_imovel_fk: form.id_tipoImovel,

        // Tratamento de Moeda (se houver)
        vr_venda: this.limparMoeda(form.vr_venda),
        vr_aluguel: this.limparMoeda(form.vr_aluguel),

        // Garantindo valores para os booleanos (evita undefined no banco)

        piscina_adulto: !!form.piscina_adulto,
        piscina_infantil: !!form.piscina_infantil,
        qt_dorms: form.qt_dorms,
        qt_wc: form.qt_wc,
        qt_swet: form.qt_swet,
        qt_lavabo: form.qt_lavabo,
        qt_vagas_garagem: form.qt_vagas_garagem,
        qt_area_construida: form.qt_area_construida,
        qt_area_total: form.qt_area_total,
        churasqueira: !!form.churasqueira,
        imovel_mobiliado: !!form.imovel_mobiliado,
        salao_festa: !!form.salao_festa,
        playground: !!form.playground,
        area_pet: !!form.area_pet,
        academia: !!form.academia,
        condominio: !!form.condominio,
        varanda: !!form.varanda,
        quintal_privativo: !!form.quintal_privativo,
        obs_imovel: form.obs_imovel,

    };
    this.interesseService.cadastrarInteresse(this.Interesse).subscribe()

}
/*----------------------------------------------
*  Cadastro Economico
*-----------------------------------------------
*/
cadastraEconomico(){
     const formValues = this.pessoaForm.value.economico;

      this.Economico = {
        ...this.Economico,
      id_pessoa_fk: this.id,
      id_origem_renda_fk: formValues.id_origem_renda_fk,
      renda_comprovada: this.limparMoeda(formValues.renda_comprovada),
      saldo_fgts:       this.limparMoeda(formValues.saldo_fgts),
      recursos_proprios: this.limparMoeda(formValues.recursos_proprios),
      renda_declarada:  this.limparMoeda(formValues.renda_declarada)
      };
      console.log (" formValues = ", formValues )
      this.economicoService.cadastrarEconomico(this.Economico).subscribe({
      complete: () => {
          this.pessoaForm.reset();
           alert('Cadastro de realizado com sucesso!');

     }
    });
};

limparMoeda(valor: any): number {
  if (typeof valor !== 'string') return valor;

  const valorLimpo = valor
    .replace('R$', '')      // Remove o símbolo
    .replace(/\./g, '')     // Remove o ponto de milhar
    .replace(',', '.')      // Troca a vírgula decimal por ponto
    .trim();

  return parseFloat(valorLimpo) || 0;
}

/*----------------------------------------------
*  Cadastro Empresa
*-----------------------------------------------
*/
 cadastrarEmpresa(){
      this.Empresa.id_pessoa_fk = this.id
      this.Empresa.nm_fantasia = this.pessoaForm.value.nmFantasia;
      this.Empresa.rz_social = this.pessoaForm.value.rzSocial;
      this.empresaService.cadastrarEmpresa(this.Empresa).subscribe()
  };
};

