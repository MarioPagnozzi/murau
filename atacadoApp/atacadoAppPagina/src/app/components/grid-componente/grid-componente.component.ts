import { Component, Input, OnInit } from '@angular/core';

interface IColuna {
  label: string,
  tamanho: string
}
interface IIndice {
  indiceColuna: number
}
@Component({
  selector: 'app-grid-componente',
  templateUrl: './grid-componente.component.html',
  styleUrls: ['./grid-componente.component.scss']
})
export class GridComponenteComponent implements OnInit {

  @Input()
  set modelList(modelList: any[]) {
    this._modelList =  modelList;
  }
  get modelList() { return this._modelList}
  private _modelList: any[] = [];
  
  isRoot: boolean = false;
  @Input() tabela: string = "";
  @Input() colunaNome: IColuna[] = [];
  @Input() indice: IIndice[] = [];

  

  constructor() { }

  ngOnInit(): void {
  }

}
