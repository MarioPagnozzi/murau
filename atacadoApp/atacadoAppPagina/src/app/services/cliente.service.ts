import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { ICliente } from './../interfaces/IClientes';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService extends BaseService<ICliente> {

  constructor(public http: HttpService) { 
    super("clientes", http);
   }
}
