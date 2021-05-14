import { Request } from 'express';
import { getRepository, Repository } from "typeorm";
import { Promocao } from "../entity/Promocao";
import { BaseController } from "./BaseController";

export class PromocaoController extends BaseController<Promocao> {
    private _repPromocao: Repository<Promocao> = getRepository(Promocao);

    constructor() {
        super(Promocao);
    }
    async save(request: Request) {
        let promocoes = request.body

        return this._repPromocao.save(promocoes);
    }
}