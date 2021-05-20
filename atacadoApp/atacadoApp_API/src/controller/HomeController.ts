import { Request } from 'express';
import { getRepository, Like, Repository } from 'typeorm';
import { Produtos } from './../entity/Produtos';
import { BaseController } from "./BaseController";

export class HomeController extends BaseController<Produtos> {
    private _repProdutos: Repository<Produtos> = getRepository(Produtos);
    constructor() {
        super(Produtos);
    }
    async all(request: Request) {
        return super.all(request, false);
    }
    async allDistinct(request: Request) {
        return this._repProdutos.createQueryBuilder("produtos")
                                .distinctOn(["produtos.nome"])
                                .distinct(true)
                                .getMany();
    }    
    async one(request: Request) {
        return super.one(request, false);
    }
    async filtro(request: Request) {

        let filtro = request.params.filtro;
        let valor = request.params.valor;
        
        if (filtro == "nome") {
            return this._repProdutos.createQueryBuilder("produtos")
                                     .distinctOn(["produtos.nome"])
                                    .distinct(true)
                                     .having("produtos.nome like :valor", {valor: '%' + valor + '%'})
                                     .cache(false)
                                    .getMany();
        }
        
        if (filtro == "descricao") {
            return this._repProdutos.find({where: {descricao: Like("%" + valor + "%")}})
        }

        if (filtro == "referencia") {
            return this._repProdutos.findOne({where: {referencia: valor}})
        }

        if (filtro == "codigo") {
            return this._repProdutos.findOne({where: {codigo: valor}})
        }

        if (filtro == "tamanho") {
            return this._repProdutos.find({where: { tamanho: valor}})
        }

        if (filtro == "cor") {
            return this._repProdutos.find({where: {cor: valor}})
        }

        if (filtro == "modelo") {
            return this._repProdutos.find({where: {
                nome: valor
            }})
        }
        
        return {status: 400, errors: "Parâmetros fornecidos não satisfazem a pesquisa."};
    }
} 