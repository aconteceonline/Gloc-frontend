import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListarPessoas } from '../consulta-pessoas/listar-pessoas/listar-pessoas';

const routes: Routes =
[
   {
          path: '',
          component:
          ListarPessoas,

        },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultarPessoasRoutingModule { }
