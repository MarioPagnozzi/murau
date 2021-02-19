import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteModel } from 'src/app/models/clienteModel';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit {

  ativo = false;
  cliente: ClienteModel = new ClienteModel();
  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private active: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.active.params.subscribe(p => this.getUid(p.cod));

  }
  async getUid(uid: string): Promise<void> {
    if (uid === "new") {
      return;
    }
    const result = await this.clienteService.getById(uid);
    this.cliente = result.data as ClienteModel;
    
  }
  upperCase($event: Event) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toUpperCase();
  }
  lowerCase($event: Event ) {
    ($event.target as HTMLInputElement).value = ($event.target as HTMLInputElement).value.toLowerCase();
  }
}
