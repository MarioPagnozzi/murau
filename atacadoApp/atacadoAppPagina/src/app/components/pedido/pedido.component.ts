import { EmpresasService } from './../../services/empresas.service';
import { Component, OnInit, ViewChild } from '@angular/core';
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

export interface IStatus {
  valor: number
  label: string
}
@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss']
})
export class PedidoComponent implements OnInit {

  pedido: PedidosModel = new PedidosModel();
  cliente: ClienteModel = new ClienteModel();
  vendedor: VendedoresModel = new VendedoresModel();
  empresa: EmpresasModel = new EmpresasModel();
  status: IStatus[] = [];

  //itens de pedidos
  itemDialog = false;
  itemPedido: ItensPedidoModel = new ItensPedidoModel();
  subimetted = false;
  itensPedido: ItensPedidoModel[] = [];
  selItens: ItensPedidoModel[] = [];
  totalItem = 0;
  produto: ProdutosModel = new ProdutosModel();
  //histórico do pedido
  rastreios: HistoricoPedidoModel[] = [];
  constructor(
    private pedidoService: PedidosService,
    private route: Router,
    private active: ActivatedRoute,
    private clienteService: ClienteService,
    private vendedoresService: VendedoresService,
    private empresaService: EmpresasService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    
    // tslint:disable-next-line: deprecation
    this.active.params.subscribe(p => this.getUid(p.cod, p.cli));
    this.status = [
        {valor: statusPedido.Pendente, label: statusPedido[statusPedido.Pendente].toUpperCase()},
        {valor: statusPedido.Aprovado, label: statusPedido[statusPedido.Aprovado].toUpperCase()},
        {valor: statusPedido.Despachado, label: statusPedido[statusPedido.Despachado].toUpperCase()},
        {valor: statusPedido.Transito, label: statusPedido[statusPedido.Transito].toUpperCase()},
        {valor: statusPedido.Entregue, label: statusPedido[statusPedido.Entregue].toUpperCase()}
    ];
  }
  async getUid(uid: string, cli: string): Promise<void> {
    if (uid === "new") {
      return;
    }
    const result = await this.pedidoService.getById(uid);
    this.pedido = result.data as PedidosModel;
    const cli_result = await this.clienteService.getById(cli);
    this.cliente = cli_result.data as ClienteModel;
    const vendedor_result = await this.vendedoresService.getById(this.cliente.vendedor?.uid ? this.cliente.vendedor?.uid : "");
    this.vendedor = vendedor_result.data as VendedoresModel;
    const empresa_result = await this.empresaService.getById(this.cliente.empresa?.uid ? this.cliente.empresa?.uid : "");
    this.empresa = empresa_result.data as EmpresasModel;
    console.log(this.pedido.itens)
    this.itensPedido = this.pedido.itens as ItensPedidoModel[];
    this.totalItem = this.totalizaItens();
    this.rastreios = this.pedido.historico as HistoricoPedidoModel[];
  }
  addItem() {
    this.subimetted = false;
    this.itemDialog = true;
  }
  saveItem() {
    this.subimetted = true;

    if (this.produto) {
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
        this.itensPedido.push(this.itemPedido);
      }
      this.pedido.itens = this.itensPedido as ItensPedidoModel[];
    }

  }
  excluirItensSel() {
    this.confirmationService.confirm({
      message: "Está certo que deseja excluir os itens selecionados ?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        //criar rotina de exclusão
        this.itensPedido = this.itensPedido.filter(val => !this.selItens.includes(val));
        this.selItens = [];
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
    this.itemPedido = item;
    this.produto = item.produto ? item.produto : {};
    this.itemDialog = true;
  }
  excluirItem(item: ItensPedidoModel) {

    this.confirmationService.confirm({
      message: "Desesaja remover o item " + item.produto?.nome + "?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        //criar rotina Excluir Item
        this.itensPedido = this.itensPedido.filter(val => val.uid !== item.uid);
        this.itemPedido = new ItensPedidoModel();
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
      this.produto = new ProdutosModel();
      this.itemPedido = new ItensPedidoModel();
    }
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
  totalizaItens(): number {
    let total = 0;
    this.itensPedido.forEach(i => {
      total = total + (i.qtd_produto ? i.qtd_produto : 0);
    })
    return total;
  }
  @ViewChild("dt") public dt: any;
  applyFilterGlobal($event: Event, stringVal: any) {
     
     this.dt.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }
}
