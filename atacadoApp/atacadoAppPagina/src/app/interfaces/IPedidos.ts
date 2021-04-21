import { IItensPedidos } from './IItensPedido';
import { statusPedido } from "../enum/statusPedido";
import { ICliente } from "./IClientes";
import { IEmpresas } from "./IEmpresas";
import { IInterface } from "./IInterface";
import { IVendedores } from "./IVendedores";
import { IHistoricoPedidos } from './IHistoricoPedidos';

export interface IPedidos extends IInterface {

    num_pedido?: string
    valor_pedido: number
    status_pedido?: statusPedido
    vendedor?: IVendedores
    cliente?: ICliente
    empresa?: IEmpresas
    itens?: IItensPedidos[]
    historico?: IHistoricoPedidos[]
}