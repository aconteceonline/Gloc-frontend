import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  RequiredValidator,
  Validators,
} from '@angular/forms';
import { LayoutProps } from '../../../template/layout/layoutprops';
import { ImovelModel, FotoModel } from '../../../glocModel/imovel.model';
import { ImovelService } from '../../../glocService/imovel.service';
import { EnderecoModel } from '../../../glocModel/endereco.model';
import { PessoaService } from '../../../glocService/pessoa.service';
import { BucaEnderecoModel as Endereco } from '../../../glocModel/busca-endereco.model';
import { CepBuscaService } from '../../../services/CepBuscaService';
import { Observable, take } from 'rxjs';
import { PessoaModel } from '../../../glocModel/pessoa.model';
import { ContatoService } from '../../../glocService/contato.service';
import { ContatoModel } from '../../../glocModel/contato.model';
import { TipoImovelModel } from '../../../glocModel/tipo-imovel.model';
import { TipoImovelService } from '../../../glocService/tipo-imovel.service';
import { CurrencyPipe } from '@angular/common';
import { IbgeService } from '../../../glocService/Ibge.service';
import { SituacaoImovelService } from '../../../glocService/situacao-imovel.service';
import { SituacaoImovelModel } from '../../../glocModel/situacao-imovel.model';

/*export interface ContatoPessoa{
    id?: number;
    id_pessoa_fk?: number,
    nr_contato:  string | null,
}*/
interface FotoPreview {
  id: string;
  nome: string;
  url: string; // DataURL para preview
}

/*function uid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}*/

@Component({
  selector: 'app-cad-imovel',
  standalone: false,
  templateUrl: './cad-imovel.html',
  styleUrl: './cad-imovel.scss',
})
export class CadImovel implements OnInit {
  private ibgeService = inject(IbgeService);
  public imoveis = inject(ImovelService);
  private cepService = inject(CepBuscaService);
  public pessoaService = inject(PessoaService);
  private contatoService = inject(ContatoService);
  private situacaoImovelService = inject(SituacaoImovelService);
  private tipoImovelService = inject(TipoImovelService);
  private currencyPipe = inject(CurrencyPipe);
  private fb = inject(FormBuilder);
  private imovelService = inject(ImovelService);
  private cdr = inject(ChangeDetectorRef);

  idadesImovel = ['Novo', '1 a 5 anos', '5 a 10 anos', 'Mais de 10 anos'];

  listaGarantias = [
    'Garantia Locatícia',
    'Seguro Fiança',
    'Depósito Caução',
    'Fiador',
    'Sem garantia',
  ];
  responsabilidade = ['Inquilino', 'Locador'];

  listaAnos: number[] = [];
  garantiaSelecionada = signal('');
  anoSelecionado: any = null;
  loading: boolean = false;
  erroBusca: boolean = false;
  imovelForm: FormGroup;
  estados: any[] = [];
  municipios: any[] = [];
  modalAberto = signal(false);
  activeTab: string = 'cadImovel';
  estado: string = '';
  municipio: string = '';
  situacaoImovel: SituacaoImovelModel[] = [];
  tiposDeImovel: TipoImovelModel[] = [];
  contato$!: Observable<ContatoModel>;
  fotosPreview: string[] = [];
  fotos = signal<FotoPreview[]>([]);
  contatoEncontrado: ContatoModel = {};
  uploading = signal(false);
  sucesso = signal<string | null>(null);
  pessoaSelecionada = signal<PessoaModel | any>(null);
  props: LayoutProps = {
    titulo: 'GLOC - Gestão de Locação',
    subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade',
  };

  Endereco: EnderecoModel = {
    id_pessoa_fk: 0,
    cep: '',
    numero: '',
    complemento: '',
  };
  get enderecoForm(): FormGroup {
    return this.imovelForm.get('endereco') as FormGroup;
  }

  constructor() {
    this.imovelForm = this.fb.group({
      nome_contato_imovel: ['', Validators.required],
      contato_imovel: ['', Validators.required],
      descricao: [''],
      tipo_imovel: ['', Validators.required],
      titulo_imovel: ['', Validators.required],
      situacao_imovel: ['', Validators.required],
      vlr_venda: [],
      vlr_aluguel: [null],
      qtde_dorms: [''],
      qtde_wc: [''],
      qtde_lavabo: [],
      area_construida: [''],
      qtde_swet: [],
      qtde_vaga: [],
      varanda: [''],
      quintal: [''],
      mobiliado: [''],
      condominio: [''],
      piscina_adulto: [''],
      piscina_infantil: [''],
      churasqueira: [''],
      salao_festas: [''],
      playground: [''],
      area_pet: [''],
      academia: [''],
      observacoes: [''],
      permitir_venda: [false],
      permitir_aluguel: [false],
      garantiaSelecionada: new FormControl(''),
      iptu: [''],
      txCondominio: [null],
      contaAgua: [null],
      contaEnergia: [null],
      contaGas: [null],
      contaInternet: [null],

      // NOVO: FormGroup para Endereço
      endereco: this.fb.group({
        cep: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\d{5}-?\d{3}$/), // aceita 8 dígitos com ou sem hífen
          ],
        ],
        logradouro: [''],
        numero: ['', Validators.required],
        complemento: [''], // Opcional
        bairro: [''],
        cidade: [''],
        uf: [''],
      }),

