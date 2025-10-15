
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


type ModalData = any


@Injectable({
  providedIn: 'root'
})
export class DataService {
 // 1. BehaviorSubject privado para armazenar e emitir o valor
  // Inicializamos com 'null' ou um valor padrão.
  private modalResultSource = new BehaviorSubject<ModalData>(null);

  // 2. Observable público para os componentes se inscreverem
  // Usamos 'asObservable()' para que os componentes não possam chamar .next() diretamente
  modalResult$ = this.modalResultSource.asObservable();

  constructor() { }

  /**
   * Método chamado pelo componente Modal para enviar os dados
   * de volta ao componente que o chamou.
   * @param data Os dados a serem compartilhados (ex: objeto do formulário).
   */
  sendData(data: ModalData): void {
    // Emite o novo valor para todos os inscritos
    this.modalResultSource.next(data);

  }

  /**
   * (Opcional) Método para limpar o valor após o componente chamador
   * tê-lo processado.
   */
  clearData(): void {
    this.modalResultSource.next(null);
  }
}
