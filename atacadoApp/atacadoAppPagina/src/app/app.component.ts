import { Component, OnInit, Injectable, PLATFORM_ID, Optional, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import {MenuItem, PrimeNGConfig, SelectItem, TreeNode } from 'primeng/api';
import { NodeService } from "./nodeservice";
import { MessageService } from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import { BehaviorSubject, Subscription } from 'rxjs';
import { UsuariosService } from './services/usuarios.service';
import { getAddress, getLatLong, montaMenu, Permissao, RetornaDadosUsuario, RetornaGruposUsuario } from "./shared/funcoesGlobal";
import { IUsuarios } from './interfaces/IUsuarios';
import { Router } from '@angular/router';
import { IGrupos } from './interfaces/IGrupos';
import { MapsAPILoader } from '@agm/core';
import { IProdutos } from './interfaces/IProdutos';
import { HomeService } from './services/home.service';
import { FileManage } from './components/input-file/input-file.component';
import { UsuarioModel } from './models/usuarioModel';

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
  usuario: any;
  isRoot = false;
  grupos: IGrupos[] = [];
  itGrupos: Array<any> = [];

  lat = 0;
  lng = 0;
  zoom = 8;

  endereco = "";
  cidade = "";
  options: any;

  @ViewChild('search')
  public searchElementRef: ElementRef | undefined;

  constructor(
    private nodeService: NodeService,
    private messageService: MessageService,
    private translate: TranslateService,
    private usuariosService: UsuariosService,
    private router: Router,
    private mapsAPILoader: MapsAPILoader,
    private homeService: HomeService,
    private primengConfig: PrimeNGConfig
  ) {}

  ngOnDestroy() {
    this.subscrip.unsubscribe();
  }
  async ngOnInit() {
    this.translate.setDefaultLang("pt-BR");
    this.mapsAPILoader.load().then(() => {
      //this.setCurrentLocation();
      this.setEnderecoLoja();
    });
    this.isLogged = this.usuariosService.isStaticLogged;
    // tslint:disable-next-line: deprecation
    this.subscrip = this.usuariosService.isLogged.subscribe(log => {
      this.isLogged = log;
      this.files =  montaMenu();
      this.isRoot = (localStorage.getItem("murau:isroot") === "true");
      this.usuario = RetornaDadosUsuario() ? RetornaDadosUsuario() : "";
      this.grupos = RetornaGruposUsuario();
    })
    this.isRoot = (localStorage.getItem("murau:isroot") === "true");
    this.usuario = RetornaDadosUsuario() ? RetornaDadosUsuario() : "";
    this.files = this.usuariosService.isStaticLogged ? montaMenu() : [];
    this.grupos = RetornaGruposUsuario();
    this.grupos.forEach((grupo) => {
      this.itGrupos.push({label: grupo.nome_grupo});
    })
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

  private setCurrentLocation() {

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition( async (position) => {
        
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        
        const Address: Array<any> = await getAddress(this.lat, this.lng);
       
        this.cidade = Address[6].address_components[1].long_name;
        this.endereco = Address[0].formatted_address;
        
      });
    }
  }
  private async setEnderecoLoja() {
    this.endereco = "são josé do rio preto";
    const Location: Array<any> = await getLatLong(this.endereco);
    
    this.lat = Location[0].geometry.location.lat();
    this.lng = Location[0].geometry.location.lng();
    this.zoom = 12;
  }
  async selectFile(file: FileManage) {
    if (file.base64Data) {
      this.usuario.foto = file.base64Data;
      const result_user = await this.usuariosService.getById(this.usuario.uid);
      let user = result_user.data as UsuarioModel;
      user.foto = this.usuario.foto;

      const result = await this.usuariosService.post(user);
      if (result.success) {
        this.usuario.foto = user.foto;
        localStorage.setItem("murau:user", JSON.stringify(this.usuario));
      }
      
    }
  }
}
