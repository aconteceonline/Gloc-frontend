import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CadProprietarioRoutingModule } from './cad-proprietario-routing-module';
import { CadProprietario } from './cad-proprietario';


@NgModule({
  declarations: [
    CadProprietario
  ],
  imports: [
    CommonModule,
    CadProprietarioRoutingModule,
     ReactiveFormsModule

  ]
})
export class CadProprietarioModule { }
