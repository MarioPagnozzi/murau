import { ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
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

  showThumbnails: boolean = false;

  fullscreen: boolean = false;

  activeIndex: number = 0;

  onFullScreenListener: any;

  produtosExtras: ProdutosModel[] = [];
  produtos: ProdutosModel[] = [];
  isLogged = false;
  subscrip: Subscription = new Subscription();

  produto: ProdutosModel = new ProdutosModel();
  produtosModelo: ProdutosModel[] = [];
  prodModelo: ProdutosModel[] = [];

  @ViewChild('galleria') galleria: Galleria | any;


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
    
    this.images = [];
    this.produtos = [];
    this.prodModelo = [];
    this.activeIndex = 0;
    this.produtosExtras = [];
    this.produtosModelo = [];
    // tslint:disable-next-line: deprecation
    this.active.params.subscribe(p => this.getUid(p.uid));
    this.isLogged = this.usuarioService.isStaticLogged;
    // tslint:disable-next-line: deprecation
    this.subscrip = this.usuarioService.isLogged.subscribe(log => {
      this.isLogged = log;     
    })
    
    //this.bindDocumentListeners();
  }

  async getUid(uid: string) {

    this.homeService.getObservableById(uid).subscribe(
      {
        next: async (produto) => {
         
          this.unbindDocumentListeners();
          this.activeIndex = 0;
          this.images = [];
          this.produtos = [];
          this.prodModelo = [];
          this.produtosExtras = [];
          this.produtosModelo = [];
          
          this.produto = produto as ProdutosModel;
         
          this.images = this.produto.imagens.length > 0 ?  this.produto.imagens : [{caminho: "./../../assets/images/img_nao_disp.jpg"}] as ImagesProdutoModel[];
          this.bindDocumentListeners();
          const result_extra = await this.homeService.filtro("nome", ((produto as any).nome.substring(0, ((produto as any).nome.indexOf(' ')) >= 5 && (produto as any).nome?.indexOf(' ') ? (produto as ProdutosModel).nome?.indexOf(' ') : 5 )));

          if (result_extra.success) {
            this.produtosExtras = result_extra.data as any[];
            this.produtosExtras = this.produtosExtras.filter(val => val.uid !== uid);
            this.produtos = this.produtosExtras.slice(0, 6);

            const res_modelo = this.isLogged ? await this.produtosService.filtro("modelo", (produto as any).nome) : await this.homeService.filtro("modelo", (produto as any).nome);
            if (res_modelo.success) {
                this.produtosModelo = res_modelo.data as any[];
                this.produtosModelo = this.produtosModelo.filter(val => val.uid !== uid);
            }
            this.prodModelo = this.produtosModelo.slice(0, 3);
          }
          this.router.events.subscribe((event) => {
      
            //let nvEnd: NavigationEnd = new NavigationEnd(2, this.router.url, this.router.url)
      
            //let scroll: Scroll = new Scroll(nvEnd, [0, 0], "detalhesProduto");
            //onsole.log(scroll)
            if (!(event instanceof NavigationEnd)) {
              return;
          }
          document.getElementById("detalhesProduto")?.scrollIntoView();
           //window.scrollTo(scroll.position ? scroll.position[0] : 0, scroll.position ? scroll.position[1] : 0);
          })
        }
        
      }
    )
    /*let result;
    if (this.isLogged) {
        result = await this.produtosService.getById(uid);
    } else {
        result = await this.homeService.getById(uid);
    }   
    if (result.success) {
       this.produto = result.data as ProdutosModel;
       this.images = await this.produto.imagens.length > 0 ? await this.produto.imagens as ImagesProdutoModel[] : [{caminho: "./../../assets/images/img_nao_disp.jpg"}] as ImagesProdutoModel[];
      
       const result_extra = await this.homeService.filtro("nome", (this.produto.nome?.substring(0, this.produto.nome?.indexOf(' ') + 1)));

       if (result_extra.success) {
         this.produtosExtras = result_extra.data as ProdutosModel[];
         this.produtosExtras = this.produtosExtras.filter(val => val.uid !== uid);
         this.produtos = this.produtosExtras.slice(0, 6);

         const res_modelo = this.isLogged ? await this.produtosService.filtro("modelo", this.produto.nome) : await this.homeService.filtro("modelo", this.produto.nome);
         if (res_modelo.success) {
            this.produtosModelo = res_modelo.data as ProdutosModel[];
            this.produtosModelo = this.produtosModelo.filter(val => val.uid !== uid);
         }
         this.prodModelo = this.produtosModelo.slice(0, 3);
      }
    }*/
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
    this.produtos = this.produtosExtras.slice(event.first, (event.first + event.rows))
  }
  onPageChangeT(event: any) {
    this.prodModelo = this.produtosModelo.slice(event.first, (event.first + event.rows));
  }

}
