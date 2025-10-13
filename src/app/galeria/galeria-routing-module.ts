import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Cadgalerias } from './cadgalerias/cadgalerias';


const routes: Routes = [
  {
    path: 'galeria',
    component: Cadgalerias,
    loadChildren: () => import('./galeria-module').then(m => m.GaleriaModule),
    pathMatch: 'full'
  },
  {
    path: 'categoria',
    loadChildren: () => import('../categoria/categoria-module').then(m => m.CategoriaModule),
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GaleriaRoutingModule { }
