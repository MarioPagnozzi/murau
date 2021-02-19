import { BaseStatus } from './../enum/status';
import { IContatos } from './IContatos';
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
   complemento?: string
   numero?: string
   bairro?: string
   cidade?: string
   uf?: string
   email?: string
   statusCliente?: BaseStatus
   contatos?: IContatos[]
   vendedor?: IVendedores
   empresa?: IEmpresas
   pedidos?: IPedidos[]
}