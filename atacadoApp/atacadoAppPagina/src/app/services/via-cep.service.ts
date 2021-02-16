import { ICEP } from './../interfaces/ICEP';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ViaCepService {

  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService) { }

    buscaCep(cep: string) {
      cep = cep.replace(/\D/g, '');

      if (cep === "") {
        return Swal.fire('Atenção', 'Cep não informado', 'warning');
      }

      const validaCep = /^[0-9]{8}$/;
      if (!validaCep.test(cep)) {
        return Swal.fire('Atenção', 'Cep informado é inválido', 'warning');
      }

      const url = `https://viacep.com.br/ws/${cep}/json/`;
      this.spinner.show();
      return <ICEP> this.http.get(url).toPromise()
                        // tslint:disable-next-line: no-angle-bracket-type-assertion
                        // tslint:disable-next-line: arrow-return-shorthand
                        .then(data => { this.spinner.hide(); return data; });
    }
}
