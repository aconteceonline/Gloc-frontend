import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { BucaEnderecoModel as Endereco } from '../../glocModel/busca-endereco.model';
import { CepBuscaService } from '../../services/CepBuscaService';
import { catchError, debounceTime, of, take, throwError, throwIfEmpty } from 'rxjs';
import { EnderecoModel } from '../../glocModel/endereco.model';
import { EmpresaModel } from '../../glocModel/empresa.model';
import { ContatoModel } from '../../glocModel/contato.model';
import { PessoaService } from '../../glocService/pessoa.service';
import { ContatoService } from '../../glocService/contato.service';
import { EnderecoService } from '../../glocService/endereco.service';
import { EmpresaService } from '../../glocService/empresa.service';
import { PessoaModel } from '../../glocModel/pessoa.model';
import { validarCNPJ } from '../../validators/cnpj-validator';
import { validarCelular } from '../../validators/celular-validator'
import { HttpErrorResponse } from '@angular/common/http';
import { validarCPF } from '../../validators/cpf-validator';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-modal-cadastro-pessoa',
  standalone: true,
   styleUrl: './pessoa-modal.scss',
  imports: [CommonModule, ReactiveFormsModule,  NgxMaskDirective ],
  templateUrl: './modal-cadastro-pessoa.html'
})
export class ModalCadastroPessoa implements OnInit  {

  @Input() aberto = false;
  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<any>();
  @Output() cadastrada = new EventEmitter<PessoaModel>()

  public tipoAlerta: 'error' | 'success' | null = null;
  public mensagemDeErro: string | null = null;
  private pessoaService = inject(PessoaService);
  private contatoService = inject(ContatoService);
  private enderecoService = inject(EnderecoService);
  private empresaService = inject(EmpresaService);

  form: FormGroup;
  cnpjValido: boolean | null = null;
  readonly cpfControlName = 'nr_cpf';
  readonly cnpjControlName = 'nr_cnpj';
  cpfValido: boolean | null = null;
  loading: boolean = false;
  erroBusca: boolean = false;
  id: any;
  //res: any | null = null

  Pessoa: PessoaModel = {
    id_tipo_pessoa_fk: undefined,
    id_cargo_func_fk: 0,
    id_situacao_fk: 0,
    id_cpf_cnpj: 0,
    nome: '',
    nome_social: '',
    orgao: '',
    dt_expedicao: '',
   }

/*hoje: Date = new Date();*/

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


  get enderecoForm(): FormGroup {
      return this.form.get('endereco') as FormGroup;
  }

  constructor(
    private fb: FormBuilder,
    private cepService: CepBuscaService,) {

    this.form = this.fb.group(
       {
      tipo: ['PF', Validators.required],
      [this.cpfControlName]: [''], // A validação 'required' será adicionada no toggleValidation
      [this.cnpjControlName]: [''], // A validação 'required' será adicionada no toggleValidation
      rg: [''],
      nome: ['', Validators.required],
      nome_social: ['', Validators.required],
      nmFantasia: ['', Validators.required],
      rzSocial: ['', Validators.required],
      email: [''],
      celular: ['', [Validators.required, Validators.maxLength(11), validarCelular]],
      zap: new FormControl(false) ,
    // NOVO: FormGroup para Endereço
      endereco: this.fb.group({
         cep: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\d{5}-?\d{3}$/), // aceita 8 dígitos com ou sem hífen
            Validators.maxLength(8)
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
   // Inicializa vazio
  this.form.get('nr_cpf');
  this.form.get('nr_cpf')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  ngOnInit(): void {
    // Inicialização da escuta reativa (opcional, mas bom para reatividade em tempo real)
    this.setupCpfCnpjListener();

  // Escuta mudanças no campo 'type' para alternar validação
    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      this.toggleValidation(tipo);
    });

    // Configura a validação inicial para PF
    this.toggleValidation('PF');
  }

// Opcional: Configura a escuta reativa com debounce para não sobrecarregar o backend
  setupCpfCnpjListener() {
    this.form.get(this.cpfControlName)?.valueChanges
      .pipe(
        debounceTime(500), // Espera 500ms antes de reagir
        // Usaria switchMap se quisesse buscar a cada tecla, mas vamos usar o blur
      )
  }

  // 3. NOVO MÉTODO: Chamado ao SAIR do campo (evento blur)
  onCpfBlur() {
    const value = this.form.get('nr_cpf')?.value;
    this.cpfValido = validarCPF(value);
    if(!this.cpfValido){
         this.tipoAlerta = 'error'
         this.form.get(this.cpfControlName)?.setErrors({ 'invalido': true });
    }
    this.mensagemDeErro = null; // Limpa o erro anterior
    this.tipoAlerta = null;
    const control = this.form.get(this.cpfControlName);

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
  //    this.mensagemDeErro = `Já existe cadastro com esse CPF ${cpf}`;
      this.mensagemDeErro = `Já existe cadastro com esse CPF!`;
      this.form.get(this.cpfControlName)?.setErrors({ 'jaExiste': true });
    } else {
      // CPF não cadastrado — segue o fluxo normalmente, sem alertas
      this.form.get(this.cpfControlName)?.setErrors(null);
    }
  });
}

