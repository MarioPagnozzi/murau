import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IProdutos } from '../interfaces/IProdutos';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService extends BaseService<IProdutos>{

  constructor(public http: HttpService) {
    super("home", http);
   }
}
