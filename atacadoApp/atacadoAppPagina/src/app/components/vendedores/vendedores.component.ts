import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuarioModel } from 'src/app/models/usuarioModel';
import { VendedoresModel } from 'src/app/models/vendedoresModel';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { VendedoresService } from 'src/app/services/vendedores.service';
import { Permissao } from 'src/app/shared/funcoesGlobal';

@Component({
  selector: 'app-vendedores',
  templateUrl: './vendedores.component.html',
  styleUrls: ['./vendedores.component.scss']
})
export class VendedoresComponent implements OnInit {

  vendedores: VendedoresModel[] = [];
  spinnerAcao: string = "Carregando...";
  selVendedores: VendedoresModel[] = [];
  toolTipBtnExcluidos: string = "Mostrar Vendedores Excluídos";
  iconBtnEye: string = "pi pi-eye";
  vendedoresList: VendedoresModel[] = [];
  excluir: boolean = false;
  alterar: boolean = false;
  mostraExcluidos = false;

  @ViewChild("dt") public dt: ElementRef | any;
  constructor(private route: Router,
              private vendedoresService: VendedoresService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private usuarioService: UsuariosService) { }

  ngOnInit(): void {
    this.alterar = Permissao("vendedores", "A");
    this.excluir = Permissao("vendedores", "E");
    this.carregarVendedores();
  }
  excluirVendedores() {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir os vendedores selecionados?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        this.vendedoresList = this.vendedores;
        let x = 1;
        this.selVendedores.forEach(async (vendedor) => {
          const i = this.findIndexById(vendedor.uid ? vendedor.uid : '0');
          if (i > -1) {
            this.vendedoresList[i].ativo = false;
            this.vendedoresList[i].excluido = true;
            this.spinnerAcao = "Excluindo registro " + x.toString() + " de " + this.selVendedores.length.toString();
            await this.atualizaUsuario(this.vendedoresList[i] as VendedoresModel)
            const result = await this.vendedoresService.delete(vendedor.uid ? vendedor.uid : '0');
            if (!result.success) {
              this.vendedoresList[i].ativo = true;
              this.vendedoresList[i].excluido = false;
            }
          }
          setTimeout(() => {
            x += 1;
          }, 3000)
        });
        this.vendedores = this.vendedoresList;
        this.mostraExcluidos = true;
        this.mostraVendedoresExcluidos();
        this.selVendedores = [];
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Clientes Excluídos!",
          life: 3000
        })
      }
    })
  }
  mostraVendedoresExcluidos() {
    if (this.mostraExcluidos) {
      this.iconBtnEye = "pi pi-eye";
      this.toolTipBtnExcluidos = "Mostrar Vendedores Excluídos";
      this.mostraExcluidos = false;

      this.vendedoresList = this.vendedoresList.filter(val => val.ativo && !val.excluido);
  } else {
      this.mostraExcluidos = true;
      this.iconBtnEye = "pi pi-eye-slash";
      this.toolTipBtnExcluidos = "Ocultar Vendedores Excluídos";
      this.vendedoresList = this.vendedores;
  }
  }
  applyFilterGlobal($event: Event, stringVal: string) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
  async restauraVendedor(vendedor: VendedoresModel) {
    let _vendedor = {...vendedor};
    _vendedor.ativo = true;
    _vendedor.excluido = false;
    this.spinnerAcao = "Restaurando Registro..."
    const result = await this.vendedoresService.post(_vendedor);
    if (result.success) {
          this.vendedores = [];
          await this.atualizaUsuario(_vendedor)
          this.vendedores = await this.retornaVendedores();
          this.vendedoresList = this.vendedores.filter(val => val.ativo && !val.excluido);        
          this.mostraExcluidos = true;
          this.mostraVendedoresExcluidos();
      
    }
  }
  excluirVendedor(vendedor: VendedoresModel) {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir o vendedor " + vendedor.nome + "?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
       
          this.spinnerAcao = "Excluindo Registro ...";
          const result = await this.vendedoresService.delete(vendedor.uid ? vendedor.uid : '0');
        
         if (result.success) {
              await this.atualizaUsuario(vendedor);
              this.vendedores =  await this.retornaVendedores();
              this.vendedoresList = this.vendedores.filter(val => val.ativo && !val.excluido);
              this.mostraExcluidos = true;
              this.mostraVendedoresExcluidos();
              this.messageService.add({
                severity: "success",
                summary: "Sucesso",
                detail: "Vendedor Excluído!",
                life: 3000
            })
         }
      }
    })
  }
  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.vendedoresList.length; i++) {
        if (this.vendedoresList[i].uid === id) {
            index = i;
            break;
        }
    }
    return index;
  }
  async carregarVendedores() {
    const result = await this.vendedoresService.getAll();
    if (result.success) {
      this.vendedores = result.data as VendedoresModel[];
      this.vendedoresList = this.vendedores.filter(val => val.ativo && !val.excluido);
    }
  }
  async retornaVendedores(): Promise<VendedoresModel[]> {
    const result = await this.vendedoresService.getAll();
    if (result.success) {
      return result.data as VendedoresModel[];
    }
    return [];
  }
  async atualizaUsuario(vendedor: VendedoresModel) {    
    const _usuario = await this.usuarioService.filtro("vendedor", vendedor.uid);
    console.log(_usuario)
      if (_usuario.success) {
        if (_usuario.data) {
          let usuario = _usuario.data as UsuarioModel;
          usuario.ativo = vendedor.ativo;
          usuario.excluido = vendedor.excluido;
          usuario.vendedor = undefined;
          const res_usuario = await this.usuarioService.post(usuario);
        }
      }
  }
}
