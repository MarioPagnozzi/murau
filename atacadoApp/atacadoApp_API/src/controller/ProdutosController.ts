import { Configuracoes } from './../entity/Configuracoes';
import { Request } from 'express';
import { getRepository, Like, Repository } from 'typeorm';
import { Produtos } from './../entity/Produtos';
import { BaseController } from "./BaseController";
import {functions} from "./../configuracao/functions/globalFunctions";
export class ProdutosController extends BaseController<Produtos> {
    private _repProdutos: Repository<Produtos> = getRepository(Produtos);
    constructor () {
        super(Produtos);
    }
    async save(request: Request) {
        let _produto = <Produtos>request.body;
        
        super.isRequired(_produto.nome, "'Nome' do produto deve ser informado");
        super.isRequired(_produto.descricao, "'Descrição' do produto deve ser informada");
        super.hasMinLen(_produto.descricao, 100,"A 'Descrição' deve conter no mínimo 100 caracteres");
        super.isRequired(_produto.referencia,"A 'Referência' deve ser informada");
        super.isRequired(_produto.codigo, "'Código' do produto deve ser informado");
        super.isRequired(_produto.tamanho, "'Tamanho' do produto deve ser informado");
        super.isRequired(_produto.cor, "A 'Cor' do produto deve ser informada");
        
        let codigo = await this._repProdutos.findOne({codigo: _produto.codigo});
        if (codigo) {
            let sugestao = await this._repProdutos.createQueryBuilder("produtos")
                                                  .select("IFNULL(max(cast(prod.codigo as unsigned INTEGER)),0)","maxCodigo")
                                                  .from(Produtos, "prod")
                                                  .getRawOne();
            return {stauts: 400, errors: "Já existe um produto cadastrado com este código. Sugestão: " + sugestao};
        }
        let referencia = await this._repProdutos.findOne({referencia: _produto.referencia});
        if (referencia) {
            return {status: 400, errors: "Já existe um produto cadastrado com esta referência."}
        }

        return super.save(_produto);
    }
    async filtro(request: Request) {
        let filtro = request.params.filtro;
        let valor = request.params.valor;
        
        if (filtro == "nome") {
            return this._repProdutos.find({where: {nome: Like("%" + valor + "%")}});
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
        
        return {status: 400, errors: "Parâmetros fornecidos não satisfazem a pesquisa."};
    }
    async insereNovo(request: Request) {

        let cdProduto = request.params.codigo;
        try {
            let fun = new functions();
            let _token = await fun.geraToken();
            let cadastrado = await fun.insereNovoProduto(cdProduto, _token);
            if (cadastrado) {
                return this._repProdutos.findOne({where: {codigo: cdProduto}})
            }
        }
        catch (err) {
            return {status: err.status, errors: err.errors}
        }
        
      
        return {status: 400, errors: "Produto não encontrado para este código"}
    }
}