import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MessageService, PrimeNGConfig, SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { HomeService } from 'src/app/services/home.service';
import { getAddress } from '../../shared/funcoesGlobal';
import { MapsAPILoader } from '@agm/core';
import { IProdutos } from 'src/app/interfaces/IProdutos';
import { IImagesProduto } from 'src/app/interfaces/IImagesProduto';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Router } from '@angular/router';

//declare var google: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit {
  isLogged = false;
  subscrip: Subscription = new Subscription();

  produtos: IProdutos[] = [];
  sortOpicao: SelectItem[] = [];
  sortOrdem = 0;
  sortField = "";

  private geoCoder: any;
  
  @ViewChild('search')
  public searchElementRef: ElementRef | undefined;

  constructor( private homeService: HomeService, 
               private ngConfig: PrimeNGConfig,
               private ngZone: NgZone,
               private messageService: MessageService,
               private mapsAPILoader: MapsAPILoader,
               private primengConfig: PrimeNGConfig,
               private usuariosService: UsuariosService,
               private router: Router){}

  async ngOnInit() {
      this.isLogged = this.usuariosService.isStaticLogged;
      if (this.isLogged) {
        this.router.navigateByUrl("/panel")
      } else {
        const prods =  await this.homeService.getAll();
        this.produtos =  prods.data.map((pro: IProdutos) => {
           return {
             nome: pro.nome,
             descricao: pro.descricao,
             referencia: pro.referencia,
             codigo: pro.codigo,
             tamanho: pro.tamanho,
             cor: pro.cor,
             estoque: pro.estoque,
             imagens: pro.imagens?.map((img: IImagesProduto) => {
               return {
                 caminho: img.caminho ? img.caminho : null
               }
             }),
             uid: pro.uid,
             ativo: pro.ativo
           }
    
        });
        this.sortOpicao = [
          {label: "Menor Preço", value: "!preco"},
          {label: "Mario Preço", value: "preco"}
        ];
        this.primengConfig.ripple = true;
      }
  }
  onSortChange(event: any) {
    const value = event.value;

    if (value.indexOf('!') === 0) {
      this.sortOrdem = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrdem = 1;
      this.sortField = value;
    }
  }
  @ViewChild("dv") public dv: any;
  applyFilter($event: Event) {
     this.dv.filter(($event.target as HTMLInputElement).value);
  }
  
}
