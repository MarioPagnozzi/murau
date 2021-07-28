import { ChangeDetectorRef, Component, OnInit, ViewChild, OnChanges } from '@angular/core';
import { ActivatedRoute, Router, Scroll, RouterEvent, NavigationEnd } from '@angular/router';
import { Galleria } from 'primeng/galleria';
import { Subscription } from 'rxjs';
import { ImagesProdutoModel } from 'src/app/models/imagesProdutoModel';
import { ProdutosModel } from 'src/app/models/produtosModel';
import { HomeService } from 'src/app/services/home.service';
import { ProdutosService } from 'src/app/services/produtos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';


interface document {
  exitFullscreen: any;
  mozCancelFullScreen: any;
  webkitExitFullscreen: any;
  fullscreenElement: any;
  mozFullScreenElement: any;
  webkitFullscreenElement: any;
}

@Component({
  selector: 'app-detalhes-produto',
  templateUrl: './detalhes-produto.component.html',
  styleUrls: ['./detalhes-produto.component.scss']
})
export class DetalhesProdutoComponent implements OnInit {

  images: ImagesProdutoModel[] = [];
  no_images: ImagesProdutoModel = new ImagesProdutoModel();
  showThumbnails: boolean = false;

  fullscreen: boolean = false;

  activeIndex: number = 0;

  onFullScreenListener: any;

  produtosExtras: ProdutosModel[] = [new ProdutosModel()];
  produtos: ProdutosModel[] = [new ProdutosModel()];
  isLogged = false;
  subscrip: Subscription = new Subscription();

  produto: ProdutosModel = new ProdutosModel();
  produtosModelo: ProdutosModel[] = [new ProdutosModel()];
  prodModelo: ProdutosModel[] = [new ProdutosModel()];

  @ViewChild('galleria')
  galleria!: Galleria;

  tamanhos: any[] = [];

