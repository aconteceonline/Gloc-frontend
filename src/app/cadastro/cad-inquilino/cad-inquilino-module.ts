import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CadInquilinoRoutingModule } from './cad-inquilino-routing-module';
import { Cadinquilino } from './cad-inquilino/cad-inquilino';


@NgModule({
  declarations: [
    Cadinquilino
  ],
  imports: [
    CommonModule,
    CadInquilinoRoutingModule
  ]
})
export class CadInquilinoModule { }
