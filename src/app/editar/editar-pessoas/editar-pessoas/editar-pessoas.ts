import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PessoaService } from '../../../glocService/pessoa.service';
import { ContatoService } from '../../../glocService/contato.service';
import { BucaEnderecoModel as Endereco } from '../../../glocModel/busca-endereco.model';
import { EnderecoService } from '../../../glocService/endereco.service';
import { EconomicoService } from '../../../glocService/economico.service';
import { InteresseService } from '../../../glocService/interesse.serivice';
import { IbgeService } from '../../../glocService/Ibge.service';
import { FormUtilsService } from '../../../glocService/formUtils.service';
import { OrigemRendaService } from '../../../glocService/origem-renda.service';
import { Cep_Service } from '../../../glocService/Cep.service';
import { TipoCargoService } from '../../../glocService/tipo-cargo.service';
import { SituacaoImovelService } from '../../../glocService/situacao-imovel.service';
import { TipoImovelService } from '../../../glocService/tipo-imovel.service';
import { FormValidationService } from '../../../glocService/FormValidationService';
import { criarFormularioPessoa } from '../../../cadastro/cad-pessoa/cad-pessoa/criarFormularioPessoa';
import { TipoCargoModel } from '../../../glocModel/tipo-cargo.model';
import { TipoImovelModel } from '../../../glocModel/tipo-imovel.model';
import { SituacaoImovelModel } from '../../../glocModel/situacao-imovel.model';
import { OrigemRendaModel } from '../../../glocModel/origem-renda.model';
import { PessoaModel } from '../../../glocModel/pessoa.model';
import { LayoutProps } from '../../../template/layout/layoutprops';
import { catchError, debounceTime, of, take, throwError } from 'rxjs';
import { validarCPF } from '../../../validators/cpf-validator';
import { HttpErrorResponse } from '@angular/common/http';
import { InteresseFormService } from '../../../glocService/interesse-form.service';
import {
  getInicialPessoa, getInicialEndereco,
  getInicialContato, getInicialInteresse, getInicialEconomico,
  EXCECOES_GERAIS, CAMPOS_PF_OBRIGATORIOS,
  CPF_CONTROL_NAME,  gerarUltimosAnos,
} from './editar-pessoa-pf.constants';
import { editarFormularioPessoaPF } from './editarFormularioPessoaPF';



@Component({
  selector: 'app-editar-pessoas',
  standalone: false,
  templateUrl: './editar-pessoas.html',
  styleUrl: './editar-pessoas.scss'
})
export class EditarPessoas implements OnInit {
// 1. Injeção de dependências moderna (sem construtor)
  private fb = inject(FormBuilder);
  private pessoaService = inject(PessoaService);
  private contatoService = inject(ContatoService);
  private enderecoService = inject(EnderecoService);
  private economicoService = inject(EconomicoService);
  private interesseService = inject(InteresseService);
  private ibgeService = inject(IbgeService);
  private formUtils  = inject (FormUtilsService);
  private origemRendaSerrvice = inject (OrigemRendaService);
 // private cepBuscarService = inject (CepBuscaService)
  private tipoCargoService = inject (TipoCargoService)
  private situacaoImovelService = inject (SituacaoImovelService)
  private tipoImovelService = inject (TipoImovelService);
  private formValidationService = inject (FormValidationService);
  private interesseFormService = inject(InteresseFormService);
  private cepService = inject (Cep_Service)
 // private viewportScroller  = inject(ViewportScroller);
  private route = inject(ActivatedRoute); // Para pegar o ID da URL
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
// 2. Inicialização do Formulário
  pessoaForm: FormGroup = editarFormularioPessoaPF(this.fb);

// Variáveis de Controle / UI
  id: any;
  private ultimoCepPesquisado: string = '';
  public tipoAlerta: 'error' | 'success' | null = null;
  public mensagemDeErro: string | null = null;
  msgErroCabecalho: string | null = null;
  pessoaId: number | null = null;

// Constantes expostas para o Template
  readonly cpfControlName = CPF_CONTROL_NAME;
  readonly EXCECOES_GERAIS = EXCECOES_GERAIS;
  readonly CAMPOS_PF_OBRIGATORIOS = CAMPOS_PF_OBRIGATORIOS;

  // Controle de Validação Local
  cpfValido: boolean | null = null;
  cnpjValido: boolean | null = null;

  isSubmitting: boolean = false;

// Modelos de Dados (Inicializados via Função)
  Pessoa = getInicialPessoa();
  Endereco = getInicialEndereco();
  Contato = getInicialContato();
  Interesse = getInicialInteresse();
  Economico = getInicialEconomico()

// Signals e Estado
 activeTab: string = 'pessoal'; // Valor inicial
 isLoading = signal(true);
 selectedYear = signal<string>('');
 years = signal<number[]>(gerarUltimosAnos(10)); // Usando a função utilitária

// Listas de Dados
  tiposCargos: TipoCargoModel[] = [];
  tiposDeImovel: TipoImovelModel[] = [];
  situacaoImovel: SituacaoImovelModel[] = [];
  origemDaRenda: OrigemRendaModel[] = [];
  estados: any[] = [];
  municipios: any[] = [];


// Saídas
  @Output() cadastrada = new EventEmitter<PessoaModel>()

  // isChecked = false;
 //Usadp ma busca do cep
  loading: boolean = false;
  erroBusca: boolean = false;
 // pessoaForm: FormGroup;
 // mostrarMensagem = true;

// Getters
  get enderecoForm(): FormGroup { return this.pessoaForm.get('endereco') as FormGroup; }
  get interesseForm(): FormGroup { return this.pessoaForm.get('interesse') as FormGroup; }
  get economicoForm(): FormGroup { return this.pessoaForm.get('economico') as FormGroup; }
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
    this.carregarListasAuxiliares();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.pessoaId = Number(idParam); // ou +idParam
      this.carregarDadosPessoa(this.pessoaId);
      this.carregarDadosContato(this.pessoaId);
      this.carregarDadosEndereco(this.pessoaId);
      this.carregarDadosPerfilInteresse(this.pessoaId);
      this.carregarDadosPerfilEconomico(this.pessoaId);

    } else {
      // Se não tem ID, volta pra lista
      this.router.navigate(['/editarpessoas/buscar/${id}']);
    }
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

ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
carregarListasAuxiliares() {
    // Implemente a carga dos seus selects aqui
    // Ex: this.service.getEstados().subscribe(...)
    // Popule this.years
    const currentYear = new Date().getFullYear();
    this.years.set(Array.from({length: 5}, (_, i) => currentYear - i));
  }

carregarDadosPessoa(id: number) {
  this.isLoading.set(true);

  this.pessoaService.getPorId(id).subscribe({
    next: (pessoa: any) => {
      this.pessoaForm.patchValue(pessoa);
      this.pessoaForm.get('nr_cpf')?.setValue(pessoa.id_cpf_cnpj);
      this.carregarTipoCargo(pessoa.id_cargo_func_fk);

      console.log('Pessoa carregado:', pessoa);
      this.isLoading.set(false);
    },
    error: (err) => {
      alert('Erro ao carregar dados da pessoa.');
    }
  });

}

carregarDadosContato(idFK: number) {
    this.contatoService.readByIdContato(idFK).subscribe({
        next: (contato: any) => {
            if(contato) {
                console.log('Contato carregado:', contato);
                this.pessoaForm.patchValue(contato);
                this.pessoaForm.get('celular')?.setValue(contato.nr_contato);
                this.pessoaForm.get('zap')?.setValue(contato.whatsapp);
             }
        },
        error: (err) => {
            // Opcional: não alertar se for apenas 404 (sem endereço cadastrado ainda)
            console.warn('Contato não encontrado ou erro:', err);
        }
    });


}

carregarDadosEndereco(idFK: number) {
  this.enderecoService.getPorIdPessoaFK(idFK).subscribe({
  next: (endereco: any) => {
            if (endereco) {
                this.enderecoForm.patchValue(endereco);
                this.buscarCep();
            }
        },
        error: (err) => console.warn(err)

    });
}

carregarTipoCargo(idFK: number){
 this.tipoCargoService.getPorIdPessoaFK(idFK).subscribe({
  next: (cargo: any) => {
        console.log('cargo   :', cargo.ds_cargo);
            if (cargo) {
                this.pessoaForm.get('tipoCargo')?.setValue(cargo.id);
            }
        },
        error: (err) => {console.warn('Cargo não encontrado ou erro:', err);}
    });
}

