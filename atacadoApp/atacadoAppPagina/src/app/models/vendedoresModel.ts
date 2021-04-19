import { BaseModel } from "./baseModel"
import { ClienteModel } from "./clienteModel"
import { ContatosModel } from "./contatosModel"
import { EmpresasModel } from "./empresasModel"
import { PedidosModel } from "./pedidosModel"
import { UsuarioModel } from "./usuarioModel"

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
    usuario?: UsuarioModel
    cep?: string
    complemento?: string
    email?: string
}