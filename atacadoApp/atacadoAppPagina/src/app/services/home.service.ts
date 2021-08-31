import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';
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

  private _produtos: ProdutosModel[] = [];
  produtosChange$: Observable<ProdutosModel[]> = new Observable<ProdutosModel[]>();
  private _observer: Observer<ProdutosModel[]> | any
  constructor(public http: HttpService, public httpCli: HttpClient) {
    super("home", http, httpCli);
    this.produtosChange$ = new Observable(observer => this._observer = observer);    
   }

  produtosList() {
    return this._produtos;
  }

  retornaProdutos() {
      
      this.getObservable().subscribe({
        next: (produtos) => {
          console.log("getProdutos")
          const _produtos = produtos as ProdutosModel[];
          _produtos.forEach(async (produto) => {
              produto.imagens = [];
              let imagem = await this.filtro("imagens", produto.uid);
              if (imagem.data && imagem.data != null && imagem.data.length > 0) {
                  produto.imagens = imagem.data;
              }
              
          })
          this._produtos =  _produtos
          this._observer.next(_produtos);
        }
      });
  
  }
}
