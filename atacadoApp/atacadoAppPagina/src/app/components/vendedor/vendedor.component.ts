import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Operadoras } from 'src/app/enum/operadoras';
import { ClienteModel } from 'src/app/models/clienteModel';
import { ContatosModel } from 'src/app/models/contatosModel';
import { ContatosVendedoresModel } from 'src/app/models/contatosVendedoresModel';
import { EmpresasModel } from 'src/app/models/empresasModel';
import { GrupoModel } from 'src/app/models/grupoModel';
import { PedidosModel } from 'src/app/models/pedidosModel';
import { UsuarioModel } from 'src/app/models/usuarioModel';
import { VendedoresModel } from 'src/app/models/vendedoresModel';
import { ClienteService } from 'src/app/services/cliente.service';
import { EmpresasService } from 'src/app/services/empresas.service';
import { GruposService } from 'src/app/services/grupos.service';
import { PedidosService } from 'src/app/services/pedidos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { VendedoresService } from 'src/app/services/vendedores.service';
import { ViaCepService } from 'src/app/services/via-cep.service';
import { Permissao } from 'src/app/shared/funcoesGlobal';
import { IOperadora } from '../create-cliente/create-cliente.component';
import { FileManage } from '../input-file/input-file.component';

@Component({
  selector: 'app-vendedor',
  templateUrl: './vendedor.component.html',
  styleUrls: ['./vendedor.component.scss']
})
export class VendedorComponent implements OnInit {

  spinnerAcao: string = "Carregando...";
  alterar: boolean = false;
  vendedor: VendedoresModel = new VendedoresModel();
  operadoras: IOperadora[] = [];
  pedidos: PedidosModel[] = [];
  empresas: EmpresasModel[] = [];
  empresa: EmpresasModel = new EmpresasModel();
  contatos: ContatosModel[] = [];
  usuario: UsuarioModel = new UsuarioModel();
  clientes: ClienteModel[] = [];
  cliente: ClienteModel = new ClienteModel();
  showDialog: boolean = false;
  empresasFiltradas: EmpresasModel[] = [];

  submitted: boolean = false;
  constructor(private viaCepService: ViaCepService,
    private vendedorService: VendedoresService,
    private usuarioService: UsuariosService,
    private pedidosService: PedidosService,
    private empresaService: EmpresasService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private route: Router,
    private active: ActivatedRoute,
    private gruposService: GruposService,
    private matSnack: MatSnackBar,
    private clientesService: ClienteService) { }

