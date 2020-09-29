import { Produtos } from './../entity/Produtos';
import { BaseController } from "./BaseController";

export class HomeController extends BaseController<Produtos> {
    constructor() {
        super(Produtos);
    }
}