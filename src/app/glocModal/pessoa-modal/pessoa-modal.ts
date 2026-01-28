import { Component, Input, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';
import { PessoaModel as Pessoa } from '../../glocModel/pessoa.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PessoaService } from '../../glocService/pessoa.service';
import { ContatoService } from '../../glocService/contato.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { ModalCadastroPessoa } from "./modal-cadastro-pessoa";

@Component({
  selector: 'app-pessoa-modal',
  standalone: true,
  templateUrl: './pessoa-modal.html',
  styleUrl: './pessoa-modal.scss',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalCadastroPessoa]
})
export class PessoaModal implements OnInit {
  @Input() pessoas: Pessoa[] = [];
  @Input() aberto = false;
  @Output() fechar = new EventEmitter<void>();
  @Output() selecionar = new EventEmitter<Pessoa>();
  @Output() cadastrarNovaPessoa = new EventEmitter<{ pessoa: Pessoa, celular: string | null }>(); // ✅ novo evento
  //ntatosMap: Record<string, ContatoModel | null> = {};
  //celularesMap: Record<number, string | null> = {};
  public buscaControl!: FormControl<any> ;
  public limitePorPagina = signal(10);
  pagina = signal(1);
  porPagina = 5;
  busca = signal('');
  pessoasFiltradas = signal<Pessoa[]>([]);
  carregando = signal(false);
  cadastroAberto = signal(false);
  //formularioAberto = signal(false);

  constructor(private router: Router, private pessoaService: PessoaService, private contatoService: ContatoService ) {
    this.buscaControl = new FormControl('', { nonNullable: true });
    this.buscaControl.valueChanges.pipe(
    debounceTime(900), // espera após o usuário parar de digitar
    distinctUntilChanged(),
    switchMap(termo => {
      const busca = termo?.trim();
      if (!busca || busca.length < 2) {
        this.pessoasFiltradas.set([]);
        return of([]);
      }

      this.carregando.set(true);
      return this.pessoaService.buscarPorTermo(busca);
    })
    ).subscribe({
     next: resultado => {
       // debugger; // PAUSE AQUI
        this.pessoasFiltradas.set(resultado);
      },
      error: (err) => {
   // debugger; // ⬅️ COLOQUE O DEBUGGER AQUI
    this.pessoasFiltradas.set([]);
    },
    complete: () => {
  //  debugger; // ⬅️ E COLOQUE O DEBUGGER AQUI
    this.carregando.set(false);
     },
  });
}

ngOnInit(): void {
  this.implementarBuscaPorNome();
}

implementarBuscaPorNome(): void {
    this.buscaControl.valueChanges.pipe(
    debounceTime(900), // espera 900ms após o usuário parar de digitar
    distinctUntilChanged(), // só prossegue se o valor for diferente do anterior
    switchMap(termo => {
      // Garante que 'termo' não é null/undefined e é uma string
      const busca = termo?.trim() ?? '';
      // Se a busca for muito curta, limpa os resultados e retorna um Observable vazio
      if (busca.length < 2) {
        this.pessoasFiltradas.set([]);
        return of([]); // Retorna um Observable que completa imediatamente
      }
      this.carregando.set(true);
      // Chama o serviço para buscar os dados na API
    // --- MUDANÇA CRÍTICA AQUI ---
      return this.pessoaService.buscarPorTermo(busca).pipe(
        // O catchError aqui "captura" o erro da requisição HTTP
        // e retorna uma lista vazia, mantendo o valueChanges VIVO.
        catchError(err => {
          console.error('Erro DETALHADO na busca:', err);
          this.carregando.set(false);
          // Retorna um Observable de array vazio para o fluxo continuar
          return of([]);
        })
      );
    })
  ).subscribe({
    // Recebe o retorno da API
    next: resultado => {
      // Define o signal com o resultado. O template (HTML) será atualizado.
      // ESTE PONTO NÃO ESTÁ SENDO ATINGIDO
        this.pessoasFiltradas.set(resultado);
        this.carregando.set(false); // Deveria ser resetado aqui ou em complete
        this.pagina.set(1)
    },

    // Tratamento de erro
    error: (err) => {
     console.error('Erro fatal no Observable:', err);
 //     this.pessoasFiltradas.set([]); // Limpa a lista em caso de erro
  //    this.carregando.set(false); // Garante que o indicador de carregamento é desativado
    },

    // Chamado após o 'next' ser executado (ou o 'error')
    complete: () => {
      this.carregando.set(false);
    },
  });
}
public pessoasPagina = computed(() => {
    const dados = this.pessoasFiltradas(); // Pega a lista completa
    const p = this.pagina(); // Pega a página atual
    const limite = this.limitePorPagina(); // Pega o limite
    // Calcula os índices de início e fim
    const inicio = (p - 1) * limite;
    const fim = inicio + limite;
    // Verifica se os dados estão chegando no signal completo
    if (dados.length > 0) {
        console.log(`Paginação: Página ${p}, Exibindo ${inicio} a ${fim} de ${dados.length} resultados.`);
    }
    // Retorna o slice (fatia) da página atual
    return dados.slice(inicio, fim);
  });

  public totalPaginas = computed(() => {
      const totalItens = this.pessoasFiltradas().length;
      const limite = this.limitePorPagina();
      // Math.ceil arredonda para cima (ex: 12 itens / 10 limite = 2 páginas)
      return Math.ceil(totalItens / limite);
  });
 /* totalPaginas = computed(() =>
    Math.ceil(this.pessoasFiltradas().length / this.porPagina)
  );*/

 /* pessoasPagina = computed(() => {
    const inicio = (this.pagina() - 1) * this.porPagina;
    return this.pessoasFiltradas().slice(inicio, inicio + this.porPagina);
  });*/

  onFechar() {
    this.fechar.emit();
    this.buscaControl.reset('');
    this.limparBusca()
  }

  onSelecionar(pessoa: Pessoa) {
    this.selecionar.emit(pessoa);
    this.onFechar();
  }

limparBusca() {
  this.buscaControl.reset('');
}
/*  onCadastrarNovaPessoa() {
    this.cadastrarNovaPessoa.emit();
    this.onFechar();
  }
*/
  avatar(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  anterior() {
    if (this.pagina() > 1) this.pagina.update(p => p - 1);
  }

  proximo() {
    if (this.pagina() < this.totalPaginas()) this.pagina.update(p => p + 1);
  }

   abrirCadastroPessoa() {
    this.cadastroAberto.set(true);
  }

  fecharCadastroPessoa() {
    this.cadastroAberto.set(false);
  }

  salvarNovaPessoa(pessoa: any) {
    // adiciona ao serviço de pessoas
    // this.pessoasService.add(pessoa);

    // já retorna como selecionada
    this.onSelecionar(pessoa);
  }
}
