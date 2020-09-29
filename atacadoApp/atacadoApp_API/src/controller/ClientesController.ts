import { Clientes } from './../entity/Clientes';
import { BaseController } from "./BaseController";

export class ClientesController extends BaseController<Clientes> {
    constructor(){
        super(Clientes);
    }
}