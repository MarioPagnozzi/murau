import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Operadoras } from 'src/app/enum/operadoras';
import { BaseStatus } from 'src/app/enum/status';
import { ClienteModel } from 'src/app/models/clienteModel';
import { ContatosModel } from 'src/app/models/contatosModel';
import { PedidosModel } from 'src/app/models/pedidosModel';
import { ClienteService } from 'src/app/services/cliente.service';
import { ViaCepService } from 'src/app/services/via-cep.service';

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
  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private active: ActivatedRoute,
    private viaCepService: ViaCepService
  ) { }

  ngOnInit(): void {
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
  }
  async getUid(uid: string): Promise<void> {
    if (uid === "new") {
      return;
    }
    const result = await this.clienteService.getById(uid);
    this.cliente = result.data as ClienteModel;
    this.contatos = this.cliente.contatos as ContatosModel[];
    this.pedidos = this.cliente.pedidos as PedidosModel[];
    
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
    console.log(dataCep);
    this.cliente.endereco = logradouro.toUpperCase();
    this.cliente.bairro = bairro.toUpperCase();
    this.cliente.cidade = localidade.toUpperCase();
    this.cliente.uf = uf.toUpperCase();
  }
  descOperadora(key: any) {
    return Operadoras[key].toUpperCase();
  }
}
