import { ProdutosModel } from './produtosModel';
import { EmpresasModel } from 'src/app/models/empresasModel';
import { BaseModel } from "./baseModel";

export class ProdutosEmpresasModel extends BaseModel {    
    
    produto?: ProdutosModel
    empresa?: EmpresasModel
    valor?: number
    estoque?: number
    estoque05?: number
    estoque08?: number
    estoque14?: number
    estoque23?: number
    
}