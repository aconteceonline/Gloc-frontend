import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CadImovelRoutingModule } from './cad-imovel-routing-module';
import { CadImovel } from './cd-imovel/cad-imovel';
import { PessoaModal } from '../../glocModal/pessoa-modal/pessoa-modal';
import { TelefoneMaskPipe } from '../../glocService/TelefoneMaskPipe.service';
import { CpfCnpjMaskPipe } from '../../glocService/CpfCnpjMaskPipe.service';



@NgModule({
  declarations:
   [
    CadImovel,

   ],
  imports: [
    CommonModule,
     ReactiveFormsModule,
     FormsModule,
     ReactiveFormsModule,
    CadImovelRoutingModule,
    PessoaModal,
     TelefoneMaskPipe,
     CpfCnpjMaskPipe

  ]
})
export class CadImovelModule { }