  ngOnInit(): void {
    // tslint:disable-next-line: deprecation
    this.active.params.subscribe(p => this.getUid(p.cod));

    this.operadoras = [
      { valor: 0, label: "Operadora" },
      { valor: Operadoras.Tim, label: Operadoras[Operadoras.Tim].toUpperCase() },
      { valor: Operadoras.Claro, label: Operadoras[Operadoras.Claro].toUpperCase() },
      { valor: Operadoras.CTBC, label: Operadoras[Operadoras.CTBC].toUpperCase() },
      { valor: Operadoras.Nextel, label: Operadoras[Operadoras.Nextel].toUpperCase() },
      { valor: Operadoras.Oi, label: Operadoras[Operadoras.Oi].toUpperCase() },
      { valor: Operadoras.Sercomtel, label: Operadoras[Operadoras.Sercomtel].toUpperCase() },
      { valor: Operadoras.Vivo, label: Operadoras[Operadoras.Vivo].toUpperCase() }
    ];
    this.alterar = Permissao("vendedores", "A");

  }
  async getUid(uid: string): Promise<void> {
    if (uid === "novo") {
      return;
    }
    const result = await this.vendedorService.getById(uid);
    if (result.success) {
      this.vendedor = result.data as VendedoresModel;

      const _usuario = await this.usuarioService.filtro("vendedor", uid);
      console.log(_usuario)
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
        this.usuario.cliente = undefined;
    
      }

      this.empresas = this.vendedor.empresas as EmpresasModel[];

      let _cliente: any;
      let _oldPedidos: PedidosModel[] = [];
      const pedidos = await this.pedidosService.filtro("vendedor", uid);
      if (pedidos.success) {
        // tslint:disable-next-line: forin
        for (let i in pedidos.data) {
          _cliente = await this.clientesService.filtro("pedidos", pedidos.data[i].num_pedido?.replace('/', '-'));
          if (_cliente.success) {
            if (_cliente.data === null) {
              _oldPedidos.push(pedidos.data[i]);
            } else {
              let pedido = new PedidosModel();
              pedido = pedidos.data[i] as PedidosModel;
              pedido.cliente = _cliente.data as ClienteModel;
              this.pedidos.push(pedido);

            }
          }
        }
      }


      this.pedidos = this.pedidos.filter(val => !_oldPedidos.includes(val)) as PedidosModel[];
      const clientes = await this.clientesService.filtro("vendedor", uid);
      this.clientes = clientes.data as ClienteModel[];
      this.contatos = this.vendedor.contatos as ContatosVendedoresModel[];
    }
  }
  async salvarAlteracoes() {
    this.spinnerAcao = "Gravando...";
    this.vendedor.contatos = this.contatos;
    this.vendedor.nome = this.vendedor.nome?.toUpperCase();
    this.vendedor.endereco = this.vendedor.endereco?.toUpperCase();
    this.vendedor.bairro = this.vendedor.bairro?.toUpperCase();
    this.vendedor.complemento = this.vendedor.complemento?.toUpperCase();
    this.vendedor.cidade = this.vendedor.cidade?.toUpperCase();
    this.vendedor.uf = this.vendedor.uf?.toUpperCase();
    this.vendedor.email = this.vendedor.email?.toLowerCase();
    const result = await this.vendedorService.post(this.vendedor as VendedoresModel);
    if (result.success) {
      const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, { duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok'] });
      // tslint:disable-next-line: deprecation
      snack.afterDismissed().subscribe(() => {
        if (this.usuario.uid) {
          this.salvarUsuario(false);
        }
        this.route.navigateByUrl(`/vendedores`);
      })
    }
  }
  upperCase($event: Event) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toUpperCase();
  }
  lowerCase($event: Event) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toLowerCase();
  }
  async retornaCep($event: Event) {
    const cep = ($event.target as HTMLInputElement).value;
    const dataCep = await this.viaCepService.buscaCep(cep);
    const { logradouro, bairro, localidade, uf } = JSON.parse(JSON.stringify(dataCep));
    this.vendedor.endereco = logradouro.toUpperCase();
    this.vendedor.bairro = bairro.toUpperCase();
    this.vendedor.cidade = localidade.toUpperCase();
    this.vendedor.uf = uf.toUpperCase();
  }
  descOperadora(key: any) {
    return Operadoras[key].toUpperCase();
  }
  addNewContato() {
    const newContato = new ContatosVendedoresModel();
    newContato.operadoras = 0;
    this.contatos.push(newContato);
  }
  async removeContato(contato: ContatosVendedoresModel) {
    const index = this.contatos.indexOf(contato);
    this.contatos.splice(index, 1);
    if (contato.uid) {
      const _contatos = await this.vendedorService.delete(`${this.vendedor.uid}/contato/${contato.uid}`);
      // tslint:disable-next-line: deprecation
      this.active.params.subscribe(p => this.getUid(p.cod));
    }
  }
  selectedFile(file: FileManage): void {
    if (file.base64Data) {
      this.usuario.foto = file.base64Data;
    }
  }

  async salvarUsuario(snack: boolean = true) {
    
    this.usuario.vendedor = this.vendedor;
    this.usuario.nome = this.usuario.nome.toUpperCase();
    this.usuario.email = this.usuario.email.toLowerCase();
    this.usuario.ativo = this.vendedor.ativo;
    const result = await this.usuarioService.post(this.usuario as UsuarioModel);
    if (result.success && snack) {
      const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, { duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok'] });
      // tslint:disable-next-line: deprecation
      snack.afterDismissed().subscribe(() => {

      })
    }
  }

  hideDialog() {
    this.submitted = false;
    this.showDialog = true;
  }
  async atribuirEmpresa() {
    if (this.empresa) {
      this.empresa = new EmpresasModel();
    }
    this.submitted = false;
    this.showDialog = true;
    this.empresas = this.vendedor.empresas as EmpresasModel[];
  }
  salvarDialog() {
    this.submitted = true;

    this.vendedor.empresas?.push(this.empresa);
    this.empresa = new EmpresasModel();

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
    const empresas: EmpresasModel[] = this.vendedor.empresas ? this.vendedor.empresas : [];
    this.empresasFiltradas = filtros.filter(val => !this.empresas.includes(val));
  }
  
}
