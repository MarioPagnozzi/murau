import { Request } from 'express';
import { getRepository, Like, Repository } from 'typeorm';
import { Produtos } from './../entity/Produtos';
import { BaseController } from "./BaseController";

export class HomeController extends BaseController<Produtos> {
    private _repProdutos: Repository<Produtos> = getRepository(Produtos);
    constructor() {
        super(Produtos);
    }
    async Pesquisa(request: Request) {
        return this._repProdutos.find({
            where: [
                [{codigo: request.params.valor},
                {nome: Like("%" + request.params.valor + "%")},
                {referencia: Like("%" + request.params.valor + "%")}], 
                {empresa: {codigo: request.params.empresa}}
                
            ]
        })
    }
}