carregarDadosPerfilInteresse(idFK: number) {
 this.interesseService.getPorIdPessoaFK(idFK).subscribe({
  next: (interesse: any) => {

     console.log('interesse   : ', interesse)
            if (interesse) {
                this.interesseForm.patchValue(interesse);
            }
        },
        error: (err) => console.warn(err)
    });
}

carregarDadosPerfilEconomico(idFK: number) {
 this.economicoService.getPorIdPessoaFK(idFK).subscribe({
  next: (economico: any) => {
       if (economico) {
         this.economicoForm.patchValue(economico);
        }
      },
      error: (err) => console.warn(err)
    });
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
                const nomeA = (a.nm_origem_renda || "").toUpperCase();
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
      const excecoesAtuais = [...this.EXCECOES_GERAIS];

      const estaCompleto = this.formUtils.isFormularioCompletamentePreenchido(
        this.pessoaForm,
        excecoesAtuais
      );
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
//      console.log(`Status alterado para: ${isCompleto ? 'ATIVO (Completo)' : 'PENDENTE (Faltam dados)'}`);
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


buscarCep() {
 // Pega o valor do campo CEP do formulário
  const cep = this.enderecoForm.get('cep')?.value;

  if (cep) {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length < 8) return;
      if (cepLimpo === this.ultimoCepPesquisado) return;
      this.ultimoCepPesquisado = cepLimpo;
      this.loading = true;
      this.cepService.buscarCep(cepLimpo).subscribe({
       next: (dados) => {
            this.loading = false; // V
            this.cdr.detectChanges();
              if (dados.erro) {
                alert('CEP não encontrado!');
                return;
              }
              // Preenchimento com os campos da ViaCEP
              this.enderecoForm.patchValue({
                logradouro: dados.logradouro,
                bairro: dados.bairro,
                cidade: dados.localidade,
                uf: dados.uf,

          });
//          console.log('Dados recebidos:', dados);
        },
        error: (err) => {
          this.loading = false;
          this.cdr.detectChanges();
           alert('CEP não encontrado!');
        }
      });
    }
 }

