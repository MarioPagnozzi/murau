import { IInterface } from "./IInterface";
import { IPedidos } from "./IPedidos";

export interface IHistoricoPedidos extends IInterface {

    cidade?: string
    data?: Date
    hora?: string
    situacao?: string
    pedido?: IPedidos
}