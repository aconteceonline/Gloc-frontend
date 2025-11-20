import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CadPessoaRoutingModule } from './cad-pessoa-routing-module';
import { Cadpessoa } from './cad-pessoa/cad-pessoa';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog'

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';




@NgModule({
  declarations: [
    Cadpessoa,


  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CadPessoaRoutingModule,
    MatDialogModule,
    FormsModule,
    NgxMaskDirective,
    NgxMaskPipe



]
,
 providers: [provideNgxMask({ /* opções de cfg */ })],
 bootstrap: [CadPessoaModule],
})
export class CadPessoaModule { }
