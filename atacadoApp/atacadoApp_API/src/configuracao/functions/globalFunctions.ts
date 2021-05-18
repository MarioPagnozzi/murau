import { Repository, getRepository, Not, OneToMany, In } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { Configuracoes } from '../../entity/Configuracoes';
import { Produtos } from '../../entity/Produtos';
import { ProdutosEmpresas } from '../../entity/ProdutosEmpresas';
import { Empresas } from '../../entity/Empresas';
import { ImagensProduto } from '../../entity/imagesProduto';
import { isArray } from 'util';
import config from "../config";
import { request } from 'https';

//var https = require("https");
require('events').EventEmitter.defaultMaxListeners = Infinity;
var cron = require("node-schedule");

var https = require("follow-redirects").https;
https.globalAgent.maxSockets = Infinity;
const agent = new https.Agent({keepAlive: true, maxSockets: Infinity});
var fs = require("fs");

export class functions {
    
    constructor() {

    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    apiRequest(options, write = null, ms = 3000) {       
        return new Promise<string>((resolve) => {
            let repeat = setInterval(() => {
                const request = https.request(options, (res) => {
                    let chuncks = [];
                    if (res.statusCode == 200 || res.statusCode == 400) {
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
                            let retorno = this.apiRequest(options, write, ms);
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
                            let retorno =this.apiRequest(options, write, ms);
                            let body = await retorno;
                            resolve(body);
                        }
                    })
                });
                request.on("error", async (error) => {
                    if (request.reusedSocket && error.code == "ECONNRESET") {
                        let retorno = this.apiRequest(options, write, ms);
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
    async geraToken() {
    
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
            let requestToken = this.apiRequest(options);
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
    
    async atualizaProduto(_token) {
        
        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
        const _take = 50;
        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
        let _prod: Produtos[];
    
    
        let _skip = await _repParametros.findOne({where: {nome_parametro: "skip_prod_api_totvs"}});
    
        _prod = await _repProdutos.find({
            where: {
                ativo: true,
                excluido: false
            }
        });

        if (_prod.length > 0) {
            let cdProdutos: Array<any> = [];
            _prod.forEach(async (prod) => {
               cdProdutos.push(prod.codigo);
            });
            let count = 0;
            let _cdProdutos: Array<any> = [];
            for (let i = 0; i < cdProdutos.length; i++) {
                count = i;
                _cdProdutos.push(cdProdutos[i]);
                if (count === 49 || (i === (cdProdutos.length - 1))) {
                   
                    await this.atualizaPrecoProduto(_cdProdutos,_token);
                    await this.atualizaEstoqueProduto(_cdProdutos, _token);
                    await this.atualizaImagemProduto(_cdProdutos);
                    count = 0;
                    _cdProdutos = [];
                } 
            }
        }
    }
    
    async insereNovoProduto(cdProd, _token) {
    
        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
    
        let _hostname_totvs = await _repParametros.findOne({nome_parametro: "host_api_totvs"});
        let _porta_totvs = await _repParametros.findOne({nome_parametro: "porta_api_totvs"});
        let _restapi_totvs = await _repParametros.findOne({nome_parametro: "rest_api_totvs"});
        let _url = _restapi_totvs.valor + "/produto/classificacaoproduto";


        let options = {
            "method": "POST",
            "hostname": _hostname_totvs.valor,
            "path": _url,
            "port": _porta_totvs.valor,
            "headers": {
                "Authorization": "Bearer " + _token,
                "Content-Type": "application/json"
            },
            "maxRedirects": 1000,
            "agent": agent,
            "pool": {
                "maxSockets": 1000
            }
        }

        let obj = {
            "cdProduto": cdProd
        }

        let requestProduto = this.apiRequest(options, obj, 6000);
        let body = await requestProduto;
        if (body) {
            let classificacoes = JSON.parse(body);
            for (let el in classificacoes) {
                let {cdTpClassificacao, cdClassificacao, cdBarra, cdProduto, dsProduto, dsCor, dsTamanho, cdNivel, dsErro} = classificacoes[el];
               
                if (dsErro) {
                    return false;
                }
                if (cdTpClassificacao === 4 && cdClassificacao === "003") {
                       
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
                    return true;
                }
            }
        }
        return false;
    }
    
    async atualizaPrecoProduto(cdBarra, _token) {
        
        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);    
        let _hostname_totvs = await _repParametros.findOne({nome_parametro: "host_api_totvs"});
        let _porta_totvs = await _repParametros.findOne({nome_parametro: "porta_api_totvs"});
            
        let _restapi_totvs = await _repParametros.findOne({nome_parametro: "rest_api_totvs"});
        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
    
        let _url;
        let options: any;
    
        let _obj = {
            "produtos": [],
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
        if (isArray(cdBarra)) {
            for (let i = 0; i < cdBarra.length; i++) {
                _obj.produtos.push({
                    "cdProduto": cdBarra[i]
                })
            }
        } else {
            _obj.produtos.push({
                "cdProduto": cdBarra
            })
        }
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
        let requestProduto = this.apiRequest(options, _obj, 6000);
        let body = await requestProduto;
    
        if (body) {
            let { precos } = JSON.parse(body);
            if (!precos) return;
            precos.forEach(async (preco) => {
                let {cdEmpresa, vlPreco, cdSKU} = preco;
              
                let empresa = await _repEmpresas.findOne({where: { codigo: cdEmpresa, ativo: true, excluido: false}});
                let prod = await _repProdutos.findOne({where: {codigo: cdSKU, ativo: true, excluido: false}});
               
                let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
                if (vlPreco) {                   
                    let produtoEmpresa = await _repProdutosEmpresas.findOne({where: { produto: {uid: prod.uid}, empresa: {uid: empresa.uid}, valor: Not(vlPreco)}});
  
                    if (produtoEmpresa) {
                        produtoEmpresa.valor = vlPreco;
                        _repProdutosEmpresas.save(produtoEmpresa).then(async () => {
                            console.log("Preço do produto atualizado " + prod.codigo + " Para empresa " + empresa.nome_fantasia);
                        }).catch(async (error) => {
                            console.error(error);
                        });
                    }
                }
            })
        }
    }
    async atualizaEstoqueProduto(cdBarra, _token) {
       
        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
        let _hostname_totvs = await _repParametros.findOne({nome_parametro: "host_api_totvs"});
        let _porta_totvs = await _repParametros.findOne({nome_parametro: "porta_api_totvs"});
            
        let _restapi_totvs = await _repParametros.findOne({nome_parametro: "rest_api_totvs"});
        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
      
        let _url;
        let options: any;
    
        let _obj = {
            "produtos":[],
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
        if (isArray(cdBarra)) {
            for (let i = 0; i < cdBarra.length; i++) {
                _obj.produtos.push({
                    "cdProduto": cdBarra[i]
                })
            }
        } else {
            _obj.produtos.push({
                "cdProduto": cdBarra
            })
        }

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
        let requestProduto = this.apiRequest(options, _obj, 6000);
        let body = await requestProduto;
    
        if (body) {
          
            let {saldos} = JSON.parse(body);
            if (!saldos) return;
            saldos.forEach(async (saldo) => {
                let {cdEmpresa, qtEstoque, cdSKU} = saldo;
            
                let empresa = await _repEmpresas.findOne({where: {codigo: cdEmpresa, ativo: true, excluido: false}});            
                let prod = await _repProdutos.findOne({where: {codigo: cdSKU, ativo: true, excluido: false}});               
                let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
    
                if (qtEstoque) {
                  
                    let produtoEmpresa = await _repProdutosEmpresas.findOne({where:{produto: {uid: prod.uid}, empresa: {uid: empresa.uid}, estoque: Not(qtEstoque)}});
                    if (produtoEmpresa) {
                        
                        produtoEmpresa.estoque = qtEstoque;                       
                        _repProdutosEmpresas.save(produtoEmpresa).then(async () => {
                            console.log("Estoque do produto atualizado " + prod.codigo + " Para a empresa " + empresa.nome_fantasia);
                        }).catch(async (error) => {
                            console.error("Erro ao atualizar estoque " + prod.codigo + " " + error);
                        });
                    }
                }
               
            })
        }
    }
    async atualizaImagemProduto(cdProdutos) {
       
        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
        let reqItems: Array<any> = [];
        let options: any;
        let strBusca: string = "";
        let cdProdSemEstoque: Array<any> = cdProdutos;
        if (isArray(cdProdutos)) {
            for (let i = 0; i < cdProdutos.length; i++) {
                if (strBusca === "") {
                    strBusca = "fq=skuId:" + cdProdutos[i];
                } else {
                    strBusca = strBusca + "&fq=skuId:" + cdProdutos[i];
                }
            }

            options = {
                "method": "GET",
                "hostname":"lojamurau.vtexcommercestable.com.br",
                "path": config.apiVtexSearch + strBusca,
                "headers": {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                    "x-vtex-api-appkey": config.vtexAppKey,
                    "x-vtex-api-apptoken": config.vtexToken
                },
                "maxRedirects": 100,
                "agent": agent,
                "pool": {
                    "maxSockets": 100
                }
            }
         
            let requestImage = this.apiRequest(options);
            let body = await requestImage;
        
            if (body) {
                let retornoBody = JSON.parse(body);            
                retornoBody.forEach(async (rbody) => {
                    let {description, items} = rbody;
                    if (items.length > 0 || items) {
                        cdProdSemEstoque = cdProdSemEstoque.filter(item => !items.includes(item));
                        for (let item of items) {
                            let _produto = await _repProdutos.findOne({where: { codigo: item.itemId}});
                            if (_produto) {
                                if (description) {
                                    if (_produto.descricao != description) {
                                        _produto.descricao = description;
                                        _repProdutos.save(_produto).then(() => {
                                            console.log("Descrição do produto " + item.itemId + " atualizadas");
                                        }).catch(async (error) => {
                                            console.error("Erro ao atualizar descrição do produto " + error);
                                        });;
                                    }
                                }
                                if (item.images.length > 0 || item.images) {
                                    let _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
                                    let imagemProduto: ImagensProduto;
                                    
                                    for (let img of item.images) {
                                        let imagens = _produto.imagens;
                            
                                        if (imagens.length > 0) {
                                            if (img.imageUrl) {
                                                let imagem = await _repImagensProduto.findOne({where: {caminho: img.mageUrl}});
                                
                                                if (!imagem) {
                                                    imagemProduto = new ImagensProduto();
                                                    imagemProduto.caminho = img.imageUrl;
                                                    imagemProduto.produto = _produto;
                                                    _repImagensProduto.save(imagemProduto).then(() => {
                                                        console.log("Imagens do produto " + _produto.codigo + " atualizadas");
                                                    }).catch(async (error) => {
                                                        console.error("Erro ao atualizar imagens do produto " + error);
                                                    });
                                                }
                                            }
                                        } else {
                                            if (img.imageUrl) {
                                                imagemProduto = new ImagensProduto();
                                                imagemProduto.caminho = img.imageUrl;
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
                            } /*else {
                                console.log(item.itemId.toArray());
                                let codProd: Array<any> = [];
                                codProd.push(item.itemId)
                                const token = await this.geraToken();
                                let produtoExiste = await this.insereNovoProduto(codProd,token);
                                if (produtoExiste) {
                                    await this.atualizaPrecoProduto(codProd,token);
                                    await this.atualizaPrecoProduto(codProd, token);
                                    await this.atualizaImagemProduto(codProd);
                                }
                            }*/
                        }
                    } 
                })
            }
        }
        if(cdProdSemEstoque.length > 0) {
            for (let prod of cdProdSemEstoque) {
                options = {
                    "method": "GET",
                    "hostname":"lojamurau.vtexcommercestable.com.br",
                    "path": "/api/catalog_system/pvt/sku/stockkeepingunitbyid/" + prod,
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
            
                let requestImage = this.apiRequest(options);
                let body = await requestImage;
            
                if (body) {
                    let {ProductDescription, ImageUrl, Images} = JSON.parse(body);
                    let _produto = await _repProdutos.findOne({where: { codigo: prod.codigo}});
                    
                    if (_produto) {
                        if (ProductDescription) {
                            if (_produto.descricao != ProductDescription) {
                                _produto.descricao = ProductDescription;
                                _repProdutos.save(_produto).then(() => {
                                    console.log("Descrição do produto " + prod.nome + " atualizadas");
                                }).catch(async (error) => {
                                    console.error("Erro ao atualizar descrição do produto " + error);
                                });;
                            }
                        }
                
                        let _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
                        let imagemProduto: ImagensProduto;
                
                        let imagens = _produto.imagens;
                
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
            }
        }
    }
    
    formData(request: Request) {
        return new Promise<Array<string>>((resolve, reject) => {
            const util = require('util');
            const formidable = require("formidable");
            let form = new formidable.IncomingForm();

            form.parse(request, (err, fields, files) => {
                let obj = [];
                obj[0] = fields;
                obj[1] = files
                resolve(obj);
              
            });

            form.on("error", (err) => {
                reject(err.message);
            });
        })
    }
    Email(mensagem) {
       return new Promise( (resolve, reject) => {const nodemailer = require('nodemailer');
           
            let transport = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: "vermell.software@gmail.com",
                    pass: "M@r10@1979"
                }
            });

            transport.sendMail(mensagem, function(err, info) {
                if (err) {
                    transport.close();
                    return reject(err);
                }
                else {
                    transport.close();
                    return resolve(info);
                }
            });
        })
    
    }
    Permissao(req: Request, tabela, acao) {
        let permitido: boolean = false;
        if (!req.grupos || req.grupos.length <= 0) {
            return false;
        }
        req.grupos.forEach((grupo) => {
            let {permissoes} = grupo;
            if (grupo.excluido == false && grupo.ativo == true) {
                for (let p in permissoes) {
                    if (permissoes[p].tabela == tabela) {
                        if (acao == "V") {
                            if (permissoes[p].visualizar)
                            permitido = true;
                        }
                        if (acao == "I") {
                            if (permissoes[p].inserir)
                            permitido = true;
                        }
                        if (acao == "A") {
                            if (permissoes[p].alterar) 
                            permitido = true;
                        }
                        if (acao == "E") {
                            if (permissoes[p].excluir)
                            permitido = true;
                        }
                    }
                }
            }
           
        })
        return permitido;
    }
    Tabela(request: Request) {
        let url = request.url.split("/");
        let rota = url[1];
        if (rota.indexOf("?")) {
            rota = rota.split("?")[0]
        }
      
        switch (rota) {
            case "users": return "Usuarios";
            case "produtos": return "Produtos";
            case "vendedores": return "Vendedores";
            case "empresas": return "Empresas";
            case "clientes": return "Clientes";
            case "pedidos": return "Pedidos";
            case "grupos": return "Grupo";
            case "permissoes": return "Permissoes";
        } 
    }
    ValidaDat(valor) {
        let date = valor;
        let ardt = new Array;
        let ExpReg = new RegExp("(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/[12][0-9]{3}");
        ardt=date.split("/");
        let erro=false;
        if ( date.search(ExpReg)==-1){
            erro = true;
            }
        else if (((ardt[1]==4)||(ardt[1]==6)||(ardt[1]==9)||(ardt[1]==11))&&(ardt[0]>30))
            erro = true;
        else if ( ardt[1]==2) {
            if ((ardt[0]>28)&&((ardt[2]%4)!=0))
                erro = true;
            if ((ardt[0]>29)&&((ardt[2]%4)==0))
                erro = true;
        }
        if (erro) {            
            return erro;
        }
        return erro;
    }
    async insereProduto(token) {
        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
        let ultimoNumero = await _repParametros.findOne({where: {nome_parametro: "cod_prod_busca"}});
        
        if (ultimoNumero.valor === "0") {
            let maxCodigo = await _repProdutos.createQueryBuilder("produtos")
            .select("max(cast(prod.codigo as unsigned integer))","maxCodigo")
            .from(Produtos, "prod")
            .getRawOne();
            ultimoNumero.valor = (+maxCodigo["maxCodigo"]).toString();
        }
        let _cdProd: Array<any> = [];
        let cdProdutos: Array<any> = [];
        let strUltimoN: string = ultimoNumero.valor;  
        let qtd_lote_pesquisa = await _repParametros.findOne({where: {nome_parametro: "qtd_lote_pesquisa"}});
        
        for (let i = 0; i < (qtd_lote_pesquisa.valor !== "" ? +qtd_lote_pesquisa.valor : 1); i++) {

            ultimoNumero.valor = (+ultimoNumero.valor + 1).toString();
            let codigo = ultimoNumero.valor;
            strUltimoN = codigo;
            _cdProd.push((codigo).toString());
        }
      
        ultimoNumero = await _repParametros.findOne({where: {nome_parametro: "cod_prod_busca"}});
        ultimoNumero.valor = strUltimoN.toString();
        _repParametros.save(ultimoNumero).then(() => {
            console.log("Atualializado parametro 'cod_prod_busca");
        }).catch((error) => {
            console.error(error);
        });
        
        for (let i = 0; i < _cdProd.length; i++) {
            let produtoExiste = await this.insereNovoProduto(_cdProd[i], token);
            
            if (produtoExiste) {
                cdProdutos.push(_cdProd[i]);
            }
        }
        let _cdProdutos: Array<any> = [];
        let count = 0;
        for (let i = 0; i < cdProdutos.length; i++) {
             count = i;
             _cdProdutos.push(cdProdutos[i]);
             if (count === 49 || (i === (cdProdutos.length - 1))) {
                
                await this.atualizaPrecoProduto(_cdProdutos, token);
                await this.atualizaEstoqueProduto(_cdProdutos, token);
                await this.atualizaImagemProduto(_cdProdutos);
                count = 0;
                _cdProdutos = [];
               
             }
        }
        
    }
}