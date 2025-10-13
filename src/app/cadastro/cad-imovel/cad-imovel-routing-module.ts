import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadImovel } from './cd-imovel/cad-imovel';

const routes: Routes = [
    {
      path: '',
      component:
       CadImovel,

    },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CadImovelRoutingModule { }
