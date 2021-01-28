import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IGrupos } from '../interfaces/IGrupos';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class GruposService extends BaseService<IGrupos> {

  constructor(public http: HttpService) { 
    super("grupos", http);
  }
}
