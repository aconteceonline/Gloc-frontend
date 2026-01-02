import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, debounceTime, of, take, throwError, } from 'rxjs';
import { LayoutProps } from '../../../template/layout/layoutprops';
import { validarCPF } from '../../../validators/cpf-validator';
import { validarCNPJ } from '../../../validators/cnpj-validator';

import { criarFormularioPessoa } from '../cad-pessoa/criarFormularioPessoa';
//import { CurrencyPipe } from '@angular/common';
import { TipoImovelModel } from '../../../glocModel/tipo-imovel.model';
import { SituacaoImovelModel } from '../../../glocModel/situacao-imovel.model';
import { TipoCargoModel } from '../../../glocModel/tipo-cargo.model';
import { OrigemRendaModel } from '../../../glocModel/origem-renda.model';
import { PessoaModel } from '../../../glocModel/pessoa.model';
import { BucaEnderecoModel as Endereco } from '../../../glocModel/busca-endereco.model';
import { TipoImovelService } from '../../../glocService/tipo-imovel.service';
import { SituacaoImovelService } from '../../../glocService/situacao-imovel.service';
import { TipoCargoService } from '../../../glocService/tipo-cargo.service';
import { InteresseService } from '../../../glocService/interesse.serivice';
import { EconomicoService } from '../../../glocService/economico.service';
import { OrigemRendaService } from '../../../glocService/origem-renda.service';
import { ContatoService } from '../../../glocService/contato.service';
import { EnderecoService } from '../../../glocService/endereco.service';
import { EmpresaService } from '../../../glocService/empresa.service';
import { PessoaService } from '../../../glocService/pessoa.service';
import { CepBuscaService } from '../../../services/CepBuscaService'
import { FormUtilsService } from '../../../glocService/formUtils.service';
import { IbgeService } from '../../../glocService/Ibge.service';
import { FormValidationService } from '../../../glocService/FormValidationService';

import { aplicarRegraObjetivoInteresse} from './cad-pessoa.logic';

import {
  getInicialPessoa, getInicialEndereco, getInicialEmpresa,
  getInicialContato, getInicialInteresse, getInicialEconomico,
  EXCECOES_GERAIS, CAMPOS_PF_OBRIGATORIOS, CAMPOS_PJ_OBRIGATORIOS,
  CPF_CONTROL_NAME, CNPJ_CONTROL_NAME, gerarUltimosAnos,
} from '../cad-pessoa/cad-pessoa.constants';
import { InteresseFormService } from '../../../glocService/interesse-form.service';
import { ViewportScroller } from '@angular/common';


@Component({
  selector: 'app-cad-pessoa',
  standalone: false,
  templateUrl: './cad-pessoa.html',
  styleUrl: './cad-pessoa.scss'
})
export class Cadpessoa implements OnInit {
// 1. Injeção de dependências moderna (sem construtor)
  private fb = inject(FormBuilder);
  private pessoaService = inject(PessoaService);
  private contatoService = inject(ContatoService);
  private enderecoService = inject(EnderecoService);
  private empresaService = inject(EmpresaService);
  private economicoService = inject(EconomicoService);
  private interesseService = inject(InteresseService);
  private ibgeService = inject(IbgeService);
  private formUtils  = inject (FormUtilsService);
  private origemRendaSerrvice = inject (OrigemRendaService);
  private cepService = inject (CepBuscaService)
  private tipoCargoService = inject (TipoCargoService)
  private situacaoImovelService = inject (SituacaoImovelService)
  private tipoImovelService = inject (TipoImovelService);
  private formValidationService = inject (FormValidationService);
  private interesseFormService = inject(InteresseFormService);
  private viewportScroller  = inject(ViewportScroller);


// 2. Inicialização do Formulário
  pessoaForm: FormGroup = criarFormularioPessoa(this.fb);

// Variáveis de Controle / UI
  id: any;
  public tipoAlerta: 'error' | 'success' | null = null;
  public mensagemDeErro: string | null = null;
  //res: any | null = null
  msgErroCabecalho: string | null = null;

// Constantes expostas para o Template
readonly cpfControlName = CPF_CONTROL_NAME;
  readonly cnpjControlName = CNPJ_CONTROL_NAME;
  readonly EXCECOES_GERAIS = EXCECOES_GERAIS;
  readonly CAMPOS_PF_OBRIGATORIOS = CAMPOS_PF_OBRIGATORIOS;
  readonly CAMPOS_PJ_OBRIGATORIOS = CAMPOS_PJ_OBRIGATORIOS;


