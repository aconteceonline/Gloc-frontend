import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ViewListaPessoasModel } from '../../../glocModel/view-lista-pessoas.model';
import { ViewListarPessoasService } from '../../../glocService/view-lista-pessoas.service';

export interface Pessoa  {
  id: number;
  nome: string;
  email: string;
  nome_status: string;        // Vem da tabela tstatus
  contato_formatado: string;  // Versão com máscara para exibir
}


@Component({
  selector: 'app-listar-pessoas',
  standalone: false,
  templateUrl: './listar-pessoas.html',
  styleUrl: './listar-pessoas.scss'
})
export class ListarPessoas implements OnInit {
 listarPessoas: ViewListaPessoasModel[] = [];

 private viewListarPessoasService  = inject(ViewListarPessoasService);

 private cdr  = inject (ChangeDetectorRef);



  ngOnInit(): void {
    this.carregarPessoas();

  }
  exibirModalExclusao = false;
  pessoaParaExcluir: Pessoa | null = null;
// Configurações de Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 2;

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
    console.error('ID da pessoa não encontrado');
    return;
  }
    console.log('Editando pessoa:', pessoa);
    // Aqui você abriria um modal ou navegaria para uma rota de edição
    alert(`Editar: ${pessoa.nome}`);
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
    if (this.pessoaParaExcluir) {
      this.listarPessoas = this.listarPessoas.filter(p => p.id !== this.pessoaParaExcluir!.id);
      this.cancelarExclusao();

      // Ajuste de página caso a página fique vazia
      if (this.pessoasPaginadas.length === 0 && this.paginaAtual > 1) {
        this.paginaAtual--;
      }
    }
  }

 carregarPessoas(): void {
    this.viewListarPessoasService.getListaPessoas().subscribe({
      next: (dados) => {

        this.listarPessoas = dados;
                  // Atribui os dados recebidos da API à lista
                  this.listarPessoas = dados;
                  this.cdr.detectChanges();

                  this.listarPessoas.sort((a, b) => {
                      const nomeA = (a.nome ?? "").toUpperCase(); // Para comparação sem case-sensitive
                      const nomeB = (b.nome ?? "").toUpperCase();
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
