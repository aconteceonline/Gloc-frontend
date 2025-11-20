import {  Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, FormControl  } from '@angular/forms';
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
    orgao: '',
    dt_expedicao: '',
   }
hoje: Date = new Date();
  Endereco: EnderecoModel = {
     id_pessoa_fk: 0,
     cep: '',
     numero: 0,
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

  // Injetando o service
  private pessoaService = inject(PessoaService);
  private contatoService = inject(ContatoService);
  private enderecoService = inject(EnderecoService);
  private empresaService = inject(EmpresaService);
  get enderecoForm(): FormGroup {
    return this.pessoaForm.get('endereco') as FormGroup;
  }

  isChecked = false;
  loading: boolean = false;
  erroBusca: boolean = false;
  pessoaForm: FormGroup;

  props: LayoutProps = {
    titulo: 'Gerencie os seus contratos de locação em uma plataforma imobiliária completa',
    subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade'
  };

  constructor(
         private fb: FormBuilder,
         private cepService: CepBuscaService,
  ) {
    this.pessoaForm = this.fb.group(
      {
      tipo: ['PF', Validators.required],
      [this.cpfControlName]: [''], // A validação 'required' será adicionada no toggleValidation
      [this.cnpjControlName]: [''], // A validação 'required' será adicionada no toggleValidation
      rg: [''],
      nome: ['', Validators.required],
      nmFantasia: ['', Validators.required],
      rzSocial: ['', Validators.required],
      email: [''],
      celular: ['', Validators.required],
      zap: new FormControl(false) ,

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
    // Inicializa vazio
  this.pessoaForm.get('nr_cpf');
  this.pessoaForm.get('nr_cpf')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });

  }

  ngOnInit(): void {
    // Inicialização da escuta reativa (opcional, mas bom para reatividade em tempo real)
    this.setupCpfCnpjListener();

  // Escuta mudanças no campo 'type' para alternar validação
    this.pessoaForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.toggleValidation(tipo);
    });

    // Configura a validação inicial para PF
    this.toggleValidation('PF');

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
      this.pessoaForm.get(this.cpfControlName)?.setErrors(null);
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
    return this.pessoaForm.get('endereco') as FormGroup;
  }


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
      this.Pessoa.id_tipo_pessoa_fk = 1;
      this.Pessoa.id_cargo_func_fk = 1;
      this.Pessoa.id_situacao_fk = 1
      this.Pessoa.nome = this.pessoaForm.value.nome;
      if ( this.pessoaForm.value.tipo == 'PF') {
           this.Pessoa.id_cpf_cnpj = this.pessoaForm.value.nr_cpf;
        } else{
            this.Pessoa.id_cpf_cnpj = this.pessoaForm.value.nr_cpf;
      }
      this.Pessoa.orgao = this.pessoaForm.value.orgEmis;
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
          },

      complete: () => {
        this.cadastaContato()
        this.cadastraEndereco();
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
      this.enderecoService.cadastrarEndereco(this.Endereco).subscribe({
      complete: () => {
           this.pessoaForm.reset();
           alert('Cadastro de realizado com sucesso!');
     }
    });
};
/*----------------------------------------------
*  Cadastro Empresa
*-----------------------------------------------
*/
 cadastraEmpresa(){
      this.Empresa.id_pessoa_fk = this.id
      this.Empresa.nm_fantasia = this.pessoaForm.value.nmFantasia;
      this.Empresa.rz_social = this.pessoaForm.value.rzSocial;
      this.empresaService.cadastrarEmpresa(this.Empresa).subscribe({
      complete: () => {
          this.pessoaForm.reset();
           alert('Cadastro de realizado com sucesso!');

     }
    });
};


};

