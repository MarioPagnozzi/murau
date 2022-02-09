import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { BaseStatus } from 'src/app/enum/status';
import { UsuarioModel } from 'src/app/models/usuarioModel';
import { RetornaGruposUsuario } from 'src/app/shared/funcoesGlobal';
import { FileManage } from '../input-file/input-file.component';

export interface IStatus {
  valor: number;
  label: string;
}
@Component({
  selector: 'app-form-usuario',
  templateUrl: './form-usuario.component.html',
  styleUrls: ['./form-usuario.component.scss']
})
export class FormUsuarioComponent implements OnInit, OnChanges {

  @Input()
  set usuario(usuario: UsuarioModel) {
    this._usuario = usuario;
  }
  get  usuario() { return this._usuario; }
  private _usuario: UsuarioModel = new UsuarioModel();
  isRoot: boolean = false;
  @Input() ativo: boolean = false;
  @Input() root: boolean = false;

  status: IStatus[] = [];
 
  constructor() { }

  ngOnChanges(changes: any) {

      const user = changes.usuario.currentValue as UsuarioModel;
      this.usuario = user;
  
  }
  ngOnInit(): void {
    this.status = [
      {valor: BaseStatus.Aprovado, label: BaseStatus[BaseStatus.Aprovado].toUpperCase()},
      {valor: BaseStatus.Pendente, label: BaseStatus[BaseStatus.Pendente].toUpperCase()}
    ];

    const grupos = RetornaGruposUsuario();
    // tslint:disable-next-line: forin
    for (let g in grupos) {
      let {nome_grupo} = grupos[g];
      if (nome_grupo?.toUpperCase() === "SUPER USUÁRIO" && localStorage.getItem("murau:isroot")) {
        this.isRoot = true;
      }
    }
  }
 
  upperCase($event: Event) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toUpperCase();
  }
  lowerCase($event: Event ) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toLowerCase();
  }

}
