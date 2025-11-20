import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TemplateRoutingModule } from './template-routing-module';
import { Layout } from './layout/layout';
import { MenucadastrarModule } from '../menucadastrar/menucadastrar-module';







@NgModule({
  declarations: [
    Layout,


  ],
  imports: [
    CommonModule,
    TemplateRoutingModule,



  ]
})
export class TemplateModule { }

export { MenucadastrarModule };
