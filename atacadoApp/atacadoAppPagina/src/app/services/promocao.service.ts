import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseService } from '../base/baseService';
import { PromocoesModel } from '../models/promocoesModel';
import { IPromocoes } from '../interfaces/ipromocoes';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class PromocaoService extends BaseService<IPromocoes | PromocoesModel | PromocoesModel[]>{
  //private baseUrl = `${environment.url_api}/promocao`;

  private createHeader(header?: HttpHeaders) {
    if (!header) {header = new HttpHeaders()}
   
    const token = localStorage.getItem("murau:token");
    if (token) {
      header = header.append("x-token-access", token);
    }
    return header;
  }

  constructor(public http: HttpService, public httpCli: HttpClient) {
    super("promocao", http, httpCli); }

  upload(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    const header = this.createHeader()
    formData.append('files', file);
    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {  
      reportProgress: true,
      responseType: 'json',
      headers: header
    });

    return this.httpCli.request(req);
  }

  getFiles(): Observable<any> {
    const header = this.createHeader()
    return this.httpCli.get(`${this.baseUrl}/files`, {headers: header});
  }
}
