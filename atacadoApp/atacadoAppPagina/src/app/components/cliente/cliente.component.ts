import { Component, OnInit } from '@angular/core';
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

  //permissao
  alterar = false;
  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private active: ActivatedRoute,
    private viaCepService: ViaCepService,
    private matSnack: MatSnackBar
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
    const result = await this.clienteService.getById(uid);
    this.cliente = result.data as ClienteModel;
    this.contatos = this.cliente.contatos as ContatosModel[];
    this.pedidos = this.cliente.pedidos as PedidosModel[];
    this.cliente.pedidos = undefined;
    
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
        this.router.navigateByUrl(`/clientes`);
      })
    }

  }
  atribuirEmpresa() {
    this.empresaDialog = true;
    this.submitted = false;
    this.showDialog = true;
    this.headerDialog = "Atribuição de Empresa";
  }
  hideDialog() {
    this.showDialog = false;
    this.submitted = false;
      
  }
  atribuirVendedor() {
    this.vendedorDialog = true;
    this.submitted = false;
    this.showDialog = true;
    this.headerDialog = "Atribuição de Vendedor";
  } 
}
