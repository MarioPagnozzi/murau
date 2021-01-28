import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IEmpresas } from '../interfaces/IEmpresas';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService extends BaseService<IEmpresas> {

  constructor(public http: HttpService) {
    super("empresas", http)
   }
}
