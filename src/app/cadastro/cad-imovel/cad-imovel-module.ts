import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CadImovelRoutingModule } from './cad-imovel-routing-module';
import { CadImovel } from './cd-imovel/cad-imovel';
import { PessoaModal } from '../../glocModal/pessoa-modal/pessoa-modal';
import { TelefoneMaskPipe } from '../../glocService/TelefoneMaskPipe.service';
import { CpfCnpjMaskPipe } from '../../glocService/CpfCnpjMaskPipe.service';
import { ModalCadastroPessoa } from '../../glocModal/pessoa-modal/modal-cadastro-pessoa';
import localePt from '@angular/common/locales/pt';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations:
   [
    CadImovel,

   ],
  imports: [
     CommonModule,
     FormsModule,
     ReactiveFormsModule,
     CadImovelRoutingModule,
     PessoaModal,
     ModalCadastroPessoa,
     TelefoneMaskPipe,
     CpfCnpjMaskPipe,
     NgxMaskDirective,
     NgxMaskPipe


  ],
   providers: [provideNgxMask({ /* opções de cfg */ }),
    CurrencyPipe,
    { provide: LOCALE_ID, useValue: 'pt-BR' }
   ],
   bootstrap: [CadImovelModule],
})
export class CadImovelModule { }
