import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuconsultarRoutingModule } from './menuconsultar-routing-module';
import { Menuconsultar } from './menuconsultar/menuconsultar';


@NgModule({
  declarations: [
    Menuconsultar
  ],
  imports: [
    CommonModule,
    MenuconsultarRoutingModule
  ]
})
export class MenuconsultarModule { }
