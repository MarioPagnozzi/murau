import { Request } from 'express';
import { getRepository, Repository } from "typeorm";
import { Tabelas } from '../entity/Tabelas';
import { BaseController } from "./BaseController";

export class TabelasController extends BaseController<Tabelas> {
    private _repPromocao: Repository<Tabelas> = getRepository(Tabelas);

    constructor() {
        super(Tabelas);
    }
    async save(request: Request) {
        let tabelas = request.body

        return this._repPromocao.save(tabelas);
    }
}