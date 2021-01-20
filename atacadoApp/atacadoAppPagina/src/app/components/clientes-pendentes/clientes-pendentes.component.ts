import { Component } from '@angular/core';
import {Clientes, Vendedores} from './clientes_pendentes';
import {ClientesPendentesService} from './clientes_pendentes_service';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-clientes-pendentes',
  templateUrl: './clientes-pendentes.component.html',
  styleUrls: ['./clientes-pendentes.component.scss']
})

export class ClientesPendentesComponent {

  customers: Clientes[] = [];

  representatives: Vendedores[] = [];

  statuses: any[] = [];

  // tslint:disable-next-line: no-inferrable-types
  loading: boolean = true;

  activityValues: number[] = [0, 100];



  constructor(private customerService: ClientesPendentesService, private translate: TranslateService)
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
}
