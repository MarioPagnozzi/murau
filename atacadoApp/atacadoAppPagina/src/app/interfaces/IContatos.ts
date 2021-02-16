import { Operadoras } from "../enum/operadoras";
import { IInterface } from "./IInterface";

export interface IContatos extends IInterface {
    ddd?: string
    numero?: string
    operadoras?: Operadoras
}