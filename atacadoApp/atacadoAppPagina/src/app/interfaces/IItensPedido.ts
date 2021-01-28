import { IInterface } from "./IInterface";
import { IPedidos } from "./IPedidos";
import { IProdutos } from "./IProdutos";

export interface IItensPedidos extends IInterface {

    qtd_produto?: number
    valor_unitario?: number
    valor_total?: number
    pedido?: IPedidos
    produto?: IProdutos
}