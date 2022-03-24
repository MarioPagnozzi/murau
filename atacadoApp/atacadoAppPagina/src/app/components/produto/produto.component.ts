import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmpresasModel } from 'src/app/models/empresasModel';
import { ImagesProdutoModel } from 'src/app/models/imagesProdutoModel';
import { ProdutosEmpresasModel } from 'src/app/models/produtosEmpresasModel';
import { ProdutosModel } from 'src/app/models/produtosModel';
import { EmpresasService } from 'src/app/services/empresas.service';
import { ProdutosService } from 'src/app/services/produtos.service';
import { FileManage } from '../input-file-photos/input-file-photos.component';

@Component({
  selector: 'app-produto',
  templateUrl: './produto.component.html',
  styleUrls: ['./produto.component.scss']
})
export class ProdutoComponent implements OnInit {

  spinnerAcao = 'Carregando...';
  produto: ProdutosModel = new ProdutosModel();
  imagens: ImagesProdutoModel[] = [];
  empresas: ProdutosEmpresasModel[] = [];

  alterar: boolean = false;
  excluir: boolean = false;

  url: string = "";
  length: number = 0;
  codprod: string = "";

  @ViewChild("dt") public dt: any;
  constructor(private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private route: Router,
              private active: ActivatedRoute,
              private matSnack: MatSnackBar,
              private produtoService: ProdutosService,
              private empresaService: EmpresasService) { }

  ngOnInit(): void {
    this.active.params.subscribe({
      next: (p) => {
        this.getUid(p.cod)
      }
    })
  }
  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }
  async getUid(uid: string): Promise<void> {

    this.active.queryParams.subscribe({
      next: (param) => {
        if (param.url === 'panel') {
          this.url = `/${param.url}`
        } else {
          this.url = '/produtos';
        }
      }
    })
    if (uid === 'novo') {
      return;
    }

    this.produtoService.getObservableById(uid).subscribe({
      next: (prod) => {
        this.produto = prod as ProdutosModel;
      },
      complete: async () => {
        console.log(this.produto.imagens)
        this.imagens = this.produto.imagens as ImagesProdutoModel[];
        this.length = this.imagens.length as number;
        console.log(this.produto.produtosEmpresas)
        this.produto.produtosEmpresas?.forEach(async (emp: ProdutosEmpresasModel) => {
           let prodEmp = await this.produtoService.ProdutoEmpresa(emp.uid as string);
           this.empresas.push(prodEmp);
        })
      }
    })
    
  }
  
  async salvarAlteracoes() {
    this.spinnerAcao = "Gravando...";

    this.produto.produtosEmpresas = this.empresas;
    this.produto.nome = this.produto.nome?.toUpperCase();
    this.produto.tamanho = this.produto.tamanho?.toUpperCase();
    this.produto.referencia = this.produto.referencia?.toUpperCase();
    
    let estoque = 0;
    this.empresas.forEach((emp) => {
      estoque += emp.estoque as number;
    })
    this.produto.estoque = estoque;

   
    const result = await this.produtoService.post(this.produto as ProdutosModel);
    if (result.success) {
      const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, { duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok'] });
      // tslint:disable-next-line: deprecation
      snack.afterDismissed().subscribe(() => {
        this.route.navigateByUrl(`${this.url}`);
      })
    }
  }
  upperCase($event: Event) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toUpperCase();
  }
  lowerCase($event: Event) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toLowerCase();
  }
  selectedFile(images: any): void {
    this.imagens = images;
  }
}
