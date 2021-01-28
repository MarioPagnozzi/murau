import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IVendedores } from '../interfaces/IVendedores';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class VendedoresService extends BaseService<IVendedores> {

  constructor(public http: HttpService) { 
    super("vendedores", http)
  }
}
