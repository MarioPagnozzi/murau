import { Component, OnInit, Injectable, PLATFORM_ID, Optional, OnDestroy } from '@angular/core';
import {MenuItem, TreeNode } from 'primeng/api';
import { NodeService } from "./nodeservice";
import { MessageService } from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import { BehaviorSubject, Subscription } from 'rxjs';
import { UsuariosService } from './services/usuarios.service';
import { montaMenu, Permissao } from "./shared/funcoesGlobal";
import { IUsuarios } from './interfaces/IUsuarios';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Atacado Murau';
  files: TreeNode[] = [];
  selectedFile: TreeNode = {};
  items: MenuItem[] = [];
  isLogged = false;
  subscrip: Subscription = new Subscription();
  constructor(
    private nodeService: NodeService,
    private messageService: MessageService,
    private translate: TranslateService,
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.subscrip.unsubscribe();
  }
  ngOnInit() {
    this.translate.setDefaultLang("pt-BR");

    this.isLogged = this.usuariosService.isStaticLogged;
   
    this.subscrip = this.usuariosService.isLogged.subscribe(log => {
      this.isLogged = log;
      this.files =  montaMenu();
    })
    this.files = this.usuariosService.isStaticLogged ? montaMenu() : [];
    this.items = [
      {
        label: "View",
        icon: "pi pi-search",
        command: event => this.viewFile(this.selectedFile)
      },
      {
        label: "Unselect",
        icon: "pi pi-times",
        command: event => this.unselectFile()
      }
    ];
  }

  viewFile(file: TreeNode) {
    this.messageService.add({
      severity: "info",
      summary: "Node Details",
      detail: file.label
    });
  }
  logout() {
    this.usuariosService.logout();
    this.router.navigateByUrl("/home")
  }
  unselectFile() {
    this.selectedFile = {};
  }
  permissao(tabela: any, acao: any) {
    const hasPermissao = this.usuariosService.isStaticLogged ? Permissao(tabela, acao) : false;
    return hasPermissao;
  }
  retornaTabela(data: any): string {
    let tabela = "";
    const dt = data.toString().split("/");
    tabela = dt[1];
    console.log(tabela);
    return tabela;
  }
}
