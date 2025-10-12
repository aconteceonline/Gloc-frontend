import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-contato',
  standalone: false,
  templateUrl: './modal-contato.html',
  styleUrl: './modal-contato.scss'
})
export class ModalContato {


    contatoDate: any
    constructor( public dialogRef: MatDialogRef<ModalContato>,  ) {

     console.log('dados do usuario', this.contatoDate)
    }



    closeModal(){
      this.dialogRef.close();
    }
}
