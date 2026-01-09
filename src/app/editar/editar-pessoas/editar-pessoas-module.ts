import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { EditarPessoasRoutingModule } from './editar-pessoas-routing-module';
import { EditarPessoas } from './editar-pessoas/editar-pessoas';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';


@NgModule({
  declarations:
  [
    EditarPessoas
  ],
  imports: [
     CommonModule,
     FormsModule,
     ReactiveFormsModule,
     EditarPessoasRoutingModule,
     NgxMaskDirective,
    NgxMaskPipe
  ],

 providers: [
  provideNgxMask({ /* opções de cfg */ }),
  CurrencyPipe,
  { provide: LOCALE_ID, useValue: 'pt-BR' }

 ],
 bootstrap: [EditarPessoasModule],
})
export class EditarPessoasModule { }
