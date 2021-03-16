import { BaseModel } from "./baseModel"
import { ClienteModel } from "./clienteModel"
import { ContatosModel } from "./contatosModel"
import { EmpresasModel } from "./empresasModel"
import { PedidosModel } from "./pedidosModel"

export class VendedoresModel extends BaseModel {
    codigo?: number
    nome?: string
    endereco?: string
    numero?: string
    bairro?: string
    cidade?: string
    uf?: string
    contatos?: ContatosModel[]
    pedidos?: PedidosModel[]
    empresas?: EmpresasModel[]
    cliente?: ClienteModel[]
}