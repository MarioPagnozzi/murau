import { IResult } from "../interfaces/IResult";
import { HttpService } from "../services/http.service";
import {environment} from "./../../environments/environment";

export abstract class BaseService<T> {

    baseUrl = "";

    constructor(public url: string, public http: HttpService) {
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
}