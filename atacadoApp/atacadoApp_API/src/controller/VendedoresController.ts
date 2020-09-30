import { Vendedores } from './../entity/Vendedores';
import { BaseController } from "./BaseController";

export class VendedoresController extends BaseController<Vendedores> {
    constructor(){
        super(Vendedores);
    }
}