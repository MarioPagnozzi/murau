import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss']
})
export class ToolBarComponent implements OnInit {

  @Input() fazerPedido: boolean = false;
  @Input() aprovado: boolean = false;
  @Input() clienteAtivo: boolean = false;
  @Input() clienteUid: String = "";
  @Input() codUid: String = "";
  @Input() routerBack: string = "";
  @Input() alterar: boolean = false;
  @Input() visivelBtnBack: boolean = true;
  @Input() link: String = "cliente";
  @Output() salvar = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  salvarAlteracao(evt: any) {
    this.salvar.emit(evt);
  }

}
