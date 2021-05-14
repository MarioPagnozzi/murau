import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IEmpresas } from '../interfaces/IEmpresas';
import { EmpresasModel } from '../models/empresasModel';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService extends BaseService<IEmpresas | EmpresasModel> {

  constructor(public http: HttpService, public httpCli: HttpClient) {
    super("empresas", http, httpCli)
   }
}
