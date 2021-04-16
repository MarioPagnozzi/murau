import { UsuariosService } from './../../services/usuarios.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Operadoras } from 'src/app/enum/operadoras';
import { BaseStatus } from 'src/app/enum/status';
import { ClienteModel } from 'src/app/models/clienteModel';
import { ContatosModel } from 'src/app/models/contatosModel';
import { PedidosModel } from 'src/app/models/pedidosModel';
import { ClienteService } from 'src/app/services/cliente.service';
import { ViaCepService } from 'src/app/services/via-cep.service';
import { Permissao } from 'src/app/shared/funcoesGlobal';

import { IOperadora } from '../create-cliente/create-cliente.component';
import { VendedoresModel } from 'src/app/models/vendedoresModel';
import { EmpresasModel } from 'src/app/models/empresasModel';
import { VendedoresService } from 'src/app/services/vendedores.service';
import { EmpresasService } from 'src/app/services/empresas.service';
import { UsuarioModel } from 'src/app/models/usuarioModel';
import { FileManage } from '../input-file/input-file.component';
import { GruposService } from 'src/app/services/grupos.service';
import { GrupoModel } from 'src/app/models/grupoModel';

export interface IStatus {
  valor: number
  label: string
}
@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit {

  ativo = false;
  cliente: ClienteModel = new ClienteModel();
  status: IStatus[] = [];
  contatos: ContatosModel[] = [];
  operadoras: IOperadora[] = [];
  pedidos: PedidosModel[] = [];
  empresaDialog = false;
  vendedorDialog = false;
  headerDialog = "";
  showDialog = false;
  submitted = false;
  spinnerAcao = "";
  vendedores: VendedoresModel[] = [];
  empresas: EmpresasModel[] = [];
  vendedoresFiltrados: VendedoresModel[] = [];
  empresasFiltradas: EmpresasModel[] = [];
  vendedor: VendedoresModel = new VendedoresModel();
  empresa: EmpresasModel = new EmpresasModel();
  usuario: UsuarioModel = new UsuarioModel();
  //permissao
  alterar = false;
  fazerPedido = false;
  aprovado = false;
  clienteAtivo = false;
  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private active: ActivatedRoute,
    private viaCepService: ViaCepService,
    private matSnack: MatSnackBar,
    private vendedorService: VendedoresService,
    private empresaService: EmpresasService,
    private usuarioService: UsuariosService,
    private gruposService: GruposService
  ) { }

  ngOnInit(): void {
    // tslint:disable-next-line: deprecation
    this.active.params.subscribe(p => this.getUid(p.cod));
    this.status = [
      {valor: BaseStatus.Aprovado, label: BaseStatus[BaseStatus.Aprovado].toUpperCase()},
      {valor: BaseStatus.Pendente, label: BaseStatus[BaseStatus.Pendente].toUpperCase()}
    ];
    this.operadoras = [
      {valor: 0, label: "Operadora"},
      {valor: Operadoras.Tim, label: Operadoras[Operadoras.Tim].toUpperCase()},
      {valor: Operadoras.Claro, label: Operadoras[Operadoras.Claro].toUpperCase()},
      {valor: Operadoras.CTBC, label: Operadoras[Operadoras.CTBC].toUpperCase()},
      {valor: Operadoras.Nextel, label: Operadoras[Operadoras.Nextel].toUpperCase()},
      {valor: Operadoras.Oi, label: Operadoras[Operadoras.Oi].toUpperCase()},
      {valor: Operadoras.Sercomtel, label: Operadoras[Operadoras.Sercomtel].toUpperCase()},
      {valor: Operadoras.Vivo, label: Operadoras[Operadoras.Vivo].toUpperCase()}
    ];
    this.alterar = Permissao("clientes", "A");
  }
  async getUid(uid: string): Promise<void> {
    
    if (uid === "novo") {
      return;
    }
    this.spinnerAcao = "Carregando...";
 
    const result = await this.clienteService.getById(uid);
    this.cliente = result.data as ClienteModel;
    this.contatos = this.cliente.contatos as ContatosModel[];
    this.pedidos = this.cliente.pedidos as PedidosModel[];
    this.cliente.pedidos = [];
    this.fazerPedido = Permissao('pedidos', 'I');
    this.aprovado = this.cliente.statusCliente === 2;
    this.clienteAtivo = this.cliente.ativo ? this.cliente.ativo : false;
    const _usuario = await this.usuarioService.filtro("cliente", uid);
      if (_usuario.success) {
        if (_usuario.data) {
          this.usuario = _usuario.data;
        } else {
          this.usuario = new UsuarioModel();
          const grupos = await this.gruposService.getAll();
          let _grupos = grupos.data as GrupoModel[];
          let grupo = _grupos.filter(val => val.nome_grupo = "Clientes")[0] as GrupoModel;
          this.usuario.grupos.push(grupo);
        }
        
        this.usuario.vendedor = undefined;
      }
    
  }
  addNewContato() {
    const newContato = new ContatosModel();
    newContato.operadoras = 0;
    this.contatos.push(newContato);
  }
  async removeContato(contato: ContatosModel) {
    const index = this.contatos.indexOf(contato);
    this.contatos.splice(index, 1);
    if (contato.uid) {
      const _contatos = await this.clienteService.delete(`${this.cliente.uid}/contato/${contato.uid}`);
      // tslint:disable-next-line: deprecation
      this.active.params.subscribe(p => this.getUid(p.cod));
    }
  }
  upperCase($event: Event) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toUpperCase();
  }
  lowerCase($event: Event ) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toLowerCase();
  }
  async retornaCep($event: Event) {
    const cep = ($event.target as HTMLInputElement).value;
    const dataCep = await this.viaCepService.buscaCep(cep);
    const {logradouro, bairro, localidade, uf} = JSON.parse(JSON.stringify(dataCep));  
    this.cliente.endereco = logradouro.toUpperCase();
    this.cliente.bairro = bairro.toUpperCase();
    this.cliente.cidade = localidade.toUpperCase();
    this.cliente.uf = uf.toUpperCase();
  }
  descOperadora(key: any) {
    return Operadoras[key].toUpperCase();
  }
  async salvarAlteracoes() {
    this.spinnerAcao = "Gravando...";
    this.cliente.contatos = this.contatos;
    this.cliente.razao_social = this.cliente.razao_social?.toUpperCase();
    this.cliente.nome_fantasia = this.cliente.nome_fantasia?.toUpperCase();
    this.cliente.endereco = this.cliente.endereco?.toUpperCase();
    this.cliente.bairro = this.cliente.bairro?.toUpperCase();
    this.cliente.complemento = this.cliente.complemento?.toUpperCase();
    this.cliente.cidade = this.cliente.cidade?.toUpperCase();
    this.cliente.uf = this.cliente.uf?.toUpperCase();
    this.cliente.email = this.cliente.email?.toLowerCase(); 
    const result = await this.clienteService.post(this.cliente as ClienteModel);
    if (result.success) {
      const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, {duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok']});
      // tslint:disable-next-line: deprecation
      snack.afterDismissed().subscribe(() => {
        if (this.usuario.uid) {
           this.salvarUsuario(false);
        }
        this.router.navigateByUrl(`/clientes`);
      })
    }

  }
  async atribuirEmpresa() {
    if (this.empresa) {
      this.empresa = new EmpresasModel();
    }
    this.empresaDialog = true;
    this.submitted = false;
    this.showDialog = true;
    this.headerDialog = "Atribuição de Empresa";
    this.empresas = this.cliente.vendedor?.empresas as EmpresasModel[];  
  }
  hideDialog() {
    this.showDialog = false;
    this.submitted = false;
    this.vendedorDialog = false;
    this.empresaDialog = false;
  }
  filtraVendedor(event: any) {
    let filtros: VendedoresModel[] = [];
    let query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.vendedores.length; i++) {
      let vendedor = this.vendedores[i];
      if (vendedor.nome?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtros.push(vendedor);
      }
    }
    this.vendedoresFiltrados = filtros;
  }
  filtraEmpresa(event: any) {
    let filtros: EmpresasModel[] = [];
    let query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.empresas.length; i++) {
      let empresa = this.empresas[i];
      if (empresa.nome_fantasia?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtros.push(empresa);
      }
    }
    this.empresasFiltradas = filtros;
  }
  async atribuirVendedor() {
    if (this.vendedor) {
      this.vendedor = new VendedoresModel();
    }
    this.vendedorDialog = true;
    this.submitted = false;
    this.showDialog = true;
    this.headerDialog = "Atribuição de Vendedor";
    const vend = await this.vendedorService.getAll();
    this.vendedores = vend.data as VendedoresModel[];
    let vendedoresCliente: VendedoresModel[] = [];

    if (this.cliente.empresa) {
      // tslint:disable-next-line: forin
      for (let v in this.vendedores) {
        this.vendedores[v].empresas?.forEach((empresa) => {
          if (empresa.nome_fantasia === this.cliente.empresa?.nome_fantasia) {
            vendedoresCliente.push(this.vendedores[v]);
          }
        })
      }
      this.vendedores = this.vendedores.filter(val => vendedoresCliente.includes(val));
    }
  }
  salvarDialog() {
    this.submitted = true;
    if (this.vendedorDialog) {
      this.cliente.vendedor = this.vendedor;
      this.vendedor = new VendedoresModel();
    } else {
      this.cliente.empresa = this.empresa;
      this.empresa = new EmpresasModel();
    }
  }
  selectedFile(file: FileManage): void {
    if (file.base64Data) {
      this.usuario.foto = file.base64Data;
    }
  }

  async salvarUsuario(snack: boolean = true) {
    this.usuario.cliente = this.cliente;
    this.usuario.nome = this.usuario.nome.toUpperCase();
    this.usuario.email = this.usuario.email.toLowerCase();
    this.usuario.ativo = this.cliente.ativo;
    this.usuario.vendedor = undefined;
    const result = await this.usuarioService.post(this.usuario as UsuarioModel);
    if (result.success && snack) {
      const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, {duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok']});
      // tslint:disable-next-line: deprecation
      snack.afterDismissed().subscribe(() => {
        
      })
    }
  }
 
}
