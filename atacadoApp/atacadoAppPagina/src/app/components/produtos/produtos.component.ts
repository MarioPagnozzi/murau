import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GrupoModel } from 'src/app/models/grupoModel';
import { PermissaoModel } from 'src/app/models/permissaoModel';
import { ProdutosModel } from 'src/app/models/produtosModel';
import { ProdutosService } from 'src/app/services/produtos.service';
import { IPermissoes, UsuariosService } from 'src/app/services/usuarios.service';
import { GrupoComponent } from '../grupo/grupo.component';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss']
})
export class ProdutosComponent implements OnInit {

  selProdutos: ProdutosModel[] = [];
  produtoList: ProdutosModel[] = [];
  produtos: ProdutosModel[] = [];

  grupos: GrupoModel[] = []

  toolTipBtnExcluidos: string = "Mostrar Produtos Excluídos";
  iconBtnEye: string = "pi pi-eye";

  spinnerAcao: string = "Carregando Produtos...";
  mostraExcluidos: boolean = false;

  alterar: boolean = false;
  excluir: boolean = false;
  inserir: boolean = false

  permissoes: PermissaoModel[] = []; 

  @ViewChild("dt") public dt: any;

  constructor(private produtosService: ProdutosService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private route: Router,
              private usuarioService: UsuariosService) { }

  async ngOnInit() {

    this.produtos =  await this.retornaProdutos();
    this.produtoList = this.produtos.filter(val => val.ativo && !val.excluido);
    
    let grupos = JSON.parse(localStorage.getItem("murau:grupo") as string) as GrupoModel[];
    this.usuarioService.recarregaPermissoes(grupos);

    this.usuarioService.permissoesSubject.subscribe({
      next: (perm) => {     
        this.permissoes = perm;
        console.log("completou")
        let permissao = this.hasPermissoes();
        this.alterar = permissao.alterar;
        this.excluir = permissao.excluir;
        this.inserir = permissao.inserir;
        console.log(permissao)
        console.log(this.permissoes)
      }
    })

  }
  verificaEstoque() {
    this.produtosService.produtosSelecionados(this.selProdutos);
    this.route.navigateByUrl("/relatorios/produtos/estoque");
  }
  hasPermissoes(): IPermissoes {

  
    let excluir = false;
    let alterar = false;
    let inserir = false;  
    let return_perm = this.permissoes.filter((perm) => perm.tabela?.toString() === "grupos" && (perm.excluir as boolean) === true);
   
    if (return_perm.length > 0) {
     excluir = return_perm[0].excluir as boolean;
     return_perm = []
    }
  
    return_perm = this.permissoes.filter((perm) => perm.tabela?.toString() === "grupos" && (perm.alterar as boolean) === true);
    if (return_perm.length > 0) {
     alterar = return_perm[0].alterar as boolean;
     return_perm = []
    }
  
    return_perm = this.permissoes.filter((perm) => perm.tabela?.toString() === "grupos" && (perm.inserir as boolean) === true);
    if (return_perm.length > 0) {
     inserir = return_perm[0].inserir as boolean;
     return_perm = []
    }
  
     const permissao: IPermissoes = {
       tabela: "produtos",
       visualizar: true,
       excluir: excluir,
       alterar: alterar,
       inserir: inserir
     }
     return permissao;
  }
  async retornaProdutos(): Promise<ProdutosModel[]> {
    this.spinnerAcao = "Carregando Produtos...";
    const result = await this.produtosService.getAll();
    if (result.success) {
      return result.data as ProdutosModel[];
    }
    return [];
  }
  excluirProdutos() {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir os produtos selecionados?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.produtoList = this.produtos;
        let x = 1;
        this.selProdutos.forEach(async (produto) => {
          const i = this.findIndexById(produto.uid ? produto.uid : '0');
          if (i > -1) {
            this.produtoList[i].ativo = false;
            this.produtoList[i].excluido = true;
            this.spinnerAcao = "Excluindo registro " + x.toString() + " de " + this.selProdutos.length.toString();
            const result = await this.produtosService.delete(produto.uid ? produto.uid : '0');
            if (!result.success) {
              this.produtoList[i].ativo = true;
              this.produtoList[i].excluido = false;
            }
          }
          setTimeout(() => {
            x += 1;
          }, 3000)
        });
        this.produtos = this.produtoList;
        this.mostraExcluidos = true;
        this.mostraProdutosExcluidos();
        this.selProdutos = [];
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Produtos Excluídos",
          life: 3000
        })
      }
    })
  }
  excluirProduto(produto: ProdutosModel) {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir o produto " + produto.nome + "?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
      
          this.spinnerAcao = "Excluindo Registro ...";
          const result = await this.produtosService.delete(produto.uid ? produto.uid : '0');
        
        if (result.success) {
              const result_prod = await this.produtosService.getAll();
              this.produtos =  result_prod.data as ProdutosModel[];
              this.produtoList = this.produtos.filter(val => val.ativo && !val.excluido);
              this.mostraExcluidos = true;
              this.mostraProdutosExcluidos();
              this.messageService.add({
                severity: "success",
                summary: "Sucesso",
                detail: "Produto Excluído",
                life: 3000
            })
        }
      }
    })
  }
  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
 }
 findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.produtoList.length; i++) {
        if (this.produtoList[i].uid === id) {
            index = i;
            break;
        }
    }
    return index;
 }
 mostraProdutosExcluidos() {
  if (this.mostraExcluidos) {
    this.iconBtnEye = "pi pi-eye";
    this.toolTipBtnExcluidos = "Mostrar Produtos Excluídos";
    this.mostraExcluidos = false;

    this.produtoList = this.produtoList.filter(val =>  val.ativo && !val.excluido);
    } else {
        this.mostraExcluidos = true;
        this.iconBtnEye = "pi pi-eye-slash";
        this.toolTipBtnExcluidos = "Ocultar Produtos Excluídos";
        this.produtoList = this.produtos;
    }
 }
 async restauraProduto(produto: ProdutosModel) {
  let _produto = {...produto};
  _produto.ativo = true;
  _produto.excluido = false;
  this.spinnerAcao = "Restaurando Registro..."
  const result = await this.produtosService.post(_produto);
  console.log(result)
  if (result.success) {
        this.grupos = [];
        this.grupos = await this.retornaProdutos();
        this.produtoList = this.produtos.filter(val => val.ativo && !val.excluido);
        this.mostraExcluidos = true;
        this.mostraProdutosExcluidos();
    
  }
 }
}
