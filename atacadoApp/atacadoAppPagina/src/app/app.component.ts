import { Component, OnInit, Injectable, PLATFORM_ID, Optional } from '@angular/core';
import {MenuItem, TreeNode } from 'primeng/api';
import { NodeService } from "./nodeservice";
import { MessageService } from "primeng/api";
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService]
})
export class AppComponent {
  title = 'Atacado Murau';
  files: TreeNode[] = [];

  selectedFile: TreeNode = {};

  items: MenuItem[] = [];

  constructor(
    private nodeService: NodeService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.translate.setDefaultLang("pt-BR");
    this.nodeService.getFilesMenu().then(files => (this.files = files));

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

  unselectFile() {
    this.selectedFile = {};
  }
}
