import { BaseStatus } from './../enum/status';
import { IEmpresas } from './IEmpresas';
import { IInterface } from "./IInterface";
import { IPedidos } from './IPedidos';
import { IVendedores } from './IVendedores';

export interface ICliente extends IInterface {

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
   email?: string
   statusCliente?: BaseStatus
   contatos?: [{ddd?: string, numero?: string, operadoras?: string}]
   vendedor?: IVendedores
   empresa?: IEmpresas
   pedidos?: IPedidos[]
}