import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CadPessoaRoutingModule } from './cad-pessoa-routing-module';
import { Cadpessoa } from './cad-pessoa/cad-pessoa';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    Cadpessoa
  ],
  imports: [
    CommonModule,
      ReactiveFormsModule,
    CadPessoaRoutingModule

  ]
})
export class CadPessoaModule { }
