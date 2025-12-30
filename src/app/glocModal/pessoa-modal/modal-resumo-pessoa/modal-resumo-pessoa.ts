import { ChangeDetectorRef, Component, inject, viewChild } from '@angular/core';
import { PessoaService } from '../../../glocService/pessoa.service';
import { InteresseService } from '../../../glocService/interesse.serivice';
import { ModalMsgWhatsapp } from '../modal-msg-whatsapp/modal-msg-whatsapp';


@Component({
  selector: 'app-modal-resumo-pessoa',
  standalone: false,
  templateUrl: './modal-resumo-pessoa.html',
  styleUrl: './modal-resumo-pessoa.scss'
})
export class ModalResumoPessoa {
  private cdr = inject(ChangeDetectorRef);
  private interesseService = inject(InteresseService);
  readonly modalWhats = viewChild.required<ModalMsgWhatsapp>('modalWhats');
  carregando: boolean = false; // Adicione esta linha
  exibirModal: boolean = false;
  pessoa: any = null;

templatesWhats = [
  {
    id: 1,
    label: '👋 Saudação Inicial',
    texto: 'Olá [NOME], tudo bem? Gostaria de confirmar o recebimento do seu cadastro em nossa plataforma.'
  },
  {
    id: 2,
    label: '🏠 Interesse em Imóvel',
    texto: 'Olá [NOME]! Vi que você tem interesse em um imóvel com [DORMITÓRIOS] dormitórios. Temos algumas opções novas, podemos conversar?'
  },
  {
    id: 3,
    label: '📄 Documentação',
    texto: 'Olá! Para prosseguirmos com a sua análise, você poderia me enviar uma foto do seu RG e comprovante de renda?'
  }
];

  // Método chamado pelo componente Pai
  public abrir(dadosPessoa: any) {
    if (dadosPessoa && dadosPessoa.objetivo) {
      dadosPessoa.objetivo = dadosPessoa.objetivo.trim();
    }
    this.pessoa = dadosPessoa;
    this.exibirModal = true;
    this.cdr.detectChanges();
  }

    fechar() {
      this.exibirModal = false;
      this.pessoa = null;

    }

  salvarObservacao() {
    const idPerfil = this.pessoa?.id_perfil_interesse; // Verifique o nome correto da sua PK
    const observacao = this.pessoa.obs_interesse;

    if (!idPerfil) {
      console.error('ID do perfil não encontrado');
      return;
    }

    this.interesseService.atualizarObservacao(idPerfil, observacao).subscribe({
      next: (res) => {
        // Se tiver um serviço de Toast, use-o aqui
        alert('Nota atualizada com sucesso!');

        // Opcional: Atualizar a data de atualização na tela na hora
        this.pessoa.updated_at = new Date();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao salvar nota', err);
        alert('Erro ao atualizar a nota. Tente novamente.');
      }
    });
  }

  imprimirResumo() {
    const conteudo = document.getElementById('secao-imprimivel');
    if (!conteudo) return;

    // Cria um iframe oculto para a impressão
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Injeta o HTML e o CSS necessário (Tailwind via CDN para garantir estilização rápida)
    doc.write(`
      <html>
        <head>
          <title>Ficha Cadastral - ${this.pessoa?.nome_social}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { background: white !important; font-family: sans-serif; }
              .no-print { display: none !important; }
              /* Garante que o texto saia preto e nítido */
              h3, h4, p { color: black !important; }
              .bg-blue-900, .bg-blue-600 { background-color: #1e3a8a !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="p-4">
            ${conteudo.innerHTML}
          </div>
        </body>
      </html>
    `);

    doc.close();

    // Aguarda carregar o CSS e dispara a impressão
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      document.body.removeChild(iframe); // Limpa o DOM após imprimir
    }, 500);
  }
  prepararWhats(pessoa: any) {
      const modal = this.modalWhats();
      if (modal) {
        modal.abrir(pessoa); // Chama a função do filho
      } else {
        console.error('Erro: O modal não foi encontrado via ViewChild!');
    }
  }


}

