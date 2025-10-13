import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadProprietario } from './cad-proprietario';

const routes: Routes = [
    {
      path: '',
      component:
       CadProprietario,
    
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CadProprietarioRoutingModule { }
