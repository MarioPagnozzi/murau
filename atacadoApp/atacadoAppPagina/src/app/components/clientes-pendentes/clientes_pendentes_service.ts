import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Clientes } from './clientes_pendentes';

@Injectable()
export class ClientesPendentesService {
    constructor(private http: HttpClient) { }

    getClientesPendentes() {
        return this.http.get<any>('assets/clientes_pendentes.json')
            .toPromise()
            // tslint:disable-next-line: no-angle-bracket-type-assertion
            .then(res => <Clientes[]> res.data)
            // tslint:disable-next-line: arrow-return-shorthand
            .then(data => { return data; });
    }
}