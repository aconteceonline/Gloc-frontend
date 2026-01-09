import { ChangeDetectorRef, Component, inject, OnInit, viewChild } from '@angular/core';
import { ViewListaPessoasModel } from '../../../glocModel/view-lista-pessoas.model';
import { ViewListarPessoasService } from '../../../glocService/view-lista-pessoas.service';
import { CurrencyPipe } from '@angular/common';
import { ModalMsgWhatsapp } from '../../../glocModal/pessoa-modal/modal-msg-whatsapp/modal-msg-whatsapp';
import { ModalResumoPessoa } from '../../../glocModal/pessoa-modal/modal-resumo-pessoa/modal-resumo-pessoa';
import { Router } from '@angular/router';
import { PessoaService } from '../../../glocService/pessoa.service';
import { PessoaModel } from '../../../glocModel/pessoa.model';


export interface Pessoa  {
  id: number;
  id_perfil_interesse: number;
  nome_social: string;
  email: string;
  renda_comprovada: number;
  nome_status: string;
  nr_contato: string;
  ds_cargo: string;
  objetivo_interesse: string,
  obs_interesse: string,
  estado: string,
  municipio: string,
  updated_at: Date
}

@Component({
  selector: 'app-listar-pessoas',
  standalone: false,
  templateUrl: './listar-pessoas.html',
  styleUrl: './listar-pessoas.scss'
})
export class ListarPessoas implements OnInit {

  private pessoaService = inject(PessoaService);
  private router = inject(Router);
  pessoas: PessoaModel[] = [];
  pessoaSelecionada: any = null;
  mensagemCustom: string = '';
  exibirModalWhats: boolean = false; // Controle do modal
  exibirModalResumo: boolean = false; // Controle do modal
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
  listarPessoas: ViewListaPessoasModel[] = [];
  readonly modalWhats = viewChild.required<ModalMsgWhatsapp>('modalWhats');
  modalResumo = viewChild.required<ModalResumoPessoa>('modalResumo');
  private viewListarPessoasService  = inject(ViewListarPessoasService);

  private cdr  = inject (ChangeDetectorRef);
  private currencyPipe  = inject (CurrencyPipe);
  searchText: string = '';
  isDeleting: boolean = false;


  ngOnInit(): void {
    this.carregarPessoas();

  }

// 2. O MÉTODO QUE CHAMA A APLICAÇÃO:
  prepararWhats(pessoa: any) {
      const modal = this.modalWhats();
      if (modal) {
        modal.abrir(pessoa); // Chama a função do filho
      } else {
        console.error('Erro: O modal não foi encontrado via ViewChild!');
    }
  }

// 2. O MÉTODO QUE CHAMA A APLICAÇÃO:
  prepararResumo(pessoa: any) {
      this.modalResumo().abrir(pessoa);
  }

// Crie a função para fechar
fecharModalWhats() {
    this.exibirModalWhats = false;
    this.pessoaSelecionada = null;
}
fechar() {
    this.exibirModalResumo = false;
    this.pessoaSelecionada = null;
}
// Atualize o disparar para fechar o modal
dispararWhatsapp() {
    if (!this.pessoaSelecionada) return;

    const numeroLimpo = this.pessoaSelecionada.nr_contato.replace(/\D/g, '');
    const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(this.mensagemCustom)}`;

    window.open(url, '_blank');
    this.fecharModalWhats();
}
/*
  aplicarTemplate(texto: string) {
    // Substitui os placeholders pelos dados reais da pessoa selecionada
    this.mensagemCustom = texto
      .replace('[NOME]', this.pessoaSelecionada?.nome_social || 'Cliente')
      .replace('[CARGO]', this.pessoaSelecionada?.ds_cargo || 'sua área')
      .replace('[RENDA]', new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
      }).format(this.pessoaSelecionada?.renda_comprovada || 0));
  }
*/
  exibirModalExclusao = false;
  pessoaParaExcluir: Pessoa | null = null;
// Configurações de Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 5;

  // Getter para obter apenas as pessoas da página atual
  get pessoasPaginadas(): ViewListaPessoasModel[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.listarPessoas.slice(inicio, fim);
  }

  // Total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.listarPessoas.length / this.itensPorPagina);
  }
  mudarPagina(novaPagina: number) {
    if (novaPagina >= 1 && novaPagina <= this.totalPaginas) {
      this.paginaAtual = novaPagina;
    }
  }
  editarPessoa(pessoa: ViewListaPessoasModel) {
    if (!pessoa.id) {
      return;
    }

    // 2. Navega para a rota de edição passando o ID como parâmetro
    // Ajuste o caminho inicial conforme sua estrutura de rotas (ex: /principal/menuconsultar...)
    this.router.navigate(['principal/editarpessoas/buscar', pessoa.id]);
  }


  excluirPessoa(id: number) {
  // Mantemos esta apenas se for deletar direto sem modal
    this.listarPessoas = this.listarPessoas.filter(p => p.id !== id);
  }
// Remove caracteres especiais para o link wa.me funcionar
  limparNumero(contato: string): string {
    return contato.replace(/\D/g, ''); // Remove tudo que não for número
  }

  // Opcional: Se quiser que o número já venha formatado na lista
  formatarParaExibição(contato: string): string {
    // Exemplo de lógica para formatar se desejar
    return contato;
  }

  // Abre o modal e guarda a referência da pessoa
  confirmarExclusao(pessoa: any) {
  this.pessoaParaExcluir = pessoa;
  this.exibirModalExclusao = true;
}

  // Fecha o modal sem deletar
  cancelarExclusao() {
    this.exibirModalExclusao = false;
    this.pessoaParaExcluir = null;
  }

  // Executa a exclusão real
  executarExclusao() {
   if (!this.pessoaParaExcluir) return;

    this.isDeleting = true;
    const id = this.pessoaParaExcluir.id;

    // Objeto com o novo status (Exclusão Lógica)
    // Ajuste o nome do campo 'id_situacao_fk' se no seu banco for diferente
    const dadosParaAtualizar: PessoaModel = {
      id_tipo_pessoa_fk: 0, // ou null, dependendo da sua interface
      id_cargo_func_fk: 0,
      id_situacao_fk: 2,
      id_cpf_cnpj: 0,
      nome: '',
      nome_social: '',
      rg: '',
      orgao: '',
      dt_expedicao: ''

    };

    // Chama o serviço de ATUALIZAR (PUT ou PATCH), não o DELETE
    this.pessoaService.atualizarStatus(id, dadosParaAtualizar ).subscribe({
      next: () => {
        this.pessoas = this.pessoas.filter((p: any) => p.id !== id);
        this.cancelarExclusao();
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Erro ao tentar excluir.');
      },
      complete: () => {
        this.isDeleting = false;
      }
    });
  }

 carregarPessoas(): void {
    this.viewListarPessoasService.getListaPessoas().subscribe({
      next: (dados: any[]) => {
        this.listarPessoas = dados;

          this.listarPessoas = dados.filter((p: any) =>{
         const status = (p.nome_status || '').toUpperCase();

        return status === 'ATIVO' || status === 'PENDENTE';
      });
                  this.cdr.detectChanges();

                  this.listarPessoas.sort((a, b) => {
                      const nomeA = (a.nome_social ?? "").toUpperCase(); // Para comparação sem case-sensitive
                      const nomeB = (b.nome_social ?? "").toUpperCase();
                      if (nomeA < nomeB) {
                          return -1; // 'a' vem antes de 'b'
                      }
                      if (nomeA > nomeB) {
                          return 1; // 'b' vem antes de 'a'
                      }
                      return 0; // Os nomes são iguais
                  });
      }
    });
  }


}
