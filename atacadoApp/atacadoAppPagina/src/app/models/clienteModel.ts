import { EmpresasModel } from './empresasModel';
import { PedidosModel } from './pedidosModel';
import { VendedoresModel } from './vendedoresModel';
import { BaseStatus } from "../enum/status";
import { IEmpresas } from "../interfaces/IEmpresas";
import { IPedidos } from "../interfaces/IPedidos";
import { IVendedores } from "../interfaces/IVendedores";
import { BaseModel } from "./baseModel";
import { ContatosModel } from "./contatosModel";


export class ClienteModel extends BaseModel {
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
   contatos?: ContatosModel[]
   vendedor?: VendedoresModel
   empresa?: EmpresasModel
   pedidos?: PedidosModel[]
}