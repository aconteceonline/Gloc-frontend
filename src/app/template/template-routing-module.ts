import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './layout/layout';



const routes: Routes = [

  { path: '',
     component: Layout ,

     children:  [

//lista pessoas
       {
       path: 'menuconsultar/pessoas',
        loadChildren: () => import ('../consultas/consulta-pessoas/consultar-pessoas-module').then(m => m.ConsultarPessoasModule),
        pathMatch: 'full',
        data: { titulo: 'MENU CONSULTAR', subTitulo: 'Realiza Consulta de novas Pessoas, Imóveis e Locações'}
      },
//editar pessoa
       {
       path: 'editarpessoas/buscar/:id',
        loadChildren: () => import ('../editar/editar-pessoas/editar-pessoas-module').then(m => m.EditarPessoasModule),
        pathMatch: 'full',
        data: { titulo: 'CADASTRO PESSOAS', subTitulo: 'Edita Pessoas, Imóveis e Locações'}
      },
//cadastra Pessoa
      {
        path: 'menucadastrar/pessoa',
        loadChildren: () => import ('../cadastro/cad-pessoa/cad-pessoa-module').then(m => m.CadPessoaModule),
         pathMatch: 'full',
        data: { titulo: 'CADASTRO PESSOAS', subTitulo: 'Cadastre aqui os novas pessoas'}
      },
//cadatra imovel
      {
        path: 'menucadastrar/cadimovel',
        loadChildren: () => import ('../cadastro/cad-imovel/cad-imovel-module').then(m => m.CadImovelModule),
        pathMatch: 'full',
        data: { titulo: 'CADASTRO IMÓVEIS', subTitulo: 'Cadastre aqui os novos imóveis'}
      },

      {
        path: 'cadresumo',
        loadChildren: () => import ('../cadastro/cad-resumo/cad-resumo-module').then(m => m.CadResumoModule), pathMatch: 'full',
      },


      {
        path: 'dashboard',
        loadChildren: () => import ('../consultas/dashboard/dashboard-module').then(m => m.DashboardModule), pathMatch: 'full',

      },


    ]
  },




];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateRoutingModule { }
