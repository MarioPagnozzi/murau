import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscriber, Subscription } from 'rxjs';
import { ProdutosModel } from 'src/app/models/produtosModel';

import { ProdutosService } from 'src/app/services/produtos.service';
import * as pdfMake from "pdfmake/build/pdfmake";  
import * as pdfFonts from "pdfmake/build/vfs_fonts";  
import { RetornaDadosUsuario } from 'src/app/shared/funcoesGlobal';
import { ProdutosEmpresasModel } from 'src/app/models/produtosEmpresasModel';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;   

@Component({
  selector: 'app-rel-estoque',
  templateUrl: './rel-estoque.component.html',
  styleUrls: ['./rel-estoque.component.scss']
})
export class RelEstoqueComponent implements OnInit {

  subscription: Subscription = new Subscription();
  produtosSel: ProdutosModel[] = [];
  SelProdutos: ProdutosModel[] = [];
  produtosEstoque: ProdutosModel[] = [];
  produtoList: ProdutosModel[] = [];
  spinnerAcao: string = "Gerando Relatório de Estoque";
  codProd: string = "";

  usuario: any;

  @ViewChild("dt") public dt: any;

  constructor(private produtoService: ProdutosService) {  }

  ngOnInit(): void {
    this.subscription = this.produtoService.produtosSelEstoque$.subscribe({
      next: (produtos) => {
        this.produtosSel = produtos;
      }
    })
    console.log(this.produtosSel)
    if (this.produtosSel.length > 0) {
      this.geraEstoque(this.produtosSel)
    }
    this.usuario = RetornaDadosUsuario() ? RetornaDadosUsuario() : "";
    console.log(this.usuario)
  }
  async geraEstoque(produtos: ProdutosModel[]) {
    console.log(produtos)
    for (let p of produtos) {
      let prodSel = await this.produtoService.getEstoques('0', p.codigo);
      if (prodSel) {
       
        prodSel.total_estoque01 = prodSel.produtosEmpresas.reduce((sum: any, p: any) => sum + p.estoque, 0);
        prodSel.total_estoque05 = prodSel.produtosEmpresas.reduce((sum: any, p: any) => sum + p.estoque05, 0);
        prodSel.total_estoque08 = prodSel.produtosEmpresas.reduce((sum: any, p: any) => sum + p.estoque08, 0);
        prodSel.total_estoque14 = prodSel.produtosEmpresas.reduce((sum: any, p: any) => sum + p.estoque14, 0);
        prodSel.total_estoque23 = prodSel.produtosEmpresas.reduce((sum: any, p: any) => sum + p.estoque23, 0);
        this.produtosEstoque.push(prodSel);
      }
    }
    this.produtoList = this.produtosEstoque;
    console.log(this.produtosEstoque);
  }
  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
 }
 excluirProduto(produto: any) {
   //excluir produtos do estoque.
   let i = this.findIndexById(produto.uid);
   this.produtosEstoque = this.produtosEstoque.filter(val => val.uid !== this.produtosEstoque[i].uid);
   this.produtoList = [];
   this.produtoList = this.produtosEstoque;
 }
 excluirProdutos() {
   this.produtosEstoque = this.produtosEstoque.filter(val => !this.SelProdutos.includes(val));
   this.produtoList = [];
   this.produtoList = this.produtosEstoque;
 }
 async buscarProduto() {
  this.produtoList = [];
  let prodSel: ProdutosModel = await this.produtoService.getEstoques('0', this.codProd);
  if (prodSel) {
    
    prodSel.total_estoque01 = prodSel.produtosEmpresas?.reduce((sum: any, p: any) => sum + p.estoque, 0);
    prodSel.total_estoque05 = prodSel.produtosEmpresas?.reduce((sum: any, p: any) => sum + p.estoque05, 0);
    prodSel.total_estoque08 = prodSel.produtosEmpresas?.reduce((sum: any, p: any) => sum + p.estoque08, 0);
    prodSel.total_estoque14 = prodSel.produtosEmpresas?.reduce((sum: any, p: any) => sum + p.estoque14, 0);
    prodSel.total_estoque23 = prodSel.produtosEmpresas?.reduce((sum: any, p: any) => sum + p.estoque23, 0);
    this.produtosEstoque.push(prodSel);
  }
  this.produtoList = this.produtosEstoque;
 }
 getBase64ImageFromURL(url: string) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      let canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx: any = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      let dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = error => {
      reject(error);
    };
    img.src = url;
  });
}

