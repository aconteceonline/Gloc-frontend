import { Component, computed,  signal } from '@angular/core';
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

export interface ContatoPessoa{
    id?: number;
    id_pessoa_fk?: number,
    nr_contato:  string | null,
}


function uid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}


@Component({
  selector: 'app-cad-imovel',
  standalone: false,
  templateUrl: './cad-imovel.html',
  styleUrl: './cad-imovel.scss',

})
export class CadImovel  {

  modalAberto = signal(false);

  contato$!: Observable<ContatoModel>;

   // Estado de fotos
  fotos = signal<FotoModel[]>([]);
  fotosCount = computed(() => this.fotos().length);

  Endereco: EnderecoModel = {
     id_pessoa_fk: 0,
     cep: '',
     numero: 0,
     complemento: '',
  }

  get enderecoForm(): FormGroup {
      return this.imovelForm.get('endereco') as FormGroup;
  }
  loading: boolean = false;
  erroBusca: boolean = false;
  imovelForm: FormGroup;

  contatoTrue= true
  nr_contato: any = ''
  zap = ''

// 1. Variável para armazenar o contato encontrado
  contatoEncontrado: ContatoModel = {};
  contatocontato = '' ;
  erroBuscaContato: string | undefined;

// Limites e validações de upload
  maxFotos = 10;
  maxTamanhoMb = 10;
  tiposAceitos = ['image/jpeg', 'image/png', 'image/webp'];

  uploading = signal(false);
  erroUpload = signal<string | null>(null);
  sucesso = signal<string | null>(null);

  pessoaSelecionada = signal<PessoaModel | any>(null);

  props: LayoutProps ={ titulo: 'GLOC - Gestão de Locação', subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade' }


  constructor(
    private fb: FormBuilder,
    public imoveis: ImovelService,
    private cepService: CepBuscaService,
    public pessoaService: PessoaService,
    private contatoService: ContatoService
  ) {


     this.imovelForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descricao: ['', [Validators.required, Validators.minLength(10)]],
    tipo: ['casa', Validators.required],
    preco: [null, [Validators.required, Validators.min(0)]],
    dormitorios: [1, [Validators.required, Validators.min(0)]],
    banheiros: [1, [Validators.required, Validators.min(0)]],
    area: [0, [Validators.required, Validators.min(0)]],


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
    });
   }
;

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
    this.fotos.set([]);
  }



async salvar() {
    this.sucesso.set(null);

    if (this.imovelForm.invalid) {
      this.imovelForm.markAllAsTouched();
      return;
    }
    if (this.fotos().length === 0) {
      this.erroUpload.set('Adicione ao menos uma foto.');
      return;
    }

    const payload: ImovelModel = {
      id: uid(),
      ...this.imovelForm.value as any,
      fotos: this.fotos(),
      criadoEm: new Date().toISOString()
    };

    this.uploading.set(true);
    try {
      // Aqui você enviaria para sua API (exemplo com FormData):
      // const fd = new FormData();
      // Object.entries(payload).forEach(([k, v]) => {
      //   if (k === 'fotos') {
      //     payload.fotos.forEach((f, idx) => fd.append(`fotos[${idx}]`, dataURLToBlob(f.url), f.nome));
      //   } else {
      //     fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      //   }
      // });
      // await this.http.post('/api/imoveis', fd).toPromise();

      // Demo: salva local
    //  this.imoveis.add(payload);
      this.sucesso.set('Imóvel cadastrado com sucesso!');
      this.imovelForm.reset({
        tipo: 'casa',
        dormitorios: 1,
        banheiros: 1,
        area: 0
      });
 //     this.limparFotos();
    } catch (e) {
      this.erroUpload.set('Erro ao salvar. Tente novamente.');
    } finally {
      this.uploading.set(false);
    }
  }

  cadastrarPessoa() {
  // Aqui você pode abrir outro modal, navegar para outra rota ou exibir um formulário embutido
  console.log('Abrir cadastro de pessoa');
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
