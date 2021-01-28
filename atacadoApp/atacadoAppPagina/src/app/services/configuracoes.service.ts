import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IConfiguracoes } from '../interfaces/IConfiguracoes';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracoesService extends BaseService<IConfiguracoes> {

  constructor(public http: HttpService) {
    super("configuracoes", http);
   }
}
