import { Component, computed,  OnInit,  signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
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
import { TipoImovelModel } from '../../../glocModel/tipo-imovel.model'
import { TipoImovelService } from '../../../glocService/tipo-imovel.service';
import { CurrencyPipe } from '@angular/common';

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

  loading: boolean = false;
  erroBusca: boolean = false;
  imovelForm: FormGroup;
//  contatoTrue= true
//  nr_contato: any = ''
//  zap = ''
  modalAberto = signal(false);
  activeTab: string = 'pessoal'
  tiposDeImovel: TipoImovelModel[] = [];
  contato$!: Observable<ContatoModel>;
  fotosPreview: string[] = [];
  fotos = signal<FotoPreview[]>([]);
// 1. Variável para armazenar o contato encontrado
  contatoEncontrado: ContatoModel = {};
//  contatocontato = '' ;
//  erroBuscaContato: string | undefined;
// Limites e validações de upload
//  maxFotos = 10;
//  maxTamanhoMb = 10;
//  tiposAceitos = ['image/jpeg', 'image/png', 'image/webp'];

  uploading = signal(false);
//  erroUpload = signal<string | null>(null);
  sucesso = signal<string | null>(null);
  pessoaSelecionada = signal<PessoaModel | any>(null);
  props: LayoutProps ={ titulo: 'GLOC - Gestão de Locação', subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade' }

  Endereco: EnderecoModel = {
     id_pessoa_fk: 0,
     cep: '',
     numero: 0,
     complemento: '',
  }
  get enderecoForm(): FormGroup {
      return this.imovelForm.get('endereco') as FormGroup;
  }




  constructor(
    private fb: FormBuilder,
    public imoveis: ImovelService,
    private cepService: CepBuscaService,
    public pessoaService: PessoaService,
    private contatoService: ContatoService,
    private tipoImovelService: TipoImovelService,
    private currencyPipe: CurrencyPipe
  ) {


     this.imovelForm = this.fb.group({
        titulo: ['', [Validators.required, Validators.minLength(3)]],     descricao: ['', [Validators.required, Validators.minLength(10)]],
        tipo: [null, Validators.required],
        titulo_imovel: [''],
        vlr_venda: [ ],
        vlr_aluguel: [null],
        qtde_dorms: ['', [Validators.required, Validators.min(0)]],
        qtde_wc: ['', [Validators.required, Validators.min(0)]],
        qtde_lavabo: [],
        area_construida: ['', [Validators.required, Validators.min(0)]],
        qtde_swet: [ ],
        qtde_vaga: [ ],
        varanda:  [''],
        quintal:  [''],
        mobiliado:  [''],
        condominio:  [''],
        piscina_adulto:  [''],
        piscina_infantil: [''],
        churasqueira:  [''],
        salao_festas:  [''],
        playground:  [''],
        area_pet:  [''],
        academia:  [''],

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

       fotos: [[]]
    });
   }


   ngOnInit(): void {


        this.carregarTiposDeImovel();
   }


   carregarTiposDeImovel(): void {
        this.tipoImovelService.getTiposImoveis().subscribe({
            next: (data) => {
                // Atribui os dados recebidos da API à lista
                this.tiposDeImovel = data;

                this.tiposDeImovel.sort((a, b) => {
                const nomeA = a.tipo_imovel.toUpperCase(); // Para comparação sem case-sensitive
                const nomeB = b.tipo_imovel.toUpperCase();

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

// Método para trocar de aba
  switchTab(tab: string) {
    this.activeTab = tab;
  }
  formatarValor(campo: string) {
    const control = this.imovelForm.get(campo);

    if (control) {
      let valor = control.value;

      if (valor !== null && valor !== '') {
        // Converte string para número, removendo caracteres não numéricos
        const numero = Number(valor.toString().replace(/[^\d]/g, '')) / 100;

        // Aplica o CurrencyPipe
        const formatado = this.currencyPipe.transform(numero, 'BRL', 'symbol', '1.2-2');

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

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotos.update(arr => [
          ...arr,
          {
            id: crypto.randomUUID(),
            nome: file.name,
            url: reader.result as string
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  }


  removerFoto(id: string) {
    this.fotos.update(arr => arr.filter(f => f.id !== id));
  }


    /*  async onFilesSelected(files: FileList | null) {
        if (!files) return;
        this.erroUpload.set(null);

        const novos: FotoModel[] = [];
        for (const file of Array.from(files)) {
          if (!this.tiposAceitos.includes(file.type)) {
            this.erroUpload.set('Formato inválido. Use JPG, PNG ou WEBP.');
            continue;
          }
          const tamanhoMb = file.size / (1024 * 1024);
          if (tamanhoMb > this.maxTamanhoMb) {
            this.erroUpload.set(`Arquivo muito grande (${tamanhoMb.toFixed(1)} MB). Máx ${this.maxTamanhoMb} MB.`);
            continue;
          }
          const url = await this.toDataUrl(file);
          novos.push({
            id: uid(),
            nome: file.name,
            tipo: file.type,
            url,
            tamanho: file.size
          });
        }

        const total = this.fotos().length + novos.length;
        if (total > this.maxFotos) {
          this.erroUpload.set(`Máximo de ${this.maxFotos} fotos.`);
          return;
        }
        this.fotos.update(arr => [...arr, ...novos]);
      }

      private toDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      removerFoto(id: string) {
        this.fotos.update(arr => arr.filter(f => f.id !== id));
      }
    */
    limparFotos() {
  //      this.fotos.set([]);
      }

   salvar() {
    if (this.imovelForm.invalid) {
      this.imovelForm.markAllAsTouched();
      return;
    }


    this.imovelForm.reset();
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

          this.cepService.buscarEndereco(cepValue).pipe(
            take(1) // Pega apenas a primeira emissão e finaliza
          ).subscribe({
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
      get enderecoGroup(): FormGroup {
        return this.imovelForm.get('endereco') as FormGroup;
    }

}