/*
 limparCamposEndereco() {
      this.enderecoForm.patchValue({
        logradouro: '',
        bairro: '',
        localidade: '',
        uf: ''
      });
  }
*/
  toggleValidation(tipo: string): void {
      const cpfControl = this.pessoaForm.get('nr_cpf');
      const nomeControl = this.pessoaForm.get('nome');
      const nome_socialControl = this.pessoaForm.get('nome_social');

      if (tipo === 'PF') {
        // Habilita validação PF
        nomeControl?.setValidators([Validators.required]);
        nome_socialControl?.setValidators([Validators.required]);
        } else {
        // Desabilita validação PF
        cpfControl?.setValidators(null);
        nomeControl?.setValidators(null);
        nome_socialControl?.setAsyncValidators(null);
      }
      cpfControl?.updateValueAndValidity();
      nomeControl?.updateValueAndValidity();
      nome_socialControl?.updateValueAndValidity();

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
    this.msgErroCabecalho = null;
    if (this.pessoaForm.invalid) {
      this.focarNaAbaComErro();
      const erroEncontrado = this.formValidationService.getPrimeiroErro(this.pessoaForm);
      this.msgErroCabecalho = erroEncontrado || "Existem campos obrigatórios não preenchidos.";
      this.pessoaForm.markAllAsTouched();
      this.rolarParaTopo(); // (Assumindo que você criou essa função auxiliar ou use o setTimeout aqui)
      return;
    }
    const excecoesParaAtivo = [...this.EXCECOES_GERAIS];
    excecoesParaAtivo.push(...this.CAMPOS_PF_OBRIGATORIOS);
    const estaCompleto = this.formUtils.isFormularioCompletamentePreenchido(
        this.pessoaForm,
        excecoesParaAtivo
    );
    const idSituacaoCalculado = estaCompleto ? 1 : 3;
    this.isSubmitting = true;
    const formValues = this.pessoaForm.value;
    this.Pessoa = {
        ...this.Pessoa,
        id_cargo_func_fk: formValues.tipoCargo,
        id_situacao_fk: idSituacaoCalculado,
        nome: formValues.nome,
        nome_social: formValues.nome_social,
        rg: formValues.rg,
        orgao: formValues.orgEmis,
        dt_expedicao: this.formatarDataParaSQL(formValues.dt_expedicao),
        id_tipo_pessoa_fk:   1,
        id_cpf_cnpj:  formValues.nr_cpf
    };
    this.salvarPessoa();
  }

  private salvarPessoa() {
    const dadosParaSalvar = this.pessoaForm.getRawValue(); // getRawValue pega até campos disabled
    console.log('dadosParaSalvar PEssoas: id ', this.pessoaId);
    this.pessoaService.atualizar(this.pessoaId, dadosParaSalvar).subscribe({
        next: (response) => {
            this.id = response?.id || this.pessoaId;
            console.log('Pessoas: id ', this.id);
            this.salvarDadosDependentes();
        },
        error: (err) => {
            console.error('Erro ao salvar pessoa ', err);
            this.tipoAlerta = 'error';
            this.mensagemDeErro = 'Erro ao salvar dados pessoais.';
            this.isSubmitting = false;
        }
    });
  }

  // --- FUNÇÃO NOVA PARA TROCAR A ABA ---
  focarNaAbaComErro() {
    const controls = this.pessoaForm.controls;

  // 1. Verifica Aba Pessoal (Campos soltos ou grupo endereco)
    if (
      controls['nome']?.invalid ||
      controls['nr_cpf']?.invalid ||
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

 private salvarDadosDependentes() {
    this.salvarContato();
    this.salvarEndereco();
    this.salvarInteresse();
    this.salvarEconomico();
  }

  /*----------------------------------------------
  *  Cadastro Contato
  *-----------------------------------------------
  */
  salvarContato(){
     //   const dadosParaSalvar = this.pessoaForm.getRawValue();
        this.Contato.id_pessoa_fk = this.id
        this.Contato.nr_contato = this.pessoaForm.value.celular;
        this.Contato.email = this.pessoaForm.value.email;
        this.Contato.whatsapp = this.pessoaForm.value.zap;
  //      console.log(' enviando dados contato ', this.Contato )
        this.contatoService.updateContato(this.id, this.Contato).subscribe();
  };
  /*----------------------------------------------
  *  Cadastro Endereco
  *-----------------------------------------------
  */
  salvarEndereco(){
        this.Endereco.id_pessoa_fk = this.id
        this.Endereco.cep = this.pessoaForm.value.endereco.cep;
        this.Endereco.numero =  this.pessoaForm.value.endereco.numero;
        this.Endereco.complemento = this.pessoaForm.value.endereco.complemento;
  //      console.log(' enviando dados endereco ', this.Endereco )
        this.enderecoService.updateEndereco(this.id, this.Endereco).subscribe();
  };
  /*----------------------------------------------
  *  Cadastro Interesse
  *-----------------------------------------------
  */
  salvarInteresse(){
 //const form = this.pessoaForm.value.interesse;
     this.Interesse.id_pessoa_fk = this.id
    const dadosParaSalvar = this.interesseForm.getRawValue();

/*    this.Interesse = {
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
    };*/

    this.interesseService.atualizar(this.id, dadosParaSalvar).subscribe();
}
  /*----------------------------------------------
  *  Cadastro Economico
  *-----------------------------------------------
  */
  salvarEconomico() {
      const formValues = this.pessoaForm.value.economico;

      this.Economico = {
          ...this.Economico,
          id_pessoa_fk: this.id,
          id_origem_renda_fk: formValues.id_origem_renda_fk ? Number(formValues.id_origem_renda_fk) : undefined,
          // --------------------------------

          renda_comprovada: this.limparMoeda(formValues.renda_comprovada),
          saldo_fgts: this.limparMoeda(formValues.saldo_fgts),
          recursos_proprios: this.limparMoeda(formValues.recursos_proprios),
          renda_declarada: this.limparMoeda(formValues.renda_declarada)
      };

          const excecoesParaAtivo = [...this.EXCECOES_GERAIS];
          excecoesParaAtivo.push(...this.CAMPOS_PF_OBRIGATORIOS);
          const estaCompleto = this.formUtils.isFormularioCompletamentePreenchido(
              this.pessoaForm,
              excecoesParaAtivo
          );
          const idSituacaoCalculado = estaCompleto ? 1 : 3;

      this.economicoService.atualizar(this.id, this.Economico).subscribe({
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
          },

      });
      this.Pessoa.id_situacao_fk = idSituacaoCalculado,
      this.pessoaService.atualizarStatus(this.pessoaId, this.Pessoa).subscribe()
  }

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



