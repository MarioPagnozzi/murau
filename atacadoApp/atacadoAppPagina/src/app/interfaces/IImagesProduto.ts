import { IInterface } from "./IInterface";
import { IProdutos } from "./IProdutos";

export interface IImagesProduto extends IInterface {

    caminho: string
    produto?: IProdutos
}