import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmpresasModel } from 'src/app/models/empresasModel';
import { EmpresasService } from 'src/app/services/empresas.service';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.scss']
})
export class EmpresasComponent implements OnInit {

  spinnerAcao: string = "Carregando...";
  selEmpresas: EmpresasModel[] = [];
  empresaList: EmpresasModel[] = [];
  empresas: EmpresasModel[] = [];
  toolTipBtnExcluidos: string =  "Mostrar Empresas Excluídas";
  iconBtnEye: string = "pi pi-eye";
  mostraExcluidos: boolean = false;


  @ViewChild("dt") public dt: any;
  constructor(private empresasService: EmpresasService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private route: Router) { }

  ngOnInit(): void {
    this.carregarEmpresas();
  }
  
  async carregarEmpresas() {
    this.spinnerAcao = "Carregando Empresas...";
    const result = await this.empresasService.getAll();
    this.empresas = result.data as EmpresasModel[];
    this.empresaList = this.empresas.filter(val => val.ativo && !val.excluido);
   }
 applyFilterGlobal($event: Event, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
 }
 excluirEmpresas() {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir as empresas selecionadas ?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.empresaList = this.empresas;
        let x = 1;
        this.selEmpresas.forEach(async (empresa) => {
          const i = this.findIndexById(empresa.uid ? empresa.uid : '0');
          if (i > -1) {
            this.empresaList[i].ativo = false;
            this.empresaList[i].excluido = true;
            this.spinnerAcao = "Excluindo registro " + x.toString() + " de " + this.selEmpresas.length.toString();           
            const result = await this.empresasService.delete(empresa.uid ? empresa.uid : '0');
            if (!result.success) {
              this.empresaList[i].ativo = true;
              this.empresaList[i].excluido = false;
            } else {
              
            }
          }
          setTimeout(() => {
            x += 1;
          }, 3000)
        });
        this.empresas = this.empresaList;
        this.mostraExcluidos = true;
        this.mostraEmpresasExcluidas();
        this.selEmpresas = [];
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Empresas Excluídas",
          life: 3000
        })
      }
    })
 }
 mostraEmpresasExcluidas() {
  if (this.mostraExcluidos) {
    this.iconBtnEye = "pi pi-eye";
    this.toolTipBtnExcluidos = "Mostrar Clientes Excluídos";
    this.mostraExcluidos = false;

    this.empresaList = this.empresaList.filter(val =>  val.ativo && !val.excluido);
    } else {
        this.mostraExcluidos = true;
        this.iconBtnEye = "pi pi-eye-slash";
        this.toolTipBtnExcluidos = "Ocultar Clientes Excluídos";
        this.empresaList = this.empresas;
}
 }
 excluirEmpresa(empresa: EmpresasModel) {
    this.confirmationService.confirm({
      message: "Deseja realmente excluir a empresa " + empresa.nome_fantasia + "?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
      
          this.spinnerAcao = "Excluindo Registro ...";
          const result = await this.empresasService.delete(empresa.uid ? empresa.uid : '0');
        
        if (result.success) {
              const result_emp = await this.empresasService.getAll();
              this.empresas =  result_emp.data as EmpresasModel[];
              this.empresaList = this.empresas.filter(val => val.ativo && !val.excluido);
              this.mostraExcluidos = true;
              this.mostraEmpresasExcluidas();
              this.messageService.add({
                severity: "success",
                summary: "Sucesso",
                detail: "Empresa Excluída",
                life: 3000
            })
        }
      }
    })
 }
 async restaurarEmpresa(empresa: EmpresasModel) {
  let _empresa = {...empresa};
      _empresa.ativo = true;
      _empresa.excluido = false;
      this.spinnerAcao = "Restaurando Registro..."
      const result = await this.empresasService.post(_empresa);
      console.log(result)
      if (result.success) {
            this.empresas = [];
            this.empresas = await this.retornaEmpresas();
            this.empresaList = this.empresas.filter(val => val.ativo && !val.excluido);        
            this.mostraExcluidos = true;
            this.mostraEmpresasExcluidas();
        
      }
 }
 async retornaEmpresas(): Promise<EmpresasModel[]> {
  const result = await this.empresasService.getAll();
  if (result.success) {
    return result.data as EmpresasModel[];
  }
  return [];
 }
 findIndexById(id: string): number {
  let index = -1;
  for (let i = 0; i < this.empresaList.length; i++) {
      if (this.empresaList[i].uid === id) {
          index = i;
          break;
      }
  }
  return index;
}

}
