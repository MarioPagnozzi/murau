import { PedidosModel } from 'src/app/models/pedidosModel';
import { BaseModel } from "./baseModel"
import { EmpresasModel } from "./empresasModel"
import { ImagesProdutoModel } from './imagesProdutoModel';

export class ProdutosModel extends BaseModel {
    nome?: string
    descricao?: string
    referencia?: string
    codigo?: string    
    tamanho?: string
    cor?: string
    estoque?: number
    preco?: number
    produtosEmpresas?: EmpresasModel[]
    imagens?: ImagesProdutoModel[]
    pedidos?: PedidosModel[]
}