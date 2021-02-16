import { ContatosModel } from './../../models/contatosModel';
import { Component, Injectable, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { ClienteModel } from 'src/app/models/clienteModel';
import { ViaCepService } from 'src/app/services/via-cep.service';
import { ICEP } from 'src/app/interfaces/ICEP';
import { BehaviorSubject } from 'rxjs';
import { Operadoras } from 'src/app/enum/operadoras';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-create-cliente',
  templateUrl: './create-cliente.component.html',
  styleUrls: ['./create-cliente.component.scss']
})
export class CreateClienteComponent implements OnInit {
    
  cliente: ClienteModel = new ClienteModel();
  contatos: ContatosModel[] = [];
  operadoras: {} = [];
  constructor(
    private clienteService: ClienteService,
    private viaCepService: ViaCepService,
    private matSnack: MatSnackBar,
    private router: Router) { }

  async ngOnInit() {
    this.operadoras = [
      {valor: 41, label: "Tim" },
      {valor: 21, label: "Claro"},
      {valor: 15, label: "Vivo"},
      {valor: 31, label: "Oi"},
      {valor: 12, label: "CTBC"},
      {valor: 43, label: "Sercomtel"},
      {valor: 99, label: "Nextel"}
    ];
  }
  async gravar() {
    this.cliente.contatos = this.contatos;
    const result = await this.clienteService.createCliente(this.cliente);
    if (result.success) {
      const snack = this.matSnack.open("Registro Salvo com Sucesso", undefined, {duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['style_ok']});
      snack.afterDismissed().subscribe(() => {
        this.router.navigateByUrl("/home");
      })
    }

  }
  async retornaCep(cep: any) {
    console.log(cep);
    const dataCep = await this.viaCepService.buscaCep(cep);
    const {logradouro, bairro, localidade, uf} = JSON.parse(JSON.stringify(dataCep));
    console.log(dataCep);
    this.cliente.endereco = logradouro.toUpperCase();
    this.cliente.bairro = bairro.toUpperCase();
    this.cliente.cidade = localidade.toUpperCase();
    this.cliente.uf = uf.toUpperCase();
  }
  addNewContato() {
    const newContato = new ContatosModel();
    this.contatos.push(newContato);
    
  }
  removeContato(contato: ContatosModel) {
    const index = this.contatos.indexOf(contato);
    this.contatos.splice(index, 1);
  }
}