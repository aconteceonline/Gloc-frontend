import { Component, } from '@angular/core';
import { DataService } from '../../services/data.service';
import { MatDialogRef } from '@angular/material/dialog';



export interface contato {
  telefone: string;
  celular: string;
  whatsapp: string;
  email: string;
}




@Component({
  selector: 'app-modal-contato',
  standalone: false,

  templateUrl: './modal-contato.html',
  styleUrl: './modal-contato.scss',

})
export class ModalContato {

  // Propriedades para ngModel

  telefone: string = "";
  celular: string = "";
  whatsapp: string = "";
  email: string = "";


constructor(private data: DataService, public dialogRef: MatDialogRef<ModalContato>) { }


 submitData(): void {
    // 1. Monta o objeto de dados para envio
    const dataToSend = {
      telefone: this.telefone,
      celular: this.celular,
      whatsapp: this.whatsapp,
      email: this.email,

    };

    // 2. Chama o service para enviar os dados
    this.data.sendData(dataToSend);

    // 3. Fecha o modal
     this.dialogRef.close();
     console.log('Modal Fechado.');
  }

}
