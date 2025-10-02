import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Menucadastrar } from './menucadastrar/menucadastrar';
import { authGuard } from '../guards/auth-guard';

const routes: Routes =
[
  {
    path: '',
    component: Menucadastrar,


  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenucadastrarRoutingModule { }
