import { Configuracoes } from './../entity/Configuracoes';
import { Request } from 'express';
import { getRepository, Like, Repository } from 'typeorm';
import { Produtos } from './../entity/Produtos';
import { BaseController } from "./BaseController";
import { Empresas } from '../entity/Empresas';
import { ProdutosEmpresas } from '../entity/ProdutosEmpresas';

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
        let codigo = request.params.codigo;
        require('events').EventEmitter.defaultMaxListeners = Infinity;
        let https = require("follow-redirects").https;
        https.globalAgent.maxSockets = Infinity;
        const agent = new https.Agent({keepAlive: true, maxSockets: Infinity});

        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);

        let _hostname_totvs = await _repParametros.findOne({nome_parametro: "host_api_totvs"});
        let _porta_totvs = await _repParametros.findOne({nome_parametro: "porta_api_totvs"});
        let _restapi_totvs = await _repParametros.findOne({nome_parametro: "rest_api_totvs"});
        let _url = _restapi_totvs.valor + "/produto/classificacaoproduto";

        let api = require("./../middleware/cron_job");

        let _token = await api.geraToken();

        let options = {
            "method": "POST",
            "hostname": _hostname_totvs.valor,
            "path": _url,
            "port": _porta_totvs.valor,
            "headers": {
                "Authorization": "Bearer " + _token,
                "Content-Type": "application/json"
            },
            "maxRedirects": 100,
            "agent": agent,
            "pool": {
                "maxSockets": 100
            }
        }

        let obj = {
            "cdProduto": codigo
        }

        let requestProduto = api.apiRequest(options, obj, 6000);
        let body = await requestProduto;

        if (body) {
            let classificacoes = JSON.parse(body);
    
            for (let el in classificacoes) {
    
                let {cdTpClassificacao, cdClassificacao, cdBarra, cdProduto, dsProduto, dsCor, dsTamanho, cdNivel} = classificacoes[el];
    
                if (cdTpClassificacao == 4 && cdClassificacao == "003") {

                    let _produto: Produtos = new Produtos(); 
                    _produto.codigo = cdProduto;
                    _produto.cor = dsCor;
                    _produto.tamanho = dsTamanho;
        
                    _produto.nome = dsProduto;
                    
                    _produto.descricao = dsProduto;
        
                    _produto.estoque = 0;
                    _produto.preco = 0;
                    _produto.referencia = cdNivel;
                
                    this._repProdutos.save(_produto).then(async (prod) => {
                        let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
                        let empresas = await _repEmpresas.find({where: {excluido: false, ativo: true}});
                        empresas.forEach(async (empresa) => {
                            let produtoEmpresa: ProdutosEmpresas = new ProdutosEmpresas();
                            produtoEmpresa.produto = prod;
                            produtoEmpresa.empresa = empresa;

                            let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
                            _repProdutosEmpresas.save(produtoEmpresa).then(() => {
                               console.log("Produto cadastrado na empresa " + empresa.nome_fantasia);
                            }).catch((error) => {
                                console.error("Erro ao cadastrar Produto na empresa " + empresa.nome_fantasia);
                            });
                        });
                        console.log("Novo produto inserido " + cdProduto);
                    }).catch(async (error) => {
                        console.error("Erro ao inserir novo produto " + error);
                    });
                    await api.sleep(3000);
                    api.atualizaPrecoProduto(cdBarra,_token);
                    await api.sleep(3000);
                    api.atualizaEstoqueProduto(cdBarra, _token);
                    await api.sleep(3000);
                    api.atualizaImagemProduto(cdProduto);

                    return _produto;
                }
            }
        }
        return {status: 400, errors: "Produto não encontrado para este código"}
    }
}