import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Cadpessoa } from './cad-pessoa/cad-pessoa';

const routes: Routes = [

   {
        path: '',
        component:
         Cadpessoa,

      },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CadPessoaRoutingModule { }