  constructor(private homeService: HomeService,
              private produtosService: ProdutosService,
              private cd: ChangeDetectorRef,
              private router: Router,
              private active: ActivatedRoute,
              private usuarioService: UsuariosService) { }

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];
  ngOnInit() {
    
    //this.no_images.caminho = "./../../assets/images/img_nao_disp.jpg";
    this.images.push(this.no_images);
    this.unbindDocumentListeners();
    // tslint:disable-next-line: deprecation
    this.active.params.subscribe({
      next: (p) => {
        this.getUid(p.uid);
      },
      error: (error) => {
        console.log(error)
      }
    });
    this.bindDocumentListeners();
    this.isLogged = this.usuarioService.isStaticLogged;
    // tslint:disable-next-line: deprecation
    this.subscrip = this.usuarioService.isLogged.subscribe(log => {
      this.isLogged = log;
    });
    
  }

  async getUid(uid: string) {

    this.homeService.getObservableById(uid).subscribe(
      {
        next: async (produto) => {

          this.unbindDocumentListeners();
          this.activeIndex = -1;
          this.produto = produto as ProdutosModel;
          //this.images = [];
          //this.images.push(this.no_images)
          //this.produtos = [];
          //this.prodModelo = [];
          //this.produtosExtras = [];
          //this.produtosModelo = [];

          if ((produto as ProdutosModel).imagens && (produto as ProdutosModel).imagens.length > 0) {
            this.images = (produto as ProdutosModel).imagens as ImagesProdutoModel[];
          }
         
          const result_extra = await this.homeService.filtro("nome", (produto as ProdutosModel).nome?.substring(0, (produto as any).nome?.indexOf(' ') >= 5 && (produto as ProdutosModel).nome?.indexOf(' ') ? (produto as ProdutosModel).nome?.indexOf(' ') : 5 ));

          if (result_extra.success) {
            this.produtosExtras = result_extra.data as ProdutosModel[];
            this.produtosExtras = this.produtosExtras.filter(val => val.uid !== uid);
            this.produtosExtras.forEach(async (produto) => {             
              let imagens = await this.homeService.filtro("imagens", produto.uid)
              if (imagens.data && imagens.data != null && imagens.data.length > 0) {
                produto.imagens = imagens.data as ImagesProdutoModel[];
              }
              
            })
            this.produtos = this.produtosExtras.slice(0, 6);
          }
          const res_modelo = this.isLogged ? await this.produtosService.filtro("modelo", (produto as ProdutosModel).nome) : await this.homeService.filtro("modelo", (produto as ProdutosModel).nome);
          if (res_modelo.success) {
              this.produtosModelo = res_modelo.data as ProdutosModel[];
              this.produtosModelo = this.produtosModelo.filter(val => val.uid !== uid);
              this.produtosModelo.forEach(async (produto) => {               
                let imagens = await this.homeService.filtro("imagens", produto.uid)
                if (imagens.data && imagens.data != null && imagens.data.length > 0) {
                  produto.imagens = imagens.data as ImagesProdutoModel[];
                }
              })
              this.prodModelo = this.produtosModelo.slice(0, 3);
          }
          const tamanhos = await this.homeService.filtro("tamanhos", (produto as ProdutosModel).referencia);
          if (tamanhos.success) {
            this.tamanhos = tamanhos.data;
          }
          // tslint:disable-next-line: no-non-null-assertion
          document.getElementById('P')!.style.background = this.random_bgcolor()
          this.bindDocumentListeners();
          this.activeIndex = 0;
          this.router.events.subscribe({
            next: (event) => {
              //this.unbindDocumentListeners();
              //let nvEnd: NavigationEnd = new NavigationEnd(2, this.router.url, this.router.url)
        
              //let scroll: Scroll = new Scroll(nvEnd, [0, 0], "detalhesProduto");
              //onsole.log(scroll)
              document.getElementById("detalhesProduto")?.scrollIntoView();
              if (!(event instanceof NavigationEnd)) {
                return;
              }
            }
            
          })
        },
        error: (error) => {
          console.log(error)
        }
      }
    );
    
  }

  random_bgcolor() {
    const x = Math.floor(Math.random() * 256);
    const y = Math.floor(Math.random() * 256);
    const z = Math.floor(Math.random() * 256);
   
    return "rgb(" + x + "," + y + "," + z + ")";
  }
  onThumbnailButtonClick() {
    this.showThumbnails = !this.showThumbnails;
  }

  toggleFullScreen() {
    if (this.fullscreen) {
      this.closePreviewFullScreen();
    }
    else {
      this.openPreviewFullScreen();
    }
  }

  openPreviewFullScreen() {
    let elem = this.galleria.element.nativeElement.querySelector(".p-galleria");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }

    else if (elem["mozRequestFullScreen"]) { /* Firefox */
      elem["mozRequestFullScreen"]();
    }
    else if (elem["webkitRequestFullscreen"]) { /* Chrome, Safari & Opera */
      elem["webkitRequestFullscreen"]();
    }
    else if (elem["msRequestFullscreen"]) { /* IE/Edge */
      elem["msRequestFullscreen"]();
    }
  }

  onFullScreenChange() {
    this.fullscreen = !this.fullscreen;
  }

  closePreviewFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    else if (document["mozCancelFullScreen"]) {
      document["mozCancelFullScreen"]();
    }
    else if (document["webkitExitFullscreen"]) {
      document["webkitExitFullscreen"]();
    }
    else if (document["msExitFullscreen"]) {
      document["msExitFullscreen"]();
    }
  }

  bindDocumentListeners() {
    this.onFullScreenListener = this.onFullScreenChange.bind(this);
    document.addEventListener("fullscreenchange", this.onFullScreenListener);
    document.addEventListener("mozfullscreenchange", this.onFullScreenListener);
    document.addEventListener("webkitfullscreenchange", this.onFullScreenListener);
    document.addEventListener("msfullscreenchange", this.onFullScreenListener);
  }

  unbindDocumentListeners() {
    document.removeEventListener("fullscreenchange", this.onFullScreenListener);
    document.removeEventListener("mozfullscreenchange", this.onFullScreenListener);
    document.removeEventListener("webkitfullscreenchange", this.onFullScreenListener);
    document.removeEventListener("msfullscreenchange", this.onFullScreenListener);
    this.onFullScreenListener = null;
  }

  ngOnDestroy() {
    this.unbindDocumentListeners();
  }

  galleriaClass() {
    return `custom-galleria ${this.fullscreen ? 'fullscreen' : ''}`;
  }

  fullScreenIcon() {
    return `pi ${this.fullscreen ? 'pi-window-minimize' : 'pi-window-maximize'}`;
  }

  onPageChange(event: any) {
    this.produtos = this.produtosExtras.slice(event.first, (event.first + event.rows));
    document.getElementById("prodExtras")?.scrollIntoView();
  }
  onPageChangeT(event: any) {
    this.prodModelo = this.produtosModelo.slice(event.first, (event.first + event.rows));
    document.getElementById("prodModelos")?.scrollIntoView();
  }

}
