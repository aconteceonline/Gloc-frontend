import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, registerLocaleData } from '@angular/common';
import { ListarPessoas } from '../consulta-pessoas/listar-pessoas/listar-pessoas';

import localePt from '@angular/common/locales/pt';
import { ConsultarPessoasRoutingModule } from './consultar-pessoas-routing-module';
import { TelefoneMaskPipe } from '../../glocService/TelefoneMaskPipe.service';
import { provideNgxMask } from 'ngx-mask';
import { FilterViewPessoasPipe } from '../../glocService/filter-view-pessoas.pipe';
import { FormsModule } from '@angular/forms';
import { ModalMsgWhatsapp } from '../../glocModal/pessoa-modal/modal-msg-whatsapp/modal-msg-whatsapp';
import { ModalResumoPessoa } from '../../glocModal/pessoa-modal/modal-resumo-pessoa/modal-resumo-pessoa';
import { provideHttpClient } from '@angular/common/http';

registerLocaleData(localePt);

@NgModule({
  declarations:
  [
    ListarPessoas,

    ModalMsgWhatsapp,
    ModalResumoPessoa,

  ],
  imports: [
    CommonModule,
    FormsModule,
    ConsultarPessoasRoutingModule,
    TelefoneMaskPipe,
    FilterViewPessoasPipe
  ],
 providers: [
  provideNgxMask({ /* opções de cfg */ }),
  CurrencyPipe,
  { provide: LOCALE_ID, useValue: 'pt-BR' },
  provideHttpClient(),

 ],
 bootstrap: [ConsultarPessoasModule],
})
export class ConsultarPessoasModule { }
