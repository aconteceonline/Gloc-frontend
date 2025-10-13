import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


export interface Contact {
  id: number;
  name: string;
  phone: string;
  whatsapp: boolean;
  email: string;
}


@Component({
  selector: 'app-modal-contato',
  standalone: false,

  templateUrl: './modal-contato.html',
  styleUrl: './modal-contato.scss'
})
export class ModalContato implements OnInit {

   CONTACT_MOCK_DATA: Contact[] = [
  { id: 1, name: 'João Silva', phone: '(11) 98765-4321', whatsapp: true, email: 'joao@exemplo.com' },
  { id: 2, name: 'Maria Santos', phone: '(21) 99887-7665', whatsapp: false, email: 'maria@exemplo.com' },
  /* { id: 3, name: 'Pedro Alvares', phone: '(81) 97766-5544', whatsapp: false, email: 'pedro@exemplo.com' },
  { id: 4, name: 'Ana Costa', phone: '(51) 96655-4433', whatsapp: true, email: 'ana@exemplo.com' },
 { id: 5, name: 'Carlos Lima', phone: '(41) 95544-3322', whatsapp: false, email: 'carlos@exemplo.com' },
  { id: 6, name: 'Sofia Mendes', phone: '(31) 94433-2211', whatsapp: true, email: 'sofia@exemplo.com' },
  { id: 7, name: 'Lucas Pires', phone: '(71) 93322-1100', whatsapp: true, email: 'lucas@exemplo.com' },
  { id: 8, name: 'Helena Souza', phone: '(84) 92211-0099', whatsapp: false, email: 'helena@exemplo.com' },
  { id: 9, name: 'Ricardo Dias', phone: '(62) 91100-9988', whatsapp: true, email: 'ricardo@exemplo.com' },
  { id: 10, name: 'Patrícia Rocha', phone: '(92) 90099-8877', whatsapp: true, email: 'patricia@exemplo.com' },
  // Adicione mais 10 contatos para simular 2 páginas
  { id: 11, name: 'Guilherme Neves', phone: '(11) 98765-1111', whatsapp: true, email: 'gui@exemplo.com' },
  { id: 12, name: 'Fernanda Lins', phone: '(21) 99887-2222', whatsapp: true, email: 'fernanda@exemplo.com' },
  { id: 13, name: 'Vitor Hugo', phone: '(81) 97766-3333', whatsapp: false, email: 'vitor@exemplo.com' },
  { id: 14, name: 'Camila Reis', phone: '(51) 96655-4444', whatsapp: true, email: 'camila@exemplo.com' },
  { id: 15, name: 'Marcelo Castro', phone: '(41) 95544-5555', whatsapp: false, email: 'marcelo@exemplo.com' },
  { id: 16, name: 'Bianca Novaes', phone: '(31) 94433-6666', whatsapp: true, email: 'bianca@exemplo.com' },
  { id: 17, name: 'Rafael Lemos', phone: '(71) 93322-7777', whatsapp: true, email: 'rafael@exemplo.com' },
  { id: 18, name: 'Débora Martins', phone: '(84) 92211-8888', whatsapp: false, email: 'debora@exemplo.com' },
  { id: 19, name: 'Eduardo Guedes', phone: '(62) 91100-9999', whatsapp: true, email: 'eduardo@exemplo.com' },
  { id: 20, name: 'Julia Paes', phone: '(92) 90099-0000', whatsapp: true, email: 'julia@exemplo.com' },*/
];

    contatoDate: any
    constructor( public dialogRef: MatDialogRef<ModalContato>,  ) {

     console.log('dados do usuario', this.contatoDate)
    }


  // Lógica de Paginação
  contacts: Contact[] = this.CONTACT_MOCK_DATA; // Todos os dados
  paginatedContacts: Contact[] = [];       // Dados da página atual

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;



  ngOnInit(): void {
    this.calculateTotalPages();
    this.paginate();

  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.contacts.length / this.itemsPerPage);
  }

  // Lógica principal de paginação
  private paginate(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedContacts = this.contacts.slice(startIndex, endIndex);
  }

  // Move para a próxima página
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginate();
    }
  }

  // Move para a página anterior
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
  }


// NOVA PROPRIEDADE: Armazena os IDs dos contatos selecionados
  selectedContactIds: number[] = [];

  // NOVO EVENTO: Emite os contatos selecionados para o componente pai ao fechar/confirmar
  @Output() contactsSelected = new EventEmitter<Contact[]>();

  // ... (ngOnInit, calculateTotalPages, paginate - Mantenha este código) ...

  /**
   * Verifica se um contato específico está selecionado.
   */
  isSelected(contactId: number): boolean {
    return this.selectedContactIds.includes(contactId);
  }

  /**
   * Adiciona ou remove o ID do contato da lista de seleção.
   */
  toggleSelection(contactId: number): void {
    const index = this.selectedContactIds.indexOf(contactId);

    if (index > -1) {
      // Remover (desmarcar)
      this.selectedContactIds.splice(index, 1);
    } else {
      // Adicionar (marcar)
      this.selectedContactIds.push(contactId);
    }
  }

  /**
   * Seleciona/deseleciona todos os contatos da página atual.
   */
  toggleSelectAll(): void {
    const allIdsOnPage = this.paginatedContacts.map(c => c.id);
    const allSelected = allIdsOnPage.every(id => this.isSelected(id));

    if (allSelected) {
      // Desmarcar todos da página
      this.selectedContactIds = this.selectedContactIds.filter(id => !allIdsOnPage.includes(id));
    } else {
      // Marcar todos da página
      allIdsOnPage.forEach(id => {
        if (!this.isSelected(id)) {
          this.selectedContactIds.push(id);
        }
      });
    }
  }

  /**
   * Método de confirmação.
   */
  confirmSelection(): void {
    // Filtra todos os contatos originais para encontrar os objetos Contact selecionados
    const selectedContacts = this.contacts.filter(c => this.selectedContactIds.includes(c.id));

    // Emite a lista de contatos selecionados
    this.contactsSelected.emit(selectedContacts);

    // Fecha o modal

  }

  // Novo getter para saber se todos os itens da página atual estão selecionados
  get isAllSelectedOnCurrentPage(): boolean {
    return this.paginatedContacts.length > 0 &&
           this.paginatedContacts.every(contact => this.isSelected(contact.id));
  }
}








