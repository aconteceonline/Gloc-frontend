import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CadproprietarioService } from './cad-proprietario.service';

@Component({
  selector: 'app-cad-proprietario',
  standalone: false,
  templateUrl: './cad-proprietario.html',
  styleUrl: './cad-proprietario.scss'
})
export class CadProprietario {

   camposForm: FormGroup;

      constructor(private service: CadproprietarioService){

        this.camposForm = new FormGroup({
          nome: new FormControl('', Validators.required),
          contato: new FormControl('', Validators.required),
          rg: new FormControl(''),
          orgao: new FormControl(''),
          cpf: new FormControl(''),
          estado: new FormControl(''),
          ocupacao: new FormControl(''),
          cep: new FormControl(''),
          logradouro: new FormControl(''),
          numero: new FormControl(''),
          compl: new FormControl(''),
          bairro: new FormControl(''),
          cidade: new FormControl(''),
        })
      }

salva(){
  this.camposForm?.markAsTouched();

  if(this.camposForm?.valid){
    this.service
        .salvar(this.camposForm.value)
        .subscribe({
          next: (cadproprietario) => {
            alert('Salvo com sucessso!');
            this.camposForm.reset();
          },
          error: erro => console.error('ocorreru um erro', erro)
        })
  }
}

isCampoInvalido(nomeCampo: string) : boolean {
  const campo = this.camposForm?.get(nomeCampo);
  return campo?.invalid && campo?.touched && campo?.errors?.['required']
}
}
