import { environment } from './../../environments/environment.prod';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { PermissaoModel } from '../models/permissaoModel';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { IResult } from '../interfaces/IResult';
import { catchError, retry, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PermissaoService extends BaseService<PermissaoModel>  {

  constructor(public http: HttpService, public httpCli: HttpClient) {
    super("permissoes", http, httpCli);
  }

  public getObservableByGrupo(grupoUid: string): Observable<PermissaoModel> {
    const header = this.http.createHeader();
    return this.httpCli.get<PermissaoModel>(`${environment.url_api}/grupos/permissoes/${grupoUid}`, {headers: header})
                       .pipe(
                          tap(data => {
                            return data;
                          }),
                          retry(3),
                          catchError(this.httpError)
                       )
  }
}
