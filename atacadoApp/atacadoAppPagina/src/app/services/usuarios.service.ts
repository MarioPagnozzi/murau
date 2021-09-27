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
  tabela: any,
  visualizar: any,
  alterar: any,
  inserir: any,
  excluir: any
}
@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseService<IUsuarios | UsuarioModel> {
  totalClienteDia(): any {
    throw new Error('Method not implemented.');
  }

  private loginSubject = new Subject<boolean>();
  permissao: PermissaoModel[] = [];


  private isRootSubject = new Subject<boolean>();
  private permissoes = new Subject<PermissaoModel[]>();
  isRoot = false;
  constructor(public http: HttpService, httpCli: HttpClient) {
    super("users", http, httpCli);
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
     console.log(grupos.data)
     if (grupos.data) {
        let _grupos = grupos.data as GrupoModel[];
        let grps: GrupoModel[] = [];
       
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < _grupos.length; i++) {
          const permissoes = await this.http.get(`${environment.url_api}/grupos/permissoes/${_grupos[i].uid}`);
          _grupos[i].permissoes = permissoes.data;
          grps.push(_grupos[i]);
          
          // tslint:disable-next-line: prefer-for-of
          for (let p = 0; p < permissoes.data.length; p++) {
            console.log(permissoes.data[p])
            this.permissao.push(permissoes.data[p]);
          }
        }
        localStorage.setItem('murau:grupo', JSON.stringify(grps));

      
     }
     const usuarios = await this.http.get(`${environment.url_api}/users/${user.uid}`);
     this.isRoot = usuarios.data.isRoot;
     localStorage.setItem('murau:isroot', usuarios.data.isRoot);
     this.loginSubject.next(this.isStaticLogged);
     this.isRootSubject.next(this.isRoot);
     this.permissoes.next(this.permissao);
   }
   get isLogged(): Observable<boolean> {
     return this.loginSubject.asObservable();
   }
   get isStaticLogged(): boolean {
     return !!localStorage.getItem('murau:token')
   }

   get permissoesSubject(): Observable<PermissaoModel[]> {
     return this.permissoes.asObservable();
   }
   
    get isUserRoot(): Observable<boolean> {
      return this.isRootSubject.asObservable();
    }
   logout(): void {
    localStorage.removeItem("murau:token");
    localStorage.removeItem("murau:grupo");
    localStorage.removeItem("murau:user");
    localStorage.removeItem("murau:isroot");
    this.loginSubject.next(this.isStaticLogged);
    this.permissao = [];
   }

   async recarregaPermissoes(grupos: any[]) {
     // tslint:disable-next-line: prefer-for-of
     for (let i = 0; i < grupos.length; i++) {
      const permissoes = await this.http.get(`${environment.url_api}/grupos/permissoes/${grupos[i].uid}`);
      // tslint:disable-next-line: prefer-for-of
      for (let p = 0; p < permissoes.data.length; p++) {
        this.permissao.push(permissoes.data[p]);
      }
    }
    let usuario = JSON.parse(localStorage.getItem('murau:user') as string) as UsuarioModel;
    let user = await this.http.get(`${environment.url_api}/users/${usuario.uid}`);
    this.isRoot = user.data.isRoot;
    this.isRootSubject.next(this.isRoot);
    this.permissoes.next(this.permissao);
   }
}
