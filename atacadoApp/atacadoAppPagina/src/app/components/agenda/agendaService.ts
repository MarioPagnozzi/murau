import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AgendaService {
  constructor(private http: HttpClient) {

  }
  getEvents() {
    return this.http.get<any>("assets/agenda.json")
      .toPromise()
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      .then(res => <any[]> res.data)
      // tslint:disable-next-line: arrow-return-shorthand
      .then(data => { return data; });
  }
}
