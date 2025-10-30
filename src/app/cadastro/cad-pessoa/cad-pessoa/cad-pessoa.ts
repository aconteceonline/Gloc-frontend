
import {  Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn  } from '@angular/forms';
import { LayoutProps } from '../../../template/layout/layoutprops';
import { CepBuscaService } from '../../../services/CepBuscaService'
import {  take, } from 'rxjs';
import { Endereco } from '../../../models/Endereco.model';
import { PessoaModel } from '../../../glocModel/pessoa.model';
import { PessoaService } from '../../../glocService/pessoa.service';
import { EnderecoModel } from '../../../glocModel/endereco.model';
import { ContatoModel } from '../../../glocModel/contato.model';
import { EmpresaModel } from '../../../glocModel/empresa.model';

// --- VALIDADORES CUSTOMIZADOS ---

// Validador de CPF (implementação simplificada para demonstração)
function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf) return null; // Campo vazio é tratado pelo 'required'
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return { 'invalidCpf': true };
    // Aqui viria a lógica completa de verificação de dígitos
    return null;
  };
}

// Validador de CNPJ (implementação simplificada para demonstração)
function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const cnpj = control.value?.replace(/\D/g, '');
    if (!cnpj) return null; // Campo vazio é tratado pelo 'required'
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return { 'invalidCnpj': true };
    // Aqui viria a lógica completa de verificação de dígitos
    return null;
  };
}



@Component({
  selector: 'app-cad-pessoa',
  standalone: false,
  templateUrl: './cad-pessoa.html',
  styleUrl: './cad-pessoa.scss'
})
export class Cadpessoa {

  id: any;

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
      whatsapp: 0,
      email: '',
  }

  // Injetando o service
  private pessoaService = inject(PessoaService);

  get enderecoForm(): FormGroup {
    return this.pessoaForm.get('endereco') as FormGroup;
  }


  isChecked = false;
  loading: boolean = false;
  erroBusca: boolean = false;
  pessoaForm: FormGroup;

  props: LayoutProps ={ titulo: 'GLOC - Gestão de Locação', subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade' }


  constructor(
         private fb: FormBuilder,
         private cepService: CepBuscaService,
  ) {
    this.pessoaForm = this.fb.group(
      {
         tipo: ['PF', Validators.required], // Valor inicial: Pessoa Física

      // Campos PF
      cpf: [],
      rg: [''],
      orgEmis: [''],
      dtEmis: [''],
      nome: ['', Validators.required],
      cnpj: [],
      nmFantasia: ['', Validators.required],
      rzSocial: [''],
      email: [''],
      celular: ['', Validators.required],
      zap: [''],

     // NOVO: FormGroup para Endereço
      endereco: this.fb.group({
        cep: ['', Validators.required],
        logradouro: [''],
        numero: ['', Validators.required],
        complemento: [''], // Opcional
        bairro: [''],
        cidade: [''],
        uf: [''],
      }),
    }); // Inicializa vazio

  }

  ngOnInit(): void {

  // Escuta mudanças no campo 'type' para alternar validação
    this.pessoaForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.toggleValidation(tipo);
    });

    // Configura a validação inicial para PF
    this.toggleValidation('PF');

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
    const cpfControl = this.pessoaForm.get('cpf');
    const nomeControl = this.pessoaForm.get('nome');
    const cnpjControl = this.pessoaForm.get('cnpj');
    const razaoSocialControl = this.pessoaForm.get('rzSocial');
    const nomeFantasiaControl = this.pessoaForm.get('nmFantasia');

    if (tipo === 'PF') {
      // Habilita validação PF
      cpfControl?.setValidators([Validators.required, cpfValidator()]);
      nomeControl?.setValidators([Validators.required]);

      // Desabilita validação PJ
      cnpjControl?.setValidators(null);
      razaoSocialControl?.setValidators(null);
      nomeFantasiaControl?.setValidators(null);
    } else { // PJ
      // Habilita validação PJ
      cnpjControl?.setValidators([Validators.required, cnpjValidator()]);
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
  isInvalid(controlName: string, groupName: string = ''): boolean {
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
           this.Pessoa.id_cpf_cnpj = this.pessoaForm.value.cpf;
        } else{
            this.Pessoa.id_cpf_cnpj = this.pessoaForm.value.cnpj;
        }
            console.log("this.pessoaForm.value.tipo = " + this.pessoaForm.value.cpf )
            console.log("this.Pessoa.id_cpf_cnpj= " + this.Pessoa.id_cpf_cnpj)
    //  this.Pessoa.id_cpf_cnpj = this.pessoaForm.value.id_cpf_cnpj;
      this.Pessoa.orgao = this.pessoaForm.value.orgEmis;
      const dataComBarras = this.pessoaForm.value.dtEmis.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
      this.Pessoa.dt_expedicao = dataComBarras


  console.log("this.Pessoa = " + this.Pessoa.id_cpf_cnpj )


      this.pessoaService.cadastrarPessoa(this.Pessoa).subscribe({
          next: (response) => {
            // 2. Tratar o sucesso da requisição
            console.log('Pessoa cadastrada com sucesso!', response);
            alert(`Pessoa ${response.nome} cadastrada com ID: ${response.id}`);
            this.id = response.id;
             console.log('Pessoa id!', response.id);

       // Opcional: Limpar o formulário
       // this.Pessoa = { nome: '', email: '', idade: 0 };
          },
          error: (error) => {
            // 3. Tratar erros da requisição
            console.error('Erro ao cadastrar pessoa:', error);
            alert('Ocorreu um erro no cadastro. Verifique o console.');
          },
      complete: () => {
        // Opcional: Ação ao completar (se o Observable terminar)
        console.log('Requisição de cadastro concluída.');
     }
    });
  }
