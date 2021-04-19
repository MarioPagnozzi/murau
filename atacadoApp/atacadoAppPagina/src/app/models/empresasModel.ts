import { ClienteModel } from 'src/app/models/clienteModel';
import { BaseModel } from "./baseModel";
import { PedidosModel } from "./pedidosModel";
import { ProdutosModel } from './produtosModel';
import { VendedoresModel } from './vendedoresModel';

export class EmpresasModel extends BaseModel {
    
    codigo?: number
    razao_social?: string
    nome_fantasia?: string
    cnpj?: string
    cep?: string
    endereco?: string
    numero?: string
    bairro?: string
    cidade?: string
    uf?: string
    pedidos?: PedidosModel[]
    produtosempresas?: ProdutosModel[]
    clientes?: ClienteModel[]
    vendedores?: VendedoresModel[]
}