import { IResult } from './../interfaces/IResult';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IUsuarios } from '../interfaces/IUsuarios';
import { HttpService } from './http.service';
import { environment } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseService<IUsuarios> {
  totalClienteDia(): any {
    throw new Error('Method not implemented.');
  }

  private loginSubject = new Subject<boolean>();

  constructor(public http: HttpService) {
    super("users", http);
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
        localStorage.setItem('murau:grupo', JSON.stringify(grupos.data));
     }
     const usuarios = await this.http.get(`${environment.url_api}/users/${user.uid}`);
     localStorage.setItem('murau:isroot', usuarios.data.isRoot);
     this.loginSubject.next(this.isStaticLogged);  
   }
   get isLogged(): Observable<boolean> {
     return this.loginSubject.asObservable();
   }
   get isStaticLogged(): boolean {
     return !!localStorage.getItem('murau:token')
   }
   logout(): void {
    localStorage.removeItem("murau:token");
    localStorage.removeItem("murau:grupo");
    localStorage.removeItem("murau:user");
    localStorage.removeItem("murau:isroot");
    this.loginSubject.next(this.isStaticLogged);
   } 
}