async imprimirRel() {
  
  let logo = await this.getBase64ImageFromURL('./../../assets/images/logo.png');
  let data = new Date();
  //this.usuario = RetornaDadosUsuario() ? RetornaDadosUsuario() : "";
  let nomeUsuario = this.usuario.nome;

  let body: any[] = [];
  let content: any[] = [];

  content.push({text: 'Relatório de Controle de Estoque x Produto x Empresas'});

  for (let key in this.SelProdutos) {
    if (this.SelProdutos.hasOwnProperty(key)) {
      body = [];
      let produto = this.SelProdutos[key];      
      let row = new Array();
      row.push({rowSpan: 2, image: await this.getBase64ImageFromURL(produto.imagens[0].caminho), fit: [100, 150]});
      row.push({colSpan: 6, text: produto.codigo + ' - ' + produto.nome});
      row.push({text: 'col3'});
      row.push({text: 'col4'});
      row.push({text: 'col5'});
      row.push({text: 'col6'});
      row.push({text: 'col7'});
      body.push(row);

      let row2 = new Array();

      row2.push({text: 'col1'})
      row2.push({colSpan: 2, text: `cor: ${produto.cor}`});
      row2.push({text: 'col3'})
      row2.push({colSpan: 4, text: `Referência: ${produto.referencia}`});
      row2.push({text: 'col5'});
      row2.push({text: 'col6'});
      row2.push({text: 'col7'});
      body.push(row2)

      let data = new Array();
      data.push({text: 'Empresa', bold: true, fontSize: 8});
      data.push({text: 'Fisico', bold: true, fontSize: 8});
      data.push({text: 'Outlet', bold: true, fontSize: 8});
      data.push({text: 'Retorno Loja', bold: true, fontSize: 8});
      data.push({text: 'Showroom', bold: true, fontSize: 8});
      data.push({text: 'Sportaholics', bold: true, fontSize: 8});
      data.push({text: 'Total Estoque', bold: true, fontSize: 8})
      body.push(data);

      for (let key2 in produto.produtosEmpresas as ProdutosEmpresasModel[]) {
        if (produto.produtosEmpresas?.hasOwnProperty(key2)) {
          let prodEmpresa = produto.produtosEmpresas[key2];
          let data2 = new Array();
          data2.push({text: prodEmpresa.empresa?.nome_fantasia, fontSize: 8});
          data2.push({text: prodEmpresa.estoque, alignment: 'right', fontSize: 8});
          data2.push({text: prodEmpresa.estoque05, alignment: 'right', fontSize: 8});
          data2.push({text: prodEmpresa.estoque08, alignment: 'right', fontSize: 8});
          data2.push({text: prodEmpresa.estoque14, alignment: 'right', fontSize: 8});
          data2.push({text: prodEmpresa.estoque23, alignment: 'right', fontSize: 8});
          data2.push({text: ((prodEmpresa.estoque05 as number) + (prodEmpresa.estoque08 as number) + (prodEmpresa.estoque14 as number) + (prodEmpresa.estoque23 as number) + (prodEmpresa.estoque as number)), alignment: 'right', fontSize: 8})
          body.push(data2)
        }
      }
      let totais = new Array();
      totais.push({text: 'Totais', alignment: 'right', bold: true, fontSize: 8});
      totais.push({text: produto.total_estoque01, alignment: 'right', bold: true, fontSize: 8});
      totais.push({text: produto.total_estoque05, alignment: 'right', bold: true, fontSize: 8});
      totais.push({text: produto.total_estoque08, alignment: 'right', bold: true, fontSize: 8});
      totais.push({text: produto.total_estoque14,  alignment: 'right', bold: true, fontSize: 8});
      totais.push({text: produto.total_estoque23, alignment: 'right', bold: true, fontSize: 8});
      totais.push({text: ((produto.total_estoque01 as number) + (produto.total_estoque05 as number) + (produto.total_estoque08 as number) + (produto.total_estoque14 as number) + (produto.total_estoque23 as number)), alignment: 'right', bold: true, fontSize: 8});
      body.push(totais)
      content.push({table: {whidths: ['auto', 800, 250, 'auto', 'auto', 'auto', 'auto'], headerRows: 3, body: body}});
    }
  }

  let docDefinition: any = {
    pageSize: 'A4',
    // by default we use portrait, you can change it to landscape if you wish
    pageOrientation: 'portrait',
    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins: [ 40, 60, 40, 60 ],
    // tslint:disable-next-line: only-arrow-functions
    header: function(currentPage: any, pageCount: any, pageSize: any) {
      return  [{
        columns: [
          [
            {
              image: logo,
              fit: [50, 50],
              margin: [35, -12, 0, 0]
            }
          ],
          [{
            text: 'Relatório Estoque x Empresa',
            margin: [2, 5, 5, 0], fontSize: 10, bold: true
          }, 
         ],
          [{
            text: 'Impressão: ' + data.toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
            margin: [25, 5, 35, 0], fontSize: 8, alignment: 'right'
    
          }]
        ],       
      }, {
        canvas: [
          {
            type: 'line',
            x1: 25,
            y1: 5,
            x2: 560,
            y2: 5,
            lineWidth: 1
          }
        ]
      }
     ]
    },  
    content: content,
    // tslint:disable-next-line: only-arrow-functions
    footer: function(currentPage: any, pageCount: any, pageSize: any) {
      return [{
        canvas: [
          {
            type: 'line',
            x1: 25,
            y1: 5,
            x2: 560,
            y2: 5,
            lineWidth: 1
          }
        ]
      },
      {columns: [
        [{
          text: `Usuário: ${nomeUsuario}`,
          margin: [25, 5, 0, 0],
          alignment: 'left'
        }],
        [
          {
            text: `página ${currentPage} de ${pageCount}`,
            margin: [0, 5, 35, 0],
            alignment: 'right'
          }
        ]
      ]}]
    }
  };
  pdfMake.createPdf(docDefinition).open();
 }
 findIndexById(id: string): number {
  let index = -1;
  for (let i = 0; i < this.produtosEstoque.length; i++) {
      if (this.produtosEstoque[i].uid === id) {
          index = i;
          break;
      }
  }
  return index;
}

}
