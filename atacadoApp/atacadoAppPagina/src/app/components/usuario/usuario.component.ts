import { PermissaoModel } from './../../models/permissaoModel';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GrupoModel } from 'src/app/models/grupoModel';
import { UsuarioModel } from 'src/app/models/usuarioModel';
import { GruposService } from 'src/app/services/grupos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Permissao } from 'src/app/shared/funcoesGlobal';

import { ConfirmationService, MessageService } from 'primeng/api';
import { FileManage } from '../input-file/input-file.component';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})
export class UsuarioComponent implements OnInit {

  spinnerAcao: string = "Carregando...";
  alterar: boolean = false;
  aprovado: boolean = false;

  usuario: UsuarioModel = new UsuarioModel();

  submitted: boolean = false;
  showDialog: boolean = false;

  grupoList: GrupoModel[] = [];
  tipoUsuario: string = "";

  selGrupos: GrupoModel[] = [];

  gruposFiltrados: GrupoModel[] = [];
  grupo: GrupoModel = new GrupoModel();
  grupos: GrupoModel[] = [];

  @ViewChild("dt") public dt: any;
 
  constructor(private usuarioService: UsuariosService, 
              private matSnack: MatSnackBar,
              private grupoService: GruposService,
              private route: Router,
              private active: ActivatedRoute,
              private confirmationService: ConfirmationService,
              private messageService: MessageService) { }

  ngOnInit(): void {
    // tslint:disable-next-line: deprecation
    this.active.params.subscribe(p => this.getUid(p.cod));
    this.alterar = Permissao("usuarios", "A");
    this.carregaGrupos();
  }
  async carregaGrupos() {
    const result = await this.grupoService.getAll();
    if (result.success) {
      let _grupos = result.data as GrupoModel[];
      this.grupos = _grupos.filter(val => !this.usuario.grupos.includes(val));
    }
  }
  async getUid(uid: string): Promise<void> {
    
    if (uid === "novo") {
      return;
    }
    this.spinnerAcao = "Carregando...";
 
    const result = await this.usuarioService.getById(uid);
    this.usuario = result.data as UsuarioModel;
    
    this.aprovado = this.usuario.status_usuario === 2;
    if (this.usuario.cliente) {
      this.tipoUsuario = `Usuário vinculado ao Cliente: ${this.usuario.cliente?.nome_fantasia}`;
    } else if (this.usuario.vendedor) {
      this.tipoUsuario = `Usuário vinculado ao Vendedor: ${this.usuario.vendedor?.nome}`;
    } else {
      this.tipoUsuario = "";
    }
    console.log(this.usuario.grupos)
    this.grupoList = this.usuario.grupos as GrupoModel[];
    
  } 
  upperCase($event: Event) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toUpperCase();
  }
  lowerCase($event: Event ) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toLowerCase();
  }
  
  async salvarAlteracoes() {
    this.usuario.nome = this.usuario.nome.toUpperCase();
    this.usuario.email = this.usuario.email.toLowerCase();
    this.usuario.grupos = this.grupoList;
    const result = await this.usuarioService.post(this.usuario as UsuarioModel);
    if (result.success) {
      const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, {duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok']});
      // tslint:disable-next-line: deprecation
      snack.afterDismissed().subscribe(() => {
        this.route.navigateByUrl("/usuarios");
      })
    }
  } 
  hideDialog() {
    this.showDialog = false;
    this.submitted = false;
  } 
  salvarDialog() {
    this.submitted = true;
    this.grupoList.push(this.grupo);
    this.grupo = new GrupoModel();
    
  }
  selectedFile(file: FileManage): void {
    if (file.base64Data) {
      this.usuario.foto = file.base64Data;
    }
  }
  excluirGrupos() {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir os clientes selecionados ?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.grupoList = this.grupoList.filter(val => !this.selGrupos.includes(val));
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Grupos Excluídos",
          life: 3000
        })
      }
    })
  }
  excluirGrupo(grupo: GrupoModel) {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir o grupo " + grupo.nome_grupo + "?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
          this.grupoList = this.grupoList.filter(val => val.uid !== grupo.uid);
    
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Grupo Excluído",
            life: 3000
        })
      }
    })
  }
  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
  openDialog() {
    this.showDialog = true;
    this.submitted = false;
  }
  filtraGrupo(event: any) {
    let filtros: GrupoModel[] = [];
    let query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.grupos.length; i++) {
      let grupo = this.grupos[i];
      if (grupo.nome_grupo?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtros.push(grupo);
      }
    }
    this.gruposFiltrados = filtros;
  }
  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.grupoList.length; i++) {
        if (this.grupoList[i].uid === id) {
            index = i;
            break;
        }
    }
    return index;
  }
}
