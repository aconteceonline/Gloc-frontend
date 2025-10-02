import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CadResumoRoutingModule } from './cad-resumo-routing-module';
import { CadResumo } from './cad-resumo';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    CadResumo
  ],
  imports: [
    CommonModule,
    CadResumoRoutingModule,
    ReactiveFormsModule
  ]
})
export class CadResumoModule { }
