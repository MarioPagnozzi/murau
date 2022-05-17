import { NgModule, CUSTOM_ELEMENTS_SCHEMA, DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule} from "@angular/router";
import { AppRoutingModule } from './app-routing.module';

import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';



import { AppComponent } from './app.component';
import { NodeService } from './nodeservice';


import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatCheckboxModule} from '@angular/material/checkbox';


import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import {TreeModule} from 'primeng/tree';
import {ToastModule} from 'primeng/toast';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {ContextMenuModule} from 'primeng/contextmenu';
import {AvatarModule} from 'primeng/avatar';
import {AvatarGroupModule} from 'primeng/avatargroup';
import {TableModule} from 'primeng/table';
import {CalendarModule} from 'primeng/calendar';
import {SliderModule} from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import {DropdownModule} from 'primeng/dropdown';
import {ProgressBarModule} from 'primeng/progressbar';
import {InputTextModule} from 'primeng/inputtext';
import {DataViewModule} from 'primeng/dataview';

import {CheckboxModule} from 'primeng/checkbox';
import {RadioButtonModule} from 'primeng/radiobutton';
import {RippleModule} from 'primeng/ripple';
import {TabViewModule} from 'primeng/tabview';
import {PanelModule} from 'primeng/panel';
import {CardModule} from 'primeng/card';
import {SplitButtonModule} from 'primeng/splitbutton';
import {InputMaskModule} from 'primeng/inputmask';
import {ToolbarModule} from 'primeng/toolbar';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {FieldsetModule} from 'primeng/fieldset';
import {TooltipModule} from 'primeng/tooltip';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {GalleriaModule} from 'primeng/galleria';
import {PaginatorModule} from 'primeng/paginator';
import {MatBadgeModule} from '@angular/material/badge';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {FullCalendarModule} from "@fullcalendar/angular";


import { ClientesPendentesComponent } from './components/clientes-pendentes/clientes-pendentes.component';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { AgendaComponent } from './components/agenda/agenda.component';
import {AgendaService} from "./components/agenda/agendaService";

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DashbordPrincipalComponent } from './components/dashbord-principal/dashbord-principal.component';
import { PerfilComponent } from './components/perfil/perfil.component';

import { NgxSpinnerModule } from "ngx-spinner";
import { HomeComponent } from './components/home/home.component';
import { PanelComponent } from './components/panel/panel.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { ClienteComponent } from './components/cliente/cliente.component';
import { GruposComponent } from './components/grupos/grupos.component';
import { GrupoComponent } from './components/grupo/grupo.component';
import { EmpresasComponent } from './components/empresas/empresas.component';
import { EmpresaComponent } from './components/empresa/empresa.component';
import { ConfiguracaoComponent } from './components/configuracao/configuracao.component';
import { ConfiguracoesComponent } from './components/configuracoes/configuracoes.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { PedidoComponent } from './components/pedido/pedido.component';
import { PermissaoComponent } from './components/permissao/permissao.component';
import { PermissoesComponent } from './components/permissoes/permissoes.component';
import { ProdutoComponent } from './components/produto/produto.component';
import { ProdutosComponent } from './components/produtos/produtos.component';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { VendedorComponent } from './components/vendedor/vendedor.component';
import { VendedoresComponent } from './components/vendedores/vendedores.component';
import { LoginComponent } from './components/login/login.component';

import { NgxMaskModule, IConfig } from 'ngx-mask';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from "ng2-currency-mask";

import {GMapModule} from 'primeng/gmap';
import {AgmCoreModule} from '@agm/core';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faEdit, faBars, faCog, faCartPlus, faCamera, faChartArea, faSignOutAlt, faSearchPlus, faCogs, faSyncAlt, faLock } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { faFacebook, faTwitter, faGoogle, faLinkedin, faInstagram, faPinterest} from '@fortawesome/free-brands-svg-icons';
import { CreateClienteComponent } from './components/create-cliente/create-cliente.component';
import { AppCepValidateDirective, AppCnpjValidateDirective, AppEmailValidateDirective, AppNomeValidateDirective, AppUfValidateDirective } from './diretivas/diretivaValidacoes';
import { InputFileComponent } from './components/input-file/input-file.component';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import { FormUsuarioComponent } from './components/form-usuario/form-usuario.component';
import { DetalhesProdutoComponent } from './components/detalhes-produto/detalhes-produto.component';
import { PanelAdministradorComponent } from './components/panel-administrador/panel-administrador.component';
import { GoogleMapsComponent } from './components/google-maps/google-maps.component';
import { PromocoesComponent } from './components/promocoes/promocoes.component';
import { GridComponenteComponent } from './components/grid-componente/grid-componente.component';
import { InputFilePhotosComponent } from './components/input-file-photos/input-file-photos.component';
import { InputFilePhotosDirective } from './diretivas/input-file-photos.directive';
import { RelEstoqueComponent } from './components/rel-estoque/rel-estoque.component';

declare global {
  interface Document {
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitFullscreenElement?: Element;
  }

  interface HTMLElement {
    msRequestFullscreen?: () => Promise<void>;
    mozRequestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  }
}

registerLocaleData(localePt);

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin
])

export function TranslationLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'MMM DD, YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

const maskConfig: Partial<IConfig> = {
  validation: false,
};

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "right",
  allowNegative: true,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: "."
};
@NgModule({
  declarations: [
    AppComponent,
    ClientesPendentesComponent,
    AgendaComponent,
    DashbordPrincipalComponent,
    PerfilComponent,
    HomeComponent,   
    PanelComponent,
    ClientesComponent,
    ClienteComponent,
    GruposComponent,
    GrupoComponent,
    EmpresasComponent,
    EmpresaComponent,
    ConfiguracaoComponent,
    ConfiguracoesComponent,
    PedidosComponent,
    PedidoComponent,
    PermissaoComponent,
    PermissoesComponent,
    ProdutoComponent,
    ProdutosComponent,
    UsuarioComponent,
    UsuariosComponent,
    VendedorComponent,
    VendedoresComponent,
    LoginComponent,
    CreateClienteComponent,
    AppNomeValidateDirective,
    AppCnpjValidateDirective,
    AppCepValidateDirective,
    AppUfValidateDirective,
    AppEmailValidateDirective,
    InputFileComponent,
    ToolBarComponent,
    FormUsuarioComponent,
    DetalhesProdutoComponent,
    PanelAdministradorComponent,
    GoogleMapsComponent,
    PromocoesComponent,
    GridComponenteComponent,
    InputFilePhotosComponent,
    InputFilePhotosDirective,
    RelEstoqueComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    TreeModule,
    ToastModule,
    ButtonModule,
    DialogModule,
    ContextMenuModule,
    HttpClientModule,
    FormsModule,
    AvatarModule,
    AvatarGroupModule,
    MatDividerModule,
    MatCardModule,
    PanelModule,
    TabViewModule,
    TableModule,
    CalendarModule,
    SliderModule,
    MultiSelectModule,
    DropdownModule,
    ProgressBarModule,
    InputTextModule,
    FullCalendarModule,
    CheckboxModule,
    RadioButtonModule,
    RippleModule,
    RouterModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    CardModule,
    DataViewModule,
    MatSnackBarModule,
    FontAwesomeModule,
    SplitButtonModule,
    InputMaskModule,
    ToolbarModule,
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyDlDAx0Arx9LHCWagPDw2IeYiu8oD7GF6s",
      libraries: ["places", "geometry"]
    }),   
    TranslateModule.forRoot(
      {loader: {provide: TranslateLoader, useFactory: TranslationLoaderFactory, deps: [HttpClient]}},
    ),
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaskModule.forRoot(maskConfig),
    CurrencyMaskModule,
    ConfirmDialogModule,
    FieldsetModule,
    TooltipModule,
    AutoCompleteModule,
    GalleriaModule,
    PaginatorModule,
    GMapModule,
    MatCheckboxModule,
    MatBadgeModule
    

  ],
  bootstrap: [AppComponent],
  providers: [NodeService, 
              TranslateService, 
              AgendaService, 
              AppNomeValidateDirective, 
              AppCnpjValidateDirective, 
              AppCepValidateDirective, 
              AppUfValidateDirective, 
              AppEmailValidateDirective,
              MessageService, 
              ConfirmationService,
              { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
              { provide: MAT_DATE_LOCALE, useValue: "pt-BR"},
              { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig},
              { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL'},
              { provide: LOCALE_ID, useValue: 'pt-BR'}],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule {
  constructor(public config: PrimeNGConfig, public library: FaIconLibrary) {
    this.config.setTranslation({
      addRule: "Adicionar Regras",
      startsWith: "Iniciado Com",
      endsWith: "Terminado Com",
      matchAll: "Unir tudo",
      matchAny: "Por Palavra",
      accept: "Aceitar",
      after: "Depois",
      apply: "Aplicar",
      before: "Antes",
      cancel: "Cancelar",
      choose: "Escolher",
      clear: "Limpar",
      contains: "Contém",
      dayNames: ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"],
      dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
      dayNamesShort: ["Dom", "Seg", "Ter", "Quar", "Qui", "Sex", "Sab"],
      equals: "Igual",
      gt: "Maior que",
      gte: "Maior ou Igual a",
      is: "É",
      isNot: "Não é",
      lt: "Menor que",
      lte: "Menor ou Igual a",
      monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
      monthNamesShort: ["Jan", "Fev", "Marc", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      noFilter: "Sem filtro",
      notContains: "Não Contenha",
      notEquals: "Diferente",
      reject: "Rejeitar",
      removeRule: "Remover Regra",
      today: "Hoje",
      weekHeader: "Cabeçalho da Semana",
      upload: "Upload"

    });
    library.addIcons(
      faBars, 
      faUser, 
      faFacebook, 
      faInstagram, 
      faTwitter, 
      faGoogle, 
      faLinkedin,
      faCog,
      faCartPlus,
      faChartArea,
      faSignOutAlt,
      faEdit,
      faSearchPlus,
      faCamera,
      faCogs,
      faSyncAlt,
      faPinterest,
      faLock
    )
  }
}
