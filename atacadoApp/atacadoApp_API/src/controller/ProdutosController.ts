
import { Request, Response, NextFunction } from 'express';
import { getRepository, Like, Repository, In } from 'typeorm';
import { Produtos } from './../entity/Produtos';
import { BaseController } from "./BaseController";
import { ImagensProduto } from '../entity/imagesProduto';
import { ProdutosEmpresas } from '../entity/ProdutosEmpresas';
import { Empresas } from '../entity/Empresas';
export class ProdutosController extends BaseController<Produtos> {
    private _repProdutos: Repository<Produtos> = getRepository(Produtos);
    constructor () {
        super(Produtos);
    }
    async save(request: Request) {
        
        let _produto = <Produtos>request.body;

        if (!this.func.Permissao(request,"Produtos", _produto.uid ? "A" : "I")) {
            return {status: 400, errors: ["Vocês não tem permissão para alterar ou inserir registros"]}
        }
        
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
    async produtosDia(request: Request) {
        if (!this.func.Permissao(request,"Produtos", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        const dataAtual = new Date();
        //dataAtual.setDate(dataAtual.getDate() - 1);
        return this._repProdutos.createQueryBuilder("produtos")
                                .where("date_format(produtos.data_inclusao,'%d/%m/%Y') = date_format(:data,'%d/%m/%Y')", {data: dataAtual.toISOString()})
                                .getMany();
    }
    async filtro(request: Request) {

        if (!this.func.Permissao(request,"Produtos", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }

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
        if (!this.func.Permissao(request, "Produtos", "I")) {
            return {status: 400, errors: ["Você não tem permissão para inserir novos produtos"]}
        }
        let cdProduto = request.params.codigo;
        try {           
            let _token = await this.func.geraToken();
            let cadastrado = await this.func.insereNovoProduto(cdProduto, _token);
            if (cadastrado) {
                return this._repProdutos.findOne({where: {codigo: cdProduto}})
            }
        }
        catch (err) {
            return {status: err.status, errors: err.errors}
        }
        return {status: 400, errors: ["Produto não encontrado para este código"]}
    }
    async uploadFotos(request: Request, response: Response, next: NextFunction) {
        
        if (!this.func.Permissao(request, "Produtos", "A") || !this.func.Permissao(request, "Produtos", "I")) {
            return {status: 400, errors: ["Você não tem permissão para carregar novas fotos"]}
        }
        const fs = require('fs');
        const multer = require('multer');
        var sharp = require('sharp');
        
        let dir = "public/uploads/fotos";

        let _dir = dir.split("/");
        let ndir = "./";

        for (let el in _dir) {
            ndir = ndir + _dir[el] + "/";
            if (!fs.existsSync(ndir)) {
                fs.mkdirSync(ndir, {recursive: true});
            }
        }

       let dirname = ndir;
       request.body.dirname = dirname;
       let upload = require("./../middleware/upload");

       await upload(request, response, function (err) {
       
            if (request.fileValidationError) {
                response.status(401).send({message: "Erro na validação do Arquivo"});
                return;
            }
            else if (err instanceof multer.MulterError) {
                response.status(401).send({message: "Erro na instancia do aquivo ou aplicativo"});
                return;
                
            }
            else if (!request.files) {
                response.status(404).send({message: "Arquivos não encontrados"});
                return;
            }
            else if (err) {
                response.status(500).send({message: "Erro geral do servidor"});
                return;
                
            }
            else {
                try {
                    let directory = dirname + request.body.cdproduto;
                    console.log(directory);
                    if(!fs.existsSync(directory)) {
                        fs.mkdirSync(directory);
                    }
                    let files = JSON.parse(JSON.stringify(request.files));
                    console.log(JSON.parse(JSON.stringify(request.files)));
                    
                    
                    for (let el in files) {
                        console.log(directory);
                        let caminho = directory + "/" + Date.now().toString() + ".png" ;
                        sharp(files[el].path).resize(350,600).toFormat('png')
                                                        .png({quality: 80}).toFile(caminho)
                        .then(async () => {
                            fs.unlinkSync(files[el].path);
                            let _repImagemProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
                            let _repProdutos: Repository<Produtos> = getRepository(Produtos);
                            let imagesProd = new ImagensProduto();

                            let produto = await _repProdutos.findOne({where: {codigo: request.body.cdproduto}});
                            
                            imagesProd.produto = Promise.resolve(produto);
                            imagesProd.caminho = caminho;

                            _repImagemProduto.save(imagesProd);

                        });
                    }
                    response.status(200).send({message: "Arquivos carregados com sucesso"});
                    return;
                }
                catch (err) {
                    response.status(401).send({message: "Erro ao carregar os arquivos"});
                    return;
                }
            }
        })
    }
    async vinculaEmpresas(request: Request) {

        if (!this.func.Permissao(request, "Produtos", "A") || !this.func.Permissao(request, "Produtos", "I")) {
            return {status: 400, errors: ["Você não tem permissão para vincular empresas ao produto"]}
        }
        let {produto, empresas} = request.body;

        super.isRequired(produto, "Produto deve ser informado");
        super.isRequired(empresas, "É preciso informar uma ou mais empresas");

        let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
        let _repEmpresa: Repository<Empresas> =  getRepository(Empresas);

        let _produto = await this._repProdutos.findOne(produto);
        let _empresas = await _repEmpresa.find({where: {codigo: In([empresas])}});

        let prodEmpresas: ProdutosEmpresas = new ProdutosEmpresas();

        _empresas.forEach((emp) => {
            prodEmpresas.produto = Promise.resolve(_produto);
            prodEmpresas.empresa = Promise.resolve(emp);
            _repProdutosEmpresas.save(prodEmpresas);
        });

        return _empresas;
    }
}