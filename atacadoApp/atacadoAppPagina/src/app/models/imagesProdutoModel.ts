import { BaseModel } from "./baseModel"
import { ProdutosModel } from "./produtosModel"

export class ImagesProdutoModel extends BaseModel {
    caminho?: string
    produto?: ProdutosModel
}