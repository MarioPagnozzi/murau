import { EmpresasService } from './../../services/empresas.service';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { statusPedido } from 'src/app/enum/statusPedido';
import { ClienteModel } from 'src/app/models/clienteModel';
import { PedidosModel } from 'src/app/models/pedidosModel';
import { VendedoresModel } from 'src/app/models/vendedoresModel';
import { ClienteService } from 'src/app/services/cliente.service';
import { PedidosService } from 'src/app/services/pedidos.service';
import { VendedoresService } from 'src/app/services/vendedores.service';
import { EmpresasModel } from 'src/app/models/empresasModel';
import { ItensPedidoModel } from 'src/app/models/itensPedidoModel';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HistoricoPedidoModel } from 'src/app/models/historicoPedidoModel';
import { ProdutosModel } from 'src/app/models/produtosModel';
import { getUrl, Permissao, RetornaDadosUsuario, RetornaGruposUsuario } from 'src/app/shared/funcoesGlobal';
import { ProdutosService } from 'src/app/services/produtos.service';
import { ProdutosEmpresasModel } from 'src/app/models/produtosEmpresasModel';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPedidos } from 'src/app/interfaces/IPedidos';
import { IGrupos } from 'src/app/interfaces/IGrupos';
import { NgxSpinnerService } from 'ngx-spinner';
import { CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/cdk/overlay/overlay-directives';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ProdutosEmpresasService } from 'src/app/services/produtos-empresas.service';


export interface IStatus {
  valor: number
  label: string
}
@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss']
})
export class PedidoComponent implements OnInit, AfterViewInit {

  pedido: PedidosModel = new PedidosModel();
  cliente: ClienteModel = new ClienteModel();
  vendedor: VendedoresModel = new VendedoresModel();
  empresa: EmpresasModel = new EmpresasModel();
  status: IStatus[] = [];

  iconBtnEye = "pi pi-eye";
  mostraExcluidos = false;
  toolTipBtnExcluidos = "Mostrar Itens Excluídos";
  message: any;
  empresaPadrao: ProdutosEmpresasModel = new ProdutosEmpresasModel();
  empresasVendedor: ProdutosEmpresasModel[] = [];
  selEmpresasEstoque: ProdutosEmpresasModel[] = [];
  //itens de pedidos
  itemDialog = false;
  itemPedido: ItensPedidoModel = new ItensPedidoModel();
  subimetted = false;
  itensPedido: ItensPedidoModel[] = [];
  selItens: ItensPedidoModel[] = [];
  totalItem = 0;
  produto: ProdutosModel = new ProdutosModel();
  mostraEstoqueEmpresas = true;
  //histórico do pedido
  rastreios: HistoricoPedidoModel[] = [];
  vendedores = false;

  //Permissoes
  alterar = false;
  isRoot = false;
  spinnerAcao = "";
  statusPedido: statusPedido = statusPedido.Pendente;

  url: string = "";
  uid: string = "";
  CliUid: string = "";

  constructor(
    private pedidoService: PedidosService,
    private route: Router,
    private active: ActivatedRoute,
    private clienteService: ClienteService,
    private vendedoresService: VendedoresService,
    private empresaService: EmpresasService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private produtosService: ProdutosService,
    private matSnack: MatSnackBar,
    private produtosEmpresasService: ProdutosEmpresasService
  ) { }
  
  @ViewChild('codProd')
  public codProd!: ElementRef;
  @ViewChild('qtdProd') public qtdProd!: ElementRef;
  @ViewChild('btnAddNovo') public btnAddNovo!: ElementRef;
  @ViewChild('btnSalvar') public btnSalvar!: ElementRef;

  ngOnInit(): void {

    this.status = [
      {valor: statusPedido.Pendente, label: statusPedido[statusPedido.Pendente].toUpperCase()},
      {valor: statusPedido.Aprovado, label: statusPedido[statusPedido.Aprovado].toUpperCase()},
      {valor: statusPedido.Despachado, label: statusPedido[statusPedido.Despachado].toUpperCase()},
      {valor: statusPedido.Transito, label: statusPedido[statusPedido.Transito].toUpperCase()},
      {valor: statusPedido.Entregue, label: statusPedido[statusPedido.Entregue].toUpperCase()}
  ];
 
    // tslint:disable-next-line: deprecation
    this.active.params.subscribe(p => this.getUid(p.cod));

    
    const vend = RetornaGruposUsuario();
    // tslint:disable-next-line: forin
    for (let v in vend) {
      let {nome_grupo} = vend[v];
      if (nome_grupo?.toUpperCase() === "VENDEDORES" || nome_grupo?.toUpperCase() === "SUPER USUARIO") {
        this.vendedores = true
      }
      this.alterar = Permissao("pedidos", "A");
    }

    const grupos = RetornaGruposUsuario();
    // tslint:disable-next-line: forin
    for (let g in grupos) {
      let {nome_grupo} = grupos[g];
      if (nome_grupo?.toUpperCase() === "SUPER USUÁRIO" && localStorage.getItem("murau:isroot")) {
        this.isRoot = true;
      }
    }

  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
   
  }
  async salvarAlteracoes() {
  
    this.spinnerAcao = "Gravando...";
    console.log(this.pedido)
    //this.spinnerServer.show();
    const result = await this.pedidoService.post(this.pedido);
    console.log(this.pedido)
    if (result.success) {
     
      //this.spinnerServer.hide();
      const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, {duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok']});
      // tslint:disable-next-line: deprecation
      snack.afterDismissed().subscribe(() => {
        this.route.navigateByUrl(`/cliente/${this.cliente.uid}`);
      })
    }

  }
  async getUid(uid: string): Promise<void> {
  
   
    this.spinnerAcao = "Carregando..."; 
   
    

    this.active.queryParams.subscribe({
      next: async (qp) => {
        console.log(qp)
          this.url = qp.url;
          this.uid = qp.codigo;
          this.CliUid = qp.cli;
      }
    })
    this.clienteService.getObservableById(this.CliUid).subscribe({
      next: (cliente) => {
        this.cliente = cliente as ClienteModel; 
      },
      complete: async () => {
        console.log(this.cliente)        
        this.vendedor = this.cliente.vendedor as VendedoresModel;
        this.empresa = this.cliente.empresa as EmpresasModel;
        this.cliente.vendedor = new VendedoresModel();
        this.cliente.pedidos = [];

        this.vendedoresService.getObservableById(this.vendedor.uid as string).subscribe({
          next: (vendedor) => {
            this.vendedor = vendedor as VendedoresModel;
          }
        })

        if (uid === "novo") {
          this.pedido.cliente = this.cliente;
          this.pedido.empresa = this.empresa;
          this.pedido.vendedor = this.vendedor;
          this.pedido.ativo = true;
          this.pedido.status_pedido = statusPedido.Pendente;
          this.pedido.previsao_entrega = 15;
          return;
        }
 
        const result = await this.pedidoService.getById(uid);
        this.pedido = result.data as PedidosModel;
        this.pedido.cliente = this.cliente;
        this.pedido.previsao_entrega = this.pedido.previsao_entrega ? this.pedido.previsao_entrega : 15;
        this.statusPedido = this.pedido.status_pedido ? this.pedido.status_pedido : statusPedido.Pendente;
        this.itensPedido = this.pedido.itens as ItensPedidoModel[];
        this.itensPedido = this.itensPedido.filter(val => !val.excluido);
        this.totalItem = this.totalizaItens();
        this.rastreios = this.pedido.historico as HistoricoPedidoModel[];
      }
    });
  }
  addItem() {
    this.subimetted = false;
    this.itemDialog = true;
  }
  saveItem() {
    this.subimetted = true;
    
    if (this.produto) {
      this.itensPedido = this.pedido.itens as ItensPedidoModel[];
      if (this.itemPedido.uid) {
        const i = this.findIndexById(this.itemPedido.uid ? this.itemPedido.uid : '0');
        const qtd = this.itemPedido.qtd_produto ? this.itemPedido.qtd_produto : 0;
        const valor_unitario = this.itemPedido.valor_unitario ? this.itemPedido.valor_unitario : 0;
        if (i !== -1) {
          this.itensPedido[i].qtd_produto = qtd;
          this.itensPedido[i].valor_total = qtd * valor_unitario;
          this.itensPedido[i].valor_unitario = valor_unitario;
        }
        
      } else {
        this.itemPedido.produto = this.produto;
        this.itensPedido.push(this.itemPedido);
      }
      this.pedido.itens = this.itensPedido as ItensPedidoModel[];
      this.totalItem = this.totalizaItens();
      this.pedido.valor_pedido = this.totalPedido();
      this.produto = new ProdutosModel();
      this.message = "";
      this.empresaPadrao = new ProdutosEmpresasModel();
      this.itemPedido = new ItensPedidoModel();
      if (!this.mostraExcluidos) {
        this.itensPedido = this.itensPedido.filter(val => !val.excluido);
      }
    }

  }
  excluirItensSel() {
    this.confirmationService.confirm({
      message: "Está certo que deseja excluir os itens selecionados ?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        //criar rotina de exclusão
        //const itens = this.itensPedido;
        //this.itensPedido = this.itensPedido.filter(val => !this.selItens.includes(val));
        this.itensPedido = this.pedido.itens as ItensPedidoModel[];
        this.itensPedido.forEach(item => {
          this.selItens.forEach(itemSel => {
            if (item.uid === itemSel.uid) {
              item.ativo = false;
              item.excluido = true;
            }
          })
        });
        this.pedido.itens = this.itensPedido;
        this.itensPedido = this.itensPedido.filter(val => !val.excluido);
        this.selItens = [];
        this.totalItem = this.totalizaItens();
        this.pedido.valor_pedido = this.totalPedido();
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Itens Excluídos",
          life: 30000
        })

      }
    })
  }
  editarItem(item: ItensPedidoModel) {
    this.itemPedido = {...item};
    this.produto = this.itemPedido.produto ? this.itemPedido.produto : new ProdutosModel();
    this.itemDialog = true;  
    this.filtraEmpresaProduto();
  }
  btnAddNovoClick() {
     this.codProd.nativeElement.focus();
  }
  excluirItem(item: ItensPedidoModel) {

    this.confirmationService.confirm({
      message: "Desesaja remover o item " + item.produto?.nome + "?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        //criar rotina Excluir Item
        this.itensPedido = this.pedido.itens as ItensPedidoModel[];
        const i = this.findIndexById(item.uid ? item.uid : '0');
        if (i > -1) {
          this.itensPedido[i].excluido = true;
          this.itensPedido[i].ativo = false;
        }
        this.pedido.itens = this.itensPedido;
        this.itensPedido = this.itensPedido.filter(val => !val.excluido);
        this.itemPedido = new ItensPedidoModel();
        this.totalItem = this.totalizaItens();
        this.pedido.valor_pedido = this.totalPedido();
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Item Excluído",
          life: 3000
        })
      }
    })
    console.log('chamou excluir ' + item.produto?.nome)
  }
  hideDialog() {  
    this.itemDialog = false;
    this.subimetted = false;
    if (this.itemPedido.uid) {
      this.itemPedido = new ItensPedidoModel();
    }
    this.produto = new ProdutosModel();
    this.message = "";
    this.empresaPadrao = new ProdutosEmpresasModel();
  }
  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.itensPedido.length; i++) {
        if (this.itensPedido[i].uid === id) {
            index = i;
            break;
        }
    }

    return index;
  }
  qtdProdExit() {
    if (this.itemPedido.uid) {
      this.btnSalvar.nativeElement.focus();
    }
    else {
      this.btnAddNovo.nativeElement.focus();
    }
  }
  valorTotalItem() {
    if (!this.itemPedido.valor_unitario) {
      this.itemPedido.valor_unitario = this.empresaPadrao.valor;
    }
    const valor_unitario = this.itemPedido.valor_unitario ? this.itemPedido.valor_unitario : 0;
    const qtd_produto = this.itemPedido.qtd_produto ? this.itemPedido.qtd_produto : 0;
    this.itemPedido.valor_total = valor_unitario * qtd_produto;
    
  }
  totalPedido() {
    let total = 0;
    this.itensPedido.forEach(i => {
      total = total + (i.valor_total && !i.excluido ? i.valor_total : 0);
    });
    return total;
  }
  totalizaItens(): number {
    let total = 0;
    this.itensPedido.forEach(i => {
      total = total + (i.qtd_produto && !i.excluido ? i.qtd_produto : 0);
    })
    return total;
  }
  @ViewChild("dt") public dt: any;
  applyFilterGlobal($event: Event, stringVal: any) {     
     this.dt.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }
  async buscaProduto() {
    this.empresasVendedor = [] as ProdutosEmpresasModel[];
    this.empresaPadrao = new ProdutosEmpresasModel();
    this.itemPedido = new ItensPedidoModel();
    const codProd = this.produto.codigo;
    const prod = await this.produtosService.filtro("codigo", this.produto.codigo);
    if (prod.data) {
      this.produto = prod.data as ProdutosModel;
      console.log(this.produto)
      this.itemPedido.produto = this.produto;
      this.filtraEmpresaProduto();
      this.qtdProd.nativeElement.focus();
    } else {
      this.produto = new ProdutosModel(); 
      //this.produto.codigo = codProd;
      this.message = "Produto não Encontrato para este Código";
      this.empresaPadrao = new ProdutosEmpresasModel();
      this.itemPedido = new ItensPedidoModel();
      this.codProd.nativeElement.focus();
    }
    
  }
  async filtraEmpresaProduto() {
    this.empresaPadrao = new ProdutosEmpresasModel();
    this.empresasVendedor = [] as ProdutosEmpresasModel[];
    let produtosEmpresas: ProdutosEmpresasModel[] = [] as ProdutosEmpresasModel[];
    let prodEmp: any[] = this.produto.produtosEmpresas as ProdutosEmpresasModel[];
    for (let i = 0; i < prodEmp.length; i++) {
      let result = await this.produtosEmpresasService.getById(prodEmp[i].uid as string);
      if (result.success) {
        produtosEmpresas.push(result.data);
      }
    }
    console.log(produtosEmpresas)
    if (produtosEmpresas.length <= 0) {
      this.message = "Produto não está relacionado a nenhuma Empresa";
      return;
    }
    console.log(this.cliente)
    this.empresaPadrao = produtosEmpresas.filter(val => val.empresa?.uid === this.cliente.empresa?.uid)[0] as ProdutosEmpresasModel;
    const result_vend = await this.vendedoresService.getById(this.vendedor.uid as string);
    this.vendedor = result_vend.data;
    console.log(this.vendedor)
   
    const selEmpPadrao: ProdutosEmpresasModel[] = [this.empresaPadrao];
    console.log(selEmpPadrao);
    console.log(this.empresaPadrao)
    this.empresasVendedor = produtosEmpresas.filter(val => !selEmpPadrao.includes(val));
   
  }
  mostraItensExcluidos() {

    if (this.mostraExcluidos) {
      this.itensPedido = this.itensPedido.filter(val => !val.excluido);
      this.mostraExcluidos = false;
      this.iconBtnEye = "pi pi-eye";
      this.toolTipBtnExcluidos = "Mostrar Itens Excluídos";
    } else {
      this.itensPedido = this.pedido.itens as ItensPedidoModel[];
      this.mostraExcluidos = true;
      this.iconBtnEye = "pi pi-eye-slash";
      this.toolTipBtnExcluidos = "Ocultar Itens Excluídos";
    }
    
  }
  restauraItem(item: ItensPedidoModel) {
    const i = this.findIndexById(item.uid ? item.uid : '0');
    if (i > -1) {
      this.itensPedido[i].excluido = false;
      this.itensPedido[i].ativo = true;
    }
    this.pedido.itens = this.itensPedido;
    this.pedido.valor_pedido = this.totalPedido();
    this.totalItem = this.totalizaItens();
  }

}
