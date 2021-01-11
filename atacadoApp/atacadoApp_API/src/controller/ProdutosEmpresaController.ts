
import { ProdutosEmpresas } from '../entity/ProdutosEmpresas';
import { BaseController } from "./BaseController";

export class ProdutosEmpresaController extends BaseController<ProdutosEmpresas> {
    
    constructor() {
        super(ProdutosEmpresas);
    }
    
}