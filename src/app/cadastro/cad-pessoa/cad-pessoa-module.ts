import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CadPessoaRoutingModule } from './cad-pessoa-routing-module';
import { Cadpessoa } from './cad-pessoa/cad-pessoa';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalContato } from '../modal-contato/modal-contato';
import { MatDialogModule } from '@angular/material/dialog'

import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';



@NgModule({
  declarations: [
    Cadpessoa,
    ModalContato,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CadPessoaRoutingModule,
    MatDialogModule,

    NgxMaskDirective,



]
,
 providers: [provideNgxMask({ /* opções de cfg */ })],
 bootstrap: [CadPessoaModule],
})
export class CadPessoaModule { }
