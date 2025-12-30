import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterPessoas'
})
export class FilterViewPessoasPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(it => {
      // Busca em múltiplos campos ao mesmo tempo
      const nome = it.nome_social?.toLowerCase().includes(searchText);
      const email = it.email?.toLowerCase().includes(searchText);
      const contato = it.nr_contato?.toLowerCase().includes(searchText);
      const ocupacao = it.ds_cargo?.toLowerCase().includes(searchText);
      const status = it.nome_status?.toLowerCase().includes(searchText);
      const renda = it.renda_comprovada?.toString().includes(searchText);

      return nome || email || contato || ocupacao || status || renda;
    });
  }
}