  // Controle de Validação Local
  cpfValido: boolean | null = null;
  cnpjValido: boolean | null = null;
  isSubmitting: boolean = false;

// Modelos de Dados (Inicializados via Função)
  Pessoa = getInicialPessoa();
  Endereco = getInicialEndereco();
  Empresa = getInicialEmpresa();
  Contato = getInicialContato();
  Interesse = getInicialInteresse();
  Economico = getInicialEconomico()


// Signals e Estado
 activeTab: string = 'pessoal'; // Valor inicial
 selectedYear = signal<string>('');
 years = signal<number[]>(gerarUltimosAnos(10)); // Usando a função utilitária

// Listas de Dados
  //hoje: Date = new Date();
  tiposCargos: TipoCargoModel[] = [];
  tiposDeImovel: TipoImovelModel[] = [];
  situacaoImovel: SituacaoImovelModel[] = [];
  origemDaRenda: OrigemRendaModel[] = [];
  estados: any[] = [];
  municipios: any[] = [];

// Saídasa
  @Output() cadastrada = new EventEmitter<PessoaModel>()

  // isChecked = false;
 //Usadp ma busca do cep
  loading: boolean = false;
  erroBusca: boolean = false;
 // pessoaForm: FormGroup;
 // mostrarMensagem = true;

// Getters
  get enderecoForm(): FormGroup { return this.pessoaForm.get('endereco') as FormGroup; }
  get isPessoaFisica(): boolean { return this.pessoaForm.get('tipo')?.value === 'PF'; }

// Props visuais
  props: LayoutProps = {
    titulo: 'Gerencie os seus contratos de locação em uma plataforma imobiliária completa',
    subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade'
  };
// ==================================================================================
// CICLO DE VIDA
// ==================================================================================
  ngOnInit(): void {
      this.carregarDadosIniciais();
      this.inicializarEstadoFormulario();
      // --- LISTENERS SEGUROS ---
      this.setupCpfCnpjListener();
      this.setupMudancaTipoPessoa();
      this.monitorarPreenchimento();
      this.iniciarListenerEstadoSeguro(); // Mantém só este que popula o combo
    //inibi acesso compos da aba interesse
      this.bloqueiaCampoInteresses();
  }

// ==================================================================================
// 1. CARREGAMENTO DE DADOS (Loaders)
// ==================================================================================
  private carregarDadosIniciais(): void {
    this.carregarTiposDeImovel();
    this.carregarSituacaoImovel();
    this.carregarTiposDeCargos();
    this.carregarOrigemRenda();
    this.carregarEstados();
  }
  carregarTiposDeImovel(): void {
    this.tipoImovelService.getTiposImoveis().subscribe({
      next: (dados) => {
        this.tiposDeImovel = dados;
                  // Atribui os dados recebidos da API à lista
                  this.tiposDeImovel = dados;

                  this.tiposDeImovel.sort((a, b) => {
                      const nomeA = (a.ds_imovel || "").toUpperCase(); // Para comparação sem case-sensitive
                      const nomeB = (b.ds_imovel || "").toUpperCase();
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
  carregarSituacaoImovel(): void {
        this.situacaoImovelService.getSituacaoImoveis().subscribe({
            next: (data) => {
                // Atribui os dados recebidos da API à lista
                this.situacaoImovel = data;

                this.situacaoImovel.sort((a, b) => {
                const nomeA = (a.nm_situacao || "").toUpperCase(); // Para comparação sem case-sensitive
                const nomeB = (b.nm_situacao || "").toUpperCase();

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
  private carregarEstados() {
     this.ibgeService.getEstados().subscribe({
      next: (dados) => this.estados = dados,
      error: (err) => console.error('Erro ao carregar estados', err)
    });
  }
  private setupMudancaTipoPessoa() {
    this.pessoaForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.toggleValidation(tipo);
    });
  }
 // 2. O método específico volta a existir separadamente
  carregarMunicipios(siglaUF: string) {
    this.municipios = []; // Limpa anterior

  // Chama seu serviço do IBGE
  this.ibgeService.getMunicipios(siglaUF).subscribe({
    next: (cidades) => {
      this.municipios = cidades;
      // Opcional: Ordenar alfabeticamente
      this.municipios.sort((a, b) => a.nome.localeCompare(b.nome));
    },
    error: (err) => console.error('Erro ao carregar municípios', err)
  });
}
  /**--------------------------------------------------------------------------
  * Monitora as mudanças e decide se o status vai para Ativo(1) ou Pendente(3)
  *----------------------------------------------------------------------------
  */
  monitorarPreenchimento() {
    this.pessoaForm.valueChanges.subscribe(valores => {

      // Começamos com a lista básica de exceções (email, rg, piscina...)
      const excecoesAtuais = [...this.EXCECOES_GERAIS];

      // LÓGICA DE DECISÃO (PF vs PJ)
      // Baseado no campo 'tipo'
      if (valores.tipo === 'PF') {
        // Se é PF:
        // 1. Ignoramos os campos de PJ (adiciona na lista de exceções)
        excecoesAtuais.push(...this.CAMPOS_PJ_OBRIGATORIOS);
        // 2. Os campos de PF (CPF, Nome, Nome Social) NÃO entram na exceção,
        //    então o Service vai obrigar que eles estejam preenchidos.
      } else {
        // Se é PJ:
        // 1. Ignoramos os campos de PF (adiciona na lista de exceções)
        excecoesAtuais.push(...this.CAMPOS_PF_OBRIGATORIOS);
        // 2. Os campos de PJ (CNPJ, Fantasia, RzSocial) NÃO entram na exceção.
      }

      // CHAMA O SERVICE
      const estaCompleto = this.formUtils.isFormularioCompletamentePreenchido(
        this.pessoaForm,
        excecoesAtuais
      );

      // ATUALIZA O STATUS
      this.atualizarStatusSituacao(estaCompleto);
    });
  }

  atualizarStatusSituacao(isCompleto: boolean) {
    const ID_ATIVO = 1;     // Ajuste conforme seu banco
    const ID_PENDENTE = 3;  // Ajuste conforme seu banco

    const novoStatus = isCompleto ? ID_ATIVO : ID_PENDENTE;
    const campoStatus = this.pessoaForm.get('id_situacao_fk');

    // Verifica se precisa atualizar para evitar loops ou chamadas desnecessárias
    if (campoStatus && campoStatus.value !== novoStatus) {
      campoStatus.setValue(novoStatus, { emitEvent: false });

      console.log(`Status alterado para: ${isCompleto ? 'ATIVO (Completo)' : 'PENDENTE (Faltam dados)'}`);

      // Opcional: Debug para ver o que falta
      if (!isCompleto) {
        // console.log('Exceções atuais:', excecoesAtuais); // Precisa mover excecoesAtuais para escopo se quiser logar aqui
      }
    }
  }
// ==================================================================================
// 3. ESTADO INICIAL
// ==================================================================================
  private inicializarEstadoFormulario(): void {
    this.pessoaForm.get('tipo')?.setValue('PF');
    this.toggleValidation('PF');
    this.atualizarValidacaoInicial();
  }

  atualizarValidacaoInicial() {
    const cpfControl = this.pessoaForm.get(CPF_CONTROL_NAME);
    cpfControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }
// ==================================================================================
// 4. LÓGICA DE UI E EVENTOS (Handlers)
// ==================================================================================
switchTab(tabName: string) {
  this.activeTab = tabName;

  // Aguarda um ciclo rápido do Angular para garantir que a aba trocou
  setTimeout(() => {
    const el = document.getElementById('inicio-abas');

    if (el) {
      // Faz a rolagem suave até esse elemento específico
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 50); // O timeout de 50ms ajuda se a troca de aba for pesada
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
  toggleValidation(tipo: string): void {
      const cpfControl = this.pessoaForm.get('nr_cpf');
      const nomeControl = this.pessoaForm.get('nome');
      const nome_socialControl = this.pessoaForm.get('nome_social');
      const cnpjControl = this.pessoaForm.get('nr_cnpj');
      const razaoSocialControl = this.pessoaForm.get('rzSocial');
      const nomeFantasiaControl = this.pessoaForm.get('nmFantasia');
      if (tipo === 'PF') {
        // Habilita validação PF
        nomeControl?.setValidators([Validators.required]);
        nome_socialControl?.setValidators([Validators.required]);
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
        nome_socialControl?.setAsyncValidators(null);
      }
      cpfControl?.updateValueAndValidity();
      nomeControl?.updateValueAndValidity();
      nome_socialControl?.updateValueAndValidity();
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

// ==================================================================================
// 5. SUBMISSÃO DO FORMULÁRIO (Save)
// ==================================================================================
onSubmit() {
    console.log('--- CLIQUE EM SALVAR ---');

    // 1. LIMPEZA E VALIDAÇÃO VISUAL
    this.msgErroCabecalho = null;

    if (this.pessoaForm.invalid) {
      this.focarNaAbaComErro();
      const erroEncontrado = this.formValidationService.getPrimeiroErro(this.pessoaForm);
      this.msgErroCabecalho = erroEncontrado || "Existem campos obrigatórios não preenchidos.";

      this.pessoaForm.markAllAsTouched();
      this.rolarParaTopo(); // (Assumindo que você criou essa função auxiliar ou use o setTimeout aqui)

      return; // PARE AQUI
    }

    // 2. REGRA DE NEGÓCIO: ATIVO (1) vs PENDENTE (3)

    // Nota: Como já adicionamos 'rg' no arquivo de constantes, não precisa repetir aqui.
    const excecoesParaAtivo = [...this.EXCECOES_GERAIS];
    const tipo = this.pessoaForm.get('tipo')?.value;

    if (tipo === 'PF') {
        excecoesParaAtivo.push(...this.CAMPOS_PJ_OBRIGATORIOS);
    } else {
        excecoesParaAtivo.push(...this.CAMPOS_PF_OBRIGATORIOS);
    }

    const estaCompleto = this.formUtils.isFormularioCompletamentePreenchido(
        this.pessoaForm,
        excecoesParaAtivo
    );

    const idSituacaoCalculado = estaCompleto ? 1 : 3;

    // 3. ATUALIZAÇÃO DO OBJETO
    this.isSubmitting = true;
    const formValues = this.pessoaForm.value;

    this.Pessoa = {
        ...this.Pessoa,
        id_cargo_func_fk: formValues.tipoCargo,

        // --- USA O VALOR CALCULADO ---
        id_situacao_fk: idSituacaoCalculado,
        // -----------------------------

        nome: formValues.nome,
        nome_social: formValues.nome_social,
        rg: formValues.rg,
        orgao: formValues.orgEmis,
        // Usa a formatação de data para evitar erro de SQL
        dt_expedicao: this.formatarDataParaSQL(formValues.dt_expedicao),
        id_tipo_pessoa_fk: formValues.tipo === 'PF' ? 1 : 2,
        id_cpf_cnpj: formValues.tipo === 'PF' ? formValues.nr_cpf : formValues.nr_cnpj
    };

    // 4. DEBUG (AGORA NO LUGAR CERTO)
    console.log('Status Calculado:', idSituacaoCalculado);
    console.log('Objeto Pessoa Pronto para Envio:', this.Pessoa);

    this.cadastrarPessoa();
  }
// --- FUNÇÃO NOVA PARA TROCAR A ABA ---
focarNaAbaComErro() {
  const controls = this.pessoaForm.controls;

  // 1. Verifica Aba Pessoal (Campos soltos ou grupo endereco)
  if (
    controls['nome']?.invalid ||
    controls['nr_cpf']?.invalid ||
    controls['nr_cnpj']?.invalid ||
    controls['celular']?.invalid ||
    controls['email']?.invalid ||
    controls['endereco']?.invalid
  ) {
    console.log('Erro encontrado na aba PESSOAL');
    this.switchTab('pessoal');
    return;
  }

  // 2. Verifica Aba Interesse
  if (controls['interesse']?.invalid) {
    console.log('Erro encontrado na aba INTERESSE');
    this.switchTab('interesse');
    return;
  }

  // 3. Verifica Aba Economico
  if (controls['economico']?.invalid) {
    console.log('Erro encontrado na aba ECONOMICO');
    this.switchTab('economico');
    return;
  }
}
// ========================================================================
// FUNÇÃO AUXILIAR PARA DEBUG (Adicione na classe Cadpessoa)
// ========================================================================
identificarCamposVazios(excecoes: string[]) {
    const controls = this.pessoaForm.controls;

    // Varre o form recursivamente (se for simples) ou os grupos principais
    Object.keys(controls).forEach(key => {
        const control = controls[key];

        // Se for um FormGroup (ex: interesse, economico, endereco)
        if (control instanceof FormGroup) {
            Object.keys(control.controls).forEach(subKey => {
                const subValue = control.get(subKey)?.value;
                // Se valor é vazio E não está nas exceções
                if ((subValue === null || subValue === '' || subValue === undefined) && !excecoes.includes(subKey)) {
                    console.log(`CAMPO VAZIO IMPEDINDO ATIVO: [${key}].${subKey}`);
                }
            });
        }
        // Se for FormControl direto
        else {
            const value = control.value;
            if ((value === null || value === '' || value === undefined) && !excecoes.includes(key)) {
                console.log(`CAMPO VAZIO IMPEDINDO ATIVO: ${key}`);
            }
        }
    });
}
  private cadastrarPessoa() {
    this.pessoaService.cadastrarPessoa(this.Pessoa).subscribe({
        next: (response) => {
            this.id = response.id;
            this.salvarDadosDependentes();
        },
        error: (err) => {
            console.error('Erro ao salvar pessoa', err);
            this.tipoAlerta = 'error';
            this.mensagemDeErro = 'Erro ao salvar dados pessoais.';
            this.isSubmitting = false;
        }
    });
  }

// Adicione essa função auxiliar na sua classe para achar o campo culpado
getFormValidationErrors() {
  const result: any[] = [];
  Object.keys(this.pessoaForm.controls).forEach(key => {
    const controlErrors = this.pessoaForm.get(key)?.errors;
    if (controlErrors) {
      result.push({ control: key, error: controlErrors });
    }
  });
  return result;
}


  /*----------------------------------------------
  *  Cadastro Pessoa
  *-----------------------------------------------
  */
 /* cadastraPessoa(){
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
  };*/

private salvarDadosDependentes() {
    this.cadastrarContato();
    this.cadastrarEndereco();

    if (this.Pessoa.id_tipo_pessoa_fk === 2) {
        this.cadastrarEmpresa();
    }

    this.cadastrarInteresse();
    this.cadastrarEconomico();
  }

  /*----------------------------------------------
  *  Cadastro Contato
  *-----------------------------------------------
  */
  cadastrarContato(){
        this.Contato.id_pessoa_fk = this.id
        this.Contato.nr_contato = this.pessoaForm.value.celular;
        this.Contato.email = this.pessoaForm.value.email;
        this.Contato.whatsapp = this.pessoaForm.value.zap;
        this.contatoService.cadastrarContato(this.Contato).subscribe();
  };
  /*----------------------------------------------
  *  Cadastro Endereco
  *-----------------------------------------------
  */
  cadastrarEndereco(){
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
  cadastrarInteresse(){
 const form = this.pessoaForm.value.interesse;

    this.Interesse = {
        ...this.Interesse,
        id_pessoa_fk: this.id,
        id_sit_imovel_fk: form.id_sit_imovel_fk ? Number(form.id_sit_imovel_fk) : null,
        id_tp_imovel_fk: form.id_tp_imovel_fk ? Number(form.id_tp_imovel_fk) : null,
        vr_imovel: this.limparMoeda(form.vr_imovel),
        vr_aluguel: this.limparMoeda(form.vr_aluguel),
        piscina_adulto: !!form.piscina_adulto, // Garante booleano
        piscina_infantil: !!form.piscina_infantil,
        qt_dorms: form.qt_dorms || 0, // Garante que não vá vazio se for numérico
        qt_wc: form.qt_wc || 0,
        qt_swet: form.qt_swet || 0,
        qt_lavabo: form.qt_lavabo || 0,
        qt_vagas_garagem: form.qt_vagas_garagem || 0,
        qt_area_construida: form.qt_area_construida || 0,
        qt_area_total: form.qt_area_total || 0,
        churasqueira: !!form.churasqueira,
        imovel_mobiliado: !!form.imovel_mobiliado,
        salao_festa: !!form.salao_festa,
        playground: !!form.playground,
        area_pet: !!form.area_pet,
        academia: !!form.academia,
        condominio: !!form.condominio,
        varanda: !!form.varanda,
        quintal_privativo: !!form.quintal_privativo,
        objetivo_interesse: form.objetivo_interesse,
        obs_interesse: form.obs_interesse,
        estado: form.estado,
        municipio: form.municipio,
    };

    this.interesseService.cadastrarInteresse(this.Interesse).subscribe({
        next: () => console.log('Interesse salvo com sucesso'),
        error: (err) => console.error('Erro ao salvar interesse', err)
    });
}
  /*----------------------------------------------
  *  Cadastro Economico
  *-----------------------------------------------
  */
  cadastrarEconomico() {
      const formValues = this.pessoaForm.value.economico;

      this.Economico = {
          ...this.Economico,
          id_pessoa_fk: this.id,

          // --- CORREÇÃO DO ERRO DE TIPO ---
          // Troque 'null' por 'undefined'
          id_origem_renda_fk: formValues.id_origem_renda_fk ? Number(formValues.id_origem_renda_fk) : undefined,
          // --------------------------------

          renda_comprovada: this.limparMoeda(formValues.renda_comprovada),
          saldo_fgts: this.limparMoeda(formValues.saldo_fgts),
          recursos_proprios: this.limparMoeda(formValues.recursos_proprios),
          renda_declarada: this.limparMoeda(formValues.renda_declarada)
      };

      // ... restante do código (subscribe, next, error) ...
      this.economicoService.cadastrarEconomico(this.Economico).subscribe({
          next: () => {
               alert('Cadastro realizado com sucesso!');
               this.pessoaForm.reset();
               this.inicializarEstadoFormulario();
               this.isSubmitting = false;
               this.activeTab = 'pessoal';
          },
          error: (err) => {
               console.error('Erro ao salvar financeiro', err);
               this.tipoAlerta = 'error';
               this.mensagemDeErro = 'Erro ao salvar dados financeiros.';
               this.isSubmitting = false;
          }
      });
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

// ==================================================================================
// 6. UTILS (Helpers)
// Formata campo de moeda ao digitar (usado no template via (blur) ou similar)
// ==================================================================================
  formatarValor(campo: string) {
    const control = this.pessoaForm.get(campo);
    if (!control?.value) return;

    let valorLimpo = control.value.toString().replace(/\./g, '').replace(',', '.');
    let numero = parseFloat(valorLimpo);

    if (!isNaN(numero)) {
      if (numero > 100000000) numero = 1000000000;
      const formatado = numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      control.setValue(formatado, { emitEvent: false });
    }
  }
  private limparMoeda(valor: any): number {
    if (typeof valor !== 'string') return valor;
    const valorLimpo = valor
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();
    return parseFloat(valorLimpo) || 0;
  }

  // Transforma string R$ 1.000,00 em number 1000.00
 /* private limparMoeda(valor: any): number {
    if (typeof valor !== 'string') return valor;
    const valorLimpo = valor
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();
    return parseFloat(valorLimpo) || 0;
  }

  // Ordenador Genérico (evita repetição de código)
  private ordenarLista<T>(lista: T[], campoNome: keyof T): T[] {
    return lista.sort((a, b) => {
        const nomeA = (String(a[campoNome]) || "").toUpperCase();
        const nomeB = (String(b[campoNome]) || "").toUpperCase();
        if (nomeA < nomeB) return -1;
        if (nomeA > nomeB) return 1;
        return 0;
    });
  }*/

// Adicione isso dentro da classe Cadpessoa
    private formatarDataParaSQL(data: any): string | null {
      // 1. Se for nulo, indefinido ou vazio
      if (!data || data === '') return null;

      // 2. Se for a string "Invalid Date" (erro comum do JS)
      if (data.toString() === 'Invalid Date') return null;

      // 3. Se a data vier no formato brasileiro DD/MM/YYYY (ex: via máscara)
      if (typeof data === 'string' && data.length === 10 && data.includes('/')) {
        const [dia, mes, ano] = data.split('/');
        return `${ano}-${mes}-${dia}`; // Retorna YYYY-MM-DD
      }

      // 4. Se já for um objeto Date do JS
      if (data instanceof Date) {
         return data.toISOString().split('T')[0];
      }

      // Retorna como está (assumindo que já seja YYYY-MM-DD do input type="date")
      return data;
    }

    bloqueiaCampoInteresses(){
      // 1. BLOQUEIO INICIAL
    // Pega o grupo 'interesse' do seu formulário principal
          const grupoInteresse = this.pessoaForm.get('interesse') as FormGroup;
          this.interesseFormService.bloquearTudo(grupoInteresse);
    }

   // Função chamada pelos botões no HTML
   definirObjetivo(objetivo: 'Comprar' | 'Vender' | 'Alugar') {
          const grupoInteresse = this.pessoaForm.get('interesse') as FormGroup;
          this.interesseFormService.definirObjetivo(grupoInteresse, objetivo);
   }
// Adicione este método na classe
  private iniciarListenerEstadoSeguro(): void {
    const estadoControl = this.pessoaForm.get('interesse.estado');

    if (estadoControl) {
      // Escuta mudanças APENAS no estado
      estadoControl.valueChanges.subscribe(siglaUF => {
        if (siglaUF) {
          this.carregarMunicipios(siglaUF);
        } else {
          this.municipios = [];
        }
      });
    }
  }

  // --- FUNÇÃO AUXILIAR DE SCROLL ---
  rolarParaTopo() {
    // 1. Tenta rolar a janela toda para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. Tenta focar especificamente no banner vermelho
    // O setTimeout é necessário para esperar o Angular "desenhar" a div do erro na tela (por causa do @if)
    setTimeout(() => {
      const alerta = document.getElementById('alerta-erro');
      if (alerta) {
        alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
  converteInput(event: any, campo: string) {
    const input = event.target as HTMLInputElement;
    const valorMaiusculo = input.value.toUpperCase();

    // Atualiza o valor no FormControl
    this.pessoaForm.get(campo)?.setValue(valorMaiusculo, { emitEvent: false });
  }
}



