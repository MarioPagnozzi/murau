import { Component, OnInit, Injectable, PLATFORM_ID, Optional, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MenuItem, PrimeNGConfig, SelectItem, TreeNode } from 'primeng/api';
import { NodeService } from "./nodeservice";
import { MessageService } from "primeng/api";
import { TranslateService } from "@ngx-translate/core";
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
import { EmpresasService } from './services/empresas.service';
import { IEmpresas } from './interfaces/IEmpresas';



export interface ILocais extends IEmpresas {

  lat: number
  lng: number
  dist: number
}

export interface IDistancia {
  uid: string
  dist: number
}

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

  markers: ILocais[] = [];
  distancias: IDistancia[] = [];
  calcDist = 0;

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
    private primengConfig: PrimeNGConfig,
    private empresasService: EmpresasService
  ) { }

  ngOnDestroy() {
    this.subscrip.unsubscribe();
  }
  async ngOnInit() {
    this.translate.setDefaultLang("pt-BR");
    this.mapsAPILoader.load().then(async () => {
      await this.setCurrentLocation().then(async (end) => {
        this.cidade = end.cidade;
        this.endereco = end.endereco;
        //console.log("Endereço local" + end.endereco)
        await this.setEnderecoLoja(this.endereco).then(async (res) => {
          if (res.id === "distancias") {
            //console.log("teste")
            for (let i in res.dist.sort((a: any, b: any) => a.dist - b.dist)) {
              console.log(res.dist[i].uid)
              let uid = res.dist[i].uid;
              let distancia = res.dist[i].dist;
              console.log(res.dist[i].dist)
              let result = await this.homeService.filtro("empresaById", uid);

              if (result.success) {
                let lat: number = 0;
                let lng: number = 0;
                let empresa = result.data as IEmpresas;
                let montaEnd = empresa.endereco + ',' + empresa.numero + "-" + empresa.bairro + "," + empresa.cidade + "-" + empresa.uf + "," + empresa.cep;
                console.log(montaEnd)
                await getLatLong(montaEnd).then((local) => {
                  lat = local[0].geometry.location.lat();
                  lng = local[0].geometry.location.lng();

                }).catch((err) => { console.log(err) });

                let local: ILocais = {

                  nome_fantasia: empresa.nome_fantasia,
                  telefone: empresa.telefone,
                  cep: empresa.cep,
                  endereco: empresa.endereco,
                  numero: empresa.numero,
                  complemento: empresa.complemento,
                  cidade: empresa.cidade,
                  uf: empresa.uf,
                  lat: lat,
                  lng: lng,
                  dist: res.dist[i].dist,
                  data_inclusao: empresa.data_inclusao,
                  data_alteracao: empresa.data_alteracao,
                  excluido: empresa.excluido,
                  ativo: empresa.ativo,
                  uid: empresa.uid
                };
                this.markers.push(local);

              }
            }
          }
        });
      });
    });
    this.isLogged = this.usuariosService.isStaticLogged;
    // tslint:disable-next-line: deprecation
    this.subscrip = this.usuariosService.isLogged.subscribe(log => {
      this.isLogged = log;
      this.files = montaMenu();
      this.isRoot = (localStorage.getItem("murau:isroot") === "true");
      this.usuario = RetornaDadosUsuario() ? RetornaDadosUsuario() : "";
      this.grupos = RetornaGruposUsuario();
    })
    this.isRoot = (localStorage.getItem("murau:isroot") === "true");
    this.usuario = RetornaDadosUsuario() ? RetornaDadosUsuario() : "";
    this.files = this.usuariosService.isStaticLogged ? montaMenu() : [];
    this.grupos = RetornaGruposUsuario();
    this.grupos.forEach((grupo) => {
      this.itGrupos.push({ label: grupo.nome_grupo });
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

  private setCurrentLocation(): Promise<any> {
    return new Promise<any>(async (resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {

          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          const Address: Array<any> = await getAddress(this.lat, this.lng);
          resolve({ cidade: Address[6].address_components[1].long_name, endereco: Address[0].formatted_address })

        });
      }
    })
  }
  private setEnderecoLoja(endereco: string): Promise<any> {
    return new Promise<any>(async (resolve) => {

      const Location: Array<any> = await getLatLong(endereco);
      this.lat = Location[0].geometry.location.lat();
      this.lng = Location[0].geometry.location.lng();
      this.zoom = 11;
      console.log(this.cidade)
      let result = await this.homeService.filtro("cidade", this.cidade);

      if (result.success) {
        let empresas = result.data as IEmpresas[];

        if (empresas.length > 0) {

          empresas.forEach(async (empresa) => {
            let montaEnd = empresa.endereco + ',' + empresa.numero + "-" + empresa.bairro + "," + empresa.cidade + "-" + empresa.uf + "," + empresa.cep;
            const Loc: Array<any> = await getLatLong(montaEnd as string);
            let lat = Loc[0].geometry.location.lat();
            let lng = Loc[0].geometry.location.lng();
            let locVisit = new google.maps.LatLng(this.lat, this.lng);
            let locLoja = new google.maps.LatLng(lat, lng);
            let dist = google.maps.geometry.spherical.computeDistanceBetween(locVisit, locLoja)

            let local: ILocais = {

              nome_fantasia: empresa.nome_fantasia,
              telefone: empresa.telefone,
              cep: empresa.cep,
              endereco: empresa.endereco,
              numero: empresa.numero,
              complemento: empresa.complemento,
              cidade: empresa.cidade,
              uf: empresa.uf,
              lat: lat,
              lng: lng,
              dist: dist / 1000,
              data_inclusao: empresa.data_inclusao,
              data_alteracao: empresa.data_alteracao,
              excluido: empresa.excluido,
              ativo: empresa.ativo,
              uid: empresa.uid
            };
            this.markers.push(local);

          })
          resolve({ id: "markers" })
        } else {

          let res_emp = await this.homeService.filtro("empresas", "empresa");
          let arrDist: IDistancia[] = [];


          if (res_emp.success) {
            empresas = res_emp.data as IEmpresas[];
            console.log(empresas)
            empresas.forEach(async (empresa) => {
              console.log(empresa)
              const getObj = async (endereco: string) => {
                const location = await getLatLong(endereco);
                const [latitude, longitude] = await Promise.all([
                  location[0].geometry.location.lat(),
                  location[0].geometry.location.lng()
                ]);
                return {
                  latitude,
                  longitude
                }
              }
              const local = async (getObj: any) => {

                const [locVist, locLoja] = await Promise.all([
                  new google.maps.LatLng(getObj.latitude, getObj.longitude),
                  new google.maps.LatLng(this.lat, this.lng)
                ])
                return {
                  locVist,
                  locLoja
                }
              }

              const dist = async (local: any) => {

                const [dist] = await Promise.all([
                  google.maps.geometry.spherical.computeDistanceBetween(local.locVist, local.locLoja)
                ]);
                return { dist }
              }             
              arrDist.push({
                uid: empresa.uid,
                dist: 0
              });

              console.log(arrDist)

            });
            resolve({ id: "distancias", dist: arrDist });
          }

        }
      }
    })
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
