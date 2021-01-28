import { IEmpresas } from "./IEmpresas";
import { IImagesProduto } from "./IImagesProduto";
import { IInterface } from "./IInterface";
import { IPedidos } from "./IPedidos";

export interface IProdutos extends IInterface {

    nome?: string
    descricao?: string
    referencia?: string
    codigo?: string    
    tamanho?: string
    cor?: string
    estoque?: number
    preco?: number
    produtosEmpresas?: IEmpresas[]
    imagens?: IImagesProduto[]
    pedidos?: IPedidos[]

}