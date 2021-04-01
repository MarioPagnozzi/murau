import { PedidosModel } from 'src/app/models/pedidosModel';
import { BaseModel } from "./baseModel"
import { ImagesProdutoModel } from './imagesProdutoModel';
import { ProdutosEmpresasModel } from './produtosEmpresasModel';

export class ProdutosModel extends BaseModel {
    nome?: string
    descricao?: string
    referencia?: string
    codigo?: string    
    tamanho?: string
    cor?: string
    estoque?: number
    preco?: number
    produtosEmpresas?: ProdutosEmpresasModel[]
    imagens?: ImagesProdutoModel[]
    pedidos?: PedidosModel[]
}