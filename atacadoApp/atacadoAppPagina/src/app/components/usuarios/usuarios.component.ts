import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuarioModel } from 'src/app/models/usuarioModel';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { environment } from 'src/environments/environment';

export class FileManage {
  nome: string = ""
  extencao: string = ""
  base64Data: string = ""
}
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  spinnerAcao: string = "Carregando...";
  selUsuarios: UsuarioModel[] = [];
  usuarioList: UsuarioModel[] = [];
  usuarios: UsuarioModel[] = [];
  toolTipBtnExcluidos: string = "Mostrar Excluídos";
  iconBtnEye: string = "pi pi-eye";

  mostraExcluidos: boolean = false;

  fileCurrent: FileManage = new FileManage();
  file: any;
  localChange: boolean = false; 

  @ViewChild("dt") public dt: any;
  constructor(private usuarioService: UsuariosService, 
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private route: Router) { }

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  async carregarUsuarios() {
    this.spinnerAcao = "Carregando Usuários...";
    const result = await this.usuarioService.getAll();
    console.log(result);
    this.usuarios = result.data as UsuarioModel[];
    this.usuarioList = this.usuarios.filter(val => val.ativo && !val.excluido);
    for (let i in this.usuarioList) {
  
      if (this.usuarioList[i].foto) {
        this._populatePreLoadImage(this.usuarioList[i].foto);
        this.usuarioList[i].fotoBase64 = this.fileCurrent.base64Data;
      }
      
    }
   }
 applyFilterGlobal($event: Event, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
 }
 excluirUsuarios() {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir os usuários selecionados ?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.usuarioList = this.usuarios;
        let x = 1;
        this.selUsuarios.forEach(async (usuario) => {
          const i = this.findIndexById(usuario.uid ? usuario.uid : '0');
          if (i > -1) {
            this.usuarioList[i].ativo = false;
            this.usuarioList[i].excluido = true;
            this.spinnerAcao = "Excluindo registro " + x.toString() + " de " + this.selUsuarios.length.toString();           
            const result = await this.usuarioService.delete(usuario.uid ? usuario.uid : '0');
            if (!result.success) {
              this.usuarioList[i].ativo = true;
              this.usuarioList[i].excluido = false;
            } else {
              
            }
          }
          setTimeout(() => {
            x += 1;
          }, 3000)
        });
        this.usuarios = this.usuarioList;
        for (let i in this.usuarioList) {
  
          if (this.usuarioList[i].foto) {
            this._populatePreLoadImage(this.usuarioList[i].foto);
            this.usuarioList[i].fotoBase64 = this.fileCurrent.base64Data;
          }
          
        }
        this.mostraExcluidos = true;
        this.mostraUsuariosExcluidos();
        this.selUsuarios = [];
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Usuários Excluídas",
          life: 3000
        })
      }
    })
 }
 mostraUsuariosExcluidos() {
  if (this.mostraExcluidos) {
    this.iconBtnEye = "pi pi-eye";
    this.toolTipBtnExcluidos = "Mostrar Clientes Excluídos";
    this.mostraExcluidos = false;
    this.usuarioList = this.usuarioList.filter(val =>  val.ativo && !val.excluido);
    
  } else {
      this.mostraExcluidos = true;
      this.iconBtnEye = "pi pi-eye-slash";
      this.toolTipBtnExcluidos = "Ocultar Clientes Excluídos";
      this.usuarioList = this.usuarios;
      
  }
  for (let i in this.usuarioList) {

    if (this.usuarioList[i].foto) {
      this._populatePreLoadImage(this.usuarioList[i].foto);
      this.usuarioList[i].fotoBase64 = this.fileCurrent.base64Data;
    }
    
  }
 }
 excluirUsuario(usuario: UsuarioModel) {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir o Usuário " + usuario.nome + "?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
          let _usuario = {...usuario};
          const x = this.findIndexById(_usuario.uid ? _usuario.uid : '0');
          this.usuarioList[x].ativo = false;
          this.usuarioList[x].excluido = true;
          this.spinnerAcao = "Excluindo Registro ...";
          const result = await this.usuarioService.delete(_usuario.uid ? _usuario.uid : '0');
        
        if (result.success) {
              const result_usuario = await this.usuarioService.getAll();
              this.usuarios = result_usuario.data as UsuarioModel[];
              this.usuarioList = this.usuarios.filter(val => val.ativo && !val.excluido);
              for (let i in this.usuarioList) {
  
                if (this.usuarioList[i].foto) {
                  this._populatePreLoadImage(this.usuarioList[i].foto);
                  this.usuarioList[i].fotoBase64 = this.fileCurrent.base64Data;
                }
                
              }
              this.mostraExcluidos = true;
              this.mostraUsuariosExcluidos();
              this.messageService.add({
                severity: "success",
                summary: "Sucesso",
                detail: "UsuáriousuarioList Excluída",
                life: 3000
            })
        }
      }
    })
 }
 async restaurarUsuario(usuario: UsuarioModel) {
  let _usuario = {...usuario};
      _usuario.ativo = true;
      _usuario.excluido = false;
      const x = this.findIndexById(_usuario.uid ? _usuario.uid : '0');
      if (x > -1) {
        this.usuarioList[x].excluido = false;
        this.usuarioList[x].ativo = true;
      }
      this.spinnerAcao = "Restaurando Registro..."
      const result = await this.usuarioService.post(_usuario);
      console.log(result)
      if (result.success) {
            this.usuarios = [];
            this.usuarios = await this.retornaUsuarios();
            this.usuarioList = this.usuarios.filter(val => val.ativo && !val.excluido);
            for (let i in this.usuarioList) {
  
              if (this.usuarioList[i].foto) {
                this._populatePreLoadImage(this.usuarioList[i].foto);
                this.usuarioList[i].fotoBase64 = this.fileCurrent.base64Data;
              }
              
            }
            this.mostraExcluidos = true;
            this.mostraUsuariosExcluidos();
        
      }
 }
 async retornaUsuarios(): Promise<UsuarioModel[]> {
  const result = await this.usuarioService.getAll();
  if (result.success) {
    return result.data as UsuarioModel[];
  }
  return [];
 }
 findIndexById(id: string): number {
  let index = -1;
  for (let i = 0; i < this.usuarioList.length; i++) {
      if (this.usuarioList[i].uid === id) {
          index = i;
          break;
      }
  }
  return index;
}


private _setPictureFromCamera(picture: any): void {
  this.fileCurrent.nome = new Date().getTime().toString();
  this.fileCurrent.extencao = 'png';
  this.fileCurrent.base64Data = picture;
}

private _populatePreLoadImage(image: string): void {
  this.fileCurrent = new FileManage();
  if (image) {
    const ext = image.split('.');
    const isBase64 = image.indexOf('base64') > -1;
    if (isBase64) {
      this._setPictureFromCamera(image);
    } else {
      this.fileCurrent.extencao = ext[1];
      this.fileCurrent.nome = image;
      this.fileCurrent.base64Data = `${environment.url_api}/storage/${image}`;
    }
  }
}


}
