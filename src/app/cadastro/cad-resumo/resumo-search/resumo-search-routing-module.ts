import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ResumoSearch } from './resumo-search';

const routes: Routes = [
      {
      path: '',
      component:
       ResumoSearch,
    
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResumoSearchRoutingModule { }
