import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InputFilePhotosService {
  private createHeader(header?: HttpHeaders) {
    if (!header) {header = new HttpHeaders()}

    //header = header.append("Content-Type", "application/json");
    //header = header.append("Accept", "application/json");

    const token = localStorage.getItem("murau:token");
    if (token) {
      header = header.append("x-token-access", token);
    }
    console.log(token)
    return header;
  }
  constructor(private http: HttpClient) { }

  addFiles(images: File, header?: HttpHeaders, codProd?: any) {
    if (!header) {header = this.createHeader()}
    let arr: any[] = []
    let formData: FormData = new FormData();
    arr.push(images);
    arr[0].forEach((item: any, i: any) => {
      formData.append('files', arr[0][i]);
    })
    if (codProd) {formData.append('cdproduto', codProd)};
    
    console.log(header)
    const req = new HttpRequest('POST', 'https://localhost:9443/produtos/uploadfotos', formData, {
      headers: header,
      reportProgress: true,
      responseType: 'json'
    })
    return this.http.request(req)
  }
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage: string = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
