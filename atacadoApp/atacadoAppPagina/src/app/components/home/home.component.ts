
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
import { ProdutosModel } from 'src/app/models/produtosModel';
import { ImagesProdutoModel } from 'src/app/models/imagesProdutoModel';
import { ImagemProdutosService } from 'src/app/services/imagem-produtos.service';

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

  produtos: ProdutosModel[] = [];
  sortOpicao: SelectItem[] = [];
  sortOrdem = 0;
  sortField = "";
  imagens: ImagesProdutoModel[] = []
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
               private router: Router)
{
 
}

  async ngOnDestroy() {
    this.subscrip.unsubscribe();
  }
  async ngOnInit() {
      this.isLogged = this.usuariosService.isStaticLogged;
      if (this.isLogged) {
        this.router.navigateByUrl("/panel")
      } else {
        //const prods = await this.homeService.getAll();
        
        /*this.homeService.getObservable().subscribe({
          next: (produtos) => {
            this.produtos = produtos as ProdutosModel[];
            this.produtos.forEach(async (produto) => {
                produto.imagens = [];
                let imagem = await this.homeService.filtro("imagens", produto.uid);
                if (imagem.data && imagem.data != null) {
                    
                    produto.imagens = imagem.data;
                }
                
            })
            
          }
        })*/
        if (!this.isLogged) {
          if (this.homeService.produtosList().length <= 0) {
            this.homeService.retornaProdutos();
          }
        }
        this.produtos = this.homeService.produtosList().filter((prod, i, produtos) => produtos.findIndex(p => p.nome === prod.nome) === i );
        
        this.subscrip = this.homeService.produtosChange$.subscribe({
          next: (produtos) => {
              this.produtos = (produtos as ProdutosModel[]).filter((prod, i, produtos) => produtos.findIndex(p => p.nome === prod.nome) === i );
          },
          error: (err) => {
            throw new Error(err);
          }
        })
        this.sortOpicao = [
          {label: "Menor Preço", value: "!preco"},
          {label: "Mario Preço", value: "preco"}
        ];
        this.primengConfig.ripple = true;
      }
      document.getElementById("prodListas")?.scrollIntoView();
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
  onPageChange() {
    document.getElementById("prodListas")?.scrollIntoView();
  }
  atualizaProdutos() {
    this.homeService.retornaProdutos();
  }
}
