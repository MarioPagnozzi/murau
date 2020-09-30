import { Produtos } from './../entity/Produtos';
import { BaseController } from "./BaseController";

export class ProdutosController extends BaseController<Produtos> {
    constructor () {
        super(Produtos);
    }
}