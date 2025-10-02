import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Menuconsultar } from './menuconsultar/menuconsultar';

const routes: Routes = 
[
  {
    path: '',
    component: Menuconsultar
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuconsultarRoutingModule { }
