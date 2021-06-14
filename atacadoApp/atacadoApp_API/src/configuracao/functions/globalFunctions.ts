import { Repository, getRepository, Not, OneToMany, In } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { Configuracoes } from '../../entity/Configuracoes';
import { Produtos } from '../../entity/Produtos';
import { ProdutosEmpresas } from '../../entity/ProdutosEmpresas';
import { Empresas } from '../../entity/Empresas';
import { ImagensProduto } from '../../entity/imagesProduto';
import { isArray } from 'util';
import config from "../config";
import { setInterval } from 'timers';
import { appendConstructorOption } from 'jimp/*';

//var https = require("https");
require('events').EventEmitter.defaultMaxListeners = Infinity;
var cron = require("node-schedule");

var https = require("follow-redirects").https;
https.globalAgent.maxSockets = Infinity;
const agent = new https.Agent({keepAlive: true, maxSockets: Infinity, maxListeners: Infinity});
var fs = require("fs");

//export default class functions {
    

    export function sleep(ms) {
        return new Promise(resolve => setInterval(resolve, ms));
    }

    export class apiRequest{
        
        constructor(private options, private write = null, private ms = 3000) {

        }
        
        httpRequest() {
            return new Promise<string>((resolve, reject) => {
                let interval = setInterval(() => {
                    const request = https.request(this.options, (res) => {
                        let chuncks = [];
                        if (res.statusCode == 200 || res.statusCode == 400) {
                            res.on("data", (chunk) => {
                                chuncks.push(chunk);
                            });
                            res.on("end",() => {
                                let body = Buffer.concat(chuncks);
                                clearInterval(interval);
                                resolve(body.toString());
                                
                            });
                        }
                        res.on("error", async (error) => {
                            if (request.reusedSockets && error.code === "ECONNRESET") {
                            
                                let request = new apiRequest(this.options, this.write, this.ms);
                                let body;
                                await request.httpRequest().then((response) => {
                                    body = response
                                }).catch((error) => {throw new Error(`Erro ao acessar host: ${error}`)});
                                clearInterval(interval);
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
                        socket.setTimeout(this.ms, ()  => {
                            request.abort();
                            var connReset = new Error('Timout');
                              connReset.stack = 'ECONNRESET';
                              socket.emit('clientError', connReset, socket);
                            
                        });
                        socket.on("error", async (error) => {
                            if (request.reusedSocket && error.code == "ECONNRESET") {
                                
                                let request = new apiRequest(this.options, this.write, this.ms);
                                let body;
                                await request.httpRequest().then((response) => {
                                    body = response
                                }).catch((error) => {throw new Error(`Erro ao acessar servidor: ${error}`)});
                                //clearInterval(interval);
                                resolve(body);
                                
                            }
                            else {
                                reject(new Error(`Erro ao acessar host: ${error}`))
                            }
                        });
                        socket.on('close', function() {
                            // Emit ECONNRESET
                            if (!socket._controlReleased) {
                              var connReset = new Error('socket hang up');
                              connReset.stack = 'ECONNRESET';
                              socket.emit('clientError', connReset, socket);
                            }
                        });
                    });
                    request.on("error", async (error) => {
                        if (request.reusedSocket && error.code == "ECONNRESET") {
                            let request = new apiRequest(this.options, this.write, this.ms);
                            let body;
                            await request.httpRequest().then((response) => {
                                body = response
                            }).catch((error) => {throw new Error(`Erro ao acessar host: ${error}`)});
                            //clearInterval(interval);
                            resolve(body);
                        } else {
                            //clearInterval(interval);
                            reject(new Error(`Erro ao acessar host: ${error}`))
                        }
                    });
                    if (this.write != null) request.write(JSON.stringify(this.write));
                    request.reusedSockets = true;
                    request.setTimeout(this.ms);
                    request.end();
                }, this.ms);
                
            });
        }
        
    }
    export function getParametros() {
        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
        const parametros = async () => {
            let parametros = await _repParametros.find();
            const [params] = await Promise.all([parametros])
            parametros = undefined;
            return params;
        }
        return parametros();
    }
    export function setParametros(value) {
        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
        _repParametros.save(value);
        _repParametros = undefined;
    }
    export class geraToken {

            constructor(){}

            async token() {
                let parametros = await getParametros()
            
                let _hostname_totvs = parametros.filter(val => val.nome_parametro == "host_api_totvs")[0];
                let _porta_totvs = parametros.filter(val => val.nome_parametro == "porta_api_totvs")[0];
                let _dttoken = parametros.filter(val => val.nome_parametro == "dtExpiracao")[0];
                let _url;
                let dtExpiracao = _dttoken ? _dttoken.valor : undefined;
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
            
                    let _autorizacao_totvs = parametros.filter(val => val.nome_parametro == "autorizacao_api_totvs_token")[0];
                    let _usuario_totvs = parametros.filter(val => val.nome_parametro == "usuario_api_totvs_token")[0];
                    let _senha_totvs = parametros.filter(val => val.nome_parametro == "senha_api_totvs_token")[0];
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
                    const api = async () => {
                        let request = new apiRequest(options);
                        let req = await request.httpRequest();
                        const [body] = await Promise.all([req]);
                        request = undefined;
                        req = undefined;
                        return body;
                    }
                    
                    let body = await api();
                
                    if (body) {
                        let {cdToken, dtExpiracao} = JSON.parse(body);
                        let config = parametros.filter(val => val.nome_parametro == "cdToken" || val.nome_parametro == "dtExpiracao")[0];
            
                        if (config) {
            
                            config = parametros.filter(val => val.nome_parametro == "cdToken")[0];
                            if (config) {
                                config.valor = cdToken;
                            }
                            else {
                                config = new Configuracoes();
                                config.nome_parametro = "cdToken";
                                config.valor = cdToken;
                            }
                            
                            setParametros(config);
                            config = undefined
                            config = parametros.filter(val => val.nome_parametro == "dtExpiracao")[0];
                            if (config) {
                                config.valor = dtExpiracao;
                            } else {
                                config = new Configuracoes();
                                config.nome_parametro = "dtExpiracao";
                                config.valor = dtExpiracao;
                            }
                            setParametros(config);
                            config = undefined;
                            console.log("Token Criado!")
                        } else {
                            config = new Configuracoes();
                            config.nome_parametro = "cdToken";
                            config.valor = cdToken;
                            setParametros(config);
                            config = undefined;

                            config = new Configuracoes();
                            config.nome_parametro = "dtExpiracao";
                            config.valor = dtExpiracao;
                            setParametros(config);
                            config = undefined;
                            console.log("Token Criado!")
                        }
                        
                        return cdToken;
                    }
                    _autorizacao_totvs = undefined
                    _usuario_totvs = undefined
                    _senha_totvs = undefined
                    body = undefined;
                }
                const token = parametros.filter(val => val.nome_parametro == "cdToken")[0];

                parametros = undefined
            
                _hostname_totvs = undefined
                _porta_totvs = undefined
                _dttoken = undefined
                _url = undefined
                dtExpiracao = undefined
                dataAtual = undefined
            
                dia = undefined
                mes = undefined
                ano = undefined
                hora = undefined
                min = undefined
                seg = undefined
                options = undefined
                dataExpiracaoToken = undefined
                
                return token.valor;
            }
     
    }
    export function getProdutos(obj?) {
        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
        let _produtos;
        try {
            const produtos = async () => {
                let produtos = await _repProdutos.find(obj);
                const [prods] = await Promise.all([produtos]);
                produtos = undefined;
                return prods
            }
            _produtos = produtos();
        }catch (error) {
            throw new Error(`Erro ao buscar produtos: ${error}`);
        } finally {
            return _produtos;
        }
    }

    export function getEmpresas() {
        let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
        const empresas = async () => {
            let empresas =  await _repEmpresas.find();
            const [emps] = await Promise.all([empresas])
            empresas = undefined;
            return emps;
        }
        return empresas();
        
    }
    
    export function setProdutos(values,mensagem) {
        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
        _repProdutos.save(values).then((prod) => {
            console.log(`Produto ${prod.codigo} ${mensagem}`)
        })
    }
    export class insereNovoProduto {

        constructor(private cd_Prod, private cdToken) {

        }
            
        async insetNew() {
                let parametros = await getParametros()
                let empresas = await getEmpresas();
                
                let _hostname_totvs = parametros.filter(val => val.nome_parametro == "host_api_totvs")[0];
                let _porta_totvs = parametros.filter(val => val.nome_parametro == "porta_api_totvs")[0];
                let _restapi_totvs = parametros.filter(val => val.nome_parametro == "rest_api_totvs")[0];
                let _url = _restapi_totvs.valor + "/produto/classificacaoproduto";
        
        
                let options = {
                    "method": "POST",
                    "hostname": _hostname_totvs.valor,
                    "path": _url,
                    "port": _porta_totvs.valor,
                    "headers": {
                        "Authorization": "Bearer " + this.cdToken,
                        "Content-Type": "application/json"
                    },
                    "maxRedirects": 1000,
                    "agent": agent,
                    "pool": {
                        "maxSockets": 1000,
                    },
                    "maxContentLength": Infinity,
                    "maxBodyLength": Infinity,
                    "maxBodyBufferSize": Infinity
                }
        
                let obj = {
                    "cdProduto": this.cd_Prod
                }
                let request = new apiRequest(options, obj);
                let body = await request.httpRequest();
               
                if (body) {
                    let classificacoes = JSON.parse(body);
                    for (let el in classificacoes) {
                        let {cdTpClassificacao, cdClassificacao, dsGrupo, cdBarra, cdProduto, dsProduto, dsCor, dsTamanho, cdNivel, dsErro} = classificacoes[el];

                        if (dsErro) {
                            return false;
                        }
                        if (cdTpClassificacao === 4 && cdClassificacao === "003") {
                            
                            let _produto: Produtos = new Produtos(); 
                            _produto.codigo = cdProduto;
                            _produto.cor = dsCor;
                            _produto.tamanho = dsTamanho;
                
                            _produto.nome = dsGrupo;
                            
                            _produto.descricao = dsProduto;
                
                            _produto.estoque = 0;
                            _produto.preco = 0;
                            _produto.referencia = cdNivel;
                            _produto.empresas = empresas;
                        
                            setProdutos(_produto,"Inserido com sucesso! [novo]");
                            _produto = undefined;
                            return true;
                        }
                    }
                    classificacoes = undefined
                }
                parametros = undefined
                empresas = undefined
                
                _hostname_totvs = undefined
                _porta_totvs = undefined
                _restapi_totvs = undefined
                _url = undefined
                
                options = undefined;
                obj = undefined;

                return false;
        }       
      
    }
    export function getProdutoEmpresa(_where) {
  
        let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
        const produtoEmpresa = async () => {
            let produtoEmpresa = await _repProdutosEmpresas.findOne(_where);
            const [prodEmp] = await Promise.all([produtoEmpresa]);
            produtoEmpresa = undefined;
            return prodEmp;
        }
        return produtoEmpresa();
       
    }
    
    export function getEmpresa(_where) {
        let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
        const empresa = async () => {
            let empresa = await _repEmpresas.findOne(_where);
            const [emp] = await Promise.all([empresa]);
            empresa = undefined
            return emp;
        }
        return empresa();
    }

    export function setProdutoEmpresa(value, mensagem) {
        let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
        _repProdutosEmpresas.save(value).then((prodEmp) => {
            console.log(mensagem);
        })
    }
    export class atualizaProduto {

        constructor(private cd_Barra, private token) {

        }
        
        async preco() {
            const params = async () => {
                let parametros = await getParametros();
                let _empresas = await getEmpresas();
                const [parms, emps] = await Promise.all([parametros, _empresas]);
                parametros = undefined
                _empresas = undefined
                return {parms, emps};
            }
            let paramEmps;
            await params().then(async (params) => {
                paramEmps = params;
            }).catch((error) => {throw new Error(`Erro ao buscar parametros/empresas : ${error}`)});
            let parametros = paramEmps.parms;
            let _empresas = paramEmps.emps;

            let _hostname_totvs = parametros.filter(val => val.nome_parametro == "host_api_totvs")[0];
            let _porta_totvs = parametros.filter(val => val.nome_parametro == "porta_api_totvs")[0];
            let _restapi_totvs = parametros.filter(val => val.nome_parametro == "rest_api_totvs")[0];
            
            let _url;
            let options: any;
        
            let _obj = {
                "produtos": [],
                "cdPreco": 2,
                "inPromocao": 0,
                "empresas": []
            }

            _empresas.forEach(async (empresa) => {
                _obj.empresas.push({
                    "cdEmpresa": empresa.codigo
                });
            });
            if (isArray(this.cd_Barra)) {
                for (let codigo of this.cd_Barra) {
                    _obj.produtos.push({
                        "cdProduto": codigo
                    })
                }
            } else {
                _obj.produtos.push({
                    "cdProduto": this.cd_Barra
                })
            }
            
            _url = _restapi_totvs.valor + "/produto/precoproduto";
            options = {
                "method": "POST",
                "hostname": _hostname_totvs.valor,
                "path": _url,
                "port": _porta_totvs.valor,
                "headers": {
                    "Authorization": "Bearer " + this.token,
                    "Content-Type": "application/json"
                },
                "maxRedirects": 100,
                "agent": agent,
                "pool": {
                    "maxSockets": 100
                },
                "maxContentLength": Infinity,
                "maxBodyLength": Infinity,
                "maxBodyBufferSize": Infinity
            }
                
            let api = new apiRequest(options, _obj, 6000);
            let body;
            await api.httpRequest().then((response) => {
                    body = response;
                }).catch((error) => {throw new Error(`Erro ao acessar API: ${error}`)});
               
                if (body) {
                    let { precos } = JSON.parse(body);
                    if (precos.length > 0) {
                        for (let preco of precos) {
                            let {cdEmpresa, vlPreco, cdSKU} = JSON.parse(JSON.stringify(preco));
                           
                            const getDados = async () => {
                                let produtos;
                                await getProdutos().then((prod) => {
                                    produtos = prod;
                                }).catch((err) => {throw new Error(`Erro ao buscar os produtos: ${err}`)});
                                let objWhere = {where: { produto: [{codigo: cdSKU}], empresa: [{codigo: cdEmpresa}], valor: Not(vlPreco)}};

                                let produtoEmpresa;
                                await getProdutoEmpresa(objWhere).then((prodEmp) => {
                                    produtoEmpresa = prodEmp;
                                }).catch((err) => {throw new Error(`Erro ao buscar tabela de preços/empresas: ${err}`)})

                                let objWhereEmp = {where: {codigo:  cdEmpresa}};
                                let empresa;
                                await getEmpresa(objWhereEmp).then((emp) => {
                                    empresa = emp;
                                }).catch((err) => {throw new Error(`Erro ao buscar empresa [Produto]: ${err}`)})

                                const [produ, prodEmp, emp] = await Promise.all([produtos, produtoEmpresa, empresa]);
                                objWhere = undefined
                                objWhereEmp = undefined
                                produtos = undefined
                                produtoEmpresa = undefined
                                empresa = undefined
                                return {
                                    produ,
                                    prodEmp,
                                    emp
                                }
                            }

                            let dados = await getDados();
                            let produtos = dados.produ;
                            let prod = produtos.filter(val => val.codigo == cdSKU)[0];

                            if (vlPreco) {

                                let produtoEmpresa = dados.prodEmp;
                                let empresa = dados.emp;
                                
                                if (produtoEmpresa) {
                                    try {
                                        produtoEmpresa.valor = vlPreco;
                                        setProdutoEmpresa(produtoEmpresa, `Preço do produto ${prod.codigo} atualizado para a empresa ${empresa.nome_fantasia}`);
                                        produtoEmpresa = undefined;
                                    } catch (err) {throw new Error(`Erro ao gravar o Preço do Produto ${prod.codigo} para a empresa ${empresa.nome_fantasia}: ${err}`);}
                                } else {
                                    if (prod && empresa)  {
                                        try {
                                            let entityProdutoEmpresa: ProdutosEmpresas = new ProdutosEmpresas();
                                            entityProdutoEmpresa.empresa = Promise.resolve(empresa);
                                            entityProdutoEmpresa.produto = Promise.resolve(prod);
                                            entityProdutoEmpresa.valor = vlPreco;
                                            setProdutoEmpresa(entityProdutoEmpresa,`Preço do produto ${prod.codigo} atualizado para a empresa ${empresa.nome_fantasia}`);
                                            entityProdutoEmpresa = undefined
                                        } catch (err){
                                            throw new Error(`Erro ao gravar o Preço do Produto ${prod.codigo} para a empresa ${empresa.nome_fantasia}: ${err}`);
                                        }
                                    }
                                    
                                
                                }
                                empresa = undefined;
                                produtoEmpresa = undefined;
                            }
                            dados = undefined;
                            produtos = undefined;
                            prod = undefined;
                        }
                       
                    }
                }
                parametros = undefined
                _empresas = undefined 

                _hostname_totvs = undefined
                _porta_totvs = undefined
                _restapi_totvs = undefined
                
                _url = undefined
                options: undefined
                api = undefined
                body = undefined
                _obj = undefined
                
        }
        async estoque() {
            const params = async () => {
                let parametros = await getParametros();
                let empresas = await getEmpresas();
                const [parms, emps] = await Promise.all([parametros, empresas]);
                parametros = undefined
                empresas = undefined
                return {parms, emps};
            }
            let paramEmps = await params();
            let parametros = paramEmps.parms;
            let _empresas = paramEmps.emps;
                
                let _hostname_totvs = parametros.filter(val => val.nome_parametro == "host_api_totvs")[0];            
                let _porta_totvs = parametros.filter(val => val.nome_parametro == "porta_api_totvs")[0];
                let _restapi_totvs = parametros.filter(val => val.nome_parametro == "rest_api_totvs")[0];
                
            
                let _url;
                let options: any;
            
                let _obj = {
                    "produtos":[],
                    "cdSaldo": 1,
                    "inEstoque": 1,
                    "inPedidoVenda": 0,
                    "empresas": []
                }           
                _empresas.forEach(async (empresa) => {
                    _obj.empresas.push({
                        "cdEmpresa": empresa.codigo
                    });
                });
                if (isArray(this.cd_Barra)) {
                    for (let codigo of this.cd_Barra) {
                        _obj.produtos.push({
                            "cdProduto": codigo
                        })
                    }
                } else {
                    _obj.produtos.push({
                        "cdProduto": this.cd_Barra
                    })
                }
    
                _url = _restapi_totvs.valor + "/produto/saldoproduto";
                options = {
                    "method": "POST",
                    "hostname": _hostname_totvs.valor,
                    "path": _url,
                    "port": _porta_totvs.valor,
                    "headers": {
                        "Authorization": "Bearer " + this.token,
                        "Content-Type": "application/json"
                    },
                    "maxRedirects": 100,
                    "agent": agent,
                    "pool": {
                        "maxSockets": 100
                    },
                    "maxContentLength": Infinity,
                    "maxBodyLength": Infinity,
                    "maxBodyBufferSize": Infinity
                }

                let api = new apiRequest(options, _obj);
                let body;
                await api.httpRequest().then((response) => {
                        body = response;
                    }).catch((err) => {throw new Error(`Erro ao acessar API estoque: ${err}`)});
                if (body) {
                
                    let {saldos} = JSON.parse(body);
                    if (saldos.length > 0) {
                        for (let saldo of saldos) {
                            let {cdEmpresa, qtEstoque, cdSKU} = JSON.parse(JSON.stringify(saldo));
                        
                            const getDados = async () => {
                                let produtos = await getProdutos();
                                let objWhere = {where: {produto: [{codigo: cdSKU}], empresa: [{codigo: cdEmpresa}], estoque: Not(qtEstoque)}};
        
                                let produtoEmpresa = await getProdutoEmpresa(objWhere)
        
                                let objWhereEmp = {where: {codigo:  cdEmpresa}};
                                let empresa = await getEmpresa(objWhereEmp)
        
                                const [produ, prodEmp, emp] = await Promise.all([produtos, produtoEmpresa, empresa]);
                                return {
                                    produ,
                                    prodEmp,
                                    emp
                                }
                            }
                            let dados = await getDados();
                            let produtos = dados.produ;
                            let prod = produtos.filter(val => val.codigo == cdSKU)[0];
        
                            if (qtEstoque) {
                                let produtoEmpresa = dados.prodEmp;
                                let empresa = dados.emp;
                                if (produtoEmpresa) {
                                    
                                    try {
                                        produtoEmpresa.estoque = qtEstoque;
                                        setProdutoEmpresa(produtoEmpresa,`Estoque do produtos ${prod.codigo} atualizado para a empresa ${empresa.nome_fantasia}`);
                                        produtoEmpresa = undefined;
                                    } catch (err) {
                                        throw new Error(`Erro ao gravar o Estoque do Produto ${prod.codigo} para a empresa ${empresa.nome_fantasia}: ${err}`);
                                    }
                                
                                } else {
                                    if (prod && empresa) {
                                        try {
                                            let entityProdutoEmpresa: ProdutosEmpresas = new ProdutosEmpresas();
                                            entityProdutoEmpresa.empresa = Promise.resolve(empresa);
                                            entityProdutoEmpresa.produto = Promise.resolve(prod);
                                            entityProdutoEmpresa.estoque = qtEstoque;
                                            setProdutoEmpresa(entityProdutoEmpresa, `Estoque do produtos ${prod.codigo} atualizado para a empresa ${empresa.nome_fantasia}`)
                                            entityProdutoEmpresa = undefined;
                                        } catch (err) {
                                            throw new Error(`Erro ao gravar o Estoque do Produto ${prod.codigo} para a empresa ${empresa.nome_fantasia}: ${err}`);
                                        }
                                        
                                    }
                                }
                                empresa = undefined;
                                produtoEmpresa = undefined;
                            }
                        }
                    }
                    
                }
                parametros = undefined
                _empresas = undefined 

                _hostname_totvs = undefined
                _porta_totvs = undefined
                _restapi_totvs = undefined
                
                _url = undefined
                options: undefined
                api = undefined
                body = undefined
                _obj = undefined
        }
        async imagens() {
            const obj = {
                where: {
                    ativo: true, excluido: false
                }
            }
            let produtos = await getProdutos(obj)
            
            let options: any;
            let strBusca: string = "";
            let cdProdSemEstoque: Array<any> = this.cd_Barra;
            if (isArray(this.cd_Barra)) {
                
                for (let i = 0; i < this.cd_Barra.length; i++) {
                    
                    if (strBusca === "") {
                        strBusca = `fq=skuId:${this.cd_Barra[i]}`;
                    } else {
                        strBusca = strBusca + `&fq=skuId:${this.cd_Barra[i]}`;
                        
                    }
                }
    
                options = {
                    "method": "GET",
                    "hostname":"lojamurau.vtexcommercestable.com.br",
                    "path":encodeURI((config.apiVtexSearch + strBusca).trim()),
                    "headers": {
                        "Content-Type":"application/json",
                        "accept": "application/json",
                        "x-vtex-api-appkey":config.vtexAppKey,
                        "x-vtex-api-apptoken":config.vtexToken
                    },
                    "maxRedirects": 100,
                    "agent": agent,
                    "pool": {
                        "maxSockets": 100
                    }
                }
                let api = new apiRequest(options);
                let body;
                await api.httpRequest().then((response) => {
                        body = response;
                }).catch((err) => {throw new Error(`Erro ao acessar API estoque: ${err}`)});
               
                if (body) {
                    let retornoBody = JSON.parse(body);
                    retornoBody.forEach(async (rbody) => {
                        let {description, items} = rbody;
                        if (items.length > 0 || items) {
                            cdProdSemEstoque = cdProdSemEstoque.filter(item => !items.includes(item));
                            for (let item of items) {
                                let _produto = produtos.filter(val => val.codigo == item.itemId)[0];
                                if (_produto) {
                                    if (description) {
                                        if (_produto.descricao != description) {
                                            _produto.descricao = description;
                                            setProdutos(_produto, 'Teve a descrição atualizada');
                                            
                                        }
                                    }
                                    if (item.images.length > 0 || item.images) {
                                        let imagemProduto: ImagensProduto;
                                        
                                        for (let img of item.images) {
                                            let imagens = await getImagemProduto({where: {produto: [{uid: _produto.uid}]}});
                                
                                            if (imagens.length > 0) {
                                                if (img.imageUrl) {
                                                    let imagem = await getImagemProduto({where: {caminho: img.mageUrl}})
                                                    
                                                    if (!imagem) {
                                                        imagemProduto = new ImagensProduto();
                                                        imagemProduto.caminho = img.imageUrl;
                                                        imagemProduto.produto = Promise.resolve(_produto);
                                                        setImagemProduto(imagemProduto, `Nova imagem inserida para o produto ${_produto.codigo}`)
                                                        imagemProduto = undefined
                                                        
                                                    }
                                                    imagem = undefined
                                                }
                                            } else {
                                                if (img.imageUrl) {
                                                    imagemProduto = new ImagensProduto();
                                                    imagemProduto.caminho = img.imageUrl;
                                                    imagemProduto.produto = Promise.resolve(_produto);
                                                    setImagemProduto(imagemProduto, `Imagens do Produto ${_produto.codigo} foi atualizada`)
                                                    imagemProduto = undefined
                                                    
                                                }
                                            }
                                            imagens = undefined
                                        }
                                        imagemProduto = undefined
                                    }
                                }
                                _produto = undefined
                            }
                        } 
                    });
                    retornoBody = undefined;
                }
                body = undefined
                api = undefined
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
                
                    let api = new apiRequest(options);
                    let body;
                    await api.httpRequest().then((response) => {
                        body = response;
                    }).catch((err) => {throw new Error(`Erro ao acessar API estoque: ${err}`)});
                    
                    if (body) {
                        let {ProductDescription, ImageUrl, Images} = JSON.parse(body);
                        let _produto = produtos.filter(val => val.codigo == prod.codigo)[0];
                        
                        if (_produto) {
                            if (ProductDescription) {
                                if (_produto.descricao != ProductDescription) {
                                    _produto.descricao = ProductDescription;
                                    setProdutos(_produto,'Teve a sua descrição atualizada');                                    
                                    
                                }
                            }
                            let imagemProduto: ImagensProduto;
                    
                            let imagens = await getImagemProduto({where: {produto: [{uid: _produto.uid}]}});;
                    
                            if (imagens.length > 0) {
                                if (ImageUrl) {
                                    let imagem = await getImagemProduto({where: {caminho: ImageUrl}})
                                    
                                    if (!imagem) {
                                        imagemProduto = new ImagensProduto();
                                        imagemProduto.caminho = ImageUrl;
                                        imagemProduto.produto = Promise.resolve(_produto);
                                        setImagemProduto(imagemProduto,`Nova imagem inserida para o produto ${_produto.codigo}`);
                                        imagemProduto = undefined;
                                        
                                    }
                                    imagem = undefined
                                }
                                if (Images) {
                                    for (let img in Images) {
                                        let imagem = await getImagemProduto({where: {caminho: Images[img].ImageUrl}})
                                        
                                        if (!imagem) {
                                            imagemProduto = new ImagensProduto();
                                            imagemProduto.caminho = Images[img].ImageUrl;
                                            imagemProduto.produto = Promise.resolve(_produto);
                                            setImagemProduto(imagemProduto, `Imagens do produto ${_produto.codigo} atualizada`);
                                            imagemProduto = undefined;
                                            
                                        }
                                        imagem = undefined
                                    }
                                   
                                }
                            } else {
                                if (ImageUrl) {
                                    imagemProduto = new ImagensProduto();
                                    imagemProduto.caminho = ImageUrl;
                                    imagemProduto.produto = Promise.resolve(_produto);
                                    setImagemProduto(imagemProduto,`Imagem do produto ${_produto.codigo} foi atualizada`)
                                    imagemProduto = undefined;
                                    
                                }
                                if (Images) {
                                    for (let img in Images) {
                                        imagemProduto = new ImagensProduto();
                                        imagemProduto.caminho = Images[img].ImageUrl;
                                        imagemProduto.produto = Promise.resolve(_produto);
                                        setImagemProduto(imagemProduto,`Nova imagem para o produto ${_produto.codigo} foi inserida`)
                                        imagemProduto = undefined;
                                        
                                    }
                                }
                            }
                            imagemProduto = undefined
                            imagens = undefined
                        }
                        _produto = undefined;                        
                    }
                    api = undefined
                    body = undefined
                }
            }
            produtos = await getProdutos(obj)            
        }
       
    }
    export function getImagemProduto (_where) {
        
        let _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
        const imagens = async () => {
            let imagens = await _repImagensProduto.find(_where);
            const [imgs] = await Promise.all([imagens]);
            return imgs;
        }
        return imagens();
       
    }
    export function setImagemProduto(value, mensagem) {
        let _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
        _repImagensProduto.save(value).then(() => {
            console.log(mensagem);
        })
    }
    export function formData(request: Request) {
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
    export function Email(mensagem) {
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
    export function Permissao(req: Request, tabela, acao) {
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
    export function Tabela(request: Request) {
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
    export function ValidaDat(valor) {
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
    export async function getMaxCodigo() {
        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
        const maxCodigo = async () => {           
         
                let maxCod = await _repProdutos.createQueryBuilder("produtos")
                .select("max(cast(produtos.codigo as unsigned integer))","maxCodigo")
                .getRawOne();
                
                const [max] = await Promise.all([maxCod]);
                return max
         
        }
        return maxCodigo();
    }
   
//}