import { Component, Input } from '@angular/core';
import { IaService } from '../../../glocService/IaService';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-modal-msg-whatsapp',
  standalone: false,
  templateUrl: './modal-msg-whatsapp.html',
  styleUrl: './modal-msg-whatsapp.scss'
})
export class ModalMsgWhatsapp {
// Recebe a lista do componente Pai
  @Input() templatesWhats: any[] = [];

  // Propriedades internas de controle
  exibirModalWhats: boolean = false;
  pessoaSelecionada: any = null;
  mensagemCustom: string = '';
  carregandoIA: boolean = false; // Novo estado


  constructor(private iaService: IaService) {} // Injetar serviço

  // Método chamado pelo Pai via ViewChild
 public abrir(pessoa: any) {

 this.pessoaSelecionada = pessoa;
    this.exibirModalWhats = true;
    if (this.templatesWhats?.length > 0) {
      this.aplicarTemplate(this.templatesWhats[0].texto);
    }
  }

  // NOVA FUNÇÃO: Integração com IA
async melhorarComIA() {
  if (!this.mensagemCustom) return;
  this.carregandoIA = true;

  try {
    const textoGerado = await this.iaService.gerarPropaganda(this.mensagemCustom);
    this.mensagemCustom = textoGerado;
  } catch (err) {
    console.error('Erro detalhado:', err);
    alert('Erro ao acessar a IA. Verifique sua chave.');
  } finally {
    this.carregandoIA = false;
  }
}

  fecharModalWhats() {
    this.exibirModalWhats = false;
    this.pessoaSelecionada = null;
  }

  aplicarTemplate(texto: string) {
    if (!this.pessoaSelecionada) return;

    this.mensagemCustom = texto
      .replace('[NOME]', this.pessoaSelecionada.nome_social || 'Cliente')
      .replace('[CARGO]', this.pessoaSelecionada.ds_cargo || 'sua área')
      .replace('[RENDA]', new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
        .format(this.pessoaSelecionada.renda_comprovada || 0));
  }

  dispararWhatsapp() {
    if (!this.pessoaSelecionada?.nr_contato) return;

    const numeroLimpo = this.pessoaSelecionada.nr_contato.replace(/\D/g, '');
    const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(this.mensagemCustom)}`;

    window.open(url, '_blank');
    this.fecharModalWhats();
  }
}
