import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';
import { BaseService } from '../base/baseService';
import { IEmpresas } from '../interfaces/IEmpresas';
import { IProdutos } from '../interfaces/IProdutos';
import { EmpresasModel } from '../models/empresasModel';
import { ProdutosModel } from '../models/produtosModel';
import { HttpService } from './http.service';
import { ImagemProdutosService } from './imagem-produtos.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService extends BaseService<IProdutos | ProdutosModel | IEmpresas | EmpresasModel>{

  private _produtos: ProdutosModel[] = [];
  produtosChange$: Observable<ProdutosModel[]> = new Observable<ProdutosModel[]>();
  private _observer: Observer<ProdutosModel[]> | any;
  constructor(public http: HttpService, public httpCli: HttpClient, private imagemProdService: ImagemProdutosService) {
    super("home", http, httpCli);
    this.produtosChange$ = new Observable(observer => this._observer = observer);    
   }

  produtosList() {
    return this._produtos;
  }

  retornaProdutos() {
      
      this.getObservable().subscribe({
        next: async (produtos) => {
          console.log("getProdutos")
          this._produtos = [];
          const _produtos = produtos as ProdutosModel[];
          let imagens = await this.imagemProdService.getAll();
          _produtos.forEach(async (produto) => {
              produto.imagens = [];
              
              if (imagens.data &&  imagens.data.length > 0) {
                  produto.imagens = imagens.data.filter((imagem: any, i: number, imagens: any[]) => imagem.referencia === produto.referencia && imagens.findIndex(p => p.caminho === imagem.caminho) === i);
              }
              this._produtos.push(produto);
          })
          //this._produtos =  _produtos
          this._observer.next(_produtos);
        }
      });
  
  }
}
