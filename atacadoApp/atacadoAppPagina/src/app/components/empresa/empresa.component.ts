import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Operadoras } from 'src/app/enum/operadoras';
import { ClienteModel } from 'src/app/models/clienteModel';
import { EmpresasModel } from 'src/app/models/empresasModel';
import { PedidosModel } from 'src/app/models/pedidosModel';
import { VendedoresModel } from 'src/app/models/vendedoresModel';
import { ClienteService } from 'src/app/services/cliente.service';
import { EmpresasService } from 'src/app/services/empresas.service';
import { PedidosService } from 'src/app/services/pedidos.service';
import { VendedoresService } from 'src/app/services/vendedores.service';
import { ViaCepService } from 'src/app/services/via-cep.service';
import { Permissao } from 'src/app/shared/funcoesGlobal';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss']
})
export class EmpresaComponent implements OnInit {

  spinnerAcao: string = "Carregando...";
  empresa: EmpresasModel = new EmpresasModel();
  alterar: boolean = false;
  showDialog: boolean = false;
  submitted: boolean = false;
  vendedores: VendedoresModel[] = [];
  vendedor: VendedoresModel = new VendedoresModel();
  empresaVendedores: VendedoresModel[] = [];
  vendedoresFiltrados: VendedoresModel[] = [];
  pedidos: PedidosModel[] = [];
  valorTotalPedido: number = 0;
  @ViewChild("dt") public dt: any;
  @ViewChild("dtVend") public dtVend: any;

  constructor(private empresaService: EmpresasService,
              private viaCepService: ViaCepService,
              private router: Router,
              private matSnack: MatSnackBar,
              private vendedoresService: VendedoresService,
              private clienteService: ClienteService,
              private pedidosService: PedidosService,
              private active: ActivatedRoute) { }

  ngOnInit(): void {
    // tslint:disable-next-line: deprecation
    this.active.params.subscribe(p => this.getUid(p.cod));
    this.alterar = Permissao("empresas", "A")
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
    this.empresa.endereco = logradouro.toUpperCase();
    this.empresa.bairro = bairro.toUpperCase();
    this.empresa.cidade = localidade.toUpperCase();
    this.empresa.uf = uf.toUpperCase();
  }
  descOperadora(key: any) {
    return Operadoras[key].toUpperCase();
  }
  async salvarAlteracoes() {
    this.spinnerAcao = "Gravando...";
    this.empresa.razao_social = this.empresa.razao_social?.toUpperCase();
    this.empresa.nome_fantasia = this.empresa.nome_fantasia?.toUpperCase();
    this.empresa.endereco = this.empresa.endereco?.toUpperCase();
    this.empresa.bairro = this.empresa.bairro?.toUpperCase();
    this.empresa.complemento = this.empresa.complemento?.toUpperCase();
    this.empresa.cidade = this.empresa.cidade?.toUpperCase();
    this.empresa.uf = this.empresa.uf?.toUpperCase();
    const result = await this.empresaService.post(this.empresa as EmpresasModel);
    if (result.success) {
      const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, {duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok']});
      // tslint:disable-next-line: deprecation
      snack.afterDismissed().subscribe(() => {
        this.router.navigateByUrl(`/empresas`);
      })
    }

  }

  hideDialog() {
    this.showDialog = false;
    this.submitted = false;    
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
  salvarDialog() {
    this.submitted = true;
    this.empresaVendedores.push(this.vendedor);
    this.vendedor = new VendedoresModel();
  
  }
  async getUid(uid: string): Promise<void> {
    
    if (uid === "novo") {
      return;
    }
    this.spinnerAcao = "Carregando...";
 
    const result = await this.empresaService.getById(uid);
    this.empresa = result.data as EmpresasModel;
    const _pedidos = await this.pedidosService.filtro("empresa", uid);
   
    if (_pedidos.success) {
       this.pedidos = _pedidos.data as PedidosModel[];
       // tslint:disable-next-line: forin
       for (let i in this.pedidos) {
          const _cliente = await this.clienteService.filtro("pedidos", this.pedidos[i].num_pedido?.replace("/", "-"));
          this.valorTotalPedido = this.valorTotalPedido + this.pedidos[i].valor_pedido;
          if (_cliente.success) {
            let cliente = _cliente.data != null ? _cliente.data as ClienteModel : new ClienteModel();
            
            delete cliente.pedidos;
            this.pedidos[i].cliente = cliente;
            console.log(this.pedidos[i].cliente)
            
          }
       }
    }
    const _vendedores = await this.vendedoresService.filtro("empresa", uid);
    if (_vendedores.success) {
      this.vendedores = _vendedores.data as VendedoresModel[];
    }

  }
  
  applyFilterGlobal($event: Event, stringVal: any) {
      this.dt.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }

  applyFilterGlobalVend($event: Event, stringVal: any) {
    this.dtVend.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
}
}