/*
*  EmpresaModel
*/
/*      this.Empresa.id_pessoa_fk = this.id
      this.Empresa.nm_fantasia = this.pessoaForm.value.nmFantasia;
      this.Empresa.rz_social = this.pessoaForm.value.rzSocial;
      this.pessoaService.cadastrarPessoa(this.Pessoa).subscribe({
          next: (response) => {
            // 2. Tratar o sucesso da requisição
            console.log('Pessoa cadastrada com sucesso!', response);
            alert(`Pessoa ${response.nome} cadastrada com ID: ${response.id}`);

       // Opcional: Limpar o formulário
       // this.Pessoa = { nome: '', email: '', idade: 0 };
          },
          error: (error) => {
            // 3. Tratar erros da requisição
            console.error('Erro ao cadastrar pessoa:', error);
            alert('Ocorreu um erro no cadastro. Verifique o console.');
          },
      complete: () => {
        // Opcional: Ação ao completar (se o Observable terminar)
        console.log('Requisição de cadastro concluída.');
     }
    });
*/
/*
*  contatoModel
*/
 /*     this.Contato.id_pessoa_fk = this.id
      this.Contato.nr_contato = this.pessoaForm.value.celular;
      this.Contato.whatsapp = this.pessoaForm.value.zap;
      this.pessoaService.cadastrarPessoa(this.Pessoa).subscribe({
          next: (response) => {
            // 2. Tratar o sucesso da requisição
            console.log('Pessoa cadastrada com sucesso!', response);
            alert(`Pessoa ${response.nome} cadastrada com ID: ${response.id}`);

       // Opcional: Limpar o formulário
       // this.Pessoa = { nome: '', email: '', idade: 0 };
          },
          error: (error) => {
            // 3. Tratar erros da requisição
            console.error('Erro ao cadastrar pessoa:', error);
            alert('Ocorreu um erro no cadastro. Verifique o console.');
          },
      complete: () => {
        // Opcional: Ação ao completar (se o Observable terminar)
        console.log('Requisição de cadastro concluída.');
     }
    });
*/
//endereco
/*      this.Endereco.id_pessoa_fk = this.id
      this.Endereco.cep = this.pessoaForm.value.endereco.cep;
      this.Endereco.numero =  this.pessoaForm.value.endereco.numero;
      this.Endereco.complemento = this.pessoaForm.value.endereco.complemento;

      this.pessoaService.cadastrarPessoa(this.Pessoa).subscribe({
          next: (response) => {
            // 2. Tratar o sucesso da requisição
            console.log('Pessoa cadastrada com sucesso!', response);
            alert(`Pessoa ${response.nome} cadastrada com ID: ${response.id}`);

       // Opcional: Limpar o formulário
       // this.Pessoa = { nome: '', email: '', idade: 0 };
          },
          error: (error) => {
            // 3. Tratar erros da requisição
            console.error('Erro ao cadastrar pessoa:', error);
            alert('Ocorreu um erro no cadastro. Verifique o console.');
          },
      complete: () => {
        // Opcional: Ação ao completar (se o Observable terminar)
        console.log('Requisição de cadastro concluída.');
     }
    });

// 1. Chamar o método do service para enviar o POST


    // this.Pessoa = this.pessoaForm.value
     console.log('Pessoa cadastrada com sucesso!'   , this.Pessoa);

     console.log('Pessoa cadastrada com sucesso!'   , this.pessoaForm);








  }
  else {
      // Marca todos os campos como 'touched' para exibir as mensagens de erro
      this.pessoaForm.markAllAsTouched();
      alert('Por favor, preencha todos os campos obrigatórios e corrija os erros.');
    }
}


*/




/*
      alert('Cadastro de Vendedor realizado com sucesso!');
      // TODO: Chamar o serviço de backend para salvar


  //    this.receivedData = "";
      this.pessoaForm.reset();
    } else {
      // Marca todos os campos como 'touched' para exibir as mensagens de erro
      this.pessoaForm.markAllAsTouched();
      alert('Por favor, preencha todos os campos obrigatórios e corrija os erros.');
    }
  }*/
 }
}
