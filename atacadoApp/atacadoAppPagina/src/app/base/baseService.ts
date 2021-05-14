import { HttpClient, HttpHandler, HttpRequest, HttpResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { IResult } from "../interfaces/IResult";
import { HttpService } from "../services/http.service";
import {environment} from "./../../environments/environment";

export abstract class BaseService<T> {

    baseUrl = "";

    constructor(public url: string, public http: HttpService, public httpCli: HttpClient) {
        this.baseUrl = `${environment.url_api}/${this.url}`;
    }

    public getAll(): Promise<IResult> {
        return this.http.get(this.baseUrl);
    }

    public getById(uid: string): Promise<IResult> {
        return this.http.get(`${this.baseUrl}/${uid}`);
    }

    public post(model: T): Promise<IResult> {
        return this.http.post(this.baseUrl, model);
    }

    public delete(uid: string): Promise<IResult> {
        return this.http.delete(`${this.baseUrl}/${uid}`);
    }

    public filtro(filtro: any, param: any) {
        return this.http.get(`${this.baseUrl}/${param}/${filtro}/filtro`);
    }
    public getTeste(): Observable<any> {
        const header = this.http.createHeader();
         return this.httpCli.get<any>(this.baseUrl, { headers: header });
      }
      httpError(error: any) {
        let msg = '';
        if (error.error instanceof ErrorEvent) {
          // client side error
          msg = error.error.message;
        } else {
          // server side error
          msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.log(msg);
        return throwError(msg);
      }
}