import { GrupoModel } from './../models/grupoModel';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IGrupos } from '../interfaces/IGrupos';
import { HttpService } from './http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GruposService extends BaseService<IGrupos | GrupoModel> {

  constructor(public http: HttpService, public httpCli: HttpClient) { 
    super("grupos", http, httpCli);
  }
}
