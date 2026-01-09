import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterPessoas'
})
export class FilterViewPessoasPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    // 1. Limpa o texto da pesquisa (minúsculo e sem acentos)
    const searchClean = this.removerAcentos(searchText);

    return items.filter(it => {
      // 2. Aplica a limpeza em cada campo antes de comparar

      const nome     = this.removerAcentos(it.nome_social).includes(searchClean);
      const objetivo = this.removerAcentos(it.objetivo_interesse).includes(searchClean);
      const contato  = this.removerAcentos(it.nr_contato).includes(searchClean);
      const perfil   = this.removerAcentos(it.ds_cargo).includes(searchClean);
      const status   = this.removerAcentos(it.nome_status).includes(searchClean);
      const local    = this.removerAcentos(it.municipio).includes(searchClean);
      const renda    = this.removerAcentos(it.renda_comprovada).includes(searchClean);

      return nome || objetivo || contato || perfil || status || local || renda;
    });
  }

  // --- Função Mágica Auxiliar ---
  private removerAcentos(texto: any): string {
    if (!texto) return ''; // Se for null/undefined, retorna vazio para não quebrar

    // 1. Converte para string (caso seja numero)
    // 2. Normaliza (separa 'ã' em 'a' + '~')
    // 3. Replace (remove os caracteres de acento)
    // 4. ToLowerCase (deixa minusculo)
    return texto
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }
}
