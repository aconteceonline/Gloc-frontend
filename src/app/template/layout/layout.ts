import {   Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { filter, map } from 'rxjs';
import { LayoutProps } from './layoutprops';
import { UsuarioService } from '../../login/usuario.service';

export interface BaseMenuItem {
  title: string;
  icon: string;
  isSubMenu: boolean;

  // Adicione 'click' aqui, tornando-o opcional
  click?: string; // Esta propriedade armazena a string 'logout'
}
// Interface para itens sem submenu
export interface SimpleMenuItem extends BaseMenuItem {
  isSubMenu: false;
  link: string;
}
// Interface para itens de submenu
export interface SubMenuItem extends BaseMenuItem {
  isSubMenu: true;
  expanded: boolean;
  children: { title: string; link: string; }[];
  // O link é opcional ou undefined neste caso
  link?: string;
}

// O tipo final que seu array usa é a união destes dois
export type MenuItem = SimpleMenuItem | SubMenuItem;

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout  implements  OnInit {

  usuarioLogado: string | null = null;
  // Estado para controlar se o menu está expandido ou recolhido
  isSidebarCollapsed: boolean = false;

// 1. Estrutura de Dados do Menu
  menuItems = [

    {
        title: 'Dashboard',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', // 🏠 Ícone de Casa/Home (Dashboard)
        link: '/principal/dashboard',
        isSubMenu: false
    },
        {
        title: 'Avisos',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M10 20H4v-2a3 3 0 015.356-1.857M10 12a3 3 0 100-6 3 3 0 000 6zm7-3a3 3 0 11-6 0 3 3 0 016 0z',
        link: '/dashboard',
        isSubMenu: false
    },
    {
        title: 'Clientes',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M10 20H4v-2a3 3 0 015.356-1.857M10 12a3 3 0 100-6 3 3 0 000 6zm7-3a3 3 0 11-6 0 3 3 0 016 0z',
        expanded: false,
        isSubMenu: true,
        children: [
            { title: 'Novo Cliente', link: '/principal/menucadastrar/pessoa' },
            { title: 'Lista de Clientes', link: '/principal/menuconsultar/pessoas' },

        ]
    },
    {
        title: 'Imóveis',
        icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V11a2 2 0 012-2z',
        expanded: false,
        isSubMenu: true,
        children: [
            { title: 'Novo Imóvel', link: '/principal/menucadastrar/cadimovel' },
            { title: 'Lista de Imoveis', link: '/products/list' },
        ]
    },
    {
        title: 'Contratos',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M10 20H4v-2a3 3 0 015.356-1.857M10 12a3 3 0 100-6 3 3 0 000 6zm7-3a3 3 0 11-6 0 3 3 0 016 0z',
        link: '/dashboard',
        isSubMenu: false
    },
    {
        title: 'Movimentações',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M10 20H4v-2a3 3 0 015.356-1.857M10 12a3 3 0 100-6 3 3 0 000 6zm7-3a3 3 0 11-6 0 3 3 0 016 0z',
        link: '/dashboard',
        isSubMenu: false
    },
    {
        title: 'Configurações',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M10 20H4v-2a3 3 0 015.356-1.857M10 12a3 3 0 100-6 3 3 0 000 6zm7-3a3 3 0 11-6 0 3 3 0 016 0z',
        link: '/dashboard',
        isSubMenu: false
    },
    {
        title: 'Treinamento',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M10 20H4v-2a3 3 0 015.356-1.857M10 12a3 3 0 100-6 3 3 0 000 6zm7-3a3 3 0 11-6 0 3 3 0 016 0z',
        link: '/dashboard',
        isSubMenu: false
    },



];

  // 2. Função para alternar o estado do submenu
  toggleSubMenu(item: any) {
    if (item.isSubMenu) {
      item.expanded = !item.expanded;
    }
  }

  // Função existente para alternar a sidebar principal
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  executeAction() {

      this.logout();
  }


  // Largura do menu expandido (ex: 16rem = w-64)
  readonly expandedWidth = 'w-64';

  // Largura do menu recolhido (ex: 4rem = w-16)
  readonly collapsedWidth = 'w-16';



   @Input() props: LayoutProps = { titulo: 'Gerencie contratos de locação em uma plataforma imobiliária completa',
      subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade' }

   constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
   ){}


  ngOnInit(): void {
    this.usuarioLogado = this.authService.getUsername()
    console.log(' usuario logado  layout ', this.usuarioLogado  )
    this.router.events
    .pipe(
      filter( () => this.activatedRoute.firstChild !== null),
      map( () => this.obterPropiedadeLayout())
    ).subscribe( (props: LayoutProps) => this.props = props )

  }



   obterPropiedadeLayout() : LayoutProps{
     let  rotaFilha = this.activatedRoute.firstChild;

    while(rotaFilha?.firstChild) {
      rotaFilha = rotaFilha.firstChild;
    }
    return rotaFilha?.snapshot.data as LayoutProps;
   }

  logout(){
    this.authService.logout();
  }

}
