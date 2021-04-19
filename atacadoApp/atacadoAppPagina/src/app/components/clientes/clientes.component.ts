import { ClienteService } from 'src/app/services/cliente.service';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ClienteModel } from 'src/app/models/clienteModel';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { UsuarioModel } from 'src/app/models/usuarioModel';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {

  clientes: ClienteModel[] = [];
  clienteList: ClienteModel[] = [];
  selClientes: ClienteModel[] = [];
  spinnerAcao = "";
  toolTipBtnExcluidos = "Mostrar Itens Excluídos";
  iconBtnEye = "pi pi-eye";

  mostraExcluidos = false;
  constructor(private route: Router,
              private clienteService: ClienteService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private usuarioService: UsuariosService) { }

  ngOnInit(): void {
    this.carregarClientes();
  }
 async carregarClientes() {
  this.spinnerAcao = "Carregando Clientes...";
  const result = await this.clienteService.getAll();
  this.clientes = result.data as ClienteModel[];
  this.clienteList = this.clientes.filter(val => val.statusCliente !== 1 && !val.excluido);
 }
 excluirClientes() {
 
    this.confirmationService.confirm({
      message: "Deseja realmente excluir os clientes selecionados ?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.clienteList = this.clientes;
        let x = 1;
        this.selClientes.forEach(async (cliente) => {
          const i = this.findIndexById(cliente.uid ? cliente.uid : '0');
          if (i > -1) {
            this.clienteList[i].ativo = false;
            this.clienteList[i].excluido = true;
            this.spinnerAcao = "Excluindo registro " + x.toString() + " de " + this.selClientes.length.toString();
            
            await this.atualizaUsuario(this.clienteList[i] as ClienteModel);
            const result = await this.clienteService.delete(cliente.uid ? cliente.uid : '0');
            if (!result.success) {
              this.clienteList[i].ativo = true;
              this.clienteList[i].excluido = false;
            } else {
              
            }
          }
          setTimeout(() => {
            x += 1;
          }, 3000)
        });
        this.clientes = this.clienteList;
        this.mostraExcluidos = true;
        this.mostraClientesExcluidos();
        this.selClientes = [];
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Cliente Excluído",
          life: 3000
        })
      }
    })
 }
 mostraClientesExcluidos() {
  if (this.mostraExcluidos) {
      this.iconBtnEye = "pi pi-eye";
      this.toolTipBtnExcluidos = "Mostrar Clientes Excluídos";
      this.mostraExcluidos = false;

      this.clienteList = this.clienteList.filter(val => val.statusCliente !== 1 && !val.excluido);
  } else {
      this.mostraExcluidos = true;
      this.iconBtnEye = "pi pi-eye-slash";
      this.toolTipBtnExcluidos = "Ocultar Clientes Excluídos";
      this.clienteList = this.clientes.filter(val => val.statusCliente !== 1);
  }
 }
 @ViewChild("dt") public dt: any;
 applyFilterGlobal($event: Event, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
 }
 excluirCliente(cliente: ClienteModel) {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir o cliente " + cliente.nome_fantasia + "?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
       
          this.spinnerAcao = "Excluindo Registro ...";
          const result = await this.clienteService.delete(cliente.uid ? cliente.uid : '0');
        
         if (result.success) {
              const _cli = await this.clienteService.getById(cliente.uid ? cliente.uid : '0');
              if (_cli.success) {
                if (_cli.data) {
                  await this.atualizaUsuario(_cli.data as ClienteModel);
                }
              }
              
              const result_cli = await this.clienteService.getAll();
              this.clientes =  result_cli.data as ClienteModel[];
              this.clienteList = this.clientes.filter(val => val.statusCliente !== 1 && !val.excluido);
              this.mostraExcluidos = true;
              this.mostraClientesExcluidos();
              this.messageService.add({
                severity: "success",
                summary: "Sucesso",
                detail: "Cliente Excluído",
                life: 3000
            })
         }
      }
    })
 }
 async restauraCliente(cliente: ClienteModel) {
      let _cliente = {...cliente};
      _cliente.ativo = true;
      _cliente.excluido = false;
      this.spinnerAcao = "Restaurando Registro..."
      const result = await this.clienteService.post(_cliente);
      if (result.success) {
            this.clientes = [];
            this.clientes = await this.retornaClientes();
            this.clienteList = this.clientes.filter(val => val.statusCliente !== 1 && !val.excluido);        
            this.mostraExcluidos = true;
            await this.atualizaUsuario(_cliente);
            this.mostraClientesExcluidos();
        
      }
 
 }
 async retornaClientes(): Promise<ClienteModel[]> {
    const result = await this.clienteService.getAll();
    if (result.success) {
      return result.data as ClienteModel[];
    }
    return [];
 }
 findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.clienteList.length; i++) {
        if (this.clienteList[i].uid === id) {
            index = i;
            break;
        }
    }
    return index;
  }
  async atualizaUsuario(cliente: ClienteModel) {    
    const _usuario = await this.usuarioService.filtro("cliente", cliente.uid);
    console.log(_usuario)
      if (_usuario.success) {
        if (_usuario.data) {
          let usuario = _usuario.data as UsuarioModel;
          usuario.ativo = cliente.ativo;
          usuario.excluido = cliente.excluido;
          usuario.vendedor = undefined;
          const res_usuario = await this.usuarioService.post(usuario);
        }
      }
  }
}
