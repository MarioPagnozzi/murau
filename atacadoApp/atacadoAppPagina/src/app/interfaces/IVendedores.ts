import { IInterface } from "./IInterface";
import {ICliente} from "./IClientes";
import { IEmpresas } from "./IEmpresas";
import { IPedidos } from "./IPedidos";
import { IContatos } from "./IContatos";

export interface IVendedores extends IInterface {
    
    codigo?: number
    nome?: string
    endereco?: string
    numero?: string
    bairro?: string
    cidade?: string
    uf?: string
    contatos?: IContatos[]
    pedidos?: IPedidos[]
    empresas?: IEmpresas[],
    cliente?: ICliente[]
}