import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CadPessoaRoutingModule } from './cad-pessoa-routing-module';
import { Cadpessoa } from './cad-pessoa/cad-pessoa';


@NgModule({
  declarations: [
    Cadpessoa
  ],
  imports: [
    CommonModule,
    CadPessoaRoutingModule
  ]
})
export class CadPessoaModule { }
