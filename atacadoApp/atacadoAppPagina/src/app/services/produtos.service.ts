import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IProdutos } from '../interfaces/IProdutos';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService extends BaseService<IProdutos> {

  constructor(public http: HttpService) {
    super("produtos", http);
   }
}
