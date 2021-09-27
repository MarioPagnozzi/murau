import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { BaseService } from '../base/baseService';
import { IResult } from '../interfaces/IResult';
import { ClienteModel } from '../models/clienteModel';
import { ICliente } from './../interfaces/IClientes';
import { HttpService } from './http.service';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClienteService extends BaseService<ICliente | ClienteModel> {

  private createHeader(header?: HttpHeaders) {
    if (!header) {header = new HttpHeaders()}

    header = header.append("Content-Type", "application/json");
    header = header.append("Accept", "application/json");

    const token = localStorage.getItem("murau:token");
    if (token) {
      header = header.append("x-token-access", token);
    }
    return header;
  }
  
  constructor(public http: HttpService, public httpCli: HttpClient, private spinner: NgxSpinnerService) { 
    super("clientes", http, httpCli);
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
      const body = JSON.stringify(cliente);
      console.log(body);
      try {
        const header = this.createHeader()
        this.spinner.show();
        const res = await this.httpCli.post(`${environment.url_api}/clientes/createCliente`, body, { headers: header}).toPromise();
        resolve({success: true, data: res, error: undefined});
        this.spinner.hide();
      }
      catch (error: any) {
        this.spinner.hide();
        if (error.status === 400) {
          console.log(error.error)
          let txtErro = '<ul>';
          if (Array.isArray(error.error)) {
            error.error.forEach((element: any) => {
              if (Array.isArray(element)) {
                element.forEach((el: any) => {
                  txtErro = txtErro + `<li style='text-align: left'>${el.message || el}</li>`;
                })
              } else {
                txtErro = txtErro + `<li style='text-align: left'>${element.message || element}</li>`;
              }
            });
            txtErro = txtErro + '</ul>';
            Swal.fire('Atenção', txtErro, 'warning');
          }
        }
        resolve({success: false, data: undefined, error});
      }
      
    })
  }
}
