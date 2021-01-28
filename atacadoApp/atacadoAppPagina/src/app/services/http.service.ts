import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { IResult } from '../interfaces/IResult';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient, private spinner: NgxSpinnerService) { }

  private createHeader(header?: HttpHeaders) {
    if (!header) {header = new HttpHeaders()}

    header = header.append("Content-Type", "application/json");
    header = header.append("Accept", "application/json");

    const token = "";
    if (token) {
      header = header.append("x-access-token", token);
    }
    return header;
  }
  public get(url: string): Promise<IResult> {
    return new Promise<IResult>((resolve) => {
      const header = this.createHeader();
      this.spinner.show();
      this.http.get(url, { headers: header })
               .subscribe( 
                 
                 res => {
                      this.spinner.hide();
                      resolve({success: true, data: res, error: undefined});
                      
                     
                     
                 },
                 err => {
                      this.spinner.hide();
                      resolve({success: false, data: undefined, error: err})
                 
                });
                
    });
    
  }
  public post(url: string, model: any): Promise<IResult> {
    return new Promise<IResult>(async (resolve) => {
      const header = this.createHeader();
      try {
        this.spinner.show();
        const res = await this.http.post(url, model, {headers: header});
        resolve({success: true, data: res, error: undefined});
        this.spinner.hide();

      }
      catch (error) {
        this.spinner.hide();
        resolve({success: false, data: undefined, error});
      }
    })
  }
  public delete(url: string): Promise<IResult> {
    return new Promise<IResult>(async (resolve) => {
      const header = this.createHeader();
      try {
        this.spinner.show();
        const res = await this.http.delete(url, {headers: header});
        resolve({success: true, data: res, error: undefined});
        this.spinner.hide();

      }
      catch (error) {
        this.spinner.hide();
        resolve({success: false, data: undefined, error});
      }
    })
  }
}

