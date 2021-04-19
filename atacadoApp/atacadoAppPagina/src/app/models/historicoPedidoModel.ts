import { BaseModel } from './baseModel';
import { PedidosModel } from './pedidosModel';
export class HistoricoPedidoModel extends BaseModel {
    cidade?: string
    data?: Date
    hora?: string
    situacao?: string
    pedido?: PedidosModel
}