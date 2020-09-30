import { Pedidos } from './../entity/Pedidos';
import { BaseController } from "./BaseController";

export class PedidosController extends BaseController<Pedidos> {
    constructor () {
        super(Pedidos);
    }
}