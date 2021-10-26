import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ITabelas } from 'src/app/interfaces/ITabelas';
import { GrupoModel } from 'src/app/models/grupoModel';
import { PermissaoModel } from 'src/app/models/permissaoModel';
import { GruposService } from 'src/app/services/grupos.service';
import { PermissaoService } from 'src/app/services/permissao.service';
import { TabelasService } from 'src/app/services/tabelas.service';
import { IPermissoes, UsuariosService } from 'src/app/services/usuarios.service';
import { Permissao } from 'src/app/shared/funcoesGlobal';

@Component({
  selector: 'app-grupo',
  templateUrl: './grupo.component.html',
  styleUrls: ['./grupo.component.scss']
})
export class GrupoComponent implements OnInit {

  grupo: GrupoModel = new GrupoModel();
  url: string  = "/grupos";
  alterar: boolean = false;
  excluir: boolean = false;
  tabelas: ITabelas[] = [];
  permissoesUser: PermissaoModel[] = [];
  permissoes: PermissaoModel[] = [];
  spinnerAcao: string = "Carregando...";
  @ViewChild("dt") public dt: any;
  constructor(private router: Router,
    private active: ActivatedRoute,
    private gruposService: GruposService,
    private permissaoService: PermissaoService,
    private tabelasService: TabelasService,
    private usuarioService: UsuariosService,
    private matSnack: MatSnackBar,
    private messageService: MessageService) { }

  ngOnInit(): void {
    
    this.active.params.subscribe({
      next: (p) => {
        this.getGrupo(p.cod);
      }
    });
    let grupos = JSON.parse(localStorage.getItem("murau:grupo") as string) as GrupoModel[];
    this.usuarioService.recarregaPermissoes(grupos);

    this.usuarioService.permissoesSubject.subscribe({
      next: (perm) => {
       
        this.permissoesUser = perm;
        let permissao = this.hasPermissoes();
        this.alterar = permissao.alterar;
        this.excluir = permissao.excluir;      
   
      }
    })
  }
  hasPermissoes(): IPermissoes {

  
    let excluir = false;
    let alterar = false;
    let inserir = false;  
    let return_perm = this.permissoesUser.filter((perm) => perm.tabela?.toString() === "grupos" && (perm.excluir as boolean) === true);
   
    if (return_perm.length > 0) {
     excluir = return_perm[0].excluir as boolean;
     return_perm = []
    }
  
    return_perm = this.permissoesUser.filter((perm) => perm.tabela?.toString() === "grupos" && (perm.alterar as boolean) === true);
    if (return_perm.length > 0) {
     alterar = return_perm[0].alterar as boolean;
     return_perm = []
    }
  
    return_perm = this.permissoesUser.filter((perm) => perm.tabela?.toString() === "grupos" && (perm.inserir as boolean) === true);
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

  getGrupo(id: any) {

    this.active.queryParams.subscribe({
      next: (param) => {
        if (param.url) {
          this.url = `/${param.url}`
        }
      }
    })
    if (id === "novo") {
      (this.grupo.permissoes as PermissaoModel[]) = [];
      this.tabelasService.getObservable().subscribe({
        next: (tab) => {
          this.tabelas = tab;
        },
        complete: () => {
          for (let i = 0; i < this.tabelas.length; i++) {

            let objPermissao: PermissaoModel = new PermissaoModel();
            objPermissao.tabela = this.tabelas[i].tabela;
            objPermissao.alterar = false;
            objPermissao.excluir = false;
            objPermissao.inserir = false;
            objPermissao.visualizar = false;
            (this.grupo.permissoes as PermissaoModel[]).push(objPermissao)
          }
          this.permissoes = this.grupo.permissoes as PermissaoModel[];
        }

      });
      
      return;
    }

    this.gruposService.getObservableById(id).subscribe({
      next: (grupo) => {
        this.grupo = grupo as GrupoModel;
      },
      complete: async () => {
        let tabelasResult = await this.tabelasService.getAll();
        if (tabelasResult.success) {
          this.tabelas = tabelasResult.data as ITabelas[];
        }
        this.permissoes = this.grupo.permissoes as PermissaoModel[];      
      }
    })

  }
  async salvarAlteracoes() {
    this.grupo.permissoes = this.permissoes;
    const result = await this.gruposService.post(this.grupo as GrupoModel);
    if (result.success) {
      const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, {duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok']});
      // tslint:disable-next-line: deprecation
      snack.afterDismissed().subscribe(() => {
        this.router.navigateByUrl(`/${this.url}`);
      })
    }
  }
  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }
  upperCase($event: Event) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toUpperCase();
  }
  lowerCase($event: Event ) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toLowerCase();
  }
}
