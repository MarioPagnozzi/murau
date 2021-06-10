import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IEmpresas } from '../interfaces/IEmpresas';
import { IProdutos } from '../interfaces/IProdutos';
import { EmpresasModel } from '../models/empresasModel';
import { ProdutosModel } from '../models/produtosModel';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService extends BaseService<IProdutos | ProdutosModel | IEmpresas | EmpresasModel>{

  constructor(public http: HttpService, public httpCli: HttpClient) {
    super("home", http, httpCli);
   }
  
}
