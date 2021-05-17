import { ClienteModel } from 'src/app/models/clienteModel';
import { BaseModel } from "./baseModel";
import { PedidosModel } from "./pedidosModel";
import { ProdutosEmpresasModel } from './produtosEmpresasModel';
import { VendedoresModel } from './vendedoresModel';

export class EmpresasModel extends BaseModel {
    
    codigo?: number
    razao_social?: string
    nome_fantasia?: string
    cnpj?: string
    ie?: string
    cep?: string
    endereco?: string
    numero?: string
    bairro?: string
    cidade?: string
    complemento?: string
    uf?: string
    telefone?: string
    pedidos?: PedidosModel[]
    produtosempresas?: ProdutosEmpresasModel[]
    clientes?: ClienteModel[]
    vendedores?: VendedoresModel[]
}