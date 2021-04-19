import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

export class FileManage {
  nome: string = ""
  extencao: string = ""
  base64Data: string = ""
}

@Component({
  selector: 'app-input-file',
  templateUrl: './input-file.component.html',
  styleUrls: ['./input-file.component.scss']
})
export class InputFileComponent implements OnInit, OnChanges {

  @ViewChild('fileInput') fileInput: ElementRef | any;
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

}
