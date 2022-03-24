import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { statusPedido } from 'src/app/enum/statusPedido';
import { GrupoModel } from 'src/app/models/grupoModel';
import { PedidosModel } from 'src/app/models/pedidosModel';
import { PermissaoModel } from 'src/app/models/permissaoModel';
import { PedidosService } from 'src/app/services/pedidos.service';
import { IPermissoes, UsuariosService } from 'src/app/services/usuarios.service';

interface IStatus {
  valor: number
  label: string
}
@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class PedidosComponent implements OnInit {

  selPedidos: PedidosModel[] = [];
  pedidoList: PedidosModel[] = [];
  pedidos: PedidosModel[] = [];

  grupos: GrupoModel[] = []
  status: IStatus[] = [];
  toolTipBtnExcluidos: string = "Mostrar Produtos Excluídos";
  iconBtnEye: string = "pi pi-eye";

  spinnerAcao: string = "Carregando Produtos...";
  mostraExcluidos: boolean = false;

  alterar: boolean = false;
  excluir: boolean = false;
  inserir: boolean = false

  permissoes: PermissaoModel[] = []; 

  @ViewChild("dt") public dt: any;

  constructor(private pedidosService: PedidosService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private route: Router,
              private usuarioService: UsuariosService) { }

  async ngOnInit() {

    this.pedidos =  await this.retornaPedidos();
    this.pedidoList = this.pedidos.filter(val => val.ativo && !val.excluido);
    
    let grupos = JSON.parse(localStorage.getItem("murau:grupo") as string) as GrupoModel[];
    this.usuarioService.recarregaPermissoes(grupos);
    this.status = [
      {valor: statusPedido.Pendente, label: statusPedido[statusPedido.Pendente].toUpperCase()},
      {valor: statusPedido.Aprovado, label: statusPedido[statusPedido.Aprovado].toUpperCase()},
      {valor: statusPedido.Despachado, label: statusPedido[statusPedido.Despachado].toUpperCase()},
      {valor: statusPedido.Transito, label: statusPedido[statusPedido.Transito].toUpperCase()},
      {valor: statusPedido.Entregue, label: statusPedido[statusPedido.Entregue].toUpperCase()}
  ];

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
       tabela: "pedidos",
       visualizar: true,
       excluir: excluir,
       alterar: alterar,
       inserir: inserir
     }
     return permissao;
  }
  async retornaPedidos(): Promise<PedidosModel[]> {
    this.spinnerAcao = "Carregando Pedidos...";
    const result = await this.pedidosService.getAll();
    if (result.success) {
      let pedidos: PedidosModel[] = [];
      for (let i = 0; i < result.data.length; i++) {
        let _pedido = await this.pedidosService.getById(result.data[i].uid);
        if (_pedido.success) {
          pedidos.push(_pedido.data);
        }
      }
      console.log(pedidos)
      return pedidos as PedidosModel[];
    }
    return [];
  }
  excluirPedidos() {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir os pedidos selecionados?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.pedidoList = this.pedidos;
        let x = 1;
        this.selPedidos.forEach(async (pedido) => {
          const i = this.findIndexById(pedido.uid ? pedido.uid : '0');
          if (i > -1) {
            this.pedidoList[i].ativo = false;
            this.pedidoList[i].excluido = true;
            this.spinnerAcao = "Excluindo registro " + x.toString() + " de " + this.selPedidos.length.toString();
            const result = await this.pedidosService.delete(pedido.uid ? pedido.uid : '0');
            if (!result.success) {
              this.pedidoList[i].ativo = true;
              this.pedidoList[i].excluido = false;
            }
          }
          setTimeout(() => {
            x += 1;
          }, 3000)
        });
        this.pedidos = this.pedidoList;
        this.mostraExcluidos = true;
        this.mostraPedidosExcluidos();
        this.selPedidos = [];
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Pedidos Excluídos",
          life: 3000
        })
      }
    })
  }
  excluirPedido(pedido: PedidosModel) {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir o Pedido " + pedido.num_pedido + "?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
      
          this.spinnerAcao = "Excluindo Registro ...";
          const result = await this.pedidosService.delete(pedido.uid ? pedido.uid : '0');
        
        if (result.success) {
              const result_ped = await this.pedidosService.getAll();
              this.pedidos =  result_ped.data as PedidosModel[];
              this.pedidoList = this.pedidos.filter(val => val.ativo && !val.excluido);
              this.mostraExcluidos = true;
              this.mostraPedidosExcluidos();
              this.messageService.add({
                severity: "success",
                summary: "Sucesso",
                detail: "Pedido Excluído",
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
    for (let i = 0; i < this.pedidoList.length; i++) {
        if (this.pedidoList[i].uid === id) {
            index = i;
            break;
        }
    }
    return index;
 }
 mostraPedidosExcluidos() {
  if (this.mostraExcluidos) {
    this.iconBtnEye = "pi pi-eye";
    this.toolTipBtnExcluidos = "Mostrar Pedidos Excluídos";
    this.mostraExcluidos = false;

    this.pedidoList = this.pedidoList.filter(val =>  val.ativo && !val.excluido);
    } else {
        this.mostraExcluidos = true;
        this.iconBtnEye = "pi pi-eye-slash";
        this.toolTipBtnExcluidos = "Ocultar Pedidos Excluídos";
        this.pedidoList = this.pedidos;
    }
 }
 async restauraPedido(pedidos: PedidosModel) {
  let pedido_result = await this.pedidosService.getById(pedidos.uid as string);
  let _pedidos = {...pedido_result.data};
  
  _pedidos.ativo = true;
  _pedidos.excluido = false;
  console.log(_pedidos)
  this.spinnerAcao = "Restaurando Registro..."
  const result = await this.pedidosService.post(_pedidos);
  console.log(result)
  if (result.success) {
        this.pedidos = [];
        this.pedidos = await this.retornaPedidos();
        this.pedidoList = this.pedidos.filter(val => val.ativo && !val.excluido);
        this.mostraExcluidos = true;
        this.mostraPedidosExcluidos();
    
  }
 }
}

