import { ClientesPendentesService } from './components/clientes-pendentes/clientes_pendentes_service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule} from "@angular/router";
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { NodeService } from './nodeservice';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';

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

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {FullCalendarModule} from "@fullcalendar/angular";


import { ClientesPendentesComponent } from './components/clientes-pendentes/clientes-pendentes.component';
import { PrimeNGConfig } from 'primeng/api';
import { AgendaComponent } from './components/agenda/agenda.component';
import {AgendaService} from "./components/agenda/agendaService";

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DashbordPrincipalComponent } from './components/dashbord-principal/dashbord-principal.component';
registerLocaleData(localePt);

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin
])

export function TranslationLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
@NgModule({
  declarations: [
    AppComponent,
    ClientesPendentesComponent,
    AgendaComponent,
    DashbordPrincipalComponent
  ],
  imports: [
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
    TableModule,
    CalendarModule,
    SliderModule,
    MultiSelectModule,
    DropdownModule,
    ProgressBarModule,
    InputTextModule,
    FullCalendarModule,
    TranslateModule.forRoot(
      {loader: {provide: TranslateLoader, useFactory: TranslationLoaderFactory, deps: [HttpClient]}},
    )

  ],
  bootstrap: [AppComponent],
  providers: [NodeService, ClientesPendentesService, TranslateService, AgendaService]

})
export class AppModule {
  constructor(public config: PrimeNGConfig) {
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

    })
  }
}
