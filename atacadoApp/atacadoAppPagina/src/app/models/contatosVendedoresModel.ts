import { Operadoras } from "../enum/operadoras";
import { BaseModel } from "./baseModel";
import { VendedoresModel } from "./vendedoresModel";

export class ContatosVendedoresModel extends BaseModel {
    ddd?: string
    numero?: string
    operadoras?: Operadoras
    vendedor?: VendedoresModel
   
}