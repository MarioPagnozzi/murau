import { Grupos } from './../entity/Grupos';
import { BaseController } from "./BaseController";

export class GrupoController extends BaseController<Grupos> {
    constructor () {
        super(Grupos);
    }
}