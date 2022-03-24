import { HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { InputFilePhotosService } from 'src/app/services/input-file-photos.service';
import { environment } from 'src/environments/environment';

export class FileManage {
  nome: string = ""
  extencao: string = ""
  base64Data: string = ""
}

@Component({
  selector: 'app-input-file-photos',
  templateUrl: './input-file-photos.component.html',
  styleUrls: ['./input-file-photos.component.scss']
})
export class InputFilePhotosComponent implements OnInit, OnChanges {
 /* @ViewChild('fileInput') fileInput: ElementRef | any;
  @Output() _select = new EventEmitter();
  @Input() label: string = "Selecione uma Imagem";
  @Input() image: string | any;
  
  fileCurrent: FileManage = new FileManage();
  file: any;
  localChange: boolean = false;
  constructor() { }

  ngOnChanges(changes: any): void {
    if (!this.localChange) {
      const image = changes.image.currentValue;
      this._populatePreLoadImage(image);
    }
  }
  ngOnInit(): void {
    this._populatePreLoadImage(this.image);
  }

  async selectFile(): Promise<void> {
    this.fileInput.nativeElement.click();
  }


  handleFileSelect(evt: any): void {
    const files = evt.target.files;
    const file = files[0];

    if (files && file) {
      this.localChange = true;
      this.fileCurrent.nome = file.name;
      const ext = file.name.split('.');
      this.fileCurrent.extencao = ext[1];
      const reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    } else {
      this.fileCurrent = new FileManage();
    }
  }
  private _setPictureFromCamera(picture: any): void {
    this.fileCurrent.nome = new Date().getTime().toString();
    this.fileCurrent.extencao = 'png';
    this.fileCurrent.base64Data = picture;
  }

  private _populatePreLoadImage(image: string): void {
    if (image) {
      const ext = image.split('.');
      const isBase64 = image.indexOf('base64') > -1;
      if (isBase64) {
        this._setPictureFromCamera(image);
      } else {        
        this.fileCurrent.extencao = ext[1];
        this.fileCurrent.nome = image;
        this.fileCurrent.base64Data = `${environment.url_api}/storage/${image}`;
      }
    }
  }

  private _handleReaderLoaded(readerEvt: any): void {
    const binaryString = readerEvt.target.result;
    const base64textString = btoa(binaryString);
    this.fileCurrent.base64Data = `data:image/${this.fileCurrent.extencao};base64,${base64textString}`;
    this._select.emit(this.fileCurrent);
  }
*/
fileArr: any[] = [];
imgArr: any[] = [];
fileObj: any[] = [];
form: FormGroup | any;
msg: string = "";
progress: number = 0;
_handleReaderLoaded: any;
@Output() _select = new EventEmitter();
@Input()
set fotos(fotos: any[]) {
  this._fotos = fotos;
}
get fotos() {return this._fotos}
private _fotos: any[] = [];

imagens: any[] = [];

@Input() codprod: string | undefined;
localChange: boolean = false;
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
constructor(
  public fb: FormBuilder,
  private sanitizer: DomSanitizer,
  public dragdropService: InputFilePhotosService
) {
  this.form = this.fb.group({
    avatar: [null]
  })
}
ngOnInit() {
  this.imagens = [];
}
ngOnChanges(changes: any): void {
    const fotos = changes.fotos.currentValue as any[];
    this.fotos = fotos;
}
upload(e: any) {
  const fileListAsArray = Array.from(e);
  fileListAsArray.forEach((item, i) => {
    const file: any = (e as HTMLInputElement);
    const url: any = URL.createObjectURL(file[i]);
    this.imgArr.push(url);
    this.fileArr.push({item, url});
    this.imagens.push({item, url});
  })
  this.fileArr.forEach((item: any) => {
    this.fileObj.push(item.item)
  })
  // Set files form control
  this.form.patchValue({
    avatar: this.fileObj
  })
  this.form.get('avatar').updateValueAndValidity()
  // Upload to server
  const header = this.createHeader();
  this.dragdropService.addFiles(this.form.value.avatar, header, this.codprod)
    .subscribe((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.Sent:
          console.log('Request has been made!');
          break;
        case HttpEventType.ResponseHeader:
          console.log('Response header has been received!');
          break;
        case HttpEventType.UploadProgress:
          this.progress = Math.round(event.loaded / (event.total as number) * 100);
          console.log(`Uploaded! ${this.progress}%`);
          break;
        case HttpEventType.Response:
          console.log('File uploaded successfully!', event.body);
          setTimeout(() => {
            this.progress = 0;            
            this.fileArr = [];
            this.fileObj = [];
            this.msg = "File uploaded successfully!"
          }, 3000);
      }
    })
}
// Clean Url
sanitize(url: string) {
  return this.sanitizer.bypassSecurityTrustUrl(url);
}

}
