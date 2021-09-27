import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ɵangular_packages_platform_browser_platform_browser_a } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { GrupoModel } from 'src/app/models/grupoModel';
import { PermissaoModel } from 'src/app/models/permissaoModel';
import { ClienteService } from 'src/app/services/cliente.service';
import { PermissaoService } from 'src/app/services/permissao.service';
import { IPermissoes, UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-panel-administrador',
  templateUrl: './panel-administrador.component.html',
  styleUrls: ['./panel-administrador.component.scss']
})
export class PanelAdministradorComponent implements OnInit, OnDestroy, AfterViewInit {

  isRoot = false;

  vUsuarios = false;
  iUsuario = false;

  vGrupos = false;
  iGrupos = false;

  vClientes = false;
  iCliente = false;
  aCliente = false;

  vVendedores = false;
  iVendedor = false;

  vProdutos = false;
  iProduto = false;

  vEmpresas = false;
  iEmpresa = false

  vPedidos = false;
  iPedido = false;

  vPromocoes = false;

  lblCadastros = true;
  lblVendas = true;
  lblFerramentas = true;

  subscript: Subscription = new Subscription();
  permissao: PermissaoModel[] = [];
  subscript_premissao: Subscription = new Subscription();
  qtdClientePendentes = 0;
  hiddenPendentes = true;
  constructor(private permissaoService: PermissaoService,
              private usuariosService: UsuariosService,
              private clienteService: ClienteService) { }

  
  ngOnDestroy() {
    this.subscript.unsubscribe();
  }
  async ngOnInit() {
    this.carregaPermissoes();
    let clientesPendentes = await this.clienteService.filtro("pendentes", false);
    this.qtdClientePendentes = clientesPendentes.data.length;
    this.hiddenPendentes = this.qtdClientePendentes === 0;
  }
ngAfterViewInit() {
  this.carregaPermissoes();
}
@HostListener("window:unload", ["$event"]) unloadHandler(event: Event) {
 this.carregaPermissoes();
}
carregaPermissoes() {

  this.subscript = this.usuariosService.isUserRoot.subscribe({
    next: (val) => {      
      this.isRoot = val;
    }
  })
  
  this.subscript_premissao = this.usuariosService.permissoesSubject.subscribe({
    next: (perm) => {


    this.permissao = perm;
      let perm_usuario = this.hasPermissoes("usuarios");
      this.vUsuarios = perm_usuario.visualizar;
      this.iUsuario = perm_usuario.inserir;

      let perm_grupos = this.hasPermissoes("grupos");
      this.vGrupos = perm_grupos.visualizar;
      this.iGrupos = perm_grupos.inserir;

      let perm_clientes = this.hasPermissoes("clientes");
      this.vClientes = perm_clientes.visualizar;
      this.iCliente = perm_clientes.inserir;
      this.aCliente = perm_clientes.alterar;

      let perm_vendedores = this.hasPermissoes("vendedores");
      this.vVendedores = perm_vendedores.visualizar;
      this.iVendedor = perm_vendedores.inserir;

      let perm_empresas = this.hasPermissoes("empresas");
      this.vEmpresas = perm_empresas.visualizar;
      this.iEmpresa = perm_empresas.inserir;

      let perm_produtos = this.hasPermissoes('produtos');
      this.vProdutos = perm_produtos.visualizar;
      this.iProduto = perm_produtos.inserir;

      let perm_pedidos = this.hasPermissoes("pedidos");
      this.vPedidos = perm_pedidos.visualizar;
      this.iPedido = perm_pedidos.inserir;

      let perm_promocoes = this.hasPermissoes("promocao");
      this.vPromocoes = perm_promocoes.visualizar;

      let cadastro = !this.vClientes ? !this.vEmpresas ? !this.vGrupos ? !this.vProdutos ? 
                !this.vUsuarios ? !this.vVendedores ? !this.iCliente ? !this.iEmpresa ? 
                !this.iGrupos ? !this.iProduto ? !this.iUsuario ? !this.iVendedor ? false : true : true : true : true : true : true : true : true : true : true : true : true;

      let vendas = !this.vPedidos ? !this.vPromocoes ? !this.iPedido ? !this.aCliente ? false : true : true : true : true;
      let ferramenta = this.isRoot;

      this.lblCadastros = cadastro;
      this.lblFerramentas = ferramenta;
      this.lblVendas = vendas;
    }
  })
  if (this.permissao.length <= 0) {
    let grupos = JSON.parse(localStorage.getItem("murau:grupo") as string) as GrupoModel[];
    console.log(grupos);
    this.usuariosService.recarregaPermissoes(grupos);
  }
  let perm_usuario = this.hasPermissoes("usuarios");
  this.vUsuarios = perm_usuario.visualizar;
  this.iUsuario = perm_usuario.inserir;

  let perm_grupos = this.hasPermissoes("grupos");
  this.vGrupos = perm_grupos.visualizar;
  this.iGrupos = perm_grupos.inserir;

  let perm_clientes = this.hasPermissoes("clientes");
  this.vClientes = perm_clientes.visualizar;
  this.iCliente = perm_clientes.inserir;
  this.aCliente = perm_clientes.alterar;

  let perm_vendedores = this.hasPermissoes("vendedores");
  this.vVendedores = perm_vendedores.visualizar;
  this.iVendedor = perm_vendedores.inserir;
  
  let perm_empresas = this.hasPermissoes("empresas");
  this.vEmpresas = perm_empresas.visualizar;
  this.iEmpresa = perm_empresas.inserir;

  let perm_produtos = this.hasPermissoes('produtos');
  this.vProdutos = perm_produtos.visualizar;
  this.iProduto = perm_produtos.inserir;

  let perm_pedidos = this.hasPermissoes("pedidos");
  this.vPedidos = perm_pedidos.visualizar;
  this.iPedido = perm_pedidos.inserir;

  let perm_promocoes = this.hasPermissoes("promocao");
  this.vPromocoes = perm_promocoes.visualizar;

  let cadastro = !this.vClientes ? !this.vEmpresas ? !this.vGrupos ? !this.vProdutos ? 
                !this.vUsuarios ? !this.vVendedores ? !this.iCliente ? !this.iEmpresa ? 
                !this.iGrupos ? !this.iProduto ? !this.iUsuario ? !this.iVendedor ? false : true : true : true : true : true : true : true : true : true : true : true : true;

 let vendas = !this.vPedidos ? !this.vPromocoes ? !this.iPedido ? !this.aCliente ? false : true : true : true : true;
 let ferramenta = this.isRoot;

 this.lblCadastros = cadastro;
 this.lblFerramentas = ferramenta;
 this.lblVendas = vendas;
}
hasPermissoes(tabela: string): IPermissoes {

  let visualizar = false;
  let excluir = false;
  let alterar = false;
  let inserir = false;

 let return_perm = this.permissao.filter((perm) => perm.tabela?.toString() === tabela && (perm.visualizar as boolean) === true);
  if (return_perm.length > 0) {
   visualizar = return_perm[0].visualizar as boolean;
   return_perm = []
  }

  return_perm = this.permissao.filter((perm) => perm.tabela?.toString() === tabela && (perm.excluir as boolean) === true);
  if (return_perm.length > 0) {
   excluir = return_perm[0].excluir as boolean;
   return_perm = []
  }

  return_perm = this.permissao.filter((perm) => perm.tabela?.toString() === tabela && (perm.alterar as boolean) === true);
  if (return_perm.length > 0) {
   alterar = return_perm[0].alterar as boolean;
   return_perm = []
  }

  return_perm = this.permissao.filter((perm) => perm.tabela?.toString() === tabela && (perm.inserir as boolean) === true);
  if (return_perm.length > 0) {
   inserir = return_perm[0].inserir as boolean;
   return_perm = []
  }

   const permissao: IPermissoes = {
     tabela: tabela,
     visualizar: visualizar,
     excluir: excluir,
     alterar: alterar,
     inserir: inserir
   }
   return permissao;
}
}


