import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
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
   async TotalClienteDia(): Promise<number> {
    const clientes = await this.http.get(`${environment.url_api}/clientes/clidia`);
    let total = 0;
    if (clientes.data) {
      clientes.data.forEach(() => {
        total = total + 1;
      })
    }
    return total;
  }
}
