import {  ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { filter, map } from 'rxjs';
import { LayoutProps } from './layoutprops';



@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout  implements  OnInit {

   @Input() props: LayoutProps = { titulo: 'Gerencie contratos de locação em uma plataforma imobiliária completa',
      subTitulo: 'Uma solução de longo prazo para negócios de alta prioridade' }

   constructor(private router: Router, private activatedRoute: ActivatedRoute, private authService: AuthService, private cdr: ChangeDetectorRef ){}


  ngOnInit(): void {

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
