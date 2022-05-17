import { PedidosModel } from 'src/app/models/pedidosModel';
import { BaseModel } from "./baseModel"
import { EmpresasModel } from './empresasModel';
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
    empresas: EmpresasModel[] = []
    produtosEmpresas?: ProdutosEmpresasModel[]
    imagens: ImagesProdutoModel[] = []
    pedidos: PedidosModel[] = []
    total_estoque01: number = 0
    total_estoque05: number = 0
    total_estoque08: number = 0
    total_estoque14: number = 0
    total_estoque23: number = 0
}