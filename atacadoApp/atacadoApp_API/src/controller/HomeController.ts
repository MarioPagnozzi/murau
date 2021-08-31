import { Request } from 'express';
import { getManager, getRepository, Like, Repository } from 'typeorm';
import { Empresas } from '../entity/Empresas';
import { ImagensProduto } from '../entity/imagesProduto';
import { Produtos } from './../entity/Produtos';
import { BaseController } from "./BaseController";

export class HomeController extends BaseController<Produtos> {
    private _repProdutos: Repository<Produtos> = getRepository(Produtos);
    private _repEmpresa: Repository<Empresas> = getRepository(Empresas);
    private _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
    constructor() {
        super(Produtos);
    }
    async all(request: Request) {
       
        let produtos = await this._repProdutos.find()
        let _produtos = produtos;
        return  _produtos; //.filter((prod, i, produtos) => produtos.findIndex(p => p.nome === prod.nome) === i );
    }
    async allDistinct(request: Request) {
        return this._repProdutos.createQueryBuilder("produtos")
                                            .leftJoinAndSelect("produtos.imagens","imagens").addSelect("imagens.caminho")
                                            .leftJoinAndSelect("produtos.produtosEmpresas", "prodemp").addSelect(["prodemp.valor","prodemp.estoque"])
                                            .leftJoinAndSelect("prodemp.empresa","emp").addSelect(["emp.codigo","emp.nome_fantasia"])
                                            .distinctOn(["produtos.nome"])
                                            .distinct(true)
                                            .getMany();
      
       
        
    }    
    async one(request: Request) {
        let produto = await this._repProdutos.findOne({where: {uid: request.params.id}});
        let prod: any = {...produto};
        prod.imagens = await produto.imagens;
        return prod;
      
    }
    async filtro(request: Request) {

        let filtro = request.params.filtro;
        let valor = request.params.valor;
        
        if (filtro == "nome") {
             return this._repProdutos.find({where: {nome: Like("%" + valor + "%")}});
          
        }   
        
        if (filtro == "descricao") {
            return this._repProdutos.find({where: {descricao: Like("%" + valor + "%")}});
       
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

        if (filtro === "cidade") {
            return this._repEmpresa.find({where: {cidade: valor, ativo: true, excluido: false}});
            
          
        }

        if (filtro === "endereco") {
            return this._repEmpresa.find({where: {endereco: valor, ativo: true, excluido: false}})

        }

        if (filtro === "empresas") {
            return this._repEmpresa.find({ where: {ativo: true, excluido: false}})
        }

        if (filtro === "empresaById") {
            return this._repEmpresa.findOne({where: {uid: valor}});
        }

        if (filtro === "imagens") {
            return this._repImagensProduto.find({where: {produto: [{uid: valor}]}})
        }

        if (filtro === "tamanhos") {
            const tamanhos = await this._repProdutos.find({
                select: ["tamanho"],
                where: {ativo: true, excluido: false, referencia: valor}
            });
            return tamanhos.filter((prod, i, produtos) => produtos.findIndex(p => p.tamanho === prod.tamanho) === i);
        }
        return {status: 400, errors: "Parâmetros fornecidos não satisfazem a pesquisa."};
    }
} 

function getManger() {
    throw new Error('Function not implemented.');
}
