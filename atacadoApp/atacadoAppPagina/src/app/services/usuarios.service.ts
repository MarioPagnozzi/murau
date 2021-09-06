import { Permissao } from './../../../../atacadoApp_API/src/entity/Permissao';
import { PermissaoService } from './permissao.service';
import { IResult } from './../interfaces/IResult';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IUsuarios } from '../interfaces/IUsuarios';
import { HttpService } from './http.service';
import { environment } from 'src/environments/environment';
import { Observable, Observer, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { UsuarioModel } from '../models/usuarioModel';
import { HttpClient } from '@angular/common/http';
import { GrupoModel } from '../models/grupoModel';
import { PermissaoModel } from '../models/permissaoModel';

export  interface IPermissoes {
  tabela: string,
  visualizar: boolean,
  alterar: boolean,
  inserir: boolean,
  excluir: boolean
}
@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseService<IUsuarios | UsuarioModel> {
  totalClienteDia(): any {
    throw new Error('Method not implemented.');
  }

  private loginSubject = new Subject<boolean>();
  private permissao: PermissaoModel[] = [];
  permissaoChange$: Observable<PermissaoModel[]> = new Observable<PermissaoModel[]>();
  private _observer: Observer<PermissaoModel[]> | any;
  permissaoService: any;
  isRoot = false;
  constructor(public http: HttpService, httpCli: HttpClient) {
    super("users", http, httpCli);
    this.permissaoService = new PermissaoService(this.http, this.httpCli);
    this.permissaoChange$ = new Observable(observer => this._observer = observer);
   }

   login(email: string, senha: string): Promise<IResult> {
     // tslint:disable-next-line: object-literal-shorthand
     const body = {email, senha}
     return this.http.post(`${environment.url_api}/users/auth`, {email, senha});
   }
   async configureLogin(o: any): Promise<void> {
     const {token, user} = o.data;
     localStorage.setItem('murau:token', token);
     localStorage.setItem('murau:user', JSON.stringify(user));
     const grupos = await this.http.get(`${environment.url_api}/grupos/usuarios/${user.uid}`);
     if (grupos.data) {
        let _grupos = grupos.data as GrupoModel[];
        let grps: GrupoModel[] = [];
        let grupo: any;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < _grupos.length; i++) {
          this.permissaoService.getObservableByGrupo(_grupos[i].uid).subcribe({
            next: (permissoes: PermissaoModel[]) => {
              _grupos[i].permissoes = permissoes as PermissaoModel[];
              // tslint:disable-next-line: prefer-for-of
              for (let p = 0; p < permissoes.length; p++) {
                this.permissao.push(permissoes[p]);
              }
              grps.push(_grupos[i]);
            }
          })


        }

        localStorage.setItem('murau:grupo', JSON.stringify(grps));
     }
     const usuarios = await this.http.get(`${environment.url_api}/users/${user.uid}`);
     this.isRoot = usuarios.data.isRoot;
     localStorage.setItem('murau:isroot', usuarios.data.isRoot);
     this.loginSubject.next(this.isStaticLogged);
   }
   get isLogged(): Observable<boolean> {
     return this.loginSubject.asObservable();
   }
   get isStaticLogged(): boolean {
     return !!localStorage.getItem('murau:token')
   }

   hasPermissoes(tabela: string): IPermissoes {
      const permissao: IPermissoes = {
        tabela: tabela,
        visualizar: this.permissao.filter((perm) => perm.tabela === tabela && perm.visualizar === true)[0].visualizar as boolean,
        excluir: this.permissao.filter((perm) => perm.tabela === tabela && perm.excluir === true)[0].excluir as boolean,
        alterar: this.permissao.filter((perm) => perm.tabela === tabela && perm.alterar === true)[0].alterar as boolean,
        inserir: this.permissao.filter((perm) => perm.tabela === tabela && perm.inserir === true)[0].inserir as boolean
      }
      return permissao;
   }
   logout(): void {
    localStorage.removeItem("murau:token");
    localStorage.removeItem("murau:grupo");
    localStorage.removeItem("murau:user");
    localStorage.removeItem("murau:isroot");
    this.loginSubject.next(this.isStaticLogged);
   }
}
