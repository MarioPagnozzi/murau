import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IImagesProduto } from '../interfaces/IImagesProduto';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ImagemProdutosService extends BaseService<IImagesProduto> {

  constructor(public http: HttpService, public httpCli: HttpClient) {
    super("imagesProduto", http, httpCli);
   }
}
