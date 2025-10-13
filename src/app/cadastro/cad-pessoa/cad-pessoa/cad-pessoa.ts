
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn  } from '@angular/forms';
import { LayoutProps } from '../../../template/layout/layoutprops';
import { CepBuscaService } from '../../../services/CepBuscaService'
import { take } from 'rxjs';
import { Endereco } from '../../../models/Endereco.model';
import { MatDialog } from '@angular/material/dialog';
import { ModalContato } from '../../modal-contato/modal-contato';




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
export class Cadpessoa  implements OnInit {

  get enderecoForm(): FormGroup {
    return this.pessoaForm.get('endereco') as FormGroup;
  }

  dialog: MatDialog = new MatDialog;

  loading: boolean = false;
  erroBusca: boolean = false;
  pessoaForm: FormGroup;

  props: LayoutProps ={ titulo: 'GLOC - Gestão de Locação', subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade' }


  constructor(
   private fb: FormBuilder,
   private cepService: CepBuscaService
  ) {
    this.pessoaForm = this.fb.group(
      {
         tipo: ['PF', Validators.required], // Valor inicial: Pessoa Física

      // Campos PF
      cpf: ['', [Validators.required, cpfValidator()]],
      nome: ['', Validators.required],

      // Campos PJ
      cnpj: [''],
      contato: [''],
      nomeFantasia: [''],

      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],

     // NOVO: FormGroup para Endereço
      endereco: this.fb.group({
        cep: ['', Validators.required],
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''], // Opcional
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        uf: ['', Validators.required],
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

  openModal() {
    this.dialog.open(ModalContato, {
        width: '990px',
        height: '500px',
      //  data:  contato

      })


  }
   closeModal() {

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
    const razaoSocialControl = this.pessoaForm.get('contato');
    const nomeFantasiaControl = this.pessoaForm.get('nomeFantasia');

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

   onSubmit(): void {
    if (this.pessoaForm.valid) {
      console.log('Formulário Válido, Dados Enviados:', this.pessoaForm.value);


      alert('Cadastro de Vendedor realizado com sucesso!');
      // TODO: Chamar o serviço de backend para salvar


      this.pessoaForm.reset();
    } else {
      // Marca todos os campos como 'touched' para exibir as mensagens de erro
      this.pessoaForm.markAllAsTouched();
      alert('Por favor, preencha todos os campos obrigatórios e corrija os erros.');
    }
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


}
