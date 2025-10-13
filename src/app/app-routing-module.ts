import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { authGuard } from './guards/auth-guard';




const routes: Routes = [

    { path: '', component: Login},



    { path: 'principal',
        loadChildren: () => import('./template/template-module').then(m => m.TemplateModule), canActivate: [authGuard]

    },

  ]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  static routes: Routes;
}
