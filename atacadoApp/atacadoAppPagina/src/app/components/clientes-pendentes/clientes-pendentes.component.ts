import { Component, ElementRef, ViewChild } from '@angular/core';
import {Clientes, Vendedores} from './clientes_pendentes';
import {ClientesPendentesService} from './clientes_pendentes_service';
import {TranslateService} from "@ngx-translate/core";
import { MessageService } from "primeng/api";
import { Table } from "primeng/table"

@Component({
  selector: 'app-clientes-pendentes',
  templateUrl: './clientes-pendentes.component.html',
  styleUrls: ['./clientes-pendentes.component.scss'],
  providers: [MessageService]
})

export class ClientesPendentesComponent {

  customers: Clientes[] = [];

  representatives: Vendedores[] = [];

  statuses: any[] = [];

  // tslint:disable-next-line: no-inferrable-types
  loading: boolean = true;

  activityValues: number[] = [0, 100];

  
  constructor(private customerService: ClientesPendentesService, private translate: TranslateService, private el: ElementRef)
  {

  }
  ngOnInit() {


    this.translate.setDefaultLang("pt-BR");

    this.customerService.getClientesPendentes().then(customers => {

      this.customers = customers;
      this.loading = false;

      this.customers.forEach(
        customer => (customer.date = new Date(customer.date ? customer.date : Date.now()))
      );


    });
   
    this.representatives = [
      { name: "Amy Elsner", image: "amyelsner.png" },
      { name: "Anna Fali", image: "annafali.png" },
      { name: "Asiya Javayant", image: "asiyajavayant.png" },
      { name: "Bernardo Dominic", image: "bernardodominic.png" },
      { name: "Elwin Sharvill", image: "elwinsharvill.png" },
      { name: "Ioni Bowcher", image: "ionibowcher.png" },
      { name: "Ivan Magalhaes", image: "ivanmagalhaes.png" },
      { name: "Onyama Limba", image: "onyamalimba.png" },
      { name: "Stephen Shaw", image: "stephenshaw.png" },
      { name: "XuXue Feng", image: "xuxuefeng.png" }
    ];

    this.statuses = [
      { label: "Unqualified", valueapplyfilterGlobal: "unqualified" },
      { label: "Qualified", value: "qualified" },
      { label: "New", value: "new" },
      { label: "Negotiation", value: "negotiation" },
      { label: "Renewal", value: "renewal" },
      { label: "Proposal", value: "proposal" }
    ];
  }
  @ViewChild("dt1") public dt1: any;
  applyFilterGlobal($event: Event, stringVal: any) {
     
     this.dt1.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }
}
