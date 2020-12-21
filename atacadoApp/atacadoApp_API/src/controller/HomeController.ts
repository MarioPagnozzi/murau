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
        return this._repProdutos.createQueryBuilder("produtos").addSelect("produtos.*")
                                .innerJoin("produtos.produtosEmpresas", "produtosEmpresas").addSelect([
                                    "produtosEmpresas.valor",
                                    "produtosEmpresas.estoque"
                                ])
                                .innerJoin("produtosEmpresas.empresa", "empresa").addSelect([
                                    "empresa.codigo",
                                    "empresa.razao_social",
                                    "empresa.nome_fantasia",
                                    "empresa.cnpj",
                                    "empresa.cep",
                                    "empresa.endereco",
                                    "empresa.numero",
                                    "empresa.bairro",
                                    "empresa.cidade",
                                    "empresa.uf"
                                ])
                                .where("(empresa.codigo = :codigo)", {codigo: request.params.empresa})
                                .andWhere("(produtos.codigo = :codprod", {codprod: request.params.valor})
                                .orWhere("produtos.referencia like (:referencia)", {referencia: '%' + request.params.valor + '%'})
                                .orWhere("produtos.nome like (:nome))", {nome: '%' + request.params.valor + '%'})
                                .getMany();
    }
} 