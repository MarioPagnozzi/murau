import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IUsuarios } from '../interfaces/IUsuarios';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseService<IUsuarios> {

  constructor(public http: HttpService) {
    super("users", http);
   }
}
