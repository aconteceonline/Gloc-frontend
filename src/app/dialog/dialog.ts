import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'dialog[app-modal]',
   standalone: true,
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss'
})
export class Dialog {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
