import { Operadoras } from "../enum/operadoras";
import { BaseModel } from "./baseModel";
import { ClienteModel } from "./clienteModel";

export class ContatosModel extends BaseModel {
    ddd?: string
    numero?: string
    operadoras?: Operadoras
    cliente?: ClienteModel
   
}