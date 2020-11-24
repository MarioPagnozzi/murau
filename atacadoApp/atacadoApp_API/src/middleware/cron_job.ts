import { Repository, getRepository, Not, OneToMany, In } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { Configuracoes } from '../entity/Configuracoes';
import { Produtos } from '../entity/Produtos';
import { Empresas } from '../entity/Empresas';
import { ProdutosEmpresas } from '../entity/ProdutosEmpresas';
import { ImagensProduto } from '../entity/imagesProduto';

//var https = require("https");
require('events').EventEmitter.defaultMaxListeners = Infinity;
var cron = require("node-schedule");

var https = require("follow-redirects").https;
https.globalAgent.maxSockets = Infinity;
const agent = new https.Agent({keepAlive: true, maxSockets: Infinity});
var fs = require("fs");

export default async (req: Request, res: Response, next: NextFunction) => {

   var job_atualiza = await cron.scheduleJob('*/30 * * * *',async function() {

        let token = await geraToken();
        atualizaProduto(token);
    });
    var rule = new cron.RecurrenceRule();
    rule.hour = 23;
    rule.minute = 59;
    rule.dayOfWeek = new cron.Range(1,5);

    var job_insere = await cron.sheduleJob(rule, async function () {
        let token = await geraToken();
        insereNovoProduto(token);
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function apiRequest(options, write = null, ms = 3000) {
   return new Promise<string>((resolve) => {
     let repeat = setInterval(() => {
        const request = https.request(options, (res) => {
            let chuncks = [];
            if (res.statusCode == 200) {
                res.on("data", (chunk) => {
                    chuncks.push(chunk);
                });
                res.on("end",() => {
                    let body = Buffer.concat(chuncks);
                    resolve( body.toString());
                    clearInterval(repeat);
                });
            }
            res.on("error", async (error) => {
                if (request.reusedSockets && error.code === "ECONNRESET") {
                    let retorno = apiRequest(options, write, ms);
                    let body = await retorno;
                    resolve(body);
                }
                else {
                    res.abort();
                }
            });
            res.on("timeout", () => {
                res.emit("close");
            })
        });
        request.on("socket", (socket) => {
            socket.setTimeout(ms, ()  => {
                request.abort();
            });
            socket.on("error", async (error) => {
                if (request.reusedSocket && error.code == "ECONNRESET") {
                    let retorno = apiRequest(options, write, ms);
                    let body = await retorno;
                    resolve(body);
                }
            })
        });
        request.on("error", async (error) => {
            if (request.reusedSocket && error.code == "ECONNRESET") {
                let retorno = apiRequest(options, write, ms);
                let body = await retorno;
                resolve(body);
            }
        });
        if (write != null) request.write(JSON.stringify(write));
        request.reusedSockets = true;
        request.setTimeout(ms);
        request.end();
     }, 65000);
   });
}
async function geraToken() {

    let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
    let _hostname_totvs = await _repParametros.findOne({nome_parametro: "host_api_totvs"});
    let _porta_totvs = await _repParametros.findOne({nome_parametro: "porta_api_totvs"});
    let _token = await _repParametros.findOne({nome_parametro: "dtExpiracao"});
    let _url;
    let dtExpiracao = _token ? _token.valor : false;
    let dataAtual: Date = new Date();

    let dia = dtExpiracao ? +dtExpiracao.substring(0,2) : dataAtual.getDate();
    let mes = dtExpiracao ? +dtExpiracao.substring(3,5) - 1 : dataAtual.getMonth();
    let ano = dtExpiracao ? +dtExpiracao.substring(6,10) : dataAtual.getFullYear();
    let hora = dtExpiracao ? +dtExpiracao.substring(11,13) : dataAtual.getHours();
    let min = dtExpiracao ? +dtExpiracao.substring(14,16) : dataAtual.getMinutes();
    let seg = dtExpiracao ? +dtExpiracao.substring(17,19) : dataAtual.getSeconds();
    let options: any;
    let dataExpiracaoToken: Date = new Date(Date.UTC(ano, mes, dia, hora, min, seg));
    
    
    //Gera chave de autorização para api Totvs caso a atual não esteja válida ou não exista. - Inicio
    if (!dtExpiracao || dataAtual >= dataExpiracaoToken) {

        let _autorizacao_totvs = await _repParametros.findOne({nome_parametro: "autorizacao_api_totvs_token"});
        let _usuario_totvs = await _repParametros.findOne({nome_parametro: "usuario_api_totvs_token"});
        let _senha_totvs = await _repParametros.findOne({nome_parametro: "senha_api_totvs_token"});
        _url = _autorizacao_totvs.valor;

        options = {
            "method": "POST",
            "hostname": _hostname_totvs.valor,
            "port": _porta_totvs.valor,
            "path": _autorizacao_totvs.valor,
            "headers": {
                "usuario": _usuario_totvs.valor,
                "senha": _senha_totvs.valor
            },
            "maxRedirects": 100,
            "agent": agent,
            "pool": {
                "maxSockets": 100
            }
        }
        let requestToken = apiRequest(options);
        let body = await requestToken;
        if (body) {
            let {cdToken, dtExpiracao} = JSON.parse(body);
            let config = await _repParametros.findOne({where: [
                {nome_parametro: "cdToken"},
                {nome_parametro: "dtExpiracao"}
            ]});

            if (config) {

                config = await _repParametros.findOne({where: {nome_parametro: "cdToken"}});
                config.valor = cdToken;
                _repParametros.save(config).then(async () => {

                        config = await _repParametros.findOne({where: {nome_parametro: "dtExpiracao"}});
                        config.valor = dtExpiracao;
                        _repParametros.save(config).then(async () => {

                                console.log("Token Criado!");

                        }).catch(async (error) => {
                                console.error(error);
                        });

                }).catch(async (error) => {
                        console.error(error);
                });
            } else {                            
                config = new Configuracoes();
                config.nome_parametro = "cdToken";
                config.valor = cdToken;
                _repParametros.save(config).then(async () => {

                        config = new Configuracoes();
                        config.nome_parametro = "dtExpiracao";
                        config.valor = dtExpiracao;
                        _repParametros.save(config).then(async () => {

                                console.log("Token Criado!");

                        }).catch(async (error) => {
                                console.error(error);
                        });

                }).catch(async (error) => {
                        console.error(error);
                });
            }
            return cdToken;
        }
        else {
            return;
        }
    } else {
        let token = await _repParametros.findOne({where: {nome_parametro: "cdToken"}});
        return token.valor;
    }
}

async function atualizaProduto(_token) {
    
    let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
    const _take = 5000;
    let _repProdutos: Repository<Produtos> = getRepository(Produtos);
    let _prod: Produtos[];


    let _skip = await _repParametros.findOne({where: {nome_parametro: "skip_prod_api_totvs"}});

    _prod = await _repProdutos.find({
        where: {
            ativo: true,
            excluido: false
        },
        order: {
            codigo: "ASC" ,
            nome: "ASC"
        },
        skip: !_skip ? 0 : +_skip.valor,
        take: _take
    });

    if (!_skip) {
        let _parametros: Configuracoes = new Configuracoes();
        _parametros.nome_parametro = "skip_prod_api_totvs";
        _parametros.valor = _take.toString();       
        _repParametros.save(_parametros);
    } else {
        _skip.valor = (String)(_take + +_skip.valor);
        _repParametros.save(_skip).then(() => {
            console.log("Parametro atualizado 'skip_prod_api_totvs'");
        }).catch((error) => {
            console.error(error);
        });
    }

    if (_prod.length > 0) {

        _prod.forEach(async (prod) => {
            await sleep(3000);
            atualizaPrecoProduto(prod.codigo,_token);
            await sleep(3000);
            atualizaEstoqueProduto(prod.codigo, _token);
            await sleep(3000);
            atualizaImagemProduto(prod.codigo);
        });
        
    } else {
        _skip = await _repParametros.findOne({where: {nome_parametro: "skip_prod_api_totvs"}});
        _skip.valor = "0";
        _repParametros.save(_skip).then(() => {
            console.log("Parametro atualizado 'skip_prod_api_totvs'");
        }).catch((error) => {
            console.error(error);
        });
    }
}

async function insereNovoProduto(_token) {

    let _repProdutos: Repository<Produtos> = getRepository(Produtos);
    let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);

    let _hostname_totvs = await _repParametros.findOne({nome_parametro: "host_api_totvs"});
    let _porta_totvs = await _repParametros.findOne({nome_parametro: "porta_api_totvs"});
    let _restapi_totvs = await _repParametros.findOne({nome_parametro: "rest_api_totvs"});
    let _url = _restapi_totvs.valor + "/produto/classificacaoproduto";

    let maxCodigo = await _repProdutos.createQueryBuilder("produtos")
                                        .select("max(cast(produtos.codigo as unsigned integer))","maxCodigo")
                                        .from(Produtos, "usuarios")
                                        .getRawOne();

    let _cdProd = +maxCodigo["maxCodigo"] + 1;    
    let i = 0;
    let produoExiste: boolean = false 
    let codigos = [];

    codigos.push(_cdProd.toString());

    for (i = 0; i <= 1000; i++) {
        _cdProd = +_cdProd + 1;
        codigos.push(_cdProd.toString());
    }

    codigos.forEach(async (cdProd) => {

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
            "cdProduto": cdProd
        }
        _cdProd = +cdProd;
        let requestProduto = apiRequest(options, obj, 6000);
        let body = await requestProduto;

        if (body) {
            let classificacoes = JSON.parse(body);

            produoExiste = false;
    
            for (let el in classificacoes) {
    
                let {cdTpClassificacao, cdClassificacao, cdBarra, cdProduto, dsProduto, dsCor, dsTamanho, cdNivel} = classificacoes[el];
    
                if (cdTpClassificacao == 4 && cdClassificacao == "003") {
                    produoExiste = true;
    
                    let _produto: Produtos = new Produtos(); 
                    _produto.codigo = cdProduto;
                    _produto.cor = dsCor;
                    _produto.tamanho = dsTamanho;
        
                    _produto.nome = dsProduto;
                    
                    _produto.descricao = dsProduto;
        
                    _produto.estoque = 0;
                    _produto.preco = 0;
                    _produto.referencia = cdNivel;
                
                    _repProdutos.save(_produto).then(async (prod) => {
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
                    await sleep(3000);
                    atualizaPrecoProduto(cdBarra,_token);
                    await sleep(3000);
                    atualizaEstoqueProduto(cdBarra, _token);
                    await sleep(3000);
                    atualizaImagemProduto(cdProduto);
                }
            }
        }
    });

    if (!produoExiste) {
        
        codigos = [];
        let ultimoNumero = await _repParametros.findOne({where: {nome_parametro: "cod_prod_busca"}});
        if (ultimoNumero.valor !== "0") {
            codigos.push(ultimoNumero.valor);
        }
        for (i = 0; i <= 1000; i++) {
            _cdProd = +_cdProd + 1;
            codigos.push(_cdProd.toString());
        }
        codigos.forEach(async (cdProd) => {

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
                "cdProduto": cdProd
            }
            _cdProd = +cdProd;
            let requestProduto = apiRequest(options, obj, 6000);
            let body = await requestProduto;

            if (body) {
                let classificacoes = JSON.parse(body);
    
                produoExiste = false;
        
                for (let el in classificacoes) {
        
                    let {cdTpClassificacao, cdClassificacao, cdBarra, cdProduto, dsProduto, dsCor, dsTamanho, cdNivel} = classificacoes[el];
        
                    if (cdTpClassificacao == 4 && cdClassificacao == "003") {
                        produoExiste = true;
        
                        let _produto: Produtos = new Produtos(); 
                        _produto.codigo = cdProduto;
                        _produto.cor = dsCor;
                        _produto.tamanho = dsTamanho;
            
                        _produto.nome = dsProduto;
                        
                        _produto.descricao = dsProduto;
            
                        _produto.estoque = 0;
                        _produto.preco = 0;
                        _produto.referencia = cdNivel;
                    
                        _repProdutos.save(_produto).then(async (prod) => {
                            let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
                            let empresas = await _repEmpresas.find({where: {excluido: false, ativo: true}});
                            empresas.forEach(async (empresa) => {
                                let produtoEmpresa: ProdutosEmpresas = new ProdutosEmpresas();
                                produtoEmpresa.produto = prod;
                                produtoEmpresa.empresa = empresa;
                                let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
                                _repProdutosEmpresas.save(produtoEmpresa).then(() => {
                                    console.log("Produto cadastrado na empresa " + empresa.nome_fantasia)
                                }).catch((error) => {
                                    console.error("Erro ao cadastrar produto na empresa " + empresa.nome_fantasia);
                                });
                            });
                            console.log("Novo produto inserido " + cdProduto);
                        }).catch(async (error) => {
                            console.error("Erro ao inserir novo produto " + error);
                        });
                        await sleep(3000);
                        atualizaPrecoProduto(cdBarra,_token);
                        await sleep(3000);
                        atualizaEstoqueProduto(cdBarra, _token);
                        await sleep(3000);
                        atualizaImagemProduto(cdProduto);
                    }
                }
            }
        });
        if (!produoExiste) {
            ultimoNumero = await _repParametros.findOne({where: {nome_parametro: "cod_prod_busca"}});
            console.log("Erro aqui: " + _cdProd.toString());
            ultimoNumero.valor = _cdProd.toString();
            _repParametros.save(ultimoNumero).then(() => {
                console.log("Atualializado parametro 'cod_prod_busca");
            }).catch((error) => {
                console.error(error);
            });
        }
    }
}

async function atualizaPrecoProduto(cdBarra, _token) {
    
    let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);

    let _hostname_totvs = await _repParametros.findOne({nome_parametro: "host_api_totvs"});
    let _porta_totvs = await _repParametros.findOne({nome_parametro: "porta_api_totvs"});
        
    let _restapi_totvs = await _repParametros.findOne({nome_parametro: "rest_api_totvs"});
    let _repProdutos: Repository<Produtos> = getRepository(Produtos);

    let _url;
    let options: any;

    let _obj = {
        "produtos": [{"cdProduto": cdBarra}],
        "cdPreco": 2,
        "inPromocao": 0,
        "empresas": []
    }

    let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
    let _empresas = await _repEmpresas.find({where: {ativo: true, excluido: false}});

    _empresas.forEach(async (empresa) => {
        _obj.empresas.push({
            "cdEmpresa": empresa.codigo
        });
    });
    _url = _restapi_totvs.valor + "/produto/precoproduto";
    options = {
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
    let requestProduto = apiRequest(options, _obj, 6000);
    let body = await requestProduto;

    if (body) {
        let precos = JSON.parse(body);
        for (let el in precos.precos) {
            let {cdEmpresa, vlPreco, cdSKU} = precos.precos[el];
            let empresa = await _repEmpresas.findOne({where: { codigo: cdEmpresa, ativo: true, excluido: false}});
            let prod = await _repProdutos.findOne({where: {codigo: cdSKU, ativo: true, excluido: false}});

            let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
            if (vlPreco) {
                let produtoEmpresa = await _repProdutosEmpresas.findOne({where: { produto: prod, empresa: empresa, valor: Not(vlPreco)}});
                if (produtoEmpresa) {
                    produtoEmpresa.valor = vlPreco;
                    _repProdutosEmpresas.save(produtoEmpresa).then(async () => {
                        console.log("Preço do produto atualizado " + prod.codigo + " Para empresa " + empresa.nome_fantasia);
                    }).catch(async (error) => {
                        console.error(error);
                    });
                }
            }
        }
    }
}
async function atualizaEstoqueProduto(cdBarra, _token) {

    let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
    let _hostname_totvs = await _repParametros.findOne({nome_parametro: "host_api_totvs"});
    let _porta_totvs = await _repParametros.findOne({nome_parametro: "porta_api_totvs"});
        
    let _restapi_totvs = await _repParametros.findOne({nome_parametro: "rest_api_totvs"});
    let _repProdutos: Repository<Produtos> = getRepository(Produtos);

    let _url;
    let options: any;

    let _obj = {
        "produtos":[{"cdProduto": cdBarra}],
        "cdSaldo": 1,
        "inEstoque": 1,
        "inPedidoVenda": 0,
        "empresas": []
    }
    let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
    let _empresas = await _repEmpresas.find({where: {ativo: true, excluido: false}});

    
    _empresas.forEach(async (empresa) => {
        _obj.empresas.push({
            "cdEmpresa": empresa.codigo
        });
    });

    _url = _restapi_totvs.valor + "/produto/saldoproduto";
    options = {
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
    let requestProduto = apiRequest(options, _obj, 6000);
    let body = await requestProduto;

    if (body) {
        let estoque = JSON.parse(body);
        for (let el in estoque.saldos) {
            let {cdEmpresa, qtEstoque, cdSKU} = estoque.saldos[el];

            let empresa = await _repEmpresas.findOne({where: {codigo: cdEmpresa, ativo: true, excluido: false}});
            let prod = await _repProdutos.findOne({where: {codigo: cdSKU, ativo: true, excluido: false}});
            let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);

            if (qtEstoque) {
                let produtoEmpresa = await _repProdutosEmpresas.findOne({where: {empresa: empresa, produto: prod, estoque: Not(qtEstoque)}});
                if (produtoEmpresa) {
                    produtoEmpresa.estoque = qtEstoque;
                    _repProdutosEmpresas.save(produtoEmpresa).then(async () => {
                        console.log("Estoque do produto atualizado " + prod.codigo + " Para a empresa " + empresa.nome_fantasia);
                    }).catch(async (error) => {
                        console.error("Erro ao atualizar estoque " + prod.codigo + " " + error);
                    });
                }
            }
        }
    }
}
async function  atualizaImagemProduto(cdProduto) {
    
    let _repProdutos: Repository<Produtos> = getRepository(Produtos);
    let options: any;
    options = {
        "method": "GET",
        "hostname":"lojamurau.vtexcommercestable.com.br",
        "path": "/api/catalog_system/pvt/sku/stockkeepingunitbyid/" + cdProduto,
        "headers": {
            "Content-Type": "application/json",
            "accept": "application/json",
            "x-vtex-api-appkey": "vtexappkey-lojamurau-WLQIMF",
            "x-vtex-api-apptoken": "ZVWOWRDCPCPZQNECCDZMFYELGQHFIRXFUNRQIDNWIENXDWGBGGAOQTKARLHFKYUYEKECVNTYPCDBLGHKKFZBQJPADQZXVIMKKPTTREGSMBYNPJPKDXVEYSHUVDZFNWDG"
        },
        "maxRedirects": 100,
        "agent": agent,
        "pool": {
            "maxSockets": 100
        }
    }

    let requestImage = apiRequest(options);
    let body = await requestImage;

    if (body) {
        let {ProductDescription, ImageUrl, Images} = JSON.parse(body);
        let _produto = await _repProdutos.findOne({where: { codigo: cdProduto}});
        
        if (ProductDescription) {
            if (_produto.descricao != ProductDescription) {
                _produto.descricao = ProductDescription;
                _repProdutos.save(_produto).then(() => {
                    console.log("Descrição do produto " + cdProduto + " atualizadas");
                }).catch(async (error) => {
                    console.error("Erro ao atualizar descrição do produto " + error);
                });;
            }
        }

        let _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
        let imagemProduto: ImagensProduto;

        let imagens = await _repImagensProduto.find({where: {produto: _produto}});

        if (imagens.length > 0) {
            if (ImageUrl) {
                let imagem = await _repImagensProduto.findOne({where: {caminho: ImageUrl}});

                if (!imagem) {
                    imagemProduto = new ImagensProduto();
                    imagemProduto.caminho = ImageUrl;
                    imagemProduto.produto = _produto;
                    _repImagensProduto.save(imagemProduto).then(() => {
                        console.log("Imagens do produto " + _produto.codigo + " atualizadas");
                    }).catch(async (error) => {
                        console.error("Erro ao atualizar imagens do produto " + error);
                    });
                }
            }
            if (Images) {
                for (let img in Images) {
                    let imagem = await _repImagensProduto.findOne({where: {caminho: Images[img].ImageUrl}});

                    if (!imagem) {
                        imagemProduto = new ImagensProduto();
                        imagemProduto.caminho = Images[img].ImageUrl;
                        imagemProduto.produto = _produto;
                        _repImagensProduto.save(imagemProduto).then(() => {
                            console.log("Imagens do produto " + _produto.codigo + " atualizadas");
                        }).catch(async (error) => {
                            console.error("Erro ao atualizar imagens do produto " + error);
                        });
                    }

                }
            }
        } else {
            if (ImageUrl) {
                imagemProduto = new ImagensProduto();
                imagemProduto.caminho = ImageUrl;
                imagemProduto.produto = _produto;
                _repImagensProduto.save(imagemProduto).then(() => {
                    console.log("Imagens do produto " + _produto.codigo + " atualizadas");
                }).catch(async (error) => {
                    console.log("Erro ao atualizar imagens do produto " + error);
                });
            }
            if (Images) {
                for (let img in Images) {
                    imagemProduto = new ImagensProduto();
                    imagemProduto.caminho = Images[img].ImageUrl;
                    imagemProduto.produto = _produto;
                    _repImagensProduto.save(imagemProduto).then(() => {
                        console.log("Imagens do produto " + _produto.codigo + " atualizadas");
                    }).catch(async (error) => {
                        console.log("Erro ao atualizar imagens do produto " + error);
                    });
                }
            }
        }
    }
}