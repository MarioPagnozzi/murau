import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {ClienteService} from './../../services/cliente.service';
import { ICliente } from './../../interfaces/IClientes';
import {TranslateService} from "@ngx-translate/core";
import { MessageService } from "primeng/api";
import { Table } from "primeng/table"
import { BaseStatus } from 'src/app/enum/status';
import { VendedoresService } from 'src/app/services/vendedores.service';
import { IVendedores } from 'src/app/interfaces/IVendedores';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-clientes-pendentes',
  templateUrl: './clientes-pendentes.component.html',
  styleUrls: ['./clientes-pendentes.component.scss'],
  providers: [MessageService]
})

export class ClientesPendentesComponent implements OnInit {

  cli: ICliente[] = [];
  _clientes: ICliente[] = [];
  // tslint:disable-next-line: no-inferrable-types
  loading: boolean = true;
  activityValues: number[] = [0, 100];


  vendedores: IVendedores[] = [];
  status: any[] = [];
  
  constructor(
    private clienteService: ClienteService, 
    private translate: TranslateService, 
    private el: ElementRef,
    private vencedoresService: VendedoresService)
  {

  }
  async ngOnInit() {
    this.translate.setDefaultLang("pt-BR");

    const clientes = await this.clienteService.filtro("novos", Date.now);

    this.cli = clientes.data.map((it: ICliente) => {
      return {
        codigo: it.codigo,
        razao_social: it.razao_social,
        nome_fantasia: it.nome_fantasia,
        cnpj: it.cnpj,
        cep: it.cep,
        endereco: it.endereco,
        numero: it.numero,
        bairro: it.bairro,
        cidade: it.cidade,
        uf: it.uf,
        email: it.email,
        statusCliente: it.statusCliente,
        descStatus: BaseStatus[it.statusCliente ? it.statusCliente : 1],
        contatos: it.contatos,
        vendedor: {
          nome: it.vendedor ? it.vendedor.nome : "", 
          codigo: it.vendedor ? it.vendedor.codigo : "",
          endereco: "", 
          numero: "", 
          bairro: "", 
          cidade: "", 
          uf: "", 
          contatos: [{ddd: "", numero: "", operadoras: ""}],
          pedidos: [],
          empresas: [],
          uid: "",
          ativo: false,
          excluido: false,
          data_inclusao: new Date(),
          data_alteracao: new Date(),
        },
        empresa: it.empresa,
        pedidos: it.pedidos,
        uid: it.uid,
        ativo: it.ativo,
        excluido: it.excluido,
        data_inclusao: it.data_inclusao,
        data_alteracao: it.data_alteracao
      }
    })
    this.loading = false;
    const vend = await this.vencedoresService.getAll();
    this.vendedores = vend.data.map((it: IVendedores) => {
      return {
        nome: it.nome,
        codigo: it.codigo
      }
    })
  
    this.status = [
      { label: "Pendente", valueapplyfilterGlobal: "Pendente" },
      { label: "Aprovado", value: "Aprovado" }
    ];
  }
  
  @ViewChild("dt1") public dt1: any;
  applyFilterGlobal($event: Event, stringVal: any) {
     
     this.dt1.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }
}
