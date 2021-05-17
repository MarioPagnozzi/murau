import { ICliente } from "./IClientes";
import { IInterface } from "./IInterface";
import { IPedidos } from "./IPedidos";
import { IProdutos } from "./IProdutos";
import { IVendedores } from "./IVendedores";

export interface IEmpresas extends IInterface {

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
    pedidos?: IPedidos[]
    produtosempresas?: IProdutos[]
    clientes?: ICliente[]
    vendedores?: IVendedores[]
}