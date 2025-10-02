import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './layout/layout';



const routes: Routes = [

  { path: '',
     component: Layout ,

     children:  [
      {
        path: 'menucadastrar',
        loadChildren: () => import ('../menucadastrar/menucadastrar-module').then(m => m.MenucadastrarModule ),
        pathMatch: 'full',
        data: { titulo: 'MENU CADASTRAR', subTitulo: 'Realiza Cadastro de novas Pessoas, Imóveis e Locações'},

      },

      {
       path: 'menuconsultar',
        loadChildren: () => import ('../menuconsultar/menuconsultar-module').then(m => m.MenuconsultarModule),
        pathMatch: 'full',
        data: { titulo: 'MENU CONSULTAR', subTitulo: 'Realiza Consulta de novas Pessoas, Imóveis e Locações'}
      },
      {
        path: 'menucadastrar/pessoa',
        loadChildren: () => import ('../cadastro/cad-inquilino/cad-inquilino-module').then(m => m.CadInquilinoModule),
         pathMatch: 'full',
        data: { titulo: 'CADASTRO PESSOAS', subTitulo: 'Cadastre aqui os novas pessoas'}
      },
      {
        path: 'cadimovel',
        loadChildren: () => import ('../cadastro/cad-imovel/cad-imovel-module').then(m => m.CadImovelModule),
        pathMatch: 'full',
        data: { titulo: 'CADASTRO IMÓVEIS', subTitulo: 'Cadastre aqui os novos imóveis'}
      },
      {
        path: 'cadproprietario',
        loadChildren: () => import ('../cadastro/cad-proprietario/cad-proprietario-module').then(m => m.CadProprietarioModule), pathMatch: 'full',
      },
      {
        path: 'cadresumo',
        loadChildren: () => import ('../cadastro/cad-resumo/cad-resumo-module').then(m => m.CadResumoModule), pathMatch: 'full',
      },


    ]
  },




];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateRoutingModule { }
