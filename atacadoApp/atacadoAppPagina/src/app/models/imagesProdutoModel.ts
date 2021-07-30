import { BaseModel } from "./baseModel"
import { ProdutosModel } from "./produtosModel"

export class ImagesProdutoModel extends BaseModel {
    caminho: string = "./../../assets/images/img_nao_disp.jpg"
    produto?: ProdutosModel
}