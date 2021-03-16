import { ProdutosModel } from './produtosModel';
import { BaseModel } from "./baseModel"
import { PedidosModel } from "./pedidosModel"

export class ItensPedidoModel extends BaseModel {
    
    qtd_produto?: number
    valor_unitario?: number
    valor_total?: number
    pedido?: PedidosModel
    produto?: ProdutosModel
}