import { AgendaService } from './agendaService';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';


import {CalendarOptions} from '@fullcalendar/angular';
import brLocale from "@fullcalendar/core/locales/pt-br"

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit {
  eventos: any[] = [];
  options: CalendarOptions = {};
  constructor(private agendaService: AgendaService, private el: ElementRef) { }

  ngOnInit(): void {
    this.agendaService.getEvents().then(eventos => {
      this.eventos = eventos;
      this.options = {
        locale: brLocale,
        initialDate: new Date(),
        initialView: "dayGridMonth",
        events: this.eventos,
        headerToolbar: {
          left: 'prev,next',
          center: 'title',
          right: 'dayGridMonth,dayGridDay,timeGridWeek'
        },
        dayMaxEvents: true,
        dateClick: this.handleDateClick.bind(this)
      }

    });

  }
  handleDateClick(arg: any) {
    alert('date click! ' + arg.dateStr)
  }
}
