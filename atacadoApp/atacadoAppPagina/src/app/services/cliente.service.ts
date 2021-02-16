import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { BaseService } from '../base/baseService';
import { IResult } from '../interfaces/IResult';
import { ClienteModel } from '../models/clienteModel';
import { ICliente } from './../interfaces/IClientes';
import { HttpService } from './http.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ClienteService extends BaseService<ICliente | ClienteModel> {

  constructor(public http: HttpService, private spinner: NgxSpinnerService) { 
    super("clientes", http);
   }
   async TotalClienteDia(): Promise<number> {
    const clientes = await this.http.get(`${environment.url_api}/clientes/clientesdia/hoje`);
    let total = 0;
    if (clientes.data) {
      clientes.data.forEach(() => {
        total = total + 1;
      })
    }
    return total;
  }
  async createCliente(cliente: ClienteModel): Promise<IResult> {
    return new Promise<IResult>(async (resolve) => {
      const body = cliente;
      console.log(body);
      try {
        this.spinner.show();
        const res = await this.http.post(`${environment.url_api}/clientes/createCliente`, body);
        resolve({success: true, data: res, error: undefined});
        this.spinner.hide();
      }
      catch (error) {
        this.spinner.hide();
        if (error.status === 400) {
          let txtErro = '<ul>';
          if (Array.isArray(error.error)) {
            error.error.forEach((element: any) => {
              txtErro += `<li style='text-align: left'>${element.message || element}</li>`;
            });
            txtErro += '</ul>';
            Swal.fire('Atenção', txtErro, 'warning');
          }
        }
        resolve({success: false, data: undefined, error});
      }
      
    })
  }
}
