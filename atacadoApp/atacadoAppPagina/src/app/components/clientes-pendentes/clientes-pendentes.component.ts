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
import { Router } from '@angular/router';
import { ClienteModel } from 'src/app/models/clienteModel';

@Component({
  selector: 'app-clientes-pendentes',
  templateUrl: './clientes-pendentes.component.html',
  styleUrls: ['./clientes-pendentes.component.scss'],
  providers: [MessageService]
})

export class ClientesPendentesComponent implements OnInit {

  cli: ClienteModel[] = [];
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
    private vendedoresService: VendedoresService,
    private router: Router)
  {

  }
  async ngOnInit() {
    this.translate.setDefaultLang("pt-BR");

    const clientes = await this.clienteService.filtro("pendentes", "false");

    this.cli = clientes.data as ClienteModel[];
    this.loading = false;
    const vend = await this.vendedoresService.getAll();
    this.vendedores = vend.data as IVendedores[]
  
    this.status = [
      { label: "Pendente", valueapplyfilterGlobal: "Pendente" },
      { label: "Aprovado", value: "Aprovado" }
    ];
  }
  
  @ViewChild("dt1") public dt1: any;
  applyFilterGlobal($event: Event, stringVal: any) {
     
     this.dt1.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }
  show(str: string) {
    console.log(str)
  }
}
