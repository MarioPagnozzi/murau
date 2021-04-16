import { statusPedido } from "../enum/statusPedido";
import { BaseModel } from "./baseModel";
import { ClienteModel } from "./clienteModel";
import { EmpresasModel } from "./empresasModel";
import { HistoricoPedidoModel } from "./historicoPedidoModel";
import { ItensPedidoModel } from "./itensPedidoModel";
import { VendedoresModel } from "./vendedoresModel";

export class PedidosModel extends BaseModel {
    
    num_pedido?: string
    valor_pedido?: number
    status_pedido?: statusPedido
    previsao_entrega?: number
    vendedor: VendedoresModel = new VendedoresModel()
    cliente: ClienteModel = new ClienteModel()
    empresa: EmpresasModel = new EmpresasModel()
    itens: ItensPedidoModel[] = []
    historico: HistoricoPedidoModel[] = []
}