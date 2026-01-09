import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditarPessoas } from './editar-pessoas/editar-pessoas';

const routes: Routes =
[
  {
      path: '',
        component:
         EditarPessoas,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditarPessoasRoutingModule { }
