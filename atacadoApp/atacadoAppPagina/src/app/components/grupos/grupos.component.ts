import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IPermissao } from 'src/app/interfaces/IPermissao';
import { GrupoModel } from 'src/app/models/grupoModel';
import { PermissaoModel } from 'src/app/models/permissaoModel';
import { GruposService } from 'src/app/services/grupos.service';
import { IPermissoes, UsuariosService } from 'src/app/services/usuarios.service';
import { Permissao } from 'src/app/shared/funcoesGlobal';
import { PanelAdministradorComponent } from '../panel-administrador/panel-administrador.component';


@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.scss']
})
export class GruposComponent implements OnInit {

  selGrupos: GrupoModel[] = [];
  grupoList: GrupoModel[] = [];
  grupos: GrupoModel[] = [];

  toolTipBtnExcluidos: string = "Mostrar Grupos Excluídos";
  iconBtnEye: string = "pi pi-eye";

  spinnerAcao: string = "Carregando Grupos...";
  mostraExcluidos: boolean = false;

  alterar: boolean = false;
  excluir: boolean = false;
  inserir: boolean = false

  permissoes: PermissaoModel[] = []; 

  @ViewChild("dt") public dt: any;
  constructor(private grupoService: GruposService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private route: Router,
              private usuarioService: UsuariosService) { }

  async ngOnInit() {
    this.grupos =  await this.retornaGrupos();
    this.grupoList = this.grupos.filter(val => val.ativo && !val.excluido);

    
    let grupos = JSON.parse(localStorage.getItem("murau:grupo") as string) as GrupoModel[];
    this.usuarioService.recarregaPermissoes(grupos);

    this.usuarioService.permissoesSubject.subscribe({
      next: (perm) => {     
        this.permissoes = perm;
        console.log("completou")
        let permissao = this.hasPermissoes();
        this.alterar = permissao.alterar;
        this.excluir = permissao.excluir;
        this.inserir = permissao.inserir;
        console.log(permissao)
        console.log(this.permissoes)
      }
    })
  }
  hasPermissoes(): IPermissoes {

  
    let excluir = false;
    let alterar = false;
    let inserir = false;  
    let return_perm = this.permissoes.filter((perm) => perm.tabela?.toString() === "grupos" && (perm.excluir as boolean) === true);
   
    if (return_perm.length > 0) {
     excluir = return_perm[0].excluir as boolean;
     return_perm = []
    }
  
    return_perm = this.permissoes.filter((perm) => perm.tabela?.toString() === "grupos" && (perm.alterar as boolean) === true);
    if (return_perm.length > 0) {
     alterar = return_perm[0].alterar as boolean;
     return_perm = []
    }
  
    return_perm = this.permissoes.filter((perm) => perm.tabela?.toString() === "grupos" && (perm.inserir as boolean) === true);
    if (return_perm.length > 0) {
     inserir = return_perm[0].inserir as boolean;
     return_perm = []
    }
  
     const permissao: IPermissoes = {
       tabela: "grupos",
       visualizar: true,
       excluir: excluir,
       alterar: alterar,
       inserir: inserir
     }
     return permissao;
  }
  async retornaGrupos(): Promise<GrupoModel[]> {
    this.spinnerAcao = "Carregando Grupos...";
    const result = await this.grupoService.getAll();
    if (result.success) {
      return result.data as GrupoModel[];
    }
    return [];
  }
  excluirGrupos() {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir os grupos selecionados?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.grupoList = this.grupos;
        let x = 1;
        this.selGrupos.forEach(async (grupo) => {
          const i = this.findIndexById(grupo.uid ? grupo.uid : '0');
          if (i > -1) {            this.grupoList[i].ativo = false;
            this.grupoList[i].excluido = true;
            this.spinnerAcao = "Excluindo registro " + x.toString() + " de " + this.selGrupos.length.toString();
            const result = await this.grupoService.delete(grupo.uid ? grupo.uid : '0');
            if (!result.success) {              this.grupoList[i].ativo = true;
              this.grupoList[i].excluido = false;
            } else {
              
            }
          }
          setTimeout(() => {
            x += 1;
          }, 3000)
        });
        this.grupos = this.grupoList;
        this.mostraExcluidos = true;
        this.mostraGrupoExcluidos();
        this.selGrupos = [];
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
      
          this.spinnerAcao = "Excluindo Registro ...";
          const result = await this.grupoService.delete(grupo.uid ? grupo.uid : '0');
        
        if (result.success) {
              const result_grp = await this.grupoService.getAll();
              this.grupos =  result_grp.data as GrupoModel[];
              this.grupoList = this.grupos.filter(val => val.ativo && !val.excluido);
              this.mostraExcluidos = true;
              this.mostraGrupoExcluidos();
              this.messageService.add({
                severity: "success",
                summary: "Sucesso",
                detail: "Grupo Excluído",
                life: 3000
            })
        }
      }
    })
  }
  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
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
 mostraGrupoExcluidos() {
  if (this.mostraExcluidos) {
    this.iconBtnEye = "pi pi-eye";
    this.toolTipBtnExcluidos = "Mostrar Clientes Excluídos";
    this.mostraExcluidos = false;

    this.grupoList = this.grupoList.filter(val =>  val.ativo && !val.excluido);
    } else {
        this.mostraExcluidos = true;
        this.iconBtnEye = "pi pi-eye-slash";
        this.toolTipBtnExcluidos = "Ocultar Clientes Excluídos";
        this.grupoList = this.grupos;
    }
 }
 async restauraGrupo(grupo: GrupoModel) {
  let _grupo = {...grupo};
  _grupo.ativo = true;
  _grupo.excluido = false;
  this.spinnerAcao = "Restaurando Registro..."
  const result = await this.grupoService.post(_grupo);
  console.log(result)
  if (result.success) {
        this.grupos = [];
        this.grupos = await this.retornaGrupos();
        this.grupoList = this.grupos.filter(val => val.ativo && !val.excluido);
        this.mostraExcluidos = true;
        this.mostraGrupoExcluidos();
    
  }
 }
}
