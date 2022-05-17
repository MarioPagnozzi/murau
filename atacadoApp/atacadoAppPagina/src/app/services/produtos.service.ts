import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseService } from '../base/baseService';
import { IProdutos } from '../interfaces/IProdutos';
import { ImagesProdutoModel } from '../models/imagesProdutoModel';
import { ProdutosEmpresasModel } from '../models/produtosEmpresasModel';
import { ProdutosModel } from '../models/produtosModel';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService extends BaseService<IProdutos | ProdutosModel> {

 
  produtosSelEstoque$: Observable<ProdutosModel[]> = new Observable<ProdutosModel[]>();
  private prodSelEstoque: Observer<ProdutosModel[]> | any;


  constructor(public http: HttpService, public httpCli: HttpClient) {
    super("produtos", http, httpCli);
    this.produtosSelEstoque$ = new Observable(observer => this.prodSelEstoque = observer);
   
   }
  produtosSelecionados(produtos: ProdutosModel[]){
    
    //localStorage.setItem('murau:produtos', JSON.stringify(produtos));
    this.prodSelEstoque = new Observable((observer) => {
      return observer.next(produtos);
    })
     this.produtosSelEstoque$ =  this.prodSelEstoque;
   }
   async TotalProdutosDia(): Promise<number> {
    const produtos = await this.http.get(`${environment.url_api}/produtos/novos/proddia`);
    let total = 0;
    if (produtos.data) {
      produtos.data.forEach(() => {
        total = total + 1;
      })
    }
    return total;
  }
  async ProdutoEmpresa(uid: string): Promise<ProdutosEmpresasModel> {
    const produtoEmpresa = await this.http.get(`${environment.url_api}/produtos/produtoempresa/${uid}`);
    if (produtoEmpresa.success) {
      return produtoEmpresa.data;
    }
    return new ProdutosEmpresasModel();
  }
  async GetFotos(uid: string): Promise<ImagesProdutoModel> {
    const produtoEmpresa = await this.http.get(`${environment.url_api}/produtos/fotos/${uid}`);
    if (produtoEmpresa.success) {
      return produtoEmpresa.data;
    }
    return new ImagesProdutoModel();
  }
  async getEstoques(cdSaldo: any, prod: any) {
    const produtoSaldo = await this.http.get(`${environment.url_api}/produtos/estoque/${cdSaldo}/${prod}`);
    if (produtoSaldo.success) {
      return produtoSaldo.data;
    }
    return new ProdutosModel();
  }
}
