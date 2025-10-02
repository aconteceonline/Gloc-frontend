import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenucadastrarRoutingModule } from './menucadastrar-routing-module';
import { Menucadastrar } from './menucadastrar/menucadastrar';






@NgModule({
  declarations: [
    Menucadastrar
  ],
  imports: [
    CommonModule,
    MenucadastrarRoutingModule,




  ]
})
export class MenucadastrarModule { }
