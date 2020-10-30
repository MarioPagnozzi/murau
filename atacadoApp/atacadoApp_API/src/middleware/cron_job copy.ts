import { Repository, getRepository, Not } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { Configuracoes } from '../entity/Configuracoes';
import { Produtos } from '../entity/Produtos';
import { Empresas } from '../entity/Empresas';
import { ProdutosEmpresas } from '../entity/ProdutosEmpresas';
import { ImagensProduto } from '../entity/imagesProduto';

export default async (req: Request, res: Response, next: NextFunction) => {

    //var https = require("https");
    var cron = require("node-schedule");
    var request = require("request");

    const customRequest = request.defaults({
        timeout: 30000,
        forever: true,
        time: true,
        agent: false,
        pool: {
            maxSockets: Infinity
        }
    });
    
   var job = await cron.scheduleJob('*/10 * * * *', async function() {
        
        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
        let _hostname_totvs = await _repParametros.findOne({nome_parametro: "host_api_totvs"});
        let _porta_totvs = await _repParametros.findOne({nome_parametro: "porta_api_totvs"});
        
        let _restapi_totvs = await _repParametros.findOne({nome_parametro: "rest_api_totvs"});
        
        let _token = await _repParametros.findOne({nome_parametro: "dtExpiracao"});
        let dtExpiracao = _token ? _token.valor : false;
        let dataAtual: Date = new Date();
        let dia = dtExpiracao ? +dtExpiracao.substring(0,2) : dataAtual.getDate();
        let mes = dtExpiracao ? +dtExpiracao.substring(3,5) - 1 : dataAtual.getMonth();
        let ano = dtExpiracao ? +dtExpiracao.substring(6,10) : dataAtual.getFullYear();
        let hora = dtExpiracao ? +dtExpiracao.substring(11,13) : dataAtual.getHours();
        let min = dtExpiracao ? +dtExpiracao.substring(14,16) : dataAtual.getMinutes();
        let seg = dtExpiracao ? +dtExpiracao.substring(17,19) : dataAtual.getSeconds();
        let _url = "";
        let options: any;
        let dataExpiracaoToken: Date = new Date(Date.UTC(ano, mes, dia, hora, min, seg));
        //Gera chave de autorização para api Totvs caso a atual não esteja válida ou não exista. - Inicio
        if (!dtExpiracao || dataAtual >= dataExpiracaoToken) {
            let _autorizacao_totvs = await _repParametros.findOne({nome_parametro: "autorizacao_api_totvs_token"});
            let _usuario_totvs = await _repParametros.findOne({nome_parametro: "usuario_api_totvs_token"});
            let _senha_totvs = await _repParametros.findOne({nome_parametro: "senha_api_totvs_token"});
            _url = "https://" + _hostname_totvs.valor + ":" + _porta_totvs.valor + _autorizacao_totvs.valor;


            options = {
                "method": "POST",
                "url": _url,
                "headers": {
                    "usuario": _usuario_totvs.valor,
                    "senha": _senha_totvs.valor
                }
            }
            try {
                await customRequest(options, async function(error, response) {
                        if (error) {   
                            throw new Error(error);
                        }
                        
                        if (response.statusCode == 200) {
                            let {cdToken, dtExpiracao} = JSON.parse(response.body);
                            let _param = await _repParametros.findOne({where:[
                                {nome_parametro: "cdToken"},
                                {nome_parametro: "dtExpiracao"}
                            ]});
                            if (_param) {
                                _param = await _repParametros.findOne({nome_parametro: "cdToken"});
                                _param.valor = cdToken;
                                _repParametros.save(_param);
            
                                _param = await _repParametros.findOne({nome_parametro: "dtExpiracao"});
                                _param.valor = dtExpiracao;
                                _repParametros.save(_param);
                            } else {
                                let parametros: Configuracoes = new Configuracoes();
                                parametros.nome_parametro = "cdToken";
                                parametros.valor = cdToken;
                                
                                _repParametros.save(parametros);
            
                                parametros = new Configuracoes();
                                parametros.nome_parametro = "dtExpiracao";
                                parametros.valor = dtExpiracao;
            
                                _repParametros.save(parametros);
                            }
                        }
                    });
            }catch(err) {
                console.error("Erro ao obter o token " + err);
            }
        }
        //Gera chave de autorização para api Totvs caso a atual não esteja válida ou não exista. - Fim        
        //Atualiza os produtos de acordo com api Totvs. - Inicio
        _url = "https://" + _hostname_totvs.valor + ":" + _porta_totvs.valor + _restapi_totvs.valor;
        _token = await _repParametros.findOne({nome_parametro: "cdToken"});
        let _take = 5000;
        let _skip = await _repParametros.findOne({nome_parametro: "skip_prod_api_totvs"});
        //Faz a busca dos produtos paginando a cada 5 mil registros - Inicio
        if (!_skip) {
            let _parametros: Configuracoes = new Configuracoes();
            _parametros.nome_parametro = "skip_prod_api_totvs";
            _parametros.valor = "0"; 
            _skip = new Configuracoes();
            _skip.valor = _parametros.valor;           
            _repParametros.save(_parametros);
        }
        
        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
        let _produtos = await _repProdutos.find({
            where: {ativo: true, excluido: false},
            order: {
                nome: "ASC",
                codigo: "ASC"
            },
            skip: +_skip.valor,
            take: _take
        });
        //Faz a busca dos produtos paginando a cada 5 mil registros - Fim
        
        _skip.valor = (String)(+_skip.valor + _take);
        _repParametros.save(_skip);
        //Atualiza o opnteiro inicial da pesquisa de registros - Fim

        let _body;
        if (_produtos.length > 0) {

            //Percorre o registro de produtos buscando o código e passando como parâmetro para a api - Inicio
            _produtos.forEach(async function(prod) {
                _body = {
                    "cdProduto": prod.codigo
                }
                //Requisição api para buscar a classificação dos produtos - Inicio
                options = {
                    "method": "POST",
                    "url": _url + "/produto/classificacaoproduto",
                    "headers": {
                        "Authorization": "Bearer " + _token.valor,
                        "Content-Type": "application/json"                 
                    },
                    body: JSON.stringify({"cdProduto": prod.codigo})
                }
                try {
                    await customRequest(options,async function(error, response) {
                            if (error) throw new Error(error);
                            
                            if (response.statusCode == 200) {
                                //atualiza apenas se o produtos for da classificação 4 e 003 - inicio
                                let classificacoes = JSON.parse(response.body);
                                //Percorre o retorno da api buscando pelas classificações 4 e 003 para atualizar preço e estoque - Inicio
                                for (let el in classificacoes) {                  
                                    let {cdTpClassificacao, cdClassificacao, cdBarra} = classificacoes[el];
                                    if ((cdTpClassificacao == 4 && cdClassificacao == "003") || (cdTpClassificacao == 56 && cdClassificacao == "001")) {
                                            let obj = {"produtos": [{"cdProduto": cdBarra}], "cdPreco": 2, "inPromocao": 0, "empresas": []};
                                            let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
                                            let empresas = await _repEmpresas.find();
                                            
                                            empresas.forEach((empresa) => {
                                                obj.empresas.push({
                                                    "cdEmpresa": empresa.codigo
                                                });
                                            });                            
                                            options = {
                                                "method": "POST",
                                                "url": _url + "/produto/precoproduto",
                                                "headers": {
                                                    "Authorization": "Bearer " + _token.valor,
                                                    "Content-Type": "application/json"                 
                                                },
                                                body: JSON.stringify(obj)
                                            }
                                            try {
                                                await customRequest(options, async function(error, response) {
                                                        if (error) throw new Error(error);
                        
                                                        let precos = JSON.parse(response.body);
                                                        if (response.statusCode == 200) {
                                                            for (let prec in precos.precos) {                                   
                                                                let {cdEmpresa, vlPreco} =  precos.precos[prec];                                   
                                                                let empresauid = await _repEmpresas.findOne({where: {codigo: cdEmpresa}}); 
                                                                
                                                                if (empresauid) {
                                                                    let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
                                                                    let produtosEmpresas = await _repProdutosEmpresas.findOne({where: {produto: prod, empresa: empresauid, valor: Not(vlPreco)}});
                            
                                                                    if (produtosEmpresas) {
                                                                        produtosEmpresas.valor = vlPreco;
                                                                        _repProdutosEmpresas.save(produtosEmpresas);    
                                                                    }
                                                                }
                                                            }
                                                        } 
                                                    });
                                            } catch (err) {
                                                console.error("Erro ao atualizar preços " + err);
                                            }
                                            
                                            let _obj = {
                                                "produtos":[
                                                    {
                                                        "cdProduto": cdBarra
                                                    }
                                                ],
                                                "cdSaldo": 1,
                                                "inEstoque": 1,
                                                "inPedidoVenda": 0,
                                                "empresas": []
                                            }
                                            empresas = await _repEmpresas.find();
                                            empresas.forEach((empresa) => {
                                                _obj.empresas.push({
                                                    "cdEmpresa": empresa.codigo
                                                });
                                            });
                                            options = {
                                                "method": "POST",
                                                "url": _url + "/produto/saldoproduto",
                                                "headers": {
                                                    "Authorization": "Bearer " + _token.valor,
                                                    "Content-Type": "application/json"                 
                                                },
                                                body: JSON.stringify(_obj)
                                            }
                                            try {
                                              await customRequest(options, async function(error, response) {
                                                        if (error) throw new Error(error);
                                                        
                                                        if (response.statusCode == 200) {
                                                            let estoques = JSON.parse(response.body);
                                                            for (let el in estoques.saldos) {
                                                                let { cdEmpresa, qtEstoque } = estoques.saldos[el];
                            
                                                                let empresauid = await _repEmpresas.findOne({where: {codigo: cdEmpresa}}); 
                                                            
                                                                if (empresauid) {
                                                                    let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
                                                                    let produtosEmpresas = await _repProdutosEmpresas.findOne({where: {produto: prod, empresa: empresauid, estoque: Not(qtEstoque)}});
                            
                                                                    if (produtosEmpresas) {
                                                                        produtosEmpresas.estoque = qtEstoque;
                                                                        _repProdutosEmpresas.save(produtosEmpresas);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    });            
                                            } catch (err) {
                                                console.error("Erro ao atualizar estoque " + err);
                                            }
                                    }
                                }
                            }
                            //Percorre o retorno da api buscando pelas classificações 4 e 003 para atualizar preço e estoque - Fim
                        });
                    //Requisição api para buscar a classificação dos produtos - Fim        
                    //Atualiza os produtos de acordo com api Totvs - Fim
                } catch (err) {
                    console.error( "Erro ao buscar a classificação do produto " + err);
                }
                
                
                //Atualiza dados do produto de acordo com o Vtex - Inicio
                options = {
                    "method": "GET",
                    "url": "https://lojamurau.vtexcommercestable.com.br/api/catalog_system/pvt/sku/stockkeepingunitbyid/" + prod.codigo,
                    "headers": {
                        "Content-Type": "application/json",
                        "accept": "application/json",
                        "x-vtex-api-appkey": "vtexappkey-lojamurau-WLQIMF",
                        "x-vtex-api-apptoken": "ZVWOWRDCPCPZQNECCDZMFYELGQHFIRXFUNRQIDNWIENXDWGBGGAOQTKARLHFKYUYEKECVNTYPCDBLGHKKFZBQJPADQZXVIMKKPTTREGSMBYNPJPKDXVEYSHUVDZFNWDG"
                    }
                }
                try {
                   await customRequest(options, async function(error, response, body) {
                            if (error) throw new Error(error);
        
                            if (response.statusCode == 200) {
        
                                let {ProductDescription, ImageUrl, Images} = JSON.parse(body);
                                let _prod = await _repProdutos.findOne({where: { codigo: prod.codigo}});
                                
                                if (ProductDescription) {
                                    if (_prod.descricao != ProductDescription) {
                                        _prod.descricao = ProductDescription;
                                        _repProdutos.save(_prod);
                                    }
                                }                            
                                
                                
                                    let _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
                                    let imagemProduto: ImagensProduto;
        
                                    let imagens = await _repImagensProduto.find({where: {produto: prod}});
        
                                    if (imagens.length > 0) {
                                       if (ImageUrl) {
                                            let imagem = await _repImagensProduto.findOne({where: {caminho: ImageUrl}});
                                            if (!imagem) {                                       
                                                    imagemProduto = new ImagensProduto();
                                                    imagemProduto.caminho = ImageUrl;
                                                    imagemProduto.produto = prod;
                                                    _repImagensProduto.save(imagemProduto);
                                            }
                                       }
                                       
                                       for (let img in Images) {
                                            let imagem = await _repImagensProduto.findOne({where: { caminho: Images[img].ImageUrl}});
                                            if (!imagem) {
                                                imagemProduto = new ImagensProduto();
                                                imagemProduto.caminho = ImageUrl;
                                                imagemProduto.produto = prod;
                                                _repImagensProduto.save(imagemProduto);
                                            }
                                       }
                                    } else {
                                        if (ImageUrl) {
                                            imagemProduto = new ImagensProduto();
                                            imagemProduto.caminho = ImageUrl;
                                            imagemProduto.produto = prod;
                                            _repImagensProduto.save(imagemProduto);
                                        }
        
                                        for (let img in Images) {
                                            imagemProduto = new ImagensProduto();
                                            imagemProduto.caminho = Images[img].ImageUrl;
                                            imagemProduto.produto = prod;
                                            _repImagensProduto.save(imagemProduto);
                                        }
                                    }
                            }
                        });
                        //Atualiza dados do produto de acordo com o Vtex - Fim
                } catch (err) {
                    console.error("Erro ao buscar imagem e descrição do produto " + err);
                }
            });
            //Percorre o registro de produtos buscando o código e passando como parâmetro para a api - Fim
        } else {

            let maxCodigo = await _repProdutos.createQueryBuilder("produtos")
                                              .select("max(cast(produtos.codigo as unsigned integer))","maxCodigo")
                                              .from(Produtos, "usuarios")
                                              .getRawOne();
            let _cdProd = +maxCodigo["maxCodigo"] + 1;
            let busca = true;
            let i = 0;
            //Consulta para ver se houve novo registro de produto - Inicio           
            //Requisição api para buscar a classificação dos produtos - Inicio
            while (busca) {                
                options = {
                    "method": "POST",
                    "url": _url + "/produto/classificacaoproduto",
                    "headers": {
                        "Authorization": "Bearer " + _token.valor,
                        "Content-Type": "application/json"                 
                    },
                    body: JSON.stringify({"cdProduto": _cdProd})
                }
                try {
                   await customRequest(options, async function(error, response) {
                            if (error) throw new Error(error);

                            if (response.statusCode == 200) {
                                let classificacoes = JSON.parse(response.body);
                                for (let el in classificacoes) {
                                    let {cdProduto, cdBarra, cdTpClassificacao,
                                        cdClassificacao, dsProduto, dsCor, dsTamanho, cdNivel} = classificacoes[el];
                                    
                                    if ((cdTpClassificacao == 4 && cdClassificacao == "003")) {
                                        
                                        let _repProd: Repository<Produtos> = getRepository(Produtos);
                                        let _produto: Produtos;
                                        _produto = new Produtos();
        
                                        
        
                                        _repProd.save(_produto).then(async (prod) => {
        
                                            let obj = {"produtos": [{"cdProduto": cdBarra}], "cdPreco": 2, "inPromocao": 0, "empresas": []}; 
                                            let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
                                            let empresas = await _repEmpresas.find();    
                                            empresas.forEach((empresa) => {
                                                obj.empresas.push({
                                                    "cdEmpresa": empresa.codigo
                                                });
                                            });
                                            options = {
                                                "method": "POST",
                                                "url": _url + "/produto/precoproduto",
                                                "headers": {
                                                    "Authorization": "Bearer " + _token.valor,
                                                    "Content-Type": "application/json"                 
                                                },
                                                body: JSON.stringify(obj)
                                            }
                                            try {
                                               await customRequest(options, async function(error, response) {
                                                        if (error) throw new Error(error);
                        
                                                        if (response.statusCode == 200) {
                        
                                                            let _produtos = JSON.parse(response.body);                                           
                                                            
                                                            for (let ele in _produtos.precos) {
                                                                let {cdReferencia, cdEmpresa, vlPreco} = _produtos.precos[ele];
                                                                let _empresa = await _repEmpresas.findOne({codigo: cdEmpresa});
                                                                let _repProdEmp: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
                                                                let empProd: ProdutosEmpresas;
                        
                                                                empProd = new ProdutosEmpresas();
                
                                                                empProd.valor = vlPreco;
                                                                empProd.empresa = _empresa;
                                                                empProd.produto = prod;
                
                                                                _repProdEmp.save(empProd);
                                                            }
                                                        }
                                                    });
                                            } catch (err) {
                                                console.error("Erro ao atualizar preços dos produtos " + err);
                                            }
    
                                            let _obj = {
                                                "produtos":[
                                                    {
                                                        "cdProduto": cdBarra
                                                    }
                                                ],
                                                "cdSaldo": 1,
                                                "inEstoque": 1,
                                                "inPedidoVenda": 0,
                                                "empresas": []
                                            }
                                            empresas = await _repEmpresas.find();
                                            empresas.forEach((empresa) => {
                                                _obj.empresas.push({
                                                    "cdEmpresa": empresa.codigo
                                                });
                                            });
                                            options = {
                                                "method": "POST",
                                                "url": _url + "/produto/saldoproduto",
                                                "headers": {
                                                    "Authorization": "Bearer " + _token.valor,
                                                    "Content-Type": "application/json"                 
                                                },
                                                body: JSON.stringify(_obj)
                                            }
                                            try {
                                                await customRequest(options, async function(error, response) {
                                                        if (error) throw new Error(error);
                                                        
                                                        if (response.statusCode == 200) {
                                                            let estoques = JSON.parse(response.body);
                                                            for (let el in estoques.saldos) {
                                                                let { cdEmpresa, qtEstoque } = estoques.saldos[el];
                        
                                                                let empresauid = await _repEmpresas.findOne({where: {codigo: cdEmpresa}}); 
                                                            
                                                                if (empresauid) {
                                                                    let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
                                                                    let produtosEmpresas = await _repProdutosEmpresas.findOne({where: {produto: prod, empresa: empresauid, estoque: Not(qtEstoque)}});
                        
                                                                    if (produtosEmpresas) {
                                                                        produtosEmpresas.estoque = qtEstoque;
                                                                        _repProdutosEmpresas.save(produtosEmpresas);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    });
                                            } catch (err) {
                                                console.error("Erro ao registrar estoque do produto " + err);
                                            }
                                            options = {
                                                method: "Get",
                                                url: "https://lojamurau.vtexcommercestable.com.br/api/catalog_system/pvt/sku/stockkeepingunitbyid/" + prod.codigo,
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    accept: "application/json",
                                                    "x-vtex-api-appkey": "vtexappkey-lojamurau-WLQIMF",
                                                    "x-vtex-api-apptoken": "ZVWOWRDCPCPZQNECCDZMFYELGQHFIRXFUNRQIDNWIENXDWGBGGAOQTKARLHFKYUYEKECVNTYPCDBLGHKKFZBQJPADQZXVIMKKPTTREGSMBYNPJPKDXVEYSHUVDZFNWDG"
                                                }
                                            }
                                            try {
                                                await customRequest(options,  async function(error, response, body) {
                                                        if (error) throw new Error(error);
            
                                                        if (response.statusCode == 200) {
            
                                                            let {ProductDescription, ImageUrl, Images} = JSON.parse(body);
                                                            let _prod = await _repProdutos.findOne({where: { codigo: prod.codigo}});
                                                            if (ProductDescription) {
                                                                _prod.descricao = ProductDescription;
                                                                _repProdutos.save(_prod);
                                                            }
                                                            
                                                                let _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
                                                                let imagemProduto: ImagensProduto;
                                                            if (ImageUrl) {
                                                                imagemProduto = new ImagensProduto();
                                                                imagemProduto.caminho = ImageUrl;
                                                                imagemProduto.produto = prod;
                                                                _repImagensProduto.save(imagemProduto);
                                                            }
                                                                
            
                                                                for (let img in Images) {
                                                                    imagemProduto = new ImagensProduto();
                                                                    imagemProduto.caminho = Images[img].ImageUrl;
                                                                    imagemProduto.produto = prod;
                                                                    _repImagensProduto.save(imagemProduto);
                                                                }
                                                        }
                                                    });
                                            } catch (err) {
                                                console.error("Erro ao gravar imagens do produto " + err);
                                            }
                                            console.log("Novo Produto Registrado!");
                                        });
                                        
                                    }
                                }
                            } else {
                                busca = false;
                            }
                        });
                } catch (err) {
                    console.error("Erro ao obter a classificação do produto " + err);
                }                
                _cdProd = +_cdProd + 1;
                i++;
                busca = i < 100;
            }
            //Requisição api para buscar a classificação dos produtos - Fim
            //Consulta para ver se houve novo registro de produto - Fim
            _skip = await _repParametros.findOne({nome_parametro: "skip_prod_api_totvs"});
            _skip.valor = "0";
            _repParametros.save(_skip);
        }
        console.log("Executando job ...");
    });
}