import { Request } from 'express';
import { getManager, getRepository, Like, Repository } from 'typeorm';
import { Empresas } from '../entity/Empresas';
import { ImagensProduto } from '../entity/imagesProduto';
import { Produtos } from './../entity/Produtos';
import { BaseController } from "./BaseController";

export class HomeController extends BaseController<Produtos> {
    private _repProdutos: Repository<Produtos> = getRepository(Produtos);
    private _repEmpresa: Repository<Empresas> = getRepository(Empresas)
    constructor() {
        super(Produtos);
    }
    async all(request: Request) {
        let _repProdutosRelations: Repository<Produtos> = getRepository(Produtos);
        return _repProdutosRelations.find({relations: ["imagens","empresas"]})
    }
    async allDistinct(request: Request) {
        let produtos = await this._repProdutos.createQueryBuilder("produtos")
                                            .leftJoinAndSelect("produtos.imagens","imagens").addSelect("imagens.caminho")
                                            .leftJoinAndSelect("produtos.produtosEmpresas", "prodemp").addSelect(["prodemp.valor","prodemp.estoque"])
                                            .leftJoinAndSelect("prodemp.empresa","emp").addSelect(["emp.codigo","emp.nome_fantasia"])
                                            .distinctOn(["produtos.nome"])
                                            .distinct(true)
                                            .getMany();
        console.log(produtos)
        
        return produtos;
        
    }    
    async one(request: Request) {
        const produto = await this._repProdutos.findOne({relations: ["imagens","empresas","produtosEmpresas"],
                                            where: {uid: request.params.id}});
        let _produto: any = {...produto};

        delete _produto.imagens;
        delete _produto.empresas;
        delete _produto.produtosEmpresas;

        _produto.imagens = await produto.imagens;
        _produto.empresas = await produto.empresas;
        _produto.produtosEmpresas = await produto.produtosEmpresas;
       
        return _produto;
    }
    async filtro(request: Request) {

        let filtro = request.params.filtro;
        let valor = request.params.valor;
        
        if (filtro == "nome") {
            return await this._repProdutos.createQueryBuilder("produtos")
                                    .leftJoinAndSelect("produtos.imagens","imagens").addSelect("imagens.caminho")
                                    .leftJoinAndSelect("produtos.produtosEmpresas", "prodemp").addSelect(["prodemp.valor","prodemp.estoque"])
                                    .leftJoinAndSelect("prodemp.empresa","emp").addSelect(["emp.codigo","emp.nome_fantasia"])
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
            return this._repProdutos.find({relations: ["imagens","produtosEmpresas"], where: {
                nome: valor
            }})
        }

        if (filtro === "cidade") {
            return this._repEmpresa.find({where: {cidade: valor, ativo: true, excluido: false}});
        }

        if (filtro === "endereco") {
            return this._repEmpresa.find({where: {endereco: valor, ativo: true, excluido: false}})
        }

        if (filtro === "empresas") {
            return this._repEmpresa.find({where: {ativo: true, excluido: false}})
        }

        if (filtro === "empresaById") {
            return this._repEmpresa.findOne({where: {uid: valor}});
        }

        return {status: 400, errors: "Parâmetros fornecidos não satisfazem a pesquisa."};
    }
} 

function getManger() {
    throw new Error('Function not implemented.');
}