      fotos: [[]],
    });
    // Opcional: Lógica para resetar a aba se o usuário desmarcar o checkbox enquanto estiver nela
    this.imovelForm.get('permitir_venda')?.valueChanges.subscribe((val) => {
      if (!val && this.activeTab === 'perfilVendas') {
        this.switchTab('perfilImovel');
      }
    });

    this.imovelForm.get('permitir_aluguel')?.valueChanges.subscribe((val) => {
      if (!val && this.activeTab === 'perfilAluguel') {
        this.switchTab('perfilImovel');
      }
    });
  }

  ngOnInit(): void {
    garantiaSelecionada: new FormControl('', Validators.required);
    this.carregarTiposDeImovel();
    this.carregarSituacaoImovel();
    this.iniciarListenerEstadoSeguro();
    this.carregarEstados();
    this.gerarAnos();
  }

  // Retorna o nome da próxima aba com base nas regras de negócio
  get temVenda(): boolean {
    return !!this.imovelForm.get('permitir_venda')?.value;
  }

  get temAluguel(): boolean {
    return !!this.imovelForm.get('permitir_aluguel')?.value;
  }

  // Identifica qual é a aba de encerramento do fluxo
  get ultimaAba(): string {
    if (this.temAluguel) return 'perfilAluguel';
    if (this.temVenda) return 'perfilVendas';
    return 'perfilImovel';
  }

  // Lógica de navegação para o botão "Próximo"
  get proximaAba(): string | null {
    if (this.activeTab === 'cadImovel') return 'perfilImovel';

    if (this.activeTab === 'perfilImovel') {
      if (this.temVenda) return 'perfilVendas';
      if (this.temAluguel) return 'perfilAluguel';
    }

    if (this.activeTab === 'perfilVendas' && this.temAluguel) {
      return 'perfilAluguel';
    }

    return null;
  }

  // Lógica de navegação para o botão "Voltar"
  get abaAnterior(): string | null {
    if (this.activeTab === 'perfilImovel') return 'cadImovel';

    if (this.activeTab === 'perfilVendas') return 'perfilImovel';

    if (this.activeTab === 'perfilAluguel') {
      return this.temVenda ? 'perfilVendas' : 'perfilImovel';
    }

    return null;
  }

  // Dentro da sua classe CadImovel
  podeEditarAno(): boolean {
    // Pegamos o ID diretamente do Reactive Form
    const idSelecionado = this.imovelForm.get('situacao_imovel')?.value;

    // Converte para número caso o valor venha como string da API
    const id = Number(idSelecionado);

    // Habilita apenas se for 2 (Construção) ou 3 (Na Planta)
    return id === 2 || id === 3;
  }

  isImovelPronto(): boolean {
    const id = Number(this.imovelForm.get('situacao_imovel')?.value);
    return id === 1;
  }

  gerarAnos() {
    const anoAtual = new Date().getFullYear();
    const temporario: number[] = [];

    for (let i = 0; i <= 10; i++) {
      temporario.push(anoAtual + i);
    }

    // Atribua o array completo de uma vez (isso ajuda o Angular a detectar a mudança)
    this.listaAnos = temporario;

    // Força o Angular a verificar mudanças imediatamente
    this.cdr.detectChanges();
  }

  carregarTiposDeImovel(): void {
    this.tipoImovelService.getTiposImoveis().subscribe({
      next: (data) => {
        // Atribui os dados recebidos da API à lista
        this.tiposDeImovel = data;
        this.tiposDeImovel.sort((a, b) => {
          const nomeA = a.ds_imovel.toUpperCase(); // Para comparação sem case-sensitive
          const nomeB = b.ds_imovel.toUpperCase();
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
      },
    });
  }
  carregarSituacaoImovel(): void {
    this.situacaoImovelService.getSituacaoImoveis().subscribe({
      next: (data) => {
        // Atribui os dados recebidos da API à lista
        this.situacaoImovel = data;

        this.situacaoImovel.sort((a, b) => {
          const nomeA = (a.nm_situacao || '').toUpperCase(); // Para comparação sem case-sensitive
          const nomeB = (b.nm_situacao || '').toUpperCase();

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
      },
    });
  }
  private carregarEstados() {
    this.ibgeService.getEstados().subscribe({
      next: (dados) => (this.estados = dados),
      error: (err) => console.error('Erro ao carregar estados', err),
    });
  }
  carregarMunicipios(siglaUF: string) {
    this.municipios = []; // Limpa anterior

    // Chama seu serviço do IBGE
    this.ibgeService.getMunicipios(siglaUF).subscribe({
      next: (cidades) => {
        this.municipios = cidades;
        // Opcional: Ordenar alfabeticamente
        this.municipios.sort((a, b) => a.nome.localeCompare(b.nome));
      },
      error: (err) => console.error('Erro ao carregar municípios', err),
    });
  }
  private iniciarListenerEstadoSeguro(): void {
    // AJUSTE: Verifique se o caminho é 'estado' ou 'interesse.estado'
    // conforme a estrutura do seu fb.group
    const estadoControl = this.imovelForm.get('estado');
    const municipioControl = this.imovelForm.get('municipio');

    if (estadoControl) {
      estadoControl.valueChanges.subscribe((siglaUF) => {
        // 1. Limpa o valor do município no formulário sempre que o estado muda
        if (municipioControl) {
          municipioControl.setValue(null);
        }

        if (siglaUF) {
          this.carregarMunicipios(siglaUF);
        } else {
          this.municipios = [];
        }
      });
    }
  }
  // Método para trocar de aba
  switchTab(tab: string) {
    this.activeTab = tab;
    window.scrollTo(0, 0);
  }

  formatarValor(campo: string) {
    const control = this.imovelForm.get(campo);
    if (control) {
      let valor = control.value;
      if (valor !== null && valor !== '') {
        // Converte string para número, removendo caracteres não numéricos
        const numero = Number(valor.toString().replace(/[^\d]/g, '')) / 100;
        // Aplica o CurrencyPipe
        const formatado = this.currencyPipe.transform(
          numero,
          'BRL',
          'symbol',
          '1.2-2',
        );
        // Atualiza o campo formatado
        control.setValue(formatado, { emitEvent: false });
      }
    }
  }

  abrirModal() {
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
  }

  selecionarPessoa(pessoa: PessoaModel) {
    this.pessoaSelecionada.set(pessoa);
    this.contatoEncontrado.id_pessoa_fk = pessoa.id;
    this.imovelForm.patchValue({ proprietarioId: pessoa.id });
    this.contato$ = this.contatoService.readByIdContato(pessoa.id!.toString());
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input?.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotos.update((arr) => [
          ...arr,
          {
            id: crypto.randomUUID(),
            nome: file.name,
            url: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

  removerFoto(id: string) {
    this.fotos.update((arr) => arr.filter((f) => f.id !== id));
  }

  limparFotos() {
    //      this.fotos.set([]);
  }

  salvar() {
    if (this.imovelForm.invalid) {
      this.imovelForm.markAllAsTouched();
      return;
    }
    const form = this.imovelForm.value;
    form.situacao_imovel = 3;
    form.id_pessoa_fk = 1;
    // Lógica de salvamento aqui...
    console.log('Dados enviados:', form);
    this.imovelService.cadastrarImovel(form).subscribe();
    // 1. Define a mensagem de sucesso
    this.sucesso.set('Imóvel cadastrado com sucesso!');

    // 2. Reseta o formulário
    this.imovelForm.reset();
    this.pessoaSelecionada.set(null); // Limpa o Signal da pessoa
    this.fotos.set([]); // Limpa as fotos

    setTimeout(() => {
      this.sucesso.set(null);
    }, 5000);
  }

  /*  cadastrarPessoa() {
      // Aqui você pode abrir outro modal, navegar para outra rota ou exibir um formulário embutido
      console.log('Abrir cadastro de pessoa');
    }
*/
  // Função disparada ao perder o foco (onBlur)
  buscarCep() {
    this.erroBusca = false;
    const cepControl = this.enderecoForm.get('cep');
    // Valida se o campo CEP está preenchido e é válido
    if (cepControl && cepControl.valid) {
      this.loading = true;
      const cepValue = cepControl.value;

      this.cepService
        .buscarEndereco(cepValue)
        .pipe(
          take(1), // Pega apenas a primeira emissão e finaliza
        )
        .subscribe({
          next: (endereco: Endereco) => {
            this.loading = false;

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
          },
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
      uf: '',
    });
  }
  // NOVO: Getter para o FormGroup Endereço (facilita o uso no template)
  get enderecoGroup(): FormGroup {
    return this.imovelForm.get('endereco') as FormGroup;
  }
}
