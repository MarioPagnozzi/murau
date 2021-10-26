import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { ITabelas } from '../interfaces/ITabelas';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class TabelasService extends BaseService<ITabelas> {

  constructor(public http: HttpService, public httpCli: HttpClient) {
    super("tabelas", http, httpCli);
   }
}
