import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GaleriaRoutingModule } from './galeria-routing-module';
import { Cadgalerias } from './cadgalerias/cadgalerias';


@NgModule({
  declarations: [
    Cadgalerias
  ],
  imports: [
    CommonModule,
    GaleriaRoutingModule
  ]
})
export class GaleriaModule { }
