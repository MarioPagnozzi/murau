import { MapsAPILoader } from '@agm/core';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { IEmpresas } from 'src/app/interfaces/IEmpresas';
import { HomeService } from 'src/app/services/home.service';
import { getAddress, getLatLong } from 'src/app/shared/funcoesGlobal';


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
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss']
})
export class GoogleMapsComponent implements OnInit {
  lat = 0;
  lng = 0;
  zoom = 12;

  endereco = "";
  cidade = "";
  options: any;
  overlays: any[] = []; 
  markerTitle: string = "";
  selectedPosition: any;
  infoWindow: any;
  draggable: boolean = false;

  markers: ILocais[] = [];
  distancias: IDistancia[] = [];
  calcDist = 0;
  constructor(
    private homeService: HomeService,
    private mapsAPILoader: MapsAPILoader,
    private messageService: MessageService
  ) { }

 async  ngOnInit() {
  this.mapsAPILoader.load().then(async () => {
    this.setCurrentLocation().then(async (end) => {
      this.cidade = end.cidade;
      this.endereco = end.endereco;
      //console.log("Endereço local" + end.endereco)
      this.setEnderecoLoja(this.endereco).then(async (res) => {
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
              getLatLong(montaEnd).then((local) => {
                lat = local[0].geometry.location.lat();
                lng = local[0].geometry.location.lng();

              }).catch((err) => { console.log(err) });

              let local: ILocais = {

                nome_fantasia: empresa.nome_fantasia,
                telefone: empresa.telefone,
                cnpj: empresa.cnpj,
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
      this.zoom = 12;
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
              cnpj: empresa.cnpj,
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
}