onCelularBlur() {
  const control = this.form.get('celular');
  const rawValue = control?.value || '';
  const cleanedValue = rawValue.replace(/\D/g, '');
  if (rawValue !== cleanedValue && cleanedValue.length === 11) {
    control?.setValue(cleanedValue, { emitEvent: false });
  }
  control?.updateValueAndValidity();
}

  onCnpjBlur() {
    const value = this.form.get('nr_cnpj')?.value;
    this.cnpjValido = validarCNPJ(value);
    if(!this.cnpjValido){
         this.tipoAlerta = 'error'
         this.form.get(this.cnpjControlName)?.setErrors({ 'invalido': true });
    }
    this.mensagemDeErro = null; // Limpa o erro anterior
    this.tipoAlerta = null;
    const control = this.form.get(this.cnpjControlName);

// --- NOVO: Limpeza do Valor ---
    const rawValue = control?.value || '';
    // Remove pontos, traços, espaços e outros caracteres não numéricos
    const cleanedValue = rawValue.replace(/\D/g, '');

    // Se você usa uma máscara de CPF/CNPJ, é crucial atualizar o valor
    // do controle para o valor limpo, para que o validador funcione corretamente.
    if (rawValue !== cleanedValue) {
         control?.setValue(cleanedValue, { emitEvent: false }); // Atualiza o controle sem disparar o valueChanges
    }
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
        this.form.get(this.cpfControlName)?.setErrors({ 'jaExiste': true });
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


  onFechar() {
    this.limparFormularioCompleto();
    this.fechar.emit();
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
    return this.form.get('endereco') as FormGroup;
  }


 toggleValidation(tipo: string): void {
    const cpfControl = this.form.get('nr_cpf');
    const nomeControl = this.form.get('nome');
    const nome_socialControl = this.form.get('nome_social');
    const cnpjControl = this.form.get('nr_cnpj');
    const razaoSocialControl = this.form.get('rzSocial');
    const nomeFantasiaControl = this.form.get('nmFantasia');

    if (tipo === 'PF') {
      // Habilita validação PF
      nomeControl?.setValidators([Validators.required]);
      nome_socialControl?.setValidators([Validators.required]);
      // Desabilita validação PJ
      cnpjControl?.setValidators(null);
      razaoSocialControl?.setValidators(null);
      nomeFantasiaControl?.setValidators(null);
      nome_socialControl?.setValidators(null);
    } else { // PJ
      // Habilita validação PJ
      razaoSocialControl?.setValidators([Validators.required]);
      nomeFantasiaControl?.setValidators([Validators.required]);

      // Desabilita validação PF
      cpfControl?.setValidators(null);
      nomeControl?.setValidators(null);
      nome_socialControl?.setValidators(null);
    }

    // Atualiza o estado dos controles
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
      control = this.form.get(groupName)?.get(controlName);
    } else {
      control = this.form.get(controlName);
    }
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Getter para saber o tipo de pessoa selecionado
  get isPessoaFisica(): boolean {
    return this.form.get('tipo')?.value === 'PF';
  }

 onSubmit() {
    if (this.form.valid) {
      const value = this.form.get('nr_cnpj')?.value;
      console.log( 'value = this.form.get ',    value  )
      if (!value){
        this.Pessoa.id_tipo_pessoa_fk = 1;
      }else{
              this.Pessoa.id_tipo_pessoa_fk = 2;
      }
       console.log( ' this.Pessoa.id_tipo_pessoa_fk',     this.Pessoa.id_tipo_pessoa_fk  )

      this.Pessoa.id_cargo_func_fk = 1;
      this.Pessoa.id_situacao_fk = 1

      if ( this.form.value.tipo == 'PF') {
           this.Pessoa.nome = this.form.value.nome;
           this.Pessoa.nome_social = this.form.value.nome_social;
           this.Pessoa.id_cpf_cnpj = this.form.value.nr_cpf;
            console.log( ' cpf  ',     this.Pessoa.id_cpf_cnpj   )
        } else{
            this.Pessoa.nome = this.form.value.rzSocial;
            this.Pessoa.id_cpf_cnpj = this.form.value.nr_cnpj;
             console.log( ' cnpj  ',     this.Pessoa.id_cpf_cnpj   )
      }

      this.Pessoa.orgao = this.form.value.orgEmis;
      this.Pessoa.dt_expedicao = null
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
               console.log( 'nome ', response.nome)
               this.cadastaContato()
               if(this.Pessoa.id_tipo_pessoa_fk === 2){
                   this.cadastraEmpresa()
               }
               this.cadastraEndereco();
               this.limparFormularioCompleto()
          },
    error: (err) => {
      console.error('Erro ao cadastrar pessoa', err);
    }
  });
 };
 /*----------------------------------------------
*  Cadastro Contato
*-----------------------------------------------
*/
 cadastaContato(){

      this.Contato.id_pessoa_fk = this.id
      this.Contato.nr_contato = this.form.value.celular;
      this.Contato.whatsapp = this.form.value.zap;
      this.contatoService.cadastrarContato(this.Contato).subscribe();

 };
/*----------------------------------------------
*  Cadastro Endereco
*-----------------------------------------------
*/
cadastraEndereco(){
      this.Endereco.id_pessoa_fk = this.id
      this.Endereco.cep = this.form.value.endereco.cep;
      this.Endereco.numero =  this.form.value.endereco.numero;
      this.Endereco.complemento = this.form.value.endereco.complemento;
      this.enderecoService.cadastrarEndereco(this.Endereco).subscribe();

      alert('Cadastro de realizado com sucesso !');
 //     this.form.reset();
     }


/*----------------------------------------------
*  Cadastro Empresa
*-----------------------------------------------
*/
 cadastraEmpresa(){
      this.Empresa.id_pessoa_fk = this.id
      this.Empresa.nm_fantasia = this.form.value.nmFantasia;
      this.Empresa.rz_social = this.form.value.rzSocial;
      this.empresaService.cadastrarEmpresa(this.Empresa).subscribe()
  };

    limparFormularioCompleto() {
      // Reseta o formulário
      this.form.reset();

      // Limpa estados customizados
      this.tipoAlerta = null;
      this.mensagemDeErro = null;
      this.cpfValido = null;
      this.cnpjValido = null;
      this.loading = false;
      this.erroBusca = false;
     // this.res = null;
      this.id = null;

      // Reseta para valores padrão
      this.form.patchValue({
        tipo: 'PF', // Volta para Pessoa Física
        zap: false
      });

      // Limpa erros de validação
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.setErrors(null);
      });

      // Limpa erros do endereço também
      Object.keys(this.enderecoForm.controls).forEach(key => {
        this.enderecoForm.get(key)?.setErrors(null);
      });

      // Marca como pristine e untouched
      this.form.markAsPristine();
      this.form.markAsUntouched();
    }
}
