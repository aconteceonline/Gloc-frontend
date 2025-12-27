import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListarPessoas } from '../consulta-pessoas/listar-pessoas/listar-pessoas';

import { ConsultarPessoasRoutingModule } from './consultar-pessoas-routing-module';


@NgModule({
  declarations:
  [
    ListarPessoas,
  ],
  imports: [
    CommonModule,
    ConsultarPessoasRoutingModule
  ]
})
export class ConsultarPessoasModule { }
