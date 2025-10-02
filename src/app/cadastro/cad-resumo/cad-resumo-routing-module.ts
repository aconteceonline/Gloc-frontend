import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadResumo } from './cad-resumo';

const routes: Routes = [
   {
     path: '',
     component:
      CadResumo,
   
   },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CadResumoRoutingModule { }
