import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { IProdutos } from 'src/app/interfaces/IProdutos';
import { PromocoesModel } from 'src/app/models/promocoesModel';
import { ProdutosService } from 'src/app/services/produtos.service';
import { PromocaoService } from 'src/app/services/promocao.service';

export class ModalPromocao {
  codigo: string = "";
  descricao: string = "";
  referencia: string = "";
  prodCod: string = "";
  dataInicio: Date = new Date();
  dataFinal: Date = new Date();
  vlrOriginal: number = 0;
  vlrPromocao: number = 0;

}

@Component({
  selector: 'app-promocoes',
  templateUrl: './promocoes.component.html',
  styleUrls: ['./promocoes.component.scss']
})
export class PromocoesComponent implements OnInit {
  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';

  fileInfos?: Observable<any>;
  promocaoList: any[] = [];
  promocaoList_aux: any[] = [];
  selPromocoes: any[] = [];

  headerDialog = "Edição da Promoção";
  showDialog = false;
  submitted = false;

  promocao: PromocoesModel = new PromocoesModel();
  produto: IProdutos | any;
  desconto: number = 0;

  vlrPromocaoAux: number = 0;
  spinnerAcao = "Carregando..."

  @ViewChild("dt") public dt: any;

  constructor(private uploadService: PromocaoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private produtoService: ProdutosService,
    private matSnack: MatSnackBar,
    private promocaoService: PromocaoService) { }

  ngOnInit(): void {
    this.fileInfos = this.uploadService.getFiles();
    this.produto = {
      nome: ""
    }
  }
  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }
  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
 }
 excluirPromocoes() {
  this.confirmationService.confirm({
    message: "Deseja realmente excluir as promoções selecionadas ?",
    header: "Confirmação",
    icon: "pi pi-exclamation-triangle",
    accept: async () => {
      
      this.promocaoList = this.promocaoList.filter(val => !this.selPromocoes.includes(val));
      this.selPromocoes = [];
      this.messageService.add({
        severity: "success",
        summary: "Sucesso",
        detail: "Grupo Excluído",
        life: 3000
      })
    }

  })
 }
 excluirPromocao(Promo: any) {
  this.confirmationService.confirm({
    message: "Deseja realmente excluir a promoção " + Promo.desc_promocao + " - codigo: " + Promo.codigo_promocao + "?",
    header: "Confirmação",
    icon: "pi pi-exclamation-triangle",
    accept: async () => {
      
      this.promocaoList = this.promocaoList.filter(val => val.cod_produto !== Promo.cod_produto);
      
      this.messageService.add({
        severity: "success",
        summary: "Sucesso",
        detail: "Grupo Excluído",
        life: 3000
      })
    }

  })
 }
  upload(): void {
    this.progress = 0;
  
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
  
      if (file) {
        this.currentFile = file;
        this.geraTabelaPromo(this.currentFile)
        this.uploadService.upload(this.currentFile).subscribe({
          next: (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progress = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpResponse) {
              this.message = event.body.message;
              this.fileInfos = this.uploadService.getFiles();
            }
          },
          error: (err: any) => {
            console.log(err);
            this.progress = 0;
  
            if (err.error && err.error.message) {
              this.message = err.error.message;
            } else {
              this.message = 'Could not upload the file!';
            }
  
            this.currentFile = undefined;
          }
        });
      }
      this.selectedFiles = undefined;
    }
  }
  geraTabelaPromo(file: File) {
    let reader: FileReader = new FileReader();
    reader.readAsText(file);

    reader.onload = (e) => {
      let csv: any = reader.result;
      let allTextLines: any[] = csv.split(/\r|\n|\r/);     

      for (let i = 1; i < allTextLines.length; i++) {
        
        const lines = allTextLines[i].split(";");
        
        if (lines[0]) {
          let dtInicio = lines[4].trim().slice(3, -5) + '/' + lines[4].trim().slice(0, -8) + '/' + lines[4].trim().slice(6);
          let dtFinal = lines[5].trim().slice(3, -5) + '/' + lines[5].trim().slice(0, -8) + '/' + lines[5].trim().slice(6);
          console.log(dtInicio)
          console.log(dtFinal)
          let obj: any = {
            codigo_promocao: lines[0] ? (lines[0] as string).trim() : "",
            desc_promocao: lines[1] ? (lines[1] as string).trim() : "",
            desc_referencia: lines[2] ? (lines[2] as string).trim() : "",
            cod_produto: lines[3] ? (lines[3] as string).trim() : "",
            data_inicio:  new Date(dtInicio),
            data_final: new Date(dtFinal),
            vlr_anterior: lines[6] ? (lines[6] as string).trim().replace(',', ".") : lines[6],
            vlr_promocao: lines[7] ? (lines[7] as string).trim().replace(',', ".") : lines[7]
          }
          this.promocaoList_aux.push(obj);
        }
        
      }
   }
   reader.onloadend = (e) => {
     this.promocaoList = this.promocaoList_aux;
   }
  }
  isValidDate(str: string) {
    let d = new Date(str);
    console.log(str + ' = ' + d + str.length)
    console.log(d instanceof Date)
    if (d instanceof Date) {
      return false
    } else {
      return true;
    }
  }
  async openDialog(promocao: any) {
    this.showDialog = true;
    this.headerDialog = `${this.headerDialog}: ${promocao.desc_promocao}`;
    this.promocao = promocao;
    this.vlrPromocaoAux = promocao.vlr_promocao;
    let prod = await this.produtoService.filtro("codigo", promocao.cod_produto);
   
    if (prod.success) {
      this.produto = prod.data as IProdutos;
    }
    this.porcentCalc();
  }
  hideDialog() {
    this.showDialog = false;
    this.submitted = false;
    this.promocao = new PromocoesModel();
  }
  salvarDialog() {
    this.submitted = true;
    this.promocao.vlr_promocao = this.vlrPromocaoAux; 
  }
  porcentCalc() {
    this.desconto = 100 - ((this.promocao.vlr_promocao / this.promocao.vlr_anterior) * 100);
  }
  vlrCalc() {
    this.vlrPromocaoAux = this.promocao.vlr_anterior - (this.promocao.vlr_anterior * (this.desconto / 100));
  }
  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.promocaoList.length; i++) {
        if (this.promocaoList[i].cod_produto === id) {
            index = i;
            break;
        }
    }
    return index;
 }
 async salvarPromocoes() {
  this.spinnerAcao = "Gravando...";
  let result = await this.promocaoService.post(this.promocaoList)
  if (result.success) {
    const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, {duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok']});
    // tslint:disable-next-line: deprecation
    snack.afterDismissed().subscribe(() => {
      this.router.navigateByUrl(`/`);
    })
  }
 }
}
