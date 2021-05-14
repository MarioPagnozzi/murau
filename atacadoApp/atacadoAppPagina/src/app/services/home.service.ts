import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IProdutos } from '../interfaces/IProdutos';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService extends BaseService<IProdutos>{

  constructor(public http: HttpService, public httpCli: HttpClient) {
    super("home", http, httpCli);
   }
  
}
