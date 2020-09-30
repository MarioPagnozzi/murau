import { Empresas } from './../entity/Empresas';
import { BaseController } from './BaseController';
export class EmpresasController extends BaseController<Empresas> {
    constructor () {
        super(Empresas);
    }
}