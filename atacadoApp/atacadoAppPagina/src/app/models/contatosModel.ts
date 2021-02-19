import { Operadoras } from "../enum/operadoras";
import { BaseModel } from "./baseModel";

export class ContatosModel extends BaseModel {
    ddd?: string
    numero?: string
    operadoras?: Operadoras 
}