import { IInterface } from "./IInterface";
import {ICliente} from "./IClientes";
import { IEmpresas } from "./IEmpresas";
import { IPedidos } from "./IPedidos";

export interface IVendedores extends IInterface {
    
    codigo?: number
    nome?: string
    endereco?: string
    numero?: string
    bairro?: string
    cidade?: string
    uf?: string
    contatos?: [{ddd?: string, numero?: string, operadoras?: string}]   
    pedidos?: IPedidos[]
    empresas?: IEmpresas[],
    cliente?: ICliente[]
}