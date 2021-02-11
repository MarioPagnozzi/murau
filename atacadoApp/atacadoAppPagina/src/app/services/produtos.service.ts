import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
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
   async TotalProdutosDia(): Promise<number> {
    const produtos = await this.http.get(`${environment.url_api}/produtos/proddia`);
    let total = 0;
    if (produtos.data) {
      produtos.data.forEach(() => {
        total = total + 1;
      })
    }
    return total;
  }
}
