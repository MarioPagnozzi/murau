import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { ProdutosEmpresasModel } from '../models/produtosEmpresasModel';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProdutosEmpresasService extends BaseService<ProdutosEmpresasModel> {

  constructor(public http: HttpService, public httpCli: HttpClient) {
    super("produtosempresas", http, httpCli);
   }
}
