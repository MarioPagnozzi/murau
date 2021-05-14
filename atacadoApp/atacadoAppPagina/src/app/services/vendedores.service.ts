import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IVendedores } from '../interfaces/IVendedores';
import { VendedoresModel } from '../models/vendedoresModel';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class VendedoresService extends BaseService<IVendedores | VendedoresModel> {

  constructor(public http: HttpService, httpCli: HttpClient) { 
    super("vendedores", http, httpCli)
  }
}
