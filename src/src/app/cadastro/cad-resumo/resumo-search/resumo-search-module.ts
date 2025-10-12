import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResumoSearchRoutingModule } from './resumo-search-routing-module';
import { ResumoSearch } from './resumo-search';


@NgModule({
  declarations: [
    ResumoSearch
  ],
  imports: [
    CommonModule,
    ResumoSearchRoutingModule
  ]
})
export class ResumoSearchModule { }
