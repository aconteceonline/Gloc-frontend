import { CommonModule, } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LayoutProps } from '../../../template/layout/layoutprops';
import { ActivatedRoute, Router } from '@angular/router';


interface Person {
  fullName: string;
  personType: 'fisica' | 'juridica';
  address: string;
  contact: string;
  email: string;
  cpf: string;
  rg: string;
  status: 'ativo' | 'inativo' | 'pendente';
}



@Component({
  selector: 'app-cad-pessoa',
  standalone: false,
  templateUrl: './cad-pessoa.html',
  styleUrl: './cad-pessoa.scss'
})
export class Cadpessoa  implements OnInit {

 // Objeto para armazenar os dados do formulário com valores iniciais
  person: Person = {
    fullName: '',
    personType: 'fisica', // Inicia como Pessoa Física
    address: '',
    contact: '',
    email: '',
    cpf: '',
    rg: '',
    status: 'ativo' // Inicia como Ativo
  };


  inquilinoForm: FormGroup;

  props: LayoutProps ={ titulo: 'GLOC - Gestão de Locação', subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade' }
  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute) {
    this.inquilinoForm = this.fb.group({}); // Inicializa vazio

  }

  ngOnInit(): void {




    this.inquilinoForm = this.fb.group({
     // Dados Pessoais
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)]],
      telefone: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required]],
      rendaMensal: [null, [Validators.required, Validators.min(0)]],

      // Endereço
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}\-\d{3}$/)]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]]
    });

  }



  // Helper para facilitar o acesso aos controles no template
  get f() {
    return this.inquilinoForm.controls;
  }

  onSubmit(): void {
    if (this.inquilinoForm.invalid) {
      console.log('Formulário inválido!');
      this.inquilinoForm.markAllAsTouched(); // Marca todos os campos como "tocados" para exibir os erros
      return;
    }

    console.log('Formulário enviado com sucesso!');
    console.log(this.inquilinoForm.value);
    // Aqui você chamaria seu serviço para enviar os dados para a API
    // this.inquilinoService.cadastrar(this.inquilinoForm.value).subscribe(...);


  }
}
