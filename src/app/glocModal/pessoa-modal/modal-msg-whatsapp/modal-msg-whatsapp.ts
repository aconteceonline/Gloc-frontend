import { Component, Input } from '@angular/core';

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

  // Método chamado pelo Pai via ViewChild
 public abrir(pessoa: any) {
  console.log('Fui chamado!')
    this.pessoaSelecionada = pessoa;
    this.exibirModalWhats = true; // <--- ISSO FAZ O MODAL APARECER

    // Define a primeira mensagem como padrão
    if (this.templatesWhats && this.templatesWhats.length > 0) {
      this.aplicarTemplate(this.templatesWhats[0].texto);
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
