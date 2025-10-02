import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Cadinquilino } from './cad-inquilino/cad-inquilino';

const routes: Routes = [

   {
        path: '',
        component:
         Cadinquilino,

      },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CadInquilinoRoutingModule { }